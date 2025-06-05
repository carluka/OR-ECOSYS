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
import "./styles/EKGModule.css";

interface EKGModuleProps {
  heartRate: number | null;
  rrInterval: number | null;
  qrsDuration: number | null;
  ecgWaveform: number[];
  size?: number;
}

const EKGModule: React.FC<EKGModuleProps> = ({
  heartRate,
  rrInterval,
  qrsDuration,
  ecgWaveform,
  size = 0,
}) => {
  const showChart = size >= 36;
  const isSmall = size < 16;
  const isMedium = size >= 16 && size < 36;
  const isLarge = size >= 36;
  const chartData = (ecgWaveform ?? []).map((v, i) => ({ x: i, y: v }));

  return (
    <div
      className={`ekg-module ${
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
        <span>EKG Module</span>
        <span className="module-badge">Heart Rhythm</span>
      </h3>

      <div
        className="ekg-values"
        style={{
          gridTemplateColumns: isSmall
            ? "1fr"
            : isMedium
            ? "repeat(2, 1fr)"
            : "repeat(3, 1fr)",
          gap: isSmall ? "0.5rem" : "1rem",
          marginBottom: isSmall ? "0.5rem" : "1rem",
        }}
      >
        <div
          className="value-card"
          style={{ padding: isSmall ? "0.5rem" : "0.75rem" }}
        >
          <div className="value-label">Heart Rate</div>
          <div
            className="value-number"
            style={{
              fontSize: isSmall ? "1.2rem" : isMedium ? "1.3rem" : "1.5rem",
            }}
          >
            {heartRate ?? "--"}
          </div>
          <div className="value-unit">bpm</div>
        </div>

        <div
          className="value-card"
          style={{ padding: isSmall ? "0.5rem" : "0.75rem" }}
        >
          <div className="value-label">RR Interval</div>
          <div
            className="value-number"
            style={{
              fontSize: isSmall ? "1.2rem" : isMedium ? "1.3rem" : "1.5rem",
            }}
          >
            {rrInterval ?? "--"}
          </div>
          <div className="value-unit">ms</div>
        </div>

        <div
          className="value-card"
          style={{ padding: isSmall ? "0.5rem" : "0.75rem" }}
        >
          <div className="value-label">QRS Duration</div>
          <div
            className="value-number"
            style={{
              fontSize: isSmall ? "1.2rem" : isMedium ? "1.3rem" : "1.5rem",
            }}
          >
            {qrsDuration ?? "--"}
          </div>
          <div className="value-unit">ms</div>
        </div>
      </div>

      {showChart && (
        <div
          className="ekg-chart"
          style={{
            flex: 1,
            minHeight: 0,
            margin: "0.5rem 0",
            height: isLarge ? "8rem" : "6rem",
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eaeaea" />
              <XAxis dataKey="x" hide />
              <YAxis
                domain={["auto", "auto"]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: isLarge ? 12 : 10, fill: "#64748b" }}
                width={isLarge ? 35 : 30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  borderRadius: "4px",
                  fontSize: isLarge ? "12px" : "10px",
                }}
                formatter={(value) => [`${value}`, "Value"]}
              />
              <Line
                type="monotone"
                dataKey="y"
                stroke="#3b82f6"
                strokeWidth={isLarge ? 2 : 1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default EKGModule;
