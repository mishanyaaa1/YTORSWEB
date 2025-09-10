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
              <h2>{vehicle.name}</h2>
              <button className="close-btn" onClick={onClose}>
                <FaTimes />
              </button>
            </div>

            {/* Основное содержимое */}
            <div className="modal-content">
              {/* Изображение и основная информация */}
              <div className="vehicle-main-info">
                <div className="vehicle-image-large">
                  <div className="vehicle-placeholder-large">
                    <FaTruck />
                  </div>
                  <div className="vehicle-badge-large">{vehicle.type}</div>
                </div>
                
                <div className="vehicle-info-summary">
                  <div className="vehicle-price-large">
                    <span className="price-large">{formatPrice(vehicle.price)} ₽</span>
                  </div>
                  
                  <div className="vehicle-terrain-large">
                    <span className="terrain-badge-large">
                      {getTerrainIcon(vehicle.terrain)}
                      {vehicle.terrain}
                    </span>
                  </div>
                  
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
              <div className="vehicle-specs-detailed">
                <h3>Технические характеристики</h3>
                <div className="specs-grid">
                  <div className="spec-item-detailed">
                    <FaCog className="spec-icon" />
                    <div className="spec-content">
                      <span className="spec-label">Двигатель</span>
                      <span className="spec-value">{vehicle.specs.engine}</span>
                    </div>
                  </div>
                  
                  <div className="spec-item-detailed">
                    <FaMountain className="spec-icon" />
                    <div className="spec-content">
                      <span className="spec-label">Вес</span>
                      <span className="spec-value">{vehicle.specs.weight}</span>
                    </div>
                  </div>
                  
                  <div className="spec-item-detailed">
                    <FaSnowflake className="spec-icon" />
                    <div className="spec-content">
                      <span className="spec-label">Вместимость</span>
                      <span className="spec-value">{vehicle.specs.capacity}</span>
                    </div>
                  </div>
                  
                  <div className="spec-item-detailed">
                    <FaRoad className="spec-icon" />
                    <div className="spec-content">
                      <span className="spec-label">Максимальная скорость</span>
                      <span className="spec-value">{vehicle.specs.maxSpeed}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Дополнительная информация */}
              <div className="vehicle-additional-info">
                <div className="info-item">
                  <span className="info-label">Наличие:</span>
                  <span className={`info-value ${vehicle.available ? 'available' : 'unavailable'}`}>
                    {vehicle.available ? 'В наличии' : 'Нет в наличии'}
                  </span>
                </div>
                
                {vehicle.available && (
                  <div className="info-item">
                    <span className="info-label">Количество:</span>
                    <span className="info-value">{vehicle.quantity} шт.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="modal-actions">
              <button className="action-btn primary">
                Заказать
              </button>
              <button className="action-btn secondary">
                Связаться с менеджером
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default VehicleModal;
