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
  const showChart = size >= 36; // 6x6 = 36
  const chartData = (ecgWaveform ?? []).map((v, i) => ({ x: i, y: v }));

  return (
    <div
      className="ekg-module"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "0.5rem",
      }}
    >
      <h3 className="module-title">
        <span>EKG Module</span>
        <span className="module-badge">Heart Rhythm</span>
      </h3>

      <div className="ekg-values">
        <div className="value-card">
          <div className="value-label">Heart Rate</div>
          <div className="value-number">{heartRate ?? "--"}</div>
          <div className="value-unit">bpm</div>
        </div>

        <div className="value-card">
          <div className="value-label">RR Interval</div>
          <div className="value-number">{rrInterval ?? "--"}</div>
          <div className="value-unit">ms</div>
        </div>

        <div className="value-card">
          <div className="value-label">QRS Duration</div>
          <div className="value-number">{qrsDuration ?? "--"}</div>
          <div className="value-unit">ms</div>
        </div>
      </div>

      {showChart && (
        <div
          className="ekg-chart"
          style={{ flex: 1, minHeight: 0, margin: "0.5rem 0" }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eaeaea" />
              <XAxis dataKey="x" hide />
              <YAxis
                domain={["auto", "auto"]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#64748b" }}
                width={35}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  borderRadius: "4px",
                }}
                formatter={(value) => [`${value}`, "Value"]}
              />
              <Line
                type="monotone"
                dataKey="y"
                stroke="#3b82f6"
                strokeWidth={2}
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
