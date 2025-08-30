import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaSave, FaFlask, FaInfoCircle } from 'react-icons/fa';
import './EmailManagement.css';

const EmailManagement = () => {
  const [settings, setSettings] = useState({
    recipient_email: '',
    enabled: true
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState('');
  const [testResult, setTestResult] = useState('');

  useEffect(() => {
    loadEmailSettings();
  }, []);

  const loadEmailSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/email');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
      setMessage('Ошибка загрузки настроек');
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
      const response = await fetch('/api/admin/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage('Настройки сохранены успешно!');
        setTestResult('');
      } else {
        const error = await response.json();
        setMessage(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      setMessage('Ошибка сохранения настроек');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    try {
      setTesting(true);
      const response = await fetch('/api/admin/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setTestResult('Тестовое сообщение отправлено успешно!');
        setMessage('');
      } else {
        const error = await response.json();
        setTestResult(`Ошибка: ${error.error}`);
        
        // Показываем дополнительную информацию об ошибке
        if (error.error.includes('SMTP') || error.error.includes('email')) {
          setMessage('Проверьте настройки SMTP в файле server/smtp-config.js');
        }
      }
    } catch (error) {
      console.error('Ошибка тестирования:', error);
      setTestResult('Ошибка тестирования');
    } finally {
      setTesting(false);
    }
  };

  const clearMessage = () => {
    setMessage('');
    setTestResult('');
  };

  return (
    <div className="email-management">
      <h2><FaEnvelope style={{ marginRight: '0.5rem' }} />Управление Email уведомлениями</h2>
      
      {message && (
        <div className={`alert ${message.includes('успешно') ? 'alert-success' : 'alert-error'}`}>
          {message}
          <button onClick={clearMessage} className="alert-close">&times;</button>
        </div>
      )}

      <div className="info-box">
        <FaInfoCircle style={{ marginRight: '0.5rem' }} />
        <strong>SMTP настройки предустановлены:</strong>
        <br />
        • Поддерживаемые провайдеры: Gmail, Yandex, Mail.ru, Outlook, Yahoo<br />
        • Автоматический выбор портов и протоколов<br />
        • Безопасная аутентификация<br />
        <br />
        <strong>Для изменения настроек отредактируйте файл:</strong><br />
        <code>server/smtp-config.js</code><br />
        <br />
        <strong>Быстрая настройка:</strong><br />
        1. Измените EMAIL_PROVIDER на нужный сервис<br />
        2. Укажите ваш email и пароль приложения<br />
        3. Перезапустите сервер
      </div>

      <div className="status-box">
        <strong>Статус:</strong> {settings.enabled ? 'Включено' : 'Отключено'}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <div className="form-group">
          <label htmlFor="recipient_email">Email для получения уведомлений:</label>
          <input
            type="email"
            id="recipient_email"
            name="recipient_email"
            value={settings.recipient_email}
            onChange={handleInputChange}
            placeholder="example@email.com"
            required
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="enabled"
              checked={settings.enabled}
              onChange={handleInputChange}
            />
            Включить email уведомления
          </label>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving || loading}
          >
            {saving ? 'Сохранение...' : <><FaSave /> Сохранить</>}
          </button>
          
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleTest}
            disabled={testing || loading || !settings.enabled || !settings.recipient_email}
          >
            {testing ? 'Отправка...' : <><FaFlask /> Тест</>}
          </button>
        </div>
      </form>

      {testResult && (
        <div className={`test-result ${testResult.includes('успешно') ? 'success' : 'error'}`}>
          <strong>Результат теста:</strong> {testResult}
        </div>
      )}
    </div>
  );
};

export default EmailManagement;
