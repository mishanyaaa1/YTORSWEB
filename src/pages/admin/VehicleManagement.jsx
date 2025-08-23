import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaCar, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import MultiImageUpload from '../../components/MultiImageUpload';
import { getMainImage, resolveImageSrc } from '../../utils/imageHelpers';
import BrandMark from '../../components/BrandMark';
import { createApiUrl, fetchConfig } from '../../config/api';
import './VehicleManagement.css';

export default function VehicleManagement() {
  const [vehicles, setVehicles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    brand: '',
    model: '',
    year: '',
    enginePower: '',
    engineVolume: '',
    fuelType: '',
    transmission: '',
    driveType: '',
    seats: '',
    weight: '',
    dimensions: '',
    available: true,
    quantity: 1,
    featured: false,
    images: [],
    description: '',
    specifications: [{ name: '', value: '' }],
    features: []
  });

  // Загружаем данные
  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch(createApiUrl('/api/vehicles'), fetchConfig);
      const data = await response.json();
      setVehicles(data);
      
      // Извлекаем уникальные бренды
      const uniqueBrands = [...new Set(data.map(v => v.brand).filter(Boolean))];
      setBrands(uniqueBrands);
      
      setLoading(false);
    } catch (error) {
      console.error('Ошибка загрузки вездеходов:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              (name === 'price' || name === 'year' || name === 'enginePower' || 
               name === 'engineVolume' || name === 'seats' || name === 'weight' || name === 'quantity') 
              ? value : value
    }));
  };

  const startCreating = () => {
    setIsCreating(true);
    setEditingVehicle(null);
    setFormData({
      title: '',
      price: '',
      brand: '',
      model: '',
      year: '',
      enginePower: '',
      engineVolume: '',
      fuelType: '',
      transmission: '',
      driveType: '',
      seats: '',
      weight: '',
      dimensions: '',
      available: true,
      quantity: 1,
      featured: false,
      images: [],
      description: '',
      specifications: [{ name: '', value: '' }],
      features: []
    });
  };

  const startEditing = (vehicle) => {
    setEditingVehicle(vehicle.id);
    setIsCreating(false);
    
    // Нормализуем характеристики к массиву {name, value}
    const normalizedSpecs = Array.isArray(vehicle.specifications)
      ? vehicle.specifications
      : vehicle.specifications && typeof vehicle.specifications === 'object'
        ? Object.entries(vehicle.specifications).map(([name, value]) => ({ name, value }))
        : [{ name: '', value: '' }];
        
    setFormData({
      ...vehicle,
      specifications: normalizedSpecs,
      features: vehicle.features || []
    });
  };

  const cancelEditing = () => {
    setEditingVehicle(null);
    setIsCreating(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🚗 Отправка формы вездехода...');
    console.log('📝 Данные формы:', formData);
    
    // Проверяем обязательные поля
    if (!formData.title || !formData.title.trim()) {
      alert('Пожалуйста, заполните название вездехода');
      return;
    }
    
    if (!formData.price || formData.price <= 0) {
      alert('Пожалуйста, укажите корректную цену');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const vehicleData = {
        ...formData,
        title: formData.title.trim(),
        price: parseInt(formData.price),
        year: formData.year ? parseInt(formData.year) : null,
        enginePower: formData.enginePower ? parseInt(formData.enginePower) : null,
        engineVolume: formData.engineVolume ? parseFloat(formData.engineVolume) : null,
        seats: formData.seats ? parseInt(formData.seats) : null,
        weight: formData.weight ? parseInt(formData.weight) : null,
        quantity: parseInt(formData.quantity),
        specifications: formData.specifications.filter(spec => spec.name && spec.value),
        features: formData.features.filter(feature => feature.trim())
      };

      console.log('📤 Подготовленные данные:', vehicleData);

      const url = isCreating ? createApiUrl('/api/vehicles') : createApiUrl(`/api/vehicles/${editingVehicle}`);
      const method = isCreating ? 'POST' : 'PUT';
      
      console.log('🌐 URL запроса:', url);
      console.log('📡 Метод:', method);
      
      console.log('📤 Отправляем запрос с данными:', {
        method,
        headers: fetchConfig.headers,
        credentials: fetchConfig.credentials,
        body: vehicleData
      });
      
      const response = await fetch(url, {
        method,
        headers: fetchConfig.headers,
        credentials: fetchConfig.credentials,
        body: JSON.stringify(vehicleData)
      });

      console.log('📥 Ответ сервера:', response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Успешно сохранено:', result);
        alert('Вездеход успешно сохранен!');
        await fetchVehicles();
        cancelEditing();
      } else {
        const errorText = await response.text();
        console.error('❌ Ошибка сервера:', errorText);
        throw new Error(`Ошибка сохранения: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Ошибка:', error);
      alert(`Ошибка при сохранении вездехода: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (vehicleId) => {
    if (!confirm('Удалить этот вездеход?')) return;
    
    try {
      const response = await fetch(createApiUrl(`/api/vehicles/${vehicleId}`), {
        method: 'DELETE',
        credentials: fetchConfig.credentials
      });
      
      if (response.ok) {
        await fetchVehicles();
      } else {
        throw new Error('Ошибка удаления');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при удалении вездехода');
    }
  };

  const addSpecification = () => {
    setFormData(prev => ({
      ...prev,
      specifications: [...prev.specifications, { name: '', value: '' }]
    }));
  };

  const updateSpecification = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.map((spec, i) => 
        i === index ? { ...spec, [field]: value } : spec
      )
    }));
  };

  const removeSpecification = (index) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
    }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const updateFeature = (index, value) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const getVehicleImage = (vehicle) => {
    const mainImage = vehicle.images?.find(img => img.isMain) || vehicle.images?.[0];
    if (mainImage?.data) {
      const resolved = typeof mainImage.data === 'string' ? resolveImageSrc(mainImage.data) : null;
      if (
        (typeof mainImage.data === 'string' && mainImage.data.startsWith('data:image')) ||
        resolved
      ) {
        return resolved || mainImage.data;
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="vehicle-management">
        <div className="loading">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="vehicle-management">
      <div className="management-header">
        <h2>
          <FaCar /> Управление вездеходами
        </h2>
        <button onClick={startCreating} className="add-button">
          <FaPlus /> Добавить вездеход
        </button>
      </div>

      {(isCreating || editingVehicle) && (
        <div className="vehicle-form">
          <h3>{isCreating ? 'Добавить вездеход' : 'Редактировать вездеход'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Название *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Цена *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Бренд</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  list="brands-list"
                />
                <datalist id="brands-list">
                  {brands.map(brand => (
                    <option key={brand} value={brand} />
                  ))}
                </datalist>
              </div>

              <div className="form-group">
                <label>Модель</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Год выпуска</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  min="1900"
                  max="2030"
                />
              </div>

              <div className="form-group">
                <label>Мощность двигателя (л.с.)</label>
                <input
                  type="number"
                  name="enginePower"
                  value={formData.enginePower}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Объем двигателя (л)</label>
                <input
                  type="number"
                  name="engineVolume"
                  value={formData.engineVolume}
                  onChange={handleInputChange}
                  step="0.1"
                />
              </div>

              <div className="form-group">
                <label>Тип топлива</label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleInputChange}
                >
                  <option value="">Выберите тип</option>
                  <option value="Бензин">Бензин</option>
                  <option value="Дизель">Дизель</option>
                  <option value="Гибрид">Гибрид</option>
                  <option value="Электро">Электро</option>
                </select>
              </div>

              <div className="form-group">
                <label>Трансмиссия</label>
                <select
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleInputChange}
                >
                  <option value="">Выберите тип</option>
                  <option value="Механическая">Механическая</option>
                  <option value="Автоматическая">Автоматическая</option>
                  <option value="Вариатор">Вариатор</option>
                </select>
              </div>

              <div className="form-group">
                <label>Тип привода</label>
                <select
                  name="driveType"
                  value={formData.driveType}
                  onChange={handleInputChange}
                >
                  <option value="">Выберите тип</option>
                  <option value="Полный">Полный</option>
                  <option value="Передний">Передний</option>
                  <option value="Задний">Задний</option>
                </select>
              </div>

              <div className="form-group">
                <label>Количество мест</label>
                <input
                  type="number"
                  name="seats"
                  value={formData.seats}
                  onChange={handleInputChange}
                  min="1"
                  max="12"
                />
              </div>

              <div className="form-group">
                <label>Вес (кг)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Габариты (ДхШхВ)</label>
                <input
                  type="text"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleInputChange}
                  placeholder="5000x2000x2500"
                />
              </div>

              <div className="form-group">
                <label>Количество</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
            </div>

            <div className="form-checkboxes">
              <label>
                <input
                  type="checkbox"
                  name="available"
                  checked={formData.available}
                  onChange={handleInputChange}
                />
                В наличии
              </label>
              
              <label>
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                />
                Рекомендуемый
              </label>
            </div>

            <div className="form-group">
              <label>Описание</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
              />
            </div>

            <div className="form-section">
              <h4>Характеристики</h4>
              {formData.specifications.map((spec, index) => (
                <div key={index} className="spec-row">
                  <input
                    type="text"
                    placeholder="Название"
                    value={spec.name}
                    onChange={(e) => updateSpecification(index, 'name', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Значение"
                    value={spec.value}
                    onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeSpecification(index)}
                    className="remove-button"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
              <button type="button" onClick={addSpecification} className="add-spec-button">
                <FaPlus /> Добавить характеристику
              </button>
            </div>

            <div className="form-section">
              <h4>Особенности</h4>
              {formData.features.map((feature, index) => (
                <div key={index} className="feature-row">
                  <input
                    type="text"
                    placeholder="Особенность"
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="remove-button"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
              <button type="button" onClick={addFeature} className="add-feature-button">
                <FaPlus /> Добавить особенность
              </button>
            </div>

            <div className="form-section">
              <h4>Изображения</h4>
              <MultiImageUpload
                images={formData.images}
                onChange={(images) => setFormData(prev => ({ ...prev, images }))}
              />
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="save-button" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="loading-spinner-small"></div>
                    Сохранение...
                  </>
                ) : (
                  <>
                    <FaSave /> Сохранить
                  </>
                )}
              </button>
              <button 
                type="button" 
                onClick={cancelEditing} 
                className="cancel-button"
                disabled={isSubmitting}
              >
                <FaTimes /> Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="vehicles-list">
        <h3>Список вездеходов ({vehicles.length})</h3>
        {vehicles.length === 0 ? (
          <div className="empty-state">
            <FaCar />
            <p>Вездеходы не добавлены</p>
          </div>
        ) : (
          <div className="vehicles-grid">
            {vehicles.map(vehicle => {
              const imageUrl = getVehicleImage(vehicle);
              
              return (
                <div key={vehicle.id} className="vehicle-card">
                  <div className="vehicle-image">
                    {imageUrl ? (
                      <img src={imageUrl} alt={vehicle.title} />
                    ) : (
                      <BrandMark alt={vehicle.title} style={{ height: 64 }} />
                    )}
                  </div>
                  
                  <div className="vehicle-info">
                    <h4>{vehicle.title}</h4>
                    {vehicle.brand && <p className="brand">Бренд: {vehicle.brand}</p>}
                    {vehicle.year && <p className="year">Год: {vehicle.year}</p>}
                    <p className="price">{vehicle.price.toLocaleString()} ₽</p>
                    
                    <div className="vehicle-status">
                      {vehicle.available ? (
                        <span className="status available">
                          <FaCheckCircle /> В наличии
                        </span>
                      ) : (
                        <span className="status unavailable">
                          <FaTimesCircle /> Под заказ
                        </span>
                      )}
                      
                      {vehicle.featured && (
                        <span className="status featured">🌟 Рекомендуем</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="vehicle-actions">
                    <button onClick={() => startEditing(vehicle)} className="edit-button">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(vehicle.id)} className="delete-button">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
