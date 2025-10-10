import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import styles from "./ModalWindowMe.module.css";
import { toast } from "react-hot-toast";

const ModalWindowMe = ({ getMakingPicture, isModalOpen, closeModal, username }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  // Функция для генерации изображения
  const handleGenerate = async () => {
    if (!isModalOpen?.title) {
      toast.error("Отсутствует заголовок карточки 😔");
      return;
    }
    setIsLoading(true);

    try {
      const response = await getMakingPicture(isModalOpen, username);
      const url = response.data?.url;

      if (url) {
        setImageUrl(url);
        toast.success("Картинка готова!");
      } else {
        toast.error("Ошибка при создании карточки: пустой URL 😔");
      }
    } catch (err) {
      console.error("Ошибка при создании карточки:", err);
      toast.error("Не удалось создать карточку 😔");
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для конвертации base64 в Blob
  const base64ToBlob = (base64) => {
    try {
      const byteString = atob(base64.split(",")[1]);
      const mimeString = base64.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], { type: mimeString });
    } catch (err) {
      console.error("Ошибка при конвертации base64:", err);
      throw new Error("Неверный формат base64");
    }
  };

  // Функция для скачивания изображения
  const handleDownloadImage = () => {
    if (!imageUrl) {
      toast.error("Изображение отсутствует 😔");
      return;
    }

    try {
      let fileUrl;
      let blob;

      if (imageUrl.startsWith("data:image")) {
        // Конвертируем base64 в Blob
        blob = base64ToBlob(imageUrl);
        fileUrl = URL.createObjectURL(blob);
      } else {
        // Если imageUrl — публичный URL
        fileUrl = imageUrl;
      }

      // Создаем ссылку для скачивания
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = `image_${Date.now()}.png`; // Уникальное имя файла
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Освобождаем URL, если использовался Blob
      if (imageUrl.startsWith("data:image")) {
        URL.revokeObjectURL(fileUrl);
      }

      toast.success("Изображение скачано! Откройте его в Telegram для отправки.");
    } catch (err) {
      console.error("Ошибка при скачивании изображения:", err);
      toast.error("Не удалось скачать изображение 😔");
    }
  };

  // Функция для копирования изображения (оставлена для совместимости)
  const handleCopyImage = async () => {
    if (!imageUrl) {
      toast.error("Изображение отсутствует 😔");
      return;
    }

    try {
      const blob = imageUrl.startsWith("data:image")
        ? base64ToBlob(imageUrl)
        : await fetch(imageUrl).then((res) => {
            if (!res.ok) throw new Error("Ошибка загрузки изображения");
            return res.blob();
          });
      const item = new ClipboardItem({ [blob.type]: blob });
      await navigator.clipboard.write([item]);
      toast.success("✅ Изображение скопировано!");
    } catch (err) {
      console.error("Ошибка при копировании:", err);
      toast.error("Не удалось скопировать изображение 😔 (попробуйте скачать)");
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
                  <button className={styles.shareButton} onClick={handleDownloadImage}>
                    📥 Скачать изображение
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
                  {isLoading ? "Создание..." : "Сгенерировать"}
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