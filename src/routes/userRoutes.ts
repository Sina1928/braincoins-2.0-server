import express from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { RowDataPacket, ResultSetHeader } from "mysql2";

const router = express.Router();

interface User extends RowDataPacket {
  id: number;
  username: string;
  email: string;
  password: string;
}

interface Balance extends RowDataPacket {
  id: number;
  user_id: number;
  umer_coins: number;
  mark_bucks: number;
  kcoins: number;
  corgi_coins: number;
  neo_coins: number;
}

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Get user
    const [users] = await pool.execute<User[]>(
      "SELECT * FROM users WHERE email = ?",
      [email.toLowerCase()]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = users[0];

    // Check password
    const validPassword = await bcryptjs.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    // Get user balances
    const [balances] = await pool.execute<Balance[]>(
      "SELECT * FROM balances WHERE user_id = ?",
      [user.id]
    );

    const userBalance = balances.length > 0 ? balances[0] : null;

    // Send response
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        balances: userBalance,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Error logging in" });
  }
});

// Get user profile
router.get("/profile/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const [users] = await pool.execute<User[]>(
      "SELECT id, username, email FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const [balances] = await pool.execute<Balance[]>(
      "SELECT * FROM balances WHERE user_id = ?",
      [userId]
    );

    const userBalance = balances.length > 0 ? balances[0] : null;

    res.json({
      user: users[0],
      balances: userBalance,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ error: "Error fetching profile" });
  }
});

// Get user balances
router.get("/balances/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const [balances] = await pool.execute<Balance[]>(
      "SELECT * FROM balances WHERE user_id = ?",
      [userId]
    );

    if (balances.length === 0) {
      return res.status(404).json({ error: "Balances not found" });
    }

    const totalValueInMarkBucks = calculateTotalValue(balances[0]);

    res.json({
      ...balances[0],
      totalValueInMarkBucks,
    });
  } catch (error) {
    console.error("Balance fetch error:", error);
    res.status(500).json({ error: "Error fetching balances" });
  }
});

// Helper function to calculate total value in Mark Bucks
function calculateTotalValue(balance: Balance): number {
  return (
    (balance.umer_coins || 0) * (100 / 500) +
    (balance.mark_bucks || 0) +
    (balance.kcoins || 0) * 500 +
    (balance.corgi_coins || 0) * 500 +
    (balance.neo_coins || 0) * 1000
  );
}

export default router;
