'use client';
import React, { useEffect, useMemo, useRef, useState } from "react";
import GitHubCalendar from "react-github-contribution-calendar";
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import c from './ContributionCalendar.module.css';

import transformDates from './transformDates';

const LEVELS_OF_LIGHTS = [
  { url: "https://i.postimg.cc/KYgdfzYy/2-1-no-bg-preview-(carve-photos).png", daysMin: 2, daysMax: 9 },
  { url: "https://i.postimg.cc/SRt1ybVn/2-2-no-bg-preview-(carve-photos)-edited-free-(carve-photos).png", daysMin: 10, daysMax: 19 },
  { url: "https://i.postimg.cc/KvRQBWjz/2-3-no-bg-preview-(carve-photos).png", daysMin: 20, daysMax: 35 },
  { url: "https://i.postimg.cc/Sx9rtzcV/2-4-edited-free-(carve-photos).png", daysMin: 36, daysMax: 50 },
  { url: "https://i.postimg.cc/BvB0JtFx/2-5-no-bg-preview-(carve-photos)-edited-free-(carve-photos).png", daysMin: 51, daysMax: 65 },
  { url: "https://i.postimg.cc/wxbQqk2j/2-6-no-bg-preview-(carve-photos).png", daysMin: 66, daysMax: 80 },
  { url: "https://i.postimg.cc/Jhqj9309/2-7-no-bg-preview-(carve-photos).png", daysMin: 81, daysMax: 95 },
  { url: "https://i.postimg.cc/NGVRqjsV/2-8-edited-free-(carve-photos).png", daysMin: 96, daysMax: 110 },
  { url: "https://i.postimg.cc/YSpWf4R3/2-9-no-bg-preview-(carve-photos).png", daysMin: 111, daysMax: 140 },
  { url: "https://i.postimg.cc/Gts8hvL5/2-10-no-bg-preview-(carve-photos).png", daysMin: 141, daysMax: 190 },
];

const GRAY_LIGHT_URL = "https://i.postimg.cc/gJDK9gn6/752049b9-f85f-4d4e-a777-58c12ac42fbd.png";

function pickFireUrlByStreak(streak) {
  if (!Number.isFinite(streak) || streak < 2) return GRAY_LIGHT_URL;
  const found = LEVELS_OF_LIGHTS.find((l) => streak >= l.daysMin && streak <= l.daysMax);
  return found?.url || LEVELS_OF_LIGHTS[LEVELS_OF_LIGHTS.length - 1].url;
}

function isoFromDateUTC(d) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
    .toISOString()
    .slice(0, 10);
}

function isoAddDays(iso, deltaDays) {
  const [y, m, d] = iso.split('-').map(Number);
  const base = new Date(Date.UTC(y, m - 1, d));
  base.setUTCDate(base.getUTCDate() + deltaDays);
  return isoFromDateUTC(base);
}

function endOfWeekSaturdayUTC(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  // JS: 0=Sun..6=Sat. We want Saturday as end of week.
  const dow = dt.getUTCDay();
  const delta = (6 - dow + 7) % 7;
  dt.setUTCDate(dt.getUTCDate() + delta);
  return isoFromDateUTC(dt);
}

const MONTH_NAMES_BY_LANG = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  ru: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
};
const WEEK_NAMES_BY_LANG = {
  en: ['', 'M', '', 'W', '', 'F', ''],
  ru: ['', 'Пн', '', 'Ср', '', 'Пт', ''],
};

const FireCalendarSvg = ({ valuesMap, until, columns, emptyColor, language }) => {
  const monthLabelHeight = 15;
  const weekLabelWidth = 15;
  const panelSize = 11;
  const panelMargin = 2;
  const bounds = panelSize + panelMargin;
  const monthNames = MONTH_NAMES_BY_LANG?.[language] || MONTH_NAMES_BY_LANG.en;
  const weekNames = WEEK_NAMES_BY_LANG?.[language] || WEEK_NAMES_BY_LANG.en;

  const lastWeekend = endOfWeekSaturdayUTC(until);
  const startOfGrid = isoAddDays(lastWeekend, -(columns * 7 - 1));

  // compute streak for each date in visible range, seeded by scanning backwards
  const hasByDate = (iso) => (valuesMap?.[iso] || 0) > 0;
  let prevStreak = 0;
  let cursor = isoAddDays(startOfGrid, -1);
  for (let i = 0; i < 800; i++) {
    if (!hasByDate(cursor)) break;
    prevStreak += 1;
    cursor = isoAddDays(cursor, -1);
  }

  const streakByDate = {};
  const runLenByDate = {};
  let s = prevStreak;
  let d = startOfGrid;
  let runDates = [];
  for (let i = 0; i < columns * 7; i++) {
    const has = hasByDate(d);
    if (has) s += 1;
    else s = 0;
    streakByDate[d] = s;

    // Track consecutive runs inside visible window
    if (has) {
      runDates.push(d);
    } else if (runDates.length) {
      const len = runDates.length;
      runDates.forEach((rd) => {
        runLenByDate[rd] = len;
      });
      runDates = [];
    }
    d = isoAddDays(d, 1);
  }
  // finalize last run
  if (runDates.length) {
    const len = runDates.length;
    runDates.forEach((rd) => {
      runLenByDate[rd] = len;
    });
  }

  const panels = [];
  const monthLabels = [];

  let prevMonth = -1;
  for (let col = 0; col < columns; col++) {
    for (let row = 0; row < 7; row++) {
      const iso = isoAddDays(startOfGrid, col * 7 + row);
      const x = weekLabelWidth + bounds * col;
      const y = monthLabelHeight + bounds * row;

      // base cell (same geometry as library)
      panels.push(
        <rect
          key={`r_${col}_${row}`}
          x={x}
          y={y}
          width={panelSize}
          height={panelSize}
          fill={emptyColor}
        />
      );

      const has = hasByDate(iso);
      const runLen = runLenByDate[iso] || 0;
      // Серия "зажигается" со 2-го дня: если день входит в цепочку подряд >=2,
      // то и первый день этой цепочки тоже должен быть горящим.
      const effectiveStreak = runLen >= 2 ? Math.max(2, Number(streakByDate[iso] || 0)) : 0;
      const fireUrl = has && runLen >= 2 ? pickFireUrlByStreak(effectiveStreak) : GRAY_LIGHT_URL;
      // icon centered in cell
      const pad = 1;
      panels.push(
        <image
          key={`i_${col}_${row}`}
          href={fireUrl}
          x={x + pad}
          y={y + pad}
          width={panelSize - pad * 2}
          height={panelSize - pad * 2}
          preserveAspectRatio="xMidYMid meet"
        />
      );
    }

    // month label logic similar to lib: check month of top cell
    const isoTop = isoAddDays(startOfGrid, col * 7);
    const [yy, mm] = isoTop.split('-').map(Number);
    const monthIdx = new Date(Date.UTC(yy, mm - 1, 1)).getUTCMonth();
    if (monthIdx !== prevMonth) {
      monthLabels.push(
        <text
          key={`mo_${col}`}
          style={{ fontSize: 10, alignmentBaseline: 'central', fill: '#AAA' }}
          x={weekLabelWidth + bounds * col + panelSize / 2}
          y={monthLabelHeight - panelSize / 2 - 2}
          textAnchor="middle"
        >
          {monthNames[monthIdx]}
        </text>
      );
      prevMonth = monthIdx;
    }
  }

  const weekLabels = weekNames.map((label, i) => (
    <text
      key={`w_${i}`}
      style={{ fontSize: 9, alignmentBaseline: 'central', fill: '#AAA' }}
      x={weekLabelWidth - panelSize / 2 - 2}
      y={monthLabelHeight + bounds * i + panelSize / 2}
      textAnchor="middle"
    >
      {label}
    </text>
  ));

  return (
    <svg
      style={{
        fontFamily: 'Helvetica, arial, nimbussansl, liberationsans, freesans, clean, sans-serif',
        width: '100%',
      }}
      height="110"
    >
      {panels}
      {weekLabels}
      {monthLabels}
    </svg>
  );
};

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

const DailyProgressLine = ({ valuesMap, until, daysCount, accentColor, theme, language }) => {
  // Build last N days ending at `until` (inclusive).
  const monthLabelHeight = 12;
  const leftPad = 10;
  const rightPad = 10;
  const topPad = 8;
  const bottomPad = 12;

  const w = 330; // fixed viewBox width, scales to container
  const h = 110;
  const chartW = w - leftPad - rightPad;
  const chartH = h - monthLabelHeight - topPad - bottomPad;

  const start = isoAddDays(until, -(daysCount - 1));
  const dayValues = [];
  for (let i = 0; i < daysCount; i++) {
    const iso = isoAddDays(start, i);
    dayValues.push(Number(valuesMap?.[iso] || 0));
  }

  const max = Math.max(1, ...dayValues);
  const stepX = daysCount <= 1 ? 0 : chartW / (daysCount - 1);
  const baseY = monthLabelHeight + topPad;

  const pts = dayValues.map((v, i) => {
    const x = leftPad + stepX * i;
    const y = baseY + (1 - v / max) * chartH;
    return { x, y, v };
  });

  const gridColor = theme === 'light' ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)';
  const axisColor = theme === 'light' ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.20)';
  const upColor = '#00ff1e';
  const downColor = '#ff3b30';
  const flatColor = '#ffd60a'; // yellow
  const lowFlatColor = '#ff3b30'; // red when stuck at bottom

  const segments = pts.slice(1).map((p, i) => {
    const prev = pts[i];
    const dv = p.v - prev.v;
    const isBottom = prev.v <= 0 && p.v <= 0;
    const stroke =
      dv > 0 ? upColor : dv < 0 ? downColor : isBottom ? lowFlatColor : flatColor;
    const opacity = dv === 0 ? 0.9 : 0.95;
    return (
      <line
        key={`seg_${i}`}
        x1={prev.x}
        y1={prev.y}
        x2={p.x}
        y2={p.y}
        stroke={stroke}
        strokeWidth="2.6"
        strokeLinecap="round"
        opacity={opacity}
      />
    );
  });

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      style={{
        width: '100%',
        height: '120px',
        display: 'block',
        fontFamily: 'Helvetica, arial, nimbussansl, liberationsans, freesans, clean, sans-serif',
      }}
      aria-label={language === 'ru' ? 'Прогресс за последние 60 дней' : 'Progress for last 60 days'}
    >
      {/* subtle grid */}
      <line x1={leftPad} y1={baseY + chartH * 0.25} x2={w - rightPad} y2={baseY + chartH * 0.25} stroke={gridColor} strokeWidth="1" />
      <line x1={leftPad} y1={baseY + chartH * 0.5} x2={w - rightPad} y2={baseY + chartH * 0.5} stroke={gridColor} strokeWidth="1" />
      <line x1={leftPad} y1={baseY + chartH * 0.75} x2={w - rightPad} y2={baseY + chartH * 0.75} stroke={gridColor} strokeWidth="1" />

      {/* baseline */}
      <line x1={leftPad} y1={baseY + chartH} x2={w - rightPad} y2={baseY + chartH} stroke={axisColor} strokeWidth="1" />

      {/* segments: green when rises, red when falls */}
      {segments}
    </svg>
  );
};

const VARIANT_STORAGE_KEY = 'calendar-variant-index';

const ContributionCalendar = ({ calendarData }) => {
  const [values, setValues] = useState([]);
  const { theme, accentColor } = useTheme();
  const { language } = useLanguage();
  const scrollerRef = useRef(null);
  const initialAppliedRef = useRef(false);
  const page2WrapRef = useRef(null);
  const [columns, setColumns] = useState(53);
  const [activeVariant, setActiveVariant] = useState(0);

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

  const monthNames = MONTH_NAMES_BY_LANG?.[language] || MONTH_NAMES_BY_LANG.en;
  const weekNames = WEEK_NAMES_BY_LANG?.[language] || WEEK_NAMES_BY_LANG.en;

  // Match library responsive column count for the SVG variant.
  useEffect(() => {
    const el = page2WrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const width = el.getBoundingClientRect().width || 0;
      const visibleWeeks = Math.floor((width - 15) / 13);
      const next = Math.max(1, Math.min(visibleWeeks, 53));
      setColumns(next);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Restore last selected variant (snap page).
  useEffect(() => {
    if (initialAppliedRef.current) return;
    const el = scrollerRef.current;
    if (!el) return;

    let idx = 0;
    try {
      const raw = localStorage.getItem(VARIANT_STORAGE_KEY);
      const n = raw != null ? Number(raw) : 0;
      idx = Number.isFinite(n) ? Math.max(0, Math.min(2, Math.round(n))) : 0;
    } catch {
      idx = 0;
    }

    const pageWidth = el.clientWidth || 0;
    el.scrollLeft = pageWidth * idx;
    setActiveVariant(idx);
    initialAppliedRef.current = true;
  }, []);

  // Persist selected page on scroll end.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    let tId = null;
    const snapNow = () => {
      const pageWidth = el.clientWidth || 1;
      const idx = Math.round(el.scrollLeft / pageWidth);
      const safeIdx = Math.max(0, Math.min(2, idx));
      el.scrollLeft = pageWidth * safeIdx;
      setActiveVariant(safeIdx);
      try {
        localStorage.setItem(VARIANT_STORAGE_KEY, String(safeIdx));
      } catch {
        // ignore
      }
    };

    const onScroll = () => {
      if (tId) window.clearTimeout(tId);
      tId = window.setTimeout(() => {
        snapNow();
      }, 220);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      if (tId) window.clearTimeout(tId);
      el.removeEventListener('scroll', onScroll);
    };
  }, []);

  const calendarNode = (
    <GitHubCalendar
      values={values}
      until={until}
      panelColors={panelColors}
      monthNames={monthNames}
      weekNames={weekNames}
    />
  );

  return (
    <div className={c.calendar} data-tutorial-id="calendar">
      <div ref={scrollerRef} className={c.variantsScroller}>
        <div className={c.variantPage}>{calendarNode}</div>
        <div className={c.variantPage}>
          <div ref={page2WrapRef}>
            <FireCalendarSvg
              valuesMap={values}
              until={until}
              columns={columns}
              emptyColor={panelColors[0]}
              language={language}
            />
          </div>
        </div>
        <div className={c.variantPage}>
          <DailyProgressLine
            valuesMap={values}
            until={until}
            daysCount={60}
            accentColor={accentColor}
            theme={theme}
            language={language}
          />
        </div>
      </div>
      <div className={c.dots} aria-hidden>
        <div className={`${c.dot} ${activeVariant === 0 ? c.dotActive : ''}`} />
        <div className={`${c.dot} ${activeVariant === 1 ? c.dotActive : ''}`} />
        <div className={`${c.dot} ${activeVariant === 2 ? c.dotActive : ''}`} />
      </div>
    </div>
  );
};

export default ContributionCalendar;
