import type React from "react";
import "./styles/TemperatureGauge.css";

interface TemperatureGaugeProps {
  temperature: number | null;
}

const TemperatureGauge: React.FC<TemperatureGaugeProps> = ({ temperature }) => {
  let statusClass = "no-data";
  let statusText = "No Data";

  if (temperature !== null) {
    if (temperature >= 38.5) {
      statusClass = "elevated";
      statusText = "Elevated";
    } else if (temperature >= 37.5) {
      statusClass = "slightly-elevated";
      statusText = "Slightly Elevated";
    } else if (temperature >= 36.0 && temperature <= 37.4) {
      statusClass = "normal";
      statusText = "Normal";
    } else {
      statusClass = "low";
      statusText = "Low";
    }
  }

  return (
    <div className="temperature-module">
      <h3 className="module-title">
        <span>Temperature</span>
        <span className="module-badge">Body</span>
      </h3>

      <div className="temperature-display">
        <div className={`temperature-gauge ${statusClass}`}>
          <div className="temperature-value">{temperature ?? "--"}</div>
          <div className="temperature-unit">°C</div>
        </div>
      </div>

      <div className={`temperature-status ${statusClass}`}>{statusText}</div>
    </div>
  );
};

export default TemperatureGauge;
