import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Users } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';

import { errorText } from '@/api/client';
import { teamsApi } from '@/api/endpoints';
import { haptic } from '@/lib/telegram';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/Screen';
import { toast } from '@/ui/Toast';

import './teams.css';

/** Landing for team invite links (t.me/<bot>?startapp=join-CODE). Joining always needs an explicit tap. */
export default function JoinTeam() {
  const { code = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const join = useMutation({
    mutationFn: () => teamsApi.join(code),
    onSuccess: team => {
      haptic.success();
      void queryClient.invalidateQueries({ queryKey: ['me', 'teams'] });
      toast.success(`به تیم ${team.name} پیوستی!`);
      navigate(`/teams/${team.id}`, { replace: true });
    },
    onError: error => toast.error(errorText(error)),
  });

  return (
    <Screen title="دعوت به تیم" fallback="/teams" noTabs>
      <div className="team-hero">
        <div className="empty__art" style={{ color: '#a78bfa' }}>
          <Users size={40} />
        </div>
        <h1 style={{ direction: 'rtl' }}>دعوت به یک تیم</h1>
        <p className="muted text-sm">با این کد دعوت عضو تیم می‌شوی و می‌توانی در تورنمنت‌های تیمی کنارشان بازی کنی.</p>
        <code className="invite-box" style={{ alignSelf: 'stretch', justifyContent: 'center', direction: 'ltr', color: 'var(--cream)', fontWeight: 800 }}>
          {code}
        </code>
      </div>
      <div className="action-bar">
        <Button size="lg" block loading={join.isPending} onClick={() => join.mutate()} icon={<Shield size={20} />}>
          پیوستن به تیم
        </Button>
      </div>
    </Screen>
  );
}
