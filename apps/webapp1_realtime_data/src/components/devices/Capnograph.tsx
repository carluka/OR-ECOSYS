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
}

const Capnograph: React.FC<CapnographProps> = ({ co2, rf, co2History }) => {
  return (
    <div className="capnograph-module">
      <h3 className="module-title">
        <span>Capnograph</span>
        <span className="module-badge">CO₂</span>
      </h3>

      <div className="capnograph-values">
        <div className="value-card">
          <div className="value-label">CO₂</div>
          <div className="value-number">{co2 ?? "--"}</div>
          <div className="value-unit">mmHg</div>
        </div>

        <div className="value-card">
          <div className="value-label">RF</div>
          <div className="value-number">{rf ?? "--"}</div>
          <div className="value-unit">/min</div>
        </div>
      </div>

      <div className="capnograph-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={co2History}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eaeaea" />
            <XAxis
              dataKey="time"
              hide
              tickFormatter={(tick) => {
                const date = new Date(tick);
                return `${date.getHours()}:${String(date.getMinutes()).padStart(
                  2,
                  "0"
                )}:${String(date.getSeconds()).padStart(2, "0")}`;
              }}
            />
            <YAxis domain={[0, 60]} hide />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                borderRadius: "4px",
              }}
              formatter={(value) => [`${value} mmHg`, "CO₂"]}
              labelFormatter={(label) => {
                const date = new Date(label);
                return `${date.getHours()}:${String(date.getMinutes()).padStart(
                  2,
                  "0"
                )}:${String(date.getSeconds()).padStart(2, "0")}`;
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Capnograph;
