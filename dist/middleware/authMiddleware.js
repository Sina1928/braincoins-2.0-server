import { authService } from '../services/authService.js';
export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Authentication token required' });
        }
        const decoded = authService.verifyToken(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(403).json({ error: 'Invalid token' });
    }
};
//# sourceMappingURL=authMiddleware.js.map