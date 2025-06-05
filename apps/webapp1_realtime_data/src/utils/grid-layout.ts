import type { DeviceModule } from "../types/device-types";

export interface GridPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ModuleLayout {
  [key: string]: GridPosition;
}

export const GRID_SIZE = { cols: 12, rows: 16 };

export const DEFAULT_LAYOUT: ModuleLayout = {
  temperature: { x: 6, y: 8, width: 3, height: 4 },
  ekg: { x: 0, y: 0, width: 6, height: 6 },
  spo2: { x: 6, y: 3, width: 3, height: 5 },
  capnograph: { x: 0, y: 6, width: 6, height: 6 },
  nibp: { x: 6, y: 0, width: 3, height: 3 },
  infusion: { x: 9, y: 0, width: 3, height: 3 },
  ventilator: { x: 9, y: 3, width: 3, height: 6 },
};

export const generateDynamicLayout = (
  modules: DeviceModule[]
): ModuleLayout => {
  const layout: ModuleLayout = {};
  const moduleCount = modules.length;

  if (moduleCount === 0) return layout;

  if (moduleCount === 1) {
    layout[modules[0].id] = { x: 3, y: 4, width: 6, height: 8 };
  } else if (moduleCount === 2) {
    layout[modules[0].id] = { x: 0, y: 2, width: 6, height: 8 };
    layout[modules[1].id] = { x: 6, y: 2, width: 6, height: 8 };
  } else if (moduleCount === 3) {
    layout[modules[0].id] = { x: 0, y: 0, width: 6, height: 8 };
    layout[modules[1].id] = { x: 6, y: 0, width: 6, height: 4 };
    layout[modules[2].id] = { x: 6, y: 4, width: 6, height: 4 };
  } else if (moduleCount === 4) {
    layout[modules[0].id] = { x: 0, y: 0, width: 6, height: 6 };
    layout[modules[1].id] = { x: 6, y: 0, width: 6, height: 6 };
    layout[modules[2].id] = { x: 0, y: 6, width: 6, height: 6 };
    layout[modules[3].id] = { x: 6, y: 6, width: 6, height: 6 };
  } else if (moduleCount === 5) {
    layout[modules[0].id] = { x: 0, y: 0, width: 6, height: 6 };
    layout[modules[1].id] = { x: 6, y: 0, width: 6, height: 6 };
    layout[modules[2].id] = { x: 0, y: 6, width: 4, height: 5 };
    layout[modules[3].id] = { x: 4, y: 6, width: 4, height: 5 };
    layout[modules[4].id] = { x: 8, y: 6, width: 4, height: 5 };
  } else if (moduleCount === 6) {
    layout[modules[0].id] = { x: 0, y: 0, width: 4, height: 6 };
    layout[modules[1].id] = { x: 4, y: 0, width: 4, height: 6 };
    layout[modules[2].id] = { x: 8, y: 0, width: 4, height: 6 };
    layout[modules[3].id] = { x: 0, y: 6, width: 4, height: 6 };
    layout[modules[4].id] = { x: 4, y: 6, width: 4, height: 6 };
    layout[modules[5].id] = { x: 8, y: 6, width: 4, height: 6 };
  } else {
    const originalLayout = DEFAULT_LAYOUT;
    modules.forEach((module, index) => {
      if (originalLayout[module.id]) {
        layout[module.id] = originalLayout[module.id];
      } else {
        const row = Math.floor(index / 3);
        const col = index % 3;
        layout[module.id] = {
          x: col * 4,
          y: row * 4,
          width: 4,
          height: 4,
        };
      }
    });
  }

  return layout;
};
