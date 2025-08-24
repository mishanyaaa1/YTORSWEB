import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './BrandLogo.css';
import brandImagePng from '../img/лого вектор 2-min.png';
import brandImageWebp from '../img/лого вектор 2-min.webp';

function BrandLogo({ to = '/', className = '', size = 'md', text = 'ЮТОРС', onClick }) {
  const sizePx = size === 'sm' ? 26 : size === 'lg' ? 40 : 32;
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
    
    // Если мы уже на главной странице, обновляем её
    if (window.location.pathname === '/') {
      e.preventDefault();
      window.location.reload();
    }
  };

  return (
    <Link to={to} className={`brand-logo ${className}`} aria-label={text} title={text} onClick={handleClick}>
      <picture>
        <source srcSet={brandImageWebp} type="image/webp" />
        <img
          src={brandImagePng}
          alt={text}
          className="brand-logo-img"
          style={{ height: `${sizePx}px` }}
          loading="eager"
          decoding="async"
        />
      </picture>
      <span className="brand-logo-text">{text}</span>
    </Link>
  );
}

export default BrandLogo;


