import React from 'react';

interface PixoraLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

export const PixoraLogo: React.FC<PixoraLogoProps> = ({
  size = 'md',
  showTagline = false,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Original Pixora Geometric Brand Mark */}
      <div className={`relative ${iconSizes[size]} flex-shrink-0 drop-shadow-[0_0_12px_rgba(139,92,246,0.35)]`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer glowing geometric diamond-pixel form */}
          <defs>
            <linearGradient id="pixoraGrad1" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8b5cf6" />
              <stop offset="0.5" stopColor="#a855f7" />
              <stop offset="1" stopColor="#ec4899" />
            </linearGradient>
            <linearGradient id="pixoraGrad2" x1="0" y1="100" x2="100" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3b82f6" />
              <stop offset="0.6" stopColor="#06b6d4" />
              <stop offset="1" stopColor="#34d399" />
            </linearGradient>
          </defs>

          {/* Facet 1: Stylized 'P' top loop */}
          <path
            d="M50 10 L85 30 L85 60 L50 40 Z"
            fill="url(#pixoraGrad1)"
          />
          {/* Facet 2: Vertical stem */}
          <path
            d="M20 28 L50 45 L50 85 L20 68 Z"
            fill="url(#pixoraGrad2)"
          />
          {/* Facet 3: Center dynamic pixel prism */}
          <path
            d="M50 45 L80 62 L50 80 L20 63 Z"
            fill="#7c3aed"
            opacity="0.9"
          />
          {/* Center Sparkle Pixel */}
          <circle cx="50" cy="50" r="7" fill="#ffffff" />
          <polygon
            points="50,38 53,47 62,50 53,53 50,62 47,53 38,50 47,47"
            fill="#ffffff"
          />
        </svg>
      </div>

      {/* Brand Name & Tagline */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center">
          <span className={`font-extrabold tracking-tight text-white ${textSizes[size]} font-['Outfit']`}>
            Pix<span className="text-violet-400">ora</span>
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 ml-1 mb-2 animate-pulse" />
        </div>
        {showTagline && (
          <span className="text-[11px] font-medium tracking-wider uppercase text-slate-400 -mt-1 font-['Space_Grotesk']">
            Create Anything.
          </span>
        )}
      </div>
    </div>
  );
};
