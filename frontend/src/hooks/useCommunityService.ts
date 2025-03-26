import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createCommunity,
  deleteCommunity,
  updateCommunity,
  getCommunities,
} from '@/api/services/communities'

const COMMUNITIES_KEY = ['communities']
const communitiesKey = (partnerId: number | null) => [
  ...COMMUNITIES_KEY,
  partnerId,
]

export function useCommunityService(partnerId: number | null) {
  const queryClient = useQueryClient()

  const invalidateCommunities = () =>
    queryClient.invalidateQueries({ queryKey: COMMUNITIES_KEY })

  const communitiesQuery = useQuery({
    queryKey: communitiesKey(partnerId),
    queryFn: () => getCommunities(Number(partnerId)),
    enabled: !!partnerId,
    staleTime: 5 * 60 * 1000,
  })

  const addCommunityMutation = useMutation({
    mutationFn: (name: string) => createCommunity(name, Number(partnerId)),
    onSuccess: invalidateCommunities,
  })

  const editCommunityMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      updateCommunity(id, name),
    onSuccess: invalidateCommunities,
  })

  const deleteCommunityMutation = useMutation({
    mutationFn: (id: number) => deleteCommunity(id, false),
    onSuccess: invalidateCommunities,
  })

  return {
    communitiesQuery,
    addCommunityMutation,
    editCommunityMutation,
    deleteCommunityMutation,
  }
}
