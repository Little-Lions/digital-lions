'use client'
import React, { useEffect, useRef, useState } from 'react'

import { useRouter, useParams } from 'next/navigation'

import CustomButton from './ui/CustomButton'
import DatePicker from './ui/DatePicker'
import EmptyState from './ui/EmptyState'
import Accordion from './ui/Accordion'
import LoadingOverlay from './ui/LoadingOverlay'
import Text from './ui/Text'

import { UsersIcon } from '@heroicons/react/24/solid'

import { TeamWithChildren } from '@/types/teamWithChildren.interface'
import { AttendanceRecord } from '@/types/workshopAttendance.interface'
import { AttendanceStatus } from '@/types/attendanceStatus.enum'
import { WorkshopAttendance } from '@/types/workshopAttendance.interface'
import { Child } from '@/types/child.interface'
import Toast from './ui/Toast'

interface VerticalStepperProps {
  workshops: string[]
  currentWorkshop: number
  setSelectedWorkshop: (workshop: number) => void
  onAttendanceChange: (childId: number, status: AttendanceStatus) => void
  onSaveAttendance: () => void
  onDateChange: (date: string) => void
  fetchWorkshopById: (workshopId: number) => void
  teamDetails: TeamWithChildren
  workshopById: WorkshopAttendance | null
  childs: Child[]
  isSavingAttendance: boolean
  isSaved: boolean
  savedWorkshop: boolean
  isLoadingAttendanceData: boolean
}

const VerticalStepper: React.FC<VerticalStepperProps> = ({
  workshops,
  currentWorkshop,
  onAttendanceChange,
  onSaveAttendance,
  onDateChange,
  fetchWorkshopById,
  workshopById,
  childs,
  isSavingAttendance,
  isSaved,
  savedWorkshop,
  isLoadingAttendanceData,
  setSelectedWorkshop,
}) => {
  const router = useRouter()
  const params = useParams()

  const { communityId, teamId } = params

  const [checked, setChecked] = useState(1)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])
  const stepRefs = useRef<Array<React.RefObject<HTMLDivElement>>>([])

  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])
  const panelRefs = useRef<(HTMLDivElement | null)[]>([])
  const [accordionHeights, setAccordionHeights] = useState<number[]>(
    Array(12).fill(64),
  )
  const [lastKnownHeights, setLastKnownHeights] = useState<number[]>([])

  const handleAttendanceChange = (
    childId: number,
    newAttendance: AttendanceStatus,
  ): void => {
    setAttendanceData((prevData) => {
      const existingIndex = prevData.findIndex(
        (entry) => entry.child_id === childId,
      )

      if (existingIndex !== -1) {
        return prevData.map((entry, index) =>
          index === existingIndex
            ? { ...entry, attendance: newAttendance }
            : entry,
        )
      } else {
        return [...prevData, { child_id: childId, attendance: newAttendance }]
      }
    })
    onAttendanceChange(childId, newAttendance)
  }

  const handleAccordionToggle = (index: number): void => {
    const isCurrentlyOpen = openIndex === index
    const isPreviousWorkshop = index < currentWorkshop

    requestAnimationFrame(() => {
      if (buttonRefs.current[index] && panelRefs.current[index]) {
        const buttonHeight = buttonRefs.current[index]?.offsetHeight || 64
        const panelHeight = panelRefs.current[index]?.scrollHeight || 0
        const totalHeight = isCurrentlyOpen ? 64 : buttonHeight + panelHeight

        setAccordionHeights((prev) => {
          const newHeights = [...prev]
          newHeights[index] = totalHeight
          return newHeights
        })

        if (!isCurrentlyOpen) {
          setLastKnownHeights((prev) => {
            const newLastHeights = [...prev]
            newLastHeights[index] = totalHeight
            return newLastHeights
          })

          if (isPreviousWorkshop) {
            fetchWorkshopById(index + 1)
          }
        }
      }
    })

    // Clear attendance data when opening the current workshop
    if (index === currentWorkshop || isCurrentlyOpen) {
      setAttendanceData((prev) =>
        prev.map((record) => ({ ...record, attendance: '' })),
      )
    }

    setOpenIndex(() => {
      if (isCurrentlyOpen) return null // Close if it's already open
      if (isPreviousWorkshop && isSaved) return null // Close previous steps on save
      return index // Open normally
    })
  }

  useEffect(() => {
    if (workshopById && !isSaved && openIndex !== currentWorkshop) {
      setAttendanceData(workshopById.attendance)
    } else if (isSaved && openIndex === currentWorkshop) {
      setAttendanceData((prev) =>
        prev.map((record) => ({ ...record, attendance: '' })),
      )
    }
  }, [workshopById, isSaved, openIndex, currentWorkshop])

  // Closes previous workshops, moves forward for current after a save
  useEffect(() => {
    if (isSaved) {
      setOpenIndex((prev) => {
        if (prev === null) return null
        return prev < currentWorkshop ? null : prev + 1
      })
    }
  }, [isSaved, currentWorkshop])

  useEffect(() => {
    const animateToCurrentWorkshop = (): void => {
      setChecked(0)

      for (let i = 0; i < currentWorkshop; i++) {
        setTimeout(() => {
          setChecked((prev) => Math.min(prev + 1, currentWorkshop))

          if (i === currentWorkshop - 1) {
            // Open the correct workshop
            setOpenIndex(currentWorkshop)

            // Update accordion height dynamically
            requestAnimationFrame(() => {
              if (
                buttonRefs.current[currentWorkshop] &&
                panelRefs.current[currentWorkshop]
              ) {
                const buttonHeight =
                  buttonRefs.current[currentWorkshop]?.offsetHeight || 64
                const panelHeight =
                  panelRefs.current[currentWorkshop]?.scrollHeight || 0
                const totalHeight = buttonHeight + panelHeight

                setAccordionHeights((prev) => {
                  const newHeights = [...prev]
                  newHeights[currentWorkshop] = totalHeight
                  return newHeights
                })

                setLastKnownHeights((prev) => {
                  const newLastHeights = [...prev]
                  newLastHeights[currentWorkshop] = totalHeight
                  return newLastHeights
                })
              }
            })
          }
        })
      }
    }

    animateToCurrentWorkshop()
  }, [currentWorkshop])

  return (
    <div className="w-full mx-auto">
      {childs.length === 0 ? (
        <EmptyState
          title="No children in current workshop"
          pictogram={<UsersIcon />}
          actionButton={
            <CustomButton
              label="Add child"
              onClick={() =>
                router.push(`/communities/${communityId}/teams/${teamId}`)
              }
              variant="primary"
            />
          }
        />
      ) : (
        workshops.map((workshop, index) => {
          const isPrevious = index < checked
          const isCurrent = index === checked
          const isOpen = index === openIndex

          return (
            <div key={index} className="relative pb-2 pl-7">
              <Accordion
                key={index}
                index={index}
                id={`vertical-stepper-item-${index}`}
                isOpen={isOpen}
                onClick={() => handleAccordionToggle(index)}
                buttonRefs={buttonRefs}
                panelRefs={panelRefs}
                isDisabled={!isCurrent && !isPrevious} // Disable future steps
                title={
                  <div className="relative flex items-center">
                    {/* Step Circle */}
                    <span
                      className={`absolute left-[-3rem] w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all duration-500 ease-in-out ${
                        isCurrent
                          ? 'bg-blue-500 border-blue-500' // Current step: Blue
                          : isPrevious
                            ? 'bg-green-500 border-green-500' // Completed steps: Green
                            : 'bg-gray-300 border-gray-300' // Uncompleted steps: Gray
                      }`}
                    >
                      {isPrevious ? (
                        <svg
                          className="h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : isCurrent ? (
                        // White inner circle for the current step
                        <span className="w-3 h-3 bg-white rounded-full"></span>
                      ) : (
                        // Future steps just remain gray
                        <span className="w-3 h-3 bg-white rounded-full opacity-100"></span>
                      )}
                    </span>

                    {/* Vertical Line between steps */}
                    {index < workshops.length - 1 && (
                      <span
                        className={`absolute left-[-39px] top-[1.4rem] w-[2px] transition-all duration-300 ${
                          isPrevious
                            ? 'bg-green-500'
                            : isCurrent
                              ? 'bg-blue-500'
                              : 'bg-gray-300'
                        }`}
                        style={{
                          height:
                            isOpen || (isCurrent && openIndex === index)
                              ? `${accordionHeights[index] || 64}px`
                              : isPrevious
                                ? `${lastKnownHeights[index] || 64}px`
                                : '64px', // Default height for future steps
                        }}
                      />
                    )}

                    {/* Step Title */}
                    <span>{workshop}</span>
                    {/* Right Section: DatePicker */}
                    {isCurrent && (
                      <div
                        className="ml-4 sm:ml-8"
                        onClick={(e) => e.stopPropagation()} // Prevents the click from reaching the button
                      >
                        <DatePicker onDateChange={onDateChange} />
                      </div>
                    )}
                  </div>
                }
              >
                <LoadingOverlay loading={isLoadingAttendanceData}>
                  <div
                    ref={stepRefs.current[index]}
                    className="transition-all duration-300 ease-in-out"
                  >
                    {childs.map((entry: Child) => {
                      const { id, first_name, last_name } = entry
                      const attendanceEntry = attendanceData.find(
                        (e) => e.child_id === id,
                      )
                      const currentAttendance = attendanceEntry
                        ? attendanceEntry.attendance
                        : null
                      return (
                        <div
                          key={`${id}-${workshop}`}
                          className="flex flex-col sm:flex-row my-2"
                        >
                          <Text size="md" className="flex-1">
                            {first_name} {last_name}
                          </Text>
                          <div className="flex space-x-4">
                            {['present', 'absent', 'cancelled'].map(
                              (status) => (
                                <Text key={status} size="sm">
                                  <input
                                    type="radio"
                                    name={`attendance-${id}-${workshop}`}
                                    value={status}
                                    checked={
                                      currentAttendance === status &&
                                      currentAttendance !== '' &&
                                      currentAttendance !== null
                                    }
                                    onChange={() => {
                                      if (id !== undefined) {
                                        handleAttendanceChange(
                                          id,
                                          status as AttendanceStatus,
                                        )
                                        setSelectedWorkshop(index + 1)
                                      }
                                    }}
                                  />
                                  <span className="ml-2 capitalize">
                                    {status}
                                  </span>
                                </Text>
                              ),
                            )}
                          </div>
                        </div>
                      )
                    })}
                    {
                      <div className="flex items-center justify-end border-t mt-4 border-gray-200 rounded-b ">
                        <CustomButton
                          className="mt-4"
                          label="Save Attendance"
                          variant="secondary"
                          onClick={onSaveAttendance}
                          isBusy={isSavingAttendance}
                          // disabled when there are no childs or if attendance is not checked fo all childs
                          isDisabled={
                            childs.length === 0 ||
                            attendanceData.length === 0 || // If there's no attendance data, disable the button
                            !attendanceData.every(
                              (entry) =>
                                entry.attendance !== '' &&
                                entry.attendance !== null,
                            )
                          }
                        />
                      </div>
                    }
                  </div>
                </LoadingOverlay>
              </Accordion>
            </div>
          )
        })
      )}
      {savedWorkshop && (
        <Toast variant="success" message="Successfully updated workshop" />
      )}
    </div>
  )
}

export default VerticalStepper
