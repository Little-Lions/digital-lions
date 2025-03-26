'use client'

import React, { useState, useRef } from 'react'

import { useQuery, useMutation, useQueryClient } from 'react-query'

import { useParams } from 'next/navigation'

import { useCommunity } from '@/context/CommunityContext'
import { useCustomUser } from '@/context/UserContext'

import LinkCard from '@/components/LinkCard'
import TextInput from '@/components/TextInput'
import CustomButton from '@/components/CustomButton'
import Modal from '@/components/Modal'
import SkeletonLoader from '@/components/SkeletonLoader'
import EmptyState from '@/components/EmptyState'
// import ToggleSwitch from '@/components/ToggleSwitch'
import Toast from '@/components/Toast'
import Heading from '@/components/Heading'
import AlertBanner from '@/components/AlertBanner'

import { UsersIcon } from '@heroicons/react/24/solid'

import createTeam from '@/api/services/teams/createTeam'
import getTeamsOfCommunity from '@/api/services/teams/getTeamsOfCommunity'

import { TeamInCommunity } from '@/types/teamInCommunity.interface'

const TeamsPage: React.FC = () => {
  const { customUser } = useCustomUser()
  const queryClient = useQueryClient()
  const params = useParams()
  const communityId = params?.communityId as string

  const latestSelectedElement = useRef<HTMLButtonElement | null>(null)

  const [teamName, setTeamName] = useState('')
  const [isActive, _setIsActive] = useState(true)

  const [openAddTeamModal, setOpenAddTeamModal] = useState(false)
  const [isAddingTeamComplete, setIsAddingTeamComplete] = useState(false)

  const [errorMessage, setErrorMessage] = useState<string | null>('')

  const { communityName } = useCommunity()

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
    isLoading,
    error: hasErrorFetchingTeams,
  } = useQuery(['teams', communityId], fetchTeams, {
    staleTime: 5 * 60 * 1000,
  })

  // Filtered teams (derived dynamically)
  const filteredTeams = isActive
    ? teams.filter((team) => team.is_active)
    : teams

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

  const { mutate: handleAddTeam, isLoading: isAddingTeam } = useMutation(
    addTeam,
    {
      onSuccess: async () => {
        setErrorMessage(null)
        await queryClient.invalidateQueries(['teams', communityId])
        handleCloseTeamModal()
        setIsAddingTeamComplete(true)
      },
      onError: (error: Error) => {
        setErrorMessage(error.message)
      },
    },
  )

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
          {teams?.length > 0 ? (
            <>
              {customUser?.permissions.includes('teams:write') && (
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
              {filteredTeams.map((team) => (
                <LinkCard
                  key={team.id}
                  title={team.name}
                  href={`/communities/${communityId}/teams/${team.id}`}
                  className="mb-2"
                />
              ))}
            </>
          ) : (
            <EmptyState
              title="No teams available"
              text={
                customUser?.permissions.includes('teams:write')
                  ? 'Create a new team to get started'
                  : "You don't have permission to add a new team"
              }
              pictogram={<UsersIcon />}
              actionButton={
                customUser?.permissions.includes('teams:write') ? (
                  <CustomButton
                    label="Add team"
                    onClick={handleOpenTeamModal}
                    variant="primary"
                  />
                ) : null
              }
            />
          )}

          {openAddTeamModal && (
            <Modal
              onClose={handleCloseTeamModal}
              title="Add Team"
              acceptText="Add"
              onAccept={handleAddTeam}
              isBusy={isAddingTeam}
              isDisabledButton={!teamName}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleAddTeam()
                }}
              >
                <TextInput
                  className="mb-2"
                  label="Team name"
                  value={teamName}
                  onChange={handleTeamNameChange}
                  onBlur={handleTeamNameBlur}
                  autoFocus
                />
                {errorMessage && (
                  <AlertBanner
                    variant="error"
                    message={errorMessage}
                    isCloseable={false}
                  />
                )}
              </form>
            </Modal>
          )}

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
