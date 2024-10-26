
'use client'
import React, { useEffect, useRef, useState } from "react";
import CustomButton from "@/components/CustomButton";
// import Badge from '@/components/Badge';
import { TeamWithChildren } from "@/types/teamWithChildren.interface";
import { WorkshopInfo } from "@/types/workshopInfo.interface";
import { AttendanceRecord } from "@/types/workshopAttendance.interface";
import { AttendanceStatus } from "@/types/attendanceStatus.enum";
import { Child } from "@/types/child.interface";

interface VerticalStepperProps {
  workshops: string[];
  currentWorkshop: number;
  onAttendanceChange: (childId: number, status: AttendanceStatus) => void;
  onSaveAttendance: () => void;
  teamDetails: TeamWithChildren;
  workshopDetails: WorkshopInfo[];
  childs: Child[];
  animationDuration?: number;
  isSavingAttendance: boolean;
  isSaved: boolean;
}

const VerticalStepper: React.FC<VerticalStepperProps> = ({
  workshops,
  currentWorkshop,
  onAttendanceChange,
  onSaveAttendance,
  workshopDetails,
  childs,
  animationDuration = 1,
  isSavingAttendance,
  isSaved,
}) => {
  const [checked, setChecked] = useState(0);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [animatedSteps, setAnimatedSteps] = useState<number[]>([]);
  const stepRefs = useRef<Array<React.RefObject<HTMLDivElement>>>([]);

  const handleAttendanceChange = (
    childId: number,
    newAttendance: AttendanceStatus
  ) => {
    setAttendanceData((prevData) => {
      const updatedAttendanceData = prevData.map((entry) =>
        entry.child_id === childId
          ? { ...entry, attendance: newAttendance }
          : entry
      );
      if (!updatedAttendanceData.some((entry) => entry.child_id === childId)) {
        updatedAttendanceData.push({
          child_id: childId,
          attendance: newAttendance,
        });
      }
      return updatedAttendanceData;
    });
    onAttendanceChange(childId, newAttendance);
  };

  const handleAccordionToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const itemAnimationDuration = animationDuration / workshops.length;

  useEffect(() => {
    const createAnimation = () => {
      setChecked(0);
      setAnimatedSteps([]);
      for (let i = 0; i < currentWorkshop; i++) {
        setTimeout(() => {
          setAnimatedSteps((prev) => [...prev, i]);
          setChecked((prev) => Math.min(prev + 1, currentWorkshop));
        }, itemAnimationDuration * (i + 1) * 1200);
      }
    };

    createAnimation();
  }, [currentWorkshop, itemAnimationDuration]);

  useEffect(() => {
    if (checked === currentWorkshop) {
      setOpenIndex(currentWorkshop);
      // Scroll to the current step
      stepRefs.current[currentWorkshop]?.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [checked, currentWorkshop]);

  // Initialize stepRefs array
  useEffect(() => {
    stepRefs.current = workshops.map(() => React.createRef<HTMLDivElement>());
  }, [workshops]);

  useEffect(() => {
    if (workshopDetails.length > 0) {
      const newAttendanceData: AttendanceRecord[] = childs.map(
        (child: Child) => ({
          child_id: child.id,
          attendance: "",
        })
      );
      setAttendanceData(newAttendanceData);
    }
  }, [workshopDetails, currentWorkshop, childs]);

  useEffect(() => {
    if (isSaved) {
      if (checked < workshops.length - 1) {
        setAnimatedSteps((prev) => [...prev, checked + 1]);
        setChecked((prev) => prev + 1);

        // Automatically open the next accordion step
        setOpenIndex(checked + 1);
        stepRefs.current[checked + 1]?.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [isSaved, checked, workshops.length]);

  return (
    <div className="w-full mx-auto">
      {workshops.map((workshop, index) => {
        const isCurrent =
          index === currentWorkshop && checked === currentWorkshop;
        const isPrevious = index < currentWorkshop;
        const isOpen = index === openIndex && isCurrent;

        return (
          <div key={index} className="relative pb-2 pl-7">
            <div
              onClick={
                isCurrent ? () => handleAccordionToggle(index) : undefined
              }
              className={`bg-card flex items-center justify-between w-full p-5 font-medium text-white dark:bg-gray-900 transition-colors ${
                isCurrent ? "rounded-t-lg rounded-b-none" : "rounded-lg"
              } ${
                isCurrent &&
                "cursor-pointer hover:bg-card-dark dark:hover:bg-gray-800"
              }`}
            >
              {/* Draw circle for each step */}
              <span
                className={`absolute left-0 w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all duration-500 ease-in-out ${
                  isCurrent
                    ? "bg-blue-500 border-blue-500"
                    : isPrevious && animatedSteps.includes(index)
                    ? "bg-green-500 border-green-500"
                    : "bg-gray-300 border-gray-300"
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
                ) : (
                  <span
                    className={`w-3 h-3 bg-white rounded-full transition-opacity duration-500 ease-in-out ${
                      animatedSteps.includes(index)
                        ? "opacity-0"
                        : "opacity-100"
                    }`}
                  ></span>
                )}
              </span>
              {/* Draw line between steps */}
              {index < workshops.length - 1 && (
                <span
                  className={`absolute left-[9px] top-[2.6rem] bottom-[-25px] w-[2px] ${
                    index < checked
                      ? "bg-green-500"
                      : index === checked
                      ? "bg-blue-500"
                      : "bg-gray-300"
                  } `}
                />
              )}

              <div className={`${isCurrent ? "font-bold" : ""}`}>
                {workshop}
              </div>

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
                isOpen && isCurrent ? "open" : "closed"
              }`}
              ref={stepRefs.current[index]}
            >
              {isOpen && isCurrent && (
                <div className="p-4 rounded-b-lg bg-card transition-all duration-300 ease-in-out dark:bg-gray-900 dark:text-white">
                  {childs.length === 0 ? (
                    <h3 className="text-lg font-semibold">
                      No children in current workshop
                    </h3>
                  ) : (
                    childs.map((entry: Child) => {
                      const { id, first_name, last_name } = entry;
                      const attendanceEntry = attendanceData.find(
                        (e) => e.child_id === id
                      );
                      const currentAttendance = attendanceEntry
                        ? attendanceEntry.attendance
                        : null;
                      return (
                        <div
                          key={id}
                          className="flex flex-col sm:flex-row my-2"
                        >
                          <span className="flex-1 min-w-0 mb-2 sm:mb-0 sm:mr-4">
                            {first_name} {last_name}
                          </span>
                          <div className="flex space-x-4">
                            {["present", "absent", "cancelled"].map(
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
                                      currentAttendance !== "" &&
                                      currentAttendance !== null
                                    }
                                    onChange={() =>
                                      handleAttendanceChange(
                                        id,
                                        status as AttendanceStatus
                                      )
                                    }
                                  />
                                  <span className="ml-2 capitalize">
                                    {status}
                                  </span>
                                </label>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  {
                    <div className="flex items-center justify-end border-t mt-4 border-gray-200 rounded-b dark:border-gray-600">
                      <CustomButton
                        className="mt-4"
                        label="Save Attendance"
                        variant="secondary"
                        onClick={onSaveAttendance}
                        isBusy={isSavingAttendance}
                        // disabled when there are no childs or if attendnance is not checked fo all childs
                        isDisabled={
                          childs.length === 0 ||
                          !attendanceData.every(
                            (entry) =>
                              entry.attendance !== "" &&
                              entry.attendance !== null
                          )
                        }
                      />
                    </div>
                  }
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VerticalStepper;
