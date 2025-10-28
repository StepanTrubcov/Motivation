"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import styles from "./ModalWindowMe.module.css";
import { toast } from "react-hot-toast";

const ModalWindowMe = ({
  getMakingPicture,
  isModalOpen,
  closeModal,
  username,
  uploadTempUrl,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState(null);

  const tg = typeof window !== "undefined" ? window.Telegram?.WebApp : null;

  const handleGenerate = async () => {
    if (!isModalOpen?.title) return toast.error("Нет данных для генерации");

    setIsLoading(true);
    setImageDataUrl(null);

    try {
      console.log(isModalOpen, username)
      const res = await getMakingPicture(isModalOpen, username);
      const dataUrl = res?.data?.url;
      console.log(res?.data)
      if (!dataUrl) throw new Error("Пустой ответ от сервера");

      setImageDataUrl(dataUrl);
      toast.success("✨ Картинка готова!");
    } catch (err) {
      console.error("Ошибка генерации:", err);
      toast.error("Ошибка генерации картинки 😔");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenImage = async () => {
    if (!imageDataUrl) return toast.error("Сначала сгенерируйте карточку");

    // Проверяем, доступен ли Telegram WebApp API
    if (tg && typeof tg.showStoryEditor === "function") {
      try {
        // Конвертируем base64 URL в Blob
        const response = await fetch(imageDataUrl);
        const blob = await response.blob();

        // Показываем редактор истории Telegram
        await tg.showStoryEditor({
          media: [blob],
          caption: `${isModalOpen.title}\n${isModalOpen.description || ""}`,
        });

        toast.success("История открыта в Telegram 🎉");
        return;
      } catch (err) {
        console.error("Ошибка showStoryEditor:", err);
        toast.error("Не удалось открыть редактор истории 😔");
      }
    } else {
      // Fallback: Telegram WebApp недоступен
      window.open(imageDataUrl, "_blank");
      toast(
        "📸 Открыл изображение. Сохраните его и загрузите в историю Telegram вручную.",
        { duration: 5000 }
      );
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
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={closeModal}
              className={styles.closeButton}
              aria-label="Закрыть модальное окно"
            >
              <X size={20} />
            </button>

            <h2 className={styles.modalTitle}>{isModalOpen.title}</h2>

            {isModalOpen.image && (
              <img
                className={styles.modalImg}
                src={isModalOpen.image}
                alt={isModalOpen.title}
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
                  alt={isModalOpen.title}
                />
                <div className={styles.shareContainer}>
                  <button className={styles.shareButton} onClick={handleOpenImage}>
                    📤 Поделиться / История
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.shareContainer}>
                <button
                  className={styles.shareButton}
                  onClick={handleGenerate}
                  disabled={isLoading}
                >
                  {isLoading ? "Создание..." : "✨ Сгенерировать карточку"}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalWindowMe;
