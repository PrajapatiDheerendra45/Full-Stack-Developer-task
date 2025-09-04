import React, { useState, useEffect } from 'react';

const StatusView = ({ submissionId, onBackToSubmit }) => {
  const [inputId, setInputId] = useState(submissionId || '');
  const [submission, setSubmission] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [pollingInterval, setPollingInterval] = useState(null);
  const [pollAttempts, setPollAttempts] = useState(0);

  const MAX_POLL_ATTEMPTS = 10;

  // Start polling when submissionId changes
  useEffect(() => {
    if (submissionId && submissionId.trim()) {
      checkStatus(submissionId);
      startPolling(submissionId);
    }
    
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [submissionId]);

  const startPolling = (id) => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    setPollAttempts(0);
    const interval = setInterval(() => {
      setPollAttempts((prev) => {
        if (prev + 1 >= MAX_POLL_ATTEMPTS) {
          clearInterval(interval);
          setPollingInterval(null);
          setError('Stopped auto-refresh after too many attempts.');
          return prev;
        }
        checkStatus(id);
        return prev + 1;
      });
    }, 30000); // 30 seconds
    setPollingInterval(interval);
  };

  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  const checkStatus = async (id) => {
    if (!id || !id.trim()) {
      setError('Please enter a submission ID');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:5000/api/submissions/${id.trim()}`);
      if (response.status === 429) {
        setError('Too many requests. Please wait before trying again.');
        stopPolling();
        return;
      }
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch submission status');
      }

      setSubmission(data);
      
      // Stop polling if submission is completed or failed
      if (data.status === 'completed' || data.status === 'failed') {
        stopPolling();
      }
      
    } catch (error) {
      setError(error.message);
      setSubmission(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckStatus = () => {
    if (inputId.trim()) {
      checkStatus(inputId);
      startPolling(inputId);
    }
  };

  const handleInputChange = (e) => {
    setInputId(e.target.value);
    if (error) setError('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCheckStatus();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'queued':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'queued':
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      case 'running':
        return (
          <svg className="h-5 w-5 animate-spin" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        );
      case 'completed':
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'failed':
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-green-700">
          <h2 className="text-2xl font-bold text-white">
            Check Submission Status
          </h2>
          <p className="text-green-100 mt-1">
            Monitor your assignment grading progress and view results
          </p>
        </div>

        <div className="p-6">
          {/* Search Form */}
          <div className="mb-8">
            <div className="flex space-x-4">
              <div className="flex-1">
                <label htmlFor="submissionId" className="block text-sm font-medium text-gray-700 mb-2">
                  Submission ID
                </label>
                <input
                  type="text"
                  id="submissionId"
                  value={inputId}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your submission ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleCheckStatus}
                  disabled={isLoading || !inputId.trim()}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Checking...' : 'Check Status'}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* Submission Details */}
          {submission && (
            <div className="space-y-6">
              {/* Status Card */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Submission Details</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      ID: {submission.submissionId}
                    </p>
                  </div>
                  <div className={`flex items-center px-3 py-1 rounded-full border ${getStatusColor(submission.status)}`}>
                    {getStatusIcon(submission.status)}
                    <span className="ml-2 text-sm font-medium capitalize">
                      {submission.status}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Student ID</p>
                    <p className="text-sm text-gray-900">{submission.studentId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Assignment ID</p>
                    <p className="text-sm text-gray-900">{submission.assignmentId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Submitted At</p>
                    <p className="text-sm text-gray-900">{formatDate(submission.submittedAt)}</p>
                  </div>
                  {submission.completedAt && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Completed At</p>
                      <p className="text-sm text-gray-900">{formatDate(submission.completedAt)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Results Card */}
              {submission.status === 'completed' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-green-800">Grading Complete!</h3>
                      <div className="mt-2">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{submission.score}/100</p>
                            <p className="text-sm text-green-600">Score</p>
                          </div>
                          <div className="text-sm text-green-700">
                            <p className="font-medium">Feedback:</p>
                            <p className="mt-1">{submission.feedback}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Failed Status */}
              {submission.status === 'failed' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-red-800">Grading Failed</h3>
                      <p className="mt-1 text-sm text-red-700">{submission.feedback}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Polling Status */}
              {pollingInterval && submission.status !== 'completed' && submission.status !== 'failed' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="animate-spin h-5 w-5 text-blue-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm text-blue-700">
                      Auto-refreshing every 30 seconds...
                    </span>
                    <button
                      onClick={stopPolling}
                      className="ml-auto text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Stop auto-refresh
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={onBackToSubmit}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              ← Back to Submit
            </button>
            
            {submission && (
              <button
                onClick={() => {
                  setSubmission(null);
                  setInputId('');
                  setError('');
                  stopPolling();
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Clear Results
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusView;
