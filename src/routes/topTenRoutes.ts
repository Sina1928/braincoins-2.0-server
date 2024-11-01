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
    console.log("Fetching top users...");

    const [users] = await pool.execute<UserWithBalance[]>(`
      SELECT 
        u.id,
        u.username,
        u.email,
        COALESCE(b.umer_coins, 0) as umer_coins,
        COALESCE(b.mark_bucks, 0) as mark_bucks,
        COALESCE(b.kcoins, 0) as kcoins,
        COALESCE(b.corgi_coins, 0) as corgi_coins,
        COALESCE(b.neo_coins, 0) as neo_coins,
        COALESCE(
          b.mark_bucks + 
          (b.umer_coins * 0.2) + 
          (b.kcoins * 500) +
          (b.corgi_coins * 500) + 
          (b.neo_coins * 1000), 
          0
        ) as total_value
      FROM users u
      LEFT JOIN balances b ON u.id = b.user_id
      WHERE b.umer_coins IS NOT NULL 
         OR b.mark_bucks IS NOT NULL 
         OR b.kcoins IS NOT NULL 
         OR b.corgi_coins IS NOT NULL 
         OR b.neo_coins IS NOT NULL
      ORDER BY total_value DESC
      LIMIT 10
    `);

    console.log(`Found ${users.length} users`);

    const formattedUsers = users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      balances: {
        "Umer coins": user.umer_coins || 0,
        "Mark bucks": user.mark_bucks || 0,
        Kcoins: user.kcoins || 0,
        CorgiCoins: user.corgi_coins || 0,
        "Neo Coins": user.neo_coins || 0,
      },
      totalValueInMarkBucks: user.total_value || 0,
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error("Error fetching top users:", error);
    res.status(500).json({
      error: "Error fetching top users",
      details: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
});

export default router;
