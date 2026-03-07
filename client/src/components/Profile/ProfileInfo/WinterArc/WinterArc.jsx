'use client';
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import styles from "./WinterArc.module.css";

const WinterArc = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [snowflakes, setSnowflakes] = useState([]);

  useEffect(() => {
    const flakes = Array.from({ length: 20 }, () => ({
      left: Math.random() * 100,
      duration: 5 + Math.random() * 4,
      delay: Math.random() * 5,
      size: 6 + Math.random() * 6,
    }));
    setSnowflakes(flakes);
  }, []);

  return (
    <>
      <motion.div
        className={styles.WinterArc}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsModalOpen(true)}
      >
        <div className={styles.snowContainer}>
          {snowflakes.map((flake, i) => (
            <span
              key={i}
              className={styles.snowflake}
              style={{
                left: `${flake.left}%`,
                animationDuration: `${flake.duration}s`,
                animationDelay: `${flake.delay}s`,
                fontSize: `${flake.size}px`,
              }}
            >
              ❄️
            </span>
          ))}
        </div>
        ❄️ Winter Arc — что это? ❄️
      </motion.div>

      {/* 🌨 Модальное окно */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className={styles.modalBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              className={styles.modalContent}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className={styles.closeButton}
                aria-label="Close modal"
              >
                <X size={22} />
              </button>

              <h2 className={styles.modalTitle}>❄️ Winter Arc</h2>

              <div className={styles.modalText}>
                <p>
                  ✨ <b>Winter Arc</b> — это особенный сезон внутреннего роста и
                  дисциплины. Когда за окном холодно, мы направляем энергию внутрь:
                  укрепляем привычки, держим фокус и идём вперёд несмотря ни на что 💪
                </p>

                <p>📅 <b>Период:</b> 1 октября 2025 — 1 марта 2026</p>

                <p>🔥 <b>Твоя цель:</b></p>
                <ul>
                  <li>• Ежедневно выполнять свои цели</li>
                  <li>• Сохранять стабильность и самоконтроль</li>
                  <li>• Делиться результатами и вдохновлять других 🌟</li>
                </ul>

                <p>
                  💭 В конце зимы ты оглянешься назад и увидишь,  
                  насколько сильнее стал. Это не просто сезон — это твоя арка становления.
                </p>

                <p className={styles.signature}>Зима закаляет сильных ❄️</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default WinterArc;
