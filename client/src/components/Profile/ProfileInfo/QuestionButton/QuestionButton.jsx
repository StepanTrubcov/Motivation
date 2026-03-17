'use client';
import React, { useState, useEffect } from "react";
import { Settings, X, HelpCircle, Moon, Share2, Languages, GraduationCap, Palette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTutorial } from '@/context/TutorialContext';
import c from './QuestionButton.module.css';

const QuestionButton = () => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
    const [isLanguagePickerOpen, setIsLanguagePickerOpen] = useState(false);
    const { theme, toggleTheme, accentColor, setAccentColor } = useTheme();
    const { language, changeLanguage, t } = useLanguage();
    const { startTutorial, currentStep, isOpen: isTutorialOpen, onTutorialOpenSettings, isColorPickerOpenForTutorial, setIsColorPickerOpenForTutorial } = useTutorial();

    // Закрываем настройки только когда туториал открыт И мы на шаге, где модалка мешает:
    // — «Кнопка настроек» (нужно показать шестерёнку) или шаги после блока настроек.
    useEffect(() => {
        if (!isTutorialOpen || !isSettingsOpen) return;
        const step = currentStep?.id;
        const mustCloseForTutorial =
            step === 'settings-button' ||
            step === 'today-goals' ||
            step === 'generate-button' ||
            step === 'calendar';
        if (mustCloseForTutorial) {
            setIsSettingsOpen(false);
        }
    }, [isTutorialOpen, currentStep?.id, isSettingsOpen]);

    const isSettingsBlocked = isTutorialOpen && currentStep?.id === 'profile-info';

    const handleSettingsButtonClick = () => {
        if (isSettingsBlocked) return;
        if (currentStep?.id === 'settings-button') {
            onTutorialOpenSettings();
        }
        setIsSettingsOpen(true);
    };

    const handleShare = async () => {
        setIsSettingsOpen(false);

        const text = t('shareInviteText');
        // NOTE: Some Telegram clients don't show prefilled message when only `text` is provided.
        // Passing both `url` and `text` reliably opens the Telegram share chooser.
        const botUrl = 'https://t.me/BotMotivation_TG_bot';
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(botUrl)}&text=${encodeURIComponent(text)}`;

        try {
            // Telegram Mini App (preferred)
            if (typeof window !== 'undefined' && window.Telegram?.WebApp?.openTelegramLink) {
                window.Telegram.WebApp.openTelegramLink(shareUrl);
                return;
            }

            // Browser native share (fallback)
            if (typeof navigator !== 'undefined' && navigator.share) {
                await navigator.share({ text, url: botUrl });
                return;
            }

            // Clipboard (fallback)
            if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(`${text} ${botUrl}`);
                toast.success(t('shareCopied'));
                return;
            }

            // Last resort: open share link
            if (typeof window !== 'undefined') {
                window.open(shareUrl, '_blank', 'noopener,noreferrer');
                return;
            }
        } catch (e) {
            console.error('Share failed:', e);
        }

        toast.error(t('shareGenericFailed'));
    };

    const colorOptions = [
        { name: 'Зелёный', nameEn: 'Green', color: '#00ff1e' },
        { name: 'Синий', nameEn: 'Blue', color: '#0080ff' },
        { name: 'Фиолетовый', nameEn: 'Purple', color: '#9b4dff' },
        { name: 'Розовый', nameEn: 'Pink', color: '#ff4d9b' },
        { name: 'Оранжевый', nameEn: 'Orange', color: '#ff6b35' },
        { name: 'Красный', nameEn: 'Red', color: '#ff3b30' },
        { name: 'Голубой', nameEn: 'Cyan', color: '#00d4ff' },
        { name: 'Жёлтый', nameEn: 'Yellow', color: '#ffd700' },
    ];

    const languageOptions = [
        { code: 'ru', name: 'Русский', nameEn: 'Russian' },
        { code: 'en', name: 'English', nameEn: 'English' },
    ];

    const settingsOptions = [
        {
            id: 'help',
            icon: HelpCircle,
            label: t('help'),
            action: () => {
                window.open('https://t.me/keep_alive_Assistant_bot', '_blank');
                setIsSettingsOpen(false);
            }
        },
        {
            id: 'color',
            icon: Palette,
            label: t('color'),
            action: () => {
                if (isTutorialOpen && currentStep?.id === 'settings-color') {
                    setIsColorPickerOpenForTutorial?.(true);
                }
                setIsColorPickerOpen(true);
            }
        },
        {
            id: 'language',
            icon: Languages,
            label: t('language'),
            action: () => {
                setIsLanguagePickerOpen(true);
            }
        },
        {
            id: 'tutorial',
            icon: GraduationCap,
            label: t('tutorial'),
            action: () => {
                setIsSettingsOpen(false);
                startTutorial('home');
            }
        },
        {
            id: 'share',
            icon: Share2,
            label: t('share'),
            action: () => {
                handleShare();
            }
        },
    ];

    return (
        <>
            <button
                className={`${c.settingsButton} ${isSettingsBlocked ? c.settingsButtonBlocked : ''}`}
                onClick={handleSettingsButtonClick}
                aria-label="Настройки"
                aria-disabled={isSettingsBlocked}
                data-tutorial-id="settings-button"
            >
                <span className={c.settingsButtonInner}>
                    <Settings size={24} className={c.settingsIcon} />
                    <span className={c.settingsNewBadge} aria-hidden />
                </span>
            </button>

            <AnimatePresence>
                {isSettingsOpen && (
                    <motion.div
                        className={c.modalBackdrop}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setIsSettingsOpen(false)}
                    >
                        <motion.div
                            className={c.modalContent}
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={c.modalHeader}>
                                <h2 className={c.modalTitle}>{t('settings')}</h2>
                                <button
                                    onClick={() => setIsSettingsOpen(false)}
                                    className={c.closeButton}
                                    aria-label={t('close')}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className={c.settingsList}>
                                {/* Переключатель темы */}
                                <div className={c.themeToggleContainer} data-tutorial-id="settings-theme">
                                    <div className={c.themeToggleLabel}>
                                        <Moon size={20} className={c.optionIcon} />
                                        <span className={c.optionLabel}>
                                            {theme === 'light' ? t('lightTheme') : t('darkTheme')}
                                        </span>
                                    </div>
                                    <label className={c.toggleSwitch}>
                                        <input
                                            type="checkbox"
                                            checked={theme === 'light'}
                                            onChange={toggleTheme}
                                        />
                                        <span className={c.toggleSlider}></span>
                                    </label>
                                </div>

                                {/* Остальные настройки */}
                                {settingsOptions.map((option) => {
                                    const Icon = option.icon;
                                    const isColorOption = option.id === 'color';
                                    const isOptionBlocked = isTutorialOpen && currentStep?.id === `settings-${option.id}` && !isColorOption;
                                    return (
                                        <button
                                            key={option.id}
                                            className={`${c.settingsOption} ${isOptionBlocked ? c.settingsOptionBlocked : ''}`}
                                            onClick={() => {
                                                if (isOptionBlocked) return;
                                                option.action();
                                            }}
                                            aria-disabled={isOptionBlocked}
                                            data-tutorial-id={`settings-${option.id}`}
                                        >
                                            <Icon size={20} className={c.optionIcon} />
                                            <span className={c.optionLabel}>{option.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Модальное окно выбора цвета */}
            <AnimatePresence>
                {isColorPickerOpen && (
                    <motion.div
                        className={`${c.modalBackdrop} ${isColorPickerOpenForTutorial ? c.modalBackdropTutorial : ''}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => {
                            setIsColorPickerOpenForTutorial?.(false);
                            setIsColorPickerOpen(false);
                        }}
                    >
                        <motion.div
                            className={c.modalContent}
                            data-tutorial-id="settings-color-picker"
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={c.modalHeader}>
                                <h2 className={c.modalTitle}>{t('selectColor')}</h2>
                                <button
                                    onClick={() => {
                                        setIsColorPickerOpenForTutorial?.(false);
                                        setIsColorPickerOpen(false);
                                    }}
                                    className={c.closeButton}
                                    aria-label={t('close')}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className={c.colorPickerGrid}>
                                {colorOptions.map((option) => (
                                    <button
                                        key={option.color}
                                        className={`${c.colorOption} ${accentColor === option.color ? c.colorOptionActive : ''}`}
                                        onClick={() => {
                                            setAccentColor(option.color);
                                            setIsColorPickerOpenForTutorial?.(false);
                                            setIsColorPickerOpen(false);
                                        }}
                                        style={{ 
                                            backgroundColor: option.color,
                                            boxShadow: accentColor === option.color 
                                                ? `0 0 12px ${option.color}` 
                                                : 'none'
                                        }}
                                        aria-label={language === 'en' ? option.nameEn : option.name}
                                        title={language === 'en' ? option.nameEn : option.name}
                                    >
                                        {accentColor === option.color && (
                                            <span className={c.colorCheckmark}>✓</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Модальное окно выбора языка */}
            <AnimatePresence>
                {isLanguagePickerOpen && (
                    <motion.div
                        className={c.modalBackdrop}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setIsLanguagePickerOpen(false)}
                    >
                        <motion.div
                            className={c.modalContent}
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={c.modalHeader}>
                                <h2 className={c.modalTitle}>{t('language')}</h2>
                                <button
                                    onClick={() => setIsLanguagePickerOpen(false)}
                                    className={c.closeButton}
                                    aria-label={t('close')}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className={c.languageList}>
                                {languageOptions.map((option) => (
                                    <button
                                        key={option.code}
                                        className={`${c.languageOption} ${language === option.code ? c.languageOptionActive : ''}`}
                                        onClick={() => {
                                            changeLanguage(option.code);
                                            setIsLanguagePickerOpen(false);
                                        }}
                                    >
                                        <span className={c.languageName}>
                                            {option.code === 'ru' ? option.name : option.nameEn}
                                        </span>
                                        {language === option.code && (
                                            <span className={c.languageCheckmark}>✓</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default QuestionButton;