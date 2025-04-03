import React from 'react'
import LinkCard from './ui/LinkCard'
import ButtonGroup from './ui/ButtonGroup'
import CustomButton from './ui/CustomButton'
import { TrashIcon, PencilIcon } from '@heroicons/react/16/solid'

interface Community {
  id: number
  name: string
}

interface CustomUser {
  permissions: string[]
}

interface CommunitiesListProps {
  communities: Community[]
  customUser?: CustomUser
  setCommunityName: (name: string) => void
  handleOpenEditCommunityModal: (id: number) => void
  handleOpenDeleteCommunityModal: (id: number) => void
}

const CommunitiesList: React.FC<CommunitiesListProps> = ({
  communities,
  customUser,
  setCommunityName,
  handleOpenEditCommunityModal,
  handleOpenDeleteCommunityModal,
}) => {
  return (
    <>
      {communities.map((community) => (
        <LinkCard
          key={community.id}
          title={community.name}
          href={`/communities/${community.id}/teams`}
          onClick={(e) => {
            e.stopPropagation()
            setCommunityName(community.name)
          }}
          className="mb-2"
        >
          {customUser?.permissions.includes('communities:write') && (
            <ButtonGroup>
              <CustomButton
                label="Edit"
                variant="secondary"
                icon={<PencilIcon />}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleOpenEditCommunityModal(community.id)
                }}
              />
              <CustomButton
                label="Delete"
                variant="error"
                icon={<TrashIcon />}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleOpenDeleteCommunityModal(community.id)
                }}
              />
            </ButtonGroup>
          )}
        </LinkCard>
      ))}
    </>
  )
}

export default React.memo(CommunitiesList)
