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
  const isSmall = size < 16;
  const isMedium = size >= 16 && size < 36;
  const isLarge = size >= 36;

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

  const gaugeSize = isSmall ? "5rem" : isMedium ? "6rem" : "8rem";

  return (
    <div
      className={`spo2-module ${
        isSmall ? "small" : isMedium ? "medium" : "large"
      }`}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: isSmall ? "0.5rem" : "0.75rem",
      }}
    >
      <h3
        className="module-title"
        style={{
          fontSize: isSmall ? "1rem" : isMedium ? "1.1rem" : "1.25rem",
          marginBottom: isSmall ? "0.5rem" : "1rem",
        }}
      >
        <span>SPO₂ Sensor</span>
        <span className="module-badge">Oxygen</span>
      </h3>

      <div
        className="spo2-display"
        style={{ marginBottom: isSmall ? "0.5rem" : "1rem" }}
      >
        <div
          className={`spo2-gauge ${statusClass}`}
          style={{
            width: gaugeSize,
            height: gaugeSize,
            border: isSmall ? "3px solid" : "4px solid",
          }}
        >
          <div
            className="spo2-value"
            style={{
              fontSize: isSmall ? "1.8rem" : isMedium ? "2.2rem" : "2.5rem",
            }}
          >
            {oxygenSaturation ?? "--"}
          </div>
          <div className="spo2-unit">%</div>
        </div>
      </div>

      <div
        className="spo2-status"
        style={{ marginBottom: isSmall ? "0.5rem" : "1rem" }}
      >
        <div
          className={`status-badge ${statusClass}`}
          style={{ fontSize: isSmall ? "0.75rem" : "0.875rem" }}
        >
          {statusText}
        </div>
      </div>

      {showGraph && (
        <div
          className="spo2-chart"
          style={{
            flex: 1,
            minHeight: 0,
            margin: "0",
            padding: "0",
          }}
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
                tick={{ fontSize: isLarge ? 12 : 10, fill: "#64748b" }}
                width={isLarge ? 30 : 25}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  fontSize: isLarge ? "12px" : "10px",
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
                strokeWidth={isLarge ? 2 : 1.5}
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
