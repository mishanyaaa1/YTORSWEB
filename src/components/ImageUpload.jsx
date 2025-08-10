import React, { useState, useRef } from 'react';
import { FaUpload, FaTrash, FaImage } from 'react-icons/fa';
import './ImageUpload.css';

export default function ImageUpload({ value, onChange, placeholder = "Загрузить изображение" }) {
  const [preview, setPreview] = useState(value || null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите файл изображения');
        return;
      }

      // Проверяем размер файла (максимум 5МБ)
      if (file.size > 5 * 1024 * 1024) {
        alert('Размер файла не должен превышать 5МБ');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target.result;
        setPreview(imageData);
        onChange(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="image-upload">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        style={{ display: 'none' }}
      />
      
      {preview ? (
        <div className="image-preview">
          <img src={preview} alt="Предпросмотр" className="preview-image" />
          <div className="image-actions">
            <button 
              type="button" 
              onClick={handleUploadClick}
              className="btn-change"
              title="Изменить изображение"
            >
              <FaUpload />
            </button>
            <button 
              type="button" 
              onClick={handleRemove}
              className="btn-remove"
              title="Удалить изображение"
            >
              <FaTrash />
            </button>
          </div>
        </div>
      ) : (
        <div className="upload-placeholder" onClick={handleUploadClick}>
          <FaImage className="upload-icon" />
          <span className="upload-text">{placeholder}</span>
          <span className="upload-hint">Поддерживаются: JPG, PNG, GIF (до 5МБ)</span>
        </div>
      )}
    </div>
  );
}
