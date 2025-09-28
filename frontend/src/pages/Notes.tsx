import React from 'react';

const Notes: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Notes</h1>
        <button className="btn-primary">
          New Note
        </button>
      </div>
      
      <div className="card p-8 text-center">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Notes Management
          </h3>
          <p className="text-gray-600 mb-4">
            This is where you'll manage all your notes. Create, edit, organize, and collaborate on notes.
          </p>
          <p className="text-sm text-gray-500">
            Feature implementation in progress...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Notes;