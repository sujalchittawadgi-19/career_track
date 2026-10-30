const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const { authenticate } = require('../middleware/authMiddleware');
const { uploadResumeFile, validatePdfMagicBytes } = require('../middleware/uploadMiddleware');

router.use(authenticate);

router.post('/', uploadResumeFile, validatePdfMagicBytes, resumeController.uploadResume);
router.get('/', resumeController.getUserResumes);
router.get('/:id/download', resumeController.downloadResume);
router.delete('/:id', resumeController.deleteResume);

module.exports = router;
