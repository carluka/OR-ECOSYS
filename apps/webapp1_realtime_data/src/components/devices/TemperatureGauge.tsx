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
  const showGraph = size >= 36;
  const isSmall = size < 16;
  const isMedium = size >= 16 && size < 36;
  const isLarge = size >= 36;

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

  const gaugeSize = isSmall ? "4rem" : isMedium ? "5rem" : "6rem";

  return (
    <div
      className={`temperature-module ${
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
        <span>Temperature</span>
        <span className="module-badge">Body</span>
      </h3>

      <div
        className="temperature-display"
        style={{ marginBottom: isSmall ? "0.5rem" : "1rem" }}
      >
        <div
          className={`temperature-gauge ${statusClass}`}
          style={{
            width: gaugeSize,
            height: gaugeSize,
            border: isSmall ? "3px solid" : "4px solid",
          }}
        >
          <div
            className="temperature-value"
            style={{
              fontSize: isSmall ? "1.5rem" : isMedium ? "1.8rem" : "2rem",
            }}
          >
            {temperature ?? "--"}
          </div>
          <div className="temperature-unit">°C</div>
        </div>
      </div>

      <div
        className={`temperature-status ${statusClass}`}
        style={{
          marginBottom: isSmall ? "0.5rem" : "1rem",
          fontSize: isSmall ? "0.75rem" : "0.875rem",
        }}
      >
        {statusText}
      </div>

      {showGraph && (
        <div
          className="temperature-chart"
          style={{
            flex: 1,
            minHeight: 0,
            margin: "0",
            padding: "0",
          }}
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

export default TemperatureGauge;
