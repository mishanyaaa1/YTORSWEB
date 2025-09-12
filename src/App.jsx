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
  FaTimes,
  FaVk,
  FaInstagram,
  FaYoutube
} from 'react-icons/fa';
import { useCart } from './context/CartContext';
import { useAdminData } from './context/AdminDataContext';
import SearchModal from './components/SearchModal';
import './App.css';
import './index.css';
import './global-input-styles.css';
import BrandLogo from './components/BrandLogo';
import AdvertisingScripts from './components/AdvertisingScripts';
import ScrollToTop from './components/ScrollToTop';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getCartItemsCount, isInitialized, storageAvailable } = useCart();
  const { aboutContent } = useAdminData();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [contactsActive, setContactsActive] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Закрываем мобильное меню при смене маршрута
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);
  
  // Закрываем мобильное меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu') && !event.target.closest('.mobile-menu-button')) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);
  
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
  
  // Безопасная инициализация footerData с проверкой структуры
  const footerData = (() => {
    const footer = aboutContent?.footer || {};
    return {
      aboutSection: {
        title: 'О компании',
        description: 'Мы специализируемся на поставке качественных запчастей для вездеходов всех типов и марок.',
        ...footer.aboutSection
      },
      socialSection: {
        title: 'Мы в соцсетях',
        ...footer.socialSection,
        links: Array.isArray(footer.socialSection?.links) ? footer.socialSection.links : [
          { platform: 'vk', url: 'https://vk.com/yutors', icon: 'vk' },
          { platform: 'instagram', url: 'https://instagram.com/yutors', icon: 'instagram' },
          { platform: 'youtube', url: 'https://youtube.com/@yutors', icon: 'youtube' }
        ]
      },
      contactsSection: {
        title: 'Контакты',
        phone: '+7 (800) 123-45-67',
        email: 'info@vezdehod-zapchasti.ru',
        address: '40-летия Победы, 16а, Курчатовский район, Челябинск, 454100',
        ...footer.contactsSection
      },
      informationSection: {
        title: 'Информация',
        ...footer.informationSection,
        links: Array.isArray(footer.informationSection?.links) ? footer.informationSection.links : [
          { text: 'Доставка и оплата', url: '/about' },
          { text: 'Гарантия', url: '/about' },
          { text: 'Возврат товара', url: '/about' },
          { text: 'Политика конфиденциальности', url: '/about' }
        ]
      },
      copyright: footer.copyright || '© 2024 ЮТОРС. Все права защищены.'
    };
  })();

  const isActiveLink = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    if (path === '/about' && contactsActive) return true;
    return false;
  };

  const openSearchModal = () => {
    setIsSearchModalOpen(true);
  };

  const closeSearchModal = () => {
    setIsSearchModalOpen(false);
  };

  return (
    <div className="app">
      <AdvertisingScripts />
      <header className="header">
        <div className="container">
          <div className="header-content">
            <BrandLogo to="/" className="logo" />

            <nav className="nav">
              <Link to="/" className={isActiveLink('/') ? 'nav-link active' : 'nav-link'}>
                Главная
              </Link>
              <Link to="/catalog" className={isActiveLink('/catalog') ? 'nav-link active' : 'nav-link'}>
                Каталог
              </Link>
              <Link to="/vehicles" className={isActiveLink('/vehicles') ? 'nav-link active' : 'nav-link'}>
                Вездеходы
              </Link>
              <Link to="/promotions" className={isActiveLink('/promotions') ? 'nav-link active' : 'nav-link'}>
                Акции
              </Link>
              <Link to="/about" className={isActiveLink('/about') ? 'nav-link active' : 'nav-link'}>
                О компании
              </Link>
            </nav>

            <div className="header-actions">
              <button 
                className="icon-button search-button" 
                onClick={openSearchModal}
                aria-label="Поиск"
              >
                <FaSearch />
              </button>

              <Link to="/cart" className="icon-button cart-button" aria-label="Корзина">
                <FaShoppingCart />
                {isInitialized && storageAvailable && getCartItemsCount() > 0 && (
                  <span className="cart-count">{getCartItemsCount()}</span>
                )}
              </Link>

              <button 
                className="mobile-menu-button" 
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Открыть меню"
              >
                <FaBars />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        {!storageAvailable && (
          <div style={{ 
            background: '#ff6b6b', 
            color: 'white', 
            padding: '10px', 
            textAlign: 'center',
            fontSize: '14px'
          }}>
            ⚠️ Внимание: Корзина может не сохраняться между сессиями. Пожалуйста, включите cookies и localStorage в настройках браузера.
          </div>
        )}
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>{footerData.aboutSection?.title || 'О компании'}</h3>
              <p>{footerData.aboutSection?.description || 'Описание компании'}</p>
            </div>
            <div className="footer-section">
              <h3>{footerData.socialSection?.title || 'Мы в соцсетях'}</h3>
              <div className="social-links">
                {(Array.isArray(footerData.socialSection?.links) ? footerData.socialSection.links : []).map((social, index) => {
                  const IconComponent = social.platform === 'vk' ? FaVk : 
                                       social.platform === 'instagram' ? FaInstagram : 
                                       social.platform === 'youtube' ? FaYoutube : null;
                  
                  return (
                    <a 
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link"
                      title={social.platform === 'vk' ? 'ВКонтакте' : 
                             social.platform === 'instagram' ? 'Instagram' : 
                             social.platform === 'youtube' ? 'YouTube' : social.platform}
                    >
                      {IconComponent && <IconComponent />}
                    </a>
                  );
                })}
              </div>
            </div>
            <div className="footer-section">
              <h3>{footerData.contactsSection?.title || 'Контакты'}</h3>
              <a href={`tel:${(footerData.contactsSection?.phone || '+7 (800) 123-45-67').replace(/[^+\d]/g, '')}`}>
                <FaPhone /> {footerData.contactsSection?.phone || '+7 (800) 123-45-67'}
              </a>
              <a href={`mailto:${footerData.contactsSection?.email || 'info@vezdehod-zapchasti.ru'}`}>
                <FaEnvelope /> {footerData.contactsSection?.email || 'info@vezdehod-zapchasti.ru'}
              </a>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  window.open('https://yandex.ru/maps/org/yutors/164193756613/?indoorLevel=1&ll=61.295870%2C55.187646&z=17', '_blank');
                }}
                style={{ cursor: 'pointer' }}
              >
                <FaMapMarkerAlt /> {footerData.contactsSection?.address || '40-летия Победы, 16а, Курчатовский район, Челябинск, 454100'}
              </a>
            </div>
            <div className="footer-section">
              <h3>{footerData.informationSection?.title || 'Информация'}</h3>
              {(Array.isArray(footerData.informationSection?.links) ? footerData.informationSection.links : []).map((link, index) => (
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
            <p>{footerData.copyright || '© 2024 ЮТОРС. Все права защищены.'}</p>
          </div>
        </div>
      </footer>
      
      {/* Глобальный контейнер уведомлений */}
      <Toaster
        position={isMobileMenuOpen ? "top-center" : "top-right"}
        toastOptions={{
          duration: 2500,
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '8px',
            boxShadow:
              '0 8px 12px -3px rgba(0,0,0,0.1), 0 3px 5px -2px rgba(0,0,0,0.1)',
            zIndex: isMobileMenuOpen ? 1000 : 1500,
            marginTop: '30px',
            padding: '8px 12px',
            fontSize: '15px',
            maxWidth: '280px'
          },
          success: {
            icon: '🛒'
          },
          error: {
            icon: '⚠️'
          }
        }}
        containerStyle={{
          zIndex: isMobileMenuOpen ? 1000 : 1500,
          top: '30px'
        }}
      />

      <SearchModal 
        isOpen={isSearchModalOpen} 
        onClose={closeSearchModal} 
      />

      {/* Мобильное меню */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <button 
            className="mobile-menu-close" 
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Закрыть меню"
          >
            <FaTimes />
          </button>
        </div>
        
        <nav className="mobile-nav">
          <Link 
            to="/" 
            className={`mobile-nav-link ${location.pathname === '/' ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Главная
          </Link>
          <Link 
            to="/catalog" 
            className={`mobile-nav-link ${location.pathname === '/catalog' ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Каталог
          </Link>
          <Link 
            to="/vehicles" 
            className={`mobile-nav-link ${location.pathname === '/vehicles' ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Вездеходы
          </Link>
          <Link 
            to="/promotions" 
            className={`mobile-nav-link ${location.pathname === '/promotions' ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Акции
          </Link>
          <Link 
            to="/about" 
            className={`mobile-nav-link ${location.pathname === '/about' ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            О компании
          </Link>
        </nav>
        
        <div className="mobile-menu-actions">
          <button 
            className="icon-button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsSearchModalOpen(true);
            }}
            aria-label="Поиск"
          >
            <FaSearch />
          </button>
          <Link 
            to="/cart" 
            className="icon-button cart-button"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Корзина"
          >
            <FaShoppingCart />
            {isInitialized && storageAvailable && getCartItemsCount() > 0 && (
              <span className="cart-count">{getCartItemsCount()}</span>
            )}
          </Link>
        </div>
      </div>

      {/* Компонент прокрутки наверх */}
      <ScrollToTop />
    </div>
  );
}

export default App;
