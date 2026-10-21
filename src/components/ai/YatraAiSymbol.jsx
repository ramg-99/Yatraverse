import { Sparkles } from 'lucide-react';

export function YatraAiSymbol({
  size = 'md',
  className = '',
  withPulse = true,
  onClick,
  title = 'Yatra AI - Text Assistant',
}) {
  const sizeMap = {
    sm: 'h-9 w-9 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-16 w-16 text-base',
    xl: 'h-20 w-20 text-lg',
  };

  const dim = sizeMap[size] || sizeMap.md;

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`group relative flex items-center justify-center rounded-full transition-all duration-300 focus:outline-none ${dim} ${className}`}
    >
      {/* Outer ambient glow ring */}
      {withPulse && (
        <span className="absolute -inset-1 animate-ping rounded-full bg-gradient-to-r from-saffron via-aurora to-[#a78bfa] opacity-30 blur-sm duration-1000 group-hover:opacity-60" />
      )}
      <span className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-saffron via-aurora to-[#a78bfa] opacity-80 blur-[2px] transition duration-300 group-hover:opacity-100 group-hover:scale-105" />

      {/* Main circular symbol disc */}
      <span className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-b from-[#1E293B] via-[#0F172A] to-[#0B0F19] border border-white/20 shadow-xl overflow-hidden group-hover:border-saffron/60">
        {/* Subtle radial inner glow */}
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_35%_35%,rgba(255,176,46,0.25),transparent_70%)]" />

        {/* Circular Yatra AI SVG Insignia */}
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-[70%] w-[70%] transition-transform duration-300 group-hover:scale-110"
        >
          <defs>
            <linearGradient id="yatraAiGrad" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFB02E" />
              <stop offset="0.5" stopColor="#2DD4BF" />
              <stop offset="1" stopColor="#A78BFA" />
            </linearGradient>
            <radialGradient id="sparkleCenter" cx="32" cy="32" r="14" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" />
              <stop offset="0.6" stopColor="#FFB02E" />
              <stop offset="1" stopColor="#2DD4BF" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Compass / Orbit ring */}
          <circle cx="32" cy="32" r="26" stroke="url(#yatraAiGrad)" strokeWidth="1.8" strokeDasharray="3 3" opacity="0.6" />

          {/* Dynamic Travel Loop / Infinite Orbit */}
          <path
            d="M20 40C20 40 24 45 32 45C40 45 44 38 44 32C44 26 40 19 32 19C24 19 20 26 20 32C20 38 24 45 32 45"
            stroke="url(#yatraAiGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Stylized 'Y' & Celestial AI Spark at center */}
          <path
            d="M25 24L32 33L39 24"
            stroke="#FFFFFF"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M32 33V42"
            stroke="#FFB02E"
            strokeWidth="2.8"
            strokeLinecap="round"
          />

          {/* 4-point AI Diamond Sparkle top right */}
          <path
            d="M44 14C44 16.5 46 18 48 18C46 18 44 19.5 44 22C44 19.5 42 18 40 18C42 18 44 16.5 44 14Z"
            fill="#FFFFFF"
          />

          {/* Micro Sparkle left */}
          <path
            d="M17 28C17 29.5 18 30.5 19 30.5C18 30.5 17 31.5 17 33C17 31.5 16 30.5 15 30.5C16 30.5 17 29.5 17 28Z"
            fill="#2DD4BF"
          />
        </svg>

        {/* Small live sparkle indicator dot */}
        <span className="absolute bottom-1 right-1 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aurora opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-aurora"></span>
        </span>
      </span>
    </button>
  );
}
