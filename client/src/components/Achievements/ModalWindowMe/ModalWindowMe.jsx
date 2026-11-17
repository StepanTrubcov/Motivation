"use client";
import AchievementImage from '../AchievementImage';
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2, Download } from "lucide-react";
import { useLanguage } from '@/context/LanguageContext';
import { useTutorial } from '@/context/TutorialContext';
import styles from "./ModalWindowMe.module.css";
import { notifications as toast } from "@/lib/notifications";
import { generateImage } from "@/lib/api/ImageShare";
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';

const ModalWindowMe = ({
  getMakingPicture,
  isModalOpen,
  closeModal,
  username,
  uploadTempUrl,
}) => {
  const { t, language } = useLanguage();
  const { currentStep, isOpen: isTutorialOpen } = useTutorial();
  const tutorialBlockButtons = isTutorialOpen && currentStep?.id === 'achievements-earned-modal';
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const tgRef = useRef(null);
  const generationVersion = useRef(0);

  useEffect(() => {
    tgRef.current = typeof window !== "undefined" ? window.Telegram?.WebApp ?? null : null;

    if (!tgRef.current) {
      toast.error(t('openInTelegram'));
      return;
    }

    const tg = tgRef.current;

    try {
      if (typeof tg.ready === "function") tg.ready();
      if (typeof tg.expand === "function") tg.expand();
    } catch (e) {
      console.warn("tg.ready/expand failed", e);
    }
  }, []);

  useEffect(() => {
    generationVersion.current++;
    if (!isModalOpen || tutorialBlockButtons) {
      setImageDataUrl(null);
      setIsLoading(false);
      return;
    }
    const controller = new AbortController();
    handleGenerate(controller.signal);
    return () => { generationVersion.current++; controller.abort(); };
  }, [isModalOpen, tutorialBlockButtons, language]);

  const rarityClass = isModalOpen?.active;
  const rarityLabel = language === 'ru'
    ? ({ common: 'Обычная', rare: 'Редкая', legendary: 'Легендарная', epic: 'Эпическая' }[rarityClass] || '')
    : t(rarityClass || 'common');
  const earnedDate = isModalOpen?.earnedAt
    ? new Date(isModalOpen.earnedAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' })
    : '';

  const handleGenerate = async (signal) => {
    if (!isModalOpen?.title) return toast.error(t('noData'));
    const notice = toast.begin(t('generating'));
    const cancelNotice = () => notice.cancel();
    signal.addEventListener('abort', cancelNotice, { once: true });
    setIsLoading(true);
    setImageDataUrl(null);

    try {
      const imageUrl = await generateImage({
        title: isModalOpen.title,
        description: isModalOpen.description || '',
        earnedAt: isModalOpen.earnedAt,
        img: isModalOpen.img,
        rarityClass: rarityClass,
        language,
      }, { signal });

      if (signal.aborted) return;
      setImageDataUrl(imageUrl);
      notice.success(t('cardReady'), {
        style: { background: '#333', color: '#fff', marginTop: '80px', },
      });
    } catch (err) {
      if (signal.aborted) return;
      console.error(err);
      notice.error(t('generationError'), {
        style: {
          background: '#333', color: '#fff',
          marginTop: '80px',
        },
      });
    } finally {
      signal.removeEventListener('abort', cancelNotice);
      if (!signal.aborted) setIsLoading(false);
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

  const regenerateForAction = async () => {
    const version = generationVersion.current;
    const url = await generateImage({ title: isModalOpen.title, description: isModalOpen.description || '',
      earnedAt: isModalOpen.earnedAt, img: isModalOpen.img, rarityClass, language });
    if (version === generationVersion.current) setImageDataUrl(url);
    return url;
  };

  const urlToBlob = async (url, allowRefresh = true) => {
    const resp = await fetch(url);
    if (resp.status === 404 && allowRefresh && url === imageDataUrl) {
      return urlToBlob(await regenerateForAction(), false);
    }
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
    if (tutorialBlockButtons) return;
    if (!imageDataUrl) return toast.error(t('generateCard'));

    const tg = tgRef.current;
    if (!tg) return toast.error(t('telegramApiNotFound'));

    const notice = toast.begin(t('preparingImage'));
    try {
      let mediaUrl = imageDataUrl;
      if (isHttpUrl(mediaUrl)) {
        const response = await fetch(mediaUrl, { method: 'HEAD', cache: 'no-store' });
        if (response.status === 404) mediaUrl = await regenerateForAction();
        else if (!response.ok) throw new Error(`Image unavailable: ${response.status}`);
      }

      if (!isHttpUrl(mediaUrl)) {
        if (typeof uploadTempUrl === "function") {
          const uploaded = await uploadTempUrl(await urlToBlob(mediaUrl));
          if (!uploaded || !isHttpUrl(uploaded)) throw new Error(t('uploadFailed'));
          mediaUrl = uploaded;
        } else {
          throw new Error(t('noUploadTempUrl'));
        }
      }

      const shared = await tryShareToStory(tg, mediaUrl);
      if (shared) {
        notice.success(t('storiesOpened'), {
          style: { background: '#333', color: '#fff', marginTop: '80px', },
        });
        return;
      }

      // Фолбэк на скачивание
      const a = document.createElement("a");
      a.href = imageDataUrl;
      a.download = "achievement.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      notice.success(t('downloaded'));
    } catch (err) {
      console.error("share error:", err);
      notice.error(t('shareFailed'));
    }
  };

  const handleDownload = async () => {
    if (tutorialBlockButtons) return;
    if (!imageDataUrl || isDownloading) return;
    const notice = toast.begin(t('preparingImage'));
    setIsDownloading(true);
    try {
      const blob = await urlToBlob(imageDataUrl);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'achievement.png';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      notice.success(t('downloaded'));
    } catch (error) {
      console.error('Achievement download failed', error);
      notice.error(language === 'ru' ? 'Не удалось скачать картинку' : 'Could not download the image');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div className={styles.modalBackdrop} onClick={tutorialBlockButtons ? (e) => { e.preventDefault(); e.stopPropagation(); } : closeModal}>
          <motion.div initial={{ y: 48 }} animate={{ y: 0 }} exit={{ y: 48 }} transition={{ duration: 0.22 }} role="dialog" aria-modal="true" aria-label={isModalOpen.title} className={`${styles.modalContent} ${styles[rarityClass]}`} onClick={(e) => e.stopPropagation()} data-tutorial-id="achievements-earned-modal">
            <div className={styles.handle} aria-hidden="true" />
            <button
              type="button"
              aria-label={language === 'ru' ? 'Закрыть' : 'Close'}
              onClick={tutorialBlockButtons ? (e) => { e.preventDefault(); e.stopPropagation(); } : closeModal}
              className={styles.closeButton}
              style={tutorialBlockButtons ? { pointerEvents: 'auto', opacity: 0.5, cursor: 'not-allowed' } : undefined}
              aria-disabled={tutorialBlockButtons}
              disabled={tutorialBlockButtons}
            >
              <X size={24} />
            </button>

            <div className={`${styles.card} ${styles[rarityClass]}`}>
              <div className={styles.cardInner}>
                <div className={styles.imageWrapper} data-tutorial-id="achievements-earned-modal-animation">
                  <AchievementImage className={styles.img} image={isModalOpen?.img} alt={isModalOpen?.title} />
                </div>

                <div className={styles.title}>{isModalOpen?.title}</div>
                <div className={styles.metadata}>
                  <span className={styles.rarityChip}>{rarityLabel}</span>
                  {earnedDate && <><span aria-hidden="true">·</span><time>{earnedDate}</time></>}
                </div>

              </div>
            </div>

            <div className={styles.actions}>
            <button
              type="button"
              className={`${styles.howToGet} ${styles[rarityClass]}`}
              onClick={tutorialBlockButtons ? (e) => { e.preventDefault(); e.stopPropagation(); } : handleShare}
              disabled={tutorialBlockButtons || isLoading || !imageDataUrl}
              style={tutorialBlockButtons ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
              aria-disabled={tutorialBlockButtons}
            >
              {imageDataUrl === null && !tutorialBlockButtons ? (
                <div className={styles.howToGetHeader}>
                  <LoadingSpinner size={18} style={{ marginRight: '10px' }} />
                  {t('generatingImage')}
                </div>
              ) : (
                <div className={styles.howToGetHeader}><Share2 size={20} /><span>{language === 'ru' ? 'Поделиться' : 'Share'}</span></div>
              )}
            </button>
            <button
              type="button"
              className={`${styles.howToGet} ${styles.downloadButton} ${styles[rarityClass]}`}
              onClick={handleDownload}
              disabled={isLoading || !imageDataUrl || isDownloading || tutorialBlockButtons}
              aria-label={language === 'ru' ? 'Скачать картинку' : 'Download image'}
              title={language === 'ru' ? 'Скачать' : 'Download'}
            >
              {isDownloading ? <LoadingSpinner size={20} /> : <Download size={22} aria-hidden="true" />}
            </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalWindowMe;
