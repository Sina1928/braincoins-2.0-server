import { Router } from "express";
import pool from "../config/db.js";
const router = Router();
const calculateTotalValue = (user) => {
    return ((user["Umer coins"] || 0) * (100 / 500) +
        (user["Mark bucks"] || 0) +
        (user["Kcoins"] || 0) * 500 +
        (user["CorgiCoins"] || 0) * 500 +
        (user["Neo Coins"] || 0) * 1000);
};
router.get("/", async (_req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM users");
        const usersWithTotal = rows.map((user) => ({
            ...user,
            totalValueInMarkBucks: calculateTotalValue(user),
        }));
        res.json(usersWithTotal);
    }
    catch (error) {
        console.error("Error fetching balances:", error);
        res.status(500).json({ error: "Error fetching balances" });
    }
});
export default router;
//# sourceMappingURL=balanceRoutes.js.map