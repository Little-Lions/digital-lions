'use client'

import React from 'react'

import { useCommunity } from '@/context/CommunityContext'
import { useCustomUser } from '@/context/UserContext'

import { UsersIcon } from '@heroicons/react/24/solid'

import CustomButton from '@/components/CustomButton'
import LinkCard from '@/components/ui/LinkCard'

import Badge from '@/components/ui/Badge'
import Heading from '@/components/ui/Heading'
import EmptyState from '@/components/ui/EmptyState'

import { useRouter } from 'next/navigation'
import { Community } from '@/types/community.interface'

interface ProgramTrackerCommmunityListProps {
  communities: Community[]
}

const ProgramTrackerCommunityList: React.FC<
  ProgramTrackerCommmunityListProps
> = ({ communities }) => {
  const { setCommunityName } = useCommunity()
  const { customUser } = useCustomUser()
  const router = useRouter()

  return (
    <>
      {communities.length > 0 ? (
        <>
          <Heading level="h3">Communities</Heading>

          {communities.map((community) => (
            <LinkCard
              key={community.id}
              title={community.name}
              href={`/program-tracker/${community.id}/teams`}
              onClick={() => setCommunityName(community.name)}
              className="mb-2"
            >
              <div className="flex flex-col gap-1 md:gap-2">
                <Badge variant="secondary">3 active</Badge>
                <Badge variant="success">10 completed</Badge>
              </div>
            </LinkCard>
          ))}
        </>
      ) : (
        <EmptyState
          title="No communities available"
          text={
            customUser?.permissions.includes('communities:write')
              ? 'Go to the community page to add a new community'
              : "You don't have permission to add a new community"
          }
          pictogram={<UsersIcon />}
          actionButton={
            customUser?.permissions.includes('communities:write') ? (
              <CustomButton
                label="Go"
                onClick={() => router.push('/communities/')}
                variant="primary"
              />
            ) : null
          }
        />
      )}
    </>
  )
}

export default React.memo(ProgramTrackerCommunityList)
