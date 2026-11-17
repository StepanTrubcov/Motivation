'use client';
import React, { createContext, useContext, useState, useLayoutEffect } from 'react';
import { useSelector } from 'react-redux';

import { readableLightAccent } from '@/lib/themeAccent.mjs';
import { DEFAULT_ACCENT, normalizeAccent } from '@/lib/accentColors';
import { readUserAppearance, saveUserAppearance } from '@/lib/userAppearance.mjs';

const ThemeContext = createContext();
const storage = () => { try { return window.localStorage; } catch { return null; } };

export const ThemeProvider = ({ children }) => {
    const userId = useSelector(state => state.profile?.profile?.id ?? null);
    const [appearance, setAppearance] = useState({ userId: null, theme: 'dark', accentColor: DEFAULT_ACCENT });
    const theme = appearance.userId === userId ? appearance.theme : 'dark';
    const accentColor = appearance.userId === userId ? appearance.accentColor : DEFAULT_ACCENT;

    function applyTheme(newTheme) {
        const root = document.documentElement;
        const body = document.body;
        
        if (newTheme === 'light') {
            root.classList.remove('dark-theme');
            root.classList.add('light-theme');
            body.classList.remove('telegram-dark');
            body.classList.add('telegram-light');
            root.style.colorScheme = 'light';
        } else {
            root.classList.remove('light-theme');
            root.classList.add('dark-theme');
            body.classList.remove('telegram-light');
            body.classList.add('telegram-dark');
            root.style.colorScheme = 'dark';
        }
    };

    function applyAccentColor(color) {
        const root = document.documentElement;
        root.style.setProperty('--accent-dark', color);
        root.style.setProperty('--accent-light', readableLightAccent(color));
        // Remove properties left by a previous runtime during Fast Refresh.
        ['--accent-green', '--accent-green-glow', '--accent-green-muted'].forEach(name => root.style.removeProperty(name));
    };

    useLayoutEffect(() => {
        const saved = readUserAppearance(storage(), userId, DEFAULT_ACCENT);
        const restored = { ...saved, accentColor: normalizeAccent(saved.accentColor) };
        setAppearance({ userId, ...restored });
        applyTheme(restored.theme);
        applyAccentColor(restored.accentColor);
    }, [userId]);


    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        const next = { theme: newTheme, accentColor };
        setAppearance({ userId, ...next });
        saveUserAppearance(storage(), userId, next);
        applyTheme(newTheme);
    };

    const setAccentColorHandler = (color) => {
        const next = { theme, accentColor: normalizeAccent(color) };
        setAppearance({ userId, ...next });
        saveUserAppearance(storage(), userId, next);
        applyAccentColor(next.accentColor);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, accentColor, setAccentColor: setAccentColorHandler }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};
