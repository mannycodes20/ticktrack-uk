import type { Prisma } from "@prisma/client";
import type { Filters } from "./schemas.js";

// Turn validated query filters into a Prisma "where" clause.
export function buildWhere(f: Filters): Prisma.SightingWhereInput {
  return {
    city: f.city,
    species: f.species,
    source: f.source,
    observedAt: {
      gte: f.from ? new Date(`${f.from}T00:00:00Z`) : undefined,
      lte: f.to ? new Date(`${f.to}T23:59:59Z`) : undefined,
    },
  };
}