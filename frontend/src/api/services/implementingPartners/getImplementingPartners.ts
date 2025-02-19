'use client'

import { ImplementingPartner } from '@/types/implementingPartner.interface'

interface ApiResponse<T> {
  message: string | null
  data: T
}

const getImplementingPartners = async (): Promise<ImplementingPartner[]> => {
  try {
    const response = await fetch(`/api/implementing_partners`, {
      method: 'GET',
    })

    const responseData: ApiResponse<ImplementingPartner[]> =
      await response.json()

    if (!response.ok) {
      console.error(
        'API Error Detail:',
        (responseData as any).detail || 'No detail available',
      )
      throw new Error(
        responseData.message || 'Failed to fetch implementing partners',
      )
    }

    return responseData.data
  } catch (error) {
    throw error
  }
}

export default getImplementingPartners
