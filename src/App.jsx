import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt,
  FaShoppingCart,
  FaSearch,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import { useCart } from './context/CartContext';
import { useAdminData } from './context/AdminDataContext';
// removed wishlist import
import SearchModal from './components/SearchModal';
import telegramSetup from './utils/telegramSetup';
import debugOrders from './utils/debugOrders';
import './App.css';
import BrandLogo from './components/BrandLogo';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getCartItemsCount } = useCart();
  const { aboutContent } = useAdminData();
  // wishlist removed
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [contactsActive, setContactsActive] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    // Отслеживаем, в зоне видимости ли блок контактов на странице 
    if (!location.pathname.startsWith('/about')) {
      setContactsActive(false);
      return;
    }
    const el = document.getElementById('contacts');
    if (!el) {
      setContactsActive(false);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          setContactsActive(en.isIntersecting);
          if (!en.isIntersecting && window.location.hash === '#contacts') {
            // вышли из блока контактов — убираем hash через роутер
            try { navigate('/about', { replace: true }); } catch {}
          }
        });
      },
      { threshold: 0.4 }
    );
    obs.observe(el);

    const onHashChange = () => setContactsActive(window.location.hash === '#contacts');
    window.addEventListener('hashchange', onHashChange);
    onHashChange();
    return () => {
      try { obs.disconnect(); } catch {}
      window.removeEventListener('hashchange', onHashChange);
    };
  }, [location.pathname, navigate]);

  // Автопрокрутка страницы вверх при смене маршрута (кроме якорей)
  useEffect(() => {
    if (location.hash) return; // если переходим к якорю, не скроллим к верху
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);
  
  const footerData = aboutContent.footer || {
    aboutSection: {
      title: 'О компании',
      description: 'Мы специализируемся на поставке качественных запчастей для вездеходов всех типов и марок.'
    },
    contactsSection: {
      title: 'Контакты',
      phone: '+7 (800) 123-45-67',
      email: 'info@vezdehod-zapchasti.ru',
      address: 'г. Москва, ул. Примерная, 123'
    },
    informationSection: {
      title: 'Информация',
      links: [
        { text: 'Доставка и оплата', url: '/about' },
        { text: 'Гарантия', url: '/about' },
        { text: 'Возврат товара', url: '/about' },
        { text: 'Политика конфиденциальности', url: '/about' }
      ]
    },
    copyright: '© 2024 ЮТОРС. Все права защищены.'
  };

  const isActiveLink = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleSearchClick = () => {
    setIsSearchModalOpen(true);
  };

  const closeSearchModal = () => {
    setIsSearchModalOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Закрытие мобильного меню при изменении маршрута
  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname]);

  // wishlist removed

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <BrandLogo to="/" className="logo" size="md" text="ЮТОРС" />
            <nav className="nav">
              <Link 
                to="/" 
                className={`nav-link ${isActiveLink('/') ? 'active' : ''}`}
              >
                Главная
              </Link>
              <Link 
                to="/catalog" 
                className={`nav-link ${isActiveLink('/catalog') ? 'active' : ''}`}
              >
                Каталог
              </Link>
              <Link 
                to="/promotions" 
                className={`nav-link ${isActiveLink('/promotions') ? 'active' : ''}`}
              >
                Акции
              </Link>
              <Link 
                to="/about" 
                className={`nav-link ${location.pathname.startsWith('/about') && !contactsActive && location.hash !== '#contacts' ? 'active' : ''}`}
                onClick={(e)=>{
                  e.preventDefault();
                  setContactsActive(false);
                  if (location.pathname.startsWith('/about')) {
                    navigate('/about', { replace: true });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    navigate('/about');
                    setTimeout(()=> window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
                  }
                }}
              >
                О компании
              </Link>
              <Link
                to="/about#contacts"
                className={`nav-link ${location.pathname.startsWith('/about') && (contactsActive || location.hash === '#contacts') ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/about#contacts');
                  setTimeout(() => {
                    const el = document.getElementById('contacts');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 50);
                }}
              >
                Контакты
              </Link>
            </nav>
            <div className="header-actions">
              <button className="icon-button icon-animated" onClick={handleSearchClick}>
                <FaSearch className="icon-wobble" />
              </button>
              {/* wishlist button removed */}
              <button className="icon-button cart-button icon-animated" onClick={handleCartClick}>
                <FaShoppingCart className="icon-bounce" />
                {getCartItemsCount() > 0 && (
                  <span className="cart-count">{getCartItemsCount()}</span>
                )}
              </button>
              <button 
                className="mobile-menu-button"
                onClick={toggleMobileMenu}
                aria-label="Открыть меню"
              >
                {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Мобильное меню */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenu}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <BrandLogo to="/" className="mobile-logo" size="sm" text="ЮТОРС" />
              <button 
                className="mobile-menu-close"
                onClick={closeMobileMenu}
                aria-label="Закрыть меню"
              >
                <FaTimes />
              </button>
            </div>
            
            <nav className="mobile-nav">
              <Link 
                to="/" 
                className={`mobile-nav-link ${isActiveLink('/') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                Главная
              </Link>
              <Link 
                to="/catalog" 
                className={`mobile-nav-link ${isActiveLink('/catalog') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                Каталог
              </Link>
              <Link 
                to="/promotions" 
                className={`mobile-nav-link ${isActiveLink('/promotions') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                Акции
              </Link>
              <Link 
                to="/about" 
                className={`mobile-nav-link ${location.pathname.startsWith('/about') && !contactsActive && location.hash !== '#contacts' ? 'active' : ''}`}
                onClick={(e)=>{
                  e.preventDefault();
                  closeMobileMenu();
                  setContactsActive(false);
                  if (location.pathname.startsWith('/about')) {
                    navigate('/about', { replace: true });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    navigate('/about');
                    setTimeout(()=> window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
                  }
                }}
              >
                О компании
              </Link>
              <Link
                to="/about#contacts"
                className={`mobile-nav-link ${location.pathname.startsWith('/about') && (contactsActive || location.hash === '#contacts') ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  closeMobileMenu();
                  navigate('/about#contacts');
                  setTimeout(() => {
                    const el = document.getElementById('contacts');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 50);
                }}
              >
                Контакты
              </Link>
            </nav>

            <div className="mobile-menu-actions">
              <button className="mobile-action-btn" onClick={() => {
                closeMobileMenu();
                handleSearchClick();
              }}>
                <FaSearch />
                Поиск
              </button>
              <button className="mobile-action-btn" onClick={() => {
                closeMobileMenu();
                handleCartClick();
              }}>
                <FaShoppingCart />
                Корзина
                {getCartItemsCount() > 0 && (
                  <span className="mobile-cart-count">{getCartItemsCount()}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
              <a href={`tel:${footerData.contactsSection.phone.replace(/[^+\d]/g, '')}`}>
                <FaPhone className="icon-pulse" /> {footerData.contactsSection.phone}
              </a>
              <a href={`mailto:${footerData.contactsSection.email}`}>
                <FaEnvelope className="icon-wobble" /> {footerData.contactsSection.email}
              </a>
              <a href="/about#contacts" onClick={(e)=>{e.preventDefault(); navigate('/about#contacts'); setTimeout(()=>{ const el=document.getElementById('contacts'); if(el) el.scrollIntoView({behavior:'smooth'}); },50);}}>
                <FaMapMarkerAlt className="icon-bounce" /> {footerData.contactsSection.address}
              </a>
            </div>
            <div className="footer-section">
              <h3>{footerData.informationSection.title}</h3>
              {footerData.informationSection.links.map((link, index) => (
                <Link 
                  key={index} 
                  to={link.url}
                  onClick={(e) => {
                    if (typeof link.url === 'string' && link.url.startsWith('/about#')) {
                      e.preventDefault();
                      navigate(link.url);
                      const hash = link.url.split('#')[1];
                      setTimeout(() => {
                        const el = document.getElementById(hash);
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 50);
                    }
                  }}
                >
                  {link.text}
                </Link>
              ))}
            </div>
          </div>
          <div className="footer-bottom">
            <p>{footerData.copyright}</p>
          </div>
        </div>
      </footer>
      
      {/* Глобальный контейнер уведомлений */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2500,
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '10px',
            boxShadow:
              '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)'
          },
          success: {
            icon: '🛒'
          },
          error: {
            icon: '⚠️'
          }
        }}
      />

      <SearchModal 
        isOpen={isSearchModalOpen} 
        onClose={closeSearchModal} 
      />
    </div>
  );
}

export default App;
