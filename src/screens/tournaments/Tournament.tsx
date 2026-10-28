import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Coins, Globe, Layers, LogOut, Radio, Share2, Swords, Trophy, Users } from 'lucide-react';
import { useEffect, useState, type CSSProperties } from 'react';
import { useParams } from 'react-router';

import { errorText } from '@/api/client';
import { tournamentsApi } from '@/api/endpoints';
import type { Region, Tournament as TournamentType } from '@/api/types';
import { countdown, dateTime, faDigits, money, num, toman } from '@/lib/format';
import { miniAppLink } from '@/lib/env';
import { confirmDialog, haptic, openExternal, shareLink } from '@/lib/telegram';
import { Avatar } from '@/ui/Avatar';
import { Button } from '@/ui/Button';
import { StatusBadge } from '@/ui/cards';
import { Empty, ErrorState } from '@/ui/Empty';
import { Img } from '@/ui/Img';
import { Screen } from '@/ui/Screen';
import { Segmented } from '@/ui/Segmented';
import { Skeleton, SkeletonList } from '@/ui/Skeleton';
import { toast } from '@/ui/Toast';

import { Bracket } from './Bracket';
import { RegisterSheet } from './RegisterSheet';
import './tournaments.css';

const REGION: Record<Region, string> = { me: 'خاورمیانه', eu: 'اروپا', ir: 'ایران', intl: 'بین‌المللی' };
type Tab = 'about' | 'bracket' | 'players';

export default function Tournament() {
  const { slug = '' } = useParams();
  const tournament = useQuery({
    queryKey: ['tournament', slug],
    queryFn: () => tournamentsApi.get(slug),
    // While an entry waits for its gateway payment, or matches are being played, keep it fresh.
    refetchInterval: q =>
      q.state.data?.myRegistration?.status === 'pending_payment' ? 4000 : q.state.data?.status === 'live' ? 20_000 : false,
  });

  if (tournament.isError)
    return (
      <Screen title="تورنمنت" fallback="/tournaments">
        <ErrorState error={tournament.error} onRetry={() => tournament.refetch()} />
      </Screen>
    );
  if (!tournament.data)
    return (
      <Screen title="تورنمنت" fallback="/tournaments" noTabs>
        <div className="stack">
          <Skeleton h={240} r={24} />
          <Skeleton h={80} r={20} />
          <SkeletonList count={2} />
        </div>
      </Screen>
    );
  return <TournamentView t={tournament.data} />;
}

function TournamentView({ t }: { t: TournamentType }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>(t.status === 'live' || t.status === 'completed' ? 'bracket' : 'about');
  const [registering, setRegistering] = useState(false);
  const mine = t.myRegistration;

  const withdraw = useMutation({
    mutationFn: () => tournamentsApi.withdraw(t.slug),
    onSuccess: () => {
      toast.success('انصراف ثبت شد');
      void queryClient.invalidateQueries({ queryKey: ['tournament', t.slug] });
      void queryClient.invalidateQueries({ queryKey: ['me', 'tournaments'] });
    },
    onError: error => toast.error(errorText(error)),
  });

  const canRegister = t.status === 'registration_open' && !t.isFull && !mine;
  const accent = { '--accent': t.game.accentColor } as CSSProperties;

  return (
    <Screen
      title={t.title}
      fallback="/tournaments"
      noTabs
      actions={
        <button
          className="icon-btn"
          aria-label="اشتراک‌گذاری"
          onClick={() => {
            haptic.tap();
            shareLink(miniAppLink(`tour-${t.slug}`), `🏆 ${t.title} — جایزه ${money(t.prizePool, t.prizeCurrency)}`);
          }}
        >
          <Share2 size={18} />
        </button>
      }
    >
      <header className="t-hero" style={accent}>
        <Img src={t.coverImage} alt={t.imageAlt || t.title} priority />
        <div className="t-hero__content">
          <div className="row" style={{ '--gap': '6px' } as CSSProperties}>
            <StatusBadge status={t.status} />
            {mine && <span className="badge badge--cream">{mine.status === 'pending_payment' ? 'در انتظار پرداخت' : 'ثبت‌نام شده'}</span>}
          </div>
          <span className="t-hero__game">
            <Img src={t.game.iconImage} alt="" contain style={{ width: 20, height: 20, background: 'none' }} />
            {t.game.title} · {t.season?.name}
          </span>
          <h1>{t.title}</h1>
        </div>
      </header>

      <div className="stack" style={{ '--gap': '14px' } as CSSProperties}>
        <div className="prize-banner">
          <span className="prize-banner__icon">
            <Trophy size={26} />
          </span>
          <div>
            <span className="text-xs muted">مجموع جوایز</span>
            <strong className="num">{money(t.prizePool, t.prizeCurrency)}</strong>
          </div>
          {t.status === 'live' && t.viewerCount > 0 && (
            <span className="badge badge--red" style={{ marginRight: 'auto' }}>
              <Radio size={12} /> {faDigits(t.viewerCount)} بیننده
            </span>
          )}
        </div>

        <Countdown t={t} />

        <div className="facts">
          <Fact icon={<Layers size={18} />} label="فرمت" value={t.formatLabel} />
          <Fact icon={<Users size={18} />} label="ظرفیت" value={`${faDigits(t.participantsCount)} از ${faDigits(t.maxParticipants)}`} />
          <Fact icon={<Coins size={18} />} label="ورودی" value={t.isFree ? 'رایگان' : toman(t.entryFee)} />
          <Fact icon={<Globe size={18} />} label="منطقه" value={REGION[t.region]} />
          <Fact icon={<CalendarDays size={18} />} label="شروع" value={dateTime(t.startsAt)} />
          <Fact icon={<Swords size={18} />} label="بازی‌ها" value={`Best of ${t.bestOf}`} />
        </div>

        <Segmented<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: 'about', label: 'درباره' },
            { value: 'bracket', label: 'براکت' },
            { value: 'players', label: t.participantType === 'team' ? 'تیم‌ها' : 'بازیکنان' },
          ]}
        />

        {tab === 'about' && <About t={t} />}
        {tab === 'bracket' && <Bracket slug={t.slug} />}
        {tab === 'players' && <Participants slug={t.slug} />}
      </div>

      <div className="action-bar">
        {t.streamUrl && (
          <Button variant="glass" onClick={() => openExternal(t.streamUrl)} icon={<Radio size={18} />}>
            پخش زنده
          </Button>
        )}
        {mine ? (
          mine.canManage && t.status !== 'live' && t.status !== 'completed' ? (
            <Button
              variant="danger"
              block
              loading={withdraw.isPending}
              icon={<LogOut size={18} />}
              onClick={async () => {
                if (await confirmDialog('از این تورنمنت انصراف می‌دهی؟')) withdraw.mutate();
              }}
            >
              انصراف از تورنمنت
            </Button>
          ) : (
            <div className="btn btn--glass btn--block" aria-live="polite">
              {mine.status === 'pending_payment' ? 'در انتظار تأیید پرداخت…' : 'در این تورنمنت ثبت‌نام کرده‌ای ✓'}
            </div>
          )
        ) : (
          <Button size="lg" block disabled={!canRegister} onClick={() => setRegistering(true)} icon={<Trophy size={20} />}>
            {t.status === 'registration_open'
              ? t.isFull
                ? 'ظرفیت تکمیل است'
                : t.isFree
                  ? 'ثبت‌نام رایگان'
                  : `ثبت‌نام · ${num(t.entryFee)} تومان`
              : t.status === 'upcoming'
                ? 'ثبت‌نام به‌زودی باز می‌شود'
                : 'ثبت‌نام بسته است'}
          </Button>
        )}
      </div>

      <RegisterSheet t={t} open={registering} onClose={() => setRegistering(false)} />
    </Screen>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="fact">
      {icon}
      <div>
        <span>{label}</span>
        <strong className="num">{value}</strong>
      </div>
    </div>
  );
}

function Countdown({ t }: { t: TournamentType }) {
  const target =
    t.status === 'registration_open' ? { at: t.registrationClosesAt, label: 'تا پایان ثبت‌نام' }
    : t.status === 'upcoming' ? { at: t.registrationOpensAt, label: 'تا شروع ثبت‌نام' }
    : t.status === 'registration_closed' ? { at: t.startsAt, label: 'تا شروع مسابقات' }
    : null;
  const [now, setNow] = useState(Date.now());
  const at = target?.at;
  useEffect(() => {
    if (!at) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [at]);
  const left = target ? countdown(target.at, now) : null;
  if (!target || !left) return null;
  return (
    <div>
      <div className="text-xs muted" style={{ marginBottom: 6 }}>
        {target.label}
      </div>
      <div className="countdown num" role="timer">
        <div>
          <strong>{faDigits(left.days)}</strong>
          <span>روز</span>
        </div>
        <div>
          <strong>{faDigits(left.hours)}</strong>
          <span>ساعت</span>
        </div>
        <div>
          <strong>{faDigits(left.minutes)}</strong>
          <span>دقیقه</span>
        </div>
        <div>
          <strong>{faDigits(left.seconds)}</strong>
          <span>ثانیه</span>
        </div>
      </div>
    </div>
  );
}

function About({ t }: { t: TournamentType }) {
  return (
    <div className="stack" style={{ '--gap': '18px' } as CSSProperties}>
      {t.description && <p style={{ color: 'var(--text-2)', fontSize: 'var(--fs-sm)', whiteSpace: 'pre-line' }}>{t.description}</p>}
      {t.prizes.length > 0 && (
        <section>
          <h2 className="pd__label">جوایز</h2>
          <div className="prizes">
            {t.prizes.map(p => (
              <div key={p.place} className="prize" data-place={p.place}>
                <span className="prize__place num">{faDigits(p.place)}</span>
                <span className="list-row__body">
                  <strong>{p.label}</strong>
                  {p.points > 0 && <span className="text-xs muted num"> · {faDigits(p.points)} امتیاز</span>}
                </span>
                <strong className="num" style={{ color: 'var(--gold)' }}>
                  {money(p.amount, t.prizeCurrency)}
                </strong>
              </div>
            ))}
          </div>
        </section>
      )}
      {t.rules.length > 0 && (
        <section>
          <h2 className="pd__label">قوانین</h2>
          <ol className="rules">
            {t.rules.map(rule => (
              <li key={rule}>{rule}</li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

function Participants({ slug }: { slug: string }) {
  const list = useQuery({ queryKey: ['tournament', slug, 'participants'], queryFn: () => tournamentsApi.participants(slug) });
  if (list.isError) return <ErrorState error={list.error} onRetry={() => list.refetch()} />;
  if (!list.data) return <SkeletonList count={3} h={56} />;
  if (!list.data.length) return <Empty icon={<Users size={32} />} title="هنوز کسی ثبت‌نام نکرده" text="اولین نفر باش!" />;
  return (
    <div className="participants">
      {list.data.map(p => (
        <div key={p.id} className="participant">
          <Avatar name={p.name} src={p.logo} seed={p.avatarSeed ?? p.id} size={34} />
          <strong>{p.name}</strong>
          {p.seed && <span className="badge num">#{faDigits(p.seed)}</span>}
        </div>
      ))}
    </div>
  );
}
