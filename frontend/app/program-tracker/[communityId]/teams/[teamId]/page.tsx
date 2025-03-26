'use client'

import React, { useState, useEffect } from 'react'

import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryFunctionContext,
} from '@tanstack/react-query'

import VerticalStepper from '@/components/VerticalStepper'

import getTeamById from '@/api/services/teams/getTeamById'
import addWorkshopToTeam from '@/api/services/workshops/addWorkshopToTeam'
import getWorkshopById from '@/api/services/workshops/getWorkshopById'
import updateWorkshopByTeam from '@/api/services/workshops/updateWorkshopByTeam'

import { TeamWithChildren } from '@/types/teamWithChildren.interface'

import { WorkshopAttendance } from '@/types/workshopAttendance.interface'

import SkeletonLoader from '@/components/SkeletonLoader'
import AlertBanner from '@/components/AlertBanner'

import { useParams } from 'next/navigation'

interface AttendanceRecord {
  attendance: string
  child_id: number
}

interface Attendance {
  date: string
  workshop_number?: number
  attendance: AttendanceRecord[]
}

const ProgramTrackerAttendancePage: React.FC = () => {
  const queryClient = useQueryClient()
  const params = useParams()
  const teamId = params?.teamId as string

  const [selectedWorkshop, setSelectedWorkshop] = useState<number>(0)

  const [attendance, setAttendance] = useState<Record<number, string>>({})
  const [isSaved, setIsSaved] = useState<boolean>(false)
  const [savedWorkshop, setSavedWorkshop] = useState<boolean>(false)
  const [selectedDate, setSelectedDate] = useState<string>('')

  const [workshopById, setWorkshopById] = useState<WorkshopAttendance | null>(
    null,
  )

  const [isLoadingAttendanceData, setIsLoadingAttendanceData] = useState(false)

  const [errorMessage, setErrorMessage] = useState<string | null>('')

  // Fetch team details when teamId changes
  const fetchTeamById = async ({
    queryKey,
  }: QueryFunctionContext<[string, string]>): Promise<TeamWithChildren> => {
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
    isPending: isLoadingTeam,
    error: hasErrorFetchingTeam,
  } = useQuery({
    queryKey: ['team', teamId],
    queryFn: fetchTeamById,
    enabled: Boolean(teamId),
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

  const fetchWorkshopById = async (index: number): Promise<void> => {
    setIsLoadingAttendanceData(true)
    const workshopId = index

    if (!teamId || !workshopId) {
      throw new Error('Invalid team or workshop ID')
    }

    try {
      const response = await getWorkshopById(Number(teamId), workshopId)
      setWorkshopById(response)

      if (response?.attendance) {
        const attendanceRecord: Record<number, string> = {}
        response.attendance.forEach(({ child_id, attendance }) => {
          attendanceRecord[child_id] = attendance
        })
        setAttendance(attendanceRecord)
      }
    } catch (error) {
      console.error('Error fetching workshop:', error)
    } finally {
      setIsLoadingAttendanceData(false)
    }
  }

  const saveAttendance = async (): Promise<void> => {
    if (!selectedTeam) {
      throw new Error('No team selected')
    }

    const apiBody: Attendance = {
      date: selectedDate || new Date().toISOString().split('T')[0],
      workshop_number: selectedWorkshop,
      attendance: Object.entries(attendance).map(([childId, status]) => ({
        attendance: status,
        child_id: parseInt(childId, 10),
      })),
    }

    const workshopId = workshopById?.workshop.id
    setSavedWorkshop(false)

    if (selectedWorkshop === selectedTeam?.program.progress.current + 1) {
      await addWorkshopToTeam(selectedTeam.id, apiBody)
    } else if (workshopId !== undefined) {
      await updateWorkshopByTeam(workshopId, apiBody)
    } else {
      throw new Error('Workshop ID is undefined')
    }
  }

  // this might be used in the future for fetching details of all workshops
  // const fetchWorkshops = async (): Promise<WorkshopInfo[]> => {
  //   if (!selectedTeam?.id) throw new Error('No team selected')
  //   return await getWorkshopsByTeam(selectedTeam.id)
  // }

  // const { data: workshopDetails = [], refetch: refetchWorkshops } = useQuery(
  //   ['workshops', selectedTeam?.id],
  //   fetchWorkshops,
  //   {
  //     enabled: false, // Disable automatic fetching
  //   },
  // )

  const { mutate: handleSaveAttendance, isPending: isSavingAttendance } =
    useMutation({
      mutationFn: saveAttendance,
      onSuccess: async () => {
        setErrorMessage(null)
        await queryClient.invalidateQueries({ queryKey: ['team', teamId] })
        setSavedWorkshop(true)
        setIsSaved(true)
        setTimeout(() => setIsSaved(false), 100)
      },
      onError: (error: Error) => {
        setErrorMessage(error.message)
      },
    })

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

  useEffect(() => {
    if (selectedTeam?.children?.length) {
      const initialAttendance: Record<number, string> = {}
      selectedTeam.children.forEach((child) => {
        if (child.id !== undefined) {
          initialAttendance[child.id] = ''
        }
      })
      setAttendance(initialAttendance)
    }
  }, [selectedTeam, isSavingAttendance])

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
            setSelectedWorkshop={setSelectedWorkshop}
            currentWorkshop={currentWorkshop}
            childs={selectedTeam.children}
            onDateChange={handleDateChange}
            onAttendanceChange={handleAttendanceChange}
            fetchWorkshopById={fetchWorkshopById}
            onSaveAttendance={handleSaveAttendance}
            teamDetails={selectedTeam}
            workshopById={workshopById}
            isLoadingAttendanceData={isLoadingAttendanceData}
            isSavingAttendance={isSavingAttendance}
            isSaved={isSaved}
            savedWorkshop={savedWorkshop}
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
