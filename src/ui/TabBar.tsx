import { NavLink } from 'react-router';

import { useSession } from '@/auth/session';
import { faDigits } from '@/lib/format';
import { useCart } from '@/lib/queries';
import { haptic } from '@/lib/telegram';

import { RankAvatar } from './RankAvatar';

const TABS = [
  { to: '/', label: 'خانه', icon: '/icons/home.webp', end: true },
  { to: '/store', label: 'فروشگاه', icon: '/icons/store.webp' },
  { to: '/tournaments', label: 'مسابقات', icon: '/icons/tournament.webp' },
  { to: '/cart', label: 'سبد', icon: '/icons/cart.webp' },
  { to: '/me', label: 'پروفایل', icon: '/icons/account.webp' },
];

/** The site's bottom bar: a dark capsule where the active tab rises into a glowing red circle. */
export function TabBar() {
  const session = useSession();
  const user = session.status === 'ready' ? session.user : null;
  const cart = useCart();
  const count = cart.data?.count ?? 0;
  return (
    <nav className="tabbar" aria-label="منوی اصلی">
      {TABS.map(({ to, label, icon, end }) => (
        <NavLink key={to} to={to} end={end} className="tabbar__item" onClick={() => haptic.select()}>
          {({ isActive }) => {
            const isProfile = to === '/me' && user;
            const iconNode = isProfile ? (
              <RankAvatar user={user} size={isActive ? 34 : 30} tuckOrnament />
            ) : (
              <img src={icon} alt="" className="tabbar__icon" width={isActive ? 24 : 23} height={isActive ? 24 : 23} draggable={false} />
            );
            return (
              <>
                {isActive ? <span className="tabbar__bubble">{iconNode}</span> : iconNode}
                <span>{label}</span>
                {to === '/cart' && count > 0 && !isActive && <span className="dot-badge">{faDigits(count)}</span>}
              </>
            );
          }}
        </NavLink>
      ))}
    </nav>
  );
}
