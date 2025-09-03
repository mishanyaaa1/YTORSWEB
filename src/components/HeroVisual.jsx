import React from 'react';

export default function HeroVisual() {
  return (
    <div className="hero-visual-container">
      {/* Фоновое изображение внедорожника */}
      <div className="hero-background-image">
        <div className="hero-overlay">
          {/* SVG элементы поверх изображения */}
          <svg
            className="hero-visual-svg"
            viewBox="0 0 600 360"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Внедорожник в снегу"
          >
            <defs>
              <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e6a34a" />
                <stop offset="100%" stopColor="#c97c1a" />
              </linearGradient>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Декоративные элементы */}
            <g transform="translate(100,100)">
              <g className="gear-large">
                <circle r="50" fill="none" stroke="url(#g1)" strokeWidth="4" filter="url(#glow)" opacity="0.7" />
                {Array.from({ length: 8 }).map((_, i) => (
                  <rect
                    key={i}
                    x="-4"
                    y="-70"
                    width="8"
                    height="20"
                    rx="2"
                    fill="#e6a34a"
                    opacity="0.6"
                    transform={`rotate(${(360 / 8) * i})`}
                  />
                ))}
                <circle r="8" fill="#e6a34a" opacity="0.6" />
              </g>
            </g>

            <g transform="translate(500,150)">
              <g className="gear-small">
                <circle r="30" fill="none" stroke="url(#g1)" strokeWidth="3" filter="url(#glow)" opacity="0.7" />
                {Array.from({ length: 6 }).map((_, i) => (
                  <rect
                    key={i}
                    x="-3"
                    y="-45"
                    width="6"
                    height="15"
                    rx="1"
                    fill="#e6a34a"
                    opacity="0.6"
                    transform={`rotate(${(360 / 6) * i})`}
                  />
                ))}
                <circle r="6" fill="#e6a34a" opacity="0.6" />
              </g>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}


