import React, { useEffect, useState } from "react";
import GitHubCalendar from "react-github-contribution-calendar";
import c from './ContributionCalendar.module.css'

const ContributionCalendar = (props) => {
  const [values, setValues] = useState({});

  useEffect(() => {
    const grouped = props.goals.reduce((acc, task) => {
      if (task.status === "done") {
        const date = task.completedAt;
        acc[date] = (acc[date] || 0) + 1;
      }
      return acc;
    }, {});

    setValues(grouped);
  }, []);

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
