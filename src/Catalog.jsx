import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useCartActions } from './hooks/useCartActions';
import { useAdminData } from './context/AdminDataContext';
import { getMainImage } from './utils/imageHelpers';
import './Catalog.css';

export default function Catalog() {
  const { products, categories, brands } = useAdminData();
  const { addToCartWithNotification } = useCartActions();

  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [selectedSubcategory, setSelectedSubcategory] = useState('Все');
  const [selectedBrand, setSelectedBrand] = useState('Все');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    if (selectedCategory === 'Все' || !categories[selectedCategory]) {
      setSubcategories([]);
      setSelectedSubcategory('Все');
    } else {
      setSubcategories(['Все', ...categories[selectedCategory]]);
      setSelectedSubcategory('Все');
    }
  }, [selectedCategory, categories]);

  const handleResetFilters = () => {
    setSelectedCategory('Все');
    setSelectedSubcategory('Все');
    setSelectedBrand('Все');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
  };

  const filteredProducts = products.filter(product => {
    const byCategory = selectedCategory === 'Все' || product.category === selectedCategory;
    const bySubcategory = selectedSubcategory === 'Все' || product.subcategory === selectedSubcategory;
    const byBrand = selectedBrand === 'Все' || product.brand === selectedBrand;
    const byMinPrice = minPrice === '' || product.price >= parseFloat(minPrice);
    const byMaxPrice = maxPrice === '' || product.price <= parseFloat(maxPrice);
    const byStock = !inStockOnly || product.available;
    
    return byCategory && bySubcategory && byBrand && byMinPrice && byMaxPrice && byStock;
  });

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCartWithNotification(product, 1);
  };

  return (
    <div className="catalog-layout">
      <aside className="catalog-filters">
        <h4>Фильтры</h4>
        <div className="filter-group">
          <label htmlFor="category">Категория</label>
          <select id="category" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
            <option value="Все">Все категории</option>
            {Object.keys(categories).map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        {subcategories.length > 0 && (
          <div className="filter-group">
            <label htmlFor="subcategory">Подкатегория</label>
            <select id="subcategory" value={selectedSubcategory} onChange={e => setSelectedSubcategory(e.target.value)}>
              {subcategories.map(sub => <option key={sub} value={sub}>{sub}</option>)}
            </select>
          </div>
        )}

        <div className="filter-group">
          <label htmlFor="brand">Производитель</label>
          <select id="brand" value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)}>
            <option value="Все">Все производители</option>
            {brands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label>Цена, ₽</label>
          <div className="price-inputs">
            <input 
              type="number" 
              placeholder="от" 
              value={minPrice} 
              onChange={e => setMinPrice(e.target.value)} 
            />
            <input 
              type="number" 
              placeholder="до" 
              value={maxPrice} 
              onChange={e => setMaxPrice(e.target.value)} 
            />
          </div>
        </div>

        <div className="filter-group">
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={inStockOnly} 
              onChange={e => setInStockOnly(e.target.checked)}
            />
            Только в наличии
          </label>
        </div>
        
        <button onClick={handleResetFilters} className="reset-filters-btn">
          Сбросить все фильтры
        </button>
      </aside>

      <main className="catalog-content">
        {filteredProducts.length > 0 ? (
          <div className="catalog-grid">
            {filteredProducts.map(product => (
              <Link to={`/product/${product.id}`} className="product-card-link" key={product.id}>
                <div className="product-card">
                  <div className="product-image">
                    <img 
                      src={getMainImage(product)?.data || './placeholder.png'} 
                      alt={product.title}
                      className="product-image-img"
                    />
                    <div className={`stock-status ${product.available ? 'in-stock' : 'out-of-stock'}`}>
                      {product.available ? <FaCheckCircle /> : <FaTimesCircle />}
                      <span>{product.available ? 'В наличии' : 'Нет в наличии'}</span>
                    </div>
                  </div>
                  <div className="product-info">
                    <p className="product-category">{product.category}</p>
                    <h3 className="product-title">{product.title}</h3>
                    <p className="product-price">{product.price.toLocaleString()} ₽</p>
                    <button 
                      className="add-to-cart-btn"
                      onClick={(e) => handleAddToCart(product, e)}
                      disabled={!product.available}
                    >
                      <FaShoppingCart />
                      <span>В корзину</span>
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="no-products-found">
            <h4>Товары не найдены</h4>
            <p>Попробуйте изменить параметры фильтра или сбросить их.</p>
            <button onClick={handleResetFilters} className="cta-button">
              Сбросить фильтры
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
