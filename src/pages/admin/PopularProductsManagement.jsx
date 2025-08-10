import React, { useState } from 'react';
import { useAdminData } from '../../context/AdminDataContext';
import { FaSave, FaPlus, FaTimes, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { getMainImage } from '../../utils/imageHelpers';
import './PopularProductsManagement.css';

export default function PopularProductsManagement() {
  const { products, popularProductIds, updatePopularProducts } = useAdminData();
  const [selectedIds, setSelectedIds] = useState([...popularProductIds]);
  const [availableProducts] = useState(products.filter(p => !popularProductIds.includes(p.id)));

  const handleAddProduct = (productId) => {
    if (!selectedIds.includes(productId) && selectedIds.length < 6) {
      setSelectedIds([...selectedIds, productId]);
    }
  };

  const handleRemoveProduct = (productId) => {
    setSelectedIds(selectedIds.filter(id => id !== productId));
  };

  const handleMoveUp = (index) => {
    if (index > 0) {
      const newIds = [...selectedIds];
      [newIds[index - 1], newIds[index]] = [newIds[index], newIds[index - 1]];
      setSelectedIds(newIds);
    }
  };

  const handleMoveDown = (index) => {
    if (index < selectedIds.length - 1) {
      const newIds = [...selectedIds];
      [newIds[index], newIds[index + 1]] = [newIds[index + 1], newIds[index]];
      setSelectedIds(newIds);
    }
  };

  const handleSave = () => {
    updatePopularProducts(selectedIds);
    alert('Популярные товары обновлены!');
  };

  const getProductById = (id) => products.find(p => p.id === id);

  return (
    <div className="popular-products-management">
      <div className="management-header">
        <h2>Управление популярными товарами</h2>
        <button onClick={handleSave} className="btn-primary">
          <FaSave /> Сохранить изменения
        </button>
      </div>

      <div className="management-content">
        <div className="selected-products">
          <h3>Популярные товары (максимум 6)</h3>
          <div className="products-list">
            {selectedIds.map((id, index) => {
              const product = getProductById(id);
              if (!product) return null;
              
              return (
                <div key={id} className="product-item selected">
                  <div className="product-image">
                    {(() => {
                      const d = getMainImage(product)?.data;
                      if (d && typeof d === 'string' && (d.startsWith('data:image') || d.startsWith('/uploads/') || d.startsWith('http'))) {
                        return <img src={d} alt={product.title} />;
                      }
                      return <span className="product-icon">{d || '📦'}</span>;
                    })()}
                  </div>
                  <div className="product-info">
                    <h4>{product.title}</h4>
                    <p>{product.price.toLocaleString()} ₽</p>
                    <span className="product-category">{product.category}</span>
                  </div>
                  <div className="product-actions">
                    <button 
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="btn-move"
                      title="Переместить вверх"
                    >
                      <FaArrowUp />
                    </button>
                    <button 
                      onClick={() => handleMoveDown(index)}
                      disabled={index === selectedIds.length - 1}
                      className="btn-move"
                      title="Переместить вниз"
                    >
                      <FaArrowDown />
                    </button>
                    <button 
                      onClick={() => handleRemoveProduct(id)}
                      className="btn-remove"
                      title="Удалить из популярных"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {selectedIds.length === 0 && (
            <p className="empty-message">Популярные товары не выбраны</p>
          )}
        </div>

        <div className="available-products">
          <h3>Доступные товары</h3>
          <div className="products-list">
            {products
              .filter(product => !selectedIds.includes(product.id))
              .map(product => (
                <div key={product.id} className="product-item available">
                  <div className="product-image">
                    {(() => {
                      const d = getMainImage(product)?.data;
                      if (d && typeof d === 'string' && (d.startsWith('data:image') || d.startsWith('/uploads/') || d.startsWith('http'))) {
                        return <img src={d} alt={product.title} />;
                      }
                      return <span className="product-icon">{d || '📦'}</span>;
                    })()}
                  </div>
                  <div className="product-info">
                    <h4>{product.title}</h4>
                    <p>{product.price.toLocaleString()} ₽</p>
                    <span className="product-category">{product.category}</span>
                  </div>
                  <div className="product-actions">
                    <button 
                      onClick={() => handleAddProduct(product.id)}
                      disabled={selectedIds.length >= 6}
                      className="btn-add"
                      title="Добавить в популярные"
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      <div className="info-panel">
        <h4>Информация:</h4>
        <ul>
          <li>Популярные товары отображаются на главной странице</li>
          <li>Максимальное количество: 6 товаров</li>
          <li>Порядок товаров можно изменить стрелками</li>
          <li>Изменения сохраняются только после нажатия "Сохранить"</li>
        </ul>
      </div>
    </div>
  );
}
