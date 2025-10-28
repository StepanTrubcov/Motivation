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

  // Проверка Telegram API
  useEffect(() => {
    if (!tg) {
      toast.error("❌ Открой Mini App внутри Telegram");
    } else {
      tg.ready();
      tg.expand();
    }
  }, [tg]);

  // Генерация картинки
  const handleGenerate = async () => {
    if (!isModalOpen?.title) return toast.error("Нет данных");

    setIsLoading(true);
    setImageDataUrl(null);

    try {
      const res = await getMakingPicture(isModalOpen, username);
      const dataUrl = res?.data?.url;
      if (!dataUrl) throw new Error("Нет картинки");

      setImageDataUrl(dataUrl);
      toast.success("✨ Карточка готова!");
    } catch (err) {
      console.error(err);
      toast.error("Ошибка генерации 😔");
    } finally {
      setIsLoading(false);
    }
  };

  // Открытие редактора историй
  const handleShareStory = async () => {
    if (!imageDataUrl) return toast.error("Сначала сгенерируй карточку");

    if (!tg) return toast.error("Telegram API не найден");

    if (typeof tg.showStoryEditor !== "function") {
      toast.error("Обнови Telegram — истории пока недоступны");
      return;
    }

    try {
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();

      const file = new File([blob], "story.jpg", { type: "image/jpeg" });

      await tg.showStoryEditor({
        media: [file],
        text: `${isModalOpen.title}\n${isModalOpen.description || ""}`.trim(),
      });

      toast.success("Редактор историй открыт!");
      closeModal(); // опционально
    } catch (err) {
      console.error("Ошибка showStoryEditor:", err);
      toast.error("Не удалось открыть историю 😔");
    }
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
              <img
                className={styles.modalImg}
                src={isModalOpen.image}
                alt="preview"
              />
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
                <button
                  className={styles.shareButton}
                  onClick={handleShareStory}
                >
                  📤 Поделиться / История
                </button>
              </div>
            ) : (
              <button
                className={styles.shareButton}
                onClick={handleGenerate}
                disabled={isLoading}
              >
                {isLoading ? "Создаём..." : "✨ Сгенерировать карточку"}
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalWindowMe;