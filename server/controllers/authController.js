const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Helper to generate JWT
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'careertrack_super_secret_jwt_key_2026_production_grade',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Helper to set secure cookie
const setAuthCookie = (res, token) => {
  const cookieExpiresDays = parseInt(process.env.JWT_COOKIE_EXPIRES_IN || '7', 10);
  const isProd = process.env.NODE_ENV === 'production';

  res.cookie('careertrack_jwt', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    maxAge: cookieExpiresDays * 24 * 60 * 60 * 1000,
  });
};

// Strong password regex: >=8 chars, 1 upper, 1 lower, 1 digit, 1 special
const validatePasswordComplexity = (password) => {
  if (!password || password.length < 8) return false;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  return hasUpper && hasLower && hasDigit && hasSpecial;
};

// POST /api/v1/auth/register
const register = async (req, res, next) => {
  try {
    const { email, password, full_name, target_role, location } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and password are required.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    if (!validatePasswordComplexity(password)) {
      return res.status(400).json({
        success: false,
        message:
          'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.',
      });
    }

    // Check duplicate email
    const existing = await db.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Hash password with salt factor 12
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const userRes = await db.query(
      `INSERT INTO users (email, password_hash, full_name, role, is_active, target_role, location)
       VALUES (LOWER($1), $2, $3, 'user', true, $4, $5)
       RETURNING id, email, full_name, role, target_role, location, created_at`,
      [email.trim(), password_hash, full_name.trim(), target_role || null, location || null]
    );

    const user = userRes.rows[0];
    const token = generateToken(user.id, user.role);
    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const userRes = await db.query(
      `SELECT id, email, password_hash, full_name, role, is_active, target_role, location, bio, portfolio_url
       FROM users WHERE LOWER(email) = LOWER($1)`,
      [email.trim()]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const user = userRes.rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated. Please contact support.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    delete user.password_hash;
    const token = generateToken(user.id, user.role);
    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/auth/logout
const logout = (req, res) => {
  res.clearCookie('careertrack_jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  });
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

// GET /api/v1/auth/me
const getMe = async (req, res, next) => {
  try {
    const userRes = await db.query(
      `SELECT id, email, full_name, role, is_active, target_role, location, bio, portfolio_url, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = userRes.rows[0];

    // Get user quick stats
    const statsRes = await db.query(
      `SELECT 
         COUNT(*)::int AS total_applications,
         COUNT(CASE WHEN status NOT IN ('Rejected', 'Withdrawn', 'Archived', 'Accepted') THEN 1 END)::int AS active_applications,
         COUNT(CASE WHEN status = 'Interviewing' THEN 1 END)::int AS interviewing_count,
         COUNT(CASE WHEN status = 'Offer' THEN 1 END)::int AS offer_count
       FROM applications WHERE user_id = $1`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      user,
      stats: statsRes.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/v1/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { full_name, target_role, location, bio, portfolio_url } = req.body;

    if (!full_name || full_name.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Full name is required.' });
    }

    const updateRes = await db.query(
      `UPDATE users
       SET full_name = $1, target_role = $2, location = $3, bio = $4, portfolio_url = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING id, email, full_name, role, is_active, target_role, location, bio, portfolio_url, updated_at`,
      [full_name.trim(), target_role || null, location || null, bio || null, portfolio_url || null, req.user.id]
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: updateRes.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
};
