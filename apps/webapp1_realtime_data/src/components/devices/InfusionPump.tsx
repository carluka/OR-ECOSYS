import type React from "react";
import "./styles/InfusionPump.css";

interface InfusionPumpProps {
  flowRate: number | null;
  volumeTotal: number | null;
}

const InfusionPump: React.FC<InfusionPumpProps> = ({
  flowRate,
  volumeTotal,
}) => {
  return (
    <div className="infusion-module">
      <h3 className="module-title">
        <span>Infusion Pump</span>
        <span className="module-badge">Fluids</span>
      </h3>

      <div className="infusion-values">
        <div className="value-card">
          <div className="value-label">Flow Rate</div>
          <div className="value-number">{flowRate ?? "--"}</div>
          <div className="value-unit">ml/h</div>
        </div>

        <div className="value-card">
          <div className="value-label">Volume Total</div>
          <div className="value-number">{volumeTotal ?? "--"}</div>
          <div className="value-unit">ml</div>
        </div>
      </div>
    </div>
  );
};

export default InfusionPump;
