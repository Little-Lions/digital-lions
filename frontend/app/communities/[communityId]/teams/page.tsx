'use client'

import React, { useState, useRef } from 'react'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { useParams } from 'next/navigation'
import { useCommunity } from '@/context/CommunityContext'
import { useCustomUser } from '@/context/UserContext'

import TeamsList from '@/components/TeamsList'

import SkeletonLoader from '@/components/ui/SkeletonLoader'
// import ToggleSwitch from '@/components/ToggleSwitch'
import Toast from '@/components/ui/Toast'
import AlertBanner from '@/components/ui/AlertBanner'
import Heading from '@/components/ui/Heading'
import CustomButton from '@/components/CustomButton'

import createTeam from '@/api/services/teams/createTeam'
import getTeamsOfCommunity from '@/api/services/teams/getTeamsOfCommunity'

import { TeamInCommunity } from '@/types/teamInCommunity.interface'
import AddTeamModal from '@/components/teams/addTeamModal'

const TeamsPage: React.FC = () => {
  const queryClient = useQueryClient()
  const params = useParams()

  const { customUser } = useCustomUser()
  const { communityName } = useCommunity()

  const communityId = params?.communityId as string

  const latestSelectedElement = useRef<HTMLButtonElement | null>(null)

  const [teamName, setTeamName] = useState('')

  const [openAddTeamModal, setOpenAddTeamModal] = useState(false)
  const [isAddingTeamComplete, setIsAddingTeamComplete] = useState(false)

  const [errorMessage, setErrorMessage] = useState<string | null>('')

  // Fetch teams for the community
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
    isPending: isLoading,
    error: hasErrorFetchingTeams,
  } = useQuery({
    queryKey: ['teams', communityId],
    queryFn: fetchTeams,
    staleTime: 5 * 60 * 1000,
  })
  // Filtered teams (derived dynamically)

  const handleOpenTeamModal = (): void => {
    // Save the currently focused element to restore focus when modal closes
    latestSelectedElement.current = document.activeElement as HTMLButtonElement
    setOpenAddTeamModal(true)
  }

  const handleCloseTeamModal = (): void => {
    setTeamName('')
    setOpenAddTeamModal(false)

    // Restore focus when modal closes, using a timeout to ensure React's state update completes first
    setTimeout(() => {
      latestSelectedElement?.current?.focus()
    }, 0)
  }

  const handleTeamNameChange = (value: string): void => {
    setTeamName(value)
  }

  const handleTeamNameBlur = (value: string): void => {
    setTeamName(value)
  }

  // Mutation to add a new team
  const addTeam = async (): Promise<{ id: number }> => {
    if (teamName.trim() === '') {
      throw new Error('Team name cannot be empty')
    }
    try {
      return await createTeam({
        name: teamName,
        communityId: Number(communityId),
      })
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
        throw error
      } else {
        throw error
      }
    }
  }
  const { mutate: handleAddTeam, isPending: isAddingTeam } = useMutation({
    mutationFn: addTeam,
    onSuccess: async () => {
      setErrorMessage(null)
      await queryClient.invalidateQueries({ queryKey: ['teams', communityId] })
      handleCloseTeamModal()
      setIsAddingTeamComplete(true)
    },
    onError: (error: Error) => {
      setErrorMessage(error.message)
    },
  })

  // const handleToggleChange = (active: boolean): void => {
  //   setIsActive(active)
  //   if (active) {
  //     // Filter active teams
  //     setFilteredTeams(teams.filter((team) => team.is_active))
  //   } else {
  //     // Show all teams
  //     setFilteredTeams(teams)
  //   }
  // }
  return (
    <>
      {isLoading ? (
        <>
          <SkeletonLoader width="142px" type="button" />
          <div className="flex justify-between">
            <SkeletonLoader width="189px" height="40px" type="text" />
          </div>
          {Array.from({ length: 5 }, (_, i) => (
            <SkeletonLoader key={i} type="card" />
          ))}
        </>
      ) : (
        <>
          {teams?.length > 0 &&
            customUser?.permissions.includes('teams:write') && (
              <CustomButton
                label="Add team"
                isFullWidth
                onClick={handleOpenTeamModal}
                variant="outline"
                className="mb-4"
              />
            )}

          <div className="flex justify-between mb-2">
            <Heading level="h3" hasNoMargin={true}>
              Teams in {communityName}
            </Heading>
            {/* <ToggleSwitch onChange={handleToggleChange} /> */}
          </div>

          <AddTeamModal
            isOpen={openAddTeamModal}
            onClose={handleCloseTeamModal}
            onAccept={handleAddTeam}
            isBusy={isAddingTeam}
            isDisabled={!teamName}
            teamName={teamName}
            onTeamNameChange={handleTeamNameChange}
            onTeamNameBlur={handleTeamNameBlur}
            errorMessage={errorMessage}
          />

          <TeamsList teams={teams} handleOpenTeamModal={handleOpenTeamModal} />

          {isAddingTeamComplete && (
            <Toast
              variant="success"
              message="Team added successfully"
              isCloseable={true}
              onClose={() => setIsAddingTeamComplete(false)}
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

export default TeamsPage
