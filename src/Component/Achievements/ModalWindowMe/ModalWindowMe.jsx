import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2 } from "lucide-react";
import axios from "axios";
import styles from "./ModalWindowMe.module.css";
import { toast } from "react-hot-toast";

const ModalWindowMe = ({ getMakingPicture, isModalOpen, closeModal, username }) => {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (!isModalOpen?.title) return;
    setIsSharing(true);

    try {
      const response = await getMakingPicture(isModalOpen, username)
      const base64 = response.data?.url;

      if (base64) {
        const blob = await fetch(base64).then(res => res.blob());
        const clipboardItem = new ClipboardItem({ [blob.type]: blob });
        await navigator.clipboard.write([clipboardItem]);
        toast.success("📋 Изображение скопировано!");
      } else {
        toast.success("Ошибка при создании карточки 😔");

      }
    } catch (err) {
      console.error("Ошибка при создании share-карточки:", err);
      alert("Не удалось создать карточку достижения 😔");
    } finally {
      setIsSharing(false);
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
              <button onClick={handleShare} className={styles.shareButton} disabled={isSharing}>
                <Share2 size={18} />
                {isSharing ? "Создание..." : "Поделиться"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalWindowMe;
