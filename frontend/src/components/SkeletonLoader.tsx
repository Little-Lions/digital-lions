import React from "react";
import classNames from "classnames";

// Base props interface with common properties
interface BaseSkeletonLoaderProps {
  type: "title" | "text" | "card" | "button" | "input" | "stepper";
}

// Props for 'title' type
interface TitleSkeletonLoaderProps extends BaseSkeletonLoaderProps {
  type: "title";
  width: string;
  height: string;
  totalItems?: never;
  index?: never;
}

// Props for 'text' type
interface TextSkeletonLoaderProps extends BaseSkeletonLoaderProps {
  type: "text";
  width: string;
  height: string;
  totalItems?: never;
  index?: never;
}

// Props for 'button' type
interface ButtonSkeletonLoaderProps extends BaseSkeletonLoaderProps {
  type: "button";
  width: string;
  height?: never;
  totalItems?: never;
  index?: never;
}

// Props for 'card' type
interface CardSkeletonLoaderProps extends BaseSkeletonLoaderProps {
  type: "card";
  width?: never;
  height?: string;
  totalItems?: never;
  index?: never;
}

interface InputSkeletonLoaderProps extends BaseSkeletonLoaderProps {
  type: "input";
  width?: never;
  height?: never;
  totalItems?: never;
  index?: never;
}

interface StepperSkeletonLoaderProps extends BaseSkeletonLoaderProps {
  type: "stepper";
  totalItems: number;
  index: number;
  width?: never;
  height?: never;
}

// Union of all specific props
type SkeletonLoaderProps =
  | TitleSkeletonLoaderProps
  | TextSkeletonLoaderProps
  | ButtonSkeletonLoaderProps
  | CardSkeletonLoaderProps
  | InputSkeletonLoaderProps
  | StepperSkeletonLoaderProps;

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width,
  height,
  type,
  index,
  totalItems
}) => {
  const baseClasses = "bg-gray-300 animate-pulse rounded-lg";

  const typeClasses = {
    title: "mb-2",
    text: "mb-4 rounded-none",
    button: "mb-4 h-[40px]",
    card: "h-[64px] mb-2 w-full",
    input: "h-[42px] mb-4 w-full",
    label: "h-[16px] mb-2 w-[15%] rounded-none",
    stepper: "h-[64px]",
  };
  const isLast = type === 'stepper' && index === (totalItems ?? 0) - 1;

  return (
    <>
      {type === "input" && (
        <div
          className={classNames(baseClasses, typeClasses.label)}
          style={{
            width: width,
            height: "16px",
          }}
        />
      )}
      {type === "stepper" ? (
        <div className="relative pl-4 pb-2">
          <div
            className={classNames(baseClasses, typeClasses[type])}
            style={{
              width: width,
              height: height,
            }}
          >
            {/* Trick so that the line doesnt start at the beginning of the card */}
            <span className="text-gray-300">0</span>
            {/* Vertical Line */}
            <span className="absolute -left-2.5 w-5 h-5 rounded-full flex items-center justify-center border-2 bg-gray-300" />
            {/* Dot */}
            {!isLast && (
              <span className="absolute left-[-1px] top-[2.6rem] bottom-[-25px] w-[2px] bg-gray-300" />
            )}
          </div>
        </div>
      ) : (
        <div
          className={classNames(baseClasses, typeClasses[type])}
          style={{
            width: width,
            height: height,
          }}
        />
      )}
    </>
  );
};

export default SkeletonLoader;
