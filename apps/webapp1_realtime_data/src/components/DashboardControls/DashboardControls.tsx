import type React from "react";
import "./DashboardControls.css";

interface ModuleVisibility {
  [key: string]: boolean;
}

interface DashboardControlsProps {
  moduleVisibility: ModuleVisibility;
  onVisibilityChange: (moduleId: string, visible: boolean) => void;
  onResetLayout: () => void;
}

const moduleLabels = {
  temperature: "Temperature Gauge",
  ekg: "EKG Module",
  spo2: "SPO2 Sensor",
  capnograph: "Capnograph",
  nibp: "NIBP Module",
  infusion: "Infusion Pump",
  ventilator: "Ventilator",
};

const DashboardControls: React.FC<DashboardControlsProps> = ({
  moduleVisibility,
  onVisibilityChange,
  onResetLayout,
}) => {
  return (
    <div className="dashboard-controls">
      <div className="controls-section">
        <h3>Module Visibility</h3>
        <div className="visibility-controls">
          {Object.entries(moduleLabels).map(([moduleId, label]) => (
            <label key={moduleId} className="checkbox-label">
              <input
                type="checkbox"
                checked={moduleVisibility[moduleId] || false}
                onChange={(e) => onVisibilityChange(moduleId, e.target.checked)}
              />
              <span className="checkmark"></span>
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="controls-section">
        <button className="reset-button" onClick={onResetLayout}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
          </svg>
          Reset Layout
        </button>
      </div>
    </div>
  );
};

export default DashboardControls;
