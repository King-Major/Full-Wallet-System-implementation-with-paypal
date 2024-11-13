import React from 'react';

const Alert = ({ children, className = '' }) => (
  <div
    role="alert"
    className={`rounded-lg border bg-white p-4 shadow-sm ${className}`}
  >
    {children}
  </div>
);

const AlertDescription = ({ children, className = '' }) => (
  <div className={`text-sm text-gray-600 ${className}`}>
    {children}
  </div>
);

export { Alert, AlertDescription };