import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiGet, apiPost } from '../../utils/api';
import { API_CONFIG } from '../../config/api';
import BrandLogo from '../../components/BrandLogo';

function SimpleAdminDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        const res = await apiGet(API_CONFIG.ENDPOINTS.ADMIN_ME);
        if (!res.ok) throw new Error('unauth');
      } catch (_) {
        if (!canceled) navigate('/admin');
      }
    })();
    return () => { canceled = true; };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await apiPost(API_CONFIG.ENDPOINTS.ADMIN_LOGOUT);
    } finally {
      navigate('/admin');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: 'white'
    }}>
      <header style={{
        background: '#1a1a1a',
        padding: '20px',
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BrandLogo 
            to="/admin/advanced" 
            size="sm" 
            onClick={(e) => {
              if (window.location.pathname === '/admin/advanced') {
                e.preventDefault();
                window.location.reload();
              }
            }}
          />
          <h1 style={{ margin: 0, fontSize: '1.2rem' }}>Панель администратора</h1>
        </div>
        <div>
          <Link 
            to="/" 
            style={{ 
              color: '#e6a34a', 
              textDecoration: 'none', 
              marginRight: '20px' 
            }}
          >
            На сайт
          </Link>
          <button 
            onClick={handleLogout}
            style={{
              background: '#ff4444',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Выйти
          </button>
        </div>
      </header>

      <main style={{ padding: '40px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {/* Статистика */}
          <div style={{
            background: '#1a1a1a',
            padding: '20px',
            borderRadius: '10px'
          }}>
            <h3>📊 Статистика</h3>
            <div style={{ marginTop: '15px' }}>
              <div>Товаров: 6</div>
              <div>Вездеходов: 6</div>
              <div>Заказов: 12</div>
              <div>Клиентов: 45</div>
            </div>
          </div>

          {/* Быстрые действия */}
          <div style={{
            background: '#1a1a1a',
            padding: '20px',
            borderRadius: '10px'
          }}>
            <h3>⚡ Быстрые действия</h3>
            <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link 
                to="/admin/advanced"
                style={{
                  background: '#e6a34a',
                  color: 'black',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  textAlign: 'center'
                }}
              >
                🚀 Перейти к полной админке
              </Link>
              <Link 
                to="/admin/diagnostic"
                style={{
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  textAlign: 'center',
                  display: 'block'
                }}
              >
                🔧 Диагностика API
              </Link>
              <button style={{
                background: '#2196f3',
                color: 'white',
                border: 'none',
                padding: '10px',
                borderRadius: '5px',
                cursor: 'pointer'
              }}>
                🎯 Создать акцию
              </button>
            </div>
          </div>
        </div>

        {/* Вездеходы */}
        <div style={{
          background: '#1a1a1a',
          padding: '20px',
          borderRadius: '10px',
          marginTop: '20px'
        }}>
          <h3>🚗 Вездеходы</h3>
          <div style={{ marginTop: '15px' }}>
            <div style={{ 
              padding: '10px', 
              borderBottom: '1px solid #333',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>Вездеход "Буран" - Гусеничный</span>
              <span style={{ color: '#e6a34a' }}>2,500,000 ₽</span>
            </div>
            <div style={{ 
              padding: '10px', 
              borderBottom: '1px solid #333',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>Вездеход "Трэкол" - Колесный</span>
              <span style={{ color: '#e6a34a' }}>1,800,000 ₽</span>
            </div>
            <div style={{ 
              padding: '10px',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>Вездеход "Амфибия" - Плавающий</span>
              <span style={{ color: '#e6a34a' }}>3,200,000 ₽</span>
            </div>
          </div>
          <div style={{ marginTop: '15px' }}>
            <Link 
              to="/admin/advanced"
              style={{
                background: '#e6a34a',
                color: 'black',
                border: 'none',
                padding: '10px',
                borderRadius: '5px',
                cursor: 'pointer',
                textDecoration: 'none',
                textAlign: 'center',
                display: 'block'
              }}
            >
              🚀 Управление вездеходами
            </Link>
          </div>
        </div>

        {/* Последние заказы */}
        <div style={{
          background: '#1a1a1a',
          padding: '20px',
          borderRadius: '10px',
          marginTop: '20px'
        }}>
          <h3>📦 Последние заказы</h3>
          <div style={{ marginTop: '15px' }}>
            <div style={{ 
              padding: '10px', 
              borderBottom: '1px solid #333',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>Заказ #1023 - Гусеницы для вездехода</span>
              <span style={{ color: '#e6a34a' }}>45,000 ₽</span>
            </div>
            <div style={{ 
              padding: '10px', 
              borderBottom: '1px solid #333',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>Заказ #1022 - Двигатель 2.0L</span>
              <span style={{ color: '#e6a34a' }}>180,000 ₽</span>
            </div>
            <div style={{ 
              padding: '10px',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>Заказ #1021 - Подвеска</span>
              <span style={{ color: '#e6a34a' }}>65,000 ₽</span>
            </div>
          </div>
        </div>

        {/* Информация */}
        <div style={{
          marginTop: '40px',
          background: '#1a1a1a',
          padding: '20px',
          borderRadius: '10px'
        }}>
          <h3>ℹ️ Информация</h3>
          <p>Добро пожаловать в админ-панель сайта ВездеходЗапчасти!</p>
          <p>Здесь вы можете управлять товарами, заказами, акциями и контентом сайта.</p>
          <p>Для полного функционала будут добавлены дополнительные разделы.</p>
        </div>
      </main>
    </div>
  );
}

export default SimpleAdminDashboard;
