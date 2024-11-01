import express from "express";
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
  total_value?: number;
}

// Get top 10 users
router.get("/", async (_req, res) => {
  try {
    const [users] = await pool.execute<UserWithBalance[]>(`
      SELECT 
        u.id,
        u.username,
        u.email,
        b.umer_coins,
        b.mark_bucks,
        b.kcoins,
        b.corgi_coins,
        b.neo_coins,
        (b.mark_bucks + (b.umer_coins * 0.2) + (b.kcoins * 500) +
         b.corgi_coins * 500 + b.neo_coins * 1000) as total_value
      FROM users u
      JOIN balances b ON u.id = b.user_id
      ORDER BY total_value DESC
      LIMIT 10
    `);

    const formattedUsers = users.map((user) => ({
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
      totalValueInMarkBucks: user.total_value || 0,
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error("Error fetching top users:", error);
    res.status(500).json({ error: "Error fetching top users" });
  }
});

export default router;
