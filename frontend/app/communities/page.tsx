'use client'

import React, { useState, useEffect } from 'react'

import getCommunities from '@/api/services/communities/getCommunities'
import createCommunity from '@/api/services/communities/createCommunity'

import TextInput from '@/components/TextInput'
import CustomButton from '@/components/CustomButton'
import LinkCard from '@/components/LinkCard'
import Modal from '@/components/Modal'
import SkeletonLoader from '@/components/SkeletonLoader'
import Toast from '@/components/Toast'
interface Community {
  name: string
  id: number
}

const CommunityPage: React.FC = () => {
  const [communityName, setCommunityName] = useState('')
  const [communities, setCommunities] = useState<Community[]>([])

  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const [isAddingCommunity, setIsAddingCommunity] = useState(false)
  const [isAddingCommunityComplete, setIsAddingCommunityComplete] =
    useState(false)
  const [openAddCommunityModal, setOpenAddCommunityModal] = useState(false)

  const [errorMessage, setErrorMessage] = useState<string>('')

  const fetchCommunities = async (): Promise<void> => {
    setIsLoading(true)
    try {
      const communitiesData = await getCommunities()
      setCommunities(communitiesData)
    } catch (error) {
      console.error('Failed to fetch communities:', error)
    } finally {
      setIsLoading(false)
      setIsInitialLoad(false)
    }
  }

  useEffect(() => {
    fetchCommunities()
  }, [])

  const handleOpenCommunityModal = (): void => {
    setOpenAddCommunityModal(true)
  }

  const handleCloseCommunityModal = (): void => {
    setCommunityName('')
    setOpenAddCommunityModal(false)
  }

  const handleCommunityNameChange = (value: string): void => {
    setCommunityName(value)
  }

  const handleCommunityNameBlur = (value: string): void => {
    setCommunityName(value)
  }

  const handleAddCommunity = async (): Promise<void> => {
    if (communityName.trim() === '') return

    setIsAddingCommunity(true)
    try {
      const newCommunity = await createCommunity(communityName)
      setCommunities([...communities, newCommunity])
      handleCloseCommunityModal()

      await fetchCommunities()
      setIsAddingCommunityComplete(true)
    } catch (error) {
      setErrorMessage(String(error))
      console.error('Error adding community:', error)
    } finally {
      setIsAddingCommunity(false)
    }
  }

  return (
    <>
      {isLoading && isInitialLoad ? (
        <>
          <SkeletonLoader width="142px" type="button" />
          {Array.from({ length: 8 }, (_, i) => (
            <SkeletonLoader key={i} type="card" />
          ))}
        </>
      ) : (
        <>
          <CustomButton
            label="Add Community"
            onClick={handleOpenCommunityModal}
            variant="outline"
            isFullWidth
            className="hover:bg-card-dark hover:text-white mb-4"
          />
          {communities.map((community) => (
            <LinkCard
              key={community.id}
              title={community.name}
              href={`/communities/${community.id}/teams`}
              state={{ communityName: community.name }}
              className="mb-2"
            />
          ))}
          {openAddCommunityModal && (
            <Modal
              onClose={handleCloseCommunityModal}
              title="Add Community"
              acceptText="Add"
              onAccept={handleAddCommunity}
              isBusy={isAddingCommunity}
              isDisabledButton={!communityName}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleAddCommunity()
                }}
              >
                <TextInput
                  className="mb-2"
                  label="Community name"
                  value={communityName}
                  onChange={handleCommunityNameChange}
                  onBlur={handleCommunityNameBlur}
                  autoFocus
                />
                {errorMessage && <p className="text-error">{errorMessage}</p>}
              </form>
            </Modal>
          )}

          {isAddingCommunityComplete && (
            <Toast
              variant="success"
              message="Community added successfully"
              isCloseable
              onClose={() => setIsAddingCommunityComplete(false)}
            />
          )}
        </>
      )}
    </>
  )
}

export default CommunityPage
