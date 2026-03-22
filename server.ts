import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { createClient } from "redis";

dotenv.config();

const app = express();
const PORT = 3000;

// Redis Connection (Distributed Context)
const redisUrl = process.env.REDIS_URL;
const redisClient = redisUrl ? createClient({ url: redisUrl }) : null;

if (redisClient) {
  redisClient.on("error", (err) => console.error("[SYNODE] Redis Client Error", err));
  redisClient.connect().then(() => console.log("[SYNODE] Mémoire Redis connectée."));
}

app.use(express.json());

// KALEIDOLAND SYNODE - Health Check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ACTIVE", 
    synode_version: "2.1",
    timestamp: new Date().toISOString(),
    identity: "Hémisphère Droit [KALEIDOLAND]"
  });
});

// Production / Development Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("[SYNODE] Mode: DEVELOPMENT. Initialisation de Vite...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[SYNODE] Mode: PRODUCTION. Service des artefacts statiques...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n--------------------------------------------------`);
    console.log(`[KALEIDOLAND SYNODE] SYSTÈME ACTIF`);
    console.log(`PORT: ${PORT}`);
    console.log(`UNIVERS: Blood & Gold`);
    console.log(`--------------------------------------------------\n`);
  });
}

startServer();
