import React, { useState } from 'react';
import SubmitView from './components/SubmitView';
import StatusView from './components/StatusView';

function App() {
  const [currentView, setCurrentView] = useState('submit');
  const [submissionId, setSubmissionId] = useState('');

  const handleSubmissionSuccess = (id) => {
    setSubmissionId(id);
    setCurrentView('status');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">AutoGrader</h1>
          <p className="text-gray-600 mt-1">Assignment Submission System</p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setCurrentView('submit')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                currentView === 'submit'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Submit Assignment
            </button>
            <button
              onClick={() => setCurrentView('status')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                currentView === 'status'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Check Status
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4">
        {currentView === 'submit' ? (
          <SubmitView onSubmissionSuccess={handleSubmissionSuccess} />
        ) : (
          <StatusView 
            submissionId={submissionId} 
            onBackToSubmit={() => setCurrentView('submit')}
          />
        )}
      </main>
    </div>
  );
}

export default App;
