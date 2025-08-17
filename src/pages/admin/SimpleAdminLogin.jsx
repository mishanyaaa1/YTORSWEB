import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#0a0a0a',
      color: 'white'
    }}>
      <div style={{
        background: '#1a1a1a',
        padding: '40px',
        borderRadius: '10px',
        width: '400px'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
          Админ панель
        </h1>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Логин:
            </label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              style={{
                width: '100%',
                padding: '10px',
                background: '#333',
                border: '2px solid #555',
                borderRadius: '6px',
                color: 'white'
              }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Пароль:
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              style={{
                width: '100%',
                padding: '10px',
                background: '#333',
                border: '2px solid #555',
                borderRadius: '6px',
                color: 'white'
              }}
              required
            />
          </div>
          
          {error && (
            <div style={{ color: 'red', marginBottom: '20px' }}>
              {error}
            </div>
          )}
          
          <button 
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              background: '#e6a34a',
              border: '2px solid #e6a34a',
              borderRadius: '6px',
              color: 'black',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Войти
          </button>
        </form>
        
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          background: '#2a2a2a', 
          borderRadius: '5px',
          fontSize: '14px'
        }}>
          Введите логин и пароль администратора для входа.
        </div>
      </div>
    </div>
  );
}

export default SimpleAdminLogin;
