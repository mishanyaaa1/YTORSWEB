import React, { useState } from 'react';
import { useAdminData } from '../../context/AdminDataContext';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import MultiImageUpload from '../../components/MultiImageUpload';
import { getMainImage } from '../../utils/imageHelpers';
import './ProductManagement.css';

const initialFormState = {
  title: '', price: '', category: '', subcategory: '', brand: '', available: true,
  quantity: 0, images: [], description: '', specifications: [{ name: '', value: '' }]
};

export default function ProductManagement() {
  const { products, categories, brands, addProduct, updateProduct, deleteProduct } = useAdminData();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(initialFormState);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  
  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...formData.specifications];
    newSpecs[index][field] = value;
    setFormData(prev => ({ ...prev, specifications: newSpecs }));
  };

  const addSpecField = () => {
    setFormData(prev => ({ ...prev, specifications: [...prev.specifications, { name: '', value: '' }] }));
  };

  const removeSpecField = (index) => {
    const newSpecs = formData.specifications.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, specifications: newSpecs }));
  };

  const startEditing = (product) => {
    const specs = Array.isArray(product.specifications) ? product.specifications : 
                  (product.specifications ? Object.entries(product.specifications).map(([name, value]) => ({ name, value })) : [{ name: '', value: '' }]);
    setEditingProduct(product);
    setFormData({ ...initialFormState, ...product, specifications: specs.length ? specs : [{ name: '', value: '' }] });
    setIsFormVisible(true);
  };

  const startCreating = () => {
    setEditingProduct(null);
    setFormData(initialFormState);
    setIsFormVisible(true);
  };

  const cancelForm = () => {
    setIsFormVisible(false);
    setEditingProduct(null);
    setFormData(initialFormState);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const productData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      quantity: parseInt(formData.quantity) || 0,
      specifications: formData.specifications.filter(s => s.name && s.value)
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }
    cancelForm();
  };
  
  return (
    <div className="product-management-page">
      <div className="page-controls">
        {!isFormVisible && (
          <button onClick={startCreating} className="add-product-btn">
            <FaPlus /> Добавить товар
          </button>
        )}
      </div>

      {isFormVisible && (
        <div className="product-form-container">
          <h3>{editingProduct ? 'Редактировать товар' : 'Новый товар'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* Fields here */}
              <div className="form-group">
                <label>Название</label>
                <input name="title" value={formData.title} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Цена</label>
                <input name="price" type="number" value={formData.price} onChange={handleInputChange} required />
              </div>
               <div className="form-group">
                <label>Количество</label>
                <input name="quantity" type="number" value={formData.quantity} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Категория</label>
                <select name="category" value={formData.category} onChange={handleInputChange}>
                  <option value="">Выберите</option>
                  {Object.keys(categories).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
               <div className="form-group">
                <label>Подкатегория</label>
                <select name="subcategory" value={formData.subcategory} onChange={handleInputChange} disabled={!formData.category}>
                   <option value="">Выберите</option>
                   {(categories[formData.category] || []).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Бренд</label>
                <select name="brand" value={formData.brand} onChange={handleInputChange}>
                  <option value="">Выберите</option>
                  {brands.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
               <div className="form-group full-width">
                <label>Описание</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="4"></textarea>
              </div>
              <div className="form-group full-width">
                 <label>Изображения</label>
                <MultiImageUpload value={formData.images} onChange={(images) => setFormData(p => ({...p, images}))} />
              </div>
              <div className="form-group full-width">
                <label>Характеристики</label>
                {formData.specifications.map((spec, index) => (
                  <div key={index} className="spec-input-group">
                    <input value={spec.name} onChange={e => handleSpecChange(index, 'name', e.target.value)} placeholder="Название" />
                    <input value={spec.value} onChange={e => handleSpecChange(index, 'value', e.target.value)} placeholder="Значение" />
                    <button type="button" onClick={() => removeSpecField(index)}><FaTrash /></button>
                  </div>
                ))}
                <button type="button" onClick={addSpecField} className="add-spec-btn"><FaPlus /> Добавить</button>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" name="available" checked={formData.available} onChange={handleInputChange} />
                  В наличии
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

      <div className="product-list-table">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Название</th>
              <th>Категория</th>
              <th>Цена</th>
              <th>Кол-во</th>
              <th>Статус</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td><img src={getMainImage(product)?.data || '/placeholder.png'} alt={product.title} className="product-table-img"/></td>
                <td>{product.title}</td>
                <td>{product.category}{product.subcategory && ` / ${product.subcategory}`}</td>
                <td>{product.price.toLocaleString()} ₽</td>
                <td>{product.quantity || 0}</td>
                <td>
                  <span className={`status-badge ${product.available ? 'status-instock' : 'status-outstock'}`}>
                    {product.available ? 'В наличии' : 'Нет'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => startEditing(product)} className="edit-btn"><FaEdit /></button>
                    <button onClick={() => deleteProduct(product.id)} className="delete-btn"><FaTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
