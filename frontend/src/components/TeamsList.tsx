import React, { useState } from 'react'

import { useParams } from 'next/navigation'

import { useCustomUser } from '@/context/UserContext'

import LinkCard from '@/components/ui/LinkCard'

import CustomButton from '@/components/ui/CustomButton'

import EmptyState from '@/components/ui/EmptyState'
import { UsersIcon } from '@heroicons/react/24/solid'
import { Team } from '@/types/team.interface'

interface TeamsListProps {
  teams: Team[]
  handleOpenTeamModal: () => void
}

const TeamsList: React.FC<TeamsListProps> = ({
  teams,
  handleOpenTeamModal,
}) => {
  const { customUser } = useCustomUser()
  const params = useParams()
  const communityId = params?.communityId as string

  const [isActive, _setIsActive] = useState(true)

  const filteredTeams = isActive
    ? teams.filter((team) => team.is_active)
    : teams

  return (
    <>
      {teams?.length > 0 ? (
        <>
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
    </>
  )
}

export default React.memo(TeamsList)
