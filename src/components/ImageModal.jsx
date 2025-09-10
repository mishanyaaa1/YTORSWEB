import React, { useEffect } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import './ImageModal.css';

const ImageModal = ({ 
  isOpen, 
  onClose, 
  images, 
  currentIndex, 
  onPrevious, 
  onNext,
  productTitle 
}) => {
  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Блокируем скролл
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !images || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="image-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          <motion.div
            className="image-modal-content"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Кнопка закрытия */}
            <button 
              className="image-modal-close"
              onClick={onClose}
              aria-label="Закрыть"
            >
              <span className="close-icon">×</span>
            </button>

            {/* Навигация */}
            {images.length > 1 && (
              <>
                <button 
                  className="image-modal-nav image-modal-prev"
                  onClick={onPrevious}
                  aria-label="Предыдущее изображение"
                >
                  <FaChevronLeft />
                </button>
                <button 
                  className="image-modal-nav image-modal-next"
                  onClick={onNext}
                  aria-label="Следующее изображение"
                >
                  <FaChevronRight />
                </button>
              </>
            )}

            {/* Изображение */}
            <div className="image-modal-image-container">
              <motion.img
                key={currentIndex}
                src={currentImage.data}
                alt={`${productTitle} - изображение ${currentIndex + 1}`}
                className="image-modal-image"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Счетчик изображений */}
            {images.length > 1 && (
              <div className="image-modal-counter">
                {currentIndex + 1} / {images.length}
              </div>
            )}

            {/* Миниатюры */}
            {images.length > 1 && (
              <div className="image-modal-thumbnails">
                {images.map((image, index) => (
                  <button
                    key={index}
                    className={`image-modal-thumbnail ${currentIndex === index ? 'active' : ''}`}
                    onClick={() => {
                      // Переключение на выбранное изображение
                      const event = new CustomEvent('imageModalNavigate', { 
                        detail: { index } 
                      });
                      window.dispatchEvent(event);
                    }}
                  >
                    <img 
                      src={image.data} 
                      alt={`${productTitle} - миниатюра ${index + 1}`}
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageModal;
