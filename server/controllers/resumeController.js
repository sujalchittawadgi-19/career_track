const fs = require('fs');
const path = require('path');
const db = require('../config/db');

// POST /api/v1/resumes
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No resume file uploaded. Please select a PDF file.',
      });
    }

    const { tag = 'General' } = req.body;
    const { originalname, filename, path: filePath, size, mimetype } = req.file;

    const insertRes = await db.query(
      `INSERT INTO resumes (user_id, file_name, file_path, file_size_bytes, mime_type, tag)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.id, originalname, filename, size, mimetype || 'application/pdf', tag || 'General']
    );

    return res.status(201).json({
      success: true,
      message: 'Resume PDF uploaded and validated successfully.',
      resume: insertRes.rows[0],
    });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(err);
  }
};

// GET /api/v1/resumes
const getUserResumes = async (req, res, next) => {
  try {
    const resumesRes = await db.query(
      `SELECT 
        r.*,
        (SELECT COUNT(*)::int FROM applications a WHERE a.resume_id = r.id) AS applications_linked
       FROM resumes r
       WHERE r.user_id = $1
       ORDER BY r.uploaded_at DESC`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      resumes: resumesRes.rows,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/resumes/:id/download
const downloadResume = async (req, res, next) => {
  try {
    const { id } = req.params;

    const resumeRes = await db.query('SELECT * FROM resumes WHERE id = $1', [id]);
    if (resumeRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Resume document not found.' });
    }

    const resume = resumeRes.rows[0];
    if (resume.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const fullPath = path.join(__dirname, '..', 'uploads', resume.file_path);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ success: false, message: 'Physical resume file not found on server storage.' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${resume.file_name}"`);
    return fs.createReadStream(fullPath).pipe(res);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/resumes/:id
const deleteResume = async (req, res, next) => {
  try {
    const { id } = req.params;

    const resumeRes = await db.query('SELECT * FROM resumes WHERE id = $1', [id]);
    if (resumeRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    const resume = resumeRes.rows[0];
    if (resume.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Delete file from disk
    const fullPath = path.join(__dirname, '..', 'uploads', resume.file_path);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    // Remove DB record (FK set null on applications)
    await db.query('DELETE FROM resumes WHERE id = $1', [id]);

    return res.status(200).json({
      success: true,
      message: 'Resume deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadResume,
  getUserResumes,
  downloadResume,
  deleteResume,
};
