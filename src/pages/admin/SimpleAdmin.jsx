import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaBox, 
  FaTags, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSave, 
  FaTimes,
  FaUpload,
  FaSignOutAlt
} from 'react-icons/fa';
import './SimpleAdmin.css';

function SimpleAdmin() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});

  // Загрузка данных
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'products') {
        const response = await fetch('/api/products');
        const data = await response.json();
        setProducts(data);
      } else if (activeTab === 'categories') {
        const response = await fetch('/api/categories');
        const data = await response.json();
        setCategories(data);
      }
      
      if (brands.length === 0) {
        const response = await fetch('/api/brands');
        const data = await response.json();
        setBrands(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({});
    setShowForm(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const url = editingItem 
        ? `/api/${activeTab}/${editingItem.id}`
        : `/api/${activeTab}`;
      
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowForm(false);
        setEditingItem(null);
        setFormData({});
        loadData();
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить этот элемент?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/${activeTab}/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Ошибка удаления:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/admin';
    } catch (error) {
      console.error('Ошибка выхода:', error);
    }
  };

  const renderForm = () => {
    if (activeTab === 'products') {
      return (
        <div className="form-group">
          <input
            type="text"
            placeholder="Название"
            value={formData.name || ''}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <textarea
            placeholder="Описание"
            value={formData.description || ''}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
          <input
            type="number"
            placeholder="Цена"
            value={formData.price || ''}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
          />
          <select
            value={formData.category_id || ''}
            onChange={(e) => setFormData({...formData, category_id: e.target.value})}
          >
            <option value="">Выберите категорию</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={formData.brand_id || ''}
            onChange={(e) => setFormData({...formData, brand_id: e.target.value})}
          >
            <option value="">Выберите бренд</option>
            {brands.map(brand => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>
        </div>
      );
    } else if (activeTab === 'categories') {
      return (
        <div className="form-group">
          <input
            type="text"
            placeholder="Название категории"
            value={formData.name || ''}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <textarea
            placeholder="Описание категории"
            value={formData.description || ''}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>
      );
    }
  };

  const renderList = () => {
    const items = activeTab === 'products' ? products : categories;
    
    return items.map(item => (
      <motion.div
        key={item.id}
        className="admin-item"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="item-content">
          <h3>{item.name}</h3>
          <p>{item.description}</p>
          {item.price && <span className="price">{item.price} ₽</span>}
        </div>
        <div className="item-actions">
          <button onClick={() => handleEdit(item)} className="btn-edit">
            <FaEdit />
          </button>
          <button onClick={() => handleDelete(item.id)} className="btn-delete">
            <FaTrash />
          </button>
        </div>
      </motion.div>
    ));
  };

  return (
    <div className="simple-admin">
      <header className="admin-header">
        <h1>Админ панель</h1>
        <button onClick={handleLogout} className="btn-logout">
          <FaSignOutAlt /> Выход
        </button>
      </header>

      <div className="admin-tabs">
        <button 
          className={activeTab === 'products' ? 'active' : ''}
          onClick={() => setActiveTab('products')}
        >
          <FaBox /> Товары
        </button>
        <button 
          className={activeTab === 'categories' ? 'active' : ''}
          onClick={() => setActiveTab('categories')}
        >
          <FaTags /> Категории
        </button>
      </div>

      <div className="admin-content">
        <div className="admin-actions">
          <button onClick={handleCreate} className="btn-create">
            <FaPlus /> Добавить
          </button>
        </div>

        {loading ? (
          <div className="loading">Загрузка...</div>
        ) : (
          <div className="admin-list">
            {renderList()}
          </div>
        )}
      </div>

      {showForm && (
        <motion.div 
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowForm(false)}
        >
          <motion.div 
            className="modal"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>{editingItem ? 'Редактировать' : 'Создать'}</h2>
              <button onClick={() => setShowForm(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body">
              {renderForm()}
            </div>
            
            <div className="modal-footer">
              <button onClick={handleSave} className="btn-save" disabled={loading}>
                <FaSave /> Сохранить
              </button>
              <button onClick={() => setShowForm(false)} className="btn-cancel">
                Отмена
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default SimpleAdmin;
