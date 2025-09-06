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
        const errorText = await createResponse.text();
        let errorMessage;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.details || errorJson.error || errorText;
        } catch {
          errorMessage = errorText;
        }
        throw new Error(`Create failed: ${createResponse.status} - ${errorMessage}`);
      }

      // Получаем ID созданного бренда
      const createdBrand = await createResponse.json();
      const brandId = createdBrand.id;

      if (!brandId) {
        throw new Error('Brand ID not returned after creation');
      }

      // Удаление по ID
      const deleteResponse = await fetch(getApiUrl(`/api/brands/${brandId}`), {
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

  const fixSequences = async () => {
    try {
      setDiagnostics(prev => ({ ...prev, sequenceFix: 'fixing...' }));
      
      const response = await fetch(getApiUrl('/api/admin/fix-sequences'), {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Fix failed: ${response.status}`);
      }

      const result = await response.json();
      
      setDiagnostics(prev => ({ 
        ...prev, 
        sequenceFix: '✅ Sequences исправлены',
        sequenceResults: result.results
      }));
      
      // Через секунду попробуем тест сохранения снова
      setTimeout(() => {
        testSaveOperation();
      }, 1000);
      
    } catch (error) {
      setDiagnostics(prev => ({ 
        ...prev, 
        sequenceFix: `❌ Ошибка: ${error.message}`
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
          {diagnostics.testSave && diagnostics.testSave.includes('duplicate key value') && (
            <button onClick={fixSequences} className="fix-button">
              🔧 Исправить Sequences
            </button>
          )}
        </div>
        {diagnostics.sequenceFix && (
          <div className="diagnostic-item">
            <strong>Исправление Sequences:</strong> {diagnostics.sequenceFix}
          </div>
        )}
        {diagnostics.sequenceResults && (
          <div className="diagnostic-item">
            <strong>Результаты исправления:</strong>
            <ul className="sequence-results">
              {diagnostics.sequenceResults.map((result, idx) => (
                <li key={idx}>
                  {result.table}: {result.error ? 
                    <span className="error">{result.error}</span> : 
                    `max_id=${result.maxId} → sequence=${result.newSequenceValue}`
                  }
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {diagnostics.debugInfo && (
        <div className="diagnostic-section">
          <h2>Отладочная информация</h2>
          
          {diagnostics.debugInfo.database && (
            <div className="database-info">
              <h3>📊 База данных</h3>
              <div><strong>Статус:</strong> 
                <span className={`status ${diagnostics.debugInfo.database.status}`}>
                  {diagnostics.debugInfo.database.status === 'connected' ? '✅ Подключена' : '❌ Ошибка'}
                </span>
              </div>
              
              {diagnostics.debugInfo.database.error ? (
                <div className="error">
                  <strong>Ошибка:</strong> {diagnostics.debugInfo.database.error}
                  {diagnostics.debugInfo.database.stack && (
                    <details>
                      <summary>Детали ошибки</summary>
                      <pre>{diagnostics.debugInfo.database.stack}</pre>
                    </details>
                  )}
                </div>
              ) : (
                <>
                  <div><strong>Таблицы ({diagnostics.debugInfo.database.tables?.length || 0}):</strong> 
                    {diagnostics.debugInfo.database.tables?.length ? 
                      diagnostics.debugInfo.database.tables.join(', ') : 
                      'Таблицы не найдены'
                    }
                  </div>
                  
                  {diagnostics.debugInfo.database.recordCounts && (
                    <div>
                      <strong>Количество записей:</strong>
                      <ul>
                        {Object.entries(diagnostics.debugInfo.database.recordCounts).map(([table, count]) => (
                          <li key={table}>
                            {table}: {typeof count === 'string' && count.startsWith('Error') ? 
                              <span className="error">{count}</span> : 
                              count
                            }
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {diagnostics.debugInfo.database.migrations && (
                    <div>
                      <strong>Миграции ({diagnostics.debugInfo.database.migrations.length}):</strong>
                      {diagnostics.debugInfo.database.migrations.length === 0 ? (
                        <span className="warning"> Не применены</span>
                      ) : diagnostics.debugInfo.database.migrations[0]?.error ? (
                        <span className="error"> Ошибка: {diagnostics.debugInfo.database.migrations[0].error}</span>
                      ) : (
                        <ul>
                          {diagnostics.debugInfo.database.migrations.slice(0, 3).map((migration, idx) => (
                            <li key={idx}>{migration.filename} ({new Date(migration.applied_at).toLocaleString()})</li>
                          ))}
                          {diagnostics.debugInfo.database.migrations.length > 3 && 
                            <li>... и еще {diagnostics.debugInfo.database.migrations.length - 3}</li>
                          }
                        </ul>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          
          {diagnostics.debugInfo.environment && (
            <div className="environment-info">
              <h3>🌍 Окружение</h3>
              <div><strong>NODE_ENV:</strong> {diagnostics.debugInfo.environment.NODE_ENV || 'не установлено'}</div>
              <div><strong>DATABASE_URL:</strong> {diagnostics.debugInfo.environment.DATABASE_URL === 'set' ? '✅ Установлено' : '❌ Не установлено'}</div>
            </div>
          )}
          
          <details>
            <summary>🔍 Полная отладочная информация</summary>
            <pre className="debug-info">
              {JSON.stringify(diagnostics.debugInfo, null, 2)}
            </pre>
          </details>
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
