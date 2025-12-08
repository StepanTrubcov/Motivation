"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import styles from "./ModalWindowMe.module.css";
import { toast } from "react-hot-toast";
import { generateImage } from "@/lib/api/ImageShare";

const ModalWindowMe = ({
  getMakingPicture,
  isModalOpen,
  closeModal,
  username,
  uploadTempUrl,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState(null);
  // храним ref, но будем всегда брать актуальное значение window.Telegram.WebApp перед каждым вызовом
  const tgRef = useRef(null);

  useEffect(() => {
    // устанавливаем ссылку на WebApp, если он появился
    tgRef.current = typeof window !== "undefined" ? window.Telegram?.WebApp ?? null : null;

    if (!tgRef.current) {
      toast.error("Открой Mini App в Telegram");
      return;
    }

    const tg = tgRef.current;

    console.log("=== TELEGRAM DEBUG ===");
    console.log("Version:", tg.version);
    console.log("Platform:", tg.platform);
    console.log("start_param:", tg.initDataUnsafe?.start_param);
    console.log("shareToStory:", typeof tg.shareToStory);
    console.log("showStoryEditor:", typeof tg.showStoryEditor);
    console.log("======================");

    try {
      if (typeof tg.ready === "function") tg.ready();
      if (typeof tg.expand === "function") tg.expand();
    } catch (e) {
      console.warn("tg.ready/expand failed", e);
    }
  }, []);

  const handleGenerate = async () => {
    if (!isModalOpen?.title) return toast.error("Нет данных");

    setIsLoading(true);
    setImageDataUrl(null);

    try {
      // Используем новую функцию для генерации изображения
      const imageUrl = await generateImage({
        title: isModalOpen.title,
        description: isModalOpen.description,
        username: username,
        points: isModalOpen.points || 0
      });

      setImageDataUrl(imageUrl); // Сохраняем прямую ссылку на изображение
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
    if (!resp.ok) throw new Error(`Fetch failed: ${resp.status}`);
    return await resp.blob();
  };

  // Универсальный попытка-вызвать shareToStory с разными сигнатурами
  const tryShareToStory = async (tg, mediaUrl, caption) => {
    // 1) старый/популярный вариант: (mediaUrl, options)
    if (typeof tg.shareToStory === "function") {
      try {
        // сначала пробуем наиболее простой вариант
        await tg.shareToStory(mediaUrl, { text: caption });
        return true;
      } catch (e1) {
        console.warn("shareToStory(mediaUrl, options) failed:", e1);
        // затем пробуем объектную сигнатуру
        try {
          await tg.shareToStory({ url: mediaUrl, text: caption });
          return true;
        } catch (e2) {
          console.warn("shareToStory({url, text}) failed:", e2);
          // ещё пробуем background (в некоторых клиентах)
          try {
            await tg.shareToStory({ background: mediaUrl, text: caption });
            return true;
          } catch (e3) {
            console.warn("shareToStory({background, text}) failed:", e3);
            // не удалось
            return false;
          }
        }
      }
    }
    return false;
  };

  const handleShare = async () => {
    if (!imageDataUrl) return toast.error("Сгенерируй карточку");

    // всегда берём актуальную ссылку на WebApp
    const tg = typeof window !== "undefined" ? window.Telegram?.WebApp ?? null : null;
    if (!tg) return toast.error("Telegram API не найден");

    try {
      let mediaUrl = imageDataUrl;

      // если у нас не публичная ссылка — нужно загрузить blob куда-то (uploadTempUrl)
      if (!isHttpUrl(mediaUrl)) {
        try {
          const blob = await urlToBlob(mediaUrl);
          if (typeof uploadTempUrl === "function") {
            toast("Подготавливаем картинку для Stories...");
            const uploaded = await uploadTempUrl(blob);
            if (!uploaded || !isHttpUrl(uploaded)) {
              throw new Error("uploadTempUrl не вернул публичную ссылку");
            }
            mediaUrl = uploaded;
          } else {
            throw new Error("Нет uploadTempUrl для получения публичной ссылки");
          }
        } catch (err) {
          console.warn("Не удалось получить публичную ссылку для shareToStory:", err);
          toast("Нельзя автоматически поделиться — картинку нужно сохранить и загрузить вручную");
          return;
        }
      }

      // Создаем caption с правильной кодировкой для отображения в Telegram
      let caption = "";
      try {
        // Для новых URL с ID мы не можем извлечь параметры из URL
        // Поэтому используем оригинальные значения из isModalOpen
        caption = `${isModalOpen.title}\n${isModalOpen.description || ""}\n @BotMotivation_TG_bot`.trim();
      } catch (decodeError) {
        // Если возникла ошибка, используем оригинальные значения
        console.warn("Ошибка создания caption:", decodeError);
        caption = `${isModalOpen.title}\n${isModalOpen.description || ""}\n @BotMotivation_TG_bot`.trim();
      }

      // 1) Попытка: tg.shareToStory (несколько сигнатур)
      const shared = await tryShareToStory(tg, mediaUrl, caption);
      if (shared) {
        toast.success("Открылось окно Stories!");
        return;
      }

      // 2) Попытка: tg.showStoryEditor (если доступен и умеет принимать File)
      if (typeof tg.showStoryEditor === "function") {
        try {
          // Получаем blob (если mediaUrl — публичный http)
          const resp = await fetch(mediaUrl);
          if (!resp.ok) throw new Error("Не удалось скачать изображение для editor");
          const blob = await resp.blob();
          // File-конструктор может не существовать в некоторых окружениях, но в браузерах обычно есть
          const file = new File([blob], "achievement.png", { type: blob.type || "image/png" });

          await tg.showStoryEditor({
            media: [file],
            text: caption,
          });
          toast.success("История открыта!");
          return;
        } catch (err) {
          console.warn("showStoryEditor failed:", err);
          // fallthrough на скачивание
        }
      }

      // 3) Фолбэк: скачать картинку и подсказать пользователю
      toast("Истории пока недоступны. Скачиваем карточку...");
      const a = document.createElement("a");
      a.href = imageDataUrl;
      a.download = "achievement.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
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
    a.download = "achievement.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
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
                  <button
                    className={styles.shareButton}
                    onClick={handleDownload}
                    style={{ marginLeft: 8 }}
                  >
                    ⤓ Скачать
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
