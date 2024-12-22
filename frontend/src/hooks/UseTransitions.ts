'use client'

import { useContext } from 'react'
import { Animation, TransitionContext } from '@/providers/TransitionProvider'

const ANIMATION_DURATION = 400 // milliseconds

/** Provides access to transitions for page animations. */
export function useTransitions() {
  const context = useContext(TransitionContext)

  if (!context) {
    throw new Error('useTransitions must be used within a TransitionProvider')
  }

  const { animation, setClassName, isTransitioning, setIsTransitioning } =
    context

  /** Triggers the 'Slide Left - Out' animation. */
  function slideLeft() {
    return animate('slide-left', animation, setClassName, setIsTransitioning)
  }

  /** Triggers the 'Slide Right - Out' animation. */
  function slideRight() {
    return animate('slide-right', animation, setClassName, setIsTransitioning)
  }

  /** Resets the animation to bring content into view. */
  function slideIntoViewport() {
    const currentAnimation = animation.current
    if (currentAnimation) {
      const className = getInAnimation(currentAnimation)
      setClassName(className)
    }
  }

  return {
    slideLeft,
    slideRight,
    slideIntoViewport,
    isTransitioning,
    setIsTransitioning, // Expose setIsTransitioning explicitly
  }
}

// Helper Functions

/** Returns the CSS class for the 'Out' animation. */
function getOutAnimation(animation: Animation) {
  return animation === 'slide-left'
    ? 'animate-slide-left-out'
    : 'animate-slide-right-out'
}

/** Returns the CSS class for the 'In' animation. */
function getInAnimation(animation: Animation) {
  return animation === 'slide-left'
    ? 'animate-slide-left-in'
    : 'animate-slide-right-in'
}

/** Triggers the animation and waits for it to complete. */
function animate(
  animationType: Animation,
  animationRef: React.MutableRefObject<Animation>,
  setClassName: React.Dispatch<string>,
  setIsTransitioning: React.Dispatch<React.SetStateAction<boolean>>, // Added to manage transitioning state
) {
  return new Promise<void>((resolve) => {
    const className = getOutAnimation(animationType)
    setClassName(className)
    animationRef.current = animationType
    setIsTransitioning(true) // Start transition

    // Wait for the animation duration to complete
    setTimeout(() => {
      setClassName('') // Reset the animation class
      setIsTransitioning(false) // End transition
      resolve()
    }, ANIMATION_DURATION)
  })
}
