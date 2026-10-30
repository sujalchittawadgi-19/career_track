const jwt = require('jsonwebtoken');
const db = require('../config/db');

const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check cookies
    if (req.cookies && (req.cookies.careertrack_jwt || req.cookies.token)) {
      token = req.cookies.careertrack_jwt || req.cookies.token;
    }
    // 2. Check Authorization header fallback
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // 3. Check query parameter fallback (e.g. for direct file download links)
    else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'careertrack_super_secret_jwt_key_2026_production_grade');
    
    // Verify user in database
    const userRes = await db.query(
      'SELECT id, email, full_name, role, is_active, target_role, location FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User account not found.',
      });
    }

    const user = userRes.rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired or invalid token. Please log in again.',
      });
    }
    return next(err);
  }
};

const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    if (req.user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Requires ${role} role privileges.`,
      });
    }
    next();
  };
};

module.exports = {
  authenticate,
  requireRole,
};
