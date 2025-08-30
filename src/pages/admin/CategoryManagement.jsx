import React, { useState } from 'react';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSave, 
  FaTimes,
  FaTags,
  FaList,
  FaMountain,
  FaCar
} from 'react-icons/fa';
import { useAdminData } from '../../context/AdminDataContext';
import './CategoryManagement.css';

function CategoryManagement() {
  const { 
    data, 
    addCategory, 
    updateCategory, 
    deleteCategory,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
    terrainTypes,
    vehicleTypes,
    addTerrainType,
    deleteTerrainType,
    addVehicleType,
    deleteVehicleType,
    refreshFromApi
  } = useAdminData();

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySubs, setNewCategorySubs] = useState([]);
  const [newSubInput, setNewSubInput] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [editSubcategoryName, setEditSubcategoryName] = useState('');
  const [selectedCategoryForSub, setSelectedCategoryForSub] = useState('');

  // Состояния для типов местности
  const [newTerrainType, setNewTerrainType] = useState('');
  const [editingTerrainType, setEditingTerrainType] = useState(null);
  const [editTerrainTypeName, setEditTerrainTypeName] = useState('');

  // Состояния для типов вездеходов
  const [newVehicleType, setNewVehicleType] = useState('');
  const [editingVehicleType, setEditingVehicleType] = useState(null);
  const [editVehicleTypeName, setEditVehicleTypeName] = useState('');

  // Добавление новой категории
  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const subs = (newCategorySubs || []).map(s => s.trim()).filter(Boolean);
      addCategory(newCategoryName.trim(), subs);
      setNewCategoryName('');
      setNewCategorySubs([]);
      setNewSubInput('');
    }
  };

  const handleAddNewSubToNewCategory = () => {
    const name = (newSubInput || '').trim();
    if (!name) return;
    if (newCategorySubs.includes(name)) return;
    setNewCategorySubs(prev => [...prev, name]);
    setNewSubInput('');
  };

  const handleRemoveNewSub = (idx) => {
    setNewCategorySubs(prev => prev.filter((_, i) => i !== idx));
  };

  // Начать редактирование категории
  const startEditCategory = (categoryName) => {
    setEditingCategory(categoryName);
    setEditCategoryName(categoryName);
  };

  // Сохранить изменения категории
  const saveEditCategory = () => {
    if (editCategoryName.trim() && editCategoryName !== editingCategory) {
      updateCategory(editingCategory, editCategoryName.trim());
    }
    setEditingCategory(null);
    setEditCategoryName('');
  };

  // Отменить редактирование категории
  const cancelEditCategory = () => {
    setEditingCategory(null);
    setEditCategoryName('');
  };

  // Удалить категорию
  const handleDeleteCategory = (categoryName) => {
    if (confirm(`Удалить категорию "${categoryName}" и все её товары?`)) {
      deleteCategory(categoryName);
    }
  };

  // Добавление новой подкатегории
  const handleAddSubcategory = () => {
    if (newSubcategoryName.trim() && selectedCategoryForSub) {
      addSubcategory(selectedCategoryForSub, newSubcategoryName.trim());
      setNewSubcategoryName('');
    }
  };

  // Начать редактирование подкатегории
  const startEditSubcategory = (categoryName, subcategoryName) => {
    setEditingSubcategory(`${categoryName}::${subcategoryName}`);
    setEditSubcategoryName(subcategoryName);
  };

  // Сохранить изменения подкатегории
  const saveEditSubcategory = () => {
    const [categoryName, oldSubName] = editingSubcategory.split('::');
    if (editSubcategoryName.trim() && editSubcategoryName !== oldSubName) {
      updateSubcategory(categoryName, oldSubName, editSubcategoryName.trim());
    }
    setEditingSubcategory(null);
    setEditSubcategoryName('');
  };

  // Отменить редактирование подкатегории
  const cancelEditSubcategory = () => {
    setEditingSubcategory(null);
    setEditSubcategoryName('');
  };

  // Удалить подкатегорию
  const handleDeleteSubcategory = (categoryName, subcategoryName) => {
    if (confirm(`Удалить подкатегорию "${subcategoryName}" и все её товары?`)) {
      deleteSubcategory(categoryName, subcategoryName);
    }
  };

  // Функции для управления типами местности
  const handleAddTerrainType = async () => {
    if (newTerrainType.trim() && !terrainTypes.includes(newTerrainType.trim())) {
      try {
        await addTerrainType(newTerrainType.trim());
        await refreshFromApi();
        setNewTerrainType('');
      } catch (error) {
        console.error('Error adding terrain type:', error);
      }
    }
  };

  const startEditTerrainType = (typeName) => {
    setEditingTerrainType(typeName);
    setEditTerrainTypeName(typeName);
  };

  const saveEditTerrainType = async () => {
    if (editTerrainTypeName.trim() && editTerrainTypeName !== editingTerrainType) {
      try {
        // Удаляем старый тип и добавляем новый
        await deleteTerrainType(editingTerrainType);
        await addTerrainType(editTerrainTypeName.trim());
        // Обновляем данные из API
        await refreshFromApi();
      } catch (error) {
        console.error('Error updating terrain type:', error);
      }
    }
    setEditingTerrainType(null);
    setEditTerrainTypeName('');
  };

  const cancelEditTerrainType = () => {
    setEditingTerrainType(null);
    setEditTerrainTypeName('');
  };

  const handleDeleteTerrainType = async (typeName) => {
    if (confirm(`Удалить тип местности "${typeName}"?`)) {
      try {
        await deleteTerrainType(typeName);
        await refreshFromApi();
      } catch (error) {
        console.error('Error deleting terrain type:', error);
      }
    }
  };

  // Функции для управления типами вездеходов
  const handleAddVehicleType = async () => {
    if (newVehicleType.trim() && !vehicleTypes.includes(newVehicleType.trim())) {
      try {
        await addVehicleType(newVehicleType.trim());
        await refreshFromApi();
        setNewVehicleType('');
      } catch (error) {
        console.error('Error adding vehicle type:', error);
      }
    }
  };

  const startEditVehicleType = (typeName) => {
    setEditingVehicleType(typeName);
    setEditVehicleTypeName(typeName);
  };

  const saveEditVehicleType = async () => {
    if (editVehicleTypeName.trim() && editVehicleTypeName !== editingVehicleType) {
      try {
        // Удаляем старый тип и добавляем новый
        await deleteVehicleType(editingVehicleType);
        await addVehicleType(editVehicleTypeName.trim());
        // Обновляем данные из API
        await refreshFromApi();
      } catch (error) {
        console.error('Error updating vehicle type:', error);
      }
    }
    setEditingVehicleType(null);
    setEditVehicleTypeName('');
  };

  const cancelEditVehicleType = () => {
    setEditingVehicleType(null);
    setEditVehicleTypeName('');
  };

  const handleDeleteVehicleType = async (typeName) => {
    if (confirm(`Удалить тип вездехода "${typeName}"?`)) {
      try {
        await deleteVehicleType(typeName);
        await refreshFromApi();
      } catch (error) {
        console.error('Error deleting vehicle type:', error);
      }
    }
  };

  return (
    <div className="category-management">
      <div className="page-header">
        <p>Добавляйте, редактируйте и удаляйте категории и подкатегории товаров</p>
      </div>

      <div className="category-content">
        {/* Добавление новой категории (+ подкатегории при создании) */}
        <div className="section">
          <h3>
            <FaPlus /> Добавить категорию
          </h3>
          <div className="add-category-form">
            <input
              type="text"
              placeholder="Название новой категории"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
            />
            <button 
              onClick={handleAddCategory}
              disabled={!newCategoryName.trim()}
              className="add-btn"
            >
              <FaPlus /> Добавить
            </button>
          </div>

          {/* Подкатегории при создании категории */}
          <div className="add-subcategory-form" style={{ marginTop: '12px' }}>
            <input
              type="text"
              placeholder="Подкатегория (по желанию)"
              value={newSubInput}
              onChange={(e) => setNewSubInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddNewSubToNewCategory()}
            />
            <button
              onClick={handleAddNewSubToNewCategory}
              className="add-btn"
              disabled={!newSubInput.trim()}
            >
              <FaPlus /> Добавить подкатегорию
            </button>
          </div>

          {newCategorySubs.length > 0 && (
            <div className="subchips">
              {newCategorySubs.map((s, idx) => (
                <span key={idx} className="subchip">
                  {s}
                  <button type="button" onClick={() => handleRemoveNewSub(idx)} aria-label="Удалить">
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Список категорий */}
        <div className="section">
          <h3>
            <FaList /> Категории ({Object.keys(data.categoryStructure).length})
          </h3>
          <div className="categories-list">
            {Object.entries(data.categoryStructure).map(([categoryName, subcategories]) => (
              <div key={categoryName} className="category-item">
                <div className="category-header">
                  <div className="category-info">
                    {editingCategory === categoryName ? (
                      <div className="edit-form">
                        <input
                          type="text"
                          value={editCategoryName}
                          onChange={(e) => setEditCategoryName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && saveEditCategory()}
                          autoFocus
                        />
                        <button onClick={saveEditCategory} className="save-btn">
                          <FaSave />
                        </button>
                        <button onClick={cancelEditCategory} className="cancel-btn">
                          <FaTimes />
                        </button>
                      </div>
                    ) : (
                      <>
                        <h4>{categoryName}</h4>
                        <span className="subcategory-count">
                          {subcategories.length} подкатегорий
                        </span>
                      </>
                    )}
                  </div>
                  
                  {editingCategory !== categoryName && (
                    <div className="category-actions">
                      <button 
                        onClick={() => startEditCategory(categoryName)}
                        className="edit-btn"
                        title="Редактировать"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(categoryName)}
                        className="delete-btn"
                        title="Удалить"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </div>

                {/* Подкатегории */}
                <div className="subcategories">
                  {subcategories.map((subcategoryName) => (
                    <div key={subcategoryName} className="subcategory-item">
                      {editingSubcategory === `${categoryName}::${subcategoryName}` ? (
                        <div className="edit-form">
                          <input
                            type="text"
                            value={editSubcategoryName}
                            onChange={(e) => setEditSubcategoryName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && saveEditSubcategory()}
                            autoFocus
                          />
                          <button onClick={saveEditSubcategory} className="save-btn">
                            <FaSave />
                          </button>
                          <button onClick={cancelEditSubcategory} className="cancel-btn">
                            <FaTimes />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="subcategory-name">{subcategoryName}</span>
                          <div className="subcategory-actions">
                            <button 
                              onClick={() => startEditSubcategory(categoryName, subcategoryName)}
                              className="edit-btn"
                              title="Редактировать"
                            >
                              <FaEdit />
                            </button>
                            <button 
                              onClick={() => handleDeleteSubcategory(categoryName, subcategoryName)}
                              className="delete-btn"
                              title="Удалить"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Управление типами местности */}
        <div className="section">
          <h3>
            <FaMountain /> Типы местности ({terrainTypes.length})
          </h3>
          <div className="add-type-form">
            <input
              type="text"
              placeholder="Новый тип местности"
              value={newTerrainType}
              onChange={(e) => setNewTerrainType(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTerrainType()}
            />
            <button 
              onClick={handleAddTerrainType}
              disabled={!newTerrainType.trim()}
              className="add-btn"
            >
              <FaPlus /> Добавить
            </button>
          </div>

          <div className="types-list">
            {terrainTypes.map((typeName) => (
              <div key={typeName} className="type-item">
                {editingTerrainType === typeName ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      value={editTerrainTypeName}
                      onChange={(e) => setEditTerrainTypeName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && saveEditTerrainType()}
                      autoFocus
                    />
                    <button onClick={saveEditTerrainType} className="save-btn">
                      <FaSave />
                    </button>
                    <button onClick={cancelEditTerrainType} className="cancel-btn">
                      <FaTimes />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="type-name">{typeName}</span>
                    <div className="type-actions">
                      <button 
                        onClick={() => startEditTerrainType(typeName)}
                        className="edit-btn"
                        title="Редактировать"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => handleDeleteTerrainType(typeName)}
                        className="delete-btn"
                        title="Удалить"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Управление типами вездеходов */}
        <div className="section">
          <h3>
            <FaCar /> Типы вездеходов ({vehicleTypes.length})
          </h3>
          <div className="add-type-form">
            <input
              type="text"
              placeholder="Новый тип вездехода"
              value={newVehicleType}
              onChange={(e) => setNewVehicleType(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddVehicleType()}
            />
            <button 
              onClick={handleAddVehicleType}
              disabled={!newVehicleType.trim()}
              className="add-btn"
            >
              <FaPlus /> Добавить
            </button>
          </div>

          <div className="types-list">
            {vehicleTypes.map((typeName) => (
              <div key={typeName} className="type-item">
                {editingVehicleType === typeName ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      value={editVehicleTypeName}
                      onChange={(e) => setEditVehicleTypeName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && saveEditVehicleType()}
                      autoFocus
                    />
                    <button onClick={saveEditVehicleType} className="save-btn">
                      <FaSave />
                    </button>
                    <button onClick={cancelEditVehicleType} className="cancel-btn">
                      <FaTimes />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="type-name">{typeName}</span>
                    <div className="type-actions">
                      <button 
                        onClick={() => startEditVehicleType(typeName)}
                        className="edit-btn"
                        title="Редактировать"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => handleDeleteVehicleType(typeName)}
                        className="delete-btn"
                        title="Удалить"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryManagement;
