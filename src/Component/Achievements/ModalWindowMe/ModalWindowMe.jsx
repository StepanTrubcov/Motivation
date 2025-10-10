import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import styles from "./ModalWindowMe.module.css";
import { toast } from "react-hot-toast";

const ModalWindowMe = ({ getMakingPicture, isModalOpen, closeModal, username }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  const handleGenerate = async () => {
    if (!isModalOpen?.title) return;
    setIsLoading(true);

    try {
      const response = await getMakingPicture(isModalOpen, username);
      const url = response.data?.url;

      if (url) {
        setImageUrl(url);
        toast.success("Картинка готова!");
      } else {
        toast.error("Ошибка при создании карточки 😔");
      }
    } catch (err) {
      console.error("Ошибка при создании карточки:", err);
      toast.error("Не удалось создать карточку 😔");
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для отправки изображения в Telegram
  const handleShareToTelegram = async () => {
    if (!imageUrl) return;

    try {
      // Проверяем наличие Telegram Web Apps API
      if (!window.Telegram?.WebApp) {
        toast.error("Это приложение не работает в Telegram 😔");
        return;
      }

      const telegram = window.Telegram.WebApp;

      // Предполагаем, что imageUrl - это публичный URL
      // Если imageUrl - это base64, нужно сначала загрузить на сервер
      const isBase64 = imageUrl.startsWith("data:image");
      let imageUrlForSharing = imageUrl;

      if (isBase64) {
        // Загружаем base64 на сервер для получения публичного URL
        // Это пример, замените на реальный API-вызов
        const formData = new FormData();
        const blob = await fetch(imageUrl).then((res) => res.blob());
        formData.append("image", blob, "shared_image.png");

        const uploadResponse = await fetch("/upload-image", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadResponse.json();
        imageUrlForSharing = uploadData.url; // Публичный URL от сервера
      }

      // Открываем Telegram с предзаполненным сообщением
      telegram.openTelegramLink(
        `https://t.me/share/url?url=${encodeURIComponent(imageUrlForSharing)}&text=${encodeURIComponent(
          isModalOpen.title || "Посмотрите это изображение!"
        )}`
      );

      toast.success("Открыт диалог для отправки в Telegram!");
    } catch (err) {
      console.error("Ошибка при отправке в Telegram:", err);
      toast.error("Не удалось поделиться изображением 😔");
    }
  };

  const handleCopyImage = async () => {
    if (!imageUrl) return;
    try {
      const blob = await fetch(imageUrl).then((res) => res.blob());
      const item = new ClipboardItem({ [blob.type]: blob });
      await navigator.clipboard.write([item]);
      toast.success("✅ Изображение скопировано!");
    } catch (err) {
      console.error("Ошибка при копировании:", err);
      toast.error("Не удалось скопировать изображение 😔");
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
          transition={{ duration: 0.3 }}
          onClick={closeModal}
        >
          <motion.div
            className={styles.modalContent}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className={styles.closeButton}
              aria-label="Закрыть модальное окно"
            >
              <X size={24} />
            </button>

            <h2 className={styles.modalTitle}>{isModalOpen.title}</h2>
            {isModalOpen.image && <img className={styles.modalImg} src={isModalOpen.image} alt="" />}
            {isModalOpen.description && (
              <p className={styles.modalText}>{isModalOpen.description}</p>
            )}

            {imageUrl ? (
              <div className={styles.imageWrapper}>
                <img className={styles.modalImCopy} src={imageUrl} alt={isModalOpen.title} />
                <div className={styles.shareContainer}>
                  <button className={styles.shareButton} onClick={handleShareToTelegram}>
                    📤 Поделиться в Telegram
                  </button>
                  <button className={styles.shareButton} onClick={handleCopyImage}>
                    📋 Скопировать изображение
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
                  {isLoading ? "Создание..." : "Поделиться"}
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