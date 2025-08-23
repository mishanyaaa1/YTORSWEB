import React, { useState, useRef } from 'react';
import { FaUpload, FaTrash, FaImage, FaStar, FaRegStar, FaPlus } from 'react-icons/fa';
import './MultiImageUpload.css';

export default function MultiImageUpload({ 
  images = [], // Массив изображений
  onChange, 
  maxImages = 5,
  placeholder = "Добавить изображения товара" 
}) {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const uploadToServer = async (file) => {
    const form = new FormData();
    form.append('image', file);
    const res = await fetch('/api/upload/image', { method: 'POST', body: form, credentials: 'include' });
    if (!res.ok) throw new Error('upload failed');
    const data = await res.json();
    return data.url; // '/uploads/xxx.ext'
  };

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    setIsUploading(true);
    for (const file of files) {
      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите только файлы изображений');
        continue;
      }

      // Проверяем размер файла (максимум 5МБ)
      if (file.size > 5 * 1024 * 1024) {
        alert('Размер файла не должен превышать 5МБ');
        continue;
      }
      try {
        // Пытаемся загрузить на сервер, если не удастся — fallback в base64
        let imageData;
        try {
          const url = await uploadToServer(file);
          imageData = url; // сохранить URL
        } catch (e) {
          const reader = new FileReader();
          imageData = await new Promise((resolve) => {
            reader.onload = (ev) => resolve(ev.target.result);
            reader.readAsDataURL(file);
          });
        }

        const newImage = {
          id: Date.now() + Math.random(),
          data: imageData,
          isMain: images.length === 0
        };
        const updatedImages = [...images, newImage];
        onChange(updatedImages);
      } catch (e) {
        console.error('Upload failed', e);
        alert('Не удалось загрузить изображение');
      }
    }
    setIsUploading(false);
    
    // Очищаем input для возможности загрузки тех же файлов снова
    event.target.value = '';
  };

  const handleRemove = (imageId) => {
    const imageToRemove = images.find(img => img.id === imageId);
    const updatedImages = images.filter(img => img.id !== imageId);
    
    // Если удаляем основное изображение и есть другие, делаем первое основным
    if (imageToRemove.isMain && updatedImages.length > 0) {
      updatedImages[0].isMain = true;
    }
    
    onChange(updatedImages);
  };

  const handleSetMain = (imageId) => {
    const updatedImages = images.map(img => ({
      ...img,
      isMain: img.id === imageId
    }));
    onChange(updatedImages);
  };

  const handleUploadClick = () => {
    if (images.length >= maxImages) {
      alert(`Максимальное количество изображений: ${maxImages}`);
      return;
    }
    fileInputRef.current?.click();
  };

  return (
    <div className="multi-image-upload">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        multiple
        style={{ display: 'none' }}
      />
      
      <div className="images-grid">
        {isUploading && (
          <div className="upload-slot uploading">
            Загрузка...
          </div>
        )}
        {images.map((image, index) => (
          <div key={image.id} className={`image-item ${image.isMain ? 'main-image' : ''}`}>
            <img src={image.data} alt={`Изображение ${index + 1}`} className="preview-image" />
            
            <div className="image-overlay">
              <button 
                type="button" 
                onClick={() => handleSetMain(image.id)}
                className={`btn-main ${image.isMain ? 'active' : ''}`}
                title={image.isMain ? 'Основное изображение' : 'Сделать основным'}
              >
                {image.isMain ? <FaStar /> : <FaRegStar />}
              </button>
              <button 
                type="button" 
                onClick={() => handleRemove(image.id)}
                className="btn-remove"
                title="Удалить изображение"
              >
                <FaTrash />
              </button>
            </div>
            
            {image.isMain && (
              <div className="main-badge">Основное</div>
            )}
          </div>
        ))}
        
        {images.length < maxImages && (
          <div className="upload-slot" onClick={handleUploadClick}>
            <FaPlus className="upload-icon" />
            <span className="upload-text">
              {images.length === 0 ? placeholder : 'Добавить еще'}
            </span>
          </div>
        )}
      </div>
      
      {images.length > 0 && (
        <div className="upload-info">
          <p>
            <strong>{images.length}/{maxImages}</strong> изображений загружено
            {images.find(img => img.isMain) && (
              <span className="main-info">
                • <FaStar className="star-icon" /> Основное изображение выбрано
              </span>
            )}
          </p>
          <small>Основное изображение отображается в каталоге. Остальные — в галерее товара.</small>
        </div>
      )}
    </div>
  );
}
