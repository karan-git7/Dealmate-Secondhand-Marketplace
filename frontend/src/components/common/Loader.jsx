import React from 'react';
import '../../styles/global.css';

/**
 * DealMate Premium Loader
 * 
 * Props:
 *   text    {string}  - Label to show (default: "Loading...")
 *   compact {boolean} - Smaller version for inline sections
 *   overlay {boolean} - Full-page fixed overlay
 */
const Loader = ({ text = 'Loading...', compact = false, overlay = false }) => {
  const inner = (
    <div className={`dm-loader${compact ? ' compact' : ''}`}>
      <div className="dm-loader-cart">
        <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="dmCartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#14b8a6' }} />
              <stop offset="100%" style={{ stopColor: '#0ea5e9' }} />
            </linearGradient>
          </defs>
          {/* Cart body */}
          <path
            d="M4 6h5l1 3h21l-3 11H10L8 7H4z"
            fill="url(#dmCartGrad)"
            stroke="none"
          />
          {/* Handle */}
          <path
            d="M2 4h3.5l1 3"
            fill="none"
            stroke="url(#dmCartGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Wheels */}
          <circle className="dm-wheel-1" cx="12" cy="30" r="3" fill="#0f172a" />
          <circle className="dm-wheel-2" cx="26" cy="30" r="3" fill="#0f172a" />
          {/* Wheel spokes */}
          <line x1="12" y1="27" x2="12" y2="33" stroke="#fff" strokeWidth="1" strokeLinecap="round" />
          <line x1="9" y1="30" x2="15" y2="30" stroke="#fff" strokeWidth="1" strokeLinecap="round" />
          <line x1="26" y1="27" x2="26" y2="33" stroke="#fff" strokeWidth="1" strokeLinecap="round" />
          <line x1="23" y1="30" x2="29" y2="30" stroke="#fff" strokeWidth="1" strokeLinecap="round" />
        </svg>
      </div>
      <div className="dm-loader-dots">
        <span /><span /><span />
      </div>
      {text && <div className="dm-loader-text">{text}</div>}
    </div>
  );

  if (overlay) {
    return <div className="dm-loader-overlay">{inner}</div>;
  }

  return inner;
};

export default Loader;
