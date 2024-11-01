import express, { Request, Response } from "express";

const router = express.Router();

interface User {
  name: string;
  "Umer coins": number;
  "Mark bucks": number;
  Kcoins: number;
  CorgiCoins: number;
  "Neo Coins": number;
  totalValueInMarkBucks?: number;
}

// Sample data - replace with database in production
const users: User[] = [
  {
    name: "John Doe",
    "Umer coins": 100,
    "Mark bucks": 50,
    Kcoins: 2,
    CorgiCoins: 1,
    "Neo Coins": 1,
  },
];

const calculateTotalValue = (user: User): number => {
  return (
    (user["Umer coins"] || 0) * (100 / 500) +
    (user["Mark bucks"] || 0) +
    (user["Kcoins"] || 0) * 500 +
    (user["CorgiCoins"] || 0) * 500 +
    (user["Neo Coins"] || 0) * 1000
  );
};

router.get("/", (_req: Request, res: Response) => {
  const usersWithTotal = users
    .map((user) => ({
      ...user,
      totalValueInMarkBucks: calculateTotalValue(user),
    }))
    .sort(
      (a, b) => (b.totalValueInMarkBucks || 0) - (a.totalValueInMarkBucks || 0)
    )
    .slice(0, 10);

  res.json(usersWithTotal);
});

export default router;
