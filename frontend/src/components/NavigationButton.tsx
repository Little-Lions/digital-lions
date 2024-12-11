import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import CustomButton from './CustomButton'

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
  closeMenu = () => {},
  useBackNavigation = true,
  href = '/',
  className,
  label = '',
  variant = 'outline',
  isFullWidth = false,
}) => {
  const router = useRouter()
  const [isBusy, setIsBusy] = useState(false)

  useEffect(() => {
    console.log('isBusy updated to:', isBusy)
  }, [isBusy])

  const handleClick = async () => {
    closeMenu()

    try {
      if (useBackNavigation) {
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
      onClick={handleClick}
      isFullWidth={isFullWidth}
      isBusy={isBusy}
    />
  )
}

export default NavigationButton
