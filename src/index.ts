import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// import { validateEnv } from './config/validateEnv.js';
import userRoutes from "./routes/userRoutes.js";

// Load and validate environment variables
dotenv.config();
// validateEnv();

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

// Routes
app.use("/api/users", userRoutes);

// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    port: PORT,
  });
});

// Start server with error handling
const startServer = async () => {
  try {
    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    // Handle server errors
    server.on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        console.log(`Port ${PORT} is in use, trying ${DEFAULT_PORT + 1}`);
        server.close();
        app.listen(DEFAULT_PORT + 1, () => {
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
