import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'default', className = '' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="flex items-center justify-center">
      <Loader2 
        className={`${sizeClasses[size]} animate-spin text-[#39b54a] ${className}`}
      />
    </div>
  );
};

export default LoadingSpinner; 