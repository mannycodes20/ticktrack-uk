import { z } from "zod";
import { CITY_COORDS } from "./data/cities.js";

const CITIES = Object.keys(CITY_COORDS) as [string, ...string[]];
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the format YYYY-MM-DD")
  .refine((s) => !Number.isNaN(Date.parse(s)), "Not a real date");

// Filters shared by the sightings list and the stats endpoints.
export const FilterQuery = z
  .object({
    from: isoDate.optional(),
    to: isoDate.optional(),
    city: z.enum(CITIES).optional(),
    species: z.string().trim().min(1).optional(),
    source: z.enum(["ELANCO", "USER"]).optional(),
  })
  .refine((q) => !q.from || !q.to || q.from <= q.to, {
    message: "'from' must be on or before 'to'",
    path: ["from"],
  });

export const ListQuery = FilterQuery.and(
  z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(500).default(100),
  }),
);

export const TrendQuery = FilterQuery.and(
  z.object({ interval: z.enum(["week", "month"]).default("month") }),
);

// A new sighting reported through the form.
export const NewSighting = z.object({
  species: z.string().trim().min(1, "Choose a species"),
  latinName: z.string().trim().optional(),
  observedAt: z.coerce
    .date({ message: "Enter a valid date" })
    .refine((d) => d <= new Date(), "Date cannot be in the future")
    .refine((d) => d >= new Date("2000-01-01"), "Date must be after 2000"),
  city: z.enum(CITIES, { message: "Choose one of the listed cities" }),
  latitude: z.coerce.number().min(49.8).max(60.9).optional(),
  longitude: z.coerce.number().min(-8.7).max(1.8).optional(),
  notes: z.string().trim().max(500, "Notes must be 500 characters or fewer").optional(),
});

export type Filters = z.infer<typeof FilterQuery>;