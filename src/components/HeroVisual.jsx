import React from 'react';

export default function HeroVisual() {
  return (
    <svg
      className="hero-visual-svg"
      viewBox="0 0 600 360"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Механика / запчасти"
    >
      <defs>
        <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6c757d" />
          <stop offset="100%" stopColor="#495057" />
        </linearGradient>
        <radialGradient id="bg" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#f8f9fa" />
          <stop offset="100%" stopColor="#e9ecef" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="600" height="360" fill="url(#bg)" rx="12" stroke="#dee2e6" strokeWidth="2" />

      {/* Большая шестерня */}
      <g transform="translate(180,180)">
        <g className="gear-large">
          <circle r="70" fill="none" stroke="#6c757d" strokeWidth="4" />
          {Array.from({ length: 12 }).map((_, i) => (
            <rect
              key={i}
              x="-6"
              y="-100"
              width="12"
              height="26"
              rx="3"
              fill="#6c757d"
              opacity="0.8"
              transform={`rotate(${(360 / 12) * i})`}
            />
          ))}
          <circle r="12" fill="#6c757d" opacity="0.8" />
        </g>
      </g>

      {/* Малая шестерня */}
      <g transform="translate(380,200)">
        <g className="gear-small">
          <circle r="42" fill="none" stroke="#6c757d" strokeWidth="3" />
          {Array.from({ length: 10 }).map((_, i) => (
            <rect
              key={i}
              x="-5"
              y="-65"
              width="10"
              height="18"
              rx="2"
              fill="#6c757d"
              opacity="0.8"
              transform={`rotate(${(360 / 10) * i})`}
            />
          ))}
          <circle r="9" fill="#6c757d" opacity="0.8" />
        </g>
      </g>

      {/* Контур детали */}
      <path
        d="M420 110 h60 a10 10 0 0 1 10 10 v36 a10 10 0 0 1 -10 10 h-60 a10 10 0 0 1 -10 -10 v-36 a10 10 0 0 1 10 -10 z"
        fill="none"
        stroke="#6c757d"
        strokeWidth="2"
        opacity="0.7"
      />

      {/* Дополнительные технические элементы */}
      <rect x="120" y="280" width="80" height="40" rx="4" fill="none" stroke="#6c757d" strokeWidth="2" opacity="0.6" />
      <rect x="400" y="280" width="60" height="30" rx="3" fill="none" stroke="#6c757d" strokeWidth="2" opacity="0.6" />
      
      {/* Линии соединения */}
      <line x1="200" y1="300" x2="380" y2="300" stroke="#6c757d" strokeWidth="1" opacity="0.4" />
      <line x1="200" y1="300" x2="200" y2="200" stroke="#6c757d" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}


