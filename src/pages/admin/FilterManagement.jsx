import React, { useState, useEffect } from 'react';
import { useAdminData } from '../../context/AdminDataContext';
import { FaSave, FaFilter, FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import './FilterManagement.css';

export default function FilterManagement() {
  const { filterSettings, updateFilterSettings, addFilter, removeFilter, updateFilter, toggleFilter } = useAdminData();
  
  // Состояние для нового фильтра
  const [newFilter, setNewFilter] = useState({
    name: '',
    type: 'select',
    description: ''
  });

  // Состояние для редактирования фильтра
  const [editingFilter, setEditingFilter] = useState(null);

  const handleNewFilterChange = (field, value) => {
    setNewFilter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddFilter = () => {
    if (!newFilter.name.trim()) {
      alert('Введите название фильтра!');
      return;
    }
    
    addFilter(newFilter);
    setNewFilter({ name: '', type: 'select', description: '' });
    alert('Фильтр добавлен!');
  };

  const handleRemoveFilter = (filterId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот фильтр?')) {
      removeFilter(filterId);
      alert('Фильтр удален!');
    }
  };

  const handleEditFilter = (filter) => {
    setEditingFilter(filter);
  };

  const handleSaveEdit = () => {
    if (!editingFilter.name.trim()) {
      alert('Введите название фильтра!');
      return;
    }
    
    updateFilter(editingFilter.id, editingFilter);
    setEditingFilter(null);
    alert('Фильтр обновлен!');
  };

  const handleCancelEdit = () => {
    setEditingFilter(null);
  };

  const resetToDefaults = () => {
    const defaultFilters = [
      { id: 'category', name: 'Категория', key: 'showCategoryFilter', enabled: true, type: 'select', description: 'Основная категория товара (Двигатель, Трансмиссия и т.д.)' },
      { id: 'subcategory', name: 'Подкатегория', key: 'showSubcategoryFilter', enabled: true, type: 'select', description: 'Подкатегория товара (Основные узлы, Фильтры и т.д.)' },
      { id: 'brand', name: 'Производитель', key: 'showBrandFilter', enabled: true, type: 'select', description: 'Бренд/производитель товара' },
      { id: 'price', name: 'Цена', key: 'showPriceFilter', enabled: true, type: 'range', description: 'Диапазон цен товара' },
      { id: 'stock', name: 'В наличии', key: 'showStockFilter', enabled: true, type: 'checkbox', description: 'Показывать только товары в наличии' }
    ];
    
    updateFilterSettings({ filters: defaultFilters });
    alert('Фильтры сброшены к значениям по умолчанию!');
  };

  return (
    <div className="filter-management">
      <div className="filter-management-header">
        <div className="header-content">
          <FaFilter className="header-icon" />
          <div>
            <h2>Управление фильтрами каталога</h2>
            <p>Настройте, какие фильтры будут доступны пользователям в каталоге товаров</p>
          </div>
        </div>
      </div>

      <div className="filter-management-content">
        <div className="info-section">
          <h3>Информация</h3>
          <p>
            Отключенные фильтры не будут отображаться в каталоге товаров. 
            Это позволяет упростить интерфейс для пользователей, если какие-то фильтры не нужны.
          </p>
          <div className="info-cards">
            <div className="info-card">
              <strong>Фильтр "Категория"</strong>
              <p>Основные категории товаров (Двигатель, Трансмиссия, Ходовая часть и т.д.)</p>
            </div>
            <div className="info-card">
              <strong>Фильтр "Подкатегория"</strong>
              <p>Подразделы внутри категорий (Основные узлы, Фильтры, Масла и т.д.)</p>
            </div>
            <div className="info-card">
              <strong>Фильтр "Производитель"</strong>
              <p>Бренды и производители товаров</p>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <div className="section-header">
            <h3>Управление фильтрами</h3>
            <button onClick={resetToDefaults} className="reset-btn">
              Сбросить к умолчанию
            </button>
          </div>

          {/* Форма добавления нового фильтра */}
          <div className="add-filter-form">
            <h4>Добавить новый фильтр</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Название фильтра:</label>
                <input
                  type="text"
                  value={newFilter.name}
                  onChange={(e) => handleNewFilterChange('name', e.target.value)}
                  placeholder="Например: Размер, Цвет, Материал"
                />
              </div>
              <div className="form-group">
                <label>Тип фильтра:</label>
                <select
                  value={newFilter.type}
                  onChange={(e) => handleNewFilterChange('type', e.target.value)}
                >
                  <option value="select">Выпадающий список</option>
                  <option value="checkbox">Чекбокс</option>
                  <option value="range">Диапазон</option>
                  <option value="text">Текстовое поле</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Описание:</label>
              <textarea
                value={newFilter.description}
                onChange={(e) => handleNewFilterChange('description', e.target.value)}
                placeholder="Краткое описание фильтра"
                rows={2}
              />
            </div>
            <button onClick={handleAddFilter} className="add-btn">
              <FaPlus /> Добавить фильтр
            </button>
          </div>

          {/* Список существующих фильтров */}
          <div className="existing-filters">
            <h4>Существующие фильтры</h4>
            <div className="filter-list">
              {filterSettings.filters.map((filter) => (
                <div key={filter.id} className={`filter-item ${filter.enabled ? 'enabled' : 'disabled'}`}>
                  <div className="filter-header">
                    <div className="filter-info">
                      <input
                        type="checkbox"
                        checked={filter.enabled}
                        onChange={() => toggleFilter(filter.id)}
                        className="filter-toggle"
                      />
                      <span className="filter-name">{filter.name}</span>
                      <span className="filter-type">({filter.type})</span>
                    </div>
                    <div className="filter-actions">
                      <button
                        onClick={() => handleEditFilter(filter)}
                        className="edit-btn"
                        title="Редактировать"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleRemoveFilter(filter.id)}
                        className="remove-btn"
                        title="Удалить"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  <div className="filter-description">{filter.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="preview-section">
          <h3>Предварительный просмотр</h3>
          <p>Так будут выглядеть фильтры в каталоге:</p>
          <div className="filter-preview">
            <div className="preview-filters">
              <h4>Фильтры</h4>
              {filterSettings.filters.filter(f => f.enabled).map((filter) => (
                <div key={filter.id} className="preview-filter">
                  <label>{filter.name}</label>
                  {filter.type === 'select' && (
                    <div className="preview-select">Все</div>
                  )}
                  {filter.type === 'checkbox' && (
                    <div className="preview-checkbox">
                      <input type="checkbox" disabled />
                    </div>
                  )}
                  {filter.type === 'range' && (
                    <div className="preview-price-range">
                      <span>от</span> - <span>до</span>
                    </div>
                  )}
                  {filter.type === 'text' && (
                    <div className="preview-text">
                      <input type="text" disabled placeholder="Введите значение..." />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно редактирования фильтра */}
      {editingFilter && (
        <div className="edit-modal-overlay">
          <div className="edit-modal">
            <div className="modal-header">
              <h3>Редактировать фильтр</h3>
              <button onClick={handleCancelEdit} className="close-btn">
                <FaTimes />
              </button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>Название фильтра:</label>
                <input
                  type="text"
                  value={editingFilter.name}
                  onChange={(e) => setEditingFilter(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Тип фильтра:</label>
                <select
                  value={editingFilter.type}
                  onChange={(e) => setEditingFilter(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="select">Выпадающий список</option>
                  <option value="checkbox">Чекбокс</option>
                  <option value="range">Диапазон</option>
                  <option value="text">Текстовое поле</option>
                </select>
              </div>
              <div className="form-group">
                <label>Описание:</label>
                <textarea
                  value={editingFilter.description}
                  onChange={(e) => setEditingFilter(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={handleCancelEdit} className="cancel-btn">
                Отмена
              </button>
              <button onClick={handleSaveEdit} className="save-btn">
                <FaSave /> Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
