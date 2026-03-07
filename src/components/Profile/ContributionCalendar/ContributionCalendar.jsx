'use client';
import React, { useEffect, useState, useMemo } from "react";
import GitHubCalendar from "react-github-contribution-calendar";
import { useTheme } from '@/context/ThemeContext';
import c from './ContributionCalendar.module.css';
import transformDates from './transformDates';

// Генерирует 4 оттенка от слабого к полному акценту + цвет пустой ячейки
function getPanelColorsFromAccent(accentHex, theme) {
  const r = parseInt(accentHex.slice(1, 3), 16);
  const g = parseInt(accentHex.slice(3, 5), 16);
  const b = parseInt(accentHex.slice(5, 7), 16);
  const empty = theme === 'light' ? '#e8e8e8' : '#161b22';
  const mix = (ratio) => {
    const br = theme === 'light' ? 232 : 22;
    const bg = theme === 'light' ? 232 : 27;
    const bb = theme === 'light' ? 232 : 34;
    const nr = Math.round(br + (r - br) * ratio);
    const ng = Math.round(bg + (g - bg) * ratio);
    const nb = Math.round(bb + (b - bb) * ratio);
    return '#' + [nr, ng, nb].map(x => Math.max(0, Math.min(255, x)).toString(16).padStart(2, '0')).join('');
  };
  return [empty, mix(0.25), mix(0.5), mix(0.75), accentHex];
}

const ContributionCalendar = ({ calendarData }) => {
  const [values, setValues] = useState([]);
  const { theme, accentColor } = useTheme();

  useEffect(() => {
    if (calendarData && calendarData.length > 0) {
      setValues(transformDates(calendarData));
    }
  }, [calendarData]);

  const until = new Date().toISOString().slice(0, 10);
  const panelColors = useMemo(
    () => getPanelColorsFromAccent(accentColor, theme),
    [accentColor, theme]
  );

  return (
    <div className={c.calendar} data-tutorial-id="calendar">
      <GitHubCalendar
        values={values}
        until={until}
        panelColors={panelColors}
      />
    </div>
  );
};

export default ContributionCalendar;
