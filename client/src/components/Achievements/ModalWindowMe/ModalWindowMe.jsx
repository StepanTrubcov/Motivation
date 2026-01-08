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
    console.log("start_param:", tg.initDataUnsafe?.start_param);
    console.log("shareToStory:", typeof tg.shareToStory);
    console.log("showStoryEditor:", typeof tg.showStoryEditor);
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
      setIsLoading(true)
      handleGenerate()
    }
  }, [isModalOpen])

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

      setImageDataUrl(imageUrl); // Сохраняем прямую ссылку на изображение
      toast.success("Карточка готова!", {
        style: {
          background: '#333',
          color: '#fff',
        }
      });
    } catch (err) {
      console.error(err);
      toast.error("Ошибка генерации", {
        style: {
          background: '#333',
          color: '#fff',
        }
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

  const tryShareToStory = async (tg, mediaUrl, caption) => {
    if (typeof tg.shareToStory !== "function") return false;

    const payload = {
      media_url: mediaUrl,
      text: caption,
      link: {
        url: "https://t.me/BotMotivation_TG_bot",
        name: "Дневные достижения"
      }
    };

    try {
      await tg.shareToStory(payload);
      return true;
    } catch (e) {
      console.warn("shareToStory failed:", e);
      return false;
    }
  };
  
  const handleShare = async () => {
    if (!imageDataUrl) return toast.error("Сгенерируй карточку");

    const tg = typeof window !== "undefined" ? window.Telegram?.WebApp ?? null : null;
    if (!tg) return toast.error("Telegram API не найден", {
      style: {
        background: '#333',
        color: '#fff',
      }
    });

    try {
      let mediaUrl = imageDataUrl;

      // если у нас не публичная ссылка — нужно загрузить blob куда-то (uploadTempUrl)
      if (!isHttpUrl(mediaUrl)) {
        try {
          const blob = await urlToBlob(mediaUrl);
          if (typeof uploadTempUrl === "function") {
            toast("Подготавливаем картинку для Stories...");
            const uploaded = await uploadTempUrl(blob);
            if (!uploaded || !isHttpUrl(uploaded)) {
              throw new Error("uploadTempUrl не вернул публичную ссылку");
            }
            mediaUrl = uploaded;
          } else {
            throw new Error("Нет uploadTempUrl для получения публичной ссылки");
          }
        } catch (err) {
          console.warn("Не удалось получить публичную ссылку для shareToStory:", err);
          toast("Нельзя автоматически поделиться — картинку нужно сохранить и загрузить вручную");
          return;
        }
      }

      // Создаем caption с правильной кодировкой для отображения в Telegram
      let caption = "";
      try {
        caption = `Вы тоже можете получить такую ачивку\nhttps://t.me/BotMotivation_TG_bot \nПереходи в бота выполняй свои цели и получай ачивки `.trim();
      } catch (decodeError) {
        console.warn("Ошибка создания caption:", decodeError);
        caption = `Вы тоже можете получить такую ачивку\nhttps://t.me/BotMotivation_TG_bot \nПереходи в бота выполняй свои цели и получай ачивки `.trim();
      }

      // 1) Попытка: tg.shareToStory (несколько сигнатур)
      const shared = await tryShareToStory(tg, mediaUrl, caption);
      if (shared) {
        toast.success("Открылось окно Stories!", {
          style: {
            background: '#333',
            color: '#fff',
          }
        });
        return;
      }

      // 2) Попытка: tg.showStoryEditor (если доступен и умеет принимать File)
      if (typeof tg.showStoryEditor === "function") {
        try {
          // Получаем blob (если mediaUrl — публичный http)
          const resp = await fetch(mediaUrl);
          if (!resp.ok) throw new Error("Не удалось скачать изображение для editor");
          const blob = await resp.blob();
          // File-конструктор может не существовать в некоторых окружениях, но в браузерах обычно есть
          const file = new File([blob], "achievement.png", { type: blob.type || "image/png" });

          await tg.showStoryEditor({
            media: [file],
            text: caption,
          });
          toast.success("История открыта!", {
            style: {
              background: '#333',
              color: '#fff',
            }
          });
          return;
        } catch (err) {
          console.warn("showStoryEditor failed:", err);
          // fallthrough на скачивание
        }
      }

      // 3) Фолбэк: скачать картинку и подсказать пользователю
      toast("Истории пока недоступны. Скачиваем карточку...", {
        style: {
          background: '#333',
          color: '#fff',
        }
      });
      const a = document.createElement("a");
      a.href = imageDataUrl;
      a.download = "achievement.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Скачано! Открой Telegram → + → История → выбери фото", {
        style: {
          background: '#333',
          color: '#fff',
        }
      });
    } catch (err) {
      console.error("share error:", err);
      toast.error("Не удалось поделиться в Stories", {
        style: {
          background: '#333',
          color: '#fff',
        }
      });
    }
  };

  if (imageDataUrl) {
    if (isLoading) {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div className={styles.modalBackdrop} onClick={closeModal}>
          <motion.div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >

            <button
              onClick={closeModal}
              className={styles.closeButton}
            >
              <X size={24} />
            </button>

            <div
              className={`${styles.card} ${styles[rarityClass]}`}
            >
              <div className={styles.cardInner}>
                <div className={styles.imageWrapper}>
                  <img
                    className={styles.img}
                    src={isModalOpen?.gif}
                    alt={isModalOpen?.title}
                  />
                </div>

                <div className={styles.ribbon}>
                  {rarityClass === "common" && <span>Обычная</span> || rarityClass === "rare" && <span>Редкая</span> || <span>Легендарная</span>}
                </div>

                <div className={styles.title}>
                  {isModalOpen?.title}
                </div>

                <div className={styles.points}>
                  {isModalOpen?.points} pts
                </div>
              </div>
            </div>
            <button
              className={`${styles.howToGet} ${styles[rarityClass]} `}
              onClick={handleShare}
              disabled={isLoading}
            >
              {imageDataUrl === null && <div className={styles.howToGetHeader}>
                <img src="https://media.tenor.com/Pq1cZiuhlEEAAAAi/rajinikanth.gif" unoptimized="true" alt="Loading" style={{ width: '18px', height: '18px', marginRight: '10px' }} />
                Генерируем изображение
              </div> ||
                <div className={styles.howToGetHeader} >
                  📤 Поделиться/История
                </div>}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalWindowMe;
