import type { CSSProperties } from 'react';

import type { Presence } from '@/api/types';
import { media } from '@/lib/media';
import { DefaultAvatar } from '@/lib/ranks';

interface Props {
  name: string;
  src?: string | null;
  seed?: number | null;
  size?: number;
  presence?: Presence;
  ring?: string;
}

export function Avatar({ name, src, seed, size = 40, presence, ring }: Props) {
  const url = media(src);
  const style = { '--size': `${size}px`, ...(ring ? { '--ring': ring } : {}) } as CSSProperties;
  return (
    <span className="avatar" style={style}>
      <span className="avatar__inner">
        {url ? <img src={url} alt="" loading="lazy" decoding="async" /> : <DefaultAvatar seed={seed ?? name.length} />}
      </span>
      {presence && <span className="avatar__presence" data-presence={presence} />}
    </span>
  );
}
