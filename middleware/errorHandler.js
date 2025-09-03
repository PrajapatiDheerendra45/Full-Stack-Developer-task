const errorHandler = (error, req, res, next) => {
  console.error('Error:', error);

  // Multer errors
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'File too large. Maximum 1MB allowed.'
    });
  }

  // Multer file type errors
  if (error.message === 'Only .txt and .md files are allowed') {
    return res.status(400).json({
      error: error.message
    });
  }

  // Default error
  res.status(500).json({
    error: 'Internal server error'
  });
};

module.exports = errorHandler;
