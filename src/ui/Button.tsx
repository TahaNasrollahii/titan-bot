import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { haptic } from '@/lib/telegram';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'white' | 'cream' | 'glass' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
  loading?: boolean;
  icon?: ReactNode;
}

export function Button({ variant = 'primary', size = 'md', block, loading, icon, children, className = '', onClick, disabled, ...rest }: Props) {
  const classes = ['btn', `btn--${variant}`, size !== 'md' && `btn--${size}`, block && 'btn--block', className]
    .filter(Boolean)
    .join(' ');
  return (
    <button
      type="button"
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      onClick={event => {
        haptic.tap(variant === 'primary' ? 'medium' : 'light');
        onClick?.(event);
      }}
      {...rest}
    >
      {loading ? <span className="spinner" aria-hidden /> : icon}
      {children}
    </button>
  );
}
