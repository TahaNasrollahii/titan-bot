import { m } from 'motion/react';
import { useId } from 'react';

import { haptic } from '@/lib/telegram';

interface Props<T extends string> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

export function Segmented<T extends string>({ value, options, onChange }: Props<T>) {
  const id = useId();
  return (
    <div className="segmented" role="tablist">
      {options.map(option => (
        <button
          key={option.value}
          role="tab"
          aria-selected={option.value === value}
          onClick={() => {
            if (option.value === value) return;
            haptic.select();
            onChange(option.value);
          }}
        >
          {option.value === value && (
            <m.span layoutId={`seg-${id}`} className="segmented__pill" transition={{ type: 'spring', damping: 30, stiffness: 400 }} />
          )}
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}
