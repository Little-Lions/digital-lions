'use client'

import { useCustomUser } from '@/context/UserContext'
import { useUser } from '@auth0/nextjs-auth0/client'
import Loader from '@/components/ui/Loader'

interface PageLayoutProps {
  children: React.ReactNode
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  const { isLoading } = useCustomUser()
  const { user } = useUser()

  return (
    <>
      {user && isLoading && <Loader loadingText="Loading data" />}
      {children}
    </>
  )
}

export default PageLayout
