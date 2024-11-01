import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { LRUCache } from 'lru-cache';
import { createLogger, format, transports } from 'winston';

// Configure Winston logger
const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' })
  ]
});

// Configure LRU Cache for token blacklist
const tokenBlacklist = new LRUCache({
  max: 500,
  ttl: 24 * 60 * 60 * 1000 // 24 hours
});

interface User {
  id: number;
  username: string;
  password: string;
}

class AuthService {
  private readonly saltRounds = 10;
  private readonly jwtSecret = process.env.JWT_SECRET || 'your-default-secret';

  async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcryptjs.genSalt(this.saltRounds);
      return await bcryptjs.hash(password, salt);
    } catch (error) {
      logger.error('Error hashing password:', error);
      throw new Error('Error creating user');
    }
  }

  async comparePasswords(password: string, hash: string): Promise<boolean> {
    try {
      return await bcryptjs.compare(password, hash);
    } catch (error) {
      logger.error('Error comparing passwords:', error);
      throw new Error('Error during authentication');
    }
  }

  generateToken(user: Omit<User, 'password'>): string {
    try {
      return jwt.sign(
        { id: user.id, username: user.username },
        this.jwtSecret,
        { expiresIn: '24h' }
      );
    } catch (error) {
      logger.error('Error generating token:', error);
      throw new Error('Error generating authentication token');
    }
  }

  verifyToken(token: string): any {
    try {
      // Check if token is blacklisted
      if (tokenBlacklist.get(token)) {
        throw new Error('Token is blacklisted');
      }
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      logger.error('Error verifying token:', error);
      throw new Error('Invalid token');
    }
  }

  blacklistToken(token: string): void {
    tokenBlacklist.set(token, true);
  }
}

export const authService = new AuthService();