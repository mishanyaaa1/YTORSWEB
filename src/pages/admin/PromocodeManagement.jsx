import React, { useState } from 'react';
import { useAdminData } from '../../context/AdminDataContext';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaToggleOn, FaToggleOff, FaCopy } from 'react-icons/fa';
import './PromocodeManagement.css';

export default function PromocodeManagement() {
  const { promocodes, addPromocode, updatePromocode, deletePromocode } = useAdminData();
  const [editingPromocode, setEditingPromocode] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount: 0,
    discountType: 'percent', // 'percent' или 'fixed'
    maxDiscount: 0, // Максимальная скидка для процентной скидки
    minPurchase: 0,
    validFrom: '',
    validUntil: '',
    active: true,
    stackable: false, // Суммировать с другими акциями
    usageLimit: 0, // Лимит использования (0 = безлимит)
    usedCount: 0 // Количество использований
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const generatePromocode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code: result }));
  };

  const startCreating = () => {
    setIsCreating(true);
    setEditingPromocode(null);
    setFormData({
      code: '',
      description: '',
      discount: 0,
      discountType: 'percent',
      maxDiscount: 0,
      minPurchase: 0,
      validFrom: '',
      validUntil: '',
      active: true,
      stackable: false,
      usageLimit: 0,
      usedCount: 0
    });
  };

  const startEditing = (promocode) => {
    setEditingPromocode(promocode.id);
    setIsCreating(false);
    setFormData({ ...promocode });
  };

  const cancelEditing = () => {
    setEditingPromocode(null);
    setIsCreating(false);
    setFormData({
      code: '',
      description: '',
      discount: 0,
      discountType: 'percent',
      maxDiscount: 0,
      minPurchase: 0,
      validFrom: '',
      validUntil: '',
      active: true,
      stackable: false,
      usageLimit: 0,
      usedCount: 0
    });
  };

  const savePromocode = () => {
    if (!formData.code || !formData.description) {
      alert('Заполните обязательные поля!');
      return;
    }

    if (formData.discount <= 0) {
      alert('Скидка должна быть больше 0!');
      return;
    }

    if (formData.discountType === 'percent' && formData.discount > 100) {
      alert('Процентная скидка не может быть больше 100%!');
      return;
    }

    if (isCreating) {
      addPromocode(formData);
      alert('Промокод создан!');
    } else {
      updatePromocode(editingPromocode, formData);
      alert('Промокод обновлен!');
    }
    
    cancelEditing();
  };

  const handleDelete = (id) => {
    if (window.confirm('Удалить промокод?')) {
      deletePromocode(id);
      alert('Промокод удален!');
    }
  };

  const togglePromocodeStatus = (promocode) => {
    updatePromocode(promocode.id, { ...promocode, active: !promocode.active });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const isExpired = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  const isNotStarted = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) > new Date();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Промокод скопирован в буфер обмена!');
  };

  return (
    <div className="promocode-management">
      <div className="management-header">
        <button onClick={startCreating} className="btn-primary">
          <FaPlus /> Добавить промокод
        </button>
      </div>

      {(isCreating || editingPromocode) && (
        <div className="promocode-form">
          <h3>{isCreating ? 'Создание промокода' : 'Редактирование промокода'}</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Код промокода *</label>
              <div className="code-input-group">
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="Введите код промокода"
                  maxLength="20"
                />
                <button type="button" onClick={generatePromocode} className="btn-generate">
                  Сгенерировать
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Описание *</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Описание промокода"
              />
            </div>

            <div className="form-group">
              <label>Тип скидки</label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleInputChange}
              >
                <option value="percent">Процентная (%)</option>
                <option value="fixed">Фиксированная (₽)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Размер скидки *</label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleInputChange}
                min="0"
                max={formData.discountType === 'percent' ? 100 : 999999}
                step={formData.discountType === 'percent' ? 1 : 100}
              />
            </div>

            {formData.discountType === 'percent' && (
              <div className="form-group">
                <label>Максимальная скидка (₽)</label>
                <input
                  type="number"
                  name="maxDiscount"
                  value={formData.maxDiscount}
                  onChange={handleInputChange}
                  min="0"
                  step="100"
                  placeholder="0 = без ограничений"
                />
              </div>
            )}

            <div className="form-group">
              <label>Минимальная сумма покупки (₽)</label>
              <input
                type="number"
                name="minPurchase"
                value={formData.minPurchase}
                onChange={handleInputChange}
                min="0"
                step="100"
                placeholder="0 = без ограничений"
              />
            </div>

            <div className="form-group">
              <label>Действует с</label>
              <input
                type="date"
                name="validFrom"
                value={formData.validFrom}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Действует до</label>
              <input
                type="date"
                name="validUntil"
                value={formData.validUntil}
                onChange={handleInputChange}
                min={formData.validFrom || new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label>Лимит использования</label>
              <input
                type="number"
                name="usageLimit"
                value={formData.usageLimit}
                onChange={handleInputChange}
                min="0"
                placeholder="0 = безлимит"
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
                Активный промокод
              </label>
            </div>

            <div className="form-group form-group-full">
              <label>
                <input
                  type="checkbox"
                  name="stackable"
                  checked={formData.stackable}
                  onChange={handleInputChange}
                />
                Суммировать с другими акциями
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button onClick={savePromocode} className="btn-success">
              <FaSave /> Сохранить
            </button>
            <button onClick={cancelEditing} className="btn-secondary">
              <FaTimes /> Отмена
            </button>
          </div>
        </div>
      )}

      <div className="promocodes-grid">
        {promocodes.length === 0 ? (
          <div className="no-promocodes">
            <p>Промокодов пока нет. Создайте первый промокод!</p>
          </div>
        ) : (
          promocodes.map(promocode => (
            <div key={promocode.id} className={`promocode-card ${!promocode.active ? 'inactive' : ''} ${isExpired(promocode.validUntil) ? 'expired' : ''} ${isNotStarted(promocode.validFrom) ? 'not-started' : ''}`}>
              <div className="promocode-header">
                <h3>{promocode.description}</h3>
                <div className="promocode-actions">
                  <button 
                    onClick={() => togglePromocodeStatus(promocode)}
                    className={`btn-toggle ${promocode.active ? 'active' : 'inactive'}`}
                    title={promocode.active ? 'Деактивировать' : 'Активировать'}
                  >
                    {promocode.active ? <FaToggleOn /> : <FaToggleOff />}
                  </button>
                  <button 
                    onClick={() => copyToClipboard(promocode.code)}
                    className="btn-copy"
                    title="Копировать код"
                  >
                    <FaCopy />
                  </button>
                  <button 
                    onClick={() => startEditing(promocode)}
                    className="btn-edit"
                    title="Редактировать"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    onClick={() => handleDelete(promocode.id)}
                    className="btn-delete"
                    title="Удалить"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="promocode-content">
                <div className="promocode-code">
                  <span className="code-label">Код:</span>
                  <span className="code-value">{promocode.code}</span>
                </div>
                
                <div className="promocode-details">
                  <div className="promocode-discount">
                    <span className="discount-label">Скидка:</span>
                    <span className="discount-value">
                      {promocode.discountType === 'percent' ? `${promocode.discount}%` : `${promocode.discount} ₽`}
                    </span>
                  </div>
                  
                  {promocode.discountType === 'percent' && promocode.maxDiscount > 0 && (
                    <div className="promocode-max-discount">
                      <span className="max-discount-label">Макс. скидка:</span>
                      <span className="max-discount-value">{promocode.maxDiscount} ₽</span>
                    </div>
                  )}
                  
                  {promocode.minPurchase > 0 && (
                    <div className="promocode-min-purchase">
                      <span className="min-purchase-label">Мин. сумма:</span>
                      <span className="min-purchase-value">{promocode.minPurchase.toLocaleString()} ₽</span>
                    </div>
                  )}
                  
                  {promocode.validFrom && (
                    <div className="promocode-validity">
                      <span className="validity-label">Действует с:</span>
                      <span className="validity-value">{formatDate(promocode.validFrom)}</span>
                    </div>
                  )}
                  
                  {promocode.validUntil && (
                    <div className="promocode-validity">
                      <span className="validity-label">Действует до:</span>
                      <span className={`validity-value ${isExpired(promocode.validUntil) ? 'expired' : ''}`}>
                        {formatDate(promocode.validUntil)}
                      </span>
                    </div>
                  )}
                  
                  {promocode.usageLimit > 0 && (
                    <div className="promocode-usage">
                      <span className="usage-label">Использований:</span>
                      <span className="usage-value">{promocode.usedCount || 0} / {promocode.usageLimit}</span>
                    </div>
                  )}
                </div>

                <div className="promocode-status">
                  {promocode.stackable && <span className="status-stackable">🔄 Суммируется с акциями</span>}
                  {!promocode.active && <span className="status-inactive">Неактивен</span>}
                  {isExpired(promocode.validUntil) && <span className="status-expired">Срок истёк</span>}
                  {isNotStarted(promocode.validFrom) && <span className="status-not-started">Ещё не начался</span>}
                  {promocode.active && !isExpired(promocode.validUntil) && !isNotStarted(promocode.validFrom) && <span className="status-active">Активен</span>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
