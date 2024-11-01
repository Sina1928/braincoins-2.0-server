import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import balanceRoutes from "./routes/balanceRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
// Load environment variables
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;
// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
}));
app.use(express.json());
// Health check route
app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
// Routes
app.use("/api/users", userRoutes);
app.use("/api/balance", balanceRoutes);
// Error handling
app.use(errorHandler);
// Start server
try {
    app.listen(PORT, () => {
        console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
    });
}
catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
}
export default app;
//# sourceMappingURL=index.js.map