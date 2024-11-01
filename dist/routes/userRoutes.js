import express from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { authenticateToken } from "../middleware/auth.js";
const router = express.Router();
// Helper function to calculate total value
const calculateTotalValue = (user) => {
    return (user.mark_bucks +
        user.umer_coins * 0.2 +
        user.kcoins * 500 +
        user.corgi_coins * 500 +
        user.neo_coins * 1000);
};
// Helper function to format user response
const formatUserResponse = (user) => {
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        balances: {
            "Umer coins": user.umer_coins,
            "Mark bucks": user.mark_bucks,
            Kcoins: user.kcoins,
            CorgiCoins: user.corgi_coins,
            "Neo Coins": user.neo_coins,
        },
        totalValueInMarkBucks: calculateTotalValue(user),
    };
};
// Routes
// Login route
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        // Get user with balance in a single query
        const [users] = await pool.execute(`
      SELECT u.*, 
        b.umer_coins, 
        b.mark_bucks, 
        b.kcoins, 
        b.corgi_coins, 
        b.neo_coins
      FROM users u
      LEFT JOIN balances b ON u.id = b.user_id
      WHERE u.email = ?
    `, [email.toLowerCase()]);
        if (users.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const user = users[0];
        // Verify password
        const validPassword = await bcryptjs.compare(password, user.password || "");
        if (!validPassword) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        // Generate token
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "24h" });
        // Remove password from response
        delete user.password;
        // Send response
        res.json({
            token,
            user: formatUserResponse(user),
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Error logging in" });
    }
});
// Get user profile
router.get("/profile", authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        const [users] = await pool.execute(`
      SELECT u.id, u.username, u.email,
        b.umer_coins, 
        b.mark_bucks, 
        b.kcoins, 
        b.corgi_coins, 
        b.neo_coins
      FROM users u
      LEFT JOIN balances b ON u.id = b.user_id
      WHERE u.id = ?
    `, [userId]);
        if (users.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(formatUserResponse(users[0]));
    }
    catch (error) {
        console.error("Profile fetch error:", error);
        res.status(500).json({ error: "Error fetching user profile" });
    }
});
// Get top 10 users
// router.get("/top-ten", async (_req, res) => {
//   try {
//     const [users] = await pool.execute<UserWithBalance[]>(`
//       SELECT
//         u.id,
//         u.username,
//         u.email,
//         b.umer_coins,
//         b.mark_bucks,
//         b.kcoins,
//         b.corgi_coins,
//         b.neo_coins,
//         (b.mark_bucks + (b.umer_coins * 0.2) + (b.kcoins * 500) +
//          b.corgi_coins * 500 + b.neo_coins * 1000) as total_value
//       FROM users u
//       JOIN balances b ON u.id = b.user_id
//       ORDER BY total_value DESC
//       LIMIT 10
//     `);
//     const topUsers = users.map((user) => formatUserResponse(user));
//     res.json(topUsers);
//   } catch (error) {
//     console.error("Error fetching top users:", error);
//     res.status(500).json({ error: "Error fetching top users" });
//   }
// });
// Get single user's balance
router.get("/balance/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        const [users] = await pool.execute(`
      SELECT u.id, u.username, u.email,
        b.umer_coins, 
        b.mark_bucks, 
        b.kcoins, 
        b.corgi_coins, 
        b.neo_coins
      FROM users u
      LEFT JOIN balances b ON u.id = b.user_id
      WHERE u.id = ?
    `, [userId]);
        if (users.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(formatUserResponse(users[0]));
    }
    catch (error) {
        console.error("Balance fetch error:", error);
        res.status(500).json({ error: "Error fetching balance" });
    }
});
// Health check route
router.get("/health", (_req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
    });
});
export default router;
//# sourceMappingURL=userRoutes.js.map