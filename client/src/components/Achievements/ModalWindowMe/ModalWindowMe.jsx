"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import styles from "./ModalWindowMe.module.css";
import { toast } from "react-hot-toast";
import { generateImage } from "@/lib/api/ImageShare";

const ModalWindowMe = ({
  getMakingPicture,
  isModalOpen,
  closeModal,
  username,
  uploadTempUrl,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const tgRef = useRef(null);

  useEffect(() => {
    tgRef.current = typeof window !== "undefined" ? window.Telegram?.WebApp ?? null : null;

    if (!tgRef.current) {
      toast.error("Открой Mini App в Telegram");
      return;
    }

    const tg = tgRef.current;

    console.log("=== TELEGRAM DEBUG ===");
    console.log("Version:", tg.version);
    console.log("Platform:", tg.platform);
    console.log("shareToStory:", typeof tg.shareToStory);
    console.log("======================");

    try {
      if (typeof tg.ready === "function") tg.ready();
      if (typeof tg.expand === "function") tg.expand();
    } catch (e) {
      console.warn("tg.ready/expand failed", e);
    }
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      setIsLoading(true);
      handleGenerate();
    }
  }, [isModalOpen]);

  const rarityClass = isModalOpen?.active;

  const handleGenerate = async () => {
    if (!isModalOpen?.title) return toast.error("Нет данных");

    setIsLoading(true);
    setImageDataUrl(null);

    try {
      const imageUrl = await generateImage({
        title: isModalOpen.title,
        img: isModalOpen.img,
        points: isModalOpen.points || 0,
        rarityClass: rarityClass,
      });

      setImageDataUrl(imageUrl);
      toast.success("Карточка готова!", {
        style: { background: '#333', color: '#fff', marginTop: '80px', },
      });
    } catch (err) {
      console.error(err);
      toast.error("Ошибка генерации", {
        style: {
          background: '#333', color: '#fff',
          marginTop: '80px',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isHttpUrl = (url) => {
    try {
      const u = new URL(url);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch (e) {
      return false;
    }
  };

  const urlToBlob = async (url) => {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Fetch failed: ${resp.status}`);
    return await resp.blob();
  };

  const tryShareToStory = async (tg, mediaUrl) => {
    if (typeof tg.shareToStory !== "function") return false;

    const caption = `Вы тоже можете получить такую ачивку\nhttps://t.me/BotMotivation_TG_bot \nПереходи в бота выполняй свои цели и получай ачивки`.trim();

    // Параметры для кнопки-ссылки (widget_link)
    const params = {
      text: caption,
      widget_link: {
        url: "https://t.me/BotMotivation_TG_bot",
        name: "Бот «Дневные достижения»", // Текст на кнопке
      },
    };

    // Пробуем разные сигнатуры
    try {
      tg.shareToStory(mediaUrl, params);
      return true;
    } catch (e1) {
      console.warn("shareToStory(mediaUrl, params) failed:", e1);
      try {
        tg.shareToStory({ url: mediaUrl, ...params });
        return true;
      } catch (e2) {
        console.warn("shareToStory({url, ...params}) failed:", e2);
        // Фолбэк без widget_link (только caption)
        try {
          tg.shareToStory(mediaUrl, { text: caption });
          return true;
        } catch (e3) {
          console.warn("shareToStory без widget_link failed:", e3);
          return false;
        }
      }
    }
  };

  const handleShare = async () => {
    if (!imageDataUrl) return toast.error("Сгенерируй карточку");

    const tg = tgRef.current;
    if (!tg) return toast.error("Telegram API не найден");

    try {
      let mediaUrl = imageDataUrl;

      if (!isHttpUrl(mediaUrl)) {
        if (typeof uploadTempUrl === "function") {
          toast("Подготавливаем картинку для Stories...");
          const uploaded = await uploadTempUrl(await urlToBlob(mediaUrl));
          if (!uploaded || !isHttpUrl(uploaded)) throw new Error("Не удалось загрузить");
          mediaUrl = uploaded;
        } else {
          throw new Error("Нет uploadTempUrl");
        }
      }

      const shared = await tryShareToStory(tg, mediaUrl);
      if (shared) {
        toast.success("Открылось окно Stories с кнопкой!", {
          style: { background: '#333', color: '#fff', marginTop: '80px', },
        });
        return;
      }

      // Фолбэк на скачивание
      toast("Истории с кнопкой недоступны. Скачиваем...");
      const a = document.createElement("a");
      a.href = imageDataUrl;
      a.download = "achievement.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Скачано! Добавь в историю вручную и вставь ссылку стикером");
    } catch (err) {
      console.error("share error:", err);
      toast.error("Не удалось поделиться в Stories");
    }
  };

  console.log(imageDataUrl)

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div className={styles.modalBackdrop} onClick={closeModal}>
          <motion.div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button onClick={closeModal} className={styles.closeButton}>
              <X size={24} />
            </button>

            <div className={`${styles.card} ${styles[rarityClass]}`}>
              <div className={styles.cardInner}>
                <div className={styles.imageWrapper}>
                  <img className={styles.img} src={isModalOpen?.gif} alt={isModalOpen?.title} />
                </div>

                <div className={styles.ribbon}>
                  {rarityClass === "common" && <span>Обычная</span>}
                  {rarityClass === "rare" && <span>Редкая</span>}
                  {rarityClass == "legendary" && <span>Легендарная</span>}
                  {rarityClass == "epic" && <span>Эпическая</span>}
                </div>

                <div className={styles.title}>{isModalOpen?.title}</div>

                <div className={styles.points}>{isModalOpen?.points} pts</div>
              </div>
            </div>

            <button
              className={`${styles.howToGet} ${styles[rarityClass]}`}
              onClick={handleShare}
              disabled={isLoading}
            >
              {imageDataUrl === null ? (
                <div className={styles.howToGetHeader}>
                  <img src="https://media.tenor.com/Pq1cZiuhlEEAAAAi/rajinikanth.gif" unoptimized alt="Loading" style={{ width: '18px', height: '18px', marginRight: '10px' }} />
                  Генерируем изображение
                </div>
              ) : (
                <div className={styles.howToGetHeader}>📤 Поделиться/история</div>
              )}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalWindowMe;