'use client'

import React, { useState } from 'react'

import { useQuery } from 'react-query'

import { useCommunity } from '@/context/CommunityContext'
import { useCustomUser } from '@/context/UserContext'

import LinkCard from '@/components/LinkCard'
import CustomButton from '@/components/CustomButton'
import SkeletonLoader from '@/components/SkeletonLoader'
import EmptyState from '@/components/EmptyState'
import Heading from '@/components/Heading'
import AlertBanner from '@/components/AlertBanner'

import { UsersIcon } from '@heroicons/react/24/solid'

import getTeamsOfCommunity from '@/api/services/teams/getTeamsOfCommunity'

import { TeamInCommunity } from '@/types/teamInCommunity.interface'

import { useRouter, useParams } from 'next/navigation'

const ProgramTrackerTeamsPage: React.FC = () => {
  const { customUser } = useCustomUser()
  const router = useRouter()
  const params = useParams()
  const communityId = params?.communityId as string

  const { communityName } = useCommunity()

  const [errorMessage, setErrorMessage] = useState<string | null>('')

  const fetchTeams = async (): Promise<TeamInCommunity[]> => {
    try {
      return await getTeamsOfCommunity(Number(communityId))
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
        throw error
      } else {
        throw error
      }
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
              text={
                customUser?.permissions.includes('teams:write')
                  ? 'Go to the teams page to add a new team'
                  : "You don't have permission to add a new team"
              }
              pictogram={<UsersIcon />}
              actionButton={
                customUser?.permissions.includes('teams:write') ? (
                  <CustomButton
                    label="Go"
                    onClick={() =>
                      router.push(`/communities/${communityId}/teams`)
                    }
                    variant="primary"
                  />
                ) : null
              }
            />
          )}

          {!!hasErrorFetchingTeams && (
            <AlertBanner variant="error" message={errorMessage ?? ''} />
          )}
        </>
      )}
    </>
  )
}

export default ProgramTrackerTeamsPage
