import { useRouter } from 'next/navigation'
import { useState } from 'react'
import CustomButton from './CustomButton'

import { useTransitions } from '@/hooks/UseTransitions'
interface NavigationButtonProps {
  className?: string
  closeMenu?: () => void
  useBackNavigation?: boolean
  href?: string
  label?: string
  variant?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'error'
    | 'warning'
    | 'outline'
    | 'none'
  isFullWidth?: boolean
}

const NavigationButton: React.FC<NavigationButtonProps> = ({
  closeMenu,
  useBackNavigation = true,
  href = '/',
  className,
  label = '',
  variant = 'outline',
  isFullWidth = false,
}) => {
  const { slideRight, slideIntoViewport } = useTransitions()

  const router = useRouter()
  const [isBusy, setIsBusy] = useState(false)

  const handleClick = async (
    event: React.MouseEvent<HTMLDivElement>,
  ): Promise<void> => {
    if (closeMenu) {
      closeMenu()
    }

    try {
      if (useBackNavigation) {
        event.preventDefault()

        await slideRight()
        slideIntoViewport()

        router.back()
      } else {
        setIsBusy(true)
        await router.push(href)
      }
    } catch (error) {
      console.error('Navigation error:', error)
    } finally {
      if (!useBackNavigation) {
        setIsBusy(false)
      }
    }
  }

  return (
    <CustomButton
      label={useBackNavigation ? '← Back' : label}
      variant={useBackNavigation ? 'outline' : variant}
      className={className}
      onClick={() =>
        handleClick(
          new MouseEvent(
            'click',
          ) as unknown as React.MouseEvent<HTMLDivElement>,
        )
      }
      isFullWidth={isFullWidth}
      isBusy={isBusy}
    />
  )
}

export default NavigationButton
