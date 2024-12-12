import { Community } from './community.interface'

export interface Team {
  id: number
  name: string
  is_active: boolean
  community: Community
}
