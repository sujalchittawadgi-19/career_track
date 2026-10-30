const db = require('../config/db');

// GET /api/v1/admin/users
const getAllUsers = async (req, res, next) => {
  try {
    const { search, role, status, page = 1, limit = 20 } = req.query;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (search && search.trim()) {
      conditions.push(`(u.email ILIKE $${paramIndex} OR u.full_name ILIKE $${paramIndex})`);
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    if (role && role !== 'all') {
      conditions.push(`u.role = $${paramIndex}`);
      params.push(role);
      paramIndex++;
    }

    if (status !== undefined && status !== 'all') {
      const isActive = status === 'active' || status === 'true';
      conditions.push(`u.is_active = $${paramIndex}`);
      params.push(isActive);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count
    const countSql = `SELECT COUNT(*)::int AS total FROM users u ${whereClause}`;
    const countRes = await db.query(countSql, params);
    const totalCount = countRes.rows[0].total;

    const parsedLimit = parseInt(limit, 10) || 20;
    const parsedPage = parseInt(page, 10) || 1;
    const offset = (parsedPage - 1) * parsedLimit;

    const dataSql = `
      SELECT 
        u.id,
        u.email,
        u.full_name,
        u.role,
        u.is_active,
        u.target_role,
        u.location,
        u.created_at,
        u.updated_at,
        (SELECT COUNT(*)::int FROM applications a WHERE a.user_id = u.id) AS total_applications,
        (SELECT COUNT(*)::int FROM resumes r WHERE r.user_id = u.id) AS total_resumes
      FROM users u
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(parsedLimit, offset);
    const usersRes = await db.query(dataSql, params);

    return res.status(200).json({
      success: true,
      users: usersRes.rows,
      pagination: {
        totalCount,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(totalCount / parsedLimit) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/admin/users/:id/status
const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Administrators cannot deactivate their own account.',
      });
    }

    const targetUser = await db.query('SELECT id, is_active FROM users WHERE id = $1', [id]);
    if (targetUser.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const newStatus = is_active !== undefined ? Boolean(is_active) : !targetUser.rows[0].is_active;

    const updateRes = await db.query(
      `UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, full_name, is_active`,
      [newStatus, id]
    );

    return res.status(200).json({
      success: true,
      message: `User account has been ${newStatus ? 'activated' : 'suspended'}.`,
      user: updateRes.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/admin/metrics
const getSystemMetrics = async (req, res, next) => {
  try {
    const metricsRes = await db.query(`
      SELECT 
        (SELECT COUNT(*)::int FROM users) AS total_users,
        (SELECT COUNT(*)::int FROM users WHERE is_active = TRUE) AS active_users,
        (SELECT COUNT(*)::int FROM applications) AS total_applications,
        (SELECT COUNT(*)::int FROM interviews) AS total_interviews,
        (SELECT COUNT(*)::int FROM applications WHERE status = 'Offer') AS total_offers,
        (SELECT COUNT(*)::int FROM resumes) AS total_resumes,
        (SELECT COUNT(*)::int FROM companies) AS total_companies
    `);

    return res.status(200).json({
      success: true,
      metrics: metricsRes.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllUsers,
  toggleUserStatus,
  getSystemMetrics,
};
