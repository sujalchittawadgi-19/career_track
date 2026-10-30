const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

// List upcoming 7-day rounds
router.get('/upcoming', interviewController.getUpcomingInterviews);

// List all rounds
router.get('/', interviewController.getAllUserInterviews);

// Update/delete specific round
router.put('/:id', interviewController.updateInterview);
router.delete('/:id', interviewController.deleteInterview);

module.exports = router;
