import type React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./styles/SPO2Sensor.css";

interface SPO2SensorProps {
  oxygenSaturation: number | null;
  spo2History: { time: number; value: number }[];
  size?: number;
}

const SPO2Sensor: React.FC<SPO2SensorProps> = ({
  oxygenSaturation,
  spo2History,
  size = 0,
}) => {
  const showGraph = size >= 36;

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
    <div
      className="spo2-module"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "0.5rem",
      }}
    >
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
      </div>

      {showGraph && (
        <div
          className="spo2-chart"
          style={{ flex: 1, minHeight: 0, margin: "0.5rem", padding: "0.5rem" }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={spo2History}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eaeaea" />
              <XAxis
                dataKey="time"
                hide
                tickFormatter={(tick) => {
                  const date = new Date(tick);
                  return `${date.getHours()}:${String(
                    date.getMinutes()
                  ).padStart(2, "0")}:${String(date.getSeconds()).padStart(
                    2,
                    "0"
                  )}`;
                }}
              />
              <YAxis
                domain={[85, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#64748b" }}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
                formatter={(value) => [`${value}%`, "SPO₂"]}
                labelFormatter={(label) => {
                  const date = new Date(label);
                  return `${date.getHours()}:${String(
                    date.getMinutes()
                  ).padStart(2, "0")}:${String(date.getSeconds()).padStart(
                    2,
                    "0"
                  )}`;
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default SPO2Sensor;
