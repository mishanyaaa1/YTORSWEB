import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import './AdminLogin.css';

function AdminLogin() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Простая проверка логина/пароля (в реальном приложении это должно быть на сервере)
    setTimeout(() => {
      if (credentials.username === 'admin' && credentials.password === 'admin123') {
        localStorage.setItem('adminAuth', 'true');
        navigate('/admin/dashboard');
      } else {
        setError('Неверный логин или пароль');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="admin-login-page">
      <div className="login-container">
        <motion.div 
          className="login-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="login-header">
            <h1>Панель администратора</h1>
            <p>Войдите для управления сайтом</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Имя пользователя</label>
              <div className="input-wrapper">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  name="username"
                  value={credentials.username}
                  onChange={handleInputChange}
                  placeholder="Введите логин"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Пароль</label>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={credentials.password}
                  onChange={handleInputChange}
                  placeholder="Введите пароль"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div 
                className="error-message"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              className="login-btn"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </motion.button>
          </form>

          <div className="login-info">
            <p><strong>Тестовые данные для входа:</strong></p>
            <p>Логин: admin</p>
            <p>Пароль: admin123</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default AdminLogin;
