// @/Components/Forge/DropAnimation.jsx - Subtle drop animation with glow
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DropAnimation = ({ componentId, triggerKey }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (triggerKey) {
      setShow(true);
      const timeout = setTimeout(() => setShow(false), 800);
      return () => clearTimeout(timeout);
    }
  }, [triggerKey]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-lg overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{ zIndex: 1 }}
      >
        {/* Subtle gradient glow behind element */}
        <motion.div
          className="absolute inset-0"
          initial={{ 
            background: 'radial-gradient(circle at center, var(--color-primary) 0%, transparent 70%)',
            opacity: 0,
            scale: 0.8
          }}
          animate={{ 
            opacity: [0, 0.3, 0],
            scale: [0.8, 1.2, 1]
          }}
          transition={{ 
            duration: 0.8,
            times: [0, 0.3, 1],
            ease: 'easeOut'
          }}
        />
        
        {/* Ring pulse effect */}
        <motion.div
          className="absolute inset-0 rounded-lg"
          style={{
            border: '2px solid var(--color-primary)',
            boxShadow: '0 0 20px var(--color-primary)'
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ 
            opacity: [0, 0.6, 0],
            scale: [0.9, 1.05, 1]
          }}
          transition={{ 
            duration: 0.6,
            times: [0, 0.4, 1],
            ease: 'easeOut'
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default DropAnimation;
