import { useState, useEffect } from 'react';

const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  sizes = '100vw',
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setImageSrc(src);
  }, [src]);

  // Generate srcSet for responsive images
  const generateSrcSet = () => {
    const widths = [320, 640, 768, 1024, 1280];
    return widths
      .map(w => `${getOptimizedImageUrl(src, w)} ${w}w`)
      .join(', ');
  };

  // Function to get optimized image URL (you can customize this based on your image service)
  const getOptimizedImageUrl = (url, width) => {
    // If using a CDN or image optimization service, modify the URL here
    // For now, we'll just return the original URL
    return url;
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setImageSrc('/images/placeholder.jpg'); // Fallback image
  };

  return (
    <div className={`relative ${className}`} style={{ aspectRatio: width / height }}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
      <img
        src={imageSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        sizes={sizes}
        srcSet={generateSrcSet()}
        {...props}
      />
    </div>
  );
};

export default OptimizedImage; 