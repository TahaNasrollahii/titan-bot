/** A Fluent 3D emoji from public/clay (Microsoft, MIT), sized for clay surfaces. */
export type Icon3DName =
  | 'bell' | 'bell-with-slash' | 'bookmark' | 'bust-in-silhouette' | 'busts-in-silhouette' | 'card-index-dividers'
  | 'chart-increasing' | 'check-mark-button' | 'coin' | 'credit-card' | 'cross-mark' | 'crossed-swords' | 'crown'
  | 'envelope-with-arrow' | 'fire' | 'gear' | 'gem-stone' | 'glowing-star' | 'headphone' | 'heart-with-ribbon'
  | 'high-voltage' | 'hourglass-not-done' | 'house' | 'hundred-points' | 'joystick' | 'link' | 'locked'
  | 'magnifying-glass-tilted-left' | 'mobile-phone' | 'money-bag' | 'package' | 'party-popper' | 'receipt'
  | 'red-heart' | 'rocket' | 'shield' | 'shopping-bags' | 'shopping-cart' | 'sparkles' | 'speech-balloon'
  | 'ticket' | 'trophy' | 'video-game' | 'wrapped-gift';

export function Icon3D({ name, size = 32, className = '' }: { name: Icon3DName; size?: number; className?: string }) {
  return (
    <img
      className={`icon3d ${className}`}
      src={`/clay/${name}.webp`}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      draggable={false}
    />
  );
}
