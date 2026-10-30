const db = require('../config/db');

// Helper to find or create company
const findOrCreateCompany = async (companyName, website = null) => {
  const trimmed = companyName.trim();
  const existing = await db.query('SELECT id, name, website, logo_url FROM companies WHERE LOWER(name) = LOWER($1)', [trimmed]);
  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  // Derive simple logo URL
  const domainGuess = trimmed.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
  const logoUrl = `https://logo.clearbit.com/${domainGuess}`;

  const created = await db.query(
    'INSERT INTO companies (name, website, logo_url) VALUES ($1, $2, $3) RETURNING id, name, website, logo_url',
    [trimmed, website || `https://${domainGuess}`, logoUrl]
  );
  return created.rows[0];
};

// GET /api/v1/applications
const getApplications = async (req, res, next) => {
  try {
    const {
      search,
      status,
      job_type,
      work_mode,
      sort_by = 'created_at',
      order = 'DESC',
      page = 1,
      limit = 20,
      all = false,
    } = req.query;

    const conditions = ['a.user_id = $1'];
    const params = [req.user.id];
    let paramIndex = 2;

    // Search filter
    if (search && search.trim()) {
      conditions.push(`(c.name ILIKE $${paramIndex} OR a.job_title ILIKE $${paramIndex} OR a.location ILIKE $${paramIndex})`);
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    // Status filter (single or comma-separated)
    if (status && status !== 'all') {
      const statusList = status.split(',').map((s) => s.trim());
      conditions.push(`a.status = ANY($${paramIndex})`);
      params.push(statusList);
      paramIndex++;
    }

    // Job type filter
    if (job_type && job_type !== 'all') {
      conditions.push(`a.job_type = $${paramIndex}`);
      params.push(job_type);
      paramIndex++;
    }

    // Work mode filter
    if (work_mode && work_mode !== 'all') {
      conditions.push(`a.work_mode = $${paramIndex}`);
      params.push(work_mode);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    // Valid sort columns
    const allowedSortColumns = {
      created_at: 'a.created_at',
      applied_date: 'a.applied_date',
      deadline_date: 'a.deadline_date',
      job_title: 'a.job_title',
      company_name: 'c.name',
      status: 'a.status',
      salary_max: 'a.salary_max',
    };

    const sortCol = allowedSortColumns[sort_by] || 'a.created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Count total matches
    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM applications a
      JOIN companies c ON a.company_id = c.id
      WHERE ${whereClause}
    `;
    const countRes = await db.query(countSql, params);
    const totalCount = countRes.rows[0].total;

    // Build data query
    let dataSql = `
      SELECT 
        a.id,
        a.job_title,
        a.status,
        a.job_type,
        a.work_mode,
        a.location,
        a.salary_min,
        a.salary_max,
        a.salary_currency,
        a.application_url,
        a.description,
        a.applied_date,
        a.deadline_date,
        a.created_at,
        a.updated_at,
        c.id AS company_id,
        c.name AS company_name,
        c.website AS company_website,
        c.logo_url AS company_logo,
        r.id AS resume_id,
        r.file_name AS resume_file_name,
        (
          SELECT COUNT(*)::int 
          FROM interviews i 
          WHERE i.application_id = a.id
        ) AS total_interviews,
        (
          SELECT COUNT(*)::int 
          FROM interviews i 
          WHERE i.application_id = a.id AND i.scheduled_at >= NOW()
        ) AS upcoming_interviews
      FROM applications a
      JOIN companies c ON a.company_id = c.id
      LEFT JOIN resumes r ON a.resume_id = r.id
      WHERE ${whereClause}
      ORDER BY ${sortCol} ${sortOrder}
    `;

    const parsedLimit = parseInt(limit, 10) || 20;
    const parsedPage = parseInt(page, 10) || 1;
    const offset = (parsedPage - 1) * parsedLimit;

    if (!all || all === 'false') {
      dataSql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(parsedLimit, offset);
    }

    const dataRes = await db.query(dataSql, params);

    return res.status(200).json({
      success: true,
      applications: dataRes.rows,
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

// GET /api/v1/applications/:id
const getApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const appRes = await db.query(
      `SELECT 
        a.*,
        c.name AS company_name,
        c.website AS company_website,
        c.logo_url AS company_logo,
        r.file_name AS resume_file_name,
        r.file_size_bytes AS resume_file_size
       FROM applications a
       JOIN companies c ON a.company_id = c.id
       LEFT JOIN resumes r ON a.resume_id = r.id
       WHERE a.id = $1`,
      [id]
    );

    if (appRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Application record not found.' });
    }

    const application = appRes.rows[0];

    // Ownership check (unless admin)
    if (application.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied to this application.' });
    }

    // Fetch interviews
    const interviewsRes = await db.query(
      `SELECT * FROM interviews WHERE application_id = $1 ORDER BY scheduled_at ASC`,
      [id]
    );

    // Fetch notes
    const notesRes = await db.query(
      `SELECT n.*, u.full_name AS author_name 
       FROM notes n 
       JOIN users u ON n.user_id = u.id 
       WHERE n.application_id = $1 
       ORDER BY n.created_at DESC`,
      [id]
    );

    return res.status(200).json({
      success: true,
      application: {
        ...application,
        interviews: interviewsRes.rows,
        notes: notesRes.rows,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/applications
const createApplication = async (req, res, next) => {
  try {
    const {
      company_name,
      job_title,
      status = 'Applied',
      job_type = 'Full-time',
      work_mode = 'Remote',
      location,
      salary_min,
      salary_max,
      salary_currency = 'USD',
      application_url,
      description,
      applied_date,
      deadline_date,
      resume_id,
    } = req.body;

    if (!company_name || !job_title) {
      return res.status(400).json({
        success: false,
        message: 'Company name and job title are required.',
      });
    }

    // Find or create company
    const company = await findOrCreateCompany(company_name);

    const insertRes = await db.query(
      `INSERT INTO applications (
        user_id, company_id, resume_id, job_title, status, job_type, work_mode,
        location, salary_min, salary_max, salary_currency, application_url,
        description, applied_date, deadline_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        req.user.id,
        company.id,
        resume_id || null,
        job_title.trim(),
        status || 'Applied',
        job_type || 'Full-time',
        work_mode || 'Remote',
        location || null,
        salary_min ? parseInt(salary_min, 10) : null,
        salary_max ? parseInt(salary_max, 10) : null,
        salary_currency || 'USD',
        application_url || null,
        description || null,
        applied_date || new Date().toISOString().split('T')[0],
        deadline_date || null,
      ]
    );

    const newApp = insertRes.rows[0];

    return res.status(201).json({
      success: true,
      message: 'Application logged successfully.',
      application: {
        ...newApp,
        company_name: company.name,
        company_website: company.website,
        company_logo: company.logo_url,
      },
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/v1/applications/:id
const updateApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      company_name,
      job_title,
      status,
      job_type,
      work_mode,
      location,
      salary_min,
      salary_max,
      salary_currency,
      application_url,
      description,
      applied_date,
      deadline_date,
      resume_id,
    } = req.body;

    // Check ownership
    const existingRes = await db.query('SELECT * FROM applications WHERE id = $1', [id]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    const app = existingRes.rows[0];
    if (app.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    let companyId = app.company_id;
    if (company_name && company_name.trim() !== '') {
      const comp = await findOrCreateCompany(company_name);
      companyId = comp.id;
    }

    const updateRes = await db.query(
      `UPDATE applications SET
        company_id = $1,
        resume_id = $2,
        job_title = COALESCE($3, job_title),
        status = COALESCE($4, status),
        job_type = COALESCE($5, job_type),
        work_mode = COALESCE($6, work_mode),
        location = $7,
        salary_min = $8,
        salary_max = $9,
        salary_currency = COALESCE($10, salary_currency),
        application_url = $11,
        description = $12,
        applied_date = $13,
        deadline_date = $14,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $15
       RETURNING *`,
      [
        companyId,
        resume_id !== undefined ? (resume_id || null) : app.resume_id,
        job_title ? job_title.trim() : null,
        status || null,
        job_type || null,
        work_mode || null,
        location !== undefined ? location : app.location,
        salary_min !== undefined ? (salary_min ? parseInt(salary_min, 10) : null) : app.salary_min,
        salary_max !== undefined ? (salary_max ? parseInt(salary_max, 10) : null) : app.salary_max,
        salary_currency || null,
        application_url !== undefined ? application_url : app.application_url,
        description !== undefined ? description : app.description,
        applied_date !== undefined ? applied_date : app.applied_date,
        deadline_date !== undefined ? deadline_date : app.deadline_date,
        id,
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Application updated successfully.',
      application: updateRes.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/applications/:id
const deleteApplication = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await db.query('SELECT user_id FROM applications WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    if (existing.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    await db.query('DELETE FROM applications WHERE id = $1', [id]);

    return res.status(200).json({
      success: true,
      message: 'Application deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/applications/:id/notes
const addNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Note content cannot be empty.' });
    }

    const appRes = await db.query('SELECT user_id FROM applications WHERE id = $1', [id]);
    if (appRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }
    if (appRes.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const noteRes = await db.query(
      `INSERT INTO notes (application_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, application_id, user_id, content, created_at`,
      [id, req.user.id, content.trim()]
    );

    return res.status(201).json({
      success: true,
      message: 'Note added successfully.',
      note: {
        ...noteRes.rows[0],
        author_name: req.user.full_name,
      },
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/applications/:id/notes/:noteId
const deleteNote = async (req, res, next) => {
  try {
    const { id, noteId } = req.params;

    const noteRes = await db.query('SELECT user_id FROM notes WHERE id = $1 AND application_id = $2', [noteId, id]);
    if (noteRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }
    if (noteRes.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    await db.query('DELETE FROM notes WHERE id = $1', [noteId]);

    return res.status(200).json({
      success: true,
      message: 'Note deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  addNote,
  deleteNote,
};
