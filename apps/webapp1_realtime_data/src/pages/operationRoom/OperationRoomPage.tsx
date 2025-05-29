import type React from "react";
import { useState, useRef } from "react";
import { useDeviceContext } from "../../context/DeviceContext";
import NibpModule from "../../components/devices/NIBPModule";
import EKGModule from "../../components/devices/EKGModule";
import SPO2Sensor from "../../components/devices/SPO2Sensor";
import Capnograph from "../../components/devices/Capnograph";
import TemperatureGauge from "../../components/devices/TemperatureGauge";
import InfusionPump from "../../components/devices/InfusionPump";
import Ventilator from "../../components/devices/Ventilator";
import "./OperationRoomPage.css";

interface DataPoint {
  time: number;
  value: number;
}

interface MetricMessage {
  timestamp: string;
  metrics: Record<string, number | number[]>;
  device_id: string;
}

const MAX_POINTS = 60;

const OperationRoomPage: React.FC = () => {
  const { deviceData, updateDeviceData } = useDeviceContext();
  const [connected, setConnected] = useState<boolean>(false);
  const [co2History, setCo2History] = useState<DataPoint[]>([]);

  const allMetricsRef = useRef<MetricMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const handleMetric = (msg: MetricMessage) => {
    allMetricsRef.current.push(msg);
    updateDeviceData(msg);

    const ts = new Date(msg.timestamp).getTime();
    if (msg.device_id === "co2.ch0.capnograph") {
      const value = msg.metrics["co2.ch0.capnograph"] as number;
      setCo2History((prev) => {
        const next = [...prev, { time: ts, value }];
        return next.length > MAX_POINTS
          ? next.slice(next.length - MAX_POINTS)
          : next;
      });
    }
  };

  const connect = () => {
    wsRef.current?.close();
    const ws = new WebSocket("wss://data.or-ecosystem.eu/ws/medical-device");
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onmessage = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        const messages = Array.isArray(data) ? data : [data];
        messages.forEach(handleMetric);
      } catch (err) {
        console.error("Failed to parse message", err);
      }
    };
    ws.onclose = () => {
      setConnected(false);
      wsRef.current = null;
    };
  };

  const disconnect = () => {
    wsRef.current?.close();
  };

  const nibpData = {
    systolic:
      deviceData["bps.ch0.nibp_module"]?.metrics["bps.ch0.nibp_module"] ?? null,
    diastolic:
      deviceData["bpd.ch0.nibp_module"]?.metrics["bpd.ch0.nibp_module"] ?? null,
    map:
      deviceData["bpa.ch0.nibp_module"]?.metrics["bpa.ch0.nibp_module"] ?? null,
  };

  const waveformRaw =
    deviceData["ecgWaveform.ch0.ecg_module"]?.metrics[
      "ecgWaveform.ch0.ecg_module"
    ];
  const ecgWaveform =
    typeof waveformRaw === "string"
      ? JSON.parse(waveformRaw)
      : waveformRaw ?? [];

  const ekgData = {
    heartRate:
      deviceData["heartRate.ch0.ecg_module"]?.metrics[
        "heartRate.ch0.ecg_module"
      ] ?? null,
    rrInterval:
      deviceData["rrInterval.ch0.ecg_module"]?.metrics[
        "rrInterval.ch0.ecg_module"
      ] ?? null,
    qrsDuration:
      deviceData["qrsDuration.ch0.ecg_module"]?.metrics[
        "qrsDuration.ch0.ecg_module"
      ] ?? null,
    ecgWaveform,
  };

  const spo2SensorData = {
    oxygenSaturation:
      deviceData["oxygen_saturation.ch0.spo2"]?.metrics[
        "oxygen_saturation.ch0.spo2"
      ] ?? null,
    pulse: deviceData["pulse.ch0.spo2"]?.metrics["pulse.ch0.spo2"] ?? null,
  };

  const capnographData = {
    co2:
      deviceData["co2.ch0.capnograph"]?.metrics["co2.ch0.capnograph"] ?? null,
    rf: deviceData["rf.ch0.capnograph"]?.metrics["rf.ch0.capnograph"] ?? null,
    co2History: co2History,
  };

  const temperature =
    deviceData["temperature.ch0.temperature_gauge"]?.metrics[
      "temperature.ch0.temperature_gauge"
    ] ?? null;

  const infusionPumpData = {
    flowRate:
      deviceData["flowRate.ch0.infusion_pump"]?.metrics[
        "flowRate.ch0.infusion_pump"
      ] ?? null,
    volumeTotal:
      deviceData["volumeTotal.ch0.infusion_pump"]?.metrics[
        "volumeTotal.ch0.infusion_pump"
      ] ?? null,
  };

  const ventilatorData = {
    tidalVolume:
      deviceData["vol.ch0.mechanical_ventilator"]?.metrics[
        "vol.ch0.mechanical_ventilator"
      ] ?? null,
    respiratoryRate:
      deviceData["rf.ch0.mechanical_ventilator"]?.metrics[
        "rf.ch0.mechanical_ventilator"
      ] ?? null,
    fio2:
      deviceData["ox_con.ch0.mechanical_ventilator"]?.metrics[
        "ox_con.ch0.mechanical_ventilator"
      ] ?? null,
    pip:
      deviceData["pip.ch0.mechanical_ventilator"]?.metrics[
        "pip.ch0.mechanical_ventilator"
      ] ?? null,
    peep:
      deviceData["peep.ch0.mechanical_ventilator"]?.metrics[
        "peep.ch0.mechanical_ventilator"
      ] ?? null,
  };

  return (
    <div className="operation-room-container">
      <div className="operation-room-content">
        <div className="header-container">
          <div className="header-title">
            <div className="header-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <h1>Operation Room - Dashboard</h1>
          </div>

          <div className="header-controls">
            <div className="connection-status">
              <div
                className={`status-indicator ${
                  connected ? "connected" : "disconnected"
                }`}
              ></div>
              <span>Status: {connected ? "Connected" : "Disconnected"}</span>
            </div>

            <div className="action-buttons">
              <button
                onClick={connect}
                disabled={connected}
                className={`connect-btn ${connected ? "disabled" : ""}`}
              >
                Connect
              </button>
              <button
                onClick={disconnect}
                disabled={!connected}
                className={`disconnect-btn ${!connected ? "disabled" : ""}`}
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="vital-signs-column">
            <div className="module-row">
              <div className="module-card temperature-card">
                <TemperatureGauge temperature={temperature} />
              </div>
              <div className="module-card ekg-card">
                <EKGModule {...ekgData} />
              </div>
            </div>

            <div className="module-row">
              <div className="module-card spo2-card">
                <SPO2Sensor {...spo2SensorData} />
              </div>
              <div className="module-card capnograph-card">
                <Capnograph {...capnographData} />
              </div>
            </div>
          </div>

          <div className="other-devices-column">
            <div className="module-card nibp-card">
              <NibpModule {...nibpData} />
            </div>

            <div className="module-card infusion-card">
              <InfusionPump {...infusionPumpData} />
            </div>
            <div className="module-card ventilator-card">
              <Ventilator {...ventilatorData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationRoomPage;
