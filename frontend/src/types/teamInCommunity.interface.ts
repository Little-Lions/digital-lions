interface Community {
  id: number
  name: string
}

interface Progress {
  current: number
  total: number
}

interface Program {
  id: number
  name: string
  progress: Progress
}

export interface TeamInCommunity {
  id: number
  name: string
  is_active: boolean
  community: Community
  program: Program
}
