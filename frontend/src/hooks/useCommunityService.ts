import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query'
import {
  createCommunity,
  deleteCommunity,
  updateCommunity,
  getCommunities,
} from '@/api/services/communities'

import { Community } from '@/types/community.interface'

const COMMUNITIES_KEY = ['communities']
const communitiesKey = (
  partnerId: number | null,
): (string | number | null)[] => [...COMMUNITIES_KEY, partnerId]

export function useCommunityService(partnerId: number | null): {
  communitiesQuery: UseQueryResult<Community[]>
  addCommunityMutation: UseMutationResult<Community, Error, string>
  editCommunityMutation: UseMutationResult<
    void,
    Error,
    { id: number; name: string }
  >
  deleteCommunityMutation: UseMutationResult<void, Error, number>
} {
  const queryClient = useQueryClient()

  const invalidateCommunities = (): Promise<void> =>
    queryClient.invalidateQueries({ queryKey: COMMUNITIES_KEY })

  const communitiesQuery = useQuery<Community[]>({
    queryKey: communitiesKey(partnerId),
    queryFn: () => getCommunities(Number(partnerId)),
    enabled: !!partnerId,
    staleTime: 5 * 60 * 1000,
  })

  const addCommunityMutation = useMutation<Community, Error, string>({
    mutationFn: (name) => createCommunity(name, Number(partnerId)),
    onSuccess: invalidateCommunities,
  })

  const editCommunityMutation = useMutation<
    void,
    Error,
    { id: number; name: string }
  >({
    mutationFn: ({ id, name }) => updateCommunity(id, name),
    onSuccess: invalidateCommunities,
  })

  const deleteCommunityMutation = useMutation<void, Error, number>({
    mutationFn: (id) => deleteCommunity(id, false),
    onSuccess: invalidateCommunities,
  })

  return {
    communitiesQuery,
    addCommunityMutation,
    editCommunityMutation,
    deleteCommunityMutation,
  }
}
