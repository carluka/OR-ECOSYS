import React, { createContext, useContext, useState, ReactNode } from "react";

interface DeviceData {
  device_id: string;
  timestamp: string;
  metrics: {
    [key: string]: any;
  };
}

interface DeviceContextType {
  deviceData: { [key: string]: DeviceData };
  updateDeviceData: (data: DeviceData) => void;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export const DeviceProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [deviceData, setDeviceData] = useState<{ [key: string]: DeviceData }>(
    {}
  );

  const updateDeviceData = (data: DeviceData) => {
    setDeviceData((prev) => ({
      ...prev,
      [data.device_id]: data,
    }));
  };

  return (
    <DeviceContext.Provider value={{ deviceData, updateDeviceData }}>
      {children}
    </DeviceContext.Provider>
  );
};

export const useDeviceContext = () => {
  const context = useContext(DeviceContext);
  if (context === undefined) {
    throw new Error("useDeviceContext must be used within a DeviceProvider");
  }
  return context;
};
