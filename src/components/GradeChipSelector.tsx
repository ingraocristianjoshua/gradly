'use client';

interface Props {
  value: number | null;
  lode: boolean;
  onChange: (v: number) => void;
  onLodeChange: (v: boolean) => void;
}

export default function GradeChipSelector({ value, lode, onChange, onLodeChange }: Props) {
  const grades = Array.from({ length: 13 }, (_, i) => 18 + i);

  return (
    <div className="grid grid-cols-5 gap-2">
      {grades.map((g) => (
        <button
          key={g}
          type="button"
          onClick={() => {
            onChange(g);
            if (g !== 30) onLodeChange(false);
          }}
          className={`grade-chip${value === g && !lode ? ' selected' : ''}`}
        >
          {g}
        </button>
      ))}
      {/* Lode chip — spans 2 columns */}
      <button
        type="button"
        onClick={() => {
          onChange(30);
          onLodeChange(!(lode && value === 30));
        }}
        className={`grade-chip lode-chip col-span-2${lode && value === 30 ? ' selected' : ''}`}
        style={{ height: 42 }}
      >
        30 + Lode ✨
      </button>
    </div>
  );
}
