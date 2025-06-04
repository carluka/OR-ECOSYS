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
import "./styles/TemperatureGauge.css";

interface TemperatureGaugeProps {
  temperature: number | null;
  temperatureHistory: { time: number; value: number }[];
  size?: number;
}

const TemperatureGauge: React.FC<TemperatureGaugeProps> = ({
  temperature,
  temperatureHistory,
  size = 0,
}) => {
  const showGraph = size >= 36; // 6x6 = 36

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
    <div
      className="temperature-module"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "0.5rem",
      }}
    >
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

      {showGraph && (
        <div
          className="temperature-chart"
          style={{ flex: 1, minHeight: 0, margin: "0.5rem", padding: "0.5rem" }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={temperatureHistory}
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
                domain={[35, 40]}
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
                formatter={(value) => [`${value}°C`, "Temperature"]}
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
                stroke="#f59e0b"
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

export default TemperatureGauge;
