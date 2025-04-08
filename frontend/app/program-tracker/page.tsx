'use client'
import React from 'react'

import { useImplementingPartner } from '@/context/ImplementingPartnerContext'

import SkeletonLoader from '@/components/ui/SkeletonLoader'
import AlertBanner from '@/components/ui/AlertBanner'

import { useCommunityService } from '@/hooks/useCommunityService'
import ProgramTrackerCommunityList from '@/components/ProgramTracker/ProgramTrackerCommunityList'

const ProgramTrackerCommunityPage: React.FC = () => {
  const { selectedImplementingPartnerId } = useImplementingPartner()

  const { communitiesQuery } = useCommunityService(
    selectedImplementingPartnerId,
  )

  const {
    data: communities = [],
    isLoading,
    error: hasErrorFetchingCommunities,
  } = communitiesQuery

  return (
    <>
      {isLoading ? (
        <>
          <SkeletonLoader width="211px" height="36px" type="title" level="h3" />
          {Array.from({ length: 4 }, (_, i) => (
            <SkeletonLoader key={i} height="104px" type="card" />
          ))}
        </>
      ) : (
        <div>
          <ProgramTrackerCommunityList communities={communities} />
          {!!hasErrorFetchingCommunities && (
            <AlertBanner
              variant="error"
              message={hasErrorFetchingCommunities.message}
              isCloseable={false}
            />
          )}
        </div>
      )}
    </>
  )
}

export default ProgramTrackerCommunityPage
