'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('dark');
    const [accentColor, setAccentColor] = useState('#00ff1e');

    useEffect(() => {
        const savedTheme = localStorage.getItem('app-theme') || 'dark';
        const savedColor = localStorage.getItem('app-accent-color') || '#00ff1e';
        setTheme(savedTheme);
        setAccentColor(savedColor);
        applyTheme(savedTheme);
        applyAccentColor(savedColor);
    }, []);

     useEffect(() => {
        applyAccentColor(accentColor);
    }, [accentColor]);

    const applyTheme = (newTheme) => {
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

    const applyAccentColor = (color) => {
        const root = document.documentElement;
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        const glowColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
        const mutedColor = `rgba(${r}, ${g}, ${b}, 0.25)`;
        
        root.style.setProperty('--accent-green', color);
        root.style.setProperty('--accent-green-glow', glowColor);
        root.style.setProperty('--accent-green-muted', mutedColor);
    };

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('app-theme', newTheme);
        applyTheme(newTheme);
    };

    const setAccentColorHandler = (color) => {
        setAccentColor(color);
        localStorage.setItem('app-accent-color', color);
        applyAccentColor(color);
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
