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
  const tgRef = useRef(typeof window !== "undefined" ? window.Telegram?.WebApp : null);
  const tg = tgRef.current;

  useEffect(() => {
    if (!tg) {
      toast.error("Открой Mini App в Telegram");
      return;
    }

    console.log("=== TELEGRAM DEBUG ===");
    console.log("Version:", tg.version);
    console.log("Platform:", tg.platform);
    console.log("start_param:", tg.initDataUnsafe?.start_param);
    console.log("shareToStory:", typeof tg.shareToStory);
    console.log("showStoryEditor:", typeof tg.showStoryEditor);
    console.log("======================");

    try {
      tg.ready();
      tg.expand();
    } catch (e) {
      console.warn("tg.ready/expand failed", e);
    }
  }, []);

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

  const isHttpUrl = (url) => {
    try {
      const u = new URL(url);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch (e) {
      return false;
    }
  };

  const urlToBlob = async (url) => {
    const resp = await fetch(url);
    return await resp.blob();
  };

  const handleShare = async () => {
    if (!imageDataUrl) return toast.error("Сгенерируй карточку");
    if (!tg) return toast.error("Telegram API не найден");
    try {
      if (typeof tg.shareToStory === "function") {
        let mediaUrl = imageDataUrl;

        if (!isHttpUrl(mediaUrl)) {
          try {
            const blob = await urlToBlob(mediaUrl);
            if (typeof uploadTempUrl === "function") {
              toast("Подготавливаем картинку для Stories...");
              mediaUrl = await uploadTempUrl(blob);
              if (!isHttpUrl(mediaUrl)) {
                throw new Error("uploadTempUrl не вернул публичную ссылку");
              }
            } else {
              throw new Error("Нет публичной ссылки для shareToStory");
            }
          } catch (err) {
            console.warn("Не удалось получить публичную ссылку для shareToStory:", err);
            toast("Нельзя автоматически поделиться — картинку нужно сохранить и загрузить вручную");
            return;
          }
        }

        try {
          const caption = `${isModalOpen.title}\n${isModalOpen.description || ""}`.trim();
          await tg.shareToStory(mediaUrl, { text: caption });
          toast.success("Открылось окно Stories!");
          return;
        } catch (err) {
          console.warn("tg.shareToStory failed:", err);
        }
      }

      if (typeof tg.showStoryEditor === "function") {
        try {
          const response = await fetch(imageDataUrl);
          const blob = await response.blob();
          const file = new File([blob], "achievement.jpg", { type: blob.type || "image/jpeg" });

          await tg.showStoryEditor({
            media: [file],
            text: `${isModalOpen.title}\n${isModalOpen.description || ""}`.trim(),
          });

          toast.success("История открыта!");
          return;
        } catch (err) {
          console.error("showStoryEditor error:", err);
        }
      }
      toast("Истории пока недоступны. Скачиваем карточку...");
      const a = document.createElement("a");
      a.href = imageDataUrl;
      a.download = "achievement.jpg";
      a.click();
      toast.success("Скачано! Открой Telegram → + → История → выбери фото");
    } catch (err) {
      console.error("share error:", err);
      toast.error("Не удалось поделиться в Stories");
    }
  };

  const handleDownload = () => {
    if (!imageDataUrl) return toast.error("Нет картинки");
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
                  <button className={styles.shareButton} onClick={handleShare}>
                    📤 Поделиться / История
                  </button>
                </div>
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
