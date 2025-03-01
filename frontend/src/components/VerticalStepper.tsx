'use client'
import React, { useEffect, useRef, useState } from 'react'

import { useRouter, useParams } from 'next/navigation'

import CustomButton from './CustomButton'
import DatePicker from './DatePicker'
import EmptyState from './EmptyState'

import { UsersIcon } from '@heroicons/react/24/solid'

import { TeamWithChildren } from '@/types/teamWithChildren.interface'
import { WorkshopInfo } from '@/types/workshopInfo.interface'
import { AttendanceRecord } from '@/types/workshopAttendance.interface'
import { AttendanceStatus } from '@/types/attendanceStatus.enum'
import { Child } from '@/types/child.interface'

interface VerticalStepperProps {
  workshops: string[]
  currentWorkshop: number
  onAttendanceChange: (childId: number, status: AttendanceStatus) => void
  onSaveAttendance: () => void
  onDateChange: (date: string) => void
  teamDetails: TeamWithChildren
  workshopDetails: WorkshopInfo[]
  childs: Child[]
  animationDuration?: number
  isSavingAttendance: boolean
  isSaved: boolean
}

const VerticalStepper: React.FC<VerticalStepperProps> = ({
  workshops,
  currentWorkshop,
  onAttendanceChange,
  onSaveAttendance,
  onDateChange,
  workshopDetails,
  childs,
  animationDuration = 1,
  isSavingAttendance,
  isSaved,
}) => {
  const router = useRouter()
  const params = useParams()
  const communityId = params?.communityId as string
  const teamId = params?.teamId as string

  const [checked, setChecked] = useState(1)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])
  const [animatedSteps, setAnimatedSteps] = useState<number[]>([])
  const stepRefs = useRef<Array<React.RefObject<HTMLDivElement>>>([])

  const handleAttendanceChange = (
    childId: number,
    newAttendance: AttendanceStatus,
  ): void => {
    setAttendanceData((prevData) => {
      const updatedAttendanceData = prevData.map((entry) =>
        entry.child_id === childId
          ? { ...entry, attendance: newAttendance }
          : entry,
      )
      if (!updatedAttendanceData.some((entry) => entry.child_id === childId)) {
        updatedAttendanceData.push({
          child_id: childId,
          attendance: newAttendance,
        })
      }
      return updatedAttendanceData
    })
    onAttendanceChange(childId, newAttendance)
  }

  // const handleAccordionToggle = (index: number) => {
  //   setOpenIndex(openIndex === index ? null : index);
  // };

  const itemAnimationDuration = animationDuration / workshops.length

  // const hasAnimated = useRef(false)

  useEffect(() => {
    const animateToCurrentWorkshop = (): void => {
      setChecked(0)
      setAnimatedSteps([])
      for (let i = 0; i < currentWorkshop; i++) {
        setTimeout(
          () => {
            setAnimatedSteps((prev) => [...prev, i])
            setChecked((prev) => Math.min(prev + 1, currentWorkshop))
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
          const isOpen = index === openIndex && isCurrent

          return (
            <div key={index} className="relative pb-2 pl-7">
              <div
                // onClick={
                //   isCurrent ? () => handleAccordionToggle(index) : undefined
                // }
                className={`bg-card flex items-center justify-between w-full p-5 font-medium text-white transition-colors ${
                  isCurrent ? 'rounded-t-lg rounded-b-none' : 'rounded-lg'
                } ${isCurrent && 'cursor-pointer hover:bg-card-dark '}`}
              >
                {/* Draw circle for each step */}
                <span
                  className={`absolute left-0 w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all duration-500 ease-in-out ${
                    isCurrent
                      ? 'bg-blue-500 border-blue-500' // Adjusted: Current step with blue border and white background
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
                {/* Draw line between steps */}
                {index < workshops.length - 1 && (
                  <span
                    className={`absolute left-[9px] top-[2.7rem] bottom-[-25px] w-[2px] ${
                      index < checked
                        ? 'bg-green-500'
                        : index === checked
                          ? 'bg-blue-500'
                          : 'bg-gray-300'
                    } `}
                  />
                )}

                <div className={`${isCurrent ? 'font-bold' : ''}`}>
                  {workshop}
                </div>

                {isCurrent && <DatePicker onDateChange={onDateChange} />}

                {/* <div
                    className={`flex items-center space-x-2 ${
                      isCurrent ? "font-bold" : ""
                    }`}
                  >
                    {isPrevious && workshopDetails[index]?.attendance && (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Badge variant="success">
                          Present: {workshopDetails[index].attendance.present || 0}
                        </Badge>
                        <Badge variant="warning">
                          Absent: {workshopDetails[index].attendance.absent || 0}
                        </Badge>
                        <Badge variant="error">
                          Cancelled: {workshopDetails[index].attendance.cancelled || 0}
                        </Badge>
                      </div>
                    )}
                  </div> */}
              </div>
              <div
                className={`card-content ${
                  isOpen && isCurrent ? 'open' : 'closed'
                }`}
                ref={stepRefs.current[index]}
              >
                {isOpen && isCurrent && (
                  <div className="p-4 rounded-b-lg bg-card transition-all duration-300 ease-in-out">
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
                          key={id}
                          className="flex flex-col sm:flex-row my-2"
                        >
                          <span className="flex-1 min-w-0 mb-2 sm:mb-0 sm:mr-4">
                            {first_name} {last_name}
                          </span>
                          <div className="flex space-x-4">
                            {['present', 'absent', 'cancelled'].map(
                              (status) => (
                                <label
                                  key={status}
                                  className="flex items-center cursor-pointer"
                                >
                                  <input
                                    type="radio"
                                    name={`attendance-${id}`}
                                    value={status}
                                    checked={
                                      currentAttendance === status &&
                                      currentAttendance !== '' &&
                                      currentAttendance !== null
                                    }
                                    onChange={() =>
                                      handleAttendanceChange(
                                        id,
                                        status as AttendanceStatus,
                                      )
                                    }
                                  />
                                  <span className="ml-2 capitalize">
                                    {status}
                                  </span>
                                </label>
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
                          // disabled when there are no childs or if attendnance is not checked fo all childs
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
                )}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

export default VerticalStepper
