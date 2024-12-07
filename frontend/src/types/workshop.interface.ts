import { Attendance } from './attendance.interface'

export interface Workshop {
  workshop_number: number
  date: string | null
  workshop_id: number | null
  attendance: Attendance[]
}
