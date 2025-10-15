'use client';
import React, { useEffect, useState } from "react";
import GitHubCalendar from "react-github-contribution-calendar";
import c from './ContributionCalendar.module.css';
import transformDates from './transformDates'

const ContributionCalendar = ({ calendarData }) => {
  const [values, setValues] = useState([]);

  useEffect(() => {
    if (calendarData && calendarData.length > 0) {
      setValues(transformDates(calendarData));
    }
  }, [calendarData]);

  const until = new Date().toISOString().slice(0, 10);
  return (
    <div className={c.calendar} style={{ background: "#0d1117", padding: "20px", borderRadius: "8px" }}>
      <GitHubCalendar
        values={values}
        until={until}
        panelColors={["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"]}
      />
    </div>
  );
};

export default ContributionCalendar;
