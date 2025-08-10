import React, { useState, useMemo } from 'react';
import { FaSearch, FaEye, FaTrash, FaPlus } from 'react-icons/fa';
import { useOrders } from '../../context/OrdersContext';
import './OrderManagement.css';

const OrderDetailsModal = ({ order, onClose, onStatusChange, onAddNote }) => {
  const [note, setNote] = useState('');
  const { STATUS_LABELS } = useOrders();

  if (!order) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Заказ #{order.orderNumber}</h3>
          <button onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {/* Customer info, items, pricing, notes */}
          <h4>Клиент</h4>
          <p>{order.orderForm.name}, {order.orderForm.phone}</p>
          <h4>Состав заказа</h4>
          {/* ... display items ... */}
           <div className="form-group">
            <label>Статус</label>
            <select value={order.status} onChange={e => onStatusChange(order.id, e.target.value)}>
              {Object.entries(STATUS_LABELS).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Заметка</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows="2"></textarea>
            <button onClick={() => { onAddNote(order.id, note); setNote(''); }}>Добавить</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function OrderManagement() {
  const { orders, updateOrderStatus, addOrderNote, deleteOrder, searchOrders, STATUS_LABELS, STATUS_COLORS } = useOrders();
  const [filter, setFilter] = useState({ query: '', status: 'all' });
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = useMemo(() => {
    let result = filter.query ? searchOrders(filter.query) : orders;
    if (filter.status !== 'all') {
      result = result.filter(o => o.status === filter.status);
    }
    return result;
  }, [orders, filter, searchOrders]);

  return (
    <div className="order-management-page">
      <div className="page-controls">
        <div className="search-input-wrapper">
          <FaSearch />
          <input 
            type="text" 
            placeholder="Поиск..." 
            value={filter.query} 
            onChange={e => setFilter(f => ({...f, query: e.target.value}))} 
          />
        </div>
        <select value={filter.status} onChange={e => setFilter(f => ({...f, status: e.target.value}))}>
          <option value="all">Все статусы</option>
          {Object.entries(STATUS_LABELS).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
        </select>
      </div>

      <div className="order-list-table">
        <table>
          <thead>
            <tr>
              <th>Номер</th>
              <th>Клиент</th>
              <th>Сумма</th>
              <th>Статус</th>
              <th>Дата</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id}>
                <td>#{order.orderNumber}</td>
                <td>{order.orderForm.name}</td>
                <td>{order.priceCalculation.total.toLocaleString()} ₽</td>
                <td>
                  <span className="status-badge" style={{'--status-color': STATUS_COLORS[order.status]}}>
                    {STATUS_LABELS[order.status]}
                  </span>
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => setSelectedOrder(order)} className="edit-btn"><FaEye /></button>
                    <button onClick={() => deleteOrder(order.id)} className="delete-btn"><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={updateOrderStatus}
          onAddNote={addOrderNote}
        />
      )}
    </div>
  );
}
