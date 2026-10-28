import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { errorText } from '@/api/client';
import { gameAccountsApi } from '@/api/endpoints';
import type { GameAccount } from '@/api/types';
import { date } from '@/lib/format';
import { confirmDialog, haptic } from '@/lib/telegram';
import { Button } from '@/ui/Button';
import { Empty, ErrorState } from '@/ui/Empty';
import { Icon3D } from '@/ui/Icon3D';
import { Screen } from '@/ui/Screen';
import { Sheet } from '@/ui/Sheet';
import { SkeletonList } from '@/ui/Skeleton';
import { toast } from '@/ui/Toast';

import { GameAccountForm } from './GameAccountForm';
import './me.css';

/** ``null`` = closed, ``'new'`` = adding, an account = editing it. */
type Editing = null | 'new' | GameAccount;

export default function GameAccounts() {
  const queryClient = useQueryClient();
  const accounts = useQuery({ queryKey: ['game-accounts'], queryFn: gameAccountsApi.list });
  const [editing, setEditing] = useState<Editing>(null);
  const close = () => setEditing(null);

  const remove = useMutation({
    mutationFn: (id: number) => gameAccountsApi.remove(id),
    onSuccess: () => {
      haptic.success();
      toast.success('اکانت حذف شد');
      close();
      void queryClient.invalidateQueries({ queryKey: ['game-accounts'] });
    },
    onError: error => toast.error(errorText(error)),
  });

  const current = editing && editing !== 'new' ? editing : null;

  return (
    <Screen title="اکانت‌های بازی" fallback="/me" noTabs>
      <p className="muted text-sm" style={{ marginBottom: 16 }}>
        سفارش‌ها مستقیم روی این اکانت‌ها شارژ می‌شوند. رمزها رمزنگاری‌شده نگهداری می‌شوند.
      </p>

      {accounts.isError ? (
        <ErrorState error={accounts.error} onRetry={() => accounts.refetch()} />
      ) : !accounts.data ? (
        <SkeletonList count={3} h={78} />
      ) : accounts.data.length === 0 ? (
        <Empty
          icon={<Icon3D name="video-game" size={52} />}
          title="اکانتی ذخیره نکرده‌ای"
          text="اکانت بازی را یک بار ذخیره کن تا سفارش‌ها مستقیم روی آن شارژ شوند."
        />
      ) : (
        <div className="stack">
          {accounts.data.map(a => (
            <button key={a.id} className="clay acct card--press" onClick={() => (haptic.tap(), setEditing(a))}>
              <span className="clay acct__icon">
                <Icon3D name={a.hasPassword ? 'locked' : 'video-game'} size={30} />
              </span>
              <span className="acct__body">
                <strong>{a.title}</strong>
                <span className="ltr">{a.username}</span>
                <small>{a.hasPassword ? 'ایمیل و رمز ذخیره شده' : 'فقط آیدی'}، از {date(a.createdAt)}</small>
              </span>
              <span className="acct__edit">
                ویرایش <ChevronLeft size={16} />
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="action-bar">
        <Button size="lg" block onClick={() => setEditing('new')} icon={<Plus size={20} />}>
          افزودن اکانت بازی
        </Button>
      </div>

      <Sheet open={editing !== null} onClose={close} title={current ? `ویرایش ${current.title}` : 'افزودن اکانت بازی'}>
        {editing !== null && <GameAccountForm key={current?.id ?? 'new'} account={current ?? undefined} onSaved={close} />}
        {current && (
          <Button
            variant="danger"
            block
            className="acct__delete"
            loading={remove.isPending}
            icon={<Trash2 size={18} />}
            onClick={async () => {
              if (await confirmDialog(`اکانت «${current.title}» حذف شود؟`)) remove.mutate(current.id);
            }}
          >
            حذف این اکانت
          </Button>
        )}
      </Sheet>
    </Screen>
  );
}
