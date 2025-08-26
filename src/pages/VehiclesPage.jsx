import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaTruck, FaCog, FaSnowflake, FaMountain, FaWater, FaRoad, FaFilter, FaTimes, FaCheckCircle, FaTimesCircle, FaShoppingCart } from 'react-icons/fa';
import Reveal from '../components/Reveal';
import { useAdminData } from '../context/AdminDataContext';
import { useCartActions } from '../hooks/useCartActions';
import { migrateProductImages, getMainImage } from '../utils/imageHelpers';
import './VehiclesPage.css';
import '../Catalog.css';

function VehiclesPage() {
  const { vehicles } = useAdminData();
  const navigate = useNavigate();
  const { addToCartWithNotification } = useCartActions();
  const [selectedType, setSelectedType] = useState('Все');
  const [selectedTerrain, setSelectedTerrain] = useState('Все');
  const [priceRange, setPriceRange] = useState([0, 0]);

  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const handleVehicleClick = (vehicle) => {
    navigate(`/vehicle/${vehicle.id}`);
  };

  const handleAddToCart = (vehicle, e) => {
    e.stopPropagation(); // Предотвращаем всплытие события клика по карточке
    const migratedVehicle = migrateProductImages(vehicle);
    const mainImage = getMainImage(migratedVehicle);
    const cartItem = {
      id: vehicle.id,
      title: vehicle.name,
      price: vehicle.price,
      image: mainImage?.data || null,
      type: 'vehicle',
      brand: vehicle.type,
      available: vehicle.available
    };
    addToCartWithNotification(cartItem, 1);
  };

  const vehicleTypes = ['Все', 'Гусеничный', 'Колесный', 'Плавающий'];
  const terrainTypes = ['Все', 'Снег', 'Болото', 'Вода', 'Горы', 'Лес', 'Пустыня'];

  // Фильтрация вездеходов
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesType = selectedType === 'Все' || vehicle.type === selectedType;
    const matchesTerrain = selectedTerrain === 'Все' || vehicle.terrain === selectedTerrain;
    const matchesPrice = vehicle.price >= priceRange[0] && (priceRange[1] === 0 || vehicle.price <= priceRange[1]);
    return matchesType && matchesTerrain && matchesPrice;
  });

  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(filteredVehicles.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedVehicles = filteredVehicles.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const resetFilters = () => {
    setSelectedType('Все');
    setSelectedTerrain('Все');
    setPriceRange([0, 0]);
    setCurrentPage(1);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  return (
    <div className="vehicles-page">
      <div className="container">
        <Reveal type="up">
          <div className="vehicles-header">
            <h1>Готовые вездеходы</h1>
            <p>Профессиональные вездеходы для любых условий эксплуатации</p>
          </div>
        </Reveal>

        <div className="catalog-wrapper">
          <aside className="catalog-filters">
            <h3>Фильтры</h3>
            


            <div className="filter-group">
              <label>Тип вездехода</label>
              <select 
                value={selectedType} 
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setCurrentPage(1);
                }}
              >
                {vehicleTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Тип местности</label>
              <select 
                value={selectedTerrain} 
                onChange={(e) => {
                  setSelectedTerrain(e.target.value);
                  setCurrentPage(1);
                }}
              >
                {terrainTypes.map(terrain => (
                  <option key={terrain} value={terrain}>{terrain}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Цена, ₽</label>
              <div className="price-range">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="От"
                  value={priceRange[0] || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setPriceRange([parseInt(value) || 0, priceRange[1]]);
                    setCurrentPage(1);
                  }}
                />
                <span>-</span>
                                 <input
                   type="text"
                   inputMode="numeric"
                   pattern="[0-9]*"
                   placeholder="До"
                   value={priceRange[1] || ''}
                   onChange={(e) => {
                     const value = e.target.value.replace(/\D/g, '');
                     setPriceRange([priceRange[0], parseInt(value) || 0]);
                     setCurrentPage(1);
                   }}
                 />
              </div>
            </div>

            <div className="filter-actions">
              <button onClick={resetFilters} className="catalog-reset-btn">
                Сбросить фильтры
              </button>
            </div>
          </aside>

          <main className="catalog-main">
            <div className="catalog-grid">
            {paginatedVehicles.length > 0 ? (
              paginatedVehicles.map((vehicle, index) => (
                <div
                  key={vehicle.id}
                  className="catalog-card"
                  onClick={() => handleVehicleClick(vehicle)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="catalog-card-image">
                    {(() => {
                      const migratedVehicle = migrateProductImages(vehicle);
                      const mainImage = getMainImage(migratedVehicle);
                      
                      if (mainImage?.data && 
                          typeof mainImage.data === 'string' && 
                          (mainImage.data.startsWith('data:image') || mainImage.data.startsWith('http') || mainImage.data.startsWith('/uploads'))) {
                        return <img src={mainImage.data} alt={vehicle.name} className="catalog-product-image" />;
                      }
                      return (
                        <div className="vehicle-placeholder">
                          <FaTruck />
                        </div>
                      );
                    })()}

                  </div>
                  
                  <div className="catalog-card-info">
                    <h3>{vehicle.name}</h3>
                    <div className="catalog-card-price">{formatPrice(vehicle.price)} ₽</div>
                    <div className="catalog-card-meta">
                      <span className={vehicle.available ? 'in-stock' : 'out-of-stock'}>
                        {vehicle.available ? <FaCheckCircle /> : <FaTimesCircle />} {vehicle.available ? 'В наличии' : 'Нет в наличии'}
                      </span>
                    </div>
                    <button 
                      className="catalog-card-btn"
                      onClick={(e) => handleAddToCart(vehicle, e)}
                      disabled={!vehicle.available}
                    >
                      <FaShoppingCart /> В корзину
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-vehicles">
                <FaTruck />
                <h3>Вездеходы не найдены</h3>
                <p>Попробуйте изменить параметры фильтрации</p>
                <button onClick={resetFilters} className="catalog-reset-btn">
                  Сбросить фильтры
                </button>
              </div>
            )}
            </div>

            {filteredVehicles.length > 0 && (
            <div className="catalog-pagination">
              <div className="pagination-info">
                Показано {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredVehicles.length)} из {filteredVehicles.length} вездеходов
              </div>
              
              {totalPages > 1 && (
                <div className="pagination-controls">
                  <button 
                    className="pagination-btn prev-btn"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Предыдущая страница"
                  >
                    ←
                  </button>
                  
                  <div className="pagination-pages">
                    {Array.from({ length: totalPages }, (_, index) => {
                      const pageNumber = index + 1;
                      // Показываем первые 3 страницы, последние 3 страницы и текущую страницу с соседними
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            className={`pagination-page ${pageNumber === currentPage ? 'active' : ''}`}
                            onClick={() => setCurrentPage(pageNumber)}
                          >
                            {pageNumber}
                          </button>
                        );
                      } else if (
                        pageNumber === currentPage - 2 ||
                        pageNumber === currentPage + 2
                      ) {
                        return <span key={pageNumber} className="pagination-ellipsis">...</span>;
                      }
                      return null;
                    })}
                  </div>
                  
                  <button 
                    className="pagination-btn next-btn"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          )}
          </main>
        </div>
      </div>

      
    </div>
  );
}

export default VehiclesPage;
