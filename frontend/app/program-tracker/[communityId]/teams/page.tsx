'use client'

import React from 'react'

import { useQuery } from 'react-query'

import { useCommunity } from '@/context/CommunityContext'

import LinkCard from '@/components/LinkCard'
import CustomButton from '@/components/CustomButton'
import SkeletonLoader from '@/components/SkeletonLoader'
import EmptyState from '@/components/EmptyState'
import Heading from '@/components/Heading'
import Badge from '@/components/Badge'
import AlertBanner from '@/components/AlertBanner'

import { UsersIcon } from '@heroicons/react/24/solid'

import getTeamsOfCommunity from '@/api/services/teams/getTeamsOfCommunity'

import { TeamInCommunity } from '@/types/teamInCommunity.interface'

import { useRouter, useParams } from 'next/navigation'

const ProgramTrackerTeamsPage: React.FC = () => {
  const router = useRouter()
  const params = useParams()
  const communityId = params?.communityId as string

  const { communityName } = useCommunity()

  const fetchTeams = async (): Promise<TeamInCommunity[]> => {
    try {
      const response = await getTeamsOfCommunity(Number(communityId))
      return response
    } catch (error) {
      console.error('Failed to fetch teams:', error)
      throw error
    }
  }

  const {
    data: teams = [],
    isLoading,
    error: hasErrorFetchingTeams,
  } = useQuery(['teams', communityId], fetchTeams, {
    staleTime: 5 * 60 * 1000,
  })

  return (
    <>
      {isLoading ? (
        <>
          <SkeletonLoader width="301px" height="36px" type="title" level="h3" />
          {Array.from({ length: 5 }, (_, i) => (
            <SkeletonLoader key={i} height="90px" type="card" />
          ))}
        </>
      ) : (
        <>
          {teams.length > 0 ? (
            <>
              <Heading level="h3">Teams in {communityName}</Heading>
              {teams.map((team) => (
                <LinkCard
                  key={team.id}
                  title={team.name}
                  href={`/program-tracker/${communityId}/teams/${team.id}`}
                  className="mb-2"
                />
              ))}
            </>
          ) : (
            <EmptyState
              title="No teams available"
              pictogram={<UsersIcon />}
              actionButton={
                <CustomButton
                  label="Add team"
                  onClick={() =>
                    router.push(`/communities/${communityId}/teams`)
                  }
                  variant="primary"
                  className="hover:bg-card-dark hover:text-white mb-4"
                />
              }
            />
          )}

          {!!hasErrorFetchingTeams && (
            <AlertBanner variant="error" message="Failed to fetch teams" />
          )}
        </>
      )}
    </>
  )
}

export default ProgramTrackerTeamsPage
