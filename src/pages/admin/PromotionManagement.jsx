import React, { useState } from 'react';
import { useAdminData } from '../../context/AdminDataContext';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import './PromotionManagement.css';

export default function PromotionManagement() {
  const { promotions, categories, addPromotion, updatePromotion, deletePromotion } = useAdminData();
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount: 0,
    category: '',
    validUntil: '',
    active: true,
    featured: false,
    minPurchase: 15000
  });

  const categoryList = ['Все категории', ...Object.keys(categories)];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const startCreating = () => {
    setIsCreating(true);
    setEditingPromotion(null);
    setFormData({
      title: '',
      description: '',
      discount: 0,
      category: '',
      validUntil: '',
      active: true,
      featured: false,
      minPurchase: 15000
    });
  };

  const startEditing = (promotion) => {
    setEditingPromotion(promotion.id);
    setIsCreating(false);
    setFormData({ ...promotion });
  };

  const cancelEditing = () => {
    setEditingPromotion(null);
    setIsCreating(false);
    setFormData({
      title: '',
      description: '',
      discount: 0,
      category: '',
      validUntil: '',
      active: true,
      featured: false,
      minPurchase: 15000
    });
  };

  const savePromotion = () => {
    if (!formData.title || !formData.description) {
      alert('Заполните обязательные поля!');
      return;
    }

    if (formData.discount < 0 || formData.discount > 100) {
      alert('Скидка должна быть от 0 до 100%!');
      return;
    }

    if (isCreating) {
      addPromotion(formData);
      alert('Акция создана!');
    } else {
      updatePromotion(editingPromotion, formData);
      alert('Акция обновлена!');
    }
    
    cancelEditing();
  };

  const handleDelete = (id) => {
    if (window.confirm('Удалить акцию?')) {
      deletePromotion(id);
      alert('Акция удалена!');
    }
  };

  const togglePromotionStatus = (promotion) => {
    updatePromotion(promotion.id, { ...promotion, active: !promotion.active });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const isExpired = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  return (
    <div className="promotion-management">
      <div className="management-header">
        <h2>Управление акциями</h2>
        <button onClick={startCreating} className="btn-primary">
          <FaPlus /> Добавить акцию
        </button>
      </div>

      {(isCreating || editingPromotion) && (
        <div className="promotion-form">
          <h3>{isCreating ? 'Создание акции' : 'Редактирование акции'}</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Название акции *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Название акции"
              />
            </div>

            <div className="form-group">
              <label>Размер скидки (%) *</label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleInputChange}
                min="0"
                max="100"
              />
            </div>

            <div className="form-group">
              <label>Категория товаров</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              >
                <option value="">Выберите категорию</option>
                {categoryList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Действует до</label>
              <input
                type="date"
                name="validUntil"
                value={formData.validUntil}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group form-group-full">
              <label>Описание акции *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Подробное описание акции"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Минимальная сумма покупки (₽)</label>
              <input
                type="number"
                name="minPurchase"
                value={formData.minPurchase}
                onChange={handleInputChange}
                min="0"
                step="1000"
                placeholder="15000"
              />
            </div>

            <div className="form-group form-group-full">
              <label>
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleInputChange}
                />
                Активная акция
              </label>
            </div>

            <div className="form-group form-group-full">
              <label>
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                />
                🔥 Горячее предложение (отображается в топе)
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button onClick={savePromotion} className="btn-success">
              <FaSave /> Сохранить
            </button>
            <button onClick={cancelEditing} className="btn-secondary">
              <FaTimes /> Отмена
            </button>
          </div>
        </div>
      )}

      <div className="promotions-grid">
        {promotions.length === 0 ? (
          <div className="no-promotions">
            <p>Акций пока нет. Создайте первую акцию!</p>
          </div>
        ) : (
          promotions.map(promotion => (
            <div key={promotion.id} className={`promotion-card ${!promotion.active ? 'inactive' : ''} ${isExpired(promotion.validUntil) ? 'expired' : ''}`}>
              <div className="promotion-header">
                <h3>{promotion.title}</h3>
                <div className="promotion-actions">
                  <button 
                    onClick={() => togglePromotionStatus(promotion)}
                    className={`btn-toggle ${promotion.active ? 'active' : 'inactive'}`}
                    title={promotion.active ? 'Деактивировать' : 'Активировать'}
                  >
                    {promotion.active ? <FaToggleOn /> : <FaToggleOff />}
                  </button>
                  <button 
                    onClick={() => startEditing(promotion)}
                    className="btn-edit"
                    title="Редактировать"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    onClick={() => handleDelete(promotion.id)}
                    className="btn-delete"
                    title="Удалить"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="promotion-content">
                <p className="promotion-description">{promotion.description}</p>
                
                <div className="promotion-details">
                  <div className="promotion-discount">
                    <span className="discount-label">Скидка:</span>
                    <span className="discount-value">{promotion.discount}%</span>
                  </div>
                  
                  {promotion.category && (
                    <div className="promotion-category">
                      <span className="category-label">Категория:</span>
                      <span className="category-value">{promotion.category}</span>
                    </div>
                  )}
                  
                  {promotion.validUntil && (
                    <div className="promotion-validity">
                      <span className="validity-label">Действует до:</span>
                      <span className={`validity-value ${isExpired(promotion.validUntil) ? 'expired' : ''}`}>
                        {formatDate(promotion.validUntil)}
                      </span>
                    </div>
                  )}
                  
                  {promotion.minPurchase && (
                    <div className="promotion-min-purchase">
                      <span className="min-purchase-label">Минимальная сумма:</span>
                      <span className="min-purchase-value">{promotion.minPurchase.toLocaleString()} ₽</span>
                    </div>
                  )}
                </div>

                <div className="promotion-status">
                  {promotion.featured && <span className="status-featured">🔥 Горячее предложение</span>}
                  {!promotion.active && <span className="status-inactive">Неактивна</span>}
                  {isExpired(promotion.validUntil) && <span className="status-expired">Срок истёк</span>}
                  {promotion.active && !isExpired(promotion.validUntil) && <span className="status-active">Активна</span>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
