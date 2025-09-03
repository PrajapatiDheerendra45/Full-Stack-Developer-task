module.exports = {
  // Server Configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // MongoDB Configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://vrshrms:Praja%40123@vrshrms.se1r9ns.mongodb.net/vrs',
  
  // Security Configuration
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || 900000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  
  // File Upload Configuration
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 1048576, // 1MB
  MAX_CONTENT_LENGTH: process.env.MAX_CONTENT_LENGTH || 10000, // 10KB
  
  // Grading Configuration
  GRADING_DELAY_MIN: 1000, // 1 second
  GRADING_DELAY_MAX: 3000, // 3 seconds
};
