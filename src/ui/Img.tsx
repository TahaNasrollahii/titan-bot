import { useState, type CSSProperties } from 'react';

import { media } from '@/lib/media';

interface Props {
  src: string | null | undefined;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  contain?: boolean;
  /** Above-the-fold images load eagerly with high priority. */
  priority?: boolean;
  width?: number;
  height?: number;
}

/** An image that fades in once decoded, over a tinted placeholder. */
export function Img({ src, alt = '', className = '', style, contain, priority, width, height }: Props) {
  const [loaded, setLoaded] = useState(false);
  const url = media(src);
  return (
    <div className={`img ${contain ? 'img--contain' : ''} ${className}`} data-loaded={loaded} style={style}>
      {url && (
        <img
          src={url}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          draggable={false}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
        />
      )}
    </div>
  );
}
