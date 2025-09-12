import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCheckCircle, FaTimesCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { migrateProductImages, getAllImages, isImageUrl } from '../utils/imageHelpers';
import BrandMark from './BrandMark';
import ImageModal from './ImageModal';
import './ProductModal.css';

function ProductModal({ product, isOpen, onClose }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  // Мигрируем и получаем все изображения товара
  const migratedProduct = product ? migrateProductImages(product) : null;
  let allImages = migratedProduct ? getAllImages(migratedProduct) || [] : [];
  
  // Дополнительная проверка: если изображения не найдены, пробуем получить их напрямую
  if (allImages.length === 0 && product) {
    console.log('ProductModal: Изображения не найдены, пробуем альтернативные способы');
    
    // Проверяем поле images
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      allImages = product.images;
      console.log('ProductModal: Найдены изображения в product.images:', allImages);
    }
    // Проверяем поле image
    else if (product.image) {
      allImages = [{ data: product.image, isMain: true }];
      console.log('ProductModal: Найдено изображение в product.image:', allImages);
    }
    // Для вездеходов проверяем специфичные поля
    else if (product.type === 'vehicle' || product.category === 'Вездеходы') {
      // Пробуем найти изображения в других полях
      const possibleImageFields = ['mainImage', 'photo', 'picture', 'img'];
      for (const field of possibleImageFields) {
        if (product[field]) {
          allImages = [{ data: product[field], isMain: true }];
          console.log(`ProductModal: Найдено изображение в product.${field}:`, allImages);
          break;
        }
      }
    }
  }
  
  // Отладочная информация
  useEffect(() => {
    if (product) {
      console.log('ProductModal: Получен товар:', product);
      console.log('ProductModal: Мигрированный товар:', migratedProduct);
      console.log('ProductModal: Все изображения:', allImages);
    }
  }, [product, migratedProduct, allImages]);
  
  // Безопасность: убеждаемся что selectedImageIndex в пределах массива
  const safeSelectedIndex = Math.max(0, Math.min(selectedImageIndex, allImages.length - 1));

  // Сброс состояния при смене товара
  useEffect(() => {
    if (product) {
      setSelectedImageIndex(0);
      setIsImageModalOpen(false);
      setModalImageIndex(0);
    }
  }, [product]);

  // Обработчики для модального окна изображений
  const handleImageClick = () => {
    if (allImages && allImages.length > 0 && allImages[safeSelectedIndex]) {
      setModalImageIndex(safeSelectedIndex);
      setIsImageModalOpen(true);
    }
  };

  const handleCloseImageModal = () => {
    setIsImageModalOpen(false);
  };

  const handlePreviousImage = () => {
    if (allImages && allImages.length > 0) {
      setModalImageIndex(modalImageIndex === 0 ? allImages.length - 1 : modalImageIndex - 1);
    }
  };

  const handleNextImage = () => {
    if (allImages && allImages.length > 0) {
      setModalImageIndex(modalImageIndex === allImages.length - 1 ? 0 : modalImageIndex + 1);
    }
  };

  // Обработчик навигации по миниатюрам в модальном окне
  useEffect(() => {
    const handleImageModalNavigate = (event) => {
      setModalImageIndex(event.detail.index);
    };

    window.addEventListener('imageModalNavigate', handleImageModalNavigate);
    return () => {
      window.removeEventListener('imageModalNavigate', handleImageModalNavigate);
    };
  }, []);

  // Нормализация характеристик: поддержка как объекта, так и массива [{name, value}]
  const specsArray = product ? (
    Array.isArray(product?.specifications)
      ? (product.specifications || []).filter(s => s && (s.name || s.value))
      : (product?.specifications && typeof product.specifications === 'object')
        ? Object.entries(product.specifications).map(([name, value]) => ({ name, value }))
        : []
  ) : [];

  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="product-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="product-modal"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Заголовок модального окна */}
            <div className="modal-header">
              <h2>{product.title || product.name}</h2>
              <button className="close-btn" onClick={onClose}>
                <FaTimes />
              </button>
            </div>

            {/* Основное содержимое */}
            <div className="modal-content">
              <div className="product-content">
                <div className="product-images">
                  <div className="main-image">
                    <motion.div 
                      className="image-container"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                      onClick={handleImageClick}
                      style={{ cursor: 'pointer' }}
                    >
                      {allImages && allImages.length > 0 && allImages[safeSelectedIndex] ? (
                        allImages[safeSelectedIndex].data && (
                          allImages[safeSelectedIndex].data.startsWith('data:image') ||
                          isImageUrl(allImages[safeSelectedIndex].data)
                        ) ? (
                          <img
                            src={allImages[safeSelectedIndex].data}
                            alt={product.title || product.name}
                            className="product-main-image"
                          />
                        ) : (
                          <span className="product-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BrandMark alt={product.title || product.name} style={{ height: 200 }} />
                          </span>
                        )
                      ) : (
                        <span className="product-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <BrandMark alt={product.title || product.name} style={{ height: 200 }} />
                        </span>
                      )}
                    </motion.div>
                    
                    {allImages && allImages.length > 1 && (
                      <div className="image-navigation">
                        <button 
                          className="nav-button prev"
                          onClick={() => setSelectedImageIndex(selectedImageIndex === 0 ? allImages.length - 1 : selectedImageIndex - 1)}
                          disabled={!allImages || allImages.length <= 1}
                        >
                          <FaChevronLeft />
                        </button>
                        <button 
                          className="nav-button next"
                          onClick={() => setSelectedImageIndex(selectedImageIndex === allImages.length - 1 ? 0 : selectedImageIndex + 1)}
                          disabled={!allImages || allImages.length <= 1}
                        >
                          <FaChevronRight />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {allImages && allImages.length > 1 && (
                    <div className="image-thumbnails">
                      {allImages.map((image, index) => (
                        <button
                          key={index}
                          className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                          onClick={() => setSelectedImageIndex(index)}
                        >
                          {image && image.data && (
                            image.data.startsWith('data:image') || isImageUrl(image.data)
                          ) ? (
                            <img src={image.data} alt={`${product.title || product.name} ${index + 1}`} />
                          ) : (
                            <span className="product-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <BrandMark alt={product.title || product.name} style={{ height: 40 }} />
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="product-info">
                  <div className="product-header">
                    <h1>{product.title || product.name}</h1>
                  </div>

                  <div className="product-meta">
                    {product.brand && product.brand.trim() && <span className="brand">{product.brand}</span>}
                    <span className="category">{product.category || product.type}</span>
                    <span className={`availability ${product.available ? 'in-stock' : 'out-of-stock'}`}>
                      {product.available ? <FaCheckCircle /> : <FaTimesCircle />}
                      {product.available ? `В наличии: ${product.quantity || product.inStock || 0} шт` : 'Нет в наличии'}
                    </span>
                  </div>

                  <div className="product-description">
                    {(() => {
                      if (product.description && product.description.includes('\n')) {
                        return product.description.split('\n').map((line, index) => (
                          <p key={index} style={{ margin: index > 0 ? '0.05em 0 0 0' : '0' }}>
                            {line}
                          </p>
                        ));
                      }
                      return <p>{product.description}</p>;
                    })()}
                  </div>

                  <div className="product-price">
                    <span className="current-price">{(product.price || 0).toLocaleString()} ₽</span>
                    {product.originalPrice && (
                      <span className="original-price">{product.originalPrice.toLocaleString()} ₽</span>
                    )}
                  </div>

                  {product.features && product.features.length > 0 && (
                    <div className="product-features">
                      <h3>Преимущества:</h3>
                      <ul>
                        {product.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {specsArray.length > 0 && (
                <div className="product-specifications">
                  <h3>Технические характеристики</h3>
                  <div className="specs-grid">
                    {specsArray.map((spec, idx) => (
                      <div key={idx} className="spec-item">
                        <span className="spec-label">{spec.name}:</span>
                        <span className="spec-value">{String(spec.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Модальное окно для полноэкранного просмотра изображений */}
            {allImages && allImages.length > 0 && (
              <ImageModal
                isOpen={isImageModalOpen}
                onClose={handleCloseImageModal}
                images={allImages}
                currentIndex={modalImageIndex}
                onPrevious={handlePreviousImage}
                onNext={handleNextImage}
                productTitle={product.title || product.name}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ProductModal;
