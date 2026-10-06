"use client";

import { useEffect, useRef, useState } from 'react';
import { resolveAchievementImage } from '@/lib/achievementImages';

function ImageWithAnimation({ image, gif, alt, className }) {
  const [ready, setReady] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const handleLoad = async (event) => {
    const element = event.currentTarget;
    try {
      // onLoad waits for the download; decode waits until it can be painted.
      if (typeof element.decode === 'function') await element.decode();
      if (mounted.current && element.naturalWidth > 0) setReady(true);
    } catch {
      // Keep the static image when the animation cannot be decoded.
    }
  };

  return (
    <span style={{ display: 'inline-block', position: 'relative', verticalAlign: 'top' }}>
      <img
        className={className}
        src={image}
        alt={ready ? '' : alt}
        aria-hidden={ready}
        loading="eager"
        style={{ display: 'block', visibility: ready ? 'hidden' : 'visible' }}
      />
      {gif && (
        <img
          className={className}
          src={gif}
          alt={ready ? alt : ''}
          aria-hidden={!ready}
          loading="eager"
          onLoad={handleLoad}
          onError={() => setReady(false)}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'contain', visibility: ready ? 'visible' : 'hidden',
          }}
        />
      )}
    </span>
  );
}

export default function AchievementImage({ image, gif, alt, className }) {
  const localImage = resolveAchievementImage(image);
  // Remount on source change: a previous achievement must never reveal this GIF early.
  return (
    <ImageWithAnimation
      key={`${localImage}|${gif || ''}`}
      image={localImage}
      gif={gif}
      alt={alt}
      className={className}
    />
  );
}
