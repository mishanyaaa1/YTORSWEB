import React from 'react';
import brandImagePng from '../img/лого вектор 2-min.png';
import brandImageWebp from '../img/лого вектор 2-min.webp';

function BrandMark({ alt = 'ЮТОРС', className = '', style = {}, size }) {
  const computedStyle = { ...style };
  if (size) {
    computedStyle.height = typeof size === 'number' ? `${size}px` : size;
    if (!computedStyle.width) {
      computedStyle.width = 'auto';
    }
  }
  return (
    <picture>
      <source srcSet={brandImageWebp} type="image/webp" />
      <img
        src={brandImagePng}
        alt={alt}
        className={className}
        style={computedStyle}
        loading="lazy"
        decoding="async"
      />
    </picture>
  );
}

export default BrandMark;


