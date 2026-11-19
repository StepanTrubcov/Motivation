"use client";

import { achievementImageSrc } from '@/lib/achievementImages';

// Achievement artwork is static while the replacement animations are being prepared.
// Reserve the square immediately so decoding cannot resize the opening sheet.
export default function AchievementImage({ image, alt, className }) {
  return (
    <span style={{ display: 'block', width: '100%', height: '100%', aspectRatio: '1', position: 'relative' }}>
      <img
        className={className}
        src={achievementImageSrc(image)}
        alt={alt || ''}
        width={1254}
        height={1254}
        loading="eager"
        decoding="async"
        style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </span>
  );
}
