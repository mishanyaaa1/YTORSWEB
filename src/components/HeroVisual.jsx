import React from 'react';
import { motion } from 'framer-motion';

export default function HeroVisual() {
  return (
    <motion.svg 
      className="hero-visual-svg"
      viewBox="0 0 400 300"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1 }}
    >
      <rect x="50" y="100" width="300" height="100" fill="#21262d" rx="10" />
      <circle cx="100" cy="150" r="30" fill="#58a6ff" />
      <circle cx="300" cy="150" r="30" fill="#58a6ff" />
      <line x1="130" y1="150" x2="270" y2="150" stroke="#30363d" strokeWidth="4" />
      <text x="200" y="160" textAnchor="middle" fill="#c9d1d9" fontSize="20" dy=".35em">
        ВЕЗДЕХОД
      </text>
    </motion.svg>
  );
}


