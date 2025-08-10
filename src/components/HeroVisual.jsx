import React from 'react';

export default function HeroVisual() {
  return (
    <svg
      className="hero-visual-svg"
      viewBox="0 0 600 360"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Иллюстрация автозапчастей"
    >
      <defs>
        <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="var(--primary-variant)" />
        </linearGradient>
        <radialGradient id="bg" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="var(--background-light)" />
          <stop offset="100%" stopColor="var(--surface)" />
        </radialGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect x="0" y="0" width="600" height="360" fill="url(#bg)" rx="8" />

      {/* Большая шестерня */}
      <g className="gear-large" transform="translate(180,180)">
        <circle r="70" fill="none" stroke="url(#g1)" strokeWidth="4" filter="url(#glow)" />
        {Array.from({ length: 12 }).map((_, i) => (
          <rect
            key={i}
            x="-6"
            y="-90"
            width="12"
            height="20"
            rx="3"
            fill="var(--primary)"
            opacity="0.8"
            transform={`rotate(${(360 / 12) * i})`}
          />
        ))}
        <circle r="12" fill="var(--primary)" opacity="0.8" />
      </g>

      {/* Малая шестерня */}
      <g className="gear-small" transform="translate(380,200)">
        <circle r="42" fill="none" stroke="url(#g1)" strokeWidth="3" filter="url(#glow)" />
        {Array.from({ length: 10 }).map((_, i) => (
          <rect
            key={i}
            x="-5"
            y="-60"
            width="10"
            height="15"
            rx="2"
            fill="var(--primary)"
            opacity="0.8"
            transform={`rotate(${(360 / 10) * i})`}
          />
        ))}
        <circle r="9" fill="var(--primary)" opacity="0.8" />
      </g>
      
      {/* Анимация частиц */}
      <circle cx="100" cy="80" r="2" fill="var(--primary-variant)" opacity="0.5">
        <animateTransform attributeName="transform" type="translate" values="0 0; 250 150; 0 0" dur="8s" repeatCount="indefinite" />
      </circle>
      <circle cx="450" cy="280" r="3" fill="var(--primary)" opacity="0.6">
         <animateTransform attributeName="transform" type="translate" values="0 0; -200 -120; 0 0" dur="10s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}


