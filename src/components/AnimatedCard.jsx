import { motion } from 'framer-motion';
import { useState } from 'react';

export default function AnimatedCard({ 
  title, 
  description, 
  image, 
  price, 
  category,
  onClick,
  delay = 0 
}) {
  const [isHovered, setIsHovered] = useState(false);

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: delay * 0.1,
        ease: "easeOut"
      }
    },
    hover: {
      y: -10,
      scale: 1.05,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const imageVariants = {
    hover: {
      scale: 1.1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const contentVariants = {
    hover: {
      y: -5,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const badgeVariants = {
    hover: {
      scale: 1.1,
      rotate: [0, -5, 5, 0],
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      className="animated-card"
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      viewport={{ once: true, amount: 0.3 }}
    >
      {/* Бейдж категории */}
      <motion.div
        className="card-badge"
        variants={badgeVariants}
        whileHover="hover"
      >
        {category}
      </motion.div>

      {/* Изображение */}
      <motion.div
        className="card-image-container"
        variants={imageVariants}
        whileHover="hover"
      >
        <img 
          src={image} 
          alt={title}
          className="card-image"
        />
        <div className="card-image-overlay">
          <motion.div
            className="view-details"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            Посмотреть детали
          </motion.div>
        </div>
      </motion.div>

      {/* Контент */}
      <motion.div
        className="card-content"
        variants={contentVariants}
        whileHover="hover"
      >
        <h3 className="card-title">{title}</h3>
        <p className="card-description">{description}</p>
        
        <div className="card-footer">
          <motion.span
            className="card-price"
            initial={{ scale: 1 }}
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.3 }}
          >
            {price} ₽
          </motion.span>
          
          <motion.button
            className="card-button"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)"
            }}
            whileTap={{ scale: 0.95 }}
          >
            В корзину
          </motion.button>
        </div>
      </motion.div>

      {/* Декоративные элементы */}
      <motion.div
        className="card-decoration"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      <motion.div
        className="card-decoration secondary"
        animate={{
          rotate: [360, 0],
          scale: [1, 0.9, 1]
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </motion.div>
  );
}
