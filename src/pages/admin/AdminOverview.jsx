import React from 'react';
import { Link } from 'react-router-dom';
import { FaBox, FaPercent, FaShoppingCart, FaPlus, FaEye } from 'react-icons/fa';
import { useAdminData } from '../../context/AdminDataContext';
import { useOrders } from '../../context/OrdersContext';
import './AdminOverview.css';

function AdminOverview() {
  const { products, promotions } = useAdminData();
  const { orders } = useOrders();

  const stats = [
    { label: 'Всего товаров', value: products.length, icon: <FaBox />, link: '/admin/dashboard/products' },
    { label: 'Активных акций', value: promotions.filter(p => p.active).length, icon: <FaPercent />, link: '/admin/dashboard/promotions' },
    { label: 'Новых заказов', value: orders.filter(o => o.status === 'new').length, icon: <FaShoppingCart />, link: '/admin/dashboard/orders' },
  ];

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="admin-overview-page">
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <Link to={stat.link} key={index} className="stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-info">
              <p className="stat-value">{stat.value}</p>
              <p className="stat-label">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="overview-columns">
        <div className="quick-actions-card">
          <h3>Быстрые действия</h3>
          <div className="actions-list">
            <Link to="/admin/dashboard/products/new" className="action-button">
              <FaPlus /> Добавить товар
            </Link>
            <Link to="/admin/dashboard/promotions/new" className="action-button">
              <FaPercent /> Создать акцию
            </Link>
            <a href="/" target="_blank" rel="noopener noreferrer" className="action-button">
              <FaEye /> Посмотреть сайт
            </a>
          </div>
        </div>

        <div className="recent-orders-card">
          <h3>Последние заказы</h3>
          {recentOrders.length > 0 ? (
            <div className="orders-list">
              {recentOrders.map(order => (
                <div key={order.id} className="order-item">
                  <div className="order-info">
                    <p className="order-number">Заказ #{order.orderNumber}</p>
                    <p className="order-customer">{order.orderForm.name}</p>
                  </div>
                  <div className="order-details">
                    <p className="order-total">{order.priceCalculation.total.toLocaleString()} ₽</p>
                    <span className={`order-status status-${order.status || 'new'}`}>{order.status || 'Новый'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>Новых заказов пока нет.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminOverview;
