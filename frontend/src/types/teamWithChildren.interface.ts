import { Community } from './community.interface'
import { Child } from './child.interface'

interface Progress {
  current: number
  total: number
}

interface Program {
  id: number
  name: string
  progress: Progress
}

export interface TeamWithChildren {
  is_active: boolean
  last_updated_at: string
  created_at: string
  id: number
  name: string
  community: Community
  children: Child[]
  program: Program
}
