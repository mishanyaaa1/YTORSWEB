import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaShoppingCart, FaFilter, FaTimes, FaSearch } from 'react-icons/fa';
import { useCartActions } from './hooks/useCartActions';
import { useAdminData } from './context/AdminDataContext';
import { migrateProductImages, getMainImage, isImageUrl } from './utils/imageHelpers';
import BrandMark from './components/BrandMark';
import './Catalog.css';

export default function Catalog() {
  const { products, categories, brands } = useAdminData();
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [selectedSubcategory, setSelectedSubcategory] = useState('Все');
  const [selectedBrand, setSelectedBrand] = useState('Все');
  const [priceRange, setPriceRange] = useState([0, 1000000000]);
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');
  const [inStock, setInStock] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { addToCartWithNotification } = useCartActions();

  // Создаем список категорий и брендов
  const categoryList = ['Все', ...Object.keys(categories)];
  const brandList = ['Все', ...brands];

  const minPrice = 0;
  const maxPrice = 1000000000; // верхняя граница по умолчанию (1 млрд)

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
    setSelectedCategory('Все');
    setSelectedSubcategory('Все');
    setSelectedBrand('Все');
    setPriceRange([minPrice, maxPrice]);
    setMinPriceInput('');
    setMaxPriceInput('');
    setInStock(false);
    setSearchQuery('');
  };

  // Получаем подкатегории для выбранной категории
  const availableSubcategories = selectedCategory === 'Все' 
    ? [] 
    : ['Все', ...(categories[selectedCategory] || [])];

  // Сброс подкатегории при смене основной категории
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedSubcategory('Все');
  };

  const filteredProducts = products.filter((product) => {
    const byCategory = selectedCategory === 'Все' || product.category === selectedCategory;
    const bySubcategory = selectedSubcategory === 'Все' || product.subcategory === selectedSubcategory;
    const byBrand = selectedBrand === 'Все' || product.brand === selectedBrand;
    const byPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const byStock = !inStock || product.available;
    const bySearch = !searchQuery || 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return byCategory && bySubcategory && byBrand && byPrice && byStock && bySearch;
  });

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCartWithNotification(product);
  };

  return (
    <div className="catalog">
      {/* Поиск и фильтры */}
      <div className="catalog-controls">
        <div className="search-section">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Поиск по названию или описанию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <button 
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter />
            Фильтры
            {showFilters ? <FaTimes /> : null}
          </button>
        </div>

        {/* Фильтры */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filters-grid">
              {/* Категории */}
              <div className="filter-group">
                <label className="filter-label">Категория</label>
                <div className="filter-options">
                  {categoryList.map((category) => (
                    <button
                      key={category}
                      className={`filter-option ${selectedCategory === category ? 'active' : ''}`}
                      onClick={() => handleCategoryChange(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Подкатегории */}
              {availableSubcategories.length > 0 && (
                <div className="filter-group">
                  <label className="filter-label">Подкатегория</label>
                  <div className="filter-options">
                    {availableSubcategories.map((subcategory) => (
                      <button
                        key={subcategory}
                        className={`filter-option ${selectedSubcategory === subcategory ? 'active' : ''}`}
                        onClick={() => setSelectedSubcategory(subcategory)}
                      >
                        {subcategory}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Бренды */}
              <div className="filter-group">
                <label className="filter-label">Бренд</label>
                <div className="filter-options">
                  {brandList.map((brand) => (
                    <button
                      key={brand}
                      className={`filter-option ${selectedBrand === brand ? 'active' : ''}`}
                      onClick={() => setSelectedBrand(brand)}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              {/* Цена */}
              <div className="filter-group">
                <label className="filter-label">Цена</label>
                <div className="price-inputs">
                  <input
                    type="text"
                    placeholder="От"
                    value={minPriceInput}
                    onChange={handleMinPriceChange}
                    onBlur={normalizeMinOnBlur}
                    className="price-input"
                  />
                  <span className="price-separator">—</span>
                  <input
                    type="text"
                    placeholder="До"
                    value={maxPriceInput}
                    onChange={handleMaxPriceChange}
                    onBlur={normalizeMaxOnBlur}
                    className="price-input"
                  />
                </div>
              </div>

              {/* Наличие */}
              <div className="filter-group">
                <label className="filter-label">Наличие</label>
                <div className="stock-filter">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={inStock}
                      onChange={(e) => setInStock(e.target.checked)}
                      className="checkbox-input"
                    />
                    <span className="checkbox-custom"></span>
                    Только в наличии
                  </label>
                </div>
              </div>
            </div>

            <div className="filters-actions">
              <button className="reset-filters" onClick={resetFilters}>
                Сбросить фильтры
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Результаты поиска */}
      <div className="catalog-results">
        <div className="results-header">
          <h3>Найдено товаров: {filteredProducts.length}</h3>
          {filteredProducts.length === 0 && (
            <p className="no-results">По вашему запросу ничего не найдено. Попробуйте изменить параметры поиска.</p>
          )}
        </div>

        {/* Сетка товаров */}
        {filteredProducts.length > 0 && (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  {(() => {
                    const mainImage = getMainImage(product);
                    if (mainImage?.data) {
                      const resolved = typeof mainImage.data === 'string' ? mainImage.data : null;
                      if (
                        (typeof mainImage.data === 'string' && mainImage.data.startsWith('data:image')) ||
                        resolved
                      ) {
                        return (
                          <img
                            src={resolved || mainImage.data}
                            alt={product.title}
                            className="product-image-img"
                          />
                        );
                      }
                    }
                    return (
                      <span className="product-icon">
                        <BrandMark alt={product.title} style={{ height: 48 }} />
                      </span>
                    );
                  })()}
                  
                  {/* Индикатор наличия */}
                  <div className={`stock-indicator ${product.available ? 'in-stock' : 'out-of-stock'}`}>
                    {product.available ? <FaCheckCircle /> : <FaTimesCircle />}
                  </div>
                </div>

                <div className="product-info">
                  <h3 className="product-title">{product.title}</h3>
                  <p className="product-description">{product.description}</p>
                  <div className="product-meta">
                    <span className="product-category">{product.category}</span>
                    {product.brand && <span className="product-brand">{product.brand}</span>}
                  </div>
                  <div className="product-price">{product.price.toLocaleString()} ₽</div>
                  
                  <div className="product-actions">
                    <Link to={`/product/${product.id}`} className="product-button">
                      Подробнее
                    </Link>
                    {product.available && (
                      <button
                        className="add-to-cart-button"
                        onClick={(e) => handleAddToCart(product, e)}
                        title="Добавить в корзину"
                      >
                        <FaShoppingCart />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
