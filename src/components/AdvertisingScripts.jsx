import React, { useEffect, useState } from 'react';

function AdvertisingScripts() {
  const [scripts, setScripts] = useState({ head: [], body: [] });

  useEffect(() => {
    const loadAdvertisingScripts = async () => {
      try {
        const response = await fetch('/api/advertising/scripts');
        if (response.ok) {
          const data = await response.json();
          setScripts(data);
          
          // Вставляем скрипты для head
          if (data.head && data.head.length > 0) {
            const headScripts = data.head.join('\n');
            const scriptElement = document.createElement('div');
            scriptElement.innerHTML = headScripts;
            scriptElement.style.display = 'none';
            document.head.appendChild(scriptElement);
          }
          
          // Вставляем скрипты для body
          if (data.body && data.body.length > 0) {
            const bodyScripts = data.body.join('\n');
            const scriptElement = document.createElement('div');
            scriptElement.innerHTML = bodyScripts;
            scriptElement.style.display = 'none';
            document.body.appendChild(scriptElement);
          }
        }
      } catch (error) {
        console.error('Ошибка загрузки рекламных скриптов:', error);
      }
    };

    loadAdvertisingScripts();
  }, []);

  // Компонент не рендерит ничего видимого
  return null;
}

export default AdvertisingScripts;
