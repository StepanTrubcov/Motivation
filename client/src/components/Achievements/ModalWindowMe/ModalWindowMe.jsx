"use client";
import React, { useState, useEffect, useRef } from "react";
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

  const tg = useRef(
    typeof window !== "undefined" ? window.Telegram?.WebApp : null
  ).current;

  useEffect(() => {
    if (!tg) {
      toast.error("Открой Mini App в Telegram");
      return;
    }

    console.log("=== TELEGRAM DEBUG ===");
    console.log("Version:", tg.version);
    console.log("Platform:", tg.platform);
    console.log("start_param:", tg.initDataUnsafe?.start_param);
    console.log("showStoryEditor:", typeof tg.showStoryEditor);
    console.log("======================");

    tg.ready();
    tg.expand();
  }, [tg]);

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
      console.error(err);
      toast.error("Ошибка генерации");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenImage = async () => {
    if (!imageDataUrl) return toast.error("Сгенерируй карточку");
    if (!tg) return toast.error("Telegram API не найден");

    if (typeof tg.showStoryEditor !== "function") {
      toast("Истории пока недоступны. Ждём включения от Telegram...");
      return;
    }

    try {
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      const file = new File([blob], "achievement.jpg", { type: "image/jpeg" });

      await tg.showStoryEditor({
        media: [file],
        text: `${isModalOpen.title}\n${isModalOpen.description || ""}`.trim(),
      });

      toast.success("История открыта!");
    } catch (err) {
      console.error(err);
      toast.error("Ошибка отправки");
    }
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = imageDataUrl;
    a.download = "achievement.jpg";
    a.click();
    toast("Скачано! Запости вручную");
  };

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div className={styles.modalBackdrop} onClick={closeModal}>
          <motion.div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={closeModal} className={styles.closeButton}>
              <X size={20} />
            </button>

            <h2 className={styles.modalTitle}>{isModalOpen.title}</h2>

            {isModalOpen.image && (
              <img className={styles.modalImg} src={isModalOpen.image} alt="" />
            )}

            {isModalOpen.description && (
              <p className={styles.modalText}>{isModalOpen.description}</p>
            )}

            {imageDataUrl ? (
              <div className={styles.imageWrapper}>
                <img className={styles.modalImCopy} src={imageDataUrl} alt="" />
                <div className={styles.shareContainer}>
                  <button className={styles.shareButton} onClick={handleOpenImage}>
                    Поделиться / История
                  </button>
                  <button
                    className={styles.shareButton}
                    onClick={handleDownload}
                    style={{ marginTop: "8px", fontSize: "14px" }}
                  >
                    Скачать
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