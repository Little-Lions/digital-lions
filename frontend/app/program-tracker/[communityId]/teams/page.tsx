'use client'

import React, { useState, useEffect, useCallback } from 'react'

import { useCommunity } from '@/context/CommunityContext'

import LinkCard from '@/components/LinkCard'
import CustomButton from '@/components/CustomButton'
import SkeletonLoader from '@/components/SkeletonLoader'
import EmptyState from '@/components/EmptyState'
import Heading from '@/components/Heading'
import Badge from '@/components/Badge'

import { UsersIcon } from '@heroicons/react/24/solid'

import getTeamsOfCommunity from '@/api/services/teams/getTeamsOfCommunity'

import { TeamInCommunity } from '@/types/teamInCommunity.interface'

import { useRouter, useParams } from 'next/navigation'
import { Team } from '@/types/team.interface'

const ProgramTrackerTeamsPage: React.FC = () => {
  const router = useRouter()
  const params = useParams()
  const communityId = params?.communityId as string

  const [teams, setTeams] = useState<TeamInCommunity[] | Team[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const { communityName } = useCommunity()

  const fetchTeams = useCallback(async () => {
    setIsLoading(true)
    try {
      const fetchedTeams = await getTeamsOfCommunity(Number(communityId))
      setTeams(fetchedTeams)
    } catch (error) {
      console.error('Failed to fetch teams:', error)
    } finally {
      setIsLoading(false)
      setIsInitialLoad(false)
    }
  }, [communityId])

  useEffect(() => {
    fetchTeams()
  }, [])

  return (
    <>
      {isLoading && isInitialLoad ? (
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
        </>
      )}
    </>
  )
}

export default ProgramTrackerTeamsPage
