import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, CheckCheck, X } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router';

import { errorText } from '@/api/client';
import { meApi, notificationsApi } from '@/api/endpoints';
import type { Notification } from '@/api/types';
import { timeAgo } from '@/lib/format';
import { keys } from '@/lib/queries';
import { haptic } from '@/lib/telegram';
import { Button } from '@/ui/Button';
import { Empty, ErrorState } from '@/ui/Empty';
import { Icon3D } from '@/ui/Icon3D';
import { Screen } from '@/ui/Screen';
import { SkeletonList } from '@/ui/Skeleton';
import { toast } from '@/ui/Toast';

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

function getInvitationId(n: Notification): number | null {
  const raw = n.data?.invitation_id ?? n.data?.invitationId;
  const num = Number(raw);
  return Number.isFinite(num) && num > 0 ? num : null;
}

function getFriendshipId(n: Notification): number | null {
  const raw = n.data?.friendship_id ?? n.data?.friendshipId;
  const num = Number(raw);
  return Number.isFinite(num) && num > 0 ? num : null;
}

export default function Notifications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const list = useQuery({ queryKey: ['notifications', 'list'], queryFn: notificationsApi.list });
  const teamInvites = useQuery({ queryKey: ['me', 'team-invitations'], queryFn: meApi.teamInvitations });
  const friendRequests = useQuery({ queryKey: ['me', 'friend-requests'], queryFn: meApi.friendRequests });

  const pendingInvitationIds = new Set(
    (teamInvites.data ?? []).filter(i => i.status === 'pending').map(i => Number(i.id))
  );
  const pendingFriendshipIds = new Set(
    (friendRequests.data ?? []).filter(r => r.status === 'pending').map(r => Number(r.id))
  );

  const isActionable = (n: Notification): boolean => {
    if (n.kind === 'team_invite') {
      const invId = getInvitationId(n);
      if (!invId) return false;
      if (teamInvites.data) return pendingInvitationIds.has(invId);
      return !n.isRead;
    }
    if (n.kind === 'friend_request') {
      const frId = getFriendshipId(n);
      if (!frId) return false;
      if (friendRequests.data) return pendingFriendshipIds.has(frId);
      return !n.isRead;
    }
    return false;
  };

  const sync = () => {
    void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    void queryClient.invalidateQueries({ queryKey: keys.unread });
  };
  const readAll = useMutation({ mutationFn: notificationsApi.markAllRead, onSuccess: () => (haptic.success(), sync()) });
  const read = useMutation({ mutationFn: notificationsApi.markRead, onSuccess: sync });

  const respondTeam = useMutation({
    mutationFn: async ({ invId, notifId, accept }: { invId: number; notifId: number; accept: boolean }) => {
      if (accept) await meApi.acceptTeamInvitation(invId);
      else await meApi.declineTeamInvitation(invId);
      await notificationsApi.markRead(notifId).catch(() => undefined);
      return accept;
    },
    onSuccess: accept => {
      haptic.success();
      toast.success(accept ? 'به تیم پیوستی!' : 'دعوت‌نامه رد شد');
      sync();
      void queryClient.invalidateQueries({ queryKey: ['me', 'team-invitations'] });
      void queryClient.invalidateQueries({ queryKey: ['me', 'teams'] });
    },
    onError: error => toast.error(errorText(error)),
  });

  const respondFriend = useMutation({
    mutationFn: async ({ frId, notifId, accept }: { frId: number; notifId: number; accept: boolean }) => {
      if (accept) await meApi.acceptFriend(frId);
      else await meApi.declineFriend(frId);
      await notificationsApi.markRead(notifId).catch(() => undefined);
      return accept;
    },
    onSuccess: accept => {
      haptic.success();
      toast.success(accept ? 'درخواست دوستی تایید شد' : 'درخواست دوستی رد شد');
      sync();
      void queryClient.invalidateQueries({ queryKey: ['me', 'friend-requests'] });
      void queryClient.invalidateQueries({ queryKey: ['me', 'friends'] });
    },
    onError: error => toast.error(errorText(error)),
  });

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
        <Empty icon={<Icon3D name="bell-with-slash" size={52} />} title="اعلانی نداری" text="خبرهای سفارش، تورنمنت و تیم این‌جا جمع می‌شوند." />
      ) : (
        <div className="list">
          {list.data.results.map(n => {
            const actionable = isActionable(n);
            const invId = n.kind === 'team_invite' ? getInvitationId(n) : null;
            const frId = n.kind === 'friend_request' ? getFriendshipId(n) : null;

            return (
              <div
                key={n.id}
                role="button"
                tabIndex={0}
                className="notif"
                data-unread={!n.isRead || actionable}
                onClick={() => {
                  haptic.tap();
                  if (!n.isRead && !actionable) read.mutate(n.id);
                  const route = routeFor(n);
                  if (route) navigate(route);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    haptic.tap();
                    if (!n.isRead && !actionable) read.mutate(n.id);
                    const route = routeFor(n);
                    if (route) navigate(route);
                  }
                }}
              >
                <span className="notif__dot" />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <strong>{n.title}</strong>
                  {n.body && <p>{n.body}</p>}
                  <time dateTime={n.createdAt}>{timeAgo(n.createdAt)}</time>
                  {actionable && (invId || frId) && (
                    <div
                      className="row"
                      style={{ '--gap': '8px', marginTop: 10 } as CSSProperties}
                      onClick={e => e.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        icon={<Check size={16} />}
                        loading={
                          invId
                            ? respondTeam.isPending && respondTeam.variables?.invId === invId && respondTeam.variables.accept
                            : respondFriend.isPending && respondFriend.variables?.frId === frId && respondFriend.variables.accept
                        }
                        onClick={e => {
                          e.stopPropagation();
                          if (invId) respondTeam.mutate({ invId, notifId: n.id, accept: true });
                          else if (frId) respondFriend.mutate({ frId, notifId: n.id, accept: true });
                        }}
                      >
                        قبول
                      </Button>
                      <Button
                        size="sm"
                        variant="glass"
                        icon={<X size={16} />}
                        loading={
                          invId
                            ? respondTeam.isPending && respondTeam.variables?.invId === invId && !respondTeam.variables.accept
                            : respondFriend.isPending && respondFriend.variables?.frId === frId && !respondFriend.variables.accept
                        }
                        onClick={e => {
                          e.stopPropagation();
                          if (invId) respondTeam.mutate({ invId, notifId: n.id, accept: false });
                          else if (frId) respondFriend.mutate({ frId, notifId: n.id, accept: false });
                        }}
                      >
                        رد
                      </Button>
                    </div>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Screen>
  );
}
