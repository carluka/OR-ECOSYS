import type React from "react";
import "./styles/SPO2Sensor.css";

interface SPO2SensorProps {
  oxygenSaturation: number | null;
  pulse?: number | null;
}

const SPO2Sensor: React.FC<SPO2SensorProps> = ({ oxygenSaturation, pulse }) => {
  let statusClass = "no-data";
  let statusText = "No Data";

  if (oxygenSaturation !== null) {
    if (oxygenSaturation > 95) {
      statusClass = "normal";
      statusText = "Normal";
    } else if (oxygenSaturation > 90) {
      statusClass = "caution";
      statusText = "Caution";
    } else {
      statusClass = "critical";
      statusText = "Critical";
    }
  }

  return (
    <div className="spo2-module">
      <h3 className="module-title">
        <span>SPO₂ Sensor</span>
        <span className="module-badge">Oxygen</span>
      </h3>

      <div className="spo2-display">
        <div className={`spo2-gauge ${statusClass}`}>
          <div className="spo2-value">{oxygenSaturation ?? "--"}</div>
          <div className="spo2-unit">%</div>
        </div>
      </div>

      <div className="spo2-status">
        <div className={`status-badge ${statusClass}`}>{statusText}</div>

        {pulse !== null && (
          <div className="pulse-info">
            <span className="pulse-label">Pulse:</span>
            <span className="pulse-value">{pulse} bpm</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SPO2Sensor;
