'use client';
import React, { useEffect, useRef, useState } from "react";
import GoalCalendar, { GoalCalendarLegend } from './GoalCalendar';
import c from './ContributionCalendar.module.css';

import transformDates from './transformDates';

import StreakStrip from './StreakStrip';

import DailyProgressLine from './DailyProgressLine';

const VARIANT_STORAGE_KEY = 'calendar-variant-index';

const ContributionCalendar = ({ calendarData, goalsCount = 0 }) => {
  const [values, setValues] = useState([]);
  const scrollerRef = useRef(null);
  const initialAppliedRef = useRef(false);
  const page2WrapRef = useRef(null);
  const [columns, setColumns] = useState(53);
  const [activeVariant, setActiveVariant] = useState(0);

  useEffect(() => {
    const nextValues = transformDates(calendarData);
    nextValues.streakArchive = calendarData?.find(day => day?.streakArchive)?.streakArchive || null;
    setValues(nextValues);
  }, [calendarData]);

  const until = new Date().toISOString().slice(0, 10);

  // Match library responsive column count for the SVG variant.
  useEffect(() => {
    const el = page2WrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const width = el.getBoundingClientRect().width || 0;
      const visibleWeeks = Math.floor((width - 30) / 13);
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

  const calendarNode = <GoalCalendar valuesMap={values} until={until} columns={columns} />;

  return (
    <div className={c.calendar} data-tutorial-id="calendar">
      <div ref={scrollerRef} className={c.variantsScroller}>
        <div className={c.variantPage}>{calendarNode}</div>
        <div className={c.variantPage}>
          <div ref={page2WrapRef}>
            <StreakStrip valuesMap={values} until={until} />
          </div>
        </div>
        <div className={c.variantPage}>
          <DailyProgressLine
            valuesMap={values}
            until={until}
            goalsCount={goalsCount}
          />
        </div>
      </div>
      <div className={c.calendarFooter}>
      {activeVariant === 0 && <GoalCalendarLegend />}
      <div className={c.dots} aria-hidden>
        <div className={`${c.dot} ${activeVariant === 0 ? c.dotActive : ''}`} />
        <div className={`${c.dot} ${activeVariant === 1 ? c.dotActive : ''}`} />
        <div className={`${c.dot} ${activeVariant === 2 ? c.dotActive : ''}`} />
      </div>
      </div>
    </div>
  );
};

export default ContributionCalendar;
