import { House, ShoppingBag, ShoppingCart, Trophy, UserRound } from 'lucide-react';
import { NavLink } from 'react-router';

import { faDigits } from '@/lib/format';
import { useCart } from '@/lib/queries';
import { haptic } from '@/lib/telegram';

const TABS = [
  { to: '/', label: 'خانه', icon: House, end: true },
  { to: '/store', label: 'فروشگاه', icon: ShoppingBag },
  { to: '/tournaments', label: 'مسابقات', icon: Trophy },
  { to: '/cart', label: 'سبد', icon: ShoppingCart },
  { to: '/me', label: 'پروفایل', icon: UserRound },
];

/** The site's bottom bar: a dark capsule where the active tab rises into a red circle. */
export function TabBar() {
  const cart = useCart();
  const count = cart.data?.count ?? 0;
  return (
    <nav className="tabbar" aria-label="منوی اصلی">
      {TABS.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} className="tabbar__item" onClick={() => haptic.select()}>
          {({ isActive }) => (
            <>
              {isActive ? (
                <span className="tabbar__bubble">
                  <Icon size={24} strokeWidth={2.3} />
                </span>
              ) : (
                <Icon size={23} strokeWidth={2} />
              )}
              <span>{label}</span>
              {to === '/cart' && count > 0 && !isActive && <span className="dot-badge">{faDigits(count)}</span>}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
