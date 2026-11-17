'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { getLaunchScene, scenesForTheme } from '@/lib/loadingScenes.mjs';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import c from './LoadingScreen.module.css';

const LoadingScreen = ({ title, error, onRetry }) => {
  const { t } = useLanguage();
  const reducedMotion = useReducedMotion();
  const [name, setName] = useState(null);
  const [theme, setTheme] = useState(null);
  const [scene, setScene] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    let active = true;
    import('@twa-dev/sdk').then(({ default: webApp }) => {
      const firstName = webApp.initDataUnsafe?.user?.first_name;
      if (active && typeof firstName === 'string' && firstName.trim()) setName(firstName.trim());
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let previousTheme;
    const updateTheme = () => {
      const current = document.documentElement.classList.contains('light-theme') ? 'light' : 'dark';
      if (current === previousTheme) return;
      previousTheme = current;
      setTheme(current);
      setScene(getLaunchScene(current));
      setImageLoaded(false);
      setImageFailed(false);
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const handleImageError = () => {
    if (scene?.id !== scenesForTheme(theme)[0].id) {
      setImageLoaded(false);
      setScene(scenesForTheme(theme)[0]);
    } else setImageFailed(true);
  };

  return (
    <div className={c.wrapper} aria-busy={!error}>
      <div className={c.poster} aria-hidden="true">
        {scene && !imageFailed && (
          <motion.img
            key={scene.id}
            src={scene.src}
            className={`${c.img} ${imageLoaded ? c.imgLoaded : ''}`}
            alt=""
            width={720}
            height={1080}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            initial={false}
            animate={{ scale: reducedMotion ? 1 : imageLoaded ? 1.035 : 1 }}
            transition={{ duration: reducedMotion ? 0 : 8, ease: 'linear' }}
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
          />
        )}
      </div>
      <div className={c.topBlock}>
        <h1 className={c.greeting}>{t('welcome')} {(name || t('warrior')).toUpperCase()}!</h1>
        <div className={c.status} role="status" aria-live="polite">
          <p className={c.subtitle}>{error || title || t('loadingGoalsInProgress')}</p>
          {!error && <LoadingSpinner className={c.spinner} size={22} />}
        </div>
        {error && <button type="button" className={c.retry} onClick={onRetry}>{t('retry') === 'retry' ? 'Попробовать ещё раз' : t('retry')}</button>}
      </div>
    </div>
  );
};

export default LoadingScreen;
