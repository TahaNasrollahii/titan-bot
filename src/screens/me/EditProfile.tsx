import { useMutation, useQuery } from '@tanstack/react-query';
import { AtSign, Camera, Check, Save } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';

import { ApiError, errorText } from '@/api/client';
import { catalogApi, meApi } from '@/api/endpoints';
import { updateUser, useMe } from '@/auth/session';
import { faDigits, fullDate } from '@/lib/format';
import { media } from '@/lib/media';
import { haptic } from '@/lib/telegram';
import { Button } from '@/ui/Button';
import { Icon3D, type Icon3DName } from '@/ui/Icon3D';
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

  const dirty =
    username !== (me.username ?? '') || fullName !== me.fullName || email !== me.email || favoriteGame !== me.favoriteGame;

  const save = useMutation({
    mutationFn: () =>
      meApi.update({ username: username.trim() || undefined, fullName: fullName.trim(), email: email.trim(), favoriteGame }),
    onSuccess: user => {
      updateUser(user);
      haptic.success();
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

  const shownName = username.trim() || fullName.trim() || faDigits(me.phone);
  const photo = media(me.avatar);

  return (
    <Screen title="ویرایش پروفایل" fallback="/me" noTabs>
      <div className="clay prof-hero">
        <label className="prof-hero__avatar" aria-label="تغییر تصویر پروفایل">
          <span className="clay clay--red prof-hero__picture">
            {photo ? <img src={photo} alt="" /> : shownName.trim()[0]?.toUpperCase()}
          </span>
          <span className="clay clay--cream prof-hero__camera">
            {avatar.isPending ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <Camera size={18} />}
          </span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            onChange={e => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (!file) return;
              if (file.size > MAX_AVATAR) return toast.error('حجم تصویر باید کمتر از ۲ مگابایت باشد.');
              avatar.mutate(file);
            }}
          />
        </label>
        <strong className="prof-hero__name">{shownName}</strong>
        {username.trim() && <span className="prof-hero__id ltr">@{username.trim()}</span>}
        <span className="prof-hero__since">عضو تایتان از {fullDate(me.dateJoined)}</span>
      </div>

      <FormCard icon="video-game" title="هویت گیمری">
        <label className="field">
          <span className="field__label">آیدی بازی (Game ID)</span>
          <span className="well prof-input">
            <AtSign size={18} />
            <input
              className="ltr"
              maxLength={32}
              placeholder="TitanPlayer"
              value={username}
              onChange={e => setUsername(e.target.value.replace(/[^A-Za-z0-9_.]/g, ''))}
            />
          </span>
          {errors.username ? (
            <span className="field__error">{errors.username}</span>
          ) : (
            <span className="text-xs muted">با این آیدی دوستانت پیدایت می‌کنند و به تیم دعوتت می‌کنند.</span>
          )}
        </label>
        <label className="field">
          <span className="field__label">نام و نام خانوادگی</span>
          <input className="input" maxLength={120} value={fullName} onChange={e => setFullName(e.target.value)} />
          {errors.fullName && <span className="field__error">{errors.fullName}</span>}
        </label>
      </FormCard>

      <FormCard icon="envelope-with-arrow" title="ارتباط">
        <label className="field">
          <span className="field__label">ایمیل (اختیاری)</span>
          <input className="input ltr" type="email" inputMode="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          {errors.email && <span className="field__error">{errors.email}</span>}
        </label>
        <div className="prof-phone">
          <Icon3D name="mobile-phone" size={30} />
          <span className="prof-phone__body">
            <span className="text-xs muted">شماره‌ی موبایل حساب</span>
            <strong className="ltr num">{faDigits(me.phone)}</strong>
          </span>
          <span className="badge badge--green">
            <Check size={12} /> تأییدشده با تلگرام
          </span>
        </div>
      </FormCard>

      <FormCard icon="glowing-star" title="بازی مورد علاقه">
        <div className="fav-grid" role="radiogroup" aria-label="بازی مورد علاقه">
          {games.data
            ?.filter(g => g.kind === 'game')
            .map(g => (
              <button
                key={g.slug}
                type="button"
                role="radio"
                aria-checked={favoriteGame === g.slug}
                className="clay fav"
                onClick={() => {
                  haptic.select();
                  setFavoriteGame(favoriteGame === g.slug ? null : g.slug);
                }}
              >
                {g.iconImage ? (
                  <Img src={g.iconImage} alt="" contain className="fav__icon" />
                ) : (
                  <span className="fav__icon fav__mono ltr">{g.titleEn.slice(0, 2).toUpperCase()}</span>
                )}
                <span>{g.title}</span>
              </button>
            ))}
        </div>
      </FormCard>

      <div className="action-bar">
        <Button size="lg" block disabled={!dirty} loading={save.isPending} onClick={() => save.mutate()} icon={<Save size={20} />}>
          {dirty ? 'ذخیره‌ی تغییرات' : 'تغییری نداده‌ای'}
        </Button>
      </div>
    </Screen>
  );
}

function FormCard({ icon, title, children }: { icon: Icon3DName; title: string; children: ReactNode }) {
  return (
    <section className="clay form-card">
      <h2 className="form-card__title">
        <Icon3D name={icon} size={26} />
        {title}
      </h2>
      {children}
    </section>
  );
}
