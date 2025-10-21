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
      const res = await getMakingPicture(isModalOpen, username);
      const dataUrl = res?.data?.url;

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

    try {
      if (tg && typeof tg.showStoryEditor === "function") {
        const blob = await (await fetch(imageDataUrl)).blob();

        await tg.showStoryEditor({
          files: [blob],
          caption: `${isModalOpen.title}\n${isModalOpen.description || ""}`,
        });

        toast.success("Открыл редактор истории Telegram 🎉");
        return;
      }
    } catch (err) {
      console.warn("showStoryEditor недоступен или ошибка:", err);
    }

    try {
      let publicUrl = imageDataUrl;

      if (uploadTempUrl && imageDataUrl.startsWith("data:")) {
        const uploadRes = await fetch(uploadTempUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: imageDataUrl }),
        });

        const json = await uploadRes.json();
        if (json?.url) publicUrl = json.url;
      }

      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
        publicUrl
      )}&text=${encodeURIComponent(
        `${isModalOpen.title}\n${isModalOpen.description || ""}`
      )}`;
      if (tg && typeof tg.openTelegramLink === "function") {
        tg.openTelegramLink(shareUrl);
      } else {
        window.open(shareUrl, "_blank");
      }

      toast.success("Открыл Telegram для публикации 🎉");
      return;
    } catch (err) {
      console.warn("Ошибка при Telegram share:", err);
    }
    try {
      window.open(imageDataUrl, "_blank");
      toast("Открыл изображение. Удерживайте, чтобы сохранить 📸");
    } catch (err) {
      console.error("Ошибка открытия:", err);
      toast.error("Не удалось открыть изображение 😔");
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
