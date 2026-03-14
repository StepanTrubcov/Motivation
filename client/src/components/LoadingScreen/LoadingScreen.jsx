'use client';

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import c from "./LoadingScreen.module.css";

const DARK_IMAGE_URL = "https://image.cdn2.seaart.me/2025-10-06/d3hu76le878c73fiteb0-4/fb820b14ea72bafe7a48d96c369ea537_high.webp";
const LIGHT_IMAGE_URL = "https://i.postimg.cc/dQ4RrB1x/image.jpg";

const LoadingScreen = ({ title }) => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [name, setName] = useState(t('warrior'));
  const isLight = theme === 'light';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('@twa-dev/sdk').then((module) => {
        const WebApp = module.default;
        const userName = WebApp.initDataUnsafe?.user?.first_name || t('warrior');
        setName(userName);
      });
    }
  }, [t]);

  return (
    <div className={c.wrapper}>
      {isLight ? (
        <motion.img
          src={LIGHT_IMAGE_URL}
          className={c.img}
          initial={{ y: 0, scale: 1.2, opacity: 0 }}
          animate={[
            { opacity: 1, scale: 1, transition: { duration: 1.2, ease: "easeOut" } },
            { y: "40%", transition: { duration: 1.3, ease: "easeInOut", delay: 1 } }
          ]}
          alt=""
        />
      ) : (
        <motion.img
          src={DARK_IMAGE_URL}
          className={c.img}
          initial={{ y: 0, scale: 1.2, opacity: 0 }}
          animate={[
            { opacity: 1, scale: 1, transition: { duration: 1.2, ease: "easeOut" } },
            { y: "40%", transition: { duration: 1.3, ease: "easeInOut", delay: 1 } }
          ]}
          alt=""
        />
      )}

      <motion.div
        className={c.topBlock}
        initial={{ opacity: 0, y: -80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.5, ease: "easeOut" }}
      >
        <div className={c.text}>
          <h1 className={c.greeting}>{t('welcome')} {name.toUpperCase()}!</h1>
          <p className={c.subtitle}>{title || t('loadingGoalsInProgress')}</p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
