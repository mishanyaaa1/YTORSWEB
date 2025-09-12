import React, { useState, useEffect } from 'react';
import { useAdminData } from '../../context/AdminDataContext';
import { FaSave, FaFilter } from 'react-icons/fa';
import './FilterManagement.css';

export default function FilterManagement() {
  const { filterSettings, updateFilterSettings } = useAdminData();
  
  // Состояние для настроек фильтров
  const [filterFormData, setFilterFormData] = useState({
    showBrandFilter: filterSettings.showBrandFilter,
    showCategoryFilter: filterSettings.showCategoryFilter,
    showSubcategoryFilter: filterSettings.showSubcategoryFilter,
    showPriceFilter: filterSettings.showPriceFilter,
    showStockFilter: filterSettings.showStockFilter
  });

  // Синхронизируем с данными контекста при изменении
  useEffect(() => {
    setFilterFormData({
      showBrandFilter: filterSettings.showBrandFilter,
      showCategoryFilter: filterSettings.showCategoryFilter,
      showSubcategoryFilter: filterSettings.showSubcategoryFilter,
      showPriceFilter: filterSettings.showPriceFilter,
      showStockFilter: filterSettings.showStockFilter
    });
  }, [filterSettings]);

  const handleFilterSettingChange = (setting, value) => {
    setFilterFormData(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const saveFilterSettings = async () => {
    try {
      await updateFilterSettings(filterFormData);
      alert('Настройки фильтров сохранены!');
    } catch (error) {
      console.error('FilterManagement: Error saving filter settings:', error);
      alert('Ошибка при сохранении настроек фильтров!');
    }
  };

  const resetToDefaults = () => {
    const defaultSettings = {
      showBrandFilter: true,
      showCategoryFilter: true,
      showSubcategoryFilter: true,
      showPriceFilter: true,
      showStockFilter: true
    };
    setFilterFormData(defaultSettings);
  };

  return (
    <div className="filter-management">
      <div className="filter-management-header">
        <div className="filter-header-content">
          <FaFilter className="filter-header-icon" />
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
            <h3>Настройки отображения фильтров</h3>
            <button onClick={resetToDefaults} className="reset-btn">
              Включить все фильтры
            </button>
          </div>
          
          <div className="filter-settings-grid">
            <div className="filter-setting-item">
              <label className="filter-setting-label">
                <input
                  type="checkbox"
                  checked={filterFormData.showCategoryFilter}
                  onChange={(e) => handleFilterSettingChange('showCategoryFilter', e.target.checked)}
                />
                <span className="filter-setting-text">
                  <strong>Фильтр "Категория"</strong>
                  <small>Основная категория товара (Двигатель, Трансмиссия и т.д.)</small>
                </span>
              </label>
            </div>

            <div className="filter-setting-item">
              <label className="filter-setting-label">
                <input
                  type="checkbox"
                  checked={filterFormData.showSubcategoryFilter}
                  onChange={(e) => handleFilterSettingChange('showSubcategoryFilter', e.target.checked)}
                />
                <span className="filter-setting-text">
                  <strong>Фильтр "Подкатегория"</strong>
                  <small>Подкатегория товара (Основные узлы, Фильтры и т.д.)</small>
                </span>
              </label>
            </div>

            <div className="filter-setting-item highlight">
              <label className="filter-setting-label">
                <input
                  type="checkbox"
                  checked={filterFormData.showBrandFilter}
                  onChange={(e) => handleFilterSettingChange('showBrandFilter', e.target.checked)}
                />
                <span className="filter-setting-text">
                  <strong>Фильтр "Производитель"</strong>
                  <small>Бренд/производитель товара</small>
                </span>
              </label>
            </div>

            <div className="filter-setting-item">
              <label className="filter-setting-label">
                <input
                  type="checkbox"
                  checked={filterFormData.showPriceFilter}
                  onChange={(e) => handleFilterSettingChange('showPriceFilter', e.target.checked)}
                />
                <span className="filter-setting-text">
                  <strong>Фильтр "Цена"</strong>
                  <small>Диапазон цен товара</small>
                </span>
              </label>
            </div>

            <div className="filter-setting-item">
              <label className="filter-setting-label">
                <input
                  type="checkbox"
                  checked={filterFormData.showStockFilter}
                  onChange={(e) => handleFilterSettingChange('showStockFilter', e.target.checked)}
                />
                <span className="filter-setting-text">
                  <strong>Фильтр "В наличии"</strong>
                  <small>Показывать только товары в наличии</small>
                </span>
              </label>
            </div>
          </div>

          <div className="filter-settings-actions">
            <button onClick={saveFilterSettings} className="save-btn">
              <FaSave /> Сохранить настройки
            </button>
          </div>
        </div>

        <div className="preview-section">
          <h3>Предварительный просмотр</h3>
          <p>Так будут выглядеть фильтры в каталоге:</p>
          <div className="filter-preview">
            <div className="preview-filters">
              <h4>Фильтры</h4>
              {filterFormData.showCategoryFilter && (
                <div className="preview-filter">
                  <label>Категория</label>
                  <div className="preview-select">Все</div>
                </div>
              )}
              {filterFormData.showSubcategoryFilter && (
                <div className="preview-filter">
                  <label>Подкатегория</label>
                  <div className="preview-select">Все</div>
                </div>
              )}
              {filterFormData.showBrandFilter && (
                <div className="preview-filter">
                  <label>Производитель</label>
                  <div className="preview-select">Все</div>
                </div>
              )}
              {filterFormData.showPriceFilter && (
                <div className="preview-filter">
                  <label>Цена, ₽</label>
                  <div className="preview-price-range">
                    <span>от</span> - <span>до</span>
                  </div>
                </div>
              )}
              {filterFormData.showStockFilter && (
                <div className="preview-filter">
                  <label>
                    <input type="checkbox" disabled /> Только в наличии
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
