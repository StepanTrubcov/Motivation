"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useLanguage } from '@/context/LanguageContext';
import { useTutorial } from '@/context/TutorialContext';
import styles from "./ModalWindowMe.module.css";
import { toast } from "react-hot-toast";
import { generateImage } from "@/lib/api/ImageShare";
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';

const ModalWindowMe = ({
  getMakingPicture,
  isModalOpen,
  closeModal,
  username,
  uploadTempUrl,
}) => {
  const { t } = useLanguage();
  const { currentStep } = useTutorial();
  const tutorialBlockButtons = currentStep?.id === 'achievements-earned-modal';
  const [isLoading, setIsLoading] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const tgRef = useRef(null);

  useEffect(() => {
    tgRef.current = typeof window !== "undefined" ? window.Telegram?.WebApp ?? null : null;

    if (!tgRef.current) {
      toast.error(t('openInTelegram'));
      return;
    }

    const tg = tgRef.current;

    console.log("=== TELEGRAM DEBUG ===");
    console.log("Version:", tg.version);
    console.log("Platform:", tg.platform);
    console.log("shareToStory:", typeof tg.shareToStory);
    console.log("======================");

    try {
      if (typeof tg.ready === "function") tg.ready();
      if (typeof tg.expand === "function") tg.expand();
    } catch (e) {
      console.warn("tg.ready/expand failed", e);
    }
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      setIsLoading(true);
      handleGenerate();
    }
  }, [isModalOpen]);

  const rarityClass = isModalOpen?.active;

  const handleGenerate = async () => {
    if (!isModalOpen?.title) return toast.error(t('noData'));

    setIsLoading(true);
    setImageDataUrl(null);

    try {
      const imageUrl = await generateImage({
        title: isModalOpen.title,
        img: isModalOpen.img,
        points: isModalOpen.points || 0,
        rarityClass: rarityClass,
      });

      setImageDataUrl(imageUrl);
      toast.success(t('cardReady'), {
        style: { background: '#333', color: '#fff', marginTop: '80px', },
      });
    } catch (err) {
      console.error(err);
      toast.error(t('generationError'), {
        style: {
          background: '#333', color: '#fff',
          marginTop: '80px',
        },
      });
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

  const tryShareToStory = async (tg, mediaUrl) => {
    if (typeof tg.shareToStory !== "function") return false;

    const caption = t('shareCaption').trim();

    // Параметры для кнопки-ссылки (widget_link)
    const params = {
      text: caption,
      widget_link: {
        url: "https://t.me/BotMotivation_TG_bot",
        name: t('botName'), // Текст на кнопке
      },
    };

    // Пробуем разные сигнатуры
    try {
      tg.shareToStory(mediaUrl, params);
      return true;
    } catch (e1) {
      console.warn("shareToStory(mediaUrl, params) failed:", e1);
      try {
        tg.shareToStory({ url: mediaUrl, ...params });
        return true;
      } catch (e2) {
        console.warn("shareToStory({url, ...params}) failed:", e2);
        // Фолбэк без widget_link (только caption)
        try {
          tg.shareToStory(mediaUrl, { text: caption });
          return true;
        } catch (e3) {
          console.warn("shareToStory без widget_link failed:", e3);
          return false;
        }
      }
    }
  };

  const handleShare = async () => {
    if (!imageDataUrl) return toast.error(t('generateCard'));

    const tg = tgRef.current;
    if (!tg) return toast.error(t('telegramApiNotFound'));

    try {
      let mediaUrl = imageDataUrl;

      if (!isHttpUrl(mediaUrl)) {
        if (typeof uploadTempUrl === "function") {
          toast(t('preparingImage'));
          const uploaded = await uploadTempUrl(await urlToBlob(mediaUrl));
          if (!uploaded || !isHttpUrl(uploaded)) throw new Error(t('uploadFailed'));
          mediaUrl = uploaded;
        } else {
          throw new Error(t('noUploadTempUrl'));
        }
      }

      const shared = await tryShareToStory(tg, mediaUrl);
      if (shared) {
        toast.success(t('storiesOpened'), {
          style: { background: '#333', color: '#fff', marginTop: '80px', },
        });
        return;
      }

      // Фолбэк на скачивание
      toast(t('storiesUnavailable'));
      const a = document.createElement("a");
      a.href = imageDataUrl;
      a.download = "achievement.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success(t('downloaded'));
    } catch (err) {
      console.error("share error:", err);
      toast.error(t('shareFailed'));
    }
  };

  console.log(imageDataUrl)

  return (
    <AnimatePresence>
      {isModalOpen && (
          <motion.div className={styles.modalBackdrop} onClick={tutorialBlockButtons ? (e) => { e.preventDefault(); e.stopPropagation(); } : closeModal}>
          <motion.div className={styles.modalContent} onClick={(e) => e.stopPropagation()} data-tutorial-id="achievements-earned-modal">
            <button
              type="button"
              onClick={tutorialBlockButtons ? (e) => { e.preventDefault(); e.stopPropagation(); } : closeModal}
              className={styles.closeButton}
              style={tutorialBlockButtons ? { pointerEvents: 'auto', opacity: 0.5, cursor: 'not-allowed' } : undefined}
              aria-disabled={tutorialBlockButtons}
            >
              <X size={24} />
            </button>

            <div className={`${styles.card} ${styles[rarityClass]}`}>
              <div className={styles.cardInner}>
                <div className={styles.imageWrapper} data-tutorial-id="achievements-earned-modal-animation">
                  <img className={styles.img} src={isModalOpen?.gif} alt={isModalOpen?.title} />
                </div>

                <div className={styles.ribbon}>
                  {rarityClass === "common" && <span>{t('common')}</span>}
                  {rarityClass === "rare" && <span>{t('rare')}</span>}
                  {rarityClass == "legendary" && <span>{t('legendary')}</span>}
                  {rarityClass == "epic" && <span>{t('epic')}</span>}
                </div>

                <div className={styles.title}>{isModalOpen?.title}</div>

                <div className={styles.points}>{isModalOpen?.points} {t('pts')}</div>
              </div>
            </div>

            <button
              type="button"
              className={`${styles.howToGet} ${styles[rarityClass]}`}
              onClick={tutorialBlockButtons ? (e) => { e.preventDefault(); e.stopPropagation(); } : handleShare}
              disabled={isLoading}
              style={tutorialBlockButtons ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
              aria-disabled={tutorialBlockButtons}
            >
              {imageDataUrl === null ? (
                <div className={styles.howToGetHeader}>
                  <LoadingSpinner size={18} style={{ marginRight: '10px' }} />
                  {t('generatingImage')}
                </div>
              ) : (
                <div className={styles.howToGetHeader}>{t('shareStory')}</div>
              )}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalWindowMe;