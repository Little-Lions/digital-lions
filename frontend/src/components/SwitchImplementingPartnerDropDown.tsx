'use client'

import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { CheckBadgeIcon, UserCircleIcon } from '@heroicons/react/20/solid'
import getImplementingPartners from '@/api/services/implementingPartners/getImplementingPartners'
import { useImplementingPartner } from '@/context/ImplementingPartnerContext'
import { ImplementingPartner } from '@/types/implementingPartner.interface'
import Spinner from './Spinner'
import CustomButton from './CustomButton'
import DropDown from './DropDown'
import Accordion from './Accordion'

interface SwitchImplementingPartnerDropDownProps {
  isMobile?: boolean
  index?: number
}

const SwitchImplementingPartnerDropDown: React.FC<
  SwitchImplementingPartnerDropDownProps
> = ({ isMobile = false, index }) => {
  const { selectedImplementingPartnerId, setSelectedImplementingPartnerId } =
    useImplementingPartner()
  const [showDropDown, setShowDropDown] = useState(false)
  const [isAccordionOpen, setIsAccordionOpen] = useState(false)
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

  const handleAccordionToggle = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    if (implementingPartners.length === 0) {
      refetch()
    }

    setIsAccordionOpen((prev) => !prev)
  }
  return (
    <div className={`relative ${isMobile ? 'w-full' : ''}`}>
      {isFetchingImplementingPartners ? (
        <div className="py-4">
          <Spinner />
        </div>
      ) : (
        <>
          {/* Desktop: Show Icon-based Dropdown */}
          {!isMobile && (
            <>
              <UserCircleIcon
                className="w-6 h-6 text-white cursor-pointer"
                onClick={toggleDropDown}
              />
              <div
                className={`${
                  showDropDown ? 'block' : 'hidden'
                } absolute right-0 mt-2 bg-gray-800 rounded-lg shadow-lg max-w-xs w-full`}
              >
                <DropDown showDropDown={showDropDown}>
                  {implementingPartners.map((partner, index) => (
                    <CustomButton
                      variant="none"
                      label={partner.name}
                      icon={
                        selectedImplementingPartnerId === partner.id ? (
                          <CheckBadgeIcon className="w-4 h-4" />
                        ) : null
                      }
                      className="text-white hover:bg-gray-600 py-2 justify-start w-full text-left"
                      onClick={() =>
                        setSelectedImplementingPartnerId(partner.id)
                      }
                      key={index}
                    />
                  ))}
                </DropDown>
              </div>
            </>
          )}

          {/* Mobile: Show as Accordion */}
          {isMobile && (
            <Accordion
              index={index || 0}
              id={`accordion-item-${index || 0}`}
              totalItems={implementingPartners.length}
              title="Implementing Partners"
              className="bg-gray-800"
              bgClass="bg-gray-800 px-3 py-2 text-sm text-white"
              headingClass="h7"
              isOpen={isAccordionOpen}
              onClick={handleAccordionToggle}
            >
              <div className=" bg-gray-800">
                {implementingPartners.map((partner, idx) => (
                  <CustomButton
                    key={idx}
                    variant="none"
                    label={partner.name}
                    icon={
                      selectedImplementingPartnerId === partner.id ? (
                        <CheckBadgeIcon className="w-4 h-4" />
                      ) : null
                    }
                    className="text-white hover:bg-gray-600 py-2 w-full block"
                    onClick={() => setSelectedImplementingPartnerId(partner.id)}
                  />
                ))}
              </div>
            </Accordion>
          )}
        </>
      )}
    </div>
  )
}

export default SwitchImplementingPartnerDropDown
