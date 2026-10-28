import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, CreditCard, Plus, Shield, Trophy, Wallet } from 'lucide-react';
import { useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'react-router';

import { errorText } from '@/api/client';
import { tournamentsApi } from '@/api/endpoints';
import type { PaymentMethod, Tournament } from '@/api/types';
import { faDigits, toman } from '@/lib/format';
import { keys, useWallet } from '@/lib/queries';
import { haptic, openExternal } from '@/lib/telegram';
import { Avatar } from '@/ui/Avatar';
import { Button } from '@/ui/Button';
import { Empty } from '@/ui/Empty';
import { Sheet } from '@/ui/Sheet';
import { SkeletonList } from '@/ui/Skeleton';
import { toast } from '@/ui/Toast';

export function RegisterSheet({ t, open, onClose }: { t: Tournament; open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const isTeam = t.participantType === 'team';
  const wallet = useWallet();
  const teams = useQuery({
    queryKey: ['tournament', t.slug, 'eligible-teams'],
    queryFn: () => tournamentsApi.eligibleTeams(t.slug),
    enabled: open && isTeam,
  });

  const [teamId, setTeamId] = useState<number | null>(null);
  const [lineup, setLineup] = useState<number[]>([]);
  const [method, setMethod] = useState<PaymentMethod>('wallet');
  const team = teams.data?.find(x => x.id === teamId) ?? null;
  const walletEnough = (wallet.data?.balance ?? 0) >= t.entryFee;

  useEffect(() => {
    if (teams.data?.length && teamId === null) setTeamId(teams.data[0].id);
  }, [teams.data, teamId]);
  useEffect(() => {
    // Start from the first available members, captain included.
    if (!team) return;
    setLineup(team.members.filter(m => !m.registeredWith).slice(0, t.teamSize).map(m => m.user.id));
  }, [team, t.teamSize]);
  useEffect(() => {
    if (wallet.data && !walletEnough) setMethod('gateway');
  }, [wallet.data, walletEnough]);

  const register = useMutation({
    mutationFn: () =>
      tournamentsApi.register(t.slug, {
        team: isTeam ? teamId : null,
        members: isTeam ? lineup : [],
        paymentMethod: t.isFree ? null : method,
      }),
    onSuccess: ({ paymentUrl }) => {
      void queryClient.invalidateQueries({ queryKey: ['tournament', t.slug] });
      void queryClient.invalidateQueries({ queryKey: ['me', 'tournaments'] });
      void queryClient.invalidateQueries({ queryKey: keys.wallet });
      onClose();
      if (paymentUrl) openExternal(paymentUrl);
      else {
        haptic.success();
        toast.success('ثبت‌نام انجام شد؛ موفق باشی! 🏆');
      }
    },
    onError: error => toast.error(errorText(error)),
  });

  const lineupReady = !isTeam || lineup.length === t.teamSize;
  const payReady = t.isFree || method === 'gateway' || walletEnough;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={`ثبت‌نام در ${t.title}`}
      footer={
        <Button
          size="lg"
          block
          disabled={!lineupReady || !payReady || (isTeam && !team)}
          loading={register.isPending}
          onClick={() => register.mutate()}
          icon={<Trophy size={20} />}
        >
          {t.isFree ? 'تأیید ثبت‌نام' : `پرداخت ${toman(t.entryFee)} و ثبت‌نام`}
        </Button>
      }
    >
      <div className="stack" style={{ '--gap': '18px' } as CSSProperties}>
        {isTeam && (
          <section>
            <h3 className="pd__label">تیم تو</h3>
            {!teams.data ? (
              <SkeletonList count={1} h={64} />
            ) : teams.data.length === 0 ? (
              <Empty
                icon={<Shield size={30} />}
                title="تیمی برای ثبت‌نام نداری"
                text={`برای این تورنمنت باید کاپیتان یک تیم با حداقل ${faDigits(t.teamSize)} عضو باشی.`}
                action={
                  <Link to="/teams/new" className="btn btn--primary btn--sm" onClick={onClose}>
                    <Plus size={16} /> ساخت تیم
                  </Link>
                }
              />
            ) : (
              <div className="lineup" role="radiogroup">
                {teams.data.map(x => (
                  <button key={x.id} role="radio" aria-checked={teamId === x.id} className="pick" onClick={() => (haptic.select(), setTeamId(x.id))}>
                    <span className="pick__radio" />
                    <Avatar name={x.name} src={x.logo} seed={x.id} size={36} />
                    <span className="pick__body">
                      <strong>{x.name}</strong>
                      <span className="num">{faDigits(x.memberCount)} عضو</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {isTeam && team && (
          <section>
            <div className="section-head">
              <h3 className="pd__label" style={{ margin: 0 }}>
                ترکیب ({faDigits(lineup.length)}/{faDigits(t.teamSize)})
              </h3>
            </div>
            <div className="lineup">
              {team.members.map(member => {
                const selected = lineup.includes(member.user.id);
                const blocked = Boolean(member.registeredWith);
                const full = !selected && lineup.length >= t.teamSize;
                return (
                  <button
                    key={member.user.id}
                    role="checkbox"
                    aria-checked={selected}
                    className="pick"
                    disabled={blocked || full}
                    onClick={() => {
                      haptic.select();
                      setLineup(l => (selected ? l.filter(id => id !== member.user.id) : [...l, member.user.id]));
                    }}
                  >
                    <span className="pick__radio" style={{ borderRadius: 7 }}>
                      {selected && <Check size={14} />}
                    </span>
                    <Avatar name={member.user.displayName} src={member.user.avatar} seed={member.user.avatarSeed} size={34} presence={member.user.presence} />
                    <span className="pick__body">
                      <strong className="ltr" style={{ textAlign: 'right' }}>
                        {member.user.displayName}
                      </strong>
                      {blocked ? <small>با {member.registeredWith} ثبت‌نام شده</small> : <span>{member.role === 'captain' ? 'کاپیتان' : member.role === 'substitute' ? 'ذخیره' : 'بازیکن'}</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {!t.isFree && (
          <section>
            <h3 className="pd__label">پرداخت ورودی</h3>
            <div className="lineup" role="radiogroup">
              <button role="radio" aria-checked={method === 'wallet'} className="pick" disabled={!walletEnough} onClick={() => (haptic.select(), setMethod('wallet'))}>
                <span className="pick__radio" />
                <span className="pick__icon pick__icon--cream">
                  <Wallet size={20} />
                </span>
                <span className="pick__body">
                  <strong>کیف پول</strong>
                  <span className="num">موجودی: {wallet.data ? toman(wallet.data.balance) : '…'}</span>
                </span>
              </button>
              <button role="radio" aria-checked={method === 'gateway'} className="pick" onClick={() => (haptic.select(), setMethod('gateway'))}>
                <span className="pick__radio" />
                <span className="pick__icon">
                  <CreditCard size={20} />
                </span>
                <span className="pick__body">
                  <strong>درگاه بانکی</strong>
                  <span>در مرورگر باز می‌شود</span>
                </span>
              </button>
            </div>
          </section>
        )}
      </div>
    </Sheet>
  );
}
