import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import getCurrentUser from '@/api/services/users/getCurrentUser'

import { User } from '@/types/user.interface'

interface UserContextType {
  user: User | null
  isLoading: boolean
  errorMessage: string | null
  refetchUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function CustomUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchUserData = async () => {
    setIsLoading(true)
    try {
      const response = await getCurrentUser()
      setUser(response)
      setErrorMessage(null)
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'An unexpected error occurred'
      setErrorMessage(errorMsg)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [])

  return (
    <UserContext.Provider
      value={{ user, isLoading, errorMessage, refetchUser: fetchUserData }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
