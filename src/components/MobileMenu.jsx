import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaBars, FaCog, FaShoppingCart, FaSearch } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import './MobileMenu.css';

const MobileMenu = ({ isOpen, onClose, onSearchClick }) => {
  const location = useLocation();
  const { getCartItemsCount } = useCart();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleLinkClick = () => {
    onClose();
  };

  const isActiveLink = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const menuItems = [
    { path: '/', label: 'Главная', icon: '🏠' },
    { path: '/catalog', label: 'Каталог', icon: '📦' },
    { path: '/promotions', label: 'Акции', icon: '🎯' },
    { path: '/about', label: 'О компании', icon: 'ℹ️' },
    { path: '/about#contacts', label: 'Контакты', icon: '📞' }
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="mobile-menu-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          <motion.div
            className="mobile-menu"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-menu-header">
              <Link to="/" className="mobile-logo" onClick={handleLinkClick}>
                <FaCog className="logo-icon" />
                Вездеход Запчасти
              </Link>
              <button className="mobile-close-btn" onClick={onClose}>
                <FaTimes />
              </button>
            </div>

            <nav className="mobile-nav">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`mobile-nav-link ${isActiveLink(item.path) ? 'active' : ''}`}
                  onClick={handleLinkClick}
                >
                  <span className="mobile-nav-icon">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mobile-actions">
              <button className="mobile-action-btn" onClick={() => { onSearchClick(); onClose(); }}>
                <FaSearch />
                Поиск
              </button>
              <Link to="/cart" className="mobile-action-btn cart" onClick={handleLinkClick}>
                <FaShoppingCart />
                Корзина
                {getCartItemsCount() > 0 && (
                  <span className="mobile-cart-count">{getCartItemsCount()}</span>
                )}
              </Link>
            </div>

            <div className="mobile-footer">
              <div className="mobile-contact-info">
                <p>📞 +7 (800) 123-45-67</p>
                <p>📧 info@ytors.ru</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
