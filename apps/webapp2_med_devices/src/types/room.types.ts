export interface RoomWithDeviceCount {
  idsoba: number
  naziv: string
  lokacija: string
  st_naprav: string
  unsaved_changes: boolean
  aktivno: boolean
}

export interface Device {
  idnaprava: number
  naprava: string
  tip_naprave: string
  soba_idsoba: number | null
}

export interface RoomStats {
  totalRooms: number
  activeRooms: number
  assignedDevices: number
  unassignedDevices: number
  roomsWithUnsavedChanges: number
}
