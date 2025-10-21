import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'purple' | 'orange';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'blue', 
  text = 'Loading...' 
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16', 
    lg: 'h-24 w-24'
  };

  const colorClasses = {
    blue: 'border-blue-600',
    green: 'border-green-600',
    purple: 'border-purple-600',
    orange: 'border-orange-600'
  };

  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <div className={`animate-spin rounded-full border-b-4 ${colorClasses[color]} ${sizeClasses[size]} mx-auto mb-4`}></div>
        <p className="text-gray-600 font-semibold">{text}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;