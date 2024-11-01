import express from "express";
import pool from "../config/db.js"; // Adjust path as needed
const testRouter = express.Router();
testRouter.get("/test-db", async (req, res) => {
    try {
        const [rows] = await pool.execute("SELECT 1"); // Simple query to test connection
        res.json({ message: "Database connection successful!", rows });
    }
    catch (error) {
        console.error("Database connection error:", error);
        res.status(500).json({ error: "Database connection failed" });
    }
});
export default testRouter;
//# sourceMappingURL=testRoute.js.map