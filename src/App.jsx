import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaShoppingCart,
  FaSearch,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import { useCart } from './context/CartContext';
import { useAdminData } from './context/AdminDataContext';
import SearchModal from './components/SearchModal';
import CartNotification from './components/CartNotification';
import './App.css';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getCartItemsCount, notifications, removeNotification } = useCart();
  const { aboutContent } = useAdminData();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auto-scroll to top on route change (except for anchors)
  useEffect(() => {
    if (location.hash) return;
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const footerData = aboutContent.footer || {
    aboutSection: {
      title: 'О компании',
      description: 'Специализируемся на поставке качественных запчастей для вездеходов.'
    },
    contactsSection: {
      title: 'Контакты',
      phone: '+7 (800) 123-45-67',
      email: 'info@ytors.ru',
      address: 'г. Москва, ул. Промышленная, 1'
    },
    informationSection: {
      title: 'Информация',
      links: [
        { text: 'Доставка и оплата', url: '/about' },
        { text: 'Гарантия', url: '/about' },
      ]
    },
    copyright: '© 2024 ЮТОРС. Все права защищены.'
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  const handleCartClick = () => navigate('/cart');
  const handleSearchClick = () => setIsSearchModalOpen(true);
  const closeSearchModal = () => setIsSearchModalOpen(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const navLinks = [
    { to: "/", text: "Главная" },
    { to: "/catalog", text: "Каталог" },
    { to: "/promotions", text: "Акции" },
    { to: "/about", text: "О компании" },
    { to: "/about#contacts", text: "Контакты" },
  ];

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <Link to="/" className="logo">
              ЮТОРС
            </Link>
            <nav className={`nav ${isMobileMenuOpen ? 'active' : ''}`}>
              {navLinks.map((link) => (
                <Link 
                  key={link.to}
                  to={link.to} 
                  className={`nav-link ${isActiveLink(link.to.split('#')[0]) ? 'active' : ''}`}
                >
                  {link.text}
                </Link>
              ))}
            </nav>
            <div className="header-actions">
              <button className="icon-button" onClick={handleSearchClick}>
                <FaSearch />
              </button>
              <button className="icon-button cart-button" onClick={handleCartClick}>
                <FaShoppingCart />
                {getCartItemsCount() > 0 && (
                  <span className="cart-count">{getCartItemsCount()}</span>
                )}
              </button>
              <button className="icon-button mobile-menu-button" onClick={toggleMobileMenu}>
                {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>{footerData.aboutSection.title}</h3>
              <p>{footerData.aboutSection.description}</p>
            </div>
            <div className="footer-section">
              <h3>{footerData.contactsSection.title}</h3>
              <a href={`tel:${footerData.contactsSection.phone.replace(/[^+\d]/g, '')}`}>{footerData.contactsSection.phone}</a>
              <a href={`mailto:${footerData.contactsSection.email}`}>{footerData.contactsSection.email}</a>
              <p>{footerData.contactsSection.address}</p>
            </div>
            <div className="footer-section">
              <h3>{footerData.informationSection.title}</h3>
              {footerData.informationSection.links.map((link, index) => (
                <Link key={index} to={link.url}>{link.text}</Link>
              ))}
            </div>
          </div>
          <div className="footer-bottom">
            <p>{footerData.copyright}</p>
          </div>
        </div>
      </footer>
      
      <SearchModal 
        isOpen={isSearchModalOpen} 
        onClose={closeSearchModal} 
      />
      
      <CartNotification 
        notifications={notifications}
        removeNotification={removeNotification}
      />
    </div>
  );
}

export default App;
