import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import userRoutes from "./routes/userRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const DEFAULT_PORT = 3000;
const PORT = Number(process.env.PORT) || DEFAULT_PORT;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// API Routes
app.use("/api/users", userRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    port: PORT,
  });
});

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  // Serve frontend static files
  app.use(express.static(path.join(__dirname, "../client/dist")));

  // Handle all other routes by serving the index.html
  app.get("*", (_req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
} else {
  // Development welcome message
  app.get("/", (_req, res) => {
    res.json({
      message: "Welcome to Braincoins 2.0's Server",
      endpoints: {
        health: "/api/health",
        users: "/api/users",
        login: "/api/users/login",
        topTen: "/api/users/top-ten",
        profile: "/api/users/profile/:id",
      },
    });
  });
}

// Error handling middleware
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something broke!" });
  }
);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server with error handling
const startServer = async () => {
  try {
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    // Handle server errors
    server.on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        console.log(`Port ${PORT} is in use, trying ${DEFAULT_PORT + 1}`);
        server.close();
        app.listen(DEFAULT_PORT + 1, "0.0.0.0", () => {
          console.log(`Server running on http://localhost:${DEFAULT_PORT + 1}`);
        });
      } else {
        console.error("Server error:", error);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
