'use client'

import React, { useState, useEffect } from 'react'

import { useQuery, useMutation, useQueryClient } from 'react-query'

import { useParams } from 'next/navigation'

import { useCommunity } from '@/context/CommunityContext'

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
import Text from '@/components/Text'

import { UsersIcon } from '@heroicons/react/24/solid'

import createTeam from '@/api/services/teams/createTeam'
import getTeamsOfCommunity from '@/api/services/teams/getTeamsOfCommunity'

import { TeamInCommunity } from '@/types/teamInCommunity.interface'
import { Team } from '@/types/team.interface'

const TeamsPage: React.FC = () => {
  const queryClient = useQueryClient()
  const params = useParams()
  const communityId = params?.communityId as string

  const [teamName, setTeamName] = useState('')
  const [isActive, setIsActive] = useState(true)

  const [openAddTeamModal, setOpenAddTeamModal] = useState(false)
  const [isAddingTeamComplete, setIsAddingTeamComplete] = useState(false)

  const [errorMessage, setErrorMessage] = useState<string | null>('')

  const { communityName } = useCommunity()

  // Fetch teams for the community
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

  // Filtered teams (derived dynamically)
  const filteredTeams = isActive
    ? teams.filter((team) => team.is_active)
    : teams

  const handleOpenTeamModal = (): void => {
    setOpenAddTeamModal(true)
  }

  const handleCloseTeamModal = (): void => {
    setTeamName('')
    setOpenAddTeamModal(false)
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
      setErrorMessage(String(error))
      throw error
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
          {teams?.length ? (
            <>
              <CustomButton
                label="Add team"
                isFullWidth
                onClick={handleOpenTeamModal}
                variant="outline"
                className="hover:bg-card-dark hover:text-white mb-4"
              />
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
              title="No teams Available"
              text="Create a new team to get started"
              pictogram={<UsersIcon />}
              actionButton={
                <CustomButton
                  label="Add team"
                  onClick={handleOpenTeamModal}
                  variant="primary"
                  className="hover:bg-card-dark hover:text-white mb-4"
                />
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
                  <Text className="text-error">{errorMessage}</Text>
                )}
              </form>
            </Modal>
          )}

          {isAddingTeamComplete && (
            <Toast
              variant="success"
              message="Team added successfully"
              isCloseable
              onClose={() => setIsAddingTeamComplete(false)}
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

export default TeamsPage
