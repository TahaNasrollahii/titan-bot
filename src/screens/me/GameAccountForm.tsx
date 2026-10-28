import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, Save } from 'lucide-react';
import { useState, type CSSProperties } from 'react';

import { ApiError, errorText } from '@/api/client';
import { gameAccountsApi } from '@/api/endpoints';
import type { CredentialType, GameAccount } from '@/api/types';
import { Button } from '@/ui/Button';
import { Segmented } from '@/ui/Segmented';
import { toast } from '@/ui/Toast';

const ID_ONLY: CredentialType[] = ['supercell_id', 'player_id'];

const LABELS: Record<CredentialType, { user: string; placeholder: string }> = {
  email_password: { user: 'ایمیل اکانت', placeholder: 'you@example.com' },
  supercell_id: { user: 'ایمیل Supercell ID', placeholder: 'you@example.com' },
  player_id: { user: 'آیدی بازیکن (Player ID)', placeholder: '5123456789' },
};

/**
 * Add a game account, or edit ``account``. ``credentialType`` decides whether a password is needed; when
 * editing, a blank password keeps the one already saved.
 */
export function GameAccountForm({
  account,
  credentialType,
  game,
  onSaved,
}: {
  account?: GameAccount;
  credentialType?: CredentialType;
  game?: string | null;
  onSaved: (account: GameAccount) => void;
}) {
  const queryClient = useQueryClient();
  const editing = Boolean(account);
  const [kind, setKind] = useState<CredentialType>(
    credentialType ?? (account && !account.hasPassword ? 'player_id' : 'email_password'),
  );
  const [title, setTitle] = useState(account?.title ?? '');
  const [username, setUsername] = useState(account?.username ?? '');
  const [password, setPassword] = useState('');
  const [reveal, setReveal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const idOnly = ID_ONLY.includes(kind);
  const label = LABELS[kind];

  const save = useMutation({
    mutationFn: () => {
      const data = {
        title: title.trim() || 'اکانت من',
        username: username.trim(),
        password: idOnly ? undefined : password || undefined,
        credentialType: kind,
      };
      return account
        ? gameAccountsApi.update(account.id, data)
        : gameAccountsApi.create({ ...data, game: game ?? null });
    },
    onSuccess: saved => {
      void queryClient.invalidateQueries({ queryKey: ['game-accounts'] });
      toast.success(editing ? 'اکانت به‌روز شد' : 'اکانت ذخیره شد');
      onSaved(saved);
    },
    onError: error => {
      if (error instanceof ApiError && Object.keys(error.errors).length) {
        setErrors(
          Object.fromEntries(Object.entries(error.errors).map(([k, v]) => [k, Array.isArray(v) ? String(v[0]) : String(v)])),
        );
      } else toast.error(errorText(error));
    },
  });

  // A new email account needs a password; an edited one keeps its saved password when left blank.
  const needsPassword = !idOnly && !(editing && account?.hasPassword);
  const valid = username.trim().length >= 3 && (!needsPassword || password.length >= 4);

  return (
    <form
      className="stack"
      style={{ '--gap': '16px' } as CSSProperties}
      onSubmit={e => {
        e.preventDefault();
        if (valid) save.mutate();
      }}
    >
      {!credentialType && (
        <Segmented<CredentialType>
          value={kind}
          onChange={setKind}
          options={[
            { value: 'email_password', label: 'ایمیل و رمز' },
            { value: 'supercell_id', label: 'Supercell ID' },
            { value: 'player_id', label: 'Player ID' },
          ]}
        />
      )}
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
          inputMode={kind === 'player_id' ? 'text' : 'email'}
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
              style={{ paddingLeft: 52 }}
              type={reveal ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder={editing && account?.hasPassword ? '••••••••' : undefined}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setReveal(r => !r)}
              aria-label={reveal ? 'پنهان کردن رمز' : 'نمایش رمز'}
              style={{ position: 'absolute', left: 16, top: 16, color: 'var(--muted)' }}
            >
              {reveal ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && <span className="field__error">{errors.password}</span>}
          <span className="text-xs muted">
            {editing && account?.hasPassword
              ? 'برای تغییر رمز، رمز جدید را بنویس؛ خالی بماند، رمز قبلی حفظ می‌شود.'
              : 'رمز رمزنگاری‌شده نگهداری می‌شود و فقط برای تحویل سفارش استفاده می‌شود.'}
          </span>
        </label>
      )}
      <Button type="submit" size="lg" block disabled={!valid} loading={save.isPending} icon={<Save size={18} />}>
        {editing ? 'ذخیره‌ی تغییرات' : 'ذخیره‌ی اکانت'}
      </Button>
    </form>
  );
}
