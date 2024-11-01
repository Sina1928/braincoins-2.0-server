import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
  user?: JwtPayload & { id?: string }; // Extend the user object
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401); // Unauthorized

  jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden
    req.user = user as JwtPayload & { id: string }; // Explicitly set user with expected type
    next();
  });
};

// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";

// // Extend the Request type
// export interface AuthRequest extends Request {
//   userId?: number;
// }

// export const authenticateToken = (
//   req: AuthRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const authHeader = req.headers.authorization;
//     const token = authHeader && authHeader.split(" ")[1];

//     if (!token) {
//       return res.status(401).json({ error: "Authentication required" });
//     }

//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET || "your-secret-key"
//     ) as { userId: number };

//     req.userId = decoded.userId;
//     next();
//   } catch (error) {
//     return res.status(403).json({ error: "Invalid token" });
//   }
// };
