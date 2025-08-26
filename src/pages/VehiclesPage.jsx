import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaTruck, FaCog, FaSnowflake, FaMountain, FaWater, FaRoad, FaSearch, FaFilter, FaTimes, FaCheckCircle, FaTimesCircle, FaShoppingCart } from 'react-icons/fa';
import Reveal from '../components/Reveal';
import { useAdminData } from '../context/AdminDataContext';
import { useCartActions } from '../hooks/useCartActions';
import './VehiclesPage.css';
import '../Catalog.css';

function VehiclesPage() {
  const { vehicles } = useAdminData();
  const navigate = useNavigate();
  const { addToCartWithNotification } = useCartActions();
  const [selectedType, setSelectedType] = useState('Все');
  const [selectedTerrain, setSelectedTerrain] = useState('Все');
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const handleVehicleClick = (vehicle) => {
    navigate(`/vehicle/${vehicle.id}`);
  };

  const handleAddToCart = (vehicle, e) => {
    e.stopPropagation(); // Предотвращаем всплытие события клика по карточке
    const cartItem = {
      id: vehicle.id,
      title: vehicle.name,
      price: vehicle.price,
      image: vehicle.image,
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
    const matchesPrice = vehicle.price >= priceRange[0] && vehicle.price <= priceRange[1];
    const matchesSearch = vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vehicle.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesType && matchesTerrain && matchesPrice && matchesSearch;
  });

  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(filteredVehicles.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedVehicles = filteredVehicles.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const resetFilters = () => {
    setSelectedType('Все');
    setSelectedTerrain('Все');
    setPriceRange([0, 5000000]);
    setSearchQuery('');
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

        <Reveal type="up" delay={0.1}>
          <div className="vehicles-controls">
            <div className="search-section">
              <div className="search-input-wrapper">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Поиск вездеходов..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
              <button 
                className="filter-toggle-btn"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FaFilter />
                Фильтры
              </button>
            </div>

            {showFilters && (
              <motion.div 
                className="filters-panel"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="filters-header">
                  <h3>Фильтры</h3>
                  <button 
                    className="close-filters-btn"
                    onClick={() => setShowFilters(false)}
                  >
                    <FaTimes />
                  </button>
                </div>
                
                <div className="filters-content">
                  <div className="filter-group">
                    <label>Тип вездехода:</label>
                    <select 
                      value={selectedType} 
                      onChange={(e) => setSelectedType(e.target.value)}
                    >
                      {vehicleTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>Тип местности:</label>
                    <select 
                      value={selectedTerrain} 
                      onChange={(e) => setSelectedTerrain(e.target.value)}
                    >
                      {terrainTypes.map(terrain => (
                        <option key={terrain} value={terrain}>{terrain}</option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>Диапазон цен:</label>
                    <div className="price-inputs">
                      <input
                        type="number"
                        placeholder="От"
                        value={priceRange[0] || ''}
                        onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                      />
                      <span>-</span>
                      <input
                        type="number"
                        placeholder="До"
                        value={priceRange[1] || ''}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 5000000])}
                      />
                    </div>
                  </div>

                  <button className="reset-filters-btn" onClick={resetFilters}>
                    Сбросить фильтры
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </Reveal>

        <Reveal type="up" delay={0.2}>
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
                    <div className="vehicle-placeholder">
                      <FaTruck />
                    </div>
                    <div className="vehicle-badge">{vehicle.type}</div>
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
                <button onClick={resetFilters} className="reset-filters-btn">
                  Сбросить фильтры
                </button>
              </div>
            )}
          </div>
        </Reveal>

        {totalPages > 1 && (
          <Reveal type="up" delay={0.3}>
            <div className="pagination">
              <button 
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Назад
              </button>
              
              <div className="pagination-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button 
                className="pagination-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Вперед
              </button>
            </div>
          </Reveal>
        )}
      </div>

      
    </div>
  );
}

export default VehiclesPage;
