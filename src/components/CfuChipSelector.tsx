'use client';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

const COMMON_CFUS = [1, 2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 30];

export default function CfuChipSelector({ value, onChange }: Props) {
  const isCommon = COMMON_CFUS.includes(parseInt(value));

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-6 gap-2">
        {COMMON_CFUS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c.toString())}
            className={`grade-chip text-sm ${value === c.toString() ? 'selected' : ''}`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Altro:</span>
        <input
          type="number"
          value={!isCommon && value ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Es: 24"
          className="app-input flex-1 py-2 text-sm bg-white/50 dark:bg-black/40"
          min="1"
          max="60"
        />
      </div>
    </div>
  );
}
