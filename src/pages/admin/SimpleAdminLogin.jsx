import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SimpleAdminLogin.css';

function SimpleAdminLogin() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: credentials.username, password: credentials.password })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Ошибка входа');
      }
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Ошибка входа');
    }
  };

  return (
    <div className="simple-admin-login">
      <div className="simple-login-container">
        <div className="simple-login-header">
          <h1>Админ панель</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="simple-login-form">
          <div className="simple-form-group">
            <label>Логин:</label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              required
            />
          </div>
          
          <div className="simple-form-group">
            <label>Пароль:</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              required
            />
          </div>
          
          {error && (
            <div className="simple-error-message">
              {error}
            </div>
          )}
          
          <button type="submit" className="simple-login-btn">
            Войти
          </button>
        </form>
        
        <div className="simple-login-info">
          Введите логин и пароль администратора для входа.
        </div>
      </div>
    </div>
  );
}

export default SimpleAdminLogin;
