'use client';

export default function SvgIcon({ name, size = 18, color = 'currentColor', className = '', strokeWidth = 1.8, style }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className,
    style,
    'aria-hidden': true,
  };

  switch (name) {
    case 'check':
      return <svg {...common}><polyline points="20 6 9 17 4 12" /></svg>;
    case 'x':
      return <svg {...common}><line x1="4" y1="4" x2="20" y2="20" /><line x1="20" y1="4" x2="4" y2="20" /></svg>;
    case 'warning':
      return <svg {...common}><path d="M12 3l9 16H3l9-16z" /><path d="M12 9v4" /><circle cx="12" cy="16.5" r="0.8" fill={color} stroke="none" /></svg>;
    case 'info':
      return <svg {...common}><circle cx="12" cy="12" r="9" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>;
    case 'bell':
      return <svg {...common}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
    case 'bellOff':
      return <svg {...common}><path d="M13.73 21a2 2 0 0 1-3.46 0" /><path d="M18.63 13A15.79 15.79 0 0 1 18 8a6 6 0 0 0-12 0" /><line x1="1" y1="1" x2="23" y2="23" /></svg>;
    case 'clock':
      return <svg {...common}><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 16 14" /></svg>;
    case 'bolt':
      return <svg {...common} strokeLinejoin="round"><polygon points="13 2 3 14 11 14 9 22 21 10 13 10 13 2" /></svg>;
    case 'sparkle':
      return <svg {...common}><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" /></svg>;
    case 'leaf':
      return <svg {...common}><path d="M5 21c0-9 6-15 15-15-1 9-7 15-15 15z" /><path d="M5 21c3-3 6-6 9-9" /></svg>;
    case 'package':
      return <svg {...common}><path d="M12 2l8 4.5v11L12 22l-8-4.5v-11L12 2z" /><path d="M12 2v20" /><path d="M4 6.5l8 4.5 8-4.5" /></svg>;
    case 'pin':
      return <svg {...common}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
    case 'lock':
      return <svg {...common}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>;
    case 'user':
      return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 20c1.8-3.7 5.1-5.5 8-5.5s6.2 1.8 8 5.5" /></svg>;
    case 'chat':
      return <svg {...common}><path d="M5 18.5V5h14v11.5L13.5 15H5Z" /><path d="M8 9h8" /><path d="M8 12h5" /></svg>;
    case 'star':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none" style={style} className={className} aria-hidden="true">
          <polygon points="12 2 15.09 8.63 22 9.24 16.5 14.14 18.18 21 12 17.27 5.82 21 7.5 14.14 2 9.24 8.91 8.63 12 2" />
        </svg>
      );
    case 'search':
      return <svg {...common}><circle cx="11" cy="11" r="6.5" /><path d="M16 16L21 21" /></svg>;
    case 'home':
      return <svg {...common}><path d="M3 10.5L12 3l9 7.5" /><path d="M5 9.5V20h14V9.5" /><path d="M9 20v-6h6v6" /></svg>;
    case 'calendar':
      return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></svg>;
    case 'wrench':
      return <svg {...common}><path d="M21 7l-3.5 3.5a3 3 0 0 1-4.2 0l-1-1a3 3 0 0 1 0-4.2L15.8 2 21 7z" /><path d="M14 10L3 21" /></svg>;
    case 'crown':
      return <svg {...common}><path d="M3 18l2-10 5 5 4-8 4 8 5-5 2 10H3z" /><path d="M7 18h10" /></svg>;
    case 'build':
      return <svg {...common}><path d="M4 20V8l4-4h8l4 4v12" /><path d="M9 8h6" /><path d="M7 12h10" /></svg>;
    case 'money':
      return <svg {...common}><path d="M12 3v18" /><path d="M16.5 6.5c0-1.7-2.1-3-4.5-3S7.5 4.8 7.5 6.5 9.6 9.5 12 9.5s4.5 1.3 4.5 3-2.1 3-4.5 3-4.5-1.3-4.5-3" /></svg>;
    case 'accessibility':
      return <svg {...common}><circle cx="12" cy="4" r="2.5" /><path d="M12 7v5" /><path d="M9 10l3 3 3-3" /><path d="M8 17c1-2 2.2-3 4-3s3 1 4 3" /></svg>;
    case 'phone':
      return <svg {...common}><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 12.4 20a19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 3.08 4.18 2 2 0 0 1 5.06 2h3a2 2 0 0 1 2 1.72c.2 1.16.53 2.28.99 3.35.3.7.02 1.48-.64 1.82L8.2 10.4a16 16 0 0 0 6.4 6.4l1.51-1.21a1.77 1.77 0 0 1 1.82-.64c1.07.46 2.19.79 3.35.99A2 2 0 0 1 22 16.92z" /></svg>;
    case 'flag':
      return <svg {...common}><path d="M5 21V4h14l-2 5 2 5H5" /></svg>;
    case 'document':
      return <svg {...common}><path d="M7 3h8l5 5v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" /><path d="M15 3v5h5" /><path d="M9 13h6" /><path d="M9 17h6" /></svg>;
    case 'spark':
      return <svg {...common}><path d="M12 2v6" /><path d="M12 16v6" /><path d="M2 12h6" /><path d="M16 12h6" /><path d="M5 5l4 4" /><path d="M15 15l4 4" /><path d="M5 19l4-4" /><path d="M15 9l4-4" /></svg>;
    default:
      return null;
  }
}
