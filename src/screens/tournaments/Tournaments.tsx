import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { CalendarClock } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

import { catalogApi, meApi, tournamentsApi } from '@/api/endpoints';
import type { TournamentStatus } from '@/api/types';
import { haptic } from '@/lib/telegram';
import { TournamentCard } from '@/ui/cards';
import { Empty, ErrorState } from '@/ui/Empty';
import { Img } from '@/ui/Img';
import { Icon3D } from '@/ui/Icon3D';
import { Screen } from '@/ui/Screen';
import { Segmented } from '@/ui/Segmented';
import { Skeleton } from '@/ui/Skeleton';
import { useInView } from '@/ui/useInView';

import './tournaments.css';

type Tab = 'open' | 'live' | 'upcoming' | 'done';

const TAB_STATUS: Record<Tab, TournamentStatus[]> = {
  open: ['registration_open'],
  live: ['live'],
  upcoming: ['upcoming', 'registration_closed'],
  done: ['completed'],
};

export default function Tournaments() {
  const [tab, setTab] = useState<Tab>('open');
  const [game, setGame] = useState<string | undefined>();
  const games = useQuery({ queryKey: ['games'], queryFn: catalogApi.games, staleTime: 5 * 60_000 });
  const mine = useQuery({ queryKey: ['me', 'tournaments'], queryFn: meApi.tournaments });

  const list = useInfiniteQuery({
    queryKey: ['tournaments', 'list', tab, game],
    queryFn: ({ pageParam }) =>
      tournamentsApi.list({
        status: TAB_STATUS[tab],
        game,
        ordering: tab === 'done' ? '-starts_at' : 'starts_at',
        page: pageParam,
        page_size: 10,
      }),
    initialPageParam: 1,
    getNextPageParam: (last, pages) => (last.next ? pages.length + 1 : undefined),
  });
  const sentinel = useInView<HTMLDivElement>(() => {
    if (list.hasNextPage && !list.isFetchingNextPage) void list.fetchNextPage();
  }, list.hasNextPage);

  const items = list.data?.pages.flatMap(p => p.results) ?? [];
  const activeMine = mine.data?.results.filter(r => r.status === 'confirmed' && r.tournament.status !== 'completed') ?? [];

  return (
    <Screen>
      {activeMine.length > 0 && (
        <Link to={`/tournaments/${activeMine[0].tournament.slug}`} className="my-next card--press" onClick={() => haptic.tap()}>
          <span className="my-next__icon">
            <CalendarClock size={22} />
          </span>
          <span className="list-row__body">
            <span className="text-xs muted">مسابقه‌ی بعدی تو</span>
            <strong className="list-row__title">{activeMine[0].tournament.title}</strong>
            {activeMine[0].currentStage && <span className="text-xs">{activeMine[0].currentStage}</span>}
          </span>
          {activeMine.length > 1 && <span className="badge badge--cream">+{activeMine.length - 1}</span>}
        </Link>
      )}

      <Segmented<Tab>
        value={tab}
        onChange={setTab}
        options={[
          { value: 'open', label: 'ثبت‌نام باز' },
          { value: 'live', label: 'زنده' },
          { value: 'upcoming', label: 'به‌زودی' },
          { value: 'done', label: 'پایان‌یافته' },
        ]}
      />

      <div className="rail chips-rail" style={{ marginTop: 12 }}>
        <button className="chip" aria-pressed={!game} onClick={() => (haptic.select(), setGame(undefined))}>
          همه‌ی بازی‌ها
        </button>
        {games.data
          ?.filter(g => g.kind === 'game')
          .map(g => (
            <button key={g.slug} className="chip" aria-pressed={game === g.slug} onClick={() => (haptic.select(), setGame(g.slug))}>
              <Img src={g.iconImage} alt="" contain style={{ width: 20, height: 20, borderRadius: 6, background: 'none' }} />
              {g.title}
            </button>
          ))}
      </div>

      {list.isError ? (
        <ErrorState error={list.error} onRetry={() => list.refetch()} />
      ) : !list.data ? (
        <div className="stack">
          {[0, 1, 2].map(i => (
            <Skeleton key={i} h={250} r={22} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Empty icon={<Icon3D name="trophy" size={52} />} title="فعلاً تورنمنتی این‌جا نیست" text="تب دیگری را ببین یا بعداً سر بزن." />
      ) : (
        <div className="stack">
          {items.map(t => (
            <TournamentCard key={t.id} t={t} />
          ))}
          {list.isFetchingNextPage && <Skeleton h={250} r={22} />}
          <div ref={sentinel} style={{ height: 1 }} />
        </div>
      )}
    </Screen>
  );
}
