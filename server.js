const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./db');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const config = require('./config');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS
});
app.use(limiter);

// Routes
app.use('/api', routes);

// 404 handler
app.use( (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);

});
