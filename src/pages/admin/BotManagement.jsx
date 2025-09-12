import React, { useState, useEffect } from 'react';
import { FaRobot, FaSave, FaInfoCircle, FaEye, FaEyeSlash } from 'react-icons/fa';
import './BotManagement.css';

const BotManagement = () => {
  const [settings, setSettings] = useState({
    bot_token: '',
    enabled: true
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    loadBotSettings();
  }, []);

  const loadBotSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/bot');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        setMessage('Ошибка загрузки настроек бота', 'error');
      }
    } catch (error) {
      setMessage('Ошибка загрузки настроек бота: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage('Настройки бота успешно сохранены!', 'success');
      } else {
        const error = await response.json();
        setMessage('Ошибка сохранения: ' + (error.error || 'Неизвестная ошибка'), 'error');
      }
    } catch (error) {
      setMessage('Ошибка сохранения: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };


  const clearMessage = () => {
    setMessage('');
    setMessageType('');
  };

  if (loading) {
    return (
      <div className="bot-management">
        <div className="loading">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="bot-management">
      <h2>
        <FaRobot style={{ marginRight: '0.5rem' }} />
        Управление Telegram ботом
      </h2>

      {message && (
        <div className={`alert alert-${messageType}`}>
          {message}
          <button 
            onClick={clearMessage}
            style={{ 
              float: 'right', 
              background: 'none', 
              border: 'none', 
              fontSize: '1.2rem', 
              cursor: 'pointer' 
            }}
          >
            ×
          </button>
        </div>
      )}

      <div className="bot-info">
        <h3><FaInfoCircle /> Информация о настройке</h3>
        <p>• <strong>Bot Token:</strong> Получите у @BotFather в Telegram</p>
        <p>• <strong>Включен:</strong> Включить/выключить отправку уведомлений</p>
        <p>• <strong>Chat ID:</strong> Автоматически определяется системой</p>
      </div>

      <div className="bot-status">
        <h3>Текущий статус</h3>
        <div className="status-item">
          <span className="status-label">Статус бота:</span>
          <span className={`status-value ${settings.enabled ? 'enabled' : 'disabled'}`}>
            {settings.enabled ? 'Включен' : 'Отключен'}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">Токен настроен:</span>
          <span className={`status-value ${settings.bot_token ? 'enabled' : 'disabled'}`}>
            {settings.bot_token ? 'Да' : 'Нет'}
          </span>
        </div>
      </div>

      <div className="bot-settings-form">
        <h3>Настройки бота</h3>
        
        <div className="form-group">
          <label htmlFor="bot_token">Bot Token:</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showToken ? 'text' : 'password'}
              id="bot_token"
              name="bot_token"
              value={settings.bot_token}
              onChange={handleInputChange}
              placeholder="1234567890:AAHOV3xvBPioSoBh53bPfceJBBkFYk1aqu0"
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              {showToken ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <div className="help-text">
            Токен вашего бота от @BotFather
          </div>
        </div>

        <div className="form-group">
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="enabled"
              name="enabled"
              checked={settings.enabled}
              onChange={handleInputChange}
            />
            <label htmlFor="enabled">Включить бота</label>
          </div>
          <div className="help-text">
            Отключите, если хотите временно прекратить отправку уведомлений
          </div>
        </div>

        <div className="bot-actions">
          <button
            type="button"
            className="btn btn-primary save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <div className="loading"></div> : <FaSave />}
            {saving ? 'Сохранение...' : 'Сохранить настройки'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BotManagement;
