import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: new URL("../../.env", import.meta.url) });
async function setupDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
    });
    try {
        // Create database
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || "braincoins_db"}`);
        await connection.query(`USE ${process.env.DB_NAME || "braincoins_db"}`);
        // Create users table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        // Create balances table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS balances (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                umer_coins DECIMAL(10,2) DEFAULT 0,
                mark_bucks DECIMAL(10,2) DEFAULT 0,
                kcoins DECIMAL(10,2) DEFAULT 0,
                corgi_coins DECIMAL(10,2) DEFAULT 0,
                neo_coins DECIMAL(10,2) DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log("Database setup completed successfully");
    }
    catch (error) {
        console.error("Error setting up database:", error);
        process.exit(1);
    }
    finally {
        await connection.end();
    }
}
setupDatabase();
//# sourceMappingURL=setup.js.map