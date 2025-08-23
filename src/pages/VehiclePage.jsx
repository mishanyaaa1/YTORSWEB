import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaShoppingCart, FaCheckCircle, FaTimesCircle, FaCar, FaGasPump, FaCogs, FaUserFriends, FaWeight, FaRulerCombined, FaCalendarAlt } from 'react-icons/fa';
import { useCartActions } from '../hooks/useCartActions';
import { resolveImageSrc } from '../utils/imageHelpers';
import BrandMark from '../components/BrandMark';
import Reveal from '../components/Reveal';
import { createApiUrl, fetchConfig } from '../config/api';
import './VehiclePage.css';

function VehiclePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { addToCartWithNotification } = useCartActions();

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await fetch(createApiUrl(`/api/vehicles/${id}`), fetchConfig);
        if (!response.ok) {
          throw new Error('Вездеход не найден');
        }
        const data = await response.json();
        setVehicle(data);
        setLoading(false);
      } catch (error) {
        console.error('Ошибка загрузки вездехода:', error);
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  const handleAddToCart = () => {
    if (vehicle) {
      addToCartWithNotification({
        id: `vehicle_${vehicle.id}`,
        title: vehicle.title,
        price: vehicle.price,
        type: 'vehicle'
      });
    }
  };

  const getImageUrl = (imageData) => {
    if (!imageData) return null;
    const resolved = typeof imageData === 'string' ? resolveImageSrc(imageData) : null;
    if (
      (typeof imageData === 'string' && imageData.startsWith('data:image')) ||
      resolved
    ) {
      return resolved || imageData;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="vehicle-page">
        <div className="container">
          <div className="loading-placeholder">
            <div className="loading-spinner"></div>
            <p>Загрузка...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="vehicle-page">
        <div className="container">
          <div className="not-found">
            <FaCar className="not-found-icon" />
            <h2>Вездеход не найден</h2>
            <p>К сожалению, запрашиваемый вездеход не найден</p>
            <button onClick={() => navigate('/vehicles')} className="back-button">
              <FaArrowLeft /> Вернуться к каталогу
            </button>
          </div>
        </div>
      </div>
    );
  }

  const images = vehicle.images || [];
  const currentImage = images[selectedImageIndex];
  const currentImageUrl = currentImage ? getImageUrl(currentImage.data) : null;

  return (
    <div className="vehicle-page">
      <div className="container">
        <Reveal type="up">
          <button onClick={() => navigate('/vehicles')} className="back-button">
            <FaArrowLeft /> Назад к каталогу
          </button>
        </Reveal>

        <div className="vehicle-content">
          <div className="vehicle-images-section">
            <Reveal type="left">
              <div className="main-image">
                {currentImageUrl ? (
                  <img
                    src={currentImageUrl}
                    alt={vehicle.title}
                    className="vehicle-main-image"
                  />
                ) : (
                  <div className="image-placeholder">
                    <BrandMark alt={vehicle.title} style={{ height: 120 }} />
                  </div>
                )}
              </div>
            </Reveal>

            {images.length > 1 && (
              <Reveal type="up" delay={0.1}>
                <div className="image-thumbnails">
                  {images.map((image, index) => {
                    const thumbUrl = getImageUrl(image.data);
                    return (
                      <button
                        key={image.id}
                        className={`thumbnail ${index === selectedImageIndex ? 'active' : ''}`}
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        {thumbUrl ? (
                          <img src={thumbUrl} alt={`${vehicle.title} ${index + 1}`} />
                        ) : (
                          <BrandMark alt={vehicle.title} style={{ height: 40 }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </Reveal>
            )}
          </div>

          <div className="vehicle-info-section">
            <Reveal type="right">
              <div className="vehicle-header">
                {vehicle.featured && (
                  <div className="featured-badge">
                    🌟 Рекомендуем
                  </div>
                )}
                <h1 className="vehicle-title">{vehicle.title}</h1>
                {vehicle.brand && (
                  <div className="vehicle-brand">Бренд: {vehicle.brand}</div>
                )}
              </div>
            </Reveal>

            <Reveal type="right" delay={0.1}>
              <div className="vehicle-price">
                <span className="price">{vehicle.price.toLocaleString()} ₽</span>
              </div>
            </Reveal>

            <Reveal type="right" delay={0.2}>
              <div className="vehicle-availability">
                {vehicle.available ? (
                  <span className="in-stock">
                    <FaCheckCircle /> В наличии
                  </span>
                ) : (
                  <span className="out-of-stock">
                    <FaTimesCircle /> Под заказ
                  </span>
                )}
              </div>
            </Reveal>

            <Reveal type="right" delay={0.3}>
              <div className="vehicle-specs">
                <h3>Характеристики</h3>
                <div className="specs-grid">
                  {vehicle.year && (
                    <div className="spec-item">
                      <FaCalendarAlt className="spec-icon" />
                      <span className="spec-label">Год выпуска:</span>
                      <span className="spec-value">{vehicle.year}</span>
                    </div>
                  )}
                  
                  {vehicle.enginePower && (
                    <div className="spec-item">
                      <FaCogs className="spec-icon" />
                      <span className="spec-label">Мощность:</span>
                      <span className="spec-value">{vehicle.enginePower} л.с.</span>
                    </div>
                  )}
                  
                  {vehicle.engineVolume && (
                    <div className="spec-item">
                      <FaCogs className="spec-icon" />
                      <span className="spec-label">Объем двигателя:</span>
                      <span className="spec-value">{vehicle.engineVolume} л</span>
                    </div>
                  )}
                  
                  {vehicle.fuelType && (
                    <div className="spec-item">
                      <FaGasPump className="spec-icon" />
                      <span className="spec-label">Тип топлива:</span>
                      <span className="spec-value">{vehicle.fuelType}</span>
                    </div>
                  )}
                  
                  {vehicle.transmission && (
                    <div className="spec-item">
                      <FaCogs className="spec-icon" />
                      <span className="spec-label">Трансмиссия:</span>
                      <span className="spec-value">{vehicle.transmission}</span>
                    </div>
                  )}
                  
                  {vehicle.driveType && (
                    <div className="spec-item">
                      <FaCar className="spec-icon" />
                      <span className="spec-label">Привод:</span>
                      <span className="spec-value">{vehicle.driveType}</span>
                    </div>
                  )}
                  
                  {vehicle.seats && (
                    <div className="spec-item">
                      <FaUserFriends className="spec-icon" />
                      <span className="spec-label">Мест:</span>
                      <span className="spec-value">{vehicle.seats}</span>
                    </div>
                  )}
                  
                  {vehicle.weight && (
                    <div className="spec-item">
                      <FaWeight className="spec-icon" />
                      <span className="spec-label">Вес:</span>
                      <span className="spec-value">{vehicle.weight} кг</span>
                    </div>
                  )}
                  
                  {vehicle.dimensions && (
                    <div className="spec-item">
                      <FaRulerCombined className="spec-icon" />
                      <span className="spec-label">Габариты:</span>
                      <span className="spec-value">{vehicle.dimensions}</span>
                    </div>
                  )}
                </div>
              </div>
            </Reveal>

            {vehicle.description && (
              <Reveal type="right" delay={0.4}>
                <div className="vehicle-description">
                  <h3>Описание</h3>
                  <p>{vehicle.description}</p>
                </div>
              </Reveal>
            )}

            {vehicle.features && vehicle.features.length > 0 && (
              <Reveal type="right" delay={0.5}>
                <div className="vehicle-features">
                  <h3>Особенности</h3>
                  <ul>
                    {vehicle.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            )}

            <Reveal type="right" delay={0.6}>
              <div className="vehicle-actions">
                <button
                  className="add-to-cart-btn"
                  onClick={handleAddToCart}
                  disabled={!vehicle.available}
                >
                  <FaShoppingCart />
                  Добавить в корзину
                </button>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VehiclePage;
