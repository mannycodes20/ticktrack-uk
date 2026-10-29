import { Router } from "express";
import { prisma } from "../db.js";
import { CITY_COORDS } from "../data/cities.js";
import { ListQuery, NewSighting } from "../schemas.js";
import { buildWhere } from "../filters.js";
import { HttpError } from "../middleware/errors.js";

export const sightingsRouter = Router();

// GET /api/sightings?from=&to=&city=&species=&source=&page=&limit=
sightingsRouter.get("/", async (req, res) => {
  const q = ListQuery.parse(req.query);
  const where = buildWhere(q);
  const [total, data] = await Promise.all([
    prisma.sighting.count({ where }),
    prisma.sighting.findMany({
      where,
      orderBy: { observedAt: "desc" },
      skip: (q.page - 1) * q.limit,
      take: q.limit,
    }),
  ]);
  res.json({ data, page: q.page, limit: q.limit, total });
});

// GET /api/sightings/:id
sightingsRouter.get("/:id", async (req, res) => {
  const sighting = await prisma.sighting.findUnique({ where: { id: req.params.id } });
  if (!sighting) throw new HttpError(404, "NOT_FOUND", "Sighting not found");
  res.json(sighting);
});

// POST /api/sightings  (a report from the form)
sightingsRouter.post("/", async (req, res) => {
  const input = NewSighting.parse(req.body);
  const centre = CITY_COORDS[input.city];
  const sighting = await prisma.sighting.create({
    data: {
      source: "USER",
      species: input.species,
      latinName: input.latinName,
      observedAt: input.observedAt,
      city: input.city,
      // Use the reporter's exact spot if given, otherwise the city centre.
      latitude: input.latitude ?? centre.lat,
      longitude: input.longitude ?? centre.lng,
      notes: input.notes,
    },
  });
  res.status(201).json(sighting);
});