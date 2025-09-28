import React from 'react';

const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      
      <div className="card p-8 text-center">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            User Settings
          </h3>
          <p className="text-gray-600 mb-4">
            Manage your account preferences, theme settings, and application configuration.
          </p>
          <p className="text-sm text-gray-500">
            Feature implementation in progress...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;