import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const SmoothLink = ({ to, children, className, onClick, ...props }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
    
    // Prevent default navigation
    e.preventDefault();
    
    // Add a small delay for the animation
    setTimeout(() => {
      navigate(to);
    }, 100);
  };

  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="inline-block"
    >
      <Link
        to={to}
        onClick={handleClick}
        className={`relative inline-block ${className || ''}`}
        {...props}
      >
        {children}
        {isHovered && (
          <motion.span
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#39b54a]"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </Link>
    </motion.span>
  );
};

export default SmoothLink; 