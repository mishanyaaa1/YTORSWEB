import React, { useState, useEffect } from 'react';
import { FaAd, FaYandex, FaGoogle, FaFacebook, FaVk, FaTelegram, FaSave, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';
import './AdvertisingManagement.css';

function AdvertisingManagement() {
  const [advertisingData, setAdvertisingData] = useState({
    yandexDirect: {
      enabled: false,
      counterId: '',
      remarketingCode: '',
      conversionCode: '',
      pixelCode: ''
    },
    googleAds: {
      enabled: false,
      conversionId: '',
      conversionLabel: '',
      remarketingCode: '',
      gtagCode: ''
    },
    facebookPixel: {
      enabled: false,
      pixelId: '',
      conversionCode: ''
    },
    vkPixel: {
      enabled: false,
      pixelId: '',
      conversionCode: ''
    },
    telegramPixel: {
      enabled: false,
      botToken: '',
      chatId: ''
    },
    customScripts: {
      enabled: false,
      headScripts: '',
      bodyScripts: ''
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadAdvertisingData();
  }, []);

  const loadAdvertisingData = async () => {
    try {
      const response = await fetch('/api/admin/advertising', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setAdvertisingData(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек рекламы:', error);
    }
  };

  const saveAdvertisingData = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/admin/advertising', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(advertisingData)
      });

      if (response.ok) {
        setMessage('Настройки рекламы успешно сохранены!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Ошибка при сохранении настроек');
      }
    } catch (error) {
      setMessage('Ошибка при сохранении настроек');
      console.error('Ошибка сохранения:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (platform, field) => {
    setAdvertisingData(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: !prev[platform][field]
      }
    }));
  };

  const handleInputChange = (platform, field, value) => {
    setAdvertisingData(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value
      }
    }));
  };

  const generateCodePreview = (platform) => {
    const data = advertisingData[platform];
    
    switch (platform) {
      case 'yandexDirect':
        if (!data.enabled) return '';
        return `
<!-- Yandex.Metrika counter -->
<script type="text/javascript" >
   (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
   m[i].l=1*new Date();
   for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
   k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
   (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

   ym(${data.counterId || 'COUNTER_ID'}, "init", {
        clickmap:true,
        trackLinks:true,
        accurateTrackBounce:true
   });
</script>
<noscript><div><img src="https://mc.yandex.ru/watch/${data.counterId || 'COUNTER_ID'}" style="position:absolute; left:-9999px;" alt="" /></div></noscript>
<!-- /Yandex.Metrika counter -->`;
      
      case 'googleAds':
        if (!data.enabled) return '';
        return `
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${data.gtagCode || 'GTAG_ID'}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${data.gtagCode || 'GTAG_ID'}');
</script>`;
      
      case 'facebookPixel':
        if (!data.enabled) return '';
        return `
<!-- Facebook Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${data.pixelId || 'PIXEL_ID'}');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${data.pixelId || 'PIXEL_ID'}&ev=PageView&noscript=1"
/></noscript>
<!-- End Facebook Pixel Code -->`;
      
      default:
        return '';
    }
  };

  const [expandedPlatforms, setExpandedPlatforms] = useState({
    yandexDirect: false,
    googleAds: false,
    facebookPixel: false,
    vkPixel: false,
    telegramPixel: false,
    customScripts: false
  });

  const toggleExpanded = (platform) => {
    setExpandedPlatforms(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  return (
    <div className="advertising-management">
      <div className="advertising-header">
        <h2><FaAd /> Управление рекламой</h2>
        <p>Настройте интеграцию с рекламными платформами для отслеживания конверсий и ретаргетинга</p>
      </div>

      {message && (
        <div className={`message ${message.includes('успешно') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="advertising-platforms">
        {/* Яндекс.Директ */}
        <div className="platform-card">
          <div className="platform-header" onClick={() => toggleExpanded('yandexDirect')}>
            <div className="platform-info">
              <FaYandex className="platform-icon yandex" />
              <div>
                <h3>Яндекс.Директ</h3>
                <p>Счетчик метрики, ремаркетинг, конверсии</p>
              </div>
            </div>
            <div className="platform-controls">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={advertisingData.yandexDirect.enabled}
                  onChange={() => handleToggle('yandexDirect', 'enabled')}
                />
                <span className="toggle-slider"></span>
              </label>
              <button className="expand-btn">
                {expandedPlatforms.yandexDirect ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          
          {expandedPlatforms.yandexDirect && (
            <div className="platform-content">
              <div className="form-group">
                <label>ID счетчика Яндекс.Метрики:</label>
                <input
                  type="text"
                  value={advertisingData.yandexDirect.counterId}
                  onChange={(e) => handleInputChange('yandexDirect', 'counterId', e.target.value)}
                  placeholder="12345678"
                />
              </div>
              
              <div className="form-group">
                <label>Код ремаркетинга:</label>
                <textarea
                  value={advertisingData.yandexDirect.remarketingCode}
                  onChange={(e) => handleInputChange('yandexDirect', 'remarketingCode', e.target.value)}
                  placeholder="Вставьте код ремаркетинга Яндекс.Директ"
                  rows="3"
                />
              </div>
              
              <div className="code-preview">
                <h4>Предварительный просмотр кода:</h4>
                <pre>{generateCodePreview('yandexDirect')}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Google Ads */}
        <div className="platform-card">
          <div className="platform-header" onClick={() => toggleExpanded('googleAds')}>
            <div className="platform-info">
              <FaGoogle className="platform-icon google" />
              <div>
                <h3>Google Ads</h3>
                <p>Google Tag Manager, конверсии, ремаркетинг</p>
              </div>
            </div>
            <div className="platform-controls">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={advertisingData.googleAds.enabled}
                  onChange={() => handleToggle('googleAds', 'enabled')}
                />
                <span className="toggle-slider"></span>
              </label>
              <button className="expand-btn">
                {expandedPlatforms.googleAds ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          
          {expandedPlatforms.googleAds && (
            <div className="platform-content">
              <div className="form-group">
                <label>ID конверсии Google Ads:</label>
                <input
                  type="text"
                  value={advertisingData.googleAds.conversionId}
                  onChange={(e) => handleInputChange('googleAds', 'conversionId', e.target.value)}
                  placeholder="AW-123456789"
                />
              </div>
              
              <div className="form-group">
                <label>Метка конверсии:</label>
                <input
                  type="text"
                  value={advertisingData.googleAds.conversionLabel}
                  onChange={(e) => handleInputChange('googleAds', 'conversionLabel', e.target.value)}
                  placeholder="AbCdEfGhIj"
                />
              </div>
              
              <div className="form-group">
                <label>Google Tag Manager ID:</label>
                <input
                  type="text"
                  value={advertisingData.googleAds.gtagCode}
                  onChange={(e) => handleInputChange('googleAds', 'gtagCode', e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
              
              <div className="code-preview">
                <h4>Предварительный просмотр кода:</h4>
                <pre>{generateCodePreview('googleAds')}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Facebook Pixel */}
        <div className="platform-card">
          <div className="platform-header" onClick={() => toggleExpanded('facebookPixel')}>
            <div className="platform-info">
              <FaFacebook className="platform-icon facebook" />
              <div>
                <h3>Facebook Pixel</h3>
                <p>Отслеживание событий Facebook</p>
              </div>
            </div>
            <div className="platform-controls">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={advertisingData.facebookPixel.enabled}
                  onChange={() => handleToggle('facebookPixel', 'enabled')}
                />
                <span className="toggle-slider"></span>
              </label>
              <button className="expand-btn">
                {expandedPlatforms.facebookPixel ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          
          {expandedPlatforms.facebookPixel && (
            <div className="platform-content">
              <div className="form-group">
                <label>ID пикселя Facebook:</label>
                <input
                  type="text"
                  value={advertisingData.facebookPixel.pixelId}
                  onChange={(e) => handleInputChange('facebookPixel', 'pixelId', e.target.value)}
                  placeholder="123456789012345"
                />
              </div>
              
              <div className="code-preview">
                <h4>Предварительный просмотр кода:</h4>
                <pre>{generateCodePreview('facebookPixel')}</pre>
              </div>
            </div>
          )}
        </div>

        {/* VK Pixel */}
        <div className="platform-card">
          <div className="platform-header" onClick={() => toggleExpanded('vkPixel')}>
            <div className="platform-info">
              <FaVk className="platform-icon vk" />
              <div>
                <h3>VK Pixel</h3>
                <p>Отслеживание событий ВКонтакте</p>
              </div>
            </div>
            <div className="platform-controls">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={advertisingData.vkPixel.enabled}
                  onChange={() => handleToggle('vkPixel', 'enabled')}
                />
                <span className="toggle-slider"></span>
              </label>
              <button className="expand-btn">
                {expandedPlatforms.vkPixel ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          
          {expandedPlatforms.vkPixel && (
            <div className="platform-content">
              <div className="form-group">
                <label>ID пикселя VK:</label>
                <input
                  type="text"
                  value={advertisingData.vkPixel.pixelId}
                  onChange={(e) => handleInputChange('vkPixel', 'pixelId', e.target.value)}
                  placeholder="VK123456"
                />
              </div>
              
              <div className="form-group">
                <label>Код отслеживания:</label>
                <textarea
                  value={advertisingData.vkPixel.conversionCode}
                  onChange={(e) => handleInputChange('vkPixel', 'conversionCode', e.target.value)}
                  placeholder="Вставьте код отслеживания VK"
                  rows="3"
                />
              </div>
            </div>
          )}
        </div>

        {/* Telegram Pixel */}
        <div className="platform-card">
          <div className="platform-header" onClick={() => toggleExpanded('telegramPixel')}>
            <div className="platform-info">
              <FaTelegram className="platform-icon telegram" />
              <div>
                <h3>Telegram Pixel</h3>
                <p>Отслеживание событий Telegram</p>
              </div>
            </div>
            <div className="platform-controls">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={advertisingData.telegramPixel.enabled}
                  onChange={() => handleToggle('telegramPixel', 'enabled')}
                />
                <span className="toggle-slider"></span>
              </label>
              <button className="expand-btn">
                {expandedPlatforms.telegramPixel ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          
          {expandedPlatforms.telegramPixel && (
            <div className="platform-content">
              <div className="form-group">
                <label>Токен бота:</label>
                <input
                  type="text"
                  value={advertisingData.telegramPixel.botToken}
                  onChange={(e) => handleInputChange('telegramPixel', 'botToken', e.target.value)}
                  placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                />
              </div>
              
              <div className="form-group">
                <label>ID чата:</label>
                <input
                  type="text"
                  value={advertisingData.telegramPixel.chatId}
                  onChange={(e) => handleInputChange('telegramPixel', 'chatId', e.target.value)}
                  placeholder="-1001234567890"
                />
              </div>
            </div>
          )}
        </div>

        {/* Пользовательские скрипты */}
        <div className="platform-card">
          <div className="platform-header" onClick={() => toggleExpanded('customScripts')}>
            <div className="platform-info">
              <FaAd className="platform-icon custom" />
              <div>
                <h3>Пользовательские скрипты</h3>
                <p>Дополнительные рекламные скрипты</p>
              </div>
            </div>
            <div className="platform-controls">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={advertisingData.customScripts.enabled}
                  onChange={() => handleToggle('customScripts', 'enabled')}
                />
                <span className="toggle-slider"></span>
              </label>
              <button className="expand-btn">
                {expandedPlatforms.customScripts ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          
          {expandedPlatforms.customScripts && (
            <div className="platform-content">
              <div className="form-group">
                <label>Скрипты для &lt;head&gt;:</label>
                <textarea
                  value={advertisingData.customScripts.headScripts}
                  onChange={(e) => handleInputChange('customScripts', 'headScripts', e.target.value)}
                  placeholder="Вставьте скрипты для секции head"
                  rows="4"
                />
              </div>
              
              <div className="form-group">
                <label>Скрипты для &lt;body&gt;:</label>
                <textarea
                  value={advertisingData.customScripts.bodyScripts}
                  onChange={(e) => handleInputChange('customScripts', 'bodyScripts', e.target.value)}
                  placeholder="Вставьте скрипты для секции body"
                  rows="4"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="advertising-actions">
        <button 
          className="save-btn"
          onClick={saveAdvertisingData}
          disabled={isLoading}
        >
          {isLoading ? 'Сохранение...' : <><FaSave /> Сохранить настройки</>}
        </button>
      </div>

      <div className="advertising-info">
        <h3>Инструкция по настройке:</h3>
        <div className="info-grid">
          <div className="info-item">
            <h4>Яндекс.Директ</h4>
            <p>1. Получите ID счетчика в Яндекс.Метрике<br/>
               2. Вставьте код ремаркетинга из кабинета Директ<br/>
               3. Настройте цели для отслеживания конверсий</p>
          </div>
          <div className="info-item">
            <h4>Google Ads</h4>
            <p>1. Создайте тег в Google Tag Manager<br/>
               2. Настройте триггеры для отслеживания событий<br/>
               3. Добавьте ID конверсии и метку</p>
          </div>
          <div className="info-item">
            <h4>Facebook Pixel</h4>
            <p>1. Создайте пиксель в Facebook Business Manager<br/>
               2. Скопируйте ID пикселя<br/>
               3. Настройте события для отслеживания</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdvertisingManagement;
