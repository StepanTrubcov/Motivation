import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2 } from "lucide-react";
import axios from "axios";
import styles from "./ModalWindowMe.module.css";

const ModalWindowMe = ({ isModalOpen, addNewStatus, buttonText, closeModal, username }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareImage, setShareImage] = useState(null);

  const handleShare = async () => {
    if (!isModalOpen?.title) return;
    setIsSharing(true);
    setShareImage(null);

    try {
      const response = await axios.post("http://localhost:5002/api/achievement/share", {
        title: isModalOpen.title,
        description: isModalOpen.description,
        points: isModalOpen.points || 0,
        username: username || "user",
      });

      if (response.data?.url) {
        setShareImage(response.data.url);

        // ⚡ Если Telegram WebApp открыт
        if (window.Telegram?.WebApp) {
          // Тут мы можем показать картинку и кнопку "Отправить в Telegram"
          window.Telegram.WebApp.showAlert("Картинка готова! Нажмите 'Отправить' ниже 👇");
        } else {
          // Просто показать в браузере
          alert("Картинка сгенерирована ✅");
        }
      } else {
        alert("Ошибка при создании карточки 😔");
      }
    } catch (err) {
      console.error("Ошибка при создании share-карточки:", err);
      alert("Не удалось создать карточку достижения 😔");
    } finally {
      setIsSharing(false);
    }
  };

  // 🟢 Эта функция потом отправит изображение через твой Telegram-бот API
  const sendToTelegram = async () => {
    try {
      if (!shareImage) return;
      await axios.post("https://motivationserver.onrender.com/api/telegram/send-image", {
        imageBase64: shareImage,
        caption: `🏆 ${isModalOpen.title}\n${isModalOpen.description}`,
      });
      alert("Изображение отправлено в Telegram 📩");
    } catch (err) {
      console.error("Ошибка при отправке в Telegram:", err);
      alert("Не удалось отправить в Telegram 😔");
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
            <button onClick={closeModal} className={styles.closeButton} aria-label="Close modal">
              <X size={24} />
            </button>

            <h2 className={styles.modalTitle}>{isModalOpen.title}</h2>

            {isModalOpen.image && <img className={styles.modalImg} src={isModalOpen.image} />}

            <p className={styles.modalText}>{isModalOpen.description}</p>

            <div className={styles.buttonsRow}>
              <button onClick={addNewStatus} className={styles.actionButton}>
                {buttonText}
              </button>

              <button onClick={handleShare} className={styles.shareButton} disabled={isSharing}>
                <Share2 size={18} />
                {isSharing ? "Создание..." : "Поделиться"}
              </button>
            </div>

            {shareImage && (
              <div className={styles.sharePreview}>
                <img src={shareImage} alt="achievement" className={styles.shareImg} />
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalWindowMe;
