import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function ParticleBackground() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Создаем частицы с разными характеристиками
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 2 + 0.5,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.5 + 0.2
    }));
    setParticles(newParticles);
  }, []);

  const particleVariants = {
    animate: (custom) => ({
      y: [0, -100, 0],
      x: [0, Math.random() * 20 - 10, 0],
      opacity: [0, custom.opacity, 0],
      scale: [0, 1, 0],
      transition: {
        duration: 8 + custom.speed * 2,
        repeat: Infinity,
        delay: custom.delay,
        ease: "easeInOut"
      }
    })
  };

  return (
    <div className="particle-background">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity
          }}
          custom={particle}
          variants={particleVariants}
          animate="animate"
        />
      ))}
      
      {/* Дополнительные декоративные элементы */}
      <motion.div
        className="floating-orb"
        style={{ left: '10%', top: '20%' }}
        animate={{
          y: [-20, 20, -20],
          rotate: [0, 180, 360],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="floating-orb"
        style={{ left: '85%', top: '60%' }}
        animate={{
          y: [20, -20, 20],
          rotate: [360, 180, 0],
          scale: [1, 0.8, 1]
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="floating-orb"
        style={{ left: '60%', top: '80%' }}
        animate={{
          y: [-15, 15, -15],
          rotate: [0, 360, 0],
          scale: [0.8, 1.1, 0.8]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}
