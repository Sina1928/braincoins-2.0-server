import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST, // Host URL from JawsDB
  user: process.env.DB_USER, // Database username
  password: process.env.DB_PASS, // Database password
  database: process.env.DB_NAME, // Database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
