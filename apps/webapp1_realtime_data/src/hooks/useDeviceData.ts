import { useState, useRef, useCallback } from "react";
import type { MetricMessage, DataPoint } from "../types/device-types";
import { useDeviceContext } from "../context/DeviceContext";

const MAX_POINTS = 60;

export const useDeviceData = () => {
  const { deviceData, updateDeviceData } = useDeviceContext();
  const [co2History, setCo2History] = useState<DataPoint[]>([]);
  const [spo2History, setSpo2History] = useState<DataPoint[]>([]);
  const [temperatureHistory, setTemperatureHistory] = useState<DataPoint[]>([]);
  const allMetricsRef = useRef<MetricMessage[]>([]);

  const handleMetric = useCallback(
    (msg: MetricMessage) => {
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

      if (msg.device_id === "oxygen_saturation.ch0.spo2") {
        const value = msg.metrics["oxygen_saturation.ch0.spo2"] as number;
        if (value !== null && value !== undefined) {
          setSpo2History((prev) => {
            const next = [...prev, { time: ts, value }];
            return next.length > MAX_POINTS
              ? next.slice(next.length - MAX_POINTS)
              : next;
          });
        }
      }

      if (msg.device_id === "temperature.ch0.temperature_gauge") {
        const value = msg.metrics[
          "temperature.ch0.temperature_gauge"
        ] as number;
        if (value !== null && value !== undefined) {
          setTemperatureHistory((prev) => {
            const next = [...prev, { time: ts, value }];
            return next.length > MAX_POINTS
              ? next.slice(next.length - MAX_POINTS)
              : next;
          });
        }
      }
    },
    [updateDeviceData]
  );

  const processDeviceData = useCallback(() => {
    const nibpData = {
      systolic:
        deviceData["bps.ch0.nibp_module"]?.metrics["bps.ch0.nibp_module"] ??
        null,
      diastolic:
        deviceData["bpd.ch0.nibp_module"]?.metrics["bpd.ch0.nibp_module"] ??
        null,
      map:
        deviceData["bpa.ch0.nibp_module"]?.metrics["bpa.ch0.nibp_module"] ??
        null,
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
      spo2History,
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

    const temperatureData = {
      temperature,
      temperatureHistory,
    };

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

    return {
      nibpData,
      ekgData,
      spo2SensorData,
      capnographData,
      temperatureData,
      infusionPumpData,
      ventilatorData,
    };
  }, [deviceData, co2History, spo2History, temperatureHistory]);

  return {
    handleMetric,
    processDeviceData,
    co2History,
    spo2History,
    temperatureHistory,
  };
};
