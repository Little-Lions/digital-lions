'use-client'

import React, { useState } from 'react'

import { useQuery } from '@tanstack/react-query'

import { CheckBadgeIcon, UserCircleIcon } from '@heroicons/react/20/solid'

import getImplementingPartners from '@/api/services/implementingPartners/getImplementingPartners'

import { useImplementingPartner } from '@/context/ImplementingPartnerContext'

import { ImplementingPartner } from '@/types/implementingPartner.interface'

import { useRouter } from 'next/navigation'

import Spinner from './Spinner'
import CustomButton from './CustomButton'
import DropDown from './DropDown'

interface SwitchImplementingPartnerDropDownProps {
  children?: React.ReactNode
  dropdownOpen: boolean
  toggleDropdown: () => void
}

const SwitchImplementingPartnerDropDown: React.FC<
  SwitchImplementingPartnerDropDownProps
> = () => {
  const { selectedImplementingPartnerId, setSelectedImplementingPartnerId } =
    useImplementingPartner()
  const [showDropDown, setShowDropDown] = useState(false)
  const router = useRouter()

  const fetchImplementingPartners = async (): Promise<
    ImplementingPartner[]
  > => {
    try {
      return await getImplementingPartners()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      } else {
        throw error
      }
    }
  }

  const {
    data: implementingPartners = [],
    isPending: isFetchingImplementingPartners,
    refetch,
  } = useQuery({
    queryKey: ['implementingPartners'],
    queryFn: fetchImplementingPartners,
    enabled: showDropDown,
    staleTime: 5 * 60 * 1000,
  })

  const handleSelectImplementingPartner = (partnerId: number): void => {
    setSelectedImplementingPartnerId(partnerId)
    router.push('/')
  }

  const toggleDropDown = (event?: React.MouseEvent): void => {
    if (event) {
      event.stopPropagation()
    }

    setShowDropDown((prev) => {
      const newState = !prev
      if (newState && implementingPartners.length === 0) {
        refetch()
      }
      return newState
    })
  }

  return (
    <div className="relative">
      {showDropDown && isFetchingImplementingPartners ? (
        <Spinner />
      ) : (
        <>
          <UserCircleIcon
            className="w-6 h-6 text-white cursor-pointer"
            onClick={(e) => toggleDropDown(e)}
          />

          <DropDown showDropDown={showDropDown} toggleDropdown={toggleDropDown}>
            {implementingPartners.map((partner, index) => (
              <CustomButton
                key={index}
                variant="none"
                label={partner.name}
                icon={
                  selectedImplementingPartnerId === partner.id ? (
                    <CheckBadgeIcon className="w-4 h-4" />
                  ) : null
                }
                className="text-white hover:bg-gray-600 py-0 justify-start"
                onClick={() => handleSelectImplementingPartner(partner.id)}
              />
            ))}
          </DropDown>
        </>
      )}
    </div>
  )
}

export default SwitchImplementingPartnerDropDown
