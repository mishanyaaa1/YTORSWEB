import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaCheckCircle, FaTimesCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useCartActions } from '../hooks/useCartActions';
import { useAdminData } from '../context/AdminDataContext';
import { getAllImages } from '../utils/imageHelpers';
import './ProductPage.css';

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCartWithNotification } = useCartActions();
  const { products } = useAdminData();
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const product = products.find(p => p.id === parseInt(id));

  if (!product) {
    return (
      <div className="container">
        <div className="product-not-found">
          <h2>Товар не найден</h2>
          <p>К сожалению, мы не смогли найти товар, который вы ищете.</p>
          <button onClick={() => navigate('/catalog')} className="cta-button">
            Вернуться в каталог
          </button>
        </div>
      </div>
    );
  }

  const allImages = getAllImages(product);
  const safeImageIndex = Math.min(selectedImageIndex, allImages.length - 1);

  const handleAddToCart = () => {
    addToCartWithNotification(product, quantity);
  };
  
  const handleQuantityChange = (amount) => {
    const newQuantity = Math.max(1, quantity + amount);
    setQuantity(Math.min(newQuantity, product.quantity || 99));
  };

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value === '') {
      setQuantity(1);
    } else {
      const num = parseInt(value, 10);
      setQuantity(Math.max(1, Math.min(num, product.quantity || 99)));
    }
  };

  const specsArray = Array.isArray(product.specifications)
    ? product.specifications.filter(s => s && s.name && s.value)
    : (product.specifications && typeof product.specifications === 'object')
      ? Object.entries(product.specifications).map(([name, value]) => ({ name, value }))
      : [];
      
  return (
    <div className="container">
      <div className="product-layout">
        <div className="product-gallery">
          <div className="main-image-wrapper">
            {allImages.length > 0 ? (
              <img 
                src={allImages[safeImageIndex]?.data || '/placeholder.png'} 
                alt={product.title} 
                className="main-image"
              />
            ) : (
              <div className="image-placeholder">📦</div>
            )}
            {allImages.length > 1 && (
              <>
                <button className="gallery-nav prev" onClick={() => setSelectedImageIndex(i => (i - 1 + allImages.length) % allImages.length)}>
                  <FaChevronLeft />
                </button>
                <button className="gallery-nav next" onClick={() => setSelectedImageIndex(i => (i + 1) % allImages.length)}>
                  <FaChevronRight />
                </button>
              </>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="thumbnails">
              {allImages.map((image, index) => (
                <div 
                  key={index}
                  className={`thumbnail ${index === safeImageIndex ? 'active' : ''}`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img src={image?.data || '/placeholder.png'} alt={`${product.title} thumbnail ${index + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="product-details">
          <div className="product-meta">
            <span className="meta-brand">{product.brand}</span>
            <span className={`meta-stock ${product.available ? 'in-stock' : 'out-of-stock'}`}>
              {product.available ? <FaCheckCircle /> : <FaTimesCircle />}
              {product.available ? 'В наличии' : 'Нет в наличии'}
            </span>
          </div>
          <h1>{product.title}</h1>
          <p className="product-price">{product.price.toLocaleString()} ₽</p>
          
          <div className="product-actions">
            <div className="quantity-control">
              <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>-</button>
              <input type="text" value={quantity} onChange={handleInputChange} />
              <button onClick={() => handleQuantityChange(1)} disabled={quantity >= (product.quantity || 99)}>+</button>
            </div>
            <button className="add-to-cart-button" onClick={handleAddToCart} disabled={!product.available}>
              <FaShoppingCart />
              Добавить в корзину
            </button>
          </div>

          <div className="product-description">
            <h3>Описание</h3>
            <p>{product.description || 'Описание для этого товара пока не добавлено.'}</p>
          </div>
        </div>
      </div>
      
      {specsArray.length > 0 && (
        <div className="product-specs">
          <h3>Характеристики</h3>
          <ul>
            {specsArray.map((spec, index) => (
              <li key={index}>
                <span className="spec-name">{spec.name}</span>
                <span className="spec-value">{spec.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ProductPage;
