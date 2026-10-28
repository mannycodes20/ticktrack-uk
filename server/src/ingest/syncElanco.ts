import { readFile } from "node:fs/promises";
import { z } from "zod";
import { prisma } from "../db.js";
import { findCity } from "../data/cities.js";

const ELANCO_URL =
  process.env.ELANCO_API_URL ?? "https://dev-task.elancoapps.com/data/tick-sightings";
const SEED_FILE = new URL("../../data/elanco-seed.json", import.meta.url);

// The shape we expect for each record from Elanco.
const ElancoRecord = z.object({
  id: z.string().trim().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
  location: z.string().trim().min(1),
  species: z.string().trim().min(1),
  latinName: z.string().trim().optional(),
});

// Call the API with a 10 second timeout, retrying up to 3 times
// with a growing wait (1s, then 2s) between attempts.
async function fetchWithRetry(url: string, attempts = 3): Promise<unknown> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
      if (!res.ok) throw new Error(`Elanco API responded with ${res.status}`);
      return await res.json();
    } catch (err) {
      lastError = err;
      console.warn(`Elanco fetch attempt ${attempt} failed: ${String(err)}`);
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** (attempt - 1)));
      }
    }
  }
  throw lastError;
}

// Check one raw record and turn it into a row for our database.
// Returns a reason instead of a row when the record can't be used.
export function normaliseRecord(raw: unknown) {
  const parsed = ElancoRecord.safeParse(raw);
  if (!parsed.success) return { ok: false as const, reason: "invalid fields" };

  const record = parsed.data;
  const place = findCity(record.location);
  if (!place) return { ok: false as const, reason: `unknown city "${record.location}"` };

  // Elanco's dates have no timezone, so we treat them as UTC on every machine.
  const observedAt = new Date(`${record.date.slice(0, 19)}Z`);
  if (Number.isNaN(observedAt.getTime())) return { ok: false as const, reason: "bad date" };
  if (observedAt > new Date()) return { ok: false as const, reason: "date in the future" };

  return {
    ok: true as const,
    row: {
      externalId: record.id,
      source: "ELANCO",
      species: record.species,
      latinName: record.latinName || null,
      observedAt,
      city: place.city,
      latitude: place.lat,
      longitude: place.lng,
    },
  };
}

// Pull every sighting from Elanco, clean it, and save it.
// If Elanco is down, existing data is kept; on a first run the seed file is used.
export async function syncElanco() {
  const run = await prisma.syncRun.create({ data: {} });
  let note: string | null = null;

  try {
    let raw: unknown;
    try {
      raw = await fetchWithRetry(ELANCO_URL);
    } catch (err) {
      const existing = await prisma.sighting.count({ where: { source: "ELANCO" } });
      if (existing > 0) throw err;
      console.warn("Elanco API unavailable and database empty, loading seed file");
      raw = JSON.parse(await readFile(SEED_FILE, "utf8"));
      note = "Elanco API unavailable, loaded seed file";
    }

    if (!Array.isArray(raw)) throw new Error("Elanco response was not a list");

    // Validate each record and drop duplicates within this batch.
    const rows = new Map<string, NonNullable<ReturnType<typeof normaliseRecord>["row"]>>();
    const rejected: Record<string, number> = {};
    let duplicates = 0;
    for (const item of raw) {
      const result = normaliseRecord(item);
      if (!result.ok) {
        rejected[result.reason] = (rejected[result.reason] ?? 0) + 1;
        continue;
      }
      if (rows.has(result.row.externalId)) duplicates++;
      rows.set(result.row.externalId, result.row);
    }

    // Insert new records and update ones we already have.
    const ids = [...rows.keys()];
    const known = await prisma.sighting.findMany({
      where: { externalId: { in: ids } },
      select: { externalId: true },
    });
    const knownIds = new Set(known.map((s) => s.externalId));
    const toInsert = [...rows.values()].filter((r) => !knownIds.has(r.externalId));
    const toUpdate = [...rows.values()].filter((r) => knownIds.has(r.externalId));

    await prisma.$transaction([
      prisma.sighting.createMany({ data: toInsert }),
      ...toUpdate.map((r) =>
        prisma.sighting.update({ where: { externalId: r.externalId }, data: r }),
      ),
    ]);

    const rejectedCount = Object.values(rejected).reduce((a, b) => a + b, 0);
    await prisma.syncRun.update({
      where: { id: run.id },
      data: {
        finishedAt: new Date(),
        ok: true,
        fetched: raw.length,
        inserted: toInsert.length,
        updated: toUpdate.length,
        rejected: rejectedCount,
        error: note,
      },
    });
    console.log(
      `Elanco sync: fetched ${raw.length}, inserted ${toInsert.length}, ` +
        `updated ${toUpdate.length}, duplicates ${duplicates}, rejected ${rejectedCount}`,
      rejectedCount ? rejected : "",
    );
  } catch (err) {
    await prisma.syncRun.update({
      where: { id: run.id },
      data: { finishedAt: new Date(), ok: false, error: String(err) },
    });
    console.error(`Elanco sync failed, keeping existing data: ${String(err)}`);
  }
}