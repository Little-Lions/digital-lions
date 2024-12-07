interface Workshop {
  name: string
  id: number
  number: number
  date: string
}

interface Attendance {
  present: number
  cancelled: number
  absent: number
  total: number
}

export interface WorkshopInfo {
  workshop: Workshop
  attendance: Attendance
}
