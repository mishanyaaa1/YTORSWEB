import React from 'react';
import { motion } from 'framer-motion';

/**
 * Универсальный компонент анимации появления при прокрутке.
 * Пример:
 *   <Reveal type="up" delay={0.1}><div>Контент</div></Reveal>
 */
function Reveal({
  children,
  type = 'up', // 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade'
  delay = 0,
  duration = 0.6,
  once = true,
  className = '',
  style
}) {
  const base = { opacity: 0 };

  const initial = (() => {
    switch (type) {
      case 'down':
        return { ...base, y: -30 };
      case 'left':
        return { ...base, x: -30 };
      case 'right':
        return { ...base, x: 30 };
      case 'scale':
        return { ...base, scale: 0.95 };
      case 'fade':
        return { ...base };
      case 'up':
      default:
        return { ...base, y: 30 };
    }
  })();

  const animate = { opacity: 1, x: 0, y: 0, scale: 1 };

  return (
    <motion.div
      className={className}
      style={style}
      initial={initial}
      whileInView={animate}
      viewport={{ once, margin: '0px 0px -80px 0px' }}
      transition={{ duration, delay }}
    >
      {children}
    </motion.div>
  );
}

export default Reveal;


