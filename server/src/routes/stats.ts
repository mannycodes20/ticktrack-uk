import { Router } from "express";
import { prisma } from "../db.js";
import { CITY_COORDS } from "../data/cities.js";
import { FilterQuery, TrendQuery } from "../schemas.js";
import { buildWhere } from "../filters.js";

export const statsRouter = Router();

// Monday of the week a date falls in, as YYYY-MM-DD.
function weekStart(d: Date) {
  const day = (d.getUTCDay() + 6) % 7; // Monday = 0
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - day));
  return monday.toISOString().slice(0, 10);
}

// GET /api/stats/cities  -> sightings per city, with map coordinates
statsRouter.get("/cities", async (req, res) => {
  const where = buildWhere(FilterQuery.parse(req.query));
  const groups = await prisma.sighting.groupBy({
    by: ["city"],
    where,
    _count: { _all: true },
    _max: { observedAt: true },
  });
  const result = groups
    .map((g) => ({
      city: g.city,
      count: g._count._all,
      lastSeen: g._max.observedAt,
      lat: CITY_COORDS[g.city]?.lat,
      lng: CITY_COORDS[g.city]?.lng,
    }))
    .sort((a, b) => b.count - a.count);
  res.json(result);
});

// GET /api/stats/trends?interval=week|month  -> counts per period, oldest first
statsRouter.get("/trends", async (req, res) => {
  const q = TrendQuery.parse(req.query);
  const rows = await prisma.sighting.findMany({
    where: buildWhere(q),
    select: { observedAt: true },
  });
  const counts = new Map<string, number>();
  for (const { observedAt } of rows) {
    const period =
      q.interval === "week" ? weekStart(observedAt) : observedAt.toISOString().slice(0, 7);
    counts.set(period, (counts.get(period) ?? 0) + 1);
  }
  const result = [...counts.entries()]
    .map(([period, count]) => ({ period, count }))
    .sort((a, b) => a.period.localeCompare(b.period));
  res.json({ interval: q.interval, data: result });
});

// GET /api/stats/seasonal  -> counts by calendar month across all years
statsRouter.get("/seasonal", async (req, res) => {
  const rows = await prisma.sighting.findMany({
    where: buildWhere(FilterQuery.parse(req.query)),
    select: { observedAt: true },
  });
  const months = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, count: 0 }));
  for (const { observedAt } of rows) months[observedAt.getUTCMonth()].count++;
  res.json(months);
});

// GET /api/stats/species  -> each species with its Latin name and count
statsRouter.get("/species", async (_req, res) => {
  const groups = await prisma.sighting.groupBy({
    by: ["species", "latinName"],
    _count: { _all: true },
  });
  // User reports may have no Latin name, so merge them into the same species.
  const merged = new Map<string, { species: string; latinName: string | null; count: number }>();
  for (const g of groups) {
    const entry = merged.get(g.species) ?? { species: g.species, latinName: null, count: 0 };
    entry.latinName ??= g.latinName;
    entry.count += g._count._all;
    merged.set(g.species, entry);
  }
  res.json([...merged.values()].sort((a, b) => b.count - a.count));
});