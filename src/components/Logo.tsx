interface LogoProps {
  variant?: 'default' | 'white';
  showWordmark?: boolean;
  markSize?: number;
  className?: string;
}

export function LogoMark({ size = 32, variant = 'default' }: { size?: number; variant?: 'default' | 'white' | 'outline' }) {
  const s = size;
  const pad = s * 0.18;
  const mid = s / 2;
  const top = s * 0.32;
  const bot = s * 0.82;
  const peakY = s * 0.54;

  if (variant === 'outline') {
    return (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none" xmlns="http://www.w3.org/2000/svg">
        <polyline
          points={`${pad},${bot} ${pad},${top} ${mid},${peakY} ${s - pad},${top} ${s - pad},${bot}`}
          stroke="#2F4F2F" strokeWidth={s * 0.075} strokeLinejoin="round" strokeLinecap="round"
        />
        <line x1={pad} y1={bot} x2={s - pad} y2={bot} stroke="#C87941" strokeWidth={s * 0.055} strokeLinecap="round" />
      </svg>
    );
  }

  const bgFill = variant === 'white' ? 'rgba(255,255,255,0.12)' : '#2F4F2F';
  const strokeColor = '#EDE9E0';

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width={s} height={s} fill={bgFill} />
      <polyline
        points={`${pad},${bot} ${pad},${top} ${mid},${peakY} ${s - pad},${top} ${s - pad},${bot}`}
        stroke={strokeColor} strokeWidth={s * 0.075} strokeLinejoin="round" strokeLinecap="round"
      />
      <line x1={pad} y1={bot} x2={s - pad} y2={bot} stroke="#C87941" strokeWidth={s * 0.055} strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ variant = 'default', showWordmark = true, markSize = 28, className = '' }: LogoProps) {
  const isLight = variant === 'white';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={markSize} variant={isLight ? 'white' : 'default'} />
      {showWordmark && (
        <span className={`text-[15px] tracking-tight leading-none ${isLight ? 'text-white' : ''}`}>
          <span className="font-bold">Mehman</span>
          <span className={`font-normal ${isLight ? 'text-white/55' : 'text-foreground/55'}`}>Manager</span>
        </span>
      )}
    </div>
  );
}
