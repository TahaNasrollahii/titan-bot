import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Mail, Plus, Ticket } from 'lucide-react';
import { useState, type CSSProperties } from 'react';
import { Link, useNavigate } from 'react-router';

import { meApi } from '@/api/endpoints';
import { faDigits } from '@/lib/format';
import { haptic } from '@/lib/telegram';
import { Avatar } from '@/ui/Avatar';
import { Button } from '@/ui/Button';
import { Empty, ErrorState } from '@/ui/Empty';
import { Icon3D } from '@/ui/Icon3D';
import { Screen } from '@/ui/Screen';
import { Sheet } from '@/ui/Sheet';
import { SkeletonList } from '@/ui/Skeleton';

import './teams.css';

export const ROLE = { captain: 'کاپیتان', player: 'بازیکن', substitute: 'ذخیره' } as const;

export default function Teams() {
  const navigate = useNavigate();
  const teams = useQuery({ queryKey: ['me', 'teams'], queryFn: meApi.teams });
  const invitations = useQuery({ queryKey: ['me', 'team-invitations'], queryFn: meApi.teamInvitations });
  const [joining, setJoining] = useState(false);
  const [code, setCode] = useState('');
  const pending = invitations.data?.filter(i => i.status === 'pending').length ?? 0;

  return (
    <Screen title="تیم‌های من" fallback="/me">
      <div className="row" style={{ '--gap': '10px' } as CSSProperties}>
        <Link to="/teams/new" className="btn btn--primary" style={{ flex: 1 }} onClick={() => haptic.tap('medium')}>
          <Plus size={18} /> ساخت تیم
        </Link>
        <Button variant="glass" onClick={() => setJoining(true)} icon={<Ticket size={18} />} style={{ flex: 1 }}>
          کد دعوت دارم
        </Button>
      </div>

      {pending > 0 && (
        <Link to="/invitations" className="my-next card--press" style={{ marginTop: 14, marginBottom: 0 }}>
          <span className="list-row__icon">
            <Mail size={18} />
          </span>
          <span className="list-row__body">
            <strong className="list-row__title">{faDigits(pending)} دعوت‌نامه‌ی تیمی</strong>
            <span className="list-row__sub">منتظر جواب توست</span>
          </span>
          <ChevronLeft size={18} />
        </Link>
      )}

      <section className="section">
        {teams.isError ? (
          <ErrorState error={teams.error} onRetry={() => teams.refetch()} />
        ) : !teams.data ? (
          <SkeletonList count={2} h={76} />
        ) : teams.data.length === 0 ? (
          <Empty
            icon={<Icon3D name="shield" size={52} />}
            title="هنوز عضو تیمی نیستی"
            text="یک تیم بساز و دوستانت را دعوت کن، یا با کد دعوت به تیمی بپیوند."
          />
        ) : (
          <div className="stack">
            {teams.data.map(team => (
              <Link key={team.id} to={`/teams/${team.id}`} className="order-row card--press" onClick={() => haptic.tap()}>
                <Avatar name={team.name} src={team.logo} seed={team.id} size={48} presence={team.activity} />
                <div className="list-row__body">
                  <div className="list-row__title ltr" style={{ textAlign: 'right' }}>
                    {team.name}
                  </div>
                  <div className="list-row__sub num">
                    {team.myRole ? ROLE[team.myRole] : 'عضو'} · {faDigits(team.memberCount)}/{faDigits(team.maxMembers)} عضو · برد{' '}
                    {faDigits(team.winRate)}٪
                  </div>
                </div>
                <ChevronLeft size={18} className="list-row__chev" />
              </Link>
            ))}
          </div>
        )}
      </section>

      <Sheet
        open={joining}
        onClose={() => setJoining(false)}
        title="پیوستن با کد دعوت"
        footer={
          <Button size="lg" block disabled={code.trim().length < 4} onClick={() => navigate(`/join/${encodeURIComponent(code.trim())}`)}>
            ادامه
          </Button>
        }
      >
        <input
          className="input ltr"
          placeholder="کد دعوت تیم"
          autoCapitalize="characters"
          value={code}
          onChange={e => setCode(e.target.value.replace(/[^A-Za-z0-9_-]/g, ''))}
          aria-label="کد دعوت"
        />
      </Sheet>
    </Screen>
  );
}
