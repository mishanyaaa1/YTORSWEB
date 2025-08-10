import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaTruck, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt,
  FaShoppingCart,
  FaSearch,
  FaBars
} from 'react-icons/fa';
import { useCart } from './context/CartContext';
import { useAdminData } from './context/AdminDataContext';
// removed wishlist import
import SearchModal from './components/SearchModal';
import telegramSetup from './utils/telegramSetup';
import debugOrders from './utils/debugOrders';
import './App.css';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getCartItemsCount } = useCart();
  const { aboutContent } = useAdminData();
  // wishlist removed
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [contactsActive, setContactsActive] = useState(false);
  
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

  // wishlist removed

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <Link to="/" className="logo">
              <FaTruck />
              ЮТОРС
            </Link>
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
              <button className="icon-button" onClick={handleSearchClick}>
                <FaSearch />
              </button>
              {/* wishlist button removed */}
              <button className="icon-button cart-button" onClick={handleCartClick}>
                <FaShoppingCart />
                {getCartItemsCount() > 0 && (
                  <span className="cart-count">{getCartItemsCount()}</span>
                )}
              </button>
              <button className="mobile-menu-button">
                <FaBars />
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
              <a href={`tel:${footerData.contactsSection.phone.replace(/[^+\d]/g, '')}`}>
                <FaPhone /> {footerData.contactsSection.phone}
              </a>
              <a href={`mailto:${footerData.contactsSection.email}`}>
                <FaEnvelope /> {footerData.contactsSection.email}
              </a>
              <a href="/about#contacts" onClick={(e)=>{e.preventDefault(); navigate('/about#contacts'); setTimeout(()=>{ const el=document.getElementById('contacts'); if(el) el.scrollIntoView({behavior:'smooth'}); },50);}}>
                <FaMapMarkerAlt /> {footerData.contactsSection.address}
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
      
      <SearchModal 
        isOpen={isSearchModalOpen} 
        onClose={closeSearchModal} 
      />
    </div>
  );
}

export default App;
