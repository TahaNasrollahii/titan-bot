import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BellOff, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router';

import { notificationsApi } from '@/api/endpoints';
import type { Notification } from '@/api/types';
import { timeAgo } from '@/lib/format';
import { keys } from '@/lib/queries';
import { haptic } from '@/lib/telegram';
import { Empty, ErrorState } from '@/ui/Empty';
import { Screen } from '@/ui/Screen';
import { SkeletonList } from '@/ui/Skeleton';

import './me.css';

/** Same mapping as the bot's notification buttons (titan-back apps/telegram/services.notification_path). */
function routeFor(n: Notification): string | null {
  const d = n.data ?? {};
  if (d.order_number ?? d.orderNumber) return `/orders/${d.order_number ?? d.orderNumber}`;
  if (d.tournament_slug ?? d.tournamentSlug) return `/tournaments/${d.tournament_slug ?? d.tournamentSlug}`;
  if (d.invitation_id ?? d.invitationId) return '/invitations';
  if (d.team_id ?? d.teamId) return `/teams/${d.team_id ?? d.teamId}`;
  if (d.friendship_id ?? d.friendshipId) return '/friends';
  if (d.support_ticket ?? d.supportTicket) return '/support';
  if (n.kind === 'payment') return '/wallet';
  return null;
}

export default function Notifications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const list = useQuery({ queryKey: ['notifications', 'list'], queryFn: notificationsApi.list });

  const sync = () => {
    void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    void queryClient.invalidateQueries({ queryKey: keys.unread });
  };
  const readAll = useMutation({ mutationFn: notificationsApi.markAllRead, onSuccess: () => (haptic.success(), sync()) });
  const read = useMutation({ mutationFn: notificationsApi.markRead, onSuccess: sync });

  const unread = list.data?.results.some(n => !n.isRead);

  return (
    <Screen
      title="اعلان‌ها"
      actions={
        unread ? (
          <button className="icon-btn" aria-label="خواندن همه" onClick={() => readAll.mutate()}>
            <CheckCheck size={20} />
          </button>
        ) : undefined
      }
    >
      {list.isError ? (
        <ErrorState error={list.error} onRetry={() => list.refetch()} />
      ) : !list.data ? (
        <SkeletonList count={5} h={70} />
      ) : list.data.results.length === 0 ? (
        <Empty icon={<BellOff size={36} />} title="اعلانی نداری" text="خبرهای سفارش، تورنمنت و تیم این‌جا جمع می‌شوند." />
      ) : (
        <div className="list">
          {list.data.results.map(n => (
            <button
              key={n.id}
              className="notif"
              data-unread={!n.isRead}
              onClick={() => {
                haptic.tap();
                if (!n.isRead) read.mutate(n.id);
                const route = routeFor(n);
                if (route) navigate(route);
              }}
            >
              <span className="notif__dot" />
              <span style={{ flex: 1, minWidth: 0 }}>
                <strong>{n.title}</strong>
                {n.body && <p>{n.body}</p>}
                <time dateTime={n.createdAt}>{timeAgo(n.createdAt)}</time>
              </span>
            </button>
          ))}
        </div>
      )}
    </Screen>
  );
}
