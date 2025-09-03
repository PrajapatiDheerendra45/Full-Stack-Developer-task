const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  submissionId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  studentId: { 
    type: String, 
    required: true 
  },
  assignmentId: { 
    type: String, 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  status: {
    type: String,
    enum: ['queued', 'running', 'completed', 'failed'],
    default: 'queued'
  },
  score: { 
    type: Number, 
    min: 0, 
    max: 100 
  },
  feedback: { 
    type: String 
  },
  submittedAt: { 
    type: Date, 
    default: Date.now 
  },
  completedAt: { 
    type: Date 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Submission', submissionSchema);
