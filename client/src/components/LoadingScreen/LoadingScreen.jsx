'use client';

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import c from "./LoadingScreen.module.css";

const LoadingScreen = ({ title }) => {
  const [name, setName] = useState("Воин дисциплины");

  useEffect(() => {
    // Только на клиенте загружаем WebApp
    if (typeof window !== 'undefined') {
      import('@twa-dev/sdk').then((module) => {
        const WebApp = module.default;
        const userName = WebApp.initDataUnsafe?.user?.first_name || "Воин дисциплины";
        setName(userName);
      });
    }
  }, []);

  return (
    <div className={c.wrapper}>
      <motion.img
        src="https://image.cdn2.seaart.me/2025-10-06/d3hu76le878c73fiteb0-4/fb820b14ea72bafe7a48d96c369ea537_high.webp"
        className={c.img}
        initial={{ y: 0, scale: 1.2, opacity: 0 }}
        animate={[
          { opacity: 1, scale: 1, transition: { duration: 1.2, ease: "easeOut" } },
          { y: "40%", transition: { duration: 1.3, ease: "easeInOut", delay: 1 } }
        ]}
      />

      <motion.div
        className={c.topBlock}
        initial={{ opacity: 0, y: -80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.5, ease: "easeOut" }}
      >
        <div className={c.text}>
          <h1 className={c.greeting}>ДОБРО ПОЖАЛОВАТЬ, {name.toUpperCase()}!</h1>
          <p className={c.subtitle}>{title || "Идёт загрузка целей..."}</p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
