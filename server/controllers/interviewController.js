const db = require('../config/db');

// POST /api/v1/applications/:id/interviews
const addInterview = async (req, res, next) => {
  try {
    const { id: applicationId } = req.params;
    const {
      round_title,
      round_type = 'Technical',
      scheduled_at,
      meeting_link,
      interviewer_name,
      outcome = 'Pending',
      notes,
    } = req.body;

    if (!round_title || !scheduled_at) {
      return res.status(400).json({
        success: false,
        message: 'Round title and scheduled timestamp are required.',
      });
    }

    // Verify application ownership
    const appRes = await db.query('SELECT user_id, status FROM applications WHERE id = $1', [applicationId]);
    if (appRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    if (appRes.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Insert interview round
    const interviewRes = await db.query(
      `INSERT INTO interviews (
        application_id, round_title, round_type, scheduled_at, meeting_link,
        interviewer_name, outcome, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        applicationId,
        round_title.trim(),
        round_type,
        scheduled_at,
        meeting_link || null,
        interviewer_name || null,
        outcome || 'Pending',
        notes || null,
      ]
    );

    // Auto-transition parent application status to 'Interviewing' (as per PRD FR-03)
    if (appRes.rows[0].status !== 'Offer' && appRes.rows[0].status !== 'Accepted') {
      await db.query(
        `UPDATE applications SET status = 'Interviewing', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [applicationId]
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Interview round scheduled successfully and application moved to Interviewing.',
      interview: interviewRes.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/v1/interviews/:id
const updateInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      round_title,
      round_type,
      scheduled_at,
      meeting_link,
      interviewer_name,
      outcome,
      notes,
    } = req.body;

    // Verify ownership through joined application
    const checkRes = await db.query(
      `SELECT i.*, a.user_id 
       FROM interviews i 
       JOIN applications a ON i.application_id = a.id 
       WHERE i.id = $1`,
      [id]
    );

    if (checkRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Interview round not found.' });
    }

    if (checkRes.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const current = checkRes.rows[0];

    const updateRes = await db.query(
      `UPDATE interviews SET
        round_title = COALESCE($1, round_title),
        round_type = COALESCE($2, round_type),
        scheduled_at = COALESCE($3, scheduled_at),
        meeting_link = $4,
        interviewer_name = $5,
        outcome = COALESCE($6, outcome),
        notes = $7
       WHERE id = $8
       RETURNING *`,
      [
        round_title ? round_title.trim() : null,
        round_type || null,
        scheduled_at || null,
        meeting_link !== undefined ? meeting_link : current.meeting_link,
        interviewer_name !== undefined ? interviewer_name : current.interviewer_name,
        outcome || null,
        notes !== undefined ? notes : current.notes,
        id,
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Interview round updated successfully.',
      interview: updateRes.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/interviews/:id
const deleteInterview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const checkRes = await db.query(
      `SELECT i.id, a.user_id 
       FROM interviews i 
       JOIN applications a ON i.application_id = a.id 
       WHERE i.id = $1`,
      [id]
    );

    if (checkRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Interview not found.' });
    }

    if (checkRes.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    await db.query('DELETE FROM interviews WHERE id = $1', [id]);

    return res.status(200).json({
      success: true,
      message: 'Interview round deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/interviews/upcoming (Next 7 days for Dashboard & Alerts)
const getUpcomingInterviews = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days || '7', 10);

    const queryRes = await db.query(
      `SELECT 
        i.*,
        a.id AS application_id,
        a.job_title,
        a.status AS application_status,
        c.id AS company_id,
        c.name AS company_name,
        c.logo_url AS company_logo
       FROM interviews i
       JOIN applications a ON i.application_id = a.id
       JOIN companies c ON a.company_id = c.id
       WHERE a.user_id = $1 
         AND i.scheduled_at >= NOW() - INTERVAL '2 hours'
         AND i.scheduled_at <= NOW() + ($2 || ' days')::INTERVAL
       ORDER BY i.scheduled_at ASC`,
      [req.user.id, days]
    );

    return res.status(200).json({
      success: true,
      upcomingInterviews: queryRes.rows,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/interviews (All interviews with agenda & filters)
const getAllUserInterviews = async (req, res, next) => {
  try {
    const { outcome, type } = req.query;

    const conditions = ['a.user_id = $1'];
    const params = [req.user.id];
    let paramIndex = 2;

    if (outcome && outcome !== 'all') {
      conditions.push(`i.outcome = $${paramIndex}`);
      params.push(outcome);
      paramIndex++;
    }

    if (type && type !== 'all') {
      conditions.push(`i.round_type = $${paramIndex}`);
      params.push(type);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    const queryRes = await db.query(
      `SELECT 
        i.*,
        a.id AS application_id,
        a.job_title,
        a.status AS application_status,
        c.id AS company_id,
        c.name AS company_name,
        c.logo_url AS company_logo
       FROM interviews i
       JOIN applications a ON i.application_id = a.id
       JOIN companies c ON a.company_id = c.id
       WHERE ${whereClause}
       ORDER BY i.scheduled_at DESC`,
      params
    );

    return res.status(200).json({
      success: true,
      interviews: queryRes.rows,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addInterview,
  updateInterview,
  deleteInterview,
  getUpcomingInterviews,
  getAllUserInterviews,
};
