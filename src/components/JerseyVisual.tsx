import React from 'react';
import { KitDesign } from '../types';

interface JerseyVisualProps {
  design: KitDesign;
  customName?: string;
  customNumber?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function JerseyVisual({ design, customName, customNumber, size = 'md' }: JerseyVisualProps) {
  const {
    primaryColor,
    secondaryColor,
    accentColor,
    pattern,
    patternSecondaryColor,
    collarColor,
    sleeveColor,
    hasCrestText,
    sponsorName,
    sponsorColor,
  } = design;

  // Sizing mappings
  const dimensions = {
    sm: { width: 100, height: 100 },
    md: { width: 180, height: 180 },
    lg: { width: 280, height: 280 },
  };

  const { width, height } = dimensions[size];

  // Pattern renderings inside SVG
  const renderPattern = () => {
    switch (pattern) {
      case 'vertical-stripes':
        return (
          <g>
            <rect x="25" y="10" width="10" height="80" fill={patternSecondaryColor || secondaryColor} />
            <rect x="45" y="10" width="10" height="80" fill={patternSecondaryColor || secondaryColor} />
            <rect x="65" y="10" width="10" height="80" fill={patternSecondaryColor || secondaryColor} />
          </g>
        );
      case 'horizontal-stripes':
        // For SPFC chest horizontal stripes or Flamengo thick stripes
        if (hasCrestText === 'SPFC') {
          return (
            <g>
              {/* SPFC Chest Stripe: Red band then Black band with white space */}
              <rect x="15" y="32" width="70" height="6" fill={secondaryColor} />
              <rect x="15" y="38" width="70" height="6" fill={patternSecondaryColor || '#111111'} />
            </g>
          );
        }
        return (
          <g>
            <rect x="15" y="20" width="70" height="10" fill={patternSecondaryColor || secondaryColor} />
            <rect x="15" y="40" width="70" height="10" fill={patternSecondaryColor || secondaryColor} />
            <rect x="15" y="60" width="70" height="10" fill={patternSecondaryColor || secondaryColor} />
            <rect x="15" y="80" width="70" height="10" fill={patternSecondaryColor || secondaryColor} />
          </g>
        );
      case 'diagonal-stripes':
        return (
          <g>
            <path d="M 15 15 L 35 10 L 15 35 Z" fill={secondaryColor} opacity="0.3" />
            <path d="M 15 40 L 55 10 L 65 10 L 15 60 Z" fill={secondaryColor} opacity="0.3" />
            <path d="M 25 90 L 85 30 L 85 45 L 40 90 Z" fill={secondaryColor} opacity="0.3" />
          </g>
        );
      case 'retro-lines':
        return (
          <g>
            <line x1="25" y1="10" x2="25" y2="90" stroke={secondaryColor} strokeWidth="1" strokeDasharray="2,2" />
            <line x1="35" y1="10" x2="35" y2="90" stroke={secondaryColor} strokeWidth="1" strokeDasharray="2,2" />
            <line x1="45" y1="10" x2="45" y2="90" stroke={secondaryColor} strokeWidth="1" strokeDasharray="2,2" />
            <line x1="55" y1="10" x2="55" y2="90" stroke={secondaryColor} strokeWidth="1" strokeDasharray="2,2" />
            <line x1="65" y1="10" x2="65" y2="90" stroke={secondaryColor} strokeWidth="1" strokeDasharray="2,2" />
            <line x1="75" y1="10" x2="75" y2="90" stroke={secondaryColor} strokeWidth="1" strokeDasharray="2,2" />
          </g>
        );
      case 'splatter':
        return (
          <g>
            {/* Wavy/Flame smoke details */}
            <circle cx="35" cy="40" r="15" fill={secondaryColor} opacity="0.25" filter="blur(2px)" />
            <circle cx="65" cy="55" r="18" fill={secondaryColor} opacity="0.2" filter="blur(3px)" />
            <circle cx="45" cy="70" r="12" fill={secondaryColor} opacity="0.22" filter="blur(1px)" />
            <circle cx="25" cy="25" r="8" fill={secondaryColor} opacity="0.15" filter="blur(2px)" />
            <circle cx="75" cy="25" r="10" fill={secondaryColor} opacity="0.15" filter="blur(2px)" />
          </g>
        );
      case 'special-texture':
        return (
          <g>
            {/* Elegant watermark watermark grid */}
            <path d="M15,10 L85,80 M25,10 L85,70 M35,10 L85,60 M15,20 L85,90 M15,30 L75,90" stroke={secondaryColor} strokeWidth="0.5" opacity="0.15" />
            <path d="M85,10 L15,80 M75,10 L15,70 M65,10 L15,60 M85,20 L15,90 M85,30 L25,90" stroke={secondaryColor} strokeWidth="0.5" opacity="0.15" />
          </g>
        );
      case 'solid':
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center relative select-none">
      <svg
        viewBox="0 0 100 100"
        width={width}
        height={height}
        className="drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:scale-105"
        style={{ overflow: 'visible' }}
      >
        {/* SHIRT DEFINITION */}
        <defs>
          {/* Mask for shirt body so patterns stay inside */}
          <mask id="shirt-body-mask">
            <path
              d="M 15 10 
                 L 35 10 
                 Q 50 18 65 10
                 L 85 10 
                 L 81 35 
                 L 74 35 
                 L 76 90 
                 L 24 90 
                 L 26 35 
                 L 19 35 
                 Z"
              fill="#FFFFFF"
            />
          </mask>
          
          <radialGradient id="shirt-shadow" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.6" />
          </radialGradient>
        </defs>

        {/* LEFT SLEEVE */}
        <path
          d="M 15 10 L 2 24 L 10 32 L 20 25 Z"
          fill={sleeveColor || primaryColor}
          stroke="rgba(0,0,0,0.15)"
          strokeWidth="0.5"
        />
        {/* Left Sleeve Trim */}
        <path d="M 2 24 L 10 32" stroke={collarColor} strokeWidth="1.5" />

        {/* RIGHT SLEEVE */}
        <path
          d="M 85 10 L 98 24 L 90 32 L 80 25 Z"
          fill={sleeveColor || primaryColor}
          stroke="rgba(0,0,0,0.15)"
          strokeWidth="0.5"
        />
        {/* Right Sleeve Trim */}
        <path d="M 98 24 L 90 32" stroke={collarColor} strokeWidth="1.5" />

        {/* SHIRT BODY */}
        <path
          d="M 15 10 
             L 35 10 
             Q 50 18 65 10
             L 85 10 
             L 81 35 
             L 74 35 
             L 76 90 
             L 24 90 
             L 26 35 
             L 19 35 
             Z"
          fill={primaryColor}
          stroke="rgba(0,0,0,0.1)"
          strokeWidth="0.5"
        />

        {/* PATTERN CLIPPED TO BODY */}
        <g mask="url(#shirt-body-mask)">
          {renderPattern()}
          
          {/* Subtle realistic fabric fold shadows inside body */}
          <path d="M 30 18 Q 44 50 30 85" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" fill="none" filter="blur(1px)" />
          <path d="M 70 18 Q 56 50 70 85" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" fill="none" filter="blur(1px)" />
          <path d="M 45 15 Q 50 45 53 88" stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="none" />
          
          {/* Overall Darkening Overlay for realistic dimension */}
          <path
            d="M 15 10 L 35 10 Q 50 18 65 10 L 85 10 L 81 35 L 74 35 L 76 90 L 24 90 L 26 35 L 19 35 Z"
            fill="url(#shirt-shadow)"
            style={{ mixBlendMode: 'multiply' }}
          />

          {/* SPONSOR PRINT */}
          {sponsorName && (
            <g transform="translate(50, 52)">
              {/* Optional background rectangle for specific sponsors e.g. LUBRAX or CAIXA */}
              {sponsorName === 'LUBRAX' && (
                <g>
                  <rect x="-24" y="-8" width="48" height="15" fill="#111111" rx="1" stroke="#2ECC71" strokeWidth="0.7" />
                  {/* Yellow stripe above Lubrax */}
                  <rect x="-24" y="-7" width="48" height="2" fill="#F1C40F" />
                </g>
              )}
              {sponsorName === 'CAIXA' && (
                <rect x="-22" y="-7" width="44" height="13" fill="#005CA9" rx="1" />
              )}
              
              <text
                textAnchor="middle"
                dominantBaseline="middle"
                fill={sponsorName === 'CAIXA' ? '#FFFFFF' : (sponsorColor || '#FFFFFF')}
                fontSize={sponsorName.length > 8 ? '4.5' : '6.5'}
                fontWeight="bold"
                fontFamily="Impact, Arial Black, sans-serif"
                letterSpacing="0.4px"
              >
                {sponsorName.toUpperCase()}
              </text>

              {sponsorName === 'CAIXA' && (
                <rect x="13" y="-5" width="6" height="5" fill="#E67E22" /> // Caixa Orange icon
              )}
            </g>
          )}

          {/* BACK CUSTOMIZATION (Only displays if customName/customNumber are set AND it's represented as reversed or small text in visual) */}
          {customNumber && (
            <text
              x="50"
              y="74"
              textAnchor="middle"
              fill={accentColor || secondaryColor || '#FFFFFF'}
              fontSize="15"
              fontWeight="bold"
              fontFamily="Oswald, Impact, sans-serif"
            >
              {customNumber}
            </text>
          )}

          {customName && (
            <text
              x="50"
              y="84"
              textAnchor="middle"
              fill={accentColor || secondaryColor || '#FFFFFF'}
              fontSize="3.8"
              fontWeight="bold"
              fontFamily="Oswald, sans-serif"
              letterSpacing="0.5px"
            >
              {customName.toUpperCase()}
            </text>
          )}
        </g>

        {/* COLLAR (Always sits on top) */}
        <path
          d="M 34 10 Q 50 20 66 10 Q 50 14 34 10"
          fill={collarColor}
          stroke="rgba(0,0,0,0.2)"
          strokeWidth="0.5"
        />
        {/* Inner shadow/mesh for collar */}
        <path d="M 35 10 Q 50 18 65 10" stroke="rgba(0,0,0,0.3)" strokeWidth="1" fill="none" />

        {/* CREST / MONOGRAM BADGE ON TOP LEFT CHEST */}
        {hasCrestText && (
          <g transform="translate(32, 28)">
            {/* SPFC Red-White-Black Heart Shield */}
            {hasCrestText === 'SPFC' ? (
              <g>
                <path d="M -3 -3 L 3 -3 L 3 1 L 0 5 L -3 L -3 1 Z" fill="#FFFFFF" stroke="#2C3E50" strokeWidth="0.4" />
                <rect x="-2" y="-2" width="4" height="1" fill="#E74C3C" />
                <rect x="-2" y="-1" width="4" height="1" fill="#2C3E50" />
                <text x="0" y="2.5" textAnchor="middle" fontSize="2.2" fontWeight="900" fill="#111111" fontFamily="Oswald, sans-serif">SPFC</text>
              </g>
            ) : hasCrestText === 'CRF' ? (
              /* CRF monogram logo */
              <text x="0" y="2" textAnchor="middle" fontSize="4.5" fontWeight="bold" fill={accentColor || '#FFFFFF'} fontFamily="Impact, Oswald, sans-serif">
                CRF
              </text>
            ) : (
              /* Corinthians CP badge */
              <g>
                <circle cx="0" cy="1" r="3.2" fill="#111111" />
                <circle cx="0" cy="1" r="2.7" fill="#FFFFFF" stroke="#E74C3C" strokeWidth="0.3" />
                <text x="0" y="2.5" textAnchor="middle" fontSize="3" fontWeight="bold" fill="#111111" fontFamily="sans-serif">CP</text>
              </g>
            )}
          </g>
        )}

        {/* BRANDEE LOGO ON TOP RIGHT CHEST (Sleek West Logo arrow) */}
        <g transform="translate(68, 27)">
          <polygon points="0,-2 -2.5,2 0,0.5 2.5,2" fill={accentColor || secondaryColor || '#FFFFFF'} />
        </g>
      </svg>
      
      {/* Retro Kit Golden sparkles overlay */}
      {design.pattern === 'retro-lines' || (design.primaryColor === '#F5E6D3' || design.primaryColor === '#FFFFFF' && design.sponsorName === 'CAIXA') ? (
        <span className="absolute top-2 right-2 text-xs">✨</span>
      ) : null}
    </div>
  );
}
