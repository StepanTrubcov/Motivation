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
      const base64 = response.data?.url;

      if (base64) {
        setImageUrl(base64);
        toast.success("Картинка готова! Удерживайте её, чтобы сохранить или отправить.");
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
            {isModalOpen.image && <img className={styles.modalImg} src={isModalOpen.image} />}
            {isModalOpen.description && (
              <p className={styles.modalText}>{isModalOpen.description}</p>
            )}

            {imageUrl ? (
              <div className={styles.imageWrapper}>
                <img
                  className={styles.modalImCopy}
                  src={imageUrl}
                  alt={isModalOpen.title}
                />
                <p className={styles.shareText}>
                  Чтобы поделиться или сохранить изображение, удерживайте его и выберите соответствующую опцию.
                </p>
              </div>
            ) : (
              <div className={styles.shareContainer} >
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
