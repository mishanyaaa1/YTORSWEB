import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaShoppingCart, FaCar, FaGasPump, FaCogs, FaUserFriends, FaWeight, FaRulerCombined } from 'react-icons/fa';
import { useCartActions } from './hooks/useCartActions';
import { getMainImage, resolveImageSrc } from './utils/imageHelpers';
import BrandMark from './components/BrandMark';
import { createApiUrl, fetchConfig } from './config/api';
import './Vehicles.css';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState('Все');
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');
  const [inStock, setInStock] = useState(false);
  const [featured, setFeatured] = useState(false);
  const { addToCartWithNotification } = useCartActions();

  const minPrice = 0;
  const maxPrice = 10000000;

  // Загружаем данные о вездеходах
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch(createApiUrl('/api/vehicles'), fetchConfig);
        const data = await response.json();
        setVehicles(data);
        
        // Извлекаем уникальные бренды
        const uniqueBrands = [...new Set(data.map(v => v.brand).filter(Boolean))];
        setBrands(uniqueBrands);
        
        setLoading(false);
      } catch (error) {
        console.error('Ошибка загрузки вездеходов:', error);
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const brandList = ['Все', ...brands];

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const handleMinPriceChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    setMinPriceInput(raw);
    const num = raw === '' ? minPrice : parseInt(raw, 10);
    setPriceRange(([_, r]) => [clamp(num, minPrice, r), r]);
  };

  const handleMaxPriceChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    setMaxPriceInput(raw);
    const num = raw === '' ? maxPrice : parseInt(raw, 10);
    setPriceRange(([l, _]) => [l, clamp(num, l, maxPrice)]);
  };

  const normalizeMinOnBlur = () => {
    if (minPriceInput === '') {
      setPriceRange(([_, r]) => [minPrice, r]);
      return;
    }
    const num = parseInt(minPriceInput, 10);
    const clamped = clamp(isNaN(num) ? minPrice : num, minPrice, priceRange[1]);
    setMinPriceInput(String(clamped));
    setPriceRange(([_, r]) => [clamped, r]);
  };

  const normalizeMaxOnBlur = () => {
    if (maxPriceInput === '') {
      setPriceRange(([l, _]) => [l, maxPrice]);
      return;
    }
    const num = parseInt(maxPriceInput, 10);
    const clamped = clamp(isNaN(num) ? maxPrice : num, priceRange[0], maxPrice);
    setMaxPriceInput(String(clamped));
    setPriceRange(([l, _]) => [l, clamped]);
  };

  const resetFilters = () => {
    setSelectedBrand('Все');
    setPriceRange([minPrice, maxPrice]);
    setMinPriceInput('');
    setMaxPriceInput('');
    setInStock(false);
    setFeatured(false);
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const byBrand = selectedBrand === 'Все' || vehicle.brand === selectedBrand;
    const byPrice = vehicle.price >= priceRange[0] && vehicle.price <= priceRange[1];
    const byStock = !inStock || vehicle.available;
    const byFeatured = !featured || vehicle.featured;
    return byBrand && byPrice && byStock && byFeatured;
  });

  const handleAddToCart = (vehicle, e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCartWithNotification({
      id: `vehicle_${vehicle.id}`,
      title: vehicle.title,
      price: vehicle.price,
      type: 'vehicle'
    });
  };

  const getVehicleImage = (vehicle) => {
    const mainImage = vehicle.images?.find(img => img.isMain) || vehicle.images?.[0];
    if (mainImage?.data) {
      const resolved = typeof mainImage.data === 'string' ? resolveImageSrc(mainImage.data) : null;
      if (
        (typeof mainImage.data === 'string' && mainImage.data.startsWith('data:image')) ||
        resolved
      ) {
        return resolved || mainImage.data;
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="catalog">
        <div className="loading-placeholder">
          <div className="loading-spinner"></div>
          <p>Загрузка вездеходов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="catalog vehicles-catalog">
      <div className="catalog-filters">
        <div className="filter-group">
          <label>Бренд</label>
          <select 
            value={selectedBrand} 
            onChange={(e) => setSelectedBrand(e.target.value)}
          >
            {brandList.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>

        <div className="filter-group price-filter">
          <label>Цена</label>
          <div className="price-inputs">
            <input
              type="text"
              placeholder="От"
              value={minPriceInput}
              onChange={handleMinPriceChange}
              onBlur={normalizeMinOnBlur}
            />
            <span>—</span>
            <input
              type="text"
              placeholder="До"
              value={maxPriceInput}
              onChange={handleMaxPriceChange}
              onBlur={normalizeMaxOnBlur}
            />
          </div>
        </div>

        <div className="filter-group">
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={inStock} 
              onChange={(e) => setInStock(e.target.checked)}
            />
            Только в наличии
          </label>
        </div>

        <div className="filter-group">
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={featured} 
              onChange={(e) => setFeatured(e.target.checked)}
            />
            Рекомендуемые
          </label>
        </div>

        <button className="reset-filters-btn" onClick={resetFilters}>
          Сбросить фильтры
        </button>
      </div>

      <div className="catalog-content">
        <div className="catalog-header">
          <h2>Готовые вездеходы ({filteredVehicles.length})</h2>
        </div>

        {filteredVehicles.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">
              <FaCar />
            </div>
            <h3>Вездеходы не найдены</h3>
            <p>Попробуйте изменить параметры поиска</p>
            <button onClick={resetFilters}>Сбросить фильтры</button>
          </div>
        ) : (
          <div className="vehicles-grid">
            {filteredVehicles.map((vehicle) => {
              const imageUrl = getVehicleImage(vehicle);
              
              return (
                <Link 
                  key={vehicle.id} 
                  to={`/vehicle/${vehicle.id}`} 
                  className="vehicle-card"
                >
                  <div className="vehicle-card-header">
                    {vehicle.featured && (
                      <div className="featured-badge">
                        <span>🌟 Рекомендуем</span>
                      </div>
                    )}
                    <div className="vehicle-image">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={vehicle.title}
                          className="vehicle-image-img"
                        />
                      ) : (
                        <div className="vehicle-placeholder">
                          <BrandMark alt={vehicle.title} style={{ height: 64 }} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="vehicle-card-content">
                    <h3 className="vehicle-title">{vehicle.title}</h3>
                    
                    {vehicle.brand && (
                      <div className="vehicle-brand">Бренд: {vehicle.brand}</div>
                    )}

                    <div className="vehicle-specs">
                      {vehicle.year && (
                        <div className="spec-item">
                          <span className="spec-label">Год:</span>
                          <span>{vehicle.year}</span>
                        </div>
                      )}
                      
                      {vehicle.enginePower && (
                        <div className="spec-item">
                          <FaCogs className="spec-icon" />
                          <span>{vehicle.enginePower} л.с.</span>
                        </div>
                      )}
                      
                      {vehicle.fuelType && (
                        <div className="spec-item">
                          <FaGasPump className="spec-icon" />
                          <span>{vehicle.fuelType}</span>
                        </div>
                      )}
                      
                      {vehicle.seats && (
                        <div className="spec-item">
                          <FaUserFriends className="spec-icon" />
                          <span>{vehicle.seats} мест</span>
                        </div>
                      )}
                    </div>

                    <div className="vehicle-card-footer">
                      <div className="price-section">
                        <div className="price">{vehicle.price.toLocaleString()} ₽</div>
                      </div>

                      <div className="vehicle-actions">
                        <div className="stock-status">
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

                        <button 
                          className="add-to-cart-btn"
                          onClick={(e) => handleAddToCart(vehicle, e)}
                          disabled={!vehicle.available}
                        >
                          <FaShoppingCart />
                          Добавить в корзину
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
