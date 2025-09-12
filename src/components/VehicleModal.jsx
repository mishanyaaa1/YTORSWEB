import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCog, FaSnowflake, FaMountain, FaWater, FaRoad, FaTruck } from 'react-icons/fa';
import './VehicleModal.css';

function VehicleModal({ vehicle, isOpen, onClose }) {
  if (!vehicle) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  const getTerrainIcon = (terrain) => {
    switch (terrain) {
      case 'Снег':
        return <FaSnowflake />;
      case 'Болото':
      case 'Вода':
        return <FaWater />;
      case 'Горы':
      case 'Лес':
        return <FaMountain />;
      case 'Пустыня':
        return <FaRoad />;
      default:
        return <FaTruck />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="vehicle-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="vehicle-modal"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Заголовок модального окна */}
            <div className="modal-header">
              <h2>{vehicle.name || vehicle.title}</h2>
              <button className="close-btn" onClick={onClose}>
                <FaTimes />
              </button>
            </div>

            {/* Основное содержимое */}
            <div className="modal-content">
              {/* Изображение и основная информация */}
              <div className="vehicle-main-info">
                <div className="vehicle-image-large">
                  {(() => {
                    // Пытаемся найти изображение товара
                    if (vehicle.images && vehicle.images.length > 0) {
                      const mainImage = vehicle.images.find(img => img.isMain) || vehicle.images[0];
                      if (mainImage && mainImage.data && 
                          (mainImage.data.startsWith('data:image') || 
                           mainImage.data.startsWith('/uploads/') || 
                           mainImage.data.startsWith('/img/vehicles/') || 
                           mainImage.data.startsWith('http'))) {
                        return <img src={mainImage.data} alt={vehicle.name || vehicle.title} className="vehicle-image-img" />;
                      }
                    }
                    // Если нет изображения, показываем иконку
                    return (
                      <div className="vehicle-placeholder-large">
                        <FaTruck />
                      </div>
                    );
                  })()}
                  <div className="vehicle-badge-large">{vehicle.type || vehicle.category}</div>
                </div>
                
                <div className="vehicle-info-summary">
                  <div className="vehicle-price-large">
                    <span className="price-large">{formatPrice(vehicle.price)} ₽</span>
                  </div>
                  
                  {((vehicle.terrain && vehicle.terrain.trim()) || (vehicle.brand && vehicle.brand.trim())) && (
                    <div className="vehicle-terrain-large">
                      <span className="terrain-badge-large">
                        {getTerrainIcon(vehicle.terrain || vehicle.brand)}
                        {vehicle.terrain || vehicle.brand}
                      </span>
                    </div>
                  )}
                  
                  <div className="vehicle-description-large">
                    {(() => {
                      if (vehicle.description && vehicle.description.includes('\n')) {
                        return vehicle.description.split('\n').map((line, index) => (
                          <p key={index} style={{ margin: index > 0 ? '0.05em 0 0 0' : '0' }}>
                            {line}
                          </p>
                        ));
                      }
                      return <p>{vehicle.description}</p>;
                    })()}
                  </div>
                </div>
              </div>

              {/* Технические характеристики */}
              {(vehicle.specs || vehicle.specifications) && (
                <div className="vehicle-specs-detailed">
                  <h3>Технические характеристики</h3>
                  <div className="specs-grid">
                    {(() => {
                      const specs = vehicle.specs || vehicle.specifications;
                      if (Array.isArray(specs)) {
                        return specs.map((spec, index) => (
                          <div key={index} className="spec-item-detailed">
                            <FaCog className="spec-icon" />
                            <div className="spec-content">
                              <span className="spec-label">{spec.name}</span>
                              <span className="spec-value">{spec.value}</span>
                            </div>
                          </div>
                        ));
                      } else if (typeof specs === 'object') {
                        return Object.entries(specs).map(([key, value], index) => (
                          <div key={index} className="spec-item-detailed">
                            <FaCog className="spec-icon" />
                            <div className="spec-content">
                              <span className="spec-label">{key}</span>
                              <span className="spec-value">{value}</span>
                            </div>
                          </div>
                        ));
                      }
                      return null;
                    })()}
                  </div>
                </div>
              )}

              {/* Дополнительная информация */}
              <div className="vehicle-additional-info">
                <div className="info-item">
                  <span className="info-label">Наличие:</span>
                  <span className={`info-value ${vehicle.available ? 'available' : 'unavailable'}`}>
                    {vehicle.available ? 'В наличии' : 'Нет в наличии'}
                  </span>
                </div>
                
                {vehicle.available && (vehicle.quantity || vehicle.inStock) && (
                  <div className="info-item">
                    <span className="info-label">Количество:</span>
                    <span className="info-value">{vehicle.quantity || vehicle.inStock} шт.</span>
                  </div>
                )}
              </div>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default VehicleModal;
