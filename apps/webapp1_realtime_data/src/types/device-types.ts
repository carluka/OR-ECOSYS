export interface DataPoint {
  time: number;
  value: number;
}

export interface MetricMessage {
  timestamp: string;
  metrics: Record<string, number | number[]>;
  device_id: string;
}

export interface ModuleVisibility {
  [key: string]: boolean;
}

export interface DeviceModule {
  id: string;
  label: string;
}

export const ALL_MODULES = [
  { id: "temperature", label: "Temperature Gauge" },
  { id: "ekg", label: "EKG Module" },
  { id: "spo2", label: "SPO2 Sensor" },
  { id: "capnograph", label: "Capnograph" },
  { id: "nibp", label: "NIBP Module" },
  { id: "infusion", label: "Infusion Pump" },
  { id: "ventilator", label: "Ventilator" },
];

export interface NibpData {
  systolic: number | null;
  diastolic: number | null;
  map: number | null;
}

export interface EkgData {
  heartRate: number | null;
  rrInterval: number | null;
  qrsDuration: number | null;
  ecgWaveform: number[];
}

export interface Spo2Data {
  oxygenSaturation: number | null;
  spo2History: DataPoint[];
}

export interface CapnographData {
  co2: number | null;
  rf: number | null;
  co2History: DataPoint[];
}

export interface TemperatureData {
  temperature: number | null;
  temperatureHistory: DataPoint[];
}

export interface InfusionPumpData {
  flowRate: number | null;
  volumeTotal: number | null;
}

export interface VentilatorData {
  tidalVolume: number | null;
  respiratoryRate: number | null;
  fio2: number | null;
  pip: number | null;
  peep: number | null;
}
