import express from "express";
import cors from "cors";
import helmet from "helmet";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(helmet());        // security headers
app.use(cors());          // let the frontend call this API
app.use(express.json());  // read JSON request bodies

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});