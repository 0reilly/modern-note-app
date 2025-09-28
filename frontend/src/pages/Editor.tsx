import React from 'react';
import { useParams } from 'react-router-dom';

const Editor: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Note Editor {id && `#${id}`}
        </h1>
      </div>
      
      <div className="card p-8 text-center">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Rich Text Editor
          </h3>
          <p className="text-gray-600 mb-4">
            This is where you'll edit your notes with our powerful rich text editor. 
            Features include real-time collaboration, formatting, and more.
          </p>
          <p className="text-sm text-gray-500">
            Feature implementation in progress...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Editor;