// src/components/ui/NumericInput.tsx
import React from 'react';
type Props = { value: string; onChange: (v: string) => void; maxDecimals?: number; placeholder?: string; disabled?: boolean; className?: string; };
export default function NumericInput({ value, onChange, maxDecimals=9, placeholder, disabled, className }: Props) {
  const re = React.useMemo(() => new RegExp(`^\\d*(?:\\.\\d{0,${maxDecimals}})?$`), [maxDecimals]);
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value.replace(/,/g,'');
    if (next === '' || next === '.' || re.test(next)) onChange(next);
  }
  return (
    <input type="text" inputMode="decimal" value={value} onChange={handleChange}
      placeholder={placeholder ?? '0.0'} disabled={disabled}
      className={className ?? 'w-full rounded-md border border-zinc-700 bg-transparent px-3 py-2 outline-none'} />
  );
}
