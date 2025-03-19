'use client'
import React, { useEffect, useRef, useState } from 'react'

import { useRouter, useParams } from 'next/navigation'

import CustomButton from './CustomButton'
import DatePicker from './DatePicker'
import EmptyState from './EmptyState'
import Accordion from './Accordion'
import LoadingOverlay from './LoadingOverlay'
import Text from './Text'

import { UsersIcon } from '@heroicons/react/24/solid'

import { TeamWithChildren } from '@/types/teamWithChildren.interface'
import { WorkshopInfo } from '@/types/workshopInfo.interface'
import { AttendanceRecord } from '@/types/workshopAttendance.interface'
import { AttendanceStatus } from '@/types/attendanceStatus.enum'
import { WorkshopAttendance } from '@/types/workshopAttendance.interface'
import { Child } from '@/types/child.interface'

interface VerticalStepperProps {
  workshops: string[]
  currentWorkshop: number
  setSelectedWorkshop: (workshop: number) => void
  onAttendanceChange: (childId: number, status: AttendanceStatus) => void
  onSaveAttendance: () => void
  onDateChange: (date: string) => void
  fetchWorkshopById: (workshopId: number) => void
  teamDetails: TeamWithChildren
  workshopDetails: WorkshopInfo[]
  workshopById: WorkshopAttendance | null
  childs: Child[]
  animationDuration?: number
  isSavingAttendance: boolean
  isSaved: boolean
  isLoadingAttendanceData: boolean
}

const VerticalStepper: React.FC<VerticalStepperProps> = ({
  workshops,
  currentWorkshop,
  onAttendanceChange,
  onSaveAttendance,
  onDateChange,
  fetchWorkshopById,
  workshopDetails,
  workshopById,
  childs,
  animationDuration = 1,
  isSavingAttendance,
  isSaved,
  isLoadingAttendanceData,
  setSelectedWorkshop,
}) => {
  const router = useRouter()
  const params = useParams()

  const { communityId, teamId } = params

  const [checked, setChecked] = useState(1)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])
  const [animatedSteps, setAnimatedSteps] = useState<number[]>([])
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
  const handleAccordionToggle = (index: number) => {
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

    setOpenIndex(isCurrentlyOpen ? null : index)
  }

  useEffect(() => {
    if (workshopById) {
      setAttendanceData(workshopById.attendance)
    }
  }, [workshopById])

  const itemAnimationDuration = animationDuration / workshops.length

  useEffect(() => {
    const animateToCurrentWorkshop = (): void => {
      setChecked(0)
      setAnimatedSteps([])

      for (let i = 0; i < currentWorkshop; i++) {
        setTimeout(
          () => {
            setAnimatedSteps((prev) => [...prev, i])
            setChecked((prev) => Math.min(prev + 1, currentWorkshop))

            if (i === currentWorkshop - 1) {
              // Open the correct workshop
              setOpenIndex(currentWorkshop)

              // Scroll to the current step
              stepRefs.current[currentWorkshop]?.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
              })

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
          },
          itemAnimationDuration * (i + 1) * 1200,
        )
      }
    }

    animateToCurrentWorkshop()
  }, [currentWorkshop, itemAnimationDuration])

  useEffect(() => {
    if (checked === currentWorkshop) {
      setOpenIndex(currentWorkshop)
      // Scroll to the current step
      stepRefs.current[currentWorkshop]?.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [checked, currentWorkshop])

  // Initialize stepRefs array
  useEffect(() => {
    stepRefs.current = workshops.map(() => React.createRef<HTMLDivElement>())
  }, [workshops])

  useEffect(() => {
    if (workshopDetails.length > 0) {
      const newAttendanceData: AttendanceRecord[] = childs.map(
        (child: Child) => ({
          child_id: child.id,
          attendance: '',
        }),
      )
      setAttendanceData(newAttendanceData)
    }
  }, [workshopDetails, currentWorkshop, childs])

  useEffect(() => {
    if (isSaved) {
      setChecked((prevChecked) => {
        const nextChecked = prevChecked + 1

        // Ensure `nextChecked` does not exceed available workshops
        if (nextChecked < workshops.length) {
          setAnimatedSteps((prev) => {
            // Only add `nextChecked` if it's not already in the array
            if (!prev.includes(prevChecked)) {
              return [...prev, prevChecked]
            }
            if (!prev.includes(nextChecked)) {
              return [...prev, nextChecked]
            }
            return prev
          })

          // Update the open index and scroll to view the next workshop
          setOpenIndex(nextChecked)
          stepRefs.current[nextChecked]?.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
        }

        return nextChecked // Increment to the next step
      })
    }
  }, [isSaved, workshops.length])

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
          const isCurrent =
            index === currentWorkshop && checked === currentWorkshop
          const isPrevious = index < currentWorkshop
          const isOpen = index === openIndex

          return (
            <div key={index} className="relative pb-2 pl-7">
              <Accordion
                key={index}
                index={index}
                id={`accordion-item-${index}`}
                isOpen={openIndex === index}
                onClick={() => handleAccordionToggle(index)}
                buttonRefs={buttonRefs}
                panelRefs={panelRefs}
                isDisabled={index > checked}
                title={
                  <div className="relative flex items-center">
                    {/* Step Circle */}
                    <span
                      className={`absolute left-[-3rem] w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all duration-500 ease-in-out ${
                        isCurrent
                          ? 'bg-blue-500 border-blue-500' // Current step with blue border and white background
                          : isPrevious && animatedSteps.includes(index)
                            ? 'bg-green-500 border-green-500' // Completed step
                            : 'bg-gray-300 border-gray-300' // Uncompleted step
                      }`}
                    >
                      {isPrevious && animatedSteps.includes(index) ? (
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
                        // Ensure the white dot is shown for the current step
                        <span className="w-3 h-3 bg-white rounded-full transition-opacity duration-500 ease-in-out opacity-100"></span>
                      ) : (
                        <span
                          className={`w-3 h-3 bg-white rounded-full transition-opacity duration-500 ease-in-out ${
                            animatedSteps.includes(index)
                              ? 'opacity-0'
                              : 'opacity-100'
                          }`}
                        ></span>
                      )}
                    </span>

                    {/* Draw vertical line ONLY for steps before the last one */}
                    {index < workshops.length - 1 && (
                      <span
                        className={`absolute left-[-39px] top-[1.4rem] w-[2px] transition-all duration-300 ${
                          index < checked
                            ? 'bg-green-500'
                            : index === checked
                              ? 'bg-blue-500'
                              : 'bg-gray-300'
                        }`}
                        style={{
                          height: isOpen
                            ? `${accordionHeights[index] || 64}px`
                            : `${lastKnownHeights[index] || 64}px`, // Keep last height when closing
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
                                      handleAttendanceChange(
                                        id,
                                        status as AttendanceStatus,
                                      )
                                      setSelectedWorkshop(index + 1)
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
    </div>
  )
}

export default VerticalStepper
