import type React from "react";
import "./styles/NIBPModule.css";

interface Props {
  systolic: number | null;
  diastolic: number | null;
  map: number | null;
}

const NibpModule: React.FC<Props> = ({ systolic, diastolic, map }) => {
  return (
    <div className="nibp-module">
      <h3 className="module-title">
        <span>NIBP</span>
        <span className="module-badge">Blood Pressure</span>
      </h3>

      <div className="nibp-values">
        <div className="value-card">
          <div className="value-label">Systolic</div>
          <div className="value-number">{systolic ?? "--"}</div>
          <div className="value-unit">mmHg</div>
        </div>

        <div className="value-card">
          <div className="value-label">Diastolic</div>
          <div className="value-number">{diastolic ?? "--"}</div>
          <div className="value-unit">mmHg</div>
        </div>

        <div className="value-card">
          <div className="value-label">MAP</div>
          <div className="value-number">{map ?? "--"}</div>
          <div className="value-unit">mmHg</div>
        </div>
      </div>
    </div>
  );
};

export default NibpModule;
