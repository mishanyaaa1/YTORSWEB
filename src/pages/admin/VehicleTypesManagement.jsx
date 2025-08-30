import React, { useState } from 'react';
import { useAdminData } from '../../context/AdminDataContext';
import { FaPlus, FaEdit, FaTrash, FaTruck, FaMountain } from 'react-icons/fa';
import './VehicleTypesManagement.css';

function VehicleTypesManagement() {
  const { 
    vehicleTypes, 
    terrainTypes, 
    addVehicleType, 
    updateVehicleType, 
    deleteVehicleType,
    addTerrainType,
    updateTerrainType,
    deleteTerrainType
  } = useAdminData();

  const [activeTab, setActiveTab] = useState('vehicleTypes'); // 'vehicleTypes' или 'terrainTypes'
  const [isAddingType, setIsAddingType] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [formData, setFormData] = useState({
    name: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (activeTab === 'vehicleTypes') {
      if (editingType) {
        updateVehicleType(editingType, formData.name);
        setEditingType(null);
      } else {
        addVehicleType(formData.name);
      }
    } else {
      if (editingType) {
        updateTerrainType(editingType, formData.name);
        setEditingType(null);
      } else {
        addTerrainType(formData.name);
      }
    }

    resetForm();
    setIsAddingType(false);
  };

  const handleEdit = (type, name) => {
    setEditingType(type);
    setFormData({ name });
    setIsAddingType(true);
  };

  const handleDelete = (type, name) => {
    const typeName = activeTab === 'vehicleTypes' ? 'тип вездехода' : 'тип местности';
    if (window.confirm(`Вы уверены, что хотите удалить ${typeName} "${name}"?`)) {
      if (activeTab === 'vehicleTypes') {
        deleteVehicleType(name);
      } else {
        deleteTerrainType(name);
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '' });
  };

  const getCurrentTypes = () => activeTab === 'vehicleTypes' ? vehicleTypes : terrainTypes;
  const getTypeLabel = () => activeTab === 'vehicleTypes' ? 'тип вездехода' : 'тип местности';
  const getTypeIcon = () => activeTab === 'vehicleTypes' ? <FaTruck /> : <FaMountain />;

  return (
    <div className="vehicle-types-management">
      <div className="types-header">
        <h1>⚙️ Управление типами вездеходов и местности</h1>
        <p>Настройте доступные типы вездеходов и типы местности для использования в каталоге</p>
      </div>

      {/* Переключатель вкладок */}
      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === 'vehicleTypes' ? 'active' : ''}`}
          onClick={() => setActiveTab('vehicleTypes')}
        >
          <FaTruck /> Типы вездеходов
        </button>
        <button
          className={`tab-btn ${activeTab === 'terrainTypes' ? 'active' : ''}`}
          onClick={() => setActiveTab('terrainTypes')}
        >
          <FaMountain /> Типы местности
        </button>
      </div>

      {/* Форма добавления/редактирования */}
      {isAddingType && (
        <div className="type-form-container">
          <div className="type-form">
            <div className="form-header">
              <h3>
                {editingType 
                  ? `Редактировать ${getTypeLabel()}` 
                  : `Добавить ${getTypeLabel()}`
                }
              </h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setIsAddingType(false);
                  setEditingType(null);
                  resetForm();
                }}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Название {getTypeLabel()}</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder={`Введите название ${getTypeLabel()}`}
                  autoFocus
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn">
                  {editingType ? 'Сохранить изменения' : 'Добавить'}
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => {
                    setIsAddingType(false);
                    setEditingType(null);
                    resetForm();
                  }}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Список типов */}
      <div className="types-list">
        <div className="list-header">
          <h2>
            {getTypeIcon()} {getTypeLabel().charAt(0).toUpperCase() + getTypeLabel().slice(1)} ({getCurrentTypes().length})
          </h2>
          <button 
            className="add-type-btn"
            onClick={() => setIsAddingType(true)}
          >
            <FaPlus /> Добавить {getTypeLabel()}
          </button>
        </div>
        
        {getCurrentTypes().length === 0 ? (
          <div className="no-types">
            <p>Типы не найдены. Добавьте первый {getTypeLabel()}!</p>
          </div>
        ) : (
          <div className="types-grid">
            {getCurrentTypes().map((type, index) => (
              <div key={index} className="type-card">
                <div className="type-content">
                  <div className="type-icon">
                    {getTypeIcon()}
                  </div>
                  <h3 className="type-name">{type}</h3>
                </div>
                
                <div className="type-actions">
                  <button 
                    className="action-btn edit-btn"
                    onClick={() => handleEdit(type, type)}
                    title={`Редактировать ${getTypeLabel()}`}
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(type, type)}
                    title={`Удалить ${getTypeLabel()}`}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Информация об использовании */}
      <div className="usage-info">
        <h3>ℹ️ Информация об использовании</h3>
        <div className="info-grid">
          <div className="info-item">
            <h4>Типы вездеходов</h4>
            <p>Определяют конструктивные особенности вездеходов (гусеничный, колесный, плавающий и т.д.)</p>
          </div>
          <div className="info-item">
            <h4>Типы местности</h4>
            <p>Определяют условия эксплуатации вездеходов (снег, болото, вода, горы и т.д.)</p>
          </div>
        </div>
        <div className="warning">
          <p><strong>⚠️ Внимание:</strong> Удаление типа, который используется в существующих вездеходах, может привести к ошибкам отображения.</p>
        </div>
      </div>
    </div>
  );
}

export default VehicleTypesManagement;
