import mysql from "mysql2/promise";
import bcryptjs from "bcryptjs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFile } from "fs/promises";
import dotenv from "dotenv";
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
async function seedDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "braincoins_db",
    });
    try {
        // Read users data
        const usersData = JSON.parse(await readFile(join(__dirname, "users.json"), "utf-8"));
        // Default password hash
        const defaultPassword = await bcryptjs.hash("password123", 10);
        // First, clear existing data
        await connection.execute("DELETE FROM balances");
        await connection.execute("DELETE FROM users");
        console.log("Existing data cleared. Starting seed...");
        for (const userData of usersData) {
            // Create user
            const [userResult] = await connection.execute("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [
                userData.name,
                `${userData.name.toLowerCase()}@example.com`,
                defaultPassword,
            ]);
            const userId = userResult.insertId;
            // Create balance
            await connection.execute(`INSERT INTO balances (
          user_id, 
          umer_coins, 
          mark_bucks, 
          kcoins, 
          corgi_coins, 
          neo_coins
        ) VALUES (?, ?, ?, ?, ?, ?)`, [
                userId,
                userData["Umer coins"],
                userData["Mark bucks"],
                userData["Kcoins"],
                userData["CorgiCoins"],
                userData["Neo Coins"],
            ]);
            console.log(`Added user: ${userData.name}`);
        }
        console.log("Database seeded successfully!");
    }
    catch (error) {
        console.error("Error seeding database:", error);
    }
    finally {
        await connection.end();
    }
}
seedDatabase();
//# sourceMappingURL=seed.js.map