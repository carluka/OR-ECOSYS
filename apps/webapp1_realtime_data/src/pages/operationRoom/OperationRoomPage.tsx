import React, { useState, useRef, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  time: number;
  value: number;
}

interface MetricMessage {
  timestamp: string;
  metrics: Record<string, number>;
  device_id: string;
}

const MAX_POINTS = 60;

const OperationRoomPage: React.FC = () => {
  const [connected, setConnected] = useState<boolean>(false);
  const [currentHr, setCurrentHr] = useState<number | null>(null);
  const [currentSpo2, setCurrentSpo2] = useState<number | null>(null);
  const [hrData, setHrData] = useState<DataPoint[]>([]);
  const [spo2Data, setSpo2Data] = useState<DataPoint[]>([]);

  const wsRef = useRef<WebSocket | null>(null);

  const handleMetric = (msg: MetricMessage) => {
    const value = Object.values(msg.metrics)[0];
    const ts = new Date(msg.timestamp).getTime();
    const point = { time: ts, value };

    if (msg.device_id === "numeric.ch0.vmd0") {
      setCurrentHr(value);
      setHrData((prev) => {
        const next = [...prev, point];
        return next.length > MAX_POINTS
          ? next.slice(next.length - MAX_POINTS)
          : next;
      });
    } else if (msg.device_id === "numeric.ch1.vmd1") {
      setCurrentSpo2(value);
      setSpo2Data((prev) => {
        const next = [...prev, point];
        return next.length > MAX_POINTS
          ? next.slice(next.length - MAX_POINTS)
          : next;
      });
    } else {
      console.warn("Unknown device:", msg.device_id);
    }
  };

  const connect = () => {
    wsRef.current?.close();
    const ws = new WebSocket("ws://localhost:8000/ws/medical-device");
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onmessage = (e: MessageEvent) => {
      try {
        const data: MetricMessage = JSON.parse(e.data);
        if (data.metrics) handleMetric(data);
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

  const formatTime = (tick: number) => {
    const date = new Date(tick);
    return `${date.getHours()}:${String(date.getMinutes()).padStart(
      2,
      "0"
    )}:${String(date.getSeconds()).padStart(2, "0")}`;
  };

  return (
    <div style={{ padding: 20 }}>
      <div id="status" className={connected ? "connected" : "disconnected"}>
        Status: {connected ? "Connected" : "Disconnected"}
      </div>
      <button
        onClick={connect}
        disabled={connected}
        style={{ marginRight: 10 }}
      >
        Connect
      </button>
      <button onClick={disconnect} disabled={!connected}>
        Disconnect
      </button>

      <div style={{ marginTop: 20 }}>
        <strong>Current HR:</strong> {currentHr ?? "--"}
      </div>
      <div>
        <strong>Current SPO2:</strong> {currentSpo2 ?? "--"}
      </div>

      <div style={{ marginTop: 40, height: 300 }}>
        <h3>Heart Rate (BPM)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={hrData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              domain={["auto", "auto"]}
              name="Time"
              tickFormatter={formatTime}
              type="number"
            />
            <YAxis domain={[50, 120]} />
            <Tooltip labelFormatter={(label) => formatTime(label as number)} />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              name="BPM"
              stroke="red"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: 40, height: 300 }}>
        <h3>SPO2 (%)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={spo2Data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              domain={["auto", "auto"]}
              name="Time"
              tickFormatter={formatTime}
              type="number"
            />
            <YAxis domain={[80, 100]} />
            <Tooltip labelFormatter={(label) => formatTime(label as number)} />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              name="SPO2"
              stroke="blue"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OperationRoomPage;
