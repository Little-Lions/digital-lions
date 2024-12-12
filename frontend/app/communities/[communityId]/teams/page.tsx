'use client'

import React, { useState, useEffect, useCallback } from 'react'

import LinkCard from '@/components/LinkCard'
import TextInput from '@/components/TextInput'
import CustomButton from '@/components/CustomButton'
import Modal from '@/components/Modal'
import SkeletonLoader from '@/components/SkeletonLoader'
import EmptyState from '@/components/EmptyState'
import ToggleSwitch from '@/components/ToggleSwitch'
import Toast from '@/components/Toast'
import Heading from '@/components/Heading'

import { UsersIcon } from '@heroicons/react/24/solid'

import createTeam from '@/api/services/teams/createTeam'
import getTeamsOfCommunity from '@/api/services/teams/getTeamsOfCommunity'

import { TeamInCommunity } from '@/types/teamInCommunity.interface'

import { useParams } from 'next/navigation'
import { Team } from '@/types/team.interface'

const TeamsPage: React.FC = () => {
  const params = useParams()
  const communityId = params?.communityId as string
  const [teams, setTeams] = useState<TeamInCommunity[] | Team[]>([])
  const [filteredTeams, setFilteredTeams] = useState<
    TeamInCommunity[] | Team[]
  >([])
  const [teamName, setTeamName] = useState('')
  const [communityName, setCommunityName] = useState<string | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [isActive, setIsActive] = useState(true)

  const [isAddingTeam, setIsAddingTeam] = useState(false)
  const [openAddTeamModal, setOpenAddTeamModal] = useState(false)
  const [isAddingTeamComplete, setIsAddingTeamComplete] = useState(false)

  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const storedState = localStorage.getItem('linkCardState')
    if (storedState) {
      const { communityName } = JSON.parse(storedState)
      setCommunityName(communityName)
    }
  }, [])

  const fetchTeams = useCallback(async () => {
    setIsLoading(true)
    try {
      const fetchedTeams = await getTeamsOfCommunity(Number(communityId))
      setTeams(fetchedTeams)
      if (isActive) {
        setFilteredTeams(fetchedTeams.filter((team) => team.is_active))
      } else {
        setFilteredTeams(fetchedTeams)
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error)
    } finally {
      setIsLoading(false)
      setIsInitialLoad(false)
    }
  }, [isActive, communityId])

  useEffect(() => {
    fetchTeams()
  }, [fetchTeams])

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

  const handleAddTeam = async (): Promise<void> => {
    if (teamName.trim() === '') return
    setIsAddingTeam(true)
    try {
      const newTeam = await createTeam({
        name: teamName,
        communityId: Number(communityId),
      })
      setTeams((prevTeams) => [
        ...prevTeams,
        { name: teamName, id: newTeam.id } as Team,
      ])
      handleCloseTeamModal()
      await fetchTeams()
      setIsAddingTeamComplete(true)
    } catch (error) {
      setErrorMessage(String(error))
      console.error('Error adding team:', error)
    } finally {
      setIsAddingTeam(false)
    }
  }

  const handleToggleChange = (active: boolean): void => {
    setIsActive(active)
    if (active) {
      // Filter active teams
      setFilteredTeams(teams.filter((team) => team.is_active))
    } else {
      // Show all teams
      setFilteredTeams(teams)
    }
  }
  return (
    <>
      {isLoading && isInitialLoad ? (
        <>
          <SkeletonLoader width="142px" type="button" />
          <div className="flex justify-between">
            <SkeletonLoader width="189px" height="40px" type="text" />
            {/* <SkeletonLoader width="142px" type="button" /> */}
          </div>
          {Array.from({ length: 5 }, (_, i) => (
            <SkeletonLoader key={i} type="card" />
          ))}
        </>
      ) : (
        <>
          {teams.length ? (
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
                  state={{ communityName, teamName: team.name }}
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
                {errorMessage && <p className="text-error">{errorMessage}</p>}
              </form>
            </Modal>
          )}

          {isAddingTeamComplete && (
            <Toast
              variant="success"
              message="Community added successfully"
              isCloseable
              onClose={() => setIsAddingTeamComplete(false)}
            />
          )}
        </>
      )}
    </>
  )
}

export default TeamsPage
