'use client'

import React, { useState, useEffect } from 'react'

import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryFunctionContext,
} from 'react-query'

import VerticalStepper from '@/components/VerticalStepper'

import getTeamById from '@/api/services/teams/getTeamById'
import addWorkshopToTeam from '@/api/services/workshops/addWorkshopToTeam'
import getWorkshopsByTeam from '@/api/services/workshops/getWorkshopsByTeam'
import { TeamWithChildren } from '@/types/teamWithChildren.interface'

import { WorkshopInfo } from '@/types/workshopInfo.interface'

import SkeletonLoader from '@/components/SkeletonLoader'
import AlertBanner from '@/components/AlertBanner'

import { useParams } from 'next/navigation'

interface AttendanceRecord {
  attendance: string
  child_id: number
}

interface Attendance {
  date: string
  workshop_number: number
  attendance: AttendanceRecord[]
}

const ProgramTrackerAttendancePage: React.FC = () => {
  const queryClient = useQueryClient()
  const params = useParams()
  const teamId = params?.teamId as string

  const [attendance, setAttendance] = useState<Record<number, string>>({})
  const [isSaved, setIsSaved] = useState<boolean>(false)
  const [selectedDate, setSelectedDate] = useState<string>('')

  const [errorMessage, setErrorMessage] = useState<string | null>('')

  // Fetch team details when teamId changes
  // eslint-disable  @typescript-eslint/no-explicit-any
  const fetchTeamById = async ({
    queryKey,
  }: QueryFunctionContext<string[], any>): Promise<TeamWithChildren> => {
    try {
      const [, teamId] = queryKey // Extract teamId from the query key
      const numericTeamId = Number(teamId)
      if (isNaN(numericTeamId)) {
        throw new Error('Invalid team ID')
      }
      return await getTeamById(numericTeamId)
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
    data: selectedTeam,
    isLoading: isLoadingTeam,
    error: hasErrorFetchingTeam,
  } = useQuery(['team', teamId], fetchTeamById, {
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000,
  })

  const handleDateChange = (date: string): void => {
    setSelectedDate(date)
  }

  const handleAttendanceChange = (childId: number, status: string): void => {
    setAttendance((prev) => ({
      ...prev,
      [childId]: status,
    }))
  }

  const saveAttendance = async (): Promise<void> => {
    if (!selectedTeam) {
      throw new Error('No team selected')
    }

    const apiBody: Attendance = {
      date: selectedDate || new Date().toISOString().split('T')[0],
      workshop_number: selectedTeam.program.progress.current + 1,
      attendance: Object.entries(attendance).map(([childId, status]) => ({
        attendance: status,
        child_id: parseInt(childId, 10),
      })),
    }

    await addWorkshopToTeam(selectedTeam.id, apiBody)
  }

  const fetchWorkshops = async (): Promise<WorkshopInfo[]> => {
    if (!selectedTeam?.id) throw new Error('No team selected')
    return await getWorkshopsByTeam(selectedTeam.id)
  }

  const { data: workshopDetails = [], refetch: refetchWorkshops } = useQuery(
    ['workshops', selectedTeam?.id],
    fetchWorkshops,
    {
      enabled: false, // Disable automatic fetching
    },
  )

  const { mutate: handleSaveAttendance, isLoading: isSavingAttendance } =
    useMutation(saveAttendance, {
      onSuccess: async () => {
        setErrorMessage(null)
        await queryClient.invalidateQueries(['team', teamId])
        setTimeout(() => {
          setIsSaved(false)
        }, 50)
        await refetchWorkshops()
      },
      onError: (error: Error) => {
        setErrorMessage(error.message)
      },
    })

  useEffect(() => {
    if (selectedTeam?.children?.length) {
      const initialAttendance: Record<number, string> = {}
      selectedTeam.children.forEach((child) => {
        initialAttendance[child.id] = ''
      })
      setAttendance(initialAttendance)
    }
  }, [selectedTeam])

  const workshops = [
    'Workshop 1',
    'Workshop 2',
    'Workshop 3',
    'Workshop 4',
    'Workshop 5',
    'Workshop 6',
    'Workshop 7',
    'Workshop 8',
    'Workshop 9',
    'Workshop 10',
    'Workshop 11',
    'Workshop 12',
  ]

  const currentWorkshop = selectedTeam?.program.progress.current ?? 0

  return (
    <>
      {isLoadingTeam ? (
        <div className="w-full mx-auto">
          {Array.from({ length: 12 }, (_, i) => (
            <SkeletonLoader key={i} type="stepper" index={i} totalItems={12} />
          ))}
        </div>
      ) : (
        selectedTeam && (
          <VerticalStepper
            workshops={workshops}
            currentWorkshop={currentWorkshop}
            childs={selectedTeam.children}
            onDateChange={handleDateChange}
            onAttendanceChange={handleAttendanceChange}
            onSaveAttendance={handleSaveAttendance}
            teamDetails={selectedTeam}
            workshopDetails={workshopDetails}
            isSavingAttendance={isSavingAttendance}
            isSaved={isSaved}
          />
        )
      )}

      {!!hasErrorFetchingTeam && (
        <AlertBanner variant="error" message={errorMessage ?? ''} />
      )}
    </>
  )
}

export default ProgramTrackerAttendancePage
