import { m } from 'motion/react';
import { House, ShoppingBag, ShoppingCart, Trophy, UserRound } from 'lucide-react';
import { NavLink } from 'react-router';

import { faDigits } from '@/lib/format';
import { useCart } from '@/lib/queries';
import { haptic } from '@/lib/telegram';

const TABS = [
  { to: '/', label: 'خانه', icon: House, end: true },
  { to: '/store', label: 'فروشگاه', icon: ShoppingBag },
  { to: '/tournaments', label: 'تورنمنت', icon: Trophy },
  { to: '/cart', label: 'سبد خرید', icon: ShoppingCart },
  { to: '/me', label: 'پروفایل', icon: UserRound },
];

export function TabBar() {
  const cart = useCart();
  const count = cart.data?.count ?? 0;
  return (
    <nav className="tabbar" aria-label="منوی اصلی">
      {TABS.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} className="tabbar__item" onClick={() => haptic.select()}>
          {({ isActive }) => (
            <>
              {isActive && (
                <m.span layoutId="tab-pill" className="tabbar__pill" transition={{ type: 'spring', damping: 28, stiffness: 380 }} />
              )}
              <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
              <span>{label}</span>
              {to === '/cart' && count > 0 && <span className="dot-badge">{faDigits(count)}</span>}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
