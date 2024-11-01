import express, { Request, Response } from "express";
import cors from "cors";
import { authenticateToken } from "./middleware/auth.js";
import userRoutes from "./routes/userRoutes.js";
import topTenRoutes from "./routes/topTenRoutes.js";
import pool from "./config/db.js";

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://braincoins-2.netlify.app",
];

const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204,
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Middleware to parse JSON
app.use(express.json());

// Handle preflight requests
app.options("*", cors(corsOptions));

// Basic route
app.get("/", (_req: Request, res: Response) => {
  res.send("Welcome to Braincoins 2.0 server");
});

// DB test route
app.get("/test-db", async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.execute("SELECT 1");
    res.json({ message: "Database connection successful!", rows });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// Routes
app.use("/users", userRoutes); // For login and registration
app.use("/dashboard", authenticateToken, userRoutes);
app.use("/top-ten", topTenRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
