import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaShoppingBasket } from 'react-icons/fa';
import { useCartActions } from './hooks/useCartActions';
import { useAdminData } from './context/AdminDataContext';
// wishlist removed
import { migrateProductImages, getMainImage, isImageUrl } from './utils/imageHelpers';
import BrandMark from './components/BrandMark';
import './Catalog.css';

export default function Catalog() {
  const { products, categories, brands, filterSettings } = useAdminData();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [selectedSubcategory, setSelectedSubcategory] = useState('Все');
  const [selectedBrand, setSelectedBrand] = useState('Все');
  const [priceRange, setPriceRange] = useState([0, 0]);
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');
  const [inStock, setInStock] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' или 'list'
  const { addToCartWithNotification } = useCartActions();

  // Автоматическое переключение на режим списка для мобильных устройств
  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth <= 768) {
        setViewMode('list');
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Обработчик клика по товару
  const handleProductClick = (productId) => {
    // Принудительно переходим на страницу товара
    navigate(`/product/${productId}`);
  };

  // Создаем список категорий и брендов
  const categoryList = filterSettings.showCategoryFilter ? ['Все', ...Object.keys(categories)] : [];
  const brandList = filterSettings.showBrandFilter ? ['Все', ...brands] : [];

  const minPrice = 0;
  const maxPrice = 1000000000; // верхняя граница по умолчанию (1 млрд)
  const ITEMS_PER_PAGE = 15; // количество товаров на странице

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
      // оставляем поле пустым, фильтр остаётся по умолчанию
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
      // Если поле пустое, устанавливаем 0 для отключения верхней границы
      setPriceRange(([l, _]) => [l, 0]);
      return;
    }
    const num = parseInt(maxPriceInput, 10);
    const clamped = clamp(isNaN(num) ? 0 : num, priceRange[0], maxPrice);
    setMaxPriceInput(String(clamped));
    setPriceRange(([l, _]) => [l, clamped]);
  };

  const resetFilters = () => {
    if (filterSettings.showCategoryFilter) {
      setSelectedCategory('Все');
    }
    if (filterSettings.showSubcategoryFilter) {
      setSelectedSubcategory('Все');
    }
    if (filterSettings.showBrandFilter) {
      setSelectedBrand('Все');
    }
    if (filterSettings.showPriceFilter) {
      setPriceRange([minPrice, 0]);
      setMinPriceInput('');
      setMaxPriceInput('');
    }
    if (filterSettings.showStockFilter) {
      setInStock(false);
    }
  };

  // Получаем подкатегории для выбранной категории
  const availableSubcategories = !filterSettings.showCategoryFilter || !filterSettings.showSubcategoryFilter || selectedCategory === 'Все' 
    ? [] 
    : ['Все', ...(categories[selectedCategory] || [])];

  // Сброс подкатегории при смене основной категории
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (filterSettings.showSubcategoryFilter) {
      setSelectedSubcategory('Все');
    }
  };

  // Сортировка товаров: сначала по категории, потом по подкатегории, потом по названию
  const sortedProducts = [...products].sort((a, b) => {
    // Сначала по категории
    if (a.category !== b.category) {
      return (a.category || '').localeCompare(b.category || '');
    }
    // Потом по подкатегории
    if (a.subcategory !== b.subcategory) {
      return (a.subcategory || '').localeCompare(b.subcategory || '');
    }
    // Потом по названию
    return (a.title || '').localeCompare(b.title || '');
  });

  const filteredProducts = sortedProducts.filter((product) => {
    const byCategory = !filterSettings.showCategoryFilter || selectedCategory === 'Все' || product.category === selectedCategory;
    const bySubcategory = !filterSettings.showSubcategoryFilter || selectedSubcategory === 'Все' || product.subcategory === selectedSubcategory;
    const byBrand = !filterSettings.showBrandFilter || selectedBrand === 'Все' || product.brand === selectedBrand;
    const byPrice = !filterSettings.showPriceFilter || (product.price >= priceRange[0] && (priceRange[1] === 0 || product.price <= priceRange[1]));
    const byStock = !filterSettings.showStockFilter || !inStock || product.available;
    return byCategory && bySubcategory && byBrand && byPrice && byStock;
  });

  // Логика пагинации
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Сброс на первую страницу при изменении фильтров
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedSubcategory, selectedBrand, priceRange, inStock]);

  // Функции для навигации по страницам
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    scrollToTop();
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      scrollToTop();
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      scrollToTop();
    }
  };

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCartWithNotification(product, 1);
  };

  // wishlist removed

  return (
    <div className="catalog-wrapper">
      <aside className="catalog-filters">
        <h3>Фильтры</h3>
        {filterSettings.showCategoryFilter && (
          <div className="filter-group">
            <label>Категория</label>
            <select value={selectedCategory} onChange={e => handleCategoryChange(e.target.value)}>
              {categoryList.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        )}
        {availableSubcategories.length > 0 && filterSettings.showSubcategoryFilter && (
          <div className="filter-group">
            <label>Подкатегория</label>
            <select value={selectedSubcategory} onChange={e => setSelectedSubcategory(e.target.value)}>
              {availableSubcategories.map(subcat => (
                <option key={subcat} value={subcat}>{subcat}</option>
              ))}
            </select>
          </div>
        )}
        {filterSettings.showBrandFilter && (
          <div className="filter-group">
            <label>Производитель</label>
            <select value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)}>
              {brandList.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>
        )}
        {filterSettings.showPriceFilter && (
          <div className="filter-group">
            <label>Цена, ₽</label>
            <div className="price-range" role="group" aria-label="Диапазон цены">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={minPriceInput}
                placeholder="От"
                onChange={handleMinPriceChange}
                onBlur={normalizeMinOnBlur}
              />
              <span>-</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={maxPriceInput}
                placeholder="До"
                onChange={handleMaxPriceChange}
                onBlur={normalizeMaxOnBlur}
              />
            </div>
          </div>
        )}
        {filterSettings.showStockFilter && (
          <div className="filter-group">
            <label>
              <input
                type="checkbox"
                checked={inStock}
                onChange={e => setInStock(e.target.checked)}
              />
              Только в наличии
            </label>
          </div>
        )}
        <div className="filter-actions" style={{ marginTop: '8px' }}>
          <button onClick={resetFilters} className="catalog-reset-btn">
            Сбросить фильтры
          </button>
        </div>
      </aside>
      <main className="catalog-main">
        <div className="catalog-header-controls">
          <h2>Товары</h2>
          <div className="view-mode-toggle">
            <button 
              className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Сетка"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
              </svg>
            </button>
            <button 
              className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="Список"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="6" width="18" height="2"/>
                <rect x="3" y="11" width="18" height="2"/>
                <rect x="3" y="16" width="18" height="2"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div className={`catalog-container ${viewMode === 'list' ? 'catalog-list' : 'catalog-grid'}`}>
            {filteredProducts.length === 0 && <div className="no-products">Нет товаров по выбранным фильтрам</div>}
            {currentProducts.map(product => (
              <div 
                className={`catalog-card ${viewMode === 'list' ? 'catalog-card-list' : 'catalog-card-grid'}`}
                key={product.id}
                onClick={() => handleProductClick(product.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="catalog-card-image">
                  {(() => {
                    const migratedProduct = migrateProductImages(product);
                    const mainImage = getMainImage(migratedProduct);
                    
                    // Логирование для отладки (можно убрать после тестирования)
                    // console.log('Product:', product.id, product.images?.length || 0, 'images');
                    
                    // Проверяем, есть ли валидное изображение
                    if (mainImage?.data && 
                        typeof mainImage.data === 'string' && 
                        (mainImage.data.startsWith('data:image') || isImageUrl(mainImage.data))) {
                      
                      // Проверяем, что это НЕ изображение "фотография отсутствует"
                      const imageData = mainImage.data.toLowerCase();
                      if (imageData.includes('фотография отсутствует') || 
                          imageData.includes('фото отсутствует') || 
                          imageData.includes('нет фото') ||
                          imageData.includes('no-image') ||
                          imageData.includes('placeholder') ||
                          imageData.includes('отсутствует')) {
                        console.log('🚫 Пропускаем изображение "фотография отсутствует" для товара:', product.title);
                        return (
                          <span className="catalog-card-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BrandMark alt={product.title} style={{ height: viewMode === 'list' ? 48 : 64 }} />
                          </span>
                        );
                      }
                      
                      return <img src={mainImage.data} alt={product.title} className="catalog-product-image" />;
                    }
                    
                    // Если нет изображения или оно невалидное, показываем иконку бренда
                    return (
                      <span className="catalog-card-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BrandMark alt={product.title} style={{ height: viewMode === 'list' ? 48 : 64 }} />
                      </span>
                    );
                  })()}
                  {/* wishlist button removed */}
                </div>
                <div className="catalog-card-info">
                  <div className="catalog-card-header">
                    <h3>{product.title}</h3>
                    <div className="catalog-card-price">{product.price.toLocaleString()} ₽</div>
                  </div>
                  
                  <div className="catalog-card-meta">
                    <span className={product.available ? 'in-stock' : 'out-of-stock'}>
                      {product.available ? <FaCheckCircle /> : <FaTimesCircle />} {product.available ? 'В наличии' : 'Нет в наличии'}
                    </span>
                  </div>
                  
                  <button 
                    className="catalog-card-btn"
                    onClick={(e) => handleAddToCart(product, e)}
                    disabled={!product.available}
                  >
                    <FaShoppingBasket /> В корзину
                  </button>
                </div>
              </div>
            ))}
          </div>
        
        {/* Информация о количестве товаров и пагинация */}
        {filteredProducts.length > 0 && (
          <div className="catalog-pagination">
            <div className="pagination-info">
              Показано {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} из {filteredProducts.length} товаров
            </div>
            
            {totalPages > 1 && (
              <div className="pagination-controls">
                <button 
                  className="pagination-btn prev-btn"
                  onClick={goToPrevPage}
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
                          onClick={() => goToPage(pageNumber)}
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
                  onClick={goToNextPage}
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
  );
}
