const express = require('express');
const submissionRoutes = require('./submissions');
const SubmissionController = require('../controllers/submissionController');

const router = express.Router();

// Health check route
router.get('/healthz', SubmissionController.healthCheck);

// Submission routes
router.use('/submissions', submissionRoutes);

module.exports = router;
