import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedWrapperProps {
  children: React.ReactNode;
  delay?: number;
}

const AnimatedWrapper: React.FC<AnimatedWrapperProps> = ({ children, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.25, 0.1, 0.25, 1.0], // Custom easing
      }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedWrapper; 