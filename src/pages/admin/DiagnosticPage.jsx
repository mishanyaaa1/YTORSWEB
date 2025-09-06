import React, { useState, useEffect } from 'react';
import { apiGet } from '../../utils/api';
import { getApiUrl } from '../../config/api';
import './DiagnosticPage.css';

function DiagnosticPage() {
  const [diagnostics, setDiagnostics] = useState({
    apiConnection: 'testing...',
    adminAuth: 'testing...',
    debugInfo: null,
    testSave: 'not tested',
    errors: []
  });

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    const results = { ...diagnostics, errors: [] };

    // Тест 1: Проверка подключения к API
    try {
      const healthResponse = await fetch(getApiUrl('/api/health'));
      if (healthResponse.ok) {
        results.apiConnection = '✅ OK';
      } else {
        results.apiConnection = `❌ HTTP ${healthResponse.status}`;
        results.errors.push(`Health check failed: ${healthResponse.status}`);
      }
    } catch (error) {
      results.apiConnection = `❌ ${error.message}`;
      results.errors.push(`API connection error: ${error.message}`);
    }

    // Тест 2: Проверка авторизации
    try {
      const meResponse = await apiGet('/api/admin/me');
      if (meResponse.ok) {
        const userData = await meResponse.json();
        results.adminAuth = `✅ Авторизован как ${userData.username}`;
      } else {
        results.adminAuth = `❌ Не авторизован (${meResponse.status})`;
        results.errors.push(`Auth check failed: ${meResponse.status}`);
      }
    } catch (error) {
      results.adminAuth = `❌ ${error.message}`;
      results.errors.push(`Auth error: ${error.message}`);
    }

    // Тест 3: Получение отладочной информации
    try {
      const debugResponse = await fetch(getApiUrl('/api/admin/debug'), {
        credentials: 'include'
      });
      if (debugResponse.ok) {
        const debugData = await debugResponse.json();
        results.debugInfo = debugData;
      } else {
        results.errors.push(`Debug info failed: ${debugResponse.status}`);
      }
    } catch (error) {
      results.errors.push(`Debug info error: ${error.message}`);
    }

    setDiagnostics(results);
  };

  const testSaveOperation = async () => {
    setDiagnostics(prev => ({ ...prev, testSave: 'testing...' }));
    
    try {
      // Попробуем создать и удалить тестовый бренд
      const testBrandName = `test-${Date.now()}`;
      
      // Создание
      const createResponse = await fetch(getApiUrl('/api/brands'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: testBrandName })
      });

      if (!createResponse.ok) {
        throw new Error(`Create failed: ${createResponse.status}`);
      }

      // Удаление
      const deleteResponse = await fetch(getApiUrl(`/api/brands/${encodeURIComponent(testBrandName)}`), {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!deleteResponse.ok) {
        throw new Error(`Delete failed: ${deleteResponse.status}`);
      }

      setDiagnostics(prev => ({ 
        ...prev, 
        testSave: '✅ Тест сохранения прошел успешно',
        errors: prev.errors.filter(e => !e.includes('test save'))
      }));
    } catch (error) {
      setDiagnostics(prev => ({ 
        ...prev, 
        testSave: `❌ ${error.message}`,
        errors: [...prev.errors, `Test save error: ${error.message}`]
      }));
    }
  };

  return (
    <div className="diagnostic-page">
      <h1>🔧 Диагностика API</h1>
      
      <div className="diagnostic-section">
        <h2>Статус подключений</h2>
        <div className="diagnostic-item">
          <strong>Подключение к API:</strong> {diagnostics.apiConnection}
        </div>
        <div className="diagnostic-item">
          <strong>Авторизация:</strong> {diagnostics.adminAuth}
        </div>
        <div className="diagnostic-item">
          <strong>Тест сохранения:</strong> {diagnostics.testSave}
          {diagnostics.testSave === 'not tested' && (
            <button onClick={testSaveOperation} className="test-button">
              Запустить тест
            </button>
          )}
        </div>
      </div>

      {diagnostics.debugInfo && (
        <div className="diagnostic-section">
          <h2>Отладочная информация</h2>
          <pre className="debug-info">
            {JSON.stringify(diagnostics.debugInfo, null, 2)}
          </pre>
        </div>
      )}

      {diagnostics.errors.length > 0 && (
        <div className="diagnostic-section errors">
          <h2>Ошибки</h2>
          <ul>
            {diagnostics.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="diagnostic-section">
        <h2>Конфигурация</h2>
        <div className="diagnostic-item">
          <strong>API URL:</strong> {getApiUrl('')}
        </div>
        <div className="diagnostic-item">
          <strong>Cookies включены:</strong> {navigator.cookieEnabled ? '✅' : '❌'}
        </div>
        <div className="diagnostic-item">
          <strong>HTTPS:</strong> {window.location.protocol === 'https:' ? '✅' : '❌'}
        </div>
      </div>

      <button onClick={runDiagnostics} className="refresh-button">
        🔄 Обновить диагностику
      </button>
    </div>
  );
}

export default DiagnosticPage;
