import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, UserPlus, X } from 'lucide-react';
import { useState, type CSSProperties } from 'react';

import { errorText } from '@/api/client';
import { meApi } from '@/api/endpoints';
import type { Presence } from '@/api/types';
import { faDigits } from '@/lib/format';
import { confirmDialog } from '@/lib/telegram';
import { Avatar } from '@/ui/Avatar';
import { Button } from '@/ui/Button';
import { Empty, ErrorState } from '@/ui/Empty';
import { Icon3D } from '@/ui/Icon3D';
import { Screen } from '@/ui/Screen';
import { Sheet } from '@/ui/Sheet';
import { SkeletonList } from '@/ui/Skeleton';
import { toast } from '@/ui/Toast';

import './me.css';

const PRESENCE: Record<Presence, string> = { online: 'آنلاین', in_game: 'در حال بازی', away: 'دور از دسترس', offline: 'آفلاین' };
const ORDER: Record<Presence, number> = { in_game: 0, online: 1, away: 2, offline: 3 };

export default function Friends() {
  const queryClient = useQueryClient();
  const friends = useQuery({ queryKey: ['me', 'friends'], queryFn: meApi.friends, refetchInterval: 60_000 });
  const requests = useQuery({ queryKey: ['me', 'friend-requests'], queryFn: meApi.friendRequests });
  const [adding, setAdding] = useState(false);
  const [username, setUsername] = useState('');

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['me', 'friends'] });
    void queryClient.invalidateQueries({ queryKey: ['me', 'friend-requests'] });
  };
  const fail = (error: unknown) => toast.error(errorText(error));

  const add = useMutation({
    mutationFn: () => meApi.addFriend(username.trim()),
    onSuccess: () => {
      toast.success('درخواست دوستی ارسال شد');
      setUsername('');
      setAdding(false);
    },
    onError: fail,
  });
  const answer = useMutation({
    mutationFn: ({ id, accept }: { id: number; accept: boolean }) => (accept ? meApi.acceptFriend(id) : meApi.declineFriend(id)),
    onSuccess: refresh,
    onError: fail,
  });
  const remove = useMutation({ mutationFn: (name: string) => meApi.removeFriend(name), onSuccess: refresh, onError: fail });

  const sorted = [...(friends.data ?? [])].sort((a, b) => ORDER[a.presence] - ORDER[b.presence]);
  const online = sorted.filter(f => f.presence !== 'offline').length;

  return (
    <Screen
      title="دوستان"
      fallback="/me"
      actions={
        <button className="icon-btn" aria-label="افزودن دوست" onClick={() => setAdding(true)}>
          <UserPlus size={20} />
        </button>
      }
    >
      {requests.data && requests.data.length > 0 && (
        <section style={{ marginBottom: 22 }}>
          <h2 className="pd__label">درخواست‌های دوستی</h2>
          <div className="list">
            {requests.data.map(r => (
              <div key={r.id} className="list-row">
                <Avatar name={r.fromUser.displayName} src={r.fromUser.avatar} seed={r.fromUser.avatarSeed} size={40} />
                <div className="list-row__body">
                  <div className="list-row__title ltr" style={{ textAlign: 'right' }}>
                    {r.fromUser.displayName}
                  </div>
                  <div className="list-row__sub num">سطح {faDigits(r.fromUser.level)}</div>
                </div>
                <div className="row" style={{ '--gap': '6px' } as CSSProperties}>
                  <button className="icon-btn" aria-label="قبول" onClick={() => answer.mutate({ id: r.id, accept: true })}>
                    <Check size={18} color="var(--green)" />
                  </button>
                  <button className="icon-btn" aria-label="رد" onClick={() => answer.mutate({ id: r.id, accept: false })}>
                    <X size={18} color="#ff8a80" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {friends.isError ? (
        <ErrorState error={friends.error} onRetry={() => friends.refetch()} />
      ) : !friends.data ? (
        <SkeletonList count={4} h={60} />
      ) : sorted.length === 0 ? (
        <Empty
          icon={<Icon3D name="busts-in-silhouette" size={52} />}
          title="هنوز دوستی اضافه نکرده‌ای"
          text="با آیدی بازی، دوستانت را پیدا کن و با هم تیم بشوید."
          action={
            <Button size="sm" onClick={() => setAdding(true)} icon={<UserPlus size={16} />}>
              افزودن دوست
            </Button>
          }
        />
      ) : (
        <section>
          <h2 className="pd__label num">
            {faDigits(sorted.length)} دوست · {faDigits(online)} آنلاین
          </h2>
          <div className="list">
            {sorted.map(f => (
              <div key={f.id} className="list-row">
                <Avatar name={f.displayName} src={f.avatar} seed={f.avatarSeed} size={42} presence={f.presence} />
                <div className="list-row__body">
                  <div className="list-row__title ltr" style={{ textAlign: 'right' }}>
                    {f.displayName}
                  </div>
                  <div className="list-row__sub">
                    {f.presence === 'in_game' && f.currentGame ? `در حال بازی ${f.currentGame.title}` : PRESENCE[f.presence]}
                  </div>
                </div>
                {f.username && (
                  <button
                    className="icon-btn"
                    aria-label={`حذف ${f.displayName}`}
                    onClick={async () => {
                      if (await confirmDialog(`${f.displayName} از دوستانت حذف شود؟`)) remove.mutate(f.username!);
                    }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <Sheet open={adding} onClose={() => setAdding(false)} title="افزودن دوست">
        <form
          className="stack"
          onSubmit={e => {
            e.preventDefault();
            if (username.trim()) add.mutate();
          }}
        >
          <input className="input ltr" placeholder="Game ID" value={username} onChange={e => setUsername(e.target.value)} aria-label="آیدی بازی دوست" />
          <Button type="submit" block disabled={!username.trim()} loading={add.isPending} icon={<UserPlus size={18} />}>
            ارسال درخواست
          </Button>
        </form>
      </Sheet>
    </Screen>
  );
}
