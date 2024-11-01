import express from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { RowDataPacket } from "mysql2";

const router = express.Router();

interface UserWithBalance extends RowDataPacket {
  id: number;
  username: string;
  email: string;
  umer_coins: number;
  mark_bucks: number;
  kcoins: number;
  corgi_coins: number;
  neo_coins: number;
}

const calculateTotalValue = (balance: {
  umer_coins: number;
  mark_bucks: number;
  kcoins: number;
  corgi_coins: number;
  neo_coins: number;
}): number => {
  return (
    (balance.umer_coins || 0) * (100 / 500) +
    (balance.mark_bucks || 0) +
    (balance.kcoins || 0) * 500 +
    (balance.corgi_coins || 0) * 500 +
    (balance.neo_coins || 0) * 1000
  );
};

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user with balance in a single query
    const [users] = await pool.execute<UserWithBalance[]>(
      `
      SELECT u.*, 
        b.umer_coins, 
        b.mark_bucks, 
        b.kcoins, 
        b.corgi_coins, 
        b.neo_coins
      FROM users u
      LEFT JOIN balances b ON u.id = b.user_id
      WHERE u.email = ?
    `,
      [email.toLowerCase()]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = users[0];

    // Verify password
    const validPassword = await bcryptjs.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Calculate total value
    const totalValueInMarkBucks = calculateTotalValue(user);

    // Generate token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    // Send response without password
    res.json({
      token,
      user: {
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
        totalValueInMarkBucks,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Error logging in" });
  }
});

// Get top users
router.get("/top-ten", async (_req, res) => {
  try {
    const [users] = await pool.execute<UserWithBalance[]>(`
      SELECT u.id, u.username,
        b.umer_coins, 
        b.mark_bucks, 
        b.kcoins, 
        b.corgi_coins, 
        b.neo_coins
      FROM users u
      LEFT JOIN balances b ON u.id = b.user_id
      ORDER BY (
        b.mark_bucks + 
        (b.umer_coins * 0.2) + 
        (b.kcoins * 500) + 
        (b.corgi_coins * 500) + 
        (b.neo_coins * 1000)
      ) DESC
      LIMIT 10
    `);

    const topUsers = users.map((user) => ({
      id: user.id,
      username: user.username,
      "Umer coins": user.umer_coins,
      "Mark bucks": user.mark_bucks,
      Kcoins: user.kcoins,
      CorgiCoins: user.corgi_coins,
      "Neo Coins": user.neo_coins,
      totalValueInMarkBucks: calculateTotalValue(user),
    }));

    res.json(topUsers);
  } catch (error) {
    console.error("Error fetching top users:", error);
    res.status(500).json({ error: "Error fetching top users" });
  }
});

// Get user profile
router.get("/profile/:id", async (req, res) => {
  try {
    const [users] = await pool.execute<UserWithBalance[]>(
      `
      SELECT u.id, u.username, u.email,
        b.umer_coins, 
        b.mark_bucks, 
        b.kcoins, 
        b.corgi_coins, 
        b.neo_coins
      FROM users u
      LEFT JOIN balances b ON u.id = b.user_id
      WHERE u.id = ?
    `,
      [req.params.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = users[0];
    const totalValueInMarkBucks = calculateTotalValue(user);

    res.json({
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
      totalValueInMarkBucks,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Error fetching user profile" });
  }
});

export default router;
