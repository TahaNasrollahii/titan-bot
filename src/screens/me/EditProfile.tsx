import { useMutation, useQuery } from '@tanstack/react-query';
import { Camera, Save } from 'lucide-react';
import { useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router';

import { ApiError, errorText } from '@/api/client';
import { catalogApi, meApi } from '@/api/endpoints';
import { updateUser, useMe } from '@/auth/session';
import { faDigits } from '@/lib/format';
import { haptic } from '@/lib/telegram';
import { Avatar } from '@/ui/Avatar';
import { Button } from '@/ui/Button';
import { Img } from '@/ui/Img';
import { Screen } from '@/ui/Screen';
import { toast } from '@/ui/Toast';

import './me.css';

const MAX_AVATAR = 2 * 1024 * 1024;

export default function EditProfile() {
  const me = useMe();
  const navigate = useNavigate();
  const games = useQuery({ queryKey: ['games'], queryFn: catalogApi.games, staleTime: 5 * 60_000 });
  const [username, setUsername] = useState(me.username ?? '');
  const [fullName, setFullName] = useState(me.fullName);
  const [email, setEmail] = useState(me.email);
  const [favoriteGame, setFavoriteGame] = useState<string | null>(me.favoriteGame);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const save = useMutation({
    mutationFn: () =>
      meApi.update({ username: username.trim() || undefined, fullName: fullName.trim(), email: email.trim(), favoriteGame }),
    onSuccess: user => {
      updateUser(user);
      toast.success('پروفایل ذخیره شد');
      navigate(-1);
    },
    onError: error => {
      if (error instanceof ApiError && Object.keys(error.errors).length) {
        setErrors(Object.fromEntries(Object.entries(error.errors).map(([k, v]) => [k, Array.isArray(v) ? String(v[0]) : String(v)])));
        haptic.error();
      } else toast.error(errorText(error));
    },
  });

  const avatar = useMutation({
    mutationFn: (file: File) => meApi.uploadAvatar(file),
    onSuccess: user => {
      updateUser(user);
      toast.success('تصویر پروفایل عوض شد');
    },
    onError: error => toast.error(errorText(error)),
  });

  return (
    <Screen title="ویرایش پروفایل" fallback="/me" noTabs>
      <div className="stack" style={{ '--gap': '18px' } as CSSProperties}>
        <label className="avatar-edit" aria-label="تغییر تصویر پروفایل">
          <Avatar name={me.username || me.fullName || '?'} src={me.avatar} seed={me.avatarSeed} size={104} />
          <span className="avatar-edit__badge">{avatar.isPending ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Camera size={14} />}</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            onChange={e => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.size > MAX_AVATAR) return toast.error('حجم تصویر باید کمتر از ۲ مگابایت باشد.');
              avatar.mutate(file);
            }}
          />
        </label>

        <label className="field">
          <span className="field__label">آیدی بازی (Game ID)</span>
          <input className="input ltr" maxLength={32} value={username} onChange={e => setUsername(e.target.value.replace(/[^A-Za-z0-9_.]/g, ''))} />
          {errors.username ? <span className="field__error">{errors.username}</span> : <span className="text-xs muted">با این آیدی دوستانت پیدایت می‌کنند و به تیم دعوتت می‌کنند.</span>}
        </label>
        <label className="field">
          <span className="field__label">نام و نام خانوادگی</span>
          <input className="input" maxLength={120} value={fullName} onChange={e => setFullName(e.target.value)} />
          {errors.fullName && <span className="field__error">{errors.fullName}</span>}
        </label>
        <label className="field">
          <span className="field__label">ایمیل (اختیاری)</span>
          <input className="input ltr" type="email" inputMode="email" value={email} onChange={e => setEmail(e.target.value)} />
          {errors.email && <span className="field__error">{errors.email}</span>}
        </label>
        <div className="field">
          <span className="field__label">بازی مورد علاقه</span>
          <div className="rail chips-rail" style={{ marginBottom: 0 }}>
            {games.data
              ?.filter(g => g.kind === 'game')
              .map(g => (
                <button
                  key={g.slug}
                  type="button"
                  className="chip"
                  aria-pressed={favoriteGame === g.slug}
                  onClick={() => {
                    haptic.select();
                    setFavoriteGame(favoriteGame === g.slug ? null : g.slug);
                  }}
                >
                  <Img src={g.iconImage} alt="" contain style={{ width: 20, height: 20, borderRadius: 6, background: 'none' }} />
                  {g.title}
                </button>
              ))}
          </div>
        </div>
        <div className="field">
          <span className="field__label">شماره موبایل</span>
          <div className="input ltr num" style={{ display: 'flex', alignItems: 'center', color: 'var(--muted)' }}>
            {faDigits(me.phone)}
          </div>
          <span className="text-xs muted">شماره‌ی حساب از طریق تلگرام تأیید شده است.</span>
        </div>
      </div>

      <div className="action-bar">
        <Button size="lg" block loading={save.isPending} onClick={() => save.mutate()} icon={<Save size={20} />}>
          ذخیره
        </Button>
      </div>
    </Screen>
  );
}
