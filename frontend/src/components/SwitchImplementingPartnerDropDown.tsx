'use-client'

import React, { useState, useEffect } from 'react'

import { useQuery } from 'react-query'

import { UserCircleIcon } from '@heroicons/react/20/solid'

import getImplementingPartners from '@/api/services/implementingPartners/getImplementingPartners'

import { useImplementingPartner } from '@/context/ImplementingPartnerContext'

import { ImplementingPartner } from '@/types/implementingPartner.interface'

import Spinner from './Spinner'
import CustomButton from './CustomButton'
import DropDown from './DropDown'

interface SwitchImplementingPartnerDropDownProps {
  children?: React.ReactNode
}

const SwitchImplementingPartnerDropDown: React.FC<
  SwitchImplementingPartnerDropDownProps
> = () => {
  const { selectedImplementingPartnerId, setSelectedImplementingPartnerId } =
    useImplementingPartner()
  const [showDropDown, setShowDropDown] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchImplementingPartners = async (): Promise<
    ImplementingPartner[]
  > => {
    try {
      return await getImplementingPartners()
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
    data: implementingPartners = [],
    isLoading: isFetchingImplementingPartners,
    error: hasErrorFetchingImplementingPartners,
    refetch,
  } = useQuery(['implementingPartners'], fetchImplementingPartners, {
    enabled: false,
    staleTime: 5 * 60 * 1000,
  })

  const toggleDropDown = () => {
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
      {isFetchingImplementingPartners ? (
        <Spinner />
      ) : (
        <>
          <UserCircleIcon
            className="w-6 h-6 text-white cursor-pointer"
            onClick={toggleDropDown}
          />
          <DropDown showDropDown={showDropDown}>
            {implementingPartners.map((partner, index) => (
              <CustomButton
                variant="none"
                label={partner.name}
                className="text-white hover:bg-gray-600 py-0 justify-start"
                onClick={() => setSelectedImplementingPartnerId(partner.id)}
                key={index}
              />
            ))}
          </DropDown>
        </>
      )}
    </div>
  )
}

export default SwitchImplementingPartnerDropDown
