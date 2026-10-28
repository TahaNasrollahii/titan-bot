import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, MailOpen, X } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router';

import { errorText } from '@/api/client';
import { meApi } from '@/api/endpoints';
import { timeAgo } from '@/lib/format';
import { haptic } from '@/lib/telegram';
import { Avatar } from '@/ui/Avatar';
import { Button } from '@/ui/Button';
import { Empty, ErrorState } from '@/ui/Empty';
import { Screen } from '@/ui/Screen';
import { SkeletonList } from '@/ui/Skeleton';
import { toast } from '@/ui/Toast';

import './teams.css';

export default function Invitations() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const list = useQuery({ queryKey: ['me', 'team-invitations'], queryFn: meApi.teamInvitations });

  const respond = useMutation({
    mutationFn: async ({ id, accept }: { id: number; accept: boolean }) => {
      if (accept) return meApi.acceptTeamInvitation(id);
      await meApi.declineTeamInvitation(id);
      return null;
    },
    onSuccess: team => {
      void queryClient.invalidateQueries({ queryKey: ['me', 'team-invitations'] });
      void queryClient.invalidateQueries({ queryKey: ['me', 'teams'] });
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      if (team) {
        haptic.success();
        toast.success(`به ${team.name} خوش آمدی!`);
        navigate(`/teams/${team.id}`);
      }
    },
    onError: error => toast.error(errorText(error)),
  });

  const pending = list.data?.filter(i => i.status === 'pending') ?? [];

  return (
    <Screen title="دعوت‌نامه‌ها" fallback="/teams">
      {list.isError ? (
        <ErrorState error={list.error} onRetry={() => list.refetch()} />
      ) : !list.data ? (
        <SkeletonList count={2} h={120} />
      ) : pending.length === 0 ? (
        <Empty icon={<MailOpen size={36} />} title="دعوت‌نامه‌ای نداری" />
      ) : (
        <div className="stack">
          {pending.map(inv => (
            <article key={inv.id} className="card card--pad stack" style={{ '--gap': '12px' } as CSSProperties}>
              <div className="row">
                <Avatar name={inv.team.name} src={inv.team.logo} seed={inv.team.id} size={48} />
                <div className="list-row__body">
                  <div className="list-row__title ltr" style={{ textAlign: 'right' }}>
                    {inv.team.name}
                  </div>
                  <div className="list-row__sub">
                    از طرف <span className="ltr">{inv.invitedBy.displayName}</span> · {timeAgo(inv.createdAt)}
                  </div>
                </div>
              </div>
              <div className="row" style={{ '--gap': '8px' } as CSSProperties}>
                <Button
                  style={{ flex: 1 }}
                  icon={<Check size={18} />}
                  loading={respond.isPending && respond.variables?.id === inv.id && respond.variables.accept}
                  onClick={() => respond.mutate({ id: inv.id, accept: true })}
                >
                  قبول
                </Button>
                <Button
                  variant="glass"
                  style={{ flex: 1 }}
                  icon={<X size={18} />}
                  loading={respond.isPending && respond.variables?.id === inv.id && !respond.variables.accept}
                  onClick={() => respond.mutate({ id: inv.id, accept: false })}
                >
                  رد
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </Screen>
  );
}
