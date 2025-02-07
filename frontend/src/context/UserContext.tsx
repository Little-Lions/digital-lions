'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { useUser as useAuth0User } from '@auth0/nextjs-auth0/client'
import getCurrentUser from '@/api/services/users/getCurrentUser'
import { User } from '@/types/user.interface'

interface UserContextType {
  customUser: User | null
  isLoading: boolean
  errorMessage: string | null
  refetchUser: () => Promise<User | undefined>
  setUser: (customUser: User | null) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function CustomUserProvider({
  children,
}: {
  children: ReactNode
}): JSX.Element {
  const { user: auth0User, isLoading: isAuthLoading } = useAuth0User()

  const initialUser =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('customUser') || 'null')
      : null

  const [user, setUser] = useState<User | null>(initialUser)
  const [isLoading, setIsLoading] = useState(!initialUser)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchUserData = async (): Promise<User | undefined> => {
    if (!auth0User?.email) return
    setIsLoading(true)
    try {
      const response = await getCurrentUser()
      setUser(response)
      localStorage.setItem('customUser', JSON.stringify(response))
      setErrorMessage(null)
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'An unexpected error occurred'
      setErrorMessage(errorMsg)
      setUser(null)
      localStorage.removeItem('customUser')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (auth0User?.email) {
      if (!user) {
        fetchUserData()
      }
    } else {
      setUser(null)
      localStorage.removeItem('customUser')
      setIsLoading(false)
    }
  }, [auth0User])

  return (
    <UserContext.Provider
      value={{
        customUser: user,
        isLoading: isAuthLoading || isLoading,
        errorMessage,
        refetchUser: fetchUserData,
        setUser,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useCustomUser(): UserContextType {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useCustomUser must be used within a UserProvider')
  }
  return context
}
