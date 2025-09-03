import React, { useState } from 'react';

const SubmitView = ({ onSubmissionSuccess }) => {
  const [formData, setFormData] = useState({
    studentId: '',
    assignmentId: '',
    content: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, content: '' }));
      setSelectedFile(file);
      setError('');
    }
  };

  const handleTextChange = (e) => {
    setFormData(prev => ({ ...prev, content: e.target.value }));
    if (selectedFile) setSelectedFile(null);
  };

  const validateForm = () => {
    if (!formData.studentId.trim() || !formData.assignmentId.trim()) {
      setError('Student ID and Assignment ID are required');
      return false;
    }
    if (!selectedFile && !formData.content.trim()) {
      setError('Either upload a file or enter text content');
      return false;
    }
    if (formData.content.length > 10000) {
      setError('Text content cannot exceed 10,000 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('studentId', formData.studentId.trim());
      formDataToSend.append('assignmentId', formData.assignmentId.trim());

      if (selectedFile) {
        formDataToSend.append('file', selectedFile);
      } else {
        formDataToSend.append('content', formData.content.trim());
      }

      const response = await fetch('http://localhost:5000/api/submissions', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      setSuccessMessage(`Submission successful! ID: ${data.submissionId}`);
      
      // Clear form and auto-navigate
      setFormData({ studentId: '', assignmentId: '', content: '' });
      setSelectedFile(null);
      
      setTimeout(() => {
        onSubmissionSuccess(data.submissionId);
      }, 2000);

    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="px-6 py-4 bg-blue-600">
        <h2 className="text-xl font-bold text-white">Submit Assignment</h2>
      </div>

      <div className="p-6">
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student ID *
            </label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your student ID"
              disabled={isSubmitting}
            />
          </div>

          {/* Assignment ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignment ID *
            </label>
            <input
              type="text"
              name="assignmentId"
              value={formData.assignmentId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter assignment ID"
              disabled={isSubmitting}
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload File (Optional)
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".txt,.md"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700"
              disabled={isSubmitting}
            />
            {selectedFile && (
              <p className="mt-1 text-sm text-gray-600">Selected: {selectedFile.name}</p>
            )}
          </div>

          {/* Text Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text Content (Optional if file uploaded)
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleTextChange}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your assignment content here..."
              disabled={isSubmitting || selectedFile}
            />
            <p className="mt-1 text-sm text-gray-500">
              Characters: {formData.content.length}/10,000
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitView;
