import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaCog, FaArrowLeft, FaShieldAlt, FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import './SimpleAdminLogin.css';

function SimpleAdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Анимация появления элементов
    const timer = setTimeout(() => {
      document.querySelector('.login-card')?.classList.add('animate-in');
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!username || !password) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    setIsLoading(true);
    
    // Имитация проверки авторизации
    setTimeout(() => {
      if (username === 'admin' && password === 'admin123') {
        setSuccess('Вход выполнен успешно! Перенаправление...');
        localStorage.setItem('adminAuth', 'true');
        setTimeout(() => {
          navigate('/admin/advanced');
        }, 1500);
      } else {
        setError('Неверное имя пользователя или пароль');
      }
      setIsLoading(false);
    }, 1500);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="admin-login-container">
      {/* Анимированные фоновые элементы */}
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
        <div className="shape shape-5"></div>
      </div>
      
      {/* Фоновые круги */}
      <div className="background-circles">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
      </div>
      
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <div className="logo-icon-wrapper">
              <FaCog className="logo-icon" />
            </div>
            <span className="logo-text">Вездеход Запчасти</span>
          </div>
          <p className="login-subtitle">Панель администратора</p>
          <div className="security-badge">
            <FaShieldAlt />
            <span>Защищенный доступ</span>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <div className="error-icon">⚠️</div>
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            <div className="success-icon">✅</div>
            {success}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="input-wrapper">
              <FaUser className="input-icon" />
              <input
                type="text"
                className="form-input"
                placeholder=" "
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
              <label className="form-label">Имя пользователя</label>
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <label className="form-label">Пароль</label>
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                disabled={isLoading}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                <span className="loading-text">Вход...</span>
              </>
            ) : (
              <>
                <FaShieldAlt />
                <span>Войти в систему</span>
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <div className="back-to-site">
            <Link to="/" className="back-link">
              <FaArrowLeft />
              <span>Вернуться на сайт</span>
            </Link>
          </div>

          <div className="demo-credentials">
            <div className="credentials-header">
              <FaShieldAlt />
              <span>Тестовые данные для входа</span>
            </div>
            <div className="credentials-content">
              <div className="credential-item">
                <span className="credential-label">Логин:</span>
                <code className="credential-value">admin</code>
              </div>
              <div className="credential-item">
                <span className="credential-label">Пароль:</span>
                <code className="credential-value">admin123</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SimpleAdminLogin;
