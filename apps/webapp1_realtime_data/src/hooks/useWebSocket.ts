import { useState, useRef, useCallback } from "react";
import type { MetricMessage } from "../types/device-types";

interface UseWebSocketProps {
  onMessage: (msg: MetricMessage) => void;
}

export const useWebSocket = ({ onMessage }: UseWebSocketProps) => {
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const openSocket = useCallback(
    (uuid: string) => {
      const ws = new WebSocket(
        `wss://data.or-ecosystem.eu/ws/medical-device/${uuid}`
      );
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);
      ws.onmessage = (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          const messages = Array.isArray(data) ? data : [data];
          messages.forEach(onMessage);
        } catch (err) {
          console.error("Failed to parse message", err);
        }
      };
      ws.onerror = () => ws.close();
      ws.onclose = () => {
        setConnected(false);
        wsRef.current = null;
      };
    },
    [onMessage]
  );

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    setConnected(false);
  }, []);

  return { connected, openSocket, disconnect };
};
