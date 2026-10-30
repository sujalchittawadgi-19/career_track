const express = require('express');
const router = express.Router();
const appController = require('../controllers/appController');
const interviewController = require('../controllers/interviewController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

// Applications CRUD
router.get('/', appController.getApplications);
router.post('/', appController.createApplication);
router.get('/:id', appController.getApplicationById);
router.put('/:id', appController.updateApplication);
router.delete('/:id', appController.deleteApplication);

// Application Notes
router.post('/:id/notes', appController.addNote);
router.delete('/:id/notes/:noteId', appController.deleteNote);

// Application Interview attachment
router.post('/:id/interviews', interviewController.addInterview);

module.exports = router;
