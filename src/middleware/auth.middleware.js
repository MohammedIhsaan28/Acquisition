import logger from '#config/logger.js';
import { jwttoken } from '#utils/jwt.js';

/**
 * Middleware to authenticate JWT token from cookies
 * Extracts token from cookies and verifies it
 * Sets req.user with decoded token data
 */
export const authenticateToken = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      logger.warn('No token provided', {
        ip: req.ip,
        path: req.path,
        method: req.method,
      });
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No authentication token provided',
      });
    }

    const decoded = jwttoken.verify(token);
    req.user = decoded;
    logger.info(`User authenticated: ${decoded.email} (ID: ${decoded.id})`);
    next();
  } catch (e) {
    logger.error('Authentication failed:', e);
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid or expired token',
    });
  }
};

/**
 * Middleware factory to check if user has required role(s)
 * Usage: app.use(requireRole(['admin'])) or app.get(route, requireRole(['admin']), handler)
 */
export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        logger.warn('Attempted role check without authentication', {
          ip: req.ip,
          path: req.path,
        });
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
      }

      const userRole = req.user.role;

      if (!allowedRoles.includes(userRole)) {
        logger.warn('Access denied - insufficient permissions', {
          ip: req.ip,
          userId: req.user.id,
          userRole,
          requiredRoles: allowedRoles,
          path: req.path,
          method: req.method,
        });
        return res.status(403).json({
          error: 'Forbidden',
          message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`,
        });
      }

      logger.info(`User ${req.user.email} authorized for role: ${userRole}`);
      next();
    } catch (e) {
      logger.error('Role check failed:', e);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Error checking user permissions',
      });
    }
  };
};
