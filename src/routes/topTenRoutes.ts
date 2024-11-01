import express from "express";
import pool from "../config/db.js";
import { RowDataPacket } from "mysql2";

const router = express.Router();

// Interfaces
interface UserWithBalance extends RowDataPacket {
  id: number;
  username: string;
  email: string;
  password?: string;
  umer_coins: number;
  mark_bucks: number;
  kcoins: number;
  corgi_coins: number;
  neo_coins: number;
  total_value?: number;
}

interface UserResponse {
  id: number;
  username: string;
  email: string;
  balances: {
    "Umer coins": number;
    "Mark bucks": number;
    Kcoins: number;
    CorgiCoins: number;
    "Neo Coins": number;
  };
  totalValueInMarkBucks: number;
}

// Helper function to calculate total value
const calculateTotalValue = (user: UserWithBalance): number => {
  return (
    user.mark_bucks +
    user.umer_coins * 0.2 +
    user.kcoins * 500 +
    user.corgi_coins * 500 +
    user.neo_coins * 1000
  );
};

// Helper function to format user response
const formatUserResponse = (user: UserWithBalance): UserResponse => {
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

// Get top 10 users
router.get("", async (_req, res) => {
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

    const topUsers = users.map((user) => formatUserResponse(user));
    res.json(topUsers);
  } catch (error) {
    console.error("Error fetching top users:", error);
    res.status(500).json({ error: "Error fetching top users" });
  }
});
export default router;
