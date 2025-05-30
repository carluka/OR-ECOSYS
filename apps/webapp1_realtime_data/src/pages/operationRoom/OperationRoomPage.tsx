import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useDeviceContext } from "../../context/DeviceContext";
import { useParams, Navigate } from "react-router-dom";
import NibpModule from "../../components/devices/NIBPModule";
import EKGModule from "../../components/devices/EKGModule";
import SPO2Sensor from "../../components/devices/SPO2Sensor";
import Capnograph from "../../components/devices/Capnograph";
import TemperatureGauge from "../../components/devices/TemperatureGauge";
import InfusionPump from "../../components/devices/InfusionPump";
import Ventilator from "../../components/devices/Ventilator";
import "./OperationRoomPage.css";
import api from "../../api";

interface DataPoint {
  time: number;
  value: number;
}

interface MetricMessage {
  timestamp: string;
  metrics: Record<string, number | number[]>;
  device_id: string;
}

interface MessageResponse {
  message: string;
}

const MAX_POINTS = 60;

const OperationRoomPage: React.FC = () => {
  const { roomId } = useParams();
  const { deviceData, updateDeviceData } = useDeviceContext();
  const [connected, setConnected] = useState(false);
  const [co2History, setCo2History] = useState<DataPoint[]>([]);
  const [isAvailable, setIsAvailable] = useState(false);
  const [wsUuid, setWsUuid] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);

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

  useEffect(() => {
    const fetchActiveStatus = async () => {
      try {
        const res = await api.get(`/rooms/${roomId}/status`);
        if (res.data && typeof res.data.active === "boolean") {
          setIsActive(res.data.active);
          if (res.data.active && res.data.wsUuid) {
            setIsAvailable(true);
            setWsUuid(res.data.wsUuid);
          }
        }
      } catch (err) {
        console.error("Failed to fetch active status", err);
      }
    };

    if (roomId) {
      fetchActiveStatus();
    }
  }, [roomId]);

  const openSocket = (uuid: string) => {
    const port = 8000 + Number(roomId);
    const ws = new WebSocket(
      `ws://data.or-ecosystem.eu:${port}/ws/medical-device/${uuid}`
    );
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

    ws.onerror = () => ws.close();

    ws.onclose = () => {
      setConnected(false);
      wsRef.current = null;
    };
  };

  const handleMachines = async () => {
    if (isActive) {
      try {
        await api.post(`/rooms/${roomId}/stopDevices`);
      } catch (err) {
        console.error("Failed to stop devices", err);
      }

      wsRef.current?.close();
      setConnected(false);
      setIsActive(false);
      setIsAvailable(false);
      setWsUuid(null);
    } else {
      try {
        const res = await api.post(`/rooms/${roomId}/startDevices`);
        if (res.data.status === "available" && res.data.wsUuid) {
          setIsAvailable(true);
          setWsUuid(res.data.wsUuid);
          setIsActive(true);
        }
      } catch (err) {
        console.error("Failed to deploy devices", err);
      }
    }
  };

  const connectToWebSocket = async () => {
    if (connected || !wsUuid) return;
    try {
      openSocket(wsUuid);
    } catch (err) {
      console.error("Failed to connect", err);
    }
  };

  const disconnect = () => {
    wsRef.current?.close();
    setConnected(false);
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
    co2History,
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

  if (!roomId) {
    return <Navigate to="/" replace />;
  }

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
            <h1>{decodeURIComponent(roomId)} - Dashboard</h1>
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
                onClick={handleMachines}
                className={`run-btn ${isActive ? "" : ""}`}
              >
                {isActive ? "Stop Machines" : "Run Machines"}
              </button>
              <button
                onClick={connectToWebSocket}
                disabled={!isAvailable || connected}
                className={`connect-btn ${
                  !isAvailable || connected ? "disabled" : ""
                }`}
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
