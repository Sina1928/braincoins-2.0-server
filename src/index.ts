import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import topTenRoutes from "./routes/topTenRoutes.js";
import { authenticateToken } from "./middleware/auth.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://braincoins-2.netlify.app",
  /^https:\/\/.*--braincoins-2\.netlify\.app$/, // Allow all Netlify preview URLs
];

const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) {
    if (!origin) {
      callback(null, true);
      return;
    }

    const isAllowed = allowedOrigins.some((allowedOrigin) => {
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return allowedOrigin === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log("Blocked origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Apply CORS before other middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

// Other middleware
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log("Origin:", req.headers.origin);
  console.log("Headers:", req.headers);
  next();
});

// Routes
app.get("/", (_req, res) => {
  res.send("Welcome to Braincoins 2.0 server");
});

// Mount routes
app.use("/users", userRoutes);
app.use("/top-ten", async (req, res, next) => {
  try {
    await topTenRoutes(req, res, next);
  } catch (err) {
    const error = err as Error;
    console.error("Error in top-ten route:", error);
    res.status(500).json({
      error: "Failed to fetch top users",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});
app.use("/dashboard", authenticateToken, userRoutes);

// Error interface
interface ApiError extends Error {
  status?: number;
  code?: string;
}

// Global error handler
app.use(
  (
    err: unknown,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Server error:", err);

    const error = err as ApiError;
    const statusCode = error.status || 500;

    res.status(statusCode).json({
      error: "Internal Server Error",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
  }
);

// Start server with error handling
const startServer = () => {
  try {
    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log("Allowed origins:", allowedOrigins);
    });

    server.on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        console.error(
          `Port ${PORT} is already in use. Please try a different port.`
        );
        process.exit(1);
      } else {
        console.error("Server error:", error);
      }
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
