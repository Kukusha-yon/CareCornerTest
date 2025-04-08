import React from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <ArrowPathIcon className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};

export default LoadingSpinner; 