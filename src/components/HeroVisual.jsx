import React from 'react';
import './HeroVisual.css';

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
          <stop offset="0%" stopColor="#e6a34a" />
          <stop offset="100%" stopColor="#c97c1a" />
        </linearGradient>
        <radialGradient id="bg" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#0a0a0a" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </radialGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect x="0" y="0" width="600" height="360" fill="url(#bg)" rx="16" />

      {/* Большая шестерня */}
      <g className="gear-large" transform="translate(180,180)">
        <circle r="70" fill="none" stroke="url(#g1)" strokeWidth="6" filter="url(#glow)" />
        {Array.from({ length: 12 }).map((_, i) => (
          <rect
            key={i}
            x="-6"
            y="-100"
            width="12"
            height="26"
            rx="3"
            fill="#e6a34a"
            opacity="0.9"
            transform={`rotate(${(360 / 12) * i})`}
          />
        ))}
        <circle r="12" fill="#e6a34a" opacity="0.9" />
      </g>

      {/* Малая шестерня */}
      <g className="gear-small" transform="translate(380,200)">
        <circle r="42" fill="none" stroke="url(#g1)" strokeWidth="5" filter="url(#glow)" />
        {Array.from({ length: 10 }).map((_, i) => (
          <rect
            key={i}
            x="-5"
            y="-65"
            width="10"
            height="18"
            rx="2"
            fill="#e6a34a"
            opacity="0.9"
            transform={`rotate(${(360 / 10) * i})`}
          />
        ))}
        <circle r="9" fill="#e6a34a" opacity="0.9" />
      </g>

      {/* Контур детали */}
      <path
        d="M420 110 h60 a10 10 0 0 1 10 10 v36 a10 10 0 0 1 -10 10 h-60 a10 10 0 0 1 -10 -10 v-36 a10 10 0 0 1 10 -10 z"
        fill="none"
        stroke="url(#g1)"
        strokeWidth="3"
        opacity="0.8"
      />
    </svg>
  );
}


