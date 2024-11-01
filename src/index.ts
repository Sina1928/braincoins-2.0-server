import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import topTenRoutes from "./routes/topTenRoutes.js";
import { authenticateToken } from "./middleware/auth.js";

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

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log("Headers:", req.headers);
  next();
});

// Base routes
app.get("/", (_req, res) => {
  res.send("Welcome to Braincoins 2.0 server");
});

// Mount routes without /api prefix since it's handled by the client
app.use("/users", userRoutes);
app.use("/top-ten", topTenRoutes);
app.use("/dashboard", authenticateToken, userRoutes);

// Error handling
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({
      error: "Internal Server Error",
      message: err.message,
    });
  }
);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
