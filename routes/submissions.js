const express = require('express');
const multer = require('multer');
const SubmissionController = require('../controllers/submissionController');
const config = require('../config');

const router = express.Router();

// File upload configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/plain', 'text/markdown'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only .txt and .md files are allowed'));
    }
  }
});

// Routes
router.post('/', upload.single('file'), SubmissionController.createSubmission);
router.get('/:id', SubmissionController.getSubmission);

module.exports = router;
