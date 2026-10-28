import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Crown, LogOut, RefreshCw, Send, Trash2, UserPlus, UserRoundMinus } from 'lucide-react';
import { useState, type CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router';

import { errorText } from '@/api/client';
import { teamsApi } from '@/api/endpoints';
import type { Team as TeamType, TeamMember } from '@/api/types';
import { useMe } from '@/auth/session';
import { faDigits, num } from '@/lib/format';
import { miniAppLink } from '@/lib/env';
import { confirmDialog, haptic, shareLink } from '@/lib/telegram';
import { Avatar } from '@/ui/Avatar';
import { Button } from '@/ui/Button';
import { ErrorState } from '@/ui/Empty';
import { Screen } from '@/ui/Screen';
import { Sheet } from '@/ui/Sheet';
import { Skeleton } from '@/ui/Skeleton';
import { toast } from '@/ui/Toast';

import { ROLE } from './Teams';
import './teams.css';

export default function Team() {
  const { id = '' } = useParams();
  const team = useQuery({ queryKey: ['team', id], queryFn: () => teamsApi.get(id) });
  if (team.isError)
    return (
      <Screen title="تیم" fallback="/teams">
        <ErrorState error={team.error} onRetry={() => team.refetch()} />
      </Screen>
    );
  if (!team.data)
    return (
      <Screen title="تیم" fallback="/teams">
        <div className="stack">
          <Skeleton h={200} r={28} />
          <Skeleton h={220} r={20} />
        </div>
      </Screen>
    );
  return <TeamView team={team.data} />;
}

function TeamView({ team }: { team: TeamType }) {
  const me = useMe();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const captain = team.myRole === 'captain';
  const [inviting, setInviting] = useState(false);
  const [username, setUsername] = useState('');
  const [selected, setSelected] = useState<TeamMember | null>(null);

  const refresh = (data?: TeamType) => {
    if (data) queryClient.setQueryData(['team', String(team.id)], data);
    else void queryClient.invalidateQueries({ queryKey: ['team', String(team.id)] });
    void queryClient.invalidateQueries({ queryKey: ['me', 'teams'] });
  };
  const fail = (error: unknown) => toast.error(errorText(error));

  const invite = useMutation({
    mutationFn: () => teamsApi.invite(team.id, username.trim()),
    onSuccess: () => {
      toast.success('دعوت‌نامه ارسال شد');
      setUsername('');
      setInviting(false);
    },
    onError: fail,
  });
  const regenerate = useMutation({ mutationFn: () => teamsApi.regenerateInvite(team.id), onSuccess: refresh, onError: fail });
  const promote = useMutation({
    mutationFn: (userId: number) => teamsApi.promote(team.id, userId),
    onSuccess: data => {
      refresh(data);
      setSelected(null);
      toast.success('کاپیتانی منتقل شد');
    },
    onError: fail,
  });
  const remove = useMutation({
    mutationFn: (userId: number) => teamsApi.removeMember(team.id, userId),
    onSuccess: (_, userId) => {
      setSelected(null);
      if (userId === me.id) {
        refresh();
        toast.success('از تیم خارج شدی');
        navigate('/teams', { replace: true });
      } else refresh();
    },
    onError: fail,
  });
  const dissolve = useMutation({
    mutationFn: () => teamsApi.dissolve(team.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['me', 'teams'] });
      toast.success('تیم منحل شد');
      navigate('/teams', { replace: true });
    },
    onError: fail,
  });

  const inviteLink = team.inviteCode ? miniAppLink(`join-${team.inviteCode}`) : null;

  return (
    <Screen title={team.name} fallback="/teams">
      <div className="team-hero">
        <Avatar name={team.name} src={team.logo} seed={team.id} size={88} ring="linear-gradient(135deg,#a78bfa,#f0645a)" />
        <h1>{team.name}</h1>
        <span className="badge num">
          {faDigits(team.memberCount)}/{faDigits(team.maxMembers)} عضو
        </span>
        <div className="stats" style={{ alignSelf: 'stretch', marginTop: 8 }}>
          <div className="stat">
            <span className="stat__value num">{faDigits(team.wins)}</span>
            <span className="stat__label">برد</span>
          </div>
          <div className="stat">
            <span className="stat__value num">{faDigits(team.winRate)}٪</span>
            <span className="stat__label">درصد برد</span>
          </div>
          <div className="stat">
            <span className="stat__value num">{num(team.points)}</span>
            <span className="stat__label">امتیاز</span>
          </div>
        </div>
      </div>

      {captain && inviteLink && (
        <section className="section">
          <h2 className="pd__label">دعوت هم‌تیمی</h2>
          <div className="invite-box">
            <code>{team.inviteCode}</code>
            <button className="icon-btn" aria-label="کد جدید" onClick={() => regenerate.mutate()} disabled={regenerate.isPending}>
              <RefreshCw size={18} className={regenerate.isPending ? 'spin-slow' : undefined} />
            </button>
          </div>
          <div className="row" style={{ '--gap': '10px', marginTop: 10 } as CSSProperties}>
            <Button
              style={{ flex: 1 }}
              icon={<Send size={18} />}
              onClick={() => shareLink(inviteLink, `بیا به تیم ${team.name} در تایتان بپیوند! 🎮`)}
            >
              ارسال لینک در تلگرام
            </Button>
            <Button variant="glass" icon={<UserPlus size={18} />} onClick={() => setInviting(true)}>
              با آیدی
            </Button>
          </div>
        </section>
      )}

      <section className="section">
        <h2 className="pd__label">اعضا</h2>
        <div className="list">
          {team.members.map(member => {
            const self = member.user.id === me.id;
            return (
              <button
                key={member.user.id}
                className="list-row"
                disabled={!captain && !self}
                onClick={() => {
                  haptic.tap();
                  setSelected(member);
                }}
              >
                <Avatar name={member.user.displayName} src={member.user.avatar} seed={member.user.avatarSeed} size={42} presence={member.user.presence} />
                <div className="list-row__body">
                  <div className="list-row__title ltr" style={{ textAlign: 'right' }}>
                    {member.user.displayName} {self && <span className="text-xs muted">(تو)</span>}
                  </div>
                  <div className="list-row__sub num">
                    سطح {faDigits(member.user.level)} · {num(member.user.points)} امتیاز
                  </div>
                </div>
                <span className={`badge ${member.role === 'captain' ? 'badge--cream' : ''}`}>
                  {member.role === 'captain' && <Crown size={12} />}
                  {ROLE[member.role]}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {captain && (
        <Button
          variant="danger"
          block
          className="section"
          icon={<Trash2 size={18} />}
          loading={dissolve.isPending}
          onClick={async () => {
            if (await confirmDialog(`تیم ${team.name} منحل شود؟ این کار برگشت‌پذیر نیست.`)) dissolve.mutate();
          }}
        >
          انحلال تیم
        </Button>
      )}

      <Sheet open={inviting} onClose={() => setInviting(false)} title="دعوت با آیدی بازی">
        <form
          className="stack"
          onSubmit={e => {
            e.preventDefault();
            if (username.trim()) invite.mutate();
          }}
        >
          <input className="input ltr" placeholder="Game ID" value={username} onChange={e => setUsername(e.target.value)} aria-label="آیدی بازیکن" />
          <Button type="submit" block disabled={!username.trim()} loading={invite.isPending}>
            ارسال دعوت
          </Button>
        </form>
      </Sheet>

      <Sheet open={selected !== null} onClose={() => setSelected(null)} title={selected?.user.displayName}>
        {selected && (
          <div className="stack">
            {selected.user.id === me.id ? (
              !captain && (
                <Button
                  variant="danger"
                  block
                  icon={<LogOut size={18} />}
                  loading={remove.isPending}
                  onClick={async () => {
                    if (await confirmDialog('از تیم خارج می‌شوی؟')) remove.mutate(me.id);
                  }}
                >
                  خروج از تیم
                </Button>
              )
            ) : (
              captain && (
                <>
                  <Button
                    variant="glass"
                    block
                    icon={<Crown size={18} />}
                    loading={promote.isPending}
                    onClick={async () => {
                      if (await confirmDialog(`کاپیتانی به ${selected.user.displayName} منتقل شود؟`)) promote.mutate(selected.user.id);
                    }}
                  >
                    انتقال کاپیتانی
                  </Button>
                  <Button
                    variant="danger"
                    block
                    icon={<UserRoundMinus size={18} />}
                    loading={remove.isPending}
                    onClick={async () => {
                      if (await confirmDialog(`${selected.user.displayName} از تیم حذف شود؟`)) remove.mutate(selected.user.id);
                    }}
                  >
                    حذف از تیم
                  </Button>
                </>
              )
            )}
            {captain && selected.user.id === me.id && (
              <p className="muted text-sm">کاپیتان برای خروج باید اول کاپیتانی را به عضو دیگری بدهد یا تیم را منحل کند.</p>
            )}
          </div>
        )}
      </Sheet>
    </Screen>
  );
}
