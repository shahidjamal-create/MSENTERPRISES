import { Link } from 'react-router-dom';

export function LogoMark({ className = 'h-10 w-10' }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg viewBox="0 0 44 44" className="h-full w-full" fill="none" aria-hidden="true">
        {/* Smartphone body outline */}
        <rect x="13" y="6" width="18" height="32" rx="4.5" stroke="#0066FF" strokeWidth="2.4" fill="none" />
        {/* Speaker notch */}
        <line x1="18" y1="9.5" x2="26" y2="9.5" stroke="#0066FF" strokeWidth="1.8" strokeLinecap="round" />
        {/* Home button / screen accent dot */}
        <circle cx="22" cy="33.5" r="1.3" fill="#0066FF" />
        {/* Modern Orbital Swoosh Curve */}
        <path
          d="M 5 28 C 3 20, 16 12, 36 15 C 41 15.8, 42 18, 39 21 C 33 27, 12 36, 6 29"
          stroke="#0066FF"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}

export default function Logo({ light = false, to = '/' }) {
  return (
    <Link to={to} className="group flex min-w-0 shrink-0 items-center gap-2.5 sm:gap-3" aria-label="MS ENTERPRISES home">
      <LogoMark className="h-9 w-9 sm:h-10 sm:w-10 transition-transform group-hover:scale-105 duration-200" />
      <div className={`h-8 w-[1.5px] mx-0.5 shrink-0 ${light ? 'bg-white/30' : 'bg-slate-300'}`} />
      <span className="leading-tight flex flex-col justify-center">
        <span className={`block text-[14px] font-black tracking-wider sm:text-[16px] uppercase ${light ? 'text-white' : 'text-[#0F172A]'}`}>
          MS ENTERPRISES
        </span>
        <span className={`text-[10px] sm:text-[11px] font-semibold tracking-wide ${light ? 'text-blue-200' : 'text-[#0066FF]'}`}>
          Mobile Service & Accessories
        </span>
      </span>
    </Link>
  );
}
