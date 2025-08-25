import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaShoppingCart } from 'react-icons/fa';
import { useCartActions } from './hooks/useCartActions';
import { useAdminData } from './context/AdminDataContext';
// wishlist removed
import { migrateProductImages, getMainImage, isImageUrl } from './utils/imageHelpers';
import BrandMark from './components/BrandMark';
import './Catalog.css';

export default function Catalog() {
  const { products, categories, brands, filterSettings, isLoading } = useAdminData();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [selectedSubcategory, setSelectedSubcategory] = useState('Все');
  const [selectedBrand, setSelectedBrand] = useState('Все');
  const [priceRange, setPriceRange] = useState([0, 1000000000]);
  const [minPriceInput, setMinPriceInput] = useState('');
  const [maxPriceInput, setMaxPriceInput] = useState('');
  const [inStock, setInStock] = useState(false);
  const { addToCartWithNotification } = useCartActions();

  // Обработчик клика по товару
  const handleProductClick = (productId) => {
    // Проверяем, что товар существует перед переходом
    const product = products.find(p => p.id === productId);
    if (product) {
      console.log('Catalog: Navigating to product:', product.title, 'ID:', productId);
      // Принудительно переходим на страницу товара
      navigate(`/product/${productId}`);
    } else {
      console.warn('Catalog: Product not found, cannot navigate to:', productId);
      // Если товар не найден, обновляем страницу
      window.location.reload();
    }
  };

  // Создаем список категорий и брендов
  const categoryList = filterSettings.showCategoryFilter ? ['Все', ...Object.keys(categories)] : [];
  const brandList = filterSettings.showBrandFilter ? ['Все', ...brands] : [];

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
      setPriceRange(([l, _]) => [l, maxPrice]);
      return;
    }
    const num = parseInt(maxPriceInput, 10);
    const clamped = clamp(isNaN(num) ? maxPrice : num, priceRange[0], maxPrice);
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
      setPriceRange([minPrice, maxPrice]);
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
    const byPrice = !filterSettings.showPriceFilter || (product.price >= priceRange[0] && product.price <= priceRange[1]);
    const byStock = !filterSettings.showStockFilter || !inStock || product.available;
    return byCategory && bySubcategory && byBrand && byPrice && byStock;
  });

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
                placeholder={String(minPrice)}
                onChange={handleMinPriceChange}
                onBlur={normalizeMinOnBlur}
              />
              <span>-</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={maxPriceInput}
                placeholder={String(maxPrice)}
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
        <h2>Каталог товаров</h2>
        
        {isLoading ? (
          <div className="catalog-loading">
            <div className="loading-spinner"></div>
            <p>Загрузка товаров...</p>
          </div>
        ) : (
          <div className="catalog-grid">
            {filteredProducts.length === 0 && <div className="no-products">Нет товаров по выбранным фильтрам</div>}
            {filteredProducts.map(product => (
              <div 
                className="catalog-card" 
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
                            <BrandMark alt={product.title} style={{ height: 64 }} />
                          </span>
                        );
                      }
                      
                      return <img src={mainImage.data} alt={product.title} className="catalog-product-image" />;
                    }
                    
                    // Если нет изображения или оно невалидное, показываем иконку бренда
                    return (
                      <span className="catalog-card-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BrandMark alt={product.title} style={{ height: 64 }} />
                      </span>
                    );
                  })()}
                  {/* wishlist button removed */}
                </div>
                <div className="catalog-card-info">
                  <h3>{product.title}</h3>
                  <div className="catalog-card-price">{product.price.toLocaleString()} ₽</div>
                  <div className="catalog-card-category">
                    <span className="category">{product.category}</span>
                    {product.subcategory && <span className="subcategory"> → {product.subcategory}</span>}
                  </div>
                  <div className="catalog-card-meta">
                    <span className="catalog-card-brand">{product.brand}</span>
                    <span className={product.available ? 'in-stock' : 'out-of-stock'}>
                      {product.available ? <FaCheckCircle /> : <FaTimesCircle />} {product.available ? 'В наличии' : 'Нет в наличии'}
                    </span>
                  </div>
                  <button 
                    className="catalog-card-btn"
                    onClick={(e) => handleAddToCart(product, e)}
                    disabled={!product.available}
                  >
                    <FaShoppingCart /> В корзину
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
