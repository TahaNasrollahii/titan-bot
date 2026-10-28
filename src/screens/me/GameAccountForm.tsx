import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, Save } from 'lucide-react';
import { useState } from 'react';

import { ApiError, errorText } from '@/api/client';
import { gameAccountsApi } from '@/api/endpoints';
import type { CredentialType, GameAccount } from '@/api/types';
import { Button } from '@/ui/Button';
import { toast } from '@/ui/Toast';

const ID_ONLY: CredentialType[] = ['supercell_id', 'player_id'];

const LABELS: Record<CredentialType, { user: string; placeholder: string }> = {
  email_password: { user: 'ایمیل اکانت', placeholder: 'you@example.com' },
  supercell_id: { user: 'ایمیل Supercell ID', placeholder: 'you@example.com' },
  player_id: { user: 'آیدی بازیکن (Player ID)', placeholder: '5123456789' },
};

/** Add a game account. ``credentialType`` decides whether a password is needed. */
export function GameAccountForm({
  credentialType = 'email_password',
  game,
  onSaved,
}: {
  credentialType?: CredentialType;
  game?: string | null;
  onSaved: (account: GameAccount) => void;
}) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [reveal, setReveal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const idOnly = ID_ONLY.includes(credentialType);
  const label = LABELS[credentialType];

  const save = useMutation({
    mutationFn: () =>
      gameAccountsApi.create({
        title: title.trim() || 'اکانت من',
        username: username.trim(),
        password: idOnly ? undefined : password,
        game: game ?? null,
        credentialType,
      }),
    onSuccess: account => {
      void queryClient.invalidateQueries({ queryKey: ['game-accounts'] });
      toast.success('اکانت ذخیره شد');
      onSaved(account);
    },
    onError: error => {
      if (error instanceof ApiError && Object.keys(error.errors).length) {
        setErrors(
          Object.fromEntries(Object.entries(error.errors).map(([k, v]) => [k, Array.isArray(v) ? String(v[0]) : String(v)])),
        );
      } else toast.error(errorText(error));
    },
  });

  const valid = username.trim().length >= 3 && (idOnly || password.length >= 4);

  return (
    <form
      className="stack"
      style={{ '--gap': '14px' } as React.CSSProperties}
      onSubmit={e => {
        e.preventDefault();
        if (valid) save.mutate();
      }}
    >
      <label className="field">
        <span className="field__label">نام دلخواه</span>
        <input className="input" placeholder="مثلاً اکانت اصلی" value={title} maxLength={60} onChange={e => setTitle(e.target.value)} />
      </label>
      <label className="field">
        <span className="field__label">{label.user}</span>
        <input
          className="input ltr"
          placeholder={label.placeholder}
          autoComplete="off"
          inputMode={credentialType === 'player_id' ? 'text' : 'email'}
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        {errors.username && <span className="field__error">{errors.username}</span>}
      </label>
      {!idOnly && (
        <label className="field">
          <span className="field__label">رمز عبور اکانت</span>
          <div style={{ position: 'relative' }}>
            <input
              className="input ltr"
              type={reveal ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setReveal(r => !r)}
              aria-label={reveal ? 'پنهان کردن رمز' : 'نمایش رمز'}
              style={{ position: 'absolute', left: 14, top: 15, color: 'var(--muted)' }}
            >
              {reveal ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && <span className="field__error">{errors.password}</span>}
          <span className="text-xs muted">رمز به‌صورت رمزنگاری‌شده نگهداری می‌شود و فقط برای تحویل سفارش استفاده می‌شود.</span>
        </label>
      )}
      <Button type="submit" block disabled={!valid} loading={save.isPending} icon={<Save size={18} />}>
        ذخیره‌ی اکانت
      </Button>
    </form>
  );
}
