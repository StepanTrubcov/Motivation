"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import styles from "./ModalWindowMe.module.css";
import { toast } from "react-hot-toast";

const ModalWindowMe = ({
  getMakingPicture,
  isModalOpen,
  closeModal,
  username,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState(null);

  const tg = typeof window !== "undefined" ? window.Telegram?.WebApp : null;

  // === КРИТИЧНАЯ ПРОВЕРКА: Telegram API + start_param ===
  useEffect(() => {
    if (!tg) {
      console.error("Telegram WebApp не найден");
      toast.error("Открой Mini App внутри Telegram");
      return;
    }

    console.log("=== TELEGRAM DEBUG ===");
    console.log("Version:", tg.version);
    console.log("Platform:", tg.platform);
    console.log("start_param:", tg.initDataUnsafe?.start_param);
    console.log("showStoryEditor:", typeof tg.showStoryEditor);
    console.log("User:", tg.initDataUnsafe?.user?.id);
    console.log("======================");

    tg.ready();
    tg.expand();

    // Проверка: Mini App должен быть запущен с ?startapp=story
    if (tg.initDataUnsafe?.start_param !== "story") {
      toast.warn("Запусти Mini App через кнопку бота!");
    }

    // Принудительная задержка — иногда API грузится медленно
    const timer = setTimeout(() => {
      if (typeof tg.showStoryEditor !== "function") {
        console.warn("showStoryEditor не загрузился");
        toast("Истории недоступны. Перезапусти из кнопки бота");
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [tg]);

  // === Генерация картинки ===
  const handleGenerate = async () => {
    if (!isModalOpen?.title) return toast.error("Нет данных");

    setIsLoading(true);
    setImageDataUrl(null);

    try {
      const res = await getMakingPicture(isModalOpen, username);
      const dataUrl = res?.data?.url;
      if (!dataUrl) throw new Error("Нет картинки");

      setImageDataUrl(dataUrl);
      toast.success("Карточка готова!");
    } catch (err) {
      console.error("Генерация:", err);
      toast.error("Ошибка генерации");
    } finally {
      setIsLoading(false);
    }
  };

  // === Открытие редактора историй ===
  const handleShareStory = async () => {
    if (!imageDataUrl) return toast.error("Сначала сгенерируй карточку");
    if (!tg) return toast.error("Telegram API не найден");

    // Проверка start_param — ОБЯЗАТЕЛЬНО
    if (tg.initDataUnsafe?.start_param !== "story") {
      toast.error("Запусти Mini App через кнопку бота (не по ссылке)!");
      return;
    }

    if (typeof tg.showStoryEditor !== "function") {
      toast.error("Истории недоступны. Обнови Telegram или перезапусти бота");
      return;
    }

    try {
      const response = await fetch(imageDataUrl);
      if (!response.ok) throw new Error("Ошибка загрузки картинки");
      const blob = await response.blob();
      const file = new File([blob], "motivation.jpg", { type: "image/jpeg" });

      await tg.showStoryEditor({
        media: [file],
        text: `${isModalOpen.title}\n${isModalOpen.description || ""}`.trim(),
      });

      toast.success("Редактор историй открыт!");
      closeModal();
    } catch (err) {
      console.error("showStoryEditor error:", err);
      toast.error("Не удалось открыть историю");
    }
  };

  // === Fallback: скачать и запостить вручную ===
  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = imageDataUrl;
    a.download = "motivation.jpg";
    a.click();
    toast("Скачано! Открой галерею → поделись в истории");
  };

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          className={styles.modalBackdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
        >
          <motion.div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
          >
            <button onClick={closeModal} className={styles.closeButton}>
              <X size={20} />
            </button>

            <h2 className={styles.modalTitle}>{isModalOpen.title}</h2>

            {isModalOpen.image && (
              <img className={styles.modalImg} src={isModalOpen.image} alt="preview" />
            )}

            {isModalOpen.description && (
              <p className={styles.modalText}>{isModalOpen.description}</p>
            )}

            {imageDataUrl ? (
              <div className={styles.imageWrapper}>
                <img
                  className={styles.modalImCopy}
                  src={imageDataUrl}
                  alt="generated"
                />
                <div className={styles.shareContainer}>
                  <button className={styles.shareButton} onClick={handleShareStory}>
                    Поделиться / История
                  </button>
                  <button
                    className={styles.shareButton}
                    onClick={handleDownload}
                    style={{ marginTop: "8px", fontSize: "14px" }}
                  >
                    Скачать и запостить
                  </button>
                </div>
              </div>
            ) : (
              <button
                className={styles.shareButton}
                onClick={handleGenerate}
                disabled={isLoading}
              >
                {isLoading ? "Создаём..." : "Сгенерировать карточку"}
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalWindowMe;