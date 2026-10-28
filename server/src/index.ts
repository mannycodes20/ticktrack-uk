import express from "express";
import cors from "cors";
import helmet from "helmet";
import { prisma } from "./db.js";
import { syncElanco } from "./ingest/syncElanco.js";

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const SIX_HOURS = 6 * 60 * 60 * 1000;

app.use(helmet());        // security headers
app.use(cors());          // let the frontend call this API
app.use(express.json());  // read JSON request bodies

app.get("/api/health", async (_req, res) => {
  const lastSync = await prisma.syncRun.findFirst({ orderBy: { startedAt: "desc" } });
  const sightings = await prisma.sighting.count();
  res.json({ status: "ok", sightings, lastSync });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
  syncElanco();
  setInterval(syncElanco, SIX_HOURS);
});