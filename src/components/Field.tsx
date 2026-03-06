interface Props {
  label: string;
  value: number | string;
  onChange: (v: string) => void;
  type?: string;
  step?: string;
}

export default function Field({ label, value, onChange, type = 'number', step = 'any' }: Props) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-slate-700">{label}</span>
      <input
        className="rounded border border-slate-300 px-2 py-1"
        type={type}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
