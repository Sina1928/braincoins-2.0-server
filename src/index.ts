import express, { Request, Response } from "express";
import { authenticateToken } from "./middleware/auth.js";
import userRoutes from "./routes/userRoutes.js";
import topTenRoutes from "./routes/topTenRoutes.js";
import testRouter from "./routes/testRoute.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Braincoins 2.0 server");
});
app.use("/dashboard", authenticateToken, userRoutes);
app.use("/top-ten", topTenRoutes);
app.use("/test", testRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// import express, { Request, Response, NextFunction } from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import jwt from 'jsonwebtoken';
// import axios from 'axios';

// // Initialize environment variables
// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// // CORS setup to allow requests from the Netlify frontend
// const allowedOrigins = ['https://your-netlify-site.netlify.app'];
// app.use(cors({
//   origin: allowedOrigins,
// }));

// // Middleware for JSON parsing
// app.use(express.json());

// // Middleware for verifying JWT token
// const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
//   const token = req.headers['authorization']?.split(' ')[1];
//   if (!token) return res.status(401).json({ error: 'Access token required' });

//   jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
//     if (err) return res.status(403).json({ error: 'Invalid token' });
//     req.user = user;
//     next();
//   });
// };

// // Route to get top ten users by total_value
// app.get('/api/topten', async (req: Request, res: Response) => {
//   try {
//     const response = await axios.get(`${process.env.API_BASE_URL}/users/topten`);
//     res.json(response.data);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to retrieve top ten users' });
//   }
// });

// // Protected route for user profile, requires JWT authorization
// app.get('/api/dashboard', authenticateToken, async (req: Request, res: Response) => {
//   try {
//     const userId = req.user?.id;
//     const response = await axios.get(`${process.env.API_BASE_URL}/users/profile`, {
//       params: { userId },
//     });
//     res.json(response.data);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to retrieve user profile' });
//   }
// });

// // Catch-all for undefined routes
// app.use((req: Request, res: Response) => {
//   res.status(404).json({ error: 'API endpoint not found' });
// });

// // Error handling middleware
// app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
//   console.error(error);
//   res.status(500).json({ error: 'Internal server error' });
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
