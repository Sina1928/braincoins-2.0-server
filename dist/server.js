import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import balanceRoutes from "./routes/balanceRoutes.js";
import userRoutes from "./routes/userRoutes.js";
dotenv.config();
const app = express();
const port = process.env.PORT || 8080;
app.use(cors());
app.use(express.json());
app.use("/api/balance", balanceRoutes);
app.use("/api/users", userRoutes);
app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
export default app;
//# sourceMappingURL=server.js.map