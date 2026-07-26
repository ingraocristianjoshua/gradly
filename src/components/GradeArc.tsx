'use client';

export interface GradeArcProps {
  grade: number;       // 0–110 (0 = nothing entered yet)
  lode: boolean;
  partenza: number;
  thesisPoints: number;
  committeePoints: number;
}

function arcColor(grade: number): string {
  if (grade >= 108) return '#34c759';
  if (grade >= 100) return '#0071e3';
  if (grade >= 90)  return '#8a2387';
  return '#e94057';
}

export default function GradeArc({
  grade, lode, partenza, thesisPoints, committeePoints,
}: GradeArcProps) {
  const r    = 180;
  const cx   = 220;
  const cy   = 200;
  const circ = 2 * Math.PI * r;
  // 180° arc (semi-circle over the top)
  const arcLength = circ * (180 / 360);
  const filled    = arcLength * Math.min(grade / 110, 1);
  const color     = arcColor(grade);
  const hasGrade  = grade > 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        width="440"
        height="240"
        viewBox="0 0 440 240"
        className="drop-shadow-lg"
        aria-label={`Voto finale previsto: ${hasGrade ? grade : 'nessun dato'}`}
      >
        <defs>
          <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8a2387" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
          <filter id="arcGlow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track (gray) */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="currentColor"
          className="text-black/8 dark:text-white/10"
          strokeWidth="20"
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circ}`}
          transform={`rotate(180 ${cx} ${cy})`}
        />

        {/* Filled arc (animated) */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="url(#arcGrad)"
          strokeWidth="20"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circ}`}
          transform={`rotate(180 ${cx} ${cy})`}
          filter={hasGrade ? 'url(#arcGlow)' : undefined}
          style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        />

        {/* Grade number */}
        <text
          x={cx} y={cy - 20}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={hasGrade ? color : '#9ca3af'}
          fontSize="80"
          fontWeight="800"
          fontFamily="Inter, -apple-system, sans-serif"
          style={{ transition: 'fill 0.5s ease' }}
        >
          {hasGrade ? grade : '—'}
        </text>

        {/* Lode label */}
        {lode && hasGrade && (
          <text x={cx} y={cy + 40} textAnchor="middle" fill="#f59e0b"
            fontSize="14" fontWeight="700" letterSpacing="2">
            E LODE ✨
          </text>
        )}

        {/* "su 110" */}
        <text
          x={cx} y={cy - (hasGrade ? 85 : 85)}
          textAnchor="middle"
          fill="#9ca3af"
          fontSize="12"
          fontWeight="600"
          letterSpacing="2"
        >
          SU 110
        </text>

        {/* Scale labels */}
        <text x="40" y={cy + 30} textAnchor="middle" fill="#9ca3af" fontSize="13" fontWeight="600">18</text>
        <text x="400" y={cy + 30} textAnchor="middle" fill="#9ca3af" fontSize="13" fontWeight="600">110</text>
      </svg>

      {/* Breakdown pills */}
      {hasGrade && (
        <div className="flex gap-3">
          {([
            { label: 'Base',    value: partenza.toFixed(1), color: '#8a2387' },
            { label: 'Tesi',    value: `+${thesisPoints}`,  color: '#e94057' },
            { label: 'Comm.',   value: `+${committeePoints}`, color: '#0071e3' },
          ] as const).map((item) => (
            <div key={item.label}
              className="glass rounded-2xl px-4 py-2 flex flex-col items-center min-w-[72px]"
            >
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {item.label}
              </span>
              <span className="text-sm font-extrabold" style={{ color: item.color }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
