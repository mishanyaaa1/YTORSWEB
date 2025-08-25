import React, { useState } from 'react';
import { useAdminData } from '../../context/AdminDataContext';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import './VehiclesManagement.css';

function VehiclesManagement() {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useAdminData();
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Гусеничный',
    terrain: 'Снег',
    price: '',
    description: '',
    engine: '',
    weight: '',
    capacity: '',
    maxSpeed: '',
    available: true,
    quantity: 1
  });

  const vehicleTypes = ['Гусеничный', 'Колесный', 'Плавающий'];
  const terrainTypes = ['Снег', 'Болото', 'Вода', 'Горы', 'Лес', 'Пустыня'];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const vehicleData = {
      ...formData,
      price: parseInt(formData.price),
      quantity: parseInt(formData.quantity),
      specs: {
        engine: formData.engine,
        weight: formData.weight,
        capacity: formData.capacity,
        maxSpeed: formData.maxSpeed
      }
    };

    if (editingVehicle) {
      updateVehicle(editingVehicle.id, vehicleData);
      setEditingVehicle(null);
    } else {
      addVehicle(vehicleData);
    }

    resetForm();
    setIsAddingVehicle(false);
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      name: vehicle.name,
      type: vehicle.type,
      terrain: vehicle.terrain,
      price: vehicle.price.toString(),
      description: vehicle.description,
      engine: vehicle.specs.engine,
      weight: vehicle.specs.weight,
      capacity: vehicle.specs.capacity,
      maxSpeed: vehicle.specs.maxSpeed,
      available: vehicle.available,
      quantity: vehicle.quantity
    });
    setIsAddingVehicle(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот вездеход?')) {
      deleteVehicle(id);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'Гусеничный',
      terrain: 'Снег',
      price: '',
      description: '',
      engine: '',
      weight: '',
      capacity: '',
      maxSpeed: '',
      available: true,
      quantity: 1
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  return (
    <div className="vehicles-management">
      <div className="vehicles-header">
        <h1>🚗 Управление вездеходами</h1>
        <button 
          className="add-vehicle-btn"
          onClick={() => setIsAddingVehicle(true)}
        >
          <FaPlus /> Добавить вездеход
        </button>
      </div>

      {/* Форма добавления/редактирования */}
      {isAddingVehicle && (
        <div className="vehicle-form-container">
          <div className="vehicle-form">
            <div className="form-header">
              <h3>{editingVehicle ? 'Редактировать вездеход' : 'Добавить вездеход'}</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setIsAddingVehicle(false);
                  setEditingVehicle(null);
                  resetForm();
                }}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Название</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Вездеход 'Буран'"
                  />
                </div>
                <div className="form-group">
                  <label>Тип</label>
                  <select name="type" value={formData.type} onChange={handleInputChange}>
                    {vehicleTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Тип местности</label>
                  <select name="terrain" value={formData.terrain} onChange={handleInputChange}>
                    {terrainTypes.map(terrain => (
                      <option key={terrain} value={terrain}>{terrain}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Цена (₽)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    placeholder="2500000"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Описание</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Описание вездехода..."
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Двигатель</label>
                  <input
                    type="text"
                    name="engine"
                    value={formData.engine}
                    onChange={handleInputChange}
                    required
                    placeholder="Дизель 150 л.с."
                  />
                </div>
                <div className="form-group">
                  <label>Вес</label>
                  <input
                    type="text"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    required
                    placeholder="2.5 тонны"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Вместимость</label>
                  <input
                    type="text"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    required
                    placeholder="6 человек"
                  />
                </div>
                <div className="form-group">
                  <label>Максимальная скорость</label>
                  <input
                    type="text"
                    name="maxSpeed"
                    value={formData.maxSpeed}
                    onChange={handleInputChange}
                    required
                    placeholder="45 км/ч"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Количество в наличии</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                    min="0"
                  />
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="available"
                      checked={formData.available}
                      onChange={handleInputChange}
                    />
                    Доступен для заказа
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  {editingVehicle ? 'Обновить' : 'Добавить'}
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => {
                    setIsAddingVehicle(false);
                    setEditingVehicle(null);
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

      {/* Список вездеходов */}
      <div className="vehicles-list">
        <h2>Список вездеходов ({vehicles.length})</h2>
        
        {vehicles.length === 0 ? (
          <div className="no-vehicles">
            <p>Вездеходы не найдены. Добавьте первый вездеход!</p>
          </div>
        ) : (
          <div className="vehicles-grid">
            {vehicles.map(vehicle => (
              <div key={vehicle.id} className="vehicle-card">
                <div className="vehicle-image">
                  <div className="vehicle-placeholder">
                    🚗
                  </div>
                  <div className="vehicle-badge">{vehicle.type}</div>
                  <div className="vehicle-status">
                    {vehicle.available ? '✅ В наличии' : '❌ Нет в наличии'}
                  </div>
                </div>
                
                <div className="vehicle-content">
                  <h3 className="vehicle-name">{vehicle.name}</h3>
                  <p className="vehicle-description">{vehicle.description}</p>
                  
                  <div className="vehicle-specs">
                    <div className="spec-item">
                      <strong>Двигатель:</strong> {vehicle.specs.engine}
                    </div>
                    <div className="spec-item">
                      <strong>Вес:</strong> {vehicle.specs.weight}
                    </div>
                    <div className="spec-item">
                      <strong>Вместимость:</strong> {vehicle.specs.capacity}
                    </div>
                    <div className="spec-item">
                      <strong>Скорость:</strong> {vehicle.specs.maxSpeed}
                    </div>
                  </div>
                  
                  <div className="vehicle-terrain">
                    <span className="terrain-badge">
                      {vehicle.terrain}
                    </span>
                  </div>
                  
                  <div className="vehicle-price">
                    <span className="price">{formatPrice(vehicle.price)} ₽</span>
                  </div>
                  
                  <div className="vehicle-actions">
                    <button 
                      className="action-btn edit-btn"
                      onClick={() => handleEdit(vehicle)}
                    >
                      <FaEdit /> Редактировать
                    </button>
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(vehicle.id)}
                    >
                      <FaTrash /> Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default VehiclesManagement;
