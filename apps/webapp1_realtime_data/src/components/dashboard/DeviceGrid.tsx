"use client"

import type React from "react";
import { Box, useTheme } from "@mui/material";
import DraggablePanel from "../../components/DraggablePanel/DraggablePanel";
import NibpModule from "../../components/devices/NIBPModule";
import EKGModule from "../../components/devices/EKGModule";
import SPO2Sensor from "../../components/devices/SPO2Sensor";
import Capnograph from "../../components/devices/Capnograph";
import TemperatureGauge from "../../components/devices/TemperatureGauge";
import InfusionPump from "../../components/devices/InfusionPump";
import Ventilator from "../../components/devices/Ventilator";
import { GRID_SIZE } from "../../utils/grid-layout";
import type {
  DeviceModule,
  ModuleVisibility,
  NibpData,
  EkgData,
  Spo2Data,
  CapnographData,
  TemperatureData,
  InfusionPumpData,
  VentilatorData,
} from "../../types/device-types";
import type { GridPosition, ModuleLayout } from "../../utils/grid-layout";

interface DeviceGridProps {
  isFullscreen: boolean;
  moduleVisibility: ModuleVisibility;
  availableModules: DeviceModule[];
  moduleLayout: ModuleLayout;
  handlePositionChange: (moduleId: string, position: GridPosition) => void;
  nibpData: NibpData;
  ekgData: EkgData;
  spo2SensorData: Spo2Data;
  capnographData: CapnographData;
  temperatureData: TemperatureData;
  infusionPumpData: InfusionPumpData;
  ventilatorData: VentilatorData;
}

const DeviceGrid: React.FC<DeviceGridProps> = ({
  isFullscreen,
  moduleVisibility,
  availableModules,
  moduleLayout,
  handlePositionChange,
  nibpData,
  ekgData,
  spo2SensorData,
  capnographData,
  temperatureData,
  infusionPumpData,
  ventilatorData,
}) => {
  const theme = useTheme();

  return (
    <Box
      className="dashboard-grid-container"
      sx={{
        flexGrow: 1,
        display: "grid",
        gridTemplateColumns: `repeat(${GRID_SIZE.cols}, 1fr)`,
        gridTemplateRows: `repeat(${GRID_SIZE.rows}, ${
          isFullscreen ? "1fr" : "60px"
        })`,
        gap: 1,
        p: 1,
        position: "relative",
        ...(isFullscreen && {
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100vw",
          height: "100vh",
          maxWidth: "none",
          maxHeight: "none",
          zIndex: 1200,
          backgroundColor: theme.palette.grey[50],
        }),
      }}
    >
      {moduleVisibility.temperature &&
        availableModules.find((m) => m.id === "temperature") && (
          <DraggablePanel
            id="temperature"
            gridPosition={moduleLayout.temperature}
            onPositionChange={handlePositionChange}
            gridSize={GRID_SIZE}
            isVisible
          >
            <TemperatureGauge
              temperature={temperatureData.temperature}
              temperatureHistory={temperatureData.temperatureHistory}
              size={
                moduleLayout.temperature.width * moduleLayout.temperature.height
              }
            />
          </DraggablePanel>
        )}

      {moduleVisibility.ekg && availableModules.find((m) => m.id === "ekg") && (
        <DraggablePanel
          id="ekg"
          gridPosition={moduleLayout.ekg}
          onPositionChange={handlePositionChange}
          gridSize={GRID_SIZE}
          isVisible
        >
          <EKGModule
            {...ekgData}
            size={moduleLayout.ekg.width * moduleLayout.ekg.height}
          />
        </DraggablePanel>
      )}

      {moduleVisibility.spo2 &&
        availableModules.find((m) => m.id === "spo2") && (
          <DraggablePanel
            id="spo2"
            gridPosition={moduleLayout.spo2}
            onPositionChange={handlePositionChange}
            gridSize={GRID_SIZE}
            isVisible
          >
            <SPO2Sensor
              oxygenSaturation={spo2SensorData.oxygenSaturation}
              spo2History={spo2SensorData.spo2History}
              size={moduleLayout.spo2.width * moduleLayout.spo2.height}
            />
          </DraggablePanel>
        )}

      {moduleVisibility.capnograph &&
        availableModules.find((m) => m.id === "capnograph") && (
          <DraggablePanel
            id="capnograph"
            gridPosition={moduleLayout.capnograph}
            onPositionChange={handlePositionChange}
            gridSize={GRID_SIZE}
            isVisible
          >
            <Capnograph
              {...capnographData}
              size={
                moduleLayout.capnograph.width * moduleLayout.capnograph.height
              }
            />
          </DraggablePanel>
        )}

      {moduleVisibility.nibp &&
        availableModules.find((m) => m.id === "nibp") && (
          <DraggablePanel
            id="nibp"
            gridPosition={moduleLayout.nibp}
            onPositionChange={handlePositionChange}
            gridSize={GRID_SIZE}
            isVisible
          >
            <NibpModule {...nibpData} />
          </DraggablePanel>
        )}

      {moduleVisibility.infusion &&
        availableModules.find((m) => m.id === "infusion") && (
          <DraggablePanel
            id="infusion"
            gridPosition={moduleLayout.infusion}
            onPositionChange={handlePositionChange}
            gridSize={GRID_SIZE}
            isVisible
          >
            <InfusionPump {...infusionPumpData} />
          </DraggablePanel>
        )}

      {moduleVisibility.ventilator &&
        availableModules.find((m) => m.id === "ventilator") && (
          <DraggablePanel
            id="ventilator"
            gridPosition={moduleLayout.ventilator}
            onPositionChange={handlePositionChange}
            gridSize={GRID_SIZE}
            isVisible
          >
            <Ventilator {...ventilatorData} />
          </DraggablePanel>
        )}
    </Box>
  );
};

export default DeviceGrid;
