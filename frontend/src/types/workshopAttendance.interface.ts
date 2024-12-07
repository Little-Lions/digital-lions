interface Workshop {
  name: string
  id: number
  number: number
  date: string
}

export interface AttendanceRecord {
  attendance: string
  child_id: number
}

export interface WorkshopAttendance {
  workshop: Workshop
  attendance: AttendanceRecord[]
}
