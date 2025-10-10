// ModalWindowMe.jsx
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import styles from "./ModalWindowMe.module.css";
import { toast } from "react-hot-toast";

/**
 * Props:
 *  - getMakingPicture(isModalOpen, username) -> axios response (response.data.url = base64 image)
 *  - isModalOpen - объект достижения или false/null
 *  - closeModal() - закрыть модалку
 *  - username - имя пользователя для генерации
 */
const ModalWindowMe = ({ getMakingPicture, isModalOpen, closeModal, username }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const newWindowRef = useRef(null);

  const handleGenerate = async () => {
    if (!isModalOpen?.title) return;
    setIsLoading(true);
    setImageUrl(null);

    // Открываем пустую вкладку синхронно (чтобы не заблокировал pop-up)
    try {
      newWindowRef.current = window.open("", "_blank");
    } catch (err) {
      newWindowRef.current = null;
    }

    try {
      const response = await getMakingPicture(isModalOpen, username);
      const base64 = response?.data?.url;

      if (!base64) {
        toast.error("Сервер вернул пустой результат.");
        // Закрываем пустую вкладку если открыли
        if (newWindowRef.current && !newWindowRef.current.closed) newWindowRef.current.close();
        return;
      }

      setImageUrl(base64);
      toast.success("Картинка готова — открываю в новой вкладке...");

      // Если удалось открыть пустую вкладку — загружаем в неё картинку
      if (newWindowRef.current && !newWindowRef.current.closed) {
        try {
          // Попытка перенаправить location на data:url
          newWindowRef.current.location.href = base64;
        } catch (err) {
          // Некоторым браузерам запрещено устанавливать location на data:
          // в таком случае вставим html с тегом img
          try {
            newWindowRef.current.document.write(`
              <html>
                <head><title>Achievement</title></head>
                <body style="margin:0;display:flex;align-items:center;justify-content:center;background:#0b0b0b;">
                  <img src="${base64}" style="max-width:100%;height:auto;display:block" />
                </body>
              </html>
            `);
            newWindowRef.current.document.close();
          } catch (err2) {
            // Если и это не удалось — закроем вкладку и уведомим пользователя
            console.warn("Не удалось вставить картинку в новую вкладку:", err2);
            if (newWindowRef.current && !newWindowRef.current.closed) newWindowRef.current.close();
            toast("Попап/вкладка заблокирована. Нажмите «Открыть изображение», чтобы открыть картинку вручную.", { icon: "⚠️" });
          }
        }
      } else {
        // Попап заблокирован — уведомляем пользователя и показываем превью в модалке
        toast("Попап заблокирован — откройте картинку вручную (кнопка ниже).", { icon: "⚠️" });
      }
    } catch (err) {
      console.error("Ошибка при создании карточки:", err);
      toast.error("Не удалось создать карточку. Попробуй позже.");
      if (newWindowRef.current && !newWindowRef.current.closed) newWindowRef.current.close();
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenImage = () => {
    if (!imageUrl) {
      toast.error("Сначала сгенерируйте изображение");
      return;
    }
    window.open(imageUrl, "_blank");
  };

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          className={styles.modalBackdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={closeModal}
        >
          <motion.div
            className={styles.modalContent}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
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
              <img className={styles.modalImg} src={isModalOpen.image} alt={isModalOpen.title} />
            )}

            {isModalOpen.description && (
              <p className={styles.modalText}>{isModalOpen.description}</p>
            )}

            {imageUrl ? (
              <div className={styles.imageWrapper}>
                <img className={styles.modalImCopy} src={imageUrl} alt={isModalOpen.title} />
                <div className={styles.shareContainer}>
                  <button className={styles.shareButton} onClick={handleOpenImage}>
                    🔗 Открыть изображение
                  </button>
                </div>
                <p className={styles.shareText}>
                  Откройте картинку в новой вкладке и удерживайте, чтобы сохранить в галерею.
                </p>
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
