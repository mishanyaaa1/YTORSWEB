import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaShoppingCart } from 'react-icons/fa';
import { useCartActions } from './hooks/useCartActions';
import { useAdminData } from './context/AdminDataContext';
// wishlist removed
import { migrateProductImages, getMainImage, isImageUrl } from './utils/imageHelpers';
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
    setSelectedCategory('Все');
    setSelectedSubcategory('Все');
    setSelectedBrand('Все');
    setPriceRange([minPrice, maxPrice]);
    setMinPriceInput('');
    setMaxPriceInput('');
    setInStock(false);
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
        <div className="filter-group">
          <label>Категория</label>
          <select value={selectedCategory} onChange={e => handleCategoryChange(e.target.value)}>
            {categoryList.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        {availableSubcategories.length > 0 && (
          <div className="filter-group">
            <label>Подкатегория</label>
            <select value={selectedSubcategory} onChange={e => setSelectedSubcategory(e.target.value)}>
              {availableSubcategories.map(subcat => (
                <option key={subcat} value={subcat}>{subcat}</option>
              ))}
            </select>
          </div>
        )}
        <div className="filter-group">
          <label>Производитель</label>
          <select value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)}>
            {brandList.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>
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
        <div className="filter-actions" style={{ marginTop: '8px' }}>
          <button onClick={resetFilters} className="catalog-reset-btn">
            Сбросить фильтры
          </button>
        </div>
      </aside>
      <main className="catalog-main">
        <h2>Каталог товаров</h2>
        <div className="catalog-grid">
          {filteredProducts.length === 0 && <div className="no-products">Нет товаров по выбранным фильтрам</div>}
          {filteredProducts.map(product => (
            <Link to={`/product/${product.id}`} className="catalog-card" key={product.id}>
              <div className="catalog-card-image">
                {(() => {
                  const migratedProduct = migrateProductImages(product);
                  const mainImage = getMainImage(migratedProduct);
                  
                  if (mainImage?.data) {
                    if (
                      typeof mainImage.data === 'string' &&
                      (mainImage.data.startsWith('data:image') || isImageUrl(mainImage.data))
                    ) {
                      return <img src={mainImage.data} alt={product.title} className="catalog-product-image" />;
                    }
                    return <span className="catalog-card-icon">{mainImage.data}</span>;
                  }
                  return <span className="catalog-card-icon">📦</span>;
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
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
