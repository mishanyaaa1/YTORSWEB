import React, { useState } from 'react';
import { useAdminData } from '../../context/AdminDataContext';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import './PromotionManagement.css';

const initialFormState = {
  title: '', description: '', discount: '', category: 'Все категории',
  validUntil: '', active: true, featured: false, minPurchase: ''
};

export default function PromotionManagement() {
  const { promotions, categories, addPromotion, updatePromotion, deletePromotion } = useAdminData();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [formData, setFormData] = useState(initialFormState);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const startEditing = (promo) => {
    setEditingPromotion(promo);
    setFormData({ ...initialFormState, ...promo });
    setIsFormVisible(true);
  };

  const startCreating = () => {
    setEditingPromotion(null);
    setFormData(initialFormState);
    setIsFormVisible(true);
  };

  const cancelForm = () => {
    setIsFormVisible(false);
    setEditingPromotion(null);
    setFormData(initialFormState);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const promoData = {
      ...formData,
      discount: parseInt(formData.discount) || 0,
      minPurchase: parseFloat(formData.minPurchase) || 0
    };

    if (editingPromotion) {
      updatePromotion(editingPromotion.id, promoData);
    } else {
      addPromotion(promoData);
    }
    cancelForm();
  };
  
  const formatDate = (date) => date ? new Date(date).toLocaleDateString('ru-RU') : 'Бессрочно';

  return (
    <div className="promotion-management-page">
      <div className="page-controls">
        {!isFormVisible && (
          <button onClick={startCreating} className="add-promotion-btn">
            <FaPlus /> Добавить акцию
          </button>
        )}
      </div>

      {isFormVisible && (
        <div className="promotion-form-container">
          <h3>{editingPromotion ? 'Редактировать акцию' : 'Новая акция'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Название</label>
                <input name="title" value={formData.title} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Скидка (%)</label>
                <input name="discount" type="number" value={formData.discount} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Категория</label>
                <select name="category" value={formData.category} onChange={handleInputChange}>
                  <option value="Все категории">Все категории</option>
                  {Object.keys(categories).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Действует до</label>
                <input name="validUntil" type="date" value={formData.validUntil} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Мин. сумма покупки (₽)</label>
                <input name="minPurchase" type="number" value={formData.minPurchase} onChange={handleInputChange} />
              </div>
              <div className="form-group full-width">
                <label>Описание</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" required></textarea>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" name="active" checked={formData.active} onChange={handleInputChange} />
                  Активна
                </label>
              </div>
               <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" name="featured" checked={formData.featured} onChange={handleInputChange} />
                  🔥 Избранная
                </label>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="save-btn"><FaSave /> Сохранить</button>
              <button type="button" onClick={cancelForm} className="cancel-btn"><FaTimes /> Отмена</button>
            </div>
          </form>
        </div>
      )}

      <div className="promotions-list">
        {promotions.map(promo => (
          <div key={promo.id} className={`promotion-card ${promo.active ? '' : 'inactive'}`}>
            <div className="promo-header">
              <h4>{promo.title}</h4>
              <div className="promo-actions">
                <button onClick={() => updatePromotion(promo.id, {...promo, active: !promo.active})}>
                  {promo.active ? <FaToggleOn /> : <FaToggleOff />}
                </button>
                <button onClick={() => startEditing(promo)}><FaEdit /></button>
                <button onClick={() => deletePromotion(promo.id)}><FaTrash /></button>
              </div>
            </div>
            <p className="promo-description">{promo.description}</p>
            <div className="promo-details">
              <span className="promo-discount">{promo.discount}%</span>
              <span>Категория: {promo.category}</span>
              <span>До: {formatDate(promo.validUntil)}</span>
              <span>От: {promo.minPurchase.toLocaleString()} ₽</span>
            </div>
            {promo.featured && <span className="promo-featured-badge">🔥</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
