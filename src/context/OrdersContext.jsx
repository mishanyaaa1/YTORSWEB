import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiGet, apiPost, apiPatch, apiDelete } from '../utils/api';
import { API_CONFIG } from '../config/api';

const OrdersContext = createContext();

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
};

// Статусы заказов
export const ORDER_STATUSES = {
  NEW: 'new',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

// Названия статусов на русском
export const STATUS_LABELS = {
  [ORDER_STATUSES.NEW]: 'Новый',
  [ORDER_STATUSES.CONFIRMED]: 'Подтвержден',
  [ORDER_STATUSES.PROCESSING]: 'В обработке',
  [ORDER_STATUSES.SHIPPED]: 'Отправлен',
  [ORDER_STATUSES.DELIVERED]: 'Доставлен',
  [ORDER_STATUSES.CANCELLED]: 'Отменен'
};

// Цвета для статусов
export const STATUS_COLORS = {
  [ORDER_STATUSES.NEW]: '#3b82f6',
  [ORDER_STATUSES.CONFIRMED]: '#28a745',
  [ORDER_STATUSES.PROCESSING]: '#8b5cf6',
  [ORDER_STATUSES.SHIPPED]: '#28a745',
  [ORDER_STATUSES.DELIVERED]: '#28a745',
  [ORDER_STATUSES.CANCELLED]: '#ef4444'
};

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);

  // Загрузка заказов с сервера при инициализации
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await apiGet(API_CONFIG.ENDPOINTS.ORDERS);
        if (!response.ok) throw new Error('Failed to load orders');
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Ошибка при загрузке заказов с сервера:', error);
        setOrders([]);
      }
    };
    loadOrders();
  }, []);

  // Создать новый заказ
  const createOrder = async (orderData) => {
    try {
      const response = await apiPost(API_CONFIG.ENDPOINTS.ORDERS, orderData);
      if (!response.ok) throw new Error('Failed to create order');
      const saved = await response.json();

      // Обновляем локальное состояние свежей копией с сервера
      const listResponse = await apiGet(API_CONFIG.ENDPOINTS.ORDERS);
      const list = await listResponse.json();
      setOrders(Array.isArray(list) ? list : []);

      return saved;
    } catch (error) {
      console.error('Ошибка при создании заказа на сервере:', error);
      throw error;
    }
  };

  // Обновить статус заказа
  const updateOrderStatus = async (orderId, newStatus, note = '') => {
    try {
      console.log('🔄 Updating order status:', orderId, '→', newStatus);
      const statusResponse = await apiPatch(`${API_CONFIG.ENDPOINTS.ORDERS}/${orderId}/status`, { status: newStatus });
      
      if (!statusResponse.ok) {
        const error = await statusResponse.json();
        throw new Error(error.error || 'Failed to update status');
      }
      
      if (note) {
        const noteResponse = await apiPost(`${API_CONFIG.ENDPOINTS.ORDERS}/${orderId}/notes`, { text: note, type: 'status_change' });
        if (!noteResponse.ok) {
          console.warn('Failed to add note, but status was updated');
        }
      }
      
      // Обновляем список заказов только после успешного обновления
      const listResponse = await apiGet(API_CONFIG.ENDPOINTS.ORDERS);
      if (listResponse.ok) {
        const list = await listResponse.json();
        setOrders(Array.isArray(list) ? list : []);
        console.log('✅ Order status updated successfully');
      }
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      // Можно показать toast/уведомление пользователю
      alert('Ошибка обновления статуса заказа: ' + error.message);
      throw error; // Пробрасываем ошибку дальше
    }
  };

  // Добавить заметку к заказу
  const addOrderNote = async (orderId, noteText) => {
    try {
      console.log('📝 Adding note to order:', orderId);
      const noteResponse = await apiPost(`${API_CONFIG.ENDPOINTS.ORDERS}/${orderId}/notes`, { text: noteText, type: 'note' });
      
      if (!noteResponse.ok) {
        const error = await noteResponse.json();
        throw new Error(error.error || 'Failed to add note');
      }
      
      // Обновляем список заказов только после успешного добавления заметки
      const listResponse = await apiGet(API_CONFIG.ENDPOINTS.ORDERS);
      if (listResponse.ok) {
        const list = await listResponse.json();
        setOrders(Array.isArray(list) ? list : []);
        console.log('✅ Note added successfully');
      }
    } catch (error) {
      console.error('❌ Error adding note:', error);
      alert('Ошибка добавления заметки: ' + error.message);
      throw error;
    }
  };

  // Получить заказ по ID
  const getOrderById = (orderId) => {
    return orders.find(order => order.id === orderId);
  };

  // Получить заказы по статусу
  const getOrdersByStatus = (status) => {
    return orders.filter(order => order.status === status);
  };

  // Получить статистику заказов
  const getOrdersStats = () => {
    const stats = {
      total: orders.length,
      byStatus: {},
      totalRevenue: 0,
      recentOrders: orders.slice(0, 5)
    };

    // Подсчет по статусам
    Object.values(ORDER_STATUSES).forEach(status => {
      stats.byStatus[status] = orders.filter(order => order.status === status).length;
    });

    // Подсчет общей выручки (только доставленные заказы)
    stats.totalRevenue = orders
      .filter(order => order.status === ORDER_STATUSES.DELIVERED)
      .reduce((sum, order) => sum + (order.pricing?.total || 0), 0);

    return stats;
  };

  // Удалить заказ (только для отмененных заказов) — серверный hard delete
  const deleteOrder = async (orderId) => {
    try {
      await apiDelete(`${API_CONFIG.ENDPOINTS.ORDERS}/${orderId}`);
      const listResponse = await apiGet(API_CONFIG.ENDPOINTS.ORDERS);
      const list = await listResponse.json();
      setOrders(Array.isArray(list) ? list : []);
    } catch (e) {
      setOrders(prev => prev.filter(order => order.id !== orderId));
    }
  };

  // Поиск заказов
  const searchOrders = (query) => {
    const lowercaseQuery = query.toLowerCase();
    return orders.filter(order => 
      order.orderNumber.toLowerCase().includes(lowercaseQuery) ||
      order.customerInfo.name.toLowerCase().includes(lowercaseQuery) ||
      order.customerInfo.phone.includes(lowercaseQuery) ||
      (order.customerInfo.email && order.customerInfo.email.toLowerCase().includes(lowercaseQuery))
    );
  };

  const value = {
    orders,
    createOrder,
    updateOrderStatus,
    addOrderNote,
    getOrderById,
    getOrdersByStatus,
    getOrdersStats,
    deleteOrder,
    searchOrders,
    ORDER_STATUSES,
    STATUS_LABELS,
    STATUS_COLORS
  };

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
};
