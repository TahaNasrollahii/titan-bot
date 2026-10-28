import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Gamepad2, KeyRound, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { errorText } from '@/api/client';
import { gameAccountsApi } from '@/api/endpoints';
import type { CredentialType } from '@/api/types';
import { date } from '@/lib/format';
import { confirmDialog, haptic } from '@/lib/telegram';
import { Button } from '@/ui/Button';
import { Empty, ErrorState } from '@/ui/Empty';
import { Screen } from '@/ui/Screen';
import { Segmented } from '@/ui/Segmented';
import { Sheet } from '@/ui/Sheet';
import { SkeletonList } from '@/ui/Skeleton';
import { toast } from '@/ui/Toast';

import { GameAccountForm } from './GameAccountForm';
import './me.css';

export default function GameAccounts() {
  const queryClient = useQueryClient();
  const accounts = useQuery({ queryKey: ['game-accounts'], queryFn: gameAccountsApi.list });
  const [adding, setAdding] = useState(false);
  const [kind, setKind] = useState<CredentialType>('email_password');

  const remove = useMutation({
    mutationFn: (id: number) => gameAccountsApi.remove(id),
    onSuccess: () => {
      haptic.success();
      void queryClient.invalidateQueries({ queryKey: ['game-accounts'] });
    },
    onError: error => toast.error(errorText(error)),
  });

  return (
    <Screen
      title="اکانت‌های بازی"
      fallback="/me"
      actions={
        <button className="icon-btn" aria-label="افزودن اکانت" onClick={() => setAdding(true)}>
          <Plus size={20} />
        </button>
      }
    >
      {accounts.isError ? (
        <ErrorState error={accounts.error} onRetry={() => accounts.refetch()} />
      ) : !accounts.data ? (
        <SkeletonList count={3} h={64} />
      ) : accounts.data.length === 0 ? (
        <Empty
          icon={<Gamepad2 size={36} />}
          title="اکانتی ذخیره نکرده‌ای"
          text="اکانت بازی را یک بار ذخیره کن تا سفارش‌ها مستقیم روی آن شارژ شوند."
          action={
            <Button size="sm" onClick={() => setAdding(true)} icon={<Plus size={16} />}>
              افزودن اکانت
            </Button>
          }
        />
      ) : (
        <div className="list">
          {accounts.data.map(a => (
            <div key={a.id} className="list-row">
              <span className="list-row__icon">{a.hasPassword ? <KeyRound size={18} /> : <Gamepad2 size={18} />}</span>
              <div className="list-row__body">
                <div className="list-row__title">{a.title}</div>
                <div className="list-row__sub">
                  <span className="ltr">{a.username}</span> · {date(a.createdAt)}
                </div>
              </div>
              <button
                className="icon-btn"
                aria-label={`حذف ${a.title}`}
                onClick={async () => {
                  if (await confirmDialog(`اکانت «${a.title}» حذف شود؟`)) remove.mutate(a.id);
                }}
              >
                <Trash2 size={18} color="#ff8a80" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Sheet open={adding} onClose={() => setAdding(false)} title="افزودن اکانت بازی">
        <div style={{ marginBottom: 16 }}>
          <Segmented<CredentialType>
            value={kind}
            onChange={setKind}
            options={[
              { value: 'email_password', label: 'ایمیل و رمز' },
              { value: 'supercell_id', label: 'Supercell ID' },
              { value: 'player_id', label: 'Player ID' },
            ]}
          />
        </div>
        <GameAccountForm key={kind} credentialType={kind} onSaved={() => setAdding(false)} />
      </Sheet>
    </Screen>
  );
}
