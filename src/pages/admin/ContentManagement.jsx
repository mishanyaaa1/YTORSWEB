import React, { useState } from 'react';
import { useAdminData } from '../../context/AdminDataContext';
import { FaSave, FaPlus, FaTrash } from 'react-icons/fa';
import IconSelector from '../../components/IconSelector';
import './ContentManagement.css';

const Section = ({ title, children }) => <div className="content-section"><h3>{title}</h3>{children}</div>;
const ItemCard = ({ title, onRemove, children }) => (
  <div className="item-card">
    <div className="item-card-header">
      <span>{title}</span>
      <button type="button" onClick={onRemove}><FaTrash /></button>
    </div>
    {children}
  </div>
);

export default function ContentManagement() {
  const { aboutContent, updateAboutContent } = useAdminData();
  const [formData, setFormData] = useState(aboutContent);

  const handleChange = (section, index, field, value) => {
    const updatedSection = [...(formData[section] || [])];
    updatedSection[index] = { ...updatedSection[index], [field]: value };
    setFormData(prev => ({ ...prev, [section]: updatedSection }));
  };
  
  const addItem = (section, item) => {
    setFormData(prev => ({ ...prev, [section]: [...(prev[section] || []), item] }));
  };

  const removeItem = (section, index) => {
    setFormData(prev => ({ ...prev, [section]: prev[section].filter((_, i) => i !== index) }));
  };
  
  const handleSimpleChange = (e) => {
    setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
  }

  return (
    <div className="content-management-page">
      <Section title="Основная информация">
        <div className="form-group">
          <label>Заголовок</label>
          <input name="title" value={formData.title} onChange={handleSimpleChange} />
        </div>
        <div className="form-group">
          <label>Описание</label>
          <textarea name="description" value={formData.description} onChange={handleSimpleChange} rows="3"></textarea>
        </div>
      </Section>
      
      <Section title="Преимущества">
        {formData.advantages.map((adv, index) => (
          <ItemCard key={index} title={`Преимущество #${index + 1}`} onRemove={() => removeItem('advantages', index)}>
             <div className="form-group">
              <label>Иконка</label>
              <IconSelector value={adv.icon} onChange={(value) => handleChange('advantages', index, 'icon', value)} />
            </div>
            <div className="form-group">
              <label>Заголовок</label>
              <input value={adv.title} onChange={e => handleChange('advantages', index, 'title', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Описание</label>
              <textarea value={adv.description} onChange={e => handleChange('advantages', index, 'description', e.target.value)} rows="2"></textarea>
            </div>
          </ItemCard>
        ))}
        <button type="button" onClick={() => addItem('advantages', {title: '', description: '', icon: ''})} className="add-item-btn"><FaPlus /> Добавить</button>
      </Section>

      <Section title="Почему мы">
        {formData.whyChooseUs.map((item, index) => (
          <ItemCard key={index} title={`Причина #${index + 1}`} onRemove={() => removeItem('whyChooseUs', index)}>
            <div className="form-group">
              <label>Заголовок</label>
              <input value={item.title} onChange={e => handleChange('whyChooseUs', index, 'title', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Описание</label>
              <textarea value={item.description} onChange={e => handleChange('whyChooseUs', index, 'description', e.target.value)} rows="2"></textarea>
            </div>
          </ItemCard>
        ))}
        <button type="button" onClick={() => addItem('whyChooseUs', {title: '', description: ''})} className="add-item-btn"><FaPlus /> Добавить</button>
      </Section>
      
      <div className="page-actions">
        <button onClick={() => updateAboutContent(formData)} className="save-content-btn">
          <FaSave /> Сохранить все изменения
        </button>
      </div>
    </div>
  );
}