const { v4: uuidv4 } = require('uuid');
const Submission = require('../models/Submission');
const config = require('../config');

class SubmissionController {
  // Deterministic grading algorithm
  static gradeSubmission(content) {
    if (!content || content.trim().length === 0) {
      return { score: 0, feedback: 'Empty submission' };
    }
    
    const trimmedContent = content.trim();
    const wordCount = trimmedContent.split(/\s+/).length;
    
    // Base scoring based on content length
    let score = 0;
    let feedback = '';
    
    if (wordCount < 10) {
      score = 20;
      feedback = 'Very short submission. Consider adding more detail.';
    } else if (wordCount < 50) {
      score = 40;
      feedback = 'Short submission. Could benefit from more elaboration.';
    } else if (wordCount < 100) {
      score = 60;
      feedback = 'Adequate length. Good effort shown.';
    } else if (wordCount < 200) {
      score = 80;
      feedback = 'Good length and detail. Well done!';
    } else {
      score = 100;
      feedback = 'Excellent submission length and detail. Outstanding work!';
    }
    
    // Bonus points for good formatting
    if (trimmedContent.includes('\n\n')) {
      score = Math.min(100, score + 5);
      feedback += ' Good paragraph structure.';
    }
    
    // Penalty for very long submissions
    if (wordCount > 500) {
      score = Math.max(0, score - 10);
      feedback += ' Very long submission - consider being more concise.';
    }
    
    return { 
      score: Math.round(score), 
      feedback: feedback.trim() 
    };
  }

  // Process submission asynchronously
  static async processSubmission(submissionId) {
    try {
      // Update status to running
      await Submission.findOneAndUpdate(
        { submissionId },
        { status: 'running' }
      );
      
      // Simulate processing time
      const processingTime = Math.random() * 
        (config.GRADING_DELAY_MAX - config.GRADING_DELAY_MIN) + 
        config.GRADING_DELAY_MIN;
      
      await new Promise(resolve => setTimeout(resolve, processingTime));
      
      // Get submission content
      const submission = await Submission.findOne({ submissionId });
      if (!submission) {
        throw new Error('Submission not found');
      }
      
      // Grade the submission
      const { score, feedback } = SubmissionController.gradeSubmission(submission.content);
      
      // Update with results
      await Submission.findOneAndUpdate(
        { submissionId },
        {
          status: 'completed',
          score,
          feedback,
          completedAt: new Date()
        }
      );
      
      console.log(`✅ Graded submission ${submissionId}: ${score}/100`);
    } catch (error) {
      console.error(`❌ Error grading submission ${submissionId}:`, error);
      await Submission.findOneAndUpdate(
        { submissionId },
        {
          status: 'failed',
          feedback: 'Grading failed due to system error'
        }
      );
    }
  }

  // Create new submission
  static async createSubmission(req, res) {
    try {
      const { studentId, assignmentId } = req.body;
      let content = '';
      
      // Validate input
      if (!studentId || !assignmentId) {
        return res.status(400).json({
          error: 'Student ID and Assignment ID are required'
        });
      }
      
      if (studentId.trim().length === 0 || assignmentId.trim().length === 0) {
        return res.status(400).json({
          error: 'Student ID and Assignment ID cannot be empty'
        });
      }
      
      // Get content from file upload or text input
      if (req.file) {
        content = req.file.buffer.toString('utf8');
      } else if (req.body.content) {
        content = req.body.content;
      } else {
        return res.status(400).json({
          error: 'Either file upload or content text is required'
        });
      }
      
      // Validate content
      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          error: 'Content cannot be empty'
        });
      }
      
      if (content.length > config.MAX_CONTENT_LENGTH) {
        return res.status(413).json({
          error: `Content too large. Maximum ${config.MAX_CONTENT_LENGTH} characters allowed.`
        });
      }
      
      // Generate unique submission ID
      const submissionId = uuidv4();
      
      // Create submission
      const submission = new Submission({
        submissionId,
        studentId: studentId.trim(),
        assignmentId: assignmentId.trim(),
        content: content.trim(),
        status: 'queued'
      });
      
      await submission.save();
      
      // Start background grading process
      SubmissionController.processSubmission(submissionId);
      
      res.status(201).json({
        submissionId,
        message: 'Submission received and queued for grading'
      });
      
    } catch (error) {
      console.error('Error creating submission:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  // Get submission by ID
  static async getSubmission(req, res) {
    try {
      const { id } = req.params;
      
      const submission = await Submission.findOne({ submissionId: id });
      
      if (!submission) {
        return res.status(404).json({
          error: 'Submission not found'
        });
      }
      
      const response = {
        submissionId: submission.submissionId,
        studentId: submission.studentId,
        assignmentId: submission.assignmentId,
        status: submission.status,
        submittedAt: submission.submittedAt
      };
      
      if (submission.status === 'completed') {
        response.score = submission.score;
        response.feedback = submission.feedback;
        response.completedAt = submission.completedAt;
      } else if (submission.status === 'failed') {
        response.feedback = submission.feedback;
      }
      
      res.json(response);
      
    } catch (error) {
      console.error('Error fetching submission:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  // Health check
  static async healthCheck(req, res) {
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString() 
    });
  }
}

module.exports = SubmissionController;
