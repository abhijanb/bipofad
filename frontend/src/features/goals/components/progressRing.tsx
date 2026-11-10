export function ProgressRing({
  value,
  caption,
  placeholder = false,
}: {
  value: number;
  caption: string;
  placeholder?: boolean;
}) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, value));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative grid h-48 w-48 place-items-center">
      <svg
        viewBox="0 0 128 128"
        className="h-full w-full -rotate-90"
        role="img"
        aria-label={`${caption}: ${placeholder ? "not available" : `${value}%`}`}
      >
        <defs>
          <linearGradient id="progressRing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f0d38a" />
            <stop offset="55%" stopColor="#e4bc62" />
            <stop offset="100%" stopColor="#cfd5de" />
          </linearGradient>
        </defs>
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="10"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="url(#progressRing)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={placeholder ? circumference : offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute text-center">
        <p className="font-display text-4xl font-semibold tracking-tight text-cream-50">
          {placeholder ? "—" : `${value}%`}
        </p>
        <p className="mt-1 text-[0.62rem] uppercase tracking-[0.18em] text-silver-400">
          {caption}
        </p>
      </div>
    </div>
  );
}
