import { useQuery } from '@tanstack/react-query';
import { Copy, GitFork } from 'lucide-react';

import { tournamentsApi } from '@/api/endpoints';
import type { Match, Participant } from '@/api/types';
import { dateTime, faDigits } from '@/lib/format';
import { Avatar } from '@/ui/Avatar';
import { Empty, ErrorState } from '@/ui/Empty';
import { Skeleton } from '@/ui/Skeleton';
import { toast } from '@/ui/Toast';

export function Bracket({ slug }: { slug: string }) {
  const rounds = useQuery({ queryKey: ['tournament', slug, 'bracket'], queryFn: () => tournamentsApi.bracket(slug) });
  if (rounds.isError) return <ErrorState error={rounds.error} onRetry={() => rounds.refetch()} />;
  if (!rounds.data)
    return (
      <div className="bracket">
        {[0, 1].map(i => (
          <Skeleton key={i} w={236} h={260} r={16} style={{ flexShrink: 0 }} />
        ))}
      </div>
    );
  if (!rounds.data.length)
    return <Empty icon={<GitFork size={32} />} title="براکت هنوز چیده نشده" text="بعد از بسته شدن ثبت‌نام، جدول مسابقات این‌جا می‌آید." />;

  return (
    <div className="bracket" aria-label="جدول مسابقات">
      {rounds.data.map(round => (
        <section key={round.round} className="bracket__round">
          <h3 className="bracket__name">{round.name}</h3>
          <div className="bracket__matches">
            {round.matches.map(match => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function MatchCard({ match }: { match: Match }) {
  const done = match.status === 'completed';
  return (
    <article className="match" data-mine={match.isMine} data-live={match.status === 'live'}>
      <Side p={match.participantA} score={match.scoreA} winner={done && match.winnerId === match.participantA?.id} loser={done && match.winnerId !== match.participantA?.id} />
      <Side p={match.participantB} score={match.scoreB} winner={done && match.winnerId === match.participantB?.id} loser={done && match.winnerId !== match.participantB?.id} />
      <div className="match__foot">
        <span>
          {match.status === 'live' ? (
            <span style={{ color: 'var(--red-2)', fontWeight: 800 }}>● زنده</span>
          ) : match.scheduledAt ? (
            dateTime(match.scheduledAt)
          ) : match.status === 'bye' ? (
            'استراحت'
          ) : (
            `BO${faDigits(match.bestOf)}`
          )}
        </span>
        {match.isMine && match.lobbyCode && (
          <button
            className="badge badge--cream"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(match.lobbyCode!);
                toast.success('کد لابی کپی شد');
              } catch {
                toast.error('کپی نشد');
              }
            }}
          >
            <Copy size={11} /> لابی: <span className="ltr">{match.lobbyCode}</span>
          </button>
        )}
      </div>
    </article>
  );
}

function Side({ p, score, winner, loser }: { p: Participant | null; score: number | null; winner: boolean; loser: boolean }) {
  return (
    <div className="match__side" data-winner={winner} data-loser={Boolean(p) && loser}>
      {p ? <Avatar name={p.name} src={p.logo} seed={p.avatarSeed ?? p.id} size={24} /> : <span style={{ width: 24 }} />}
      <span className="match__name">{p?.name ?? 'در انتظار'}</span>
      <span className="match__score num">{score ?? '–'}</span>
    </div>
  );
}
