'use client'

import React, { useState } from 'react'

import { useQuery } from 'react-query'

import { useCommunity } from '@/context/CommunityContext'
import { useImplementingPartner } from '@/context/ImplementingPartnerContext'

import getCommunities from '@/api/services/communities/getCommunities'

import { Community } from '@/types/community.interface'
import { UsersIcon } from '@heroicons/react/24/solid'

import LinkCard from '@/components/LinkCard'
import SkeletonLoader from '@/components/SkeletonLoader'
import Badge from '@/components/Badge'
import Heading from '@/components/Heading'
import AlertBanner from '@/components/AlertBanner'
import EmptyState from '@/components/EmptyState'

const ProgramTrackerCommunityPage: React.FC = () => {
  const { setCommunityName } = useCommunity()
  const { selectedImplementingPartnerId } = useImplementingPartner()

  const [errorMessage, setErrorMessage] = useState<string | null>('')

  const fetchCommunities = async (): Promise<Community[]> => {
    try {
      return await getCommunities(selectedImplementingPartnerId)
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
    data: communities = [],
    isLoading,
    error: hasErrorFetchingCommunities,
  } = useQuery<Community[], Error>(
    ['communities', selectedImplementingPartnerId],
    fetchCommunities,
    {
      enabled: !!selectedImplementingPartnerId,
      staleTime: 5 * 60 * 1000,
    },
  )

  return (
    <>
      {isLoading ? (
        <>
          <SkeletonLoader width="211px" height="36px" type="title" level="h3" />
          {Array.from({ length: 8 }, (_, i) => (
            <SkeletonLoader key={i} height="104px" type="card" />
          ))}
        </>
      ) : (
        <div>
          {/* Check if Communities Exist */}
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
              text="This implementing partner has no communities"
              pictogram={<UsersIcon />}
            />
          )}
          {hasErrorFetchingCommunities && (
            <AlertBanner
              variant="error"
              message={errorMessage ?? 'Failed to load communities'}
            />
          )}
        </div>
      )}
    </>
  )
}

export default ProgramTrackerCommunityPage
