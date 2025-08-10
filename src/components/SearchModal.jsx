import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaTimes, FaShoppingCart } from 'react-icons/fa';
import { useAdminData } from '../context/AdminDataContext';
import { getMainImage } from '../utils/imageHelpers';
import { useCartActions } from '../hooks/useCartActions';
import './SearchModal.css';

export default function SearchModal({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const { products } = useAdminData();
  const { addToCartWithNotification } = useCartActions();

  useEffect(() => {
    if (!isOpen) setSearchTerm('');
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const searchInput = document.getElementById('search-input-modal');
      setTimeout(() => searchInput?.focus(), 100);
    } else {
      document.body.style.overflow = 'auto';
    }

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const query = searchTerm.toLowerCase().trim();
    return products.filter(p => 
      p.title.toLowerCase().includes(query) ||
      p.category?.toLowerCase().includes(query) ||
      p.brand?.toLowerCase().includes(query)
    ).slice(0, 8);
  }, [searchTerm, products]);

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCartWithNotification(product, 1);
  };
  
  if (!isOpen) return null;

  return (
    <div className="search-modal-overlay" onMouseDown={onClose}>
      <div className="search-modal-content" onMouseDown={(e) => e.stopPropagation()}>
        <div className="search-modal-header">
          <div className="search-input-wrapper">
            <FaSearch />
            <input
              id="search-input-modal"
              type="text"
              placeholder="Поиск по каталогу..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={onClose} className="close-modal-btn"><FaTimes /></button>
        </div>

        <div className="search-modal-body">
          {searchTerm.trim() && searchResults.length === 0 && (
            <div className="search-empty-state">
              <p>Ничего не найдено по запросу "{searchTerm}"</p>
            </div>
          )}
          
          {searchResults.length > 0 && (
            <div className="search-results-list">
              {searchResults.map(product => (
                <Link to={`/product/${product.id}`} key={product.id} className="search-result-item" onClick={onClose}>
                  <img src={getMainImage(product)?.data || '/placeholder.png'} alt={product.title} className="result-item-image"/>
                  <div className="result-item-info">
                    <p className="result-item-title">{product.title}</p>
                    <p className="result-item-price">{product.price.toLocaleString()} ₽</p>
                  </div>
                  <button className="add-to-cart-btn-sm" onClick={(e) => handleAddToCart(product, e)}>
                    <FaShoppingCart />
                  </button>
                </Link>
              ))}
            </div>
          )}

          {!searchTerm.trim() && (
             <div className="search-empty-state">
              <p>Начните вводить, чтобы найти товары.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
