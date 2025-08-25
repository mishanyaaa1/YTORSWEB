import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaTruck, FaCog, FaSnowflake, FaMountain, FaWater, FaRoad, FaSearch, FaFilter, FaTimes, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Reveal from '../components/Reveal';
import { useAdminData } from '../context/AdminDataContext';
import './VehiclesPage.css';

function VehiclesPage() {
  const { vehicles } = useAdminData();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('Все');
  const [selectedTerrain, setSelectedTerrain] = useState('Все');
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const handleVehicleClick = (vehicle) => {
    navigate(`/vehicle/${vehicle.id}`);
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
          <div className="vehicles-grid">
            {paginatedVehicles.length > 0 ? (
              paginatedVehicles.map((vehicle, index) => (
                <motion.div
                  key={vehicle.id}
                  className="vehicle-card"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  onClick={() => handleVehicleClick(vehicle)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="vehicle-image">
                    <div className="vehicle-placeholder">
                      <FaTruck />
                    </div>
                    <div className="vehicle-badge">{vehicle.type}</div>
                  </div>
                  
                  <div className="vehicle-content">
                    <h3 className="vehicle-name">{vehicle.name}</h3>
                    <div className="vehicle-price">{formatPrice(vehicle.price)} ₽</div>
                    <div className="vehicle-category">
                      <span className="category">{vehicle.type}</span>
                      <span className="subcategory"> → {vehicle.terrain}</span>
                    </div>
                                         <div className="vehicle-meta">
                       <span className="vehicle-type">{vehicle.type}</span>
                       <span className={vehicle.available ? 'in-stock' : 'out-of-stock'}>
                         {vehicle.available ? <FaCheckCircle /> : <FaTimesCircle />} {vehicle.available ? 'В наличии' : 'Нет в наличии'}
                       </span>
                     </div>
                    <button 
                      className="vehicle-card-btn"
                      onClick={(e) => {
                        e.stopPropagation(); // Предотвращаем всплытие события
                        handleVehicleClick(vehicle);
                      }}
                    >
                      Подробнее
                    </button>
                  </div>
                </motion.div>
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
