
import React from 'react';
import { motion } from 'framer-motion';

interface Heart3DProps {
  intensity: number; // 0 to 1
}

const Heart3D: React.FC<Heart3DProps> = ({ intensity }) => {
  const baseScale = 1;
  const pulseScale = 1 + (intensity * 0.2);
  const color = intensity > 0.7 ? '#ef4444' : intensity > 0.4 ? '#f59e0b' : '#10b981';

  return (
    <div className="relative flex items-center justify-center w-[280px] h-[280px] md:w-96 md:h-96">
      {/* Background Glow */}
      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2 - (intensity * 1.5),
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute w-64 h-64 md:w-80 md:h-80 rounded-full blur-3xl"
        style={{ backgroundColor: color }}
      />

      {/* Heart SVG */}
      <motion.svg
        viewBox="0 0 24 24"
        className="w-64 h-64 md:w-80 md:h-80 drop-shadow-[0_0_40px_rgba(239,68,68,0.5)]"
        animate={{
          scale: [baseScale, pulseScale, baseScale],
        }}
        transition={{
          duration: 2 - (intensity * 1.5),
          repeat: Infinity,
          ease: "easeOut"
        }}
      >
        <path
          fill={color}
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        />
      </motion.svg>
    </div>
  );
};

export default Heart3D;
