import React, { useState } from 'react';
import { useAdminData } from '../../context/AdminDataContext';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSave, 
  FaTimes, 
  FaSearch, 
  FaFilter,
  FaEye,
  FaEyeSlash,
  FaBox,
  FaTags,
  FaStar,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import MultiImageUpload from '../../components/MultiImageUpload';
import { migrateProductImages, getMainImage } from '../../utils/imageHelpers';
import './ProductManagement.css';
import { AnimatePresence, motion } from 'framer-motion';

export default function ProductManagement() {
  const { products, categories, brands, addProduct, updateProduct, deleteProduct } = useAdminData();
  
  // Защита от undefined categories
  if (!categories) {
    return <div className="loading-state">Загрузка категорий...</div>;
  }
  
  // Проверяем, что categories - это объект
  if (typeof categories !== 'object' || categories === null) {
    console.error('Categories is not an object:', categories);
    return <div className="error-state">Ошибка загрузки категорий. Попробуйте обновить страницу.</div>;
  }
  
  // Защита от undefined products
  if (!products) {
    return <div className="loading-state">Загрузка товаров...</div>;
  }
  
  // Проверяем, что products - это массив
  if (!Array.isArray(products)) {
    console.error('Products is not an array:', products);
    return <div className="error-state">Ошибка загрузки товаров. Попробуйте обновить страницу.</div>;
  }
  
  // Защита от undefined brands
  if (!brands) {
    return <div className="loading-state">Загрузка брендов...</div>;
  }
  
  // Проверяем, что brands - это массив
  if (!Array.isArray(brands)) {
    console.error('Brands is not an array:', brands);
    return <div className="error-state">Ошибка загрузки брендов. Попробуйте обновить страницу.</div>;
  }

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
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');

  const categoryList = categories ? Object.keys(categories) : [];

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
    setShowForm(true);
  };

  const startEditing = (product) => {
    setEditingProduct(product);
    setIsCreating(false);
    setFormData({
      title: product.title || '',
      price: product.price || '',
      category: product.category || '',
      subcategory: product.subcategory || '',
      brand: product.brand || '',
      available: product.available !== undefined ? product.available : true,
      quantity: product.quantity || 0,
      images: product.images || [],
      description: product.description || '',
      specifications: product.specifications || [{ name: '', value: '' }],
      features: product.features || []
    });
    setShowForm(true);
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
    setShowForm(false);
  };

  const saveProduct = () => {
    if (!formData.title || !formData.price || !formData.category) {
      alert('Пожалуйста, заполните обязательные поля');
      return;
    }

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity)
    };

    if (isCreating) {
      addProduct(productData);
    } else {
      updateProduct(editingProduct.id, productData);
    }

    cancelEditing();
  };

  const handleDelete = (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      deleteProduct(id);
    }
  };

  const handleImagesChange = (images) => {
    setFormData(prev => ({ ...prev, images }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveProduct();
  };

  const addSpecification = () => {
    setFormData(prev => ({
      ...prev,
      specifications: [...prev.specifications, { name: '', value: '' }]
    }));
  };

  const removeSpecification = (index) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
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

  const addFeature = () => {
    const feature = prompt('Введите название характеристики:');
    if (feature && !formData.features.includes(feature)) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, feature]
      }));
    }
  };

  const removeFeature = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }));
  };

  const handleEdit = (product) => {
    startEditing(product);
  };

  // Фильтрация и сортировка
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  return (
    <div className="product-management">
      <div className="management-header">
        <div className="header-content">
          <h1>Управление товарами</h1>
          <p>Создавайте, редактируйте и управляйте товарами в вашем магазине</p>
        </div>
        <button className="create-button" onClick={startCreating}>
          <FaPlus />
          <span>Добавить товар</span>
        </button>
      </div>

      <div className="management-controls">
        <div className="search-section">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Поиск товаров..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="filters-section">
          <div className="filter-group">
            <label>Категория:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">Все категории</option>
              {categoryList.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Сортировка:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="title">По названию</option>
              <option value="price">По цене</option>
              <option value="quantity">По количеству</option>
              <option value="available">По наличию</option>
            </select>
          </div>

          <button
            className="sort-order-btn"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      <div className="products-grid">
        {filteredProducts.map(product => (
          <motion.div
            key={product.id}
            className="product-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="product-image">
              {(() => {
                const migratedProduct = migrateProductImages(product);
                const mainImage = getMainImage(migratedProduct);
                
                if (mainImage?.data) {
                  if (
                    typeof mainImage.data === 'string' &&
                    (mainImage.data.startsWith('data:image') || mainImage.data.startsWith('/uploads/') || mainImage.data.startsWith('http'))
                  ) {
                    return <img src={mainImage.data} alt={product.title} />;
                  }
                  return <span className="product-icon">{mainImage.data}</span>;
                }
                return <FaBox className="default-icon" />;
              })()}
              
              <div className="product-status-badge">
                {product.available ? (
                  <FaCheckCircle className="status-icon available" />
                ) : (
                  <FaExclamationTriangle className="status-icon unavailable" />
                )}
              </div>
            </div>

            <div className="product-info">
              <h3 className="product-title">{product.title}</h3>
              <div className="product-meta">
                <span className="product-category">
                  <FaTags /> {product.category}
                </span>
                {product.brand && (
                  <span className="product-brand">
                    <FaStar /> {product.brand}
                  </span>
                )}
              </div>
              <div className="product-price">
                {product.price?.toLocaleString()} ₽
              </div>
              <div className="product-quantity">
                Количество: {product.quantity || 0} шт.
              </div>
            </div>

            <div className="product-actions">
              <button
                className="action-btn edit-btn"
                onClick={() => handleEdit(product)}
                title="Редактировать"
              >
                <FaEdit />
              </button>
              <button
                className="action-btn delete-btn"
                onClick={() => handleDelete(product.id)}
                title="Удалить"
              >
                <FaTrash />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="no-products">
          <FaBox className="no-products-icon" />
          <h3>Товары не найдены</h3>
          <p>Попробуйте изменить параметры поиска или добавьте новый товар</p>
          <button className="create-button" onClick={startCreating}>
            <FaPlus />
            <span>Добавить первый товар</span>
          </button>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={cancelEditing}
          >
            <motion.div
              className="product-form-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>{isCreating ? 'Создание товара' : 'Редактирование товара'}</h2>
                <button className="close-btn" onClick={cancelEditing}>
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="product-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Название товара *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="form-input"
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
                      min="0"
                      step="0.01"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Категория *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleCategoryChange}
                      required
                      className="form-select"
                    >
                      <option value="">Выберите категорию</option>
                      {categoryList.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Подкатегория</label>
                    <select
                      name="subcategory"
                      value={formData.subcategory}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="">Выберите подкатегорию</option>
                      {formData.category && categories[formData.category]?.map(subcategory => (
                        <option key={subcategory} value={subcategory}>{subcategory}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Бренд</label>
                    <select
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="">Выберите бренд</option>
                      {brands.map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Количество</label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      min="0"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Описание</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label>Изображения</label>
                  <MultiImageUpload
                    images={formData.images}
                    onChange={handleImagesChange}
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="available"
                      checked={formData.available}
                      onChange={handleInputChange}
                      className="form-checkbox"
                    />
                    <span className="checkmark"></span>
                    Товар доступен для заказа
                  </label>
                </div>

                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={cancelEditing}>
                    <FaTimes />
                    <span>Отмена</span>
                  </button>
                  <button type="submit" className="save-btn">
                    <FaSave />
                    <span>{isCreating ? 'Создать' : 'Сохранить'}</span>
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
