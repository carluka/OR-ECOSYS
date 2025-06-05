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
import "./styles/Capnograph.css";

interface CapnographProps {
  co2: number | null;
  rf: number | null;
  co2History: { time: number; value: number }[];
  size?: number;
}

const Capnograph: React.FC<CapnographProps> = ({
  co2,
  rf,
  co2History,
  size = 0,
}) => {
  const showChart = size >= 36;
  const isSmall = size < 16;
  const isMedium = size >= 16 && size < 36;
  const isLarge = size >= 36;

  return (
    <div
      className={`capnograph-module ${
        isSmall ? "small" : isMedium ? "medium" : "large"
      }`}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: isSmall ? "0.5rem" : "0.75rem",
        fontSize: isSmall ? "0.8rem" : "1rem",
      }}
    >
      <h3
        className="module-title"
        style={{
          fontSize: isSmall ? "1rem" : isMedium ? "1.1rem" : "1.25rem",
          marginBottom: isSmall ? "0.5rem" : "1rem",
        }}
      >
        <span>Capnograph</span>
        <span className="module-badge">CO₂</span>
      </h3>

      <div
        className="capnograph-values"
        style={{
          gridTemplateColumns: isSmall ? "1fr" : "repeat(2, 1fr)",
          gap: isSmall ? "0.5rem" : "1rem",
          marginBottom: isSmall ? "0.5rem" : "1rem",
        }}
      >
        <div
          className="value-card"
          style={{ padding: isSmall ? "0.5rem" : "0.75rem" }}
        >
          <div className="value-label">CO₂</div>
          <div
            className="value-number"
            style={{
              fontSize: isSmall ? "1.2rem" : isMedium ? "1.3rem" : "1.5rem",
            }}
          >
            {co2 ?? "--"}
          </div>
          <div className="value-unit">mmHg</div>
        </div>

        <div
          className="value-card"
          style={{ padding: isSmall ? "0.5rem" : "0.75rem" }}
        >
          <div className="value-label">RF</div>
          <div
            className="value-number"
            style={{
              fontSize: isSmall ? "1.2rem" : isMedium ? "1.3rem" : "1.5rem",
            }}
          >
            {rf ?? "--"}
          </div>
          <div className="value-unit">/min</div>
        </div>
      </div>

      {showChart && (
        <div
          className="capnograph-chart"
          style={{
            flex: 1,
            minHeight: 0,
            margin: "0.5rem 0",
            height: isLarge ? "8rem" : "6rem",
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={co2History}>
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
                domain={[0, 60]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: isLarge ? 12 : 10, fill: "#64748b" }}
                width={isLarge ? 30 : 25}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  borderRadius: "4px",
                  fontSize: isLarge ? "12px" : "10px",
                }}
                formatter={(value) => [`${value} mmHg`, "CO₂"]}
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
                stroke="#10b981"
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

export default Capnograph;
