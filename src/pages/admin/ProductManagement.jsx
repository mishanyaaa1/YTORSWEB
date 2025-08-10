import React, { useState } from 'react';
import { useAdminData } from '../../context/AdminDataContext';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import MultiImageUpload from '../../components/MultiImageUpload';
import { migrateProductImages, getMainImage } from '../../utils/imageHelpers';
import './ProductManagement.css';
import { AnimatePresence, motion } from 'framer-motion';

export default function ProductManagement() {
  const { products, categories, brands, addProduct, updateProduct, deleteProduct } = useAdminData();
  const [editingProduct, setEditingProduct] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: '',
    subcategory: '',
    brand: '',
    available: true,
    quantity: 0,
    images: [],
    description: '',
    specifications: [{ name: '', value: '' }],
    features: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);

  const categoryList = Object.keys(categories);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setFormData(prev => ({
      ...prev,
      category: selectedCategory,
      subcategory: '' // Сбрасываем подкатегорию при смене категории
    }));
  };

  const startCreating = () => {
    setIsCreating(true);
    setEditingProduct(null);
    setFormData({
      title: '',
      price: '',
      category: '',
      subcategory: '',
      brand: '',
      available: true,
      quantity: 0,
      images: [],
      description: '',
      specifications: [{ name: '', value: '' }],
      features: []
    });
  };

  const startEditing = (product) => {
    setEditingProduct(product.id);
    setIsCreating(false);
    const migratedProduct = migrateProductImages(product);
    // Нормализуем характеристики к массиву {name, value}
    const normalizedSpecs = Array.isArray(migratedProduct.specifications)
      ? migratedProduct.specifications
      : migratedProduct.specifications && typeof migratedProduct.specifications === 'object'
        ? Object.entries(migratedProduct.specifications).map(([name, value]) => ({ name, value }))
        : [{ name: '', value: '' }];
    setFormData({ ...migratedProduct, specifications: normalizedSpecs });
  };

  const cancelEditing = () => {
    setEditingProduct(null);
    setIsCreating(false);
    setFormData({
      title: '',
      price: '',
      category: '',
      subcategory: '',
      brand: '',
      available: true,
      quantity: 0,
      images: [],
      description: '',
      specifications: [{ name: '', value: '' }],
      features: []
    });
  };

  const saveProduct = () => {
    console.log('Saving product:', { formData, isCreating, editingProduct });
    
    if (!formData.title || !formData.category) {
      alert('Заполните обязательные поля: название и категория!');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price < 0) {
      alert('Укажите корректную цену товара!');
      return;
    }

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity) || 0,
        specifications: (formData.specifications || []).filter(s => (s.name || s.value))
      };

      if (isCreating) {
        console.log('Creating new product:', productData);
        addProduct(productData);
        alert('Товар создан!');
      } else {
        console.log('Updating existing product:', editingProduct, productData);
        updateProduct(editingProduct, productData);
        alert('Товар обновлен!');
      }
      
      cancelEditing();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Ошибка при сохранении товара!');
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Удалить товар?')) {
      deleteProduct(id);
      alert('Товар удален!');
    }
  };

  const availableSubcategories = formData.category ? categories[formData.category] || [] : [];

  const handleImagesChange = (images) => {
    setFormData(prev => ({ ...prev, images }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting form:', formData);

    if (!formData.title || !formData.category) {
      alert('Заполните обязательные поля: название и категория!');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price < 0) {
      alert('Укажите корректную цену товара!');
      return;
    }

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity) || 0,
        specifications: (formData.specifications || []).filter(s => (s.name || s.value)),
        images: formData.images
      };

      if (editingProduct) {
        updateProduct(editingProduct, productData);
        alert('Позиция обновлена!');
      } else {
        addProduct(productData);
        alert('Новая позиция создана!');
      }
      setShowForm(false);
      setEditingProduct(null);
      setFormData({
        title: '',
        price: '',
        category: '',
        subcategory: '',
        brand: '',
        available: true,
        quantity: 0,
        images: [],
        description: '',
        specifications: [{ name: '', value: '' }],
        features: []
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Ошибка при сохранении позиции!');
    }
  };

  const handleEdit = (product) => {
    startEditing(product);
    setShowForm(true);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearchTerm = product.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearchTerm && matchesCategory;
  });

  return (
    <div className="product-management">
      <h2>Управление позициями</h2>
      <button onClick={() => setShowForm(true)} className="add-product-btn">
        <FaPlus /> Добавить позицию
      </button>
      
      <div className="search-filter">
        <input
          type="text"
          placeholder="Поиск по названию..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-select"
        >
          <option value="all">Все категории</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      
      <div className="products-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-image">
              {getMainImage(product)?.data ? (
                <img src={getMainImage(product).data} alt={product.title} />
              ) : (
                <span className="product-icon">📦</span>
              )}
            </div>
            <div className="product-info">
              <h3>{product.title}</h3>
              <p className="product-category">{product.category}</p>
              <p className="product-price">{product.price.toLocaleString()} ₽</p>
              <p className="product-stock">Доступно: {product.quantity}</p>
            </div>
            <div className="product-actions">
              <button onClick={() => handleEdit(product)} className="edit-btn">
                <FaEdit />
              </button>
              <button onClick={() => handleDelete(product.id)} className="delete-btn">
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <AnimatePresence>
        {showForm && (
          <motion.div 
            className="product-form-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="product-form-content"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
            >
              <h3>{editingProduct ? 'Редактировать позицию' : 'Новая позиция'}</h3>
              
              <form onSubmit={handleSubmit} className="product-form">
                <div className="form-group">
                  <label>Название *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Категория *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  >
                    <option value="">Выберите категорию</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Цена (₽) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div className="form-group">
                  <label>Доступно (кол-во) *</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                    required
                    min="0"
                  />
                </div>
                
                <div className="form-group">
                  <label>Бренд</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Описание</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="4"
                  />
                </div>
                
                <div className="form-group">
                  <label>Характеристики (одна на строку, формат: Название: Значение)</label>
                  <textarea
                    value={formData.specifications.map(s => `${s.name}: ${s.value}`).join('\n')}
                    onChange={(e) => setFormData({...formData, specifications: e.target.value.split('\n').map(line => {
                      const [name, value] = line.split(':').map(s => s.trim());
                      return { name, value };
                    })})}
                    rows="4"
                  />
                </div>
                
                <div className="form-group">
                  <label>Преимущества (одно на строку)</label>
                  <textarea
                    value={formData.features.join('\n')}
                    onChange={(e) => setFormData({...formData, features: e.target.value.split('\n')})}
                    rows="4"
                  />
                </div>
                
                <div className="form-group">
                  <label>Изображения</label>
                  <MultiImageUpload 
                    onImagesChange={handleImagesChange}
                    initialImages={formData.images}
                  />
                </div>
                
                <div className="form-actions">
                  <button type="button" onClick={() => setShowForm(false)} className="cancel-btn">
                    Отменить
                  </button>
                  <button type="submit" className="submit-btn">
                    {editingProduct ? 'Сохранить' : 'Создать'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
