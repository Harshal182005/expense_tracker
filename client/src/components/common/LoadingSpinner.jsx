const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`${sizes[size]} border-4 border-blue-600 border-t-transparent rounded-full animate-spin ${className}`} />
  );
};

export const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <LoadingSpinner size="lg" />
  </div>
);

export const SkeletonCard = () => (
  <div className="card p-6 space-y-3">
    <div className="skeleton h-4 w-1/3" />
    <div className="skeleton h-8 w-1/2" />
    <div className="skeleton h-4 w-2/3" />
  </div>
);

export default LoadingSpinner;
