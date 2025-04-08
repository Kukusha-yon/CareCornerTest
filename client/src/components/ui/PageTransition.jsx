import { motion } from 'framer-motion';

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 20,
        mass: 0.8,
        duration: 0.4,
        opacity: { duration: 0.3 },
        y: { duration: 0.4 }
      }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition; 