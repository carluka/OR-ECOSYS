import type React from "react";
import "./styles/Ventilator.css";

interface VentilatorProps {
  tidalVolume: number | null;
  respiratoryRate: number | null;
  fio2: number | null;
  pip: number | null;
  peep: number | null;
}

const Ventilator: React.FC<VentilatorProps> = ({
  tidalVolume,
  respiratoryRate,
  fio2,
  pip,
  peep,
}) => {
  return (
    <div className="ventilator-module">
      <h3 className="module-title">
        <span>Ventilator</span>
        <span className="module-badge">Breathing</span>
      </h3>

      <div className="ventilator-values">
        <div className="value-card">
          <div className="value-label">Tidal Volume</div>
          <div className="value-number">{tidalVolume ?? "--"}</div>
          <div className="value-unit">ml</div>
        </div>

        <div className="value-card">
          <div className="value-label">Respiratory Rate</div>
          <div className="value-number">{respiratoryRate ?? "--"}</div>
          <div className="value-unit">/min</div>
        </div>

        <div className="value-card">
          <div className="value-label">FiO₂</div>
          <div className="value-number">{fio2 ?? "--"}</div>
          <div className="value-unit">%</div>
        </div>

        <div className="value-card">
          <div className="value-label">PIP</div>
          <div className="value-number">{pip ?? "--"}</div>
          <div className="value-unit">cmH₂O</div>
        </div>

        <div className="value-card full-width">
          <div className="value-label">PEEP</div>
          <div className="value-number">{peep ?? "--"}</div>
          <div className="value-unit">cmH₂O</div>
        </div>
      </div>
    </div>
  );
};

export default Ventilator;
