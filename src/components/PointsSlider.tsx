'use client';

interface Props {
  label: string;
  desc: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  color: string;
}

export default function PointsSlider({ label, desc, value, min, max, onChange, color }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{label}</p>
          <p className="text-xs text-gray-400">{desc}</p>
        </div>
        <span
          className="text-white text-sm font-bold py-1 px-3 rounded-full min-w-[48px] text-center shadow"
          style={{ background: color }}
        >
          +{value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        style={{ accentColor: color }}
        aria-label={label}
      />
      <div className="flex justify-between text-xs text-gray-300 font-medium">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
