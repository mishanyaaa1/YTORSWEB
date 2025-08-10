import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { 
  FaBox, FaPercent, FaFileAlt, FaShoppingCart, FaChartLine, 
  FaSignOutAlt, FaBars, FaTimes, FaHome 
} from 'react-icons/fa';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  useEffect(() => {
    if (!localStorage.getItem('adminAuth')) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin');
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: <FaChartLine />, label: 'Обзор', exact: true },
    { path: '/admin/dashboard/products', icon: <FaBox />, label: 'Товары' },
    { path: '/admin/dashboard/orders', icon: <FaShoppingCart />, label: 'Заказы' },
    { path: '/admin/dashboard/promotions', icon: <FaPercent />, label: 'Акции' },
    { path: '/admin/dashboard/content', icon: <FaFileAlt />, label: 'Контент' },
  ];

  const isActive = (path, exact) => exact ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Панель</h3>
          <button className="sidebar-close-btn" onClick={() => setIsSidebarOpen(false)}>
            <FaTimes />
          </button>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <Link key={item.path} to={item.path} className={`nav-link ${isActive(item.path, item.exact) ? 'active' : ''}`}>
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <Link to="/" className="nav-link">
            <FaHome />
            <span>Вернуться на сайт</span>
          </Link>
          <button onClick={handleLogout} className="nav-link logout-btn">
            <FaSignOutAlt />
            <span>Выйти</span>
          </button>
        </div>
      </aside>

      <div className="admin-main-content">
        <header className="admin-header">
          <button className="sidebar-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <FaBars />
          </button>
          <h2>{menuItems.find(item => isActive(item.path, item.exact))?.label || 'Панель'}</h2>
        </header>
        <main className="admin-page-content">
          <Outlet />
        </main>
      </div>
      
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}
    </div>
  );
}

export default AdminDashboard;
