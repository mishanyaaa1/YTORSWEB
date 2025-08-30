import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { apiGet } from '../utils/api';
import { API_CONFIG } from '../config/api';

function RequireAdmin({ children }) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let isCanceled = false;
    (async () => {
      try {
        const res = await apiGet(API_CONFIG.ENDPOINTS.ADMIN_ME);
        if (!isCanceled) setIsAuthorized(res.ok);
      } catch (_) {
        if (!isCanceled) setIsAuthorized(false);
      } finally {
        if (!isCanceled) setIsChecking(false);
      }
    })();
    return () => { isCanceled = true; };
  }, []);

  if (isChecking) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0a0a0a',
        color: '#e6a34a'
      }}>
        Проверка прав доступа...
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

export default RequireAdmin;


