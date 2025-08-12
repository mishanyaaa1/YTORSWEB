import React from 'react';
import { Link } from 'react-router-dom';
import './BrandLogo.css';
import brandImage from '../img/лого вектор 2.png';

function BrandLogo({ to = '/', className = '', size = 'md', text = 'ЮТОРС' }) {
  const sizePx = size === 'sm' ? 26 : size === 'lg' ? 40 : 32;

  return (
    <Link to={to} className={`brand-logo ${className}`} aria-label={text} title={text}>
      <img src={brandImage} alt={text} className="brand-logo-img" style={{ height: `${sizePx}px` }} />
      <span className="brand-logo-text">{text}</span>
    </Link>
  );
}

export default BrandLogo;


