import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import './CartNotification.css';

const CartNotification = ({ notifications, removeNotification }) => {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="cart-notifications">
      {notifications.map(notification => (
        <div key={notification.id} className="cart-notification">
          <div className="notification-icon">
            <FaCheck />
          </div>
          <div className="notification-content">
            <div className="notification-title">Товар добавлен в корзину</div>
            <div className="notification-product">{notification.productTitle}</div>
          </div>
          <button 
            className="notification-close"
            onClick={() => removeNotification(notification.id)}
          >
            <FaTimes />
          </button>
        </div>
      ))}
    </div>
  );
};

export default CartNotification;
