'use client'

import React, { useState, useEffect } from 'react'

import { useCommunity } from '@/context/CommunityContext'

import getCommunities from '@/api/services/communities/getCommunities'

import LinkCard from '@/components/LinkCard'
import SkeletonLoader from '@/components/SkeletonLoader'
import Badge from '@/components/Badge'
import Heading from '@/components/Heading'
interface Community {
  name: string
  id: number
}

const ProgramTrackerCommunityPage: React.FC = () => {
  const [communities, setCommunities] = useState<Community[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const { setCommunityName } = useCommunity()

  const fetchCommunities = async (): Promise<void> => {
    setIsLoading(true)
    try {
      const communitiesData = await getCommunities()
      setCommunities(communitiesData)
    } catch (error) {
      console.error('Failed to fetch communities:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCommunities()
  }, [])

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
              <div className="flex flex-col gap-2">
                <Badge variant="secondary">3 active</Badge>
                <Badge variant="success">10 completed</Badge>
              </div>
            </LinkCard>
          ))}
        </>
      )}
    </>
  )
}

export default ProgramTrackerCommunityPage
