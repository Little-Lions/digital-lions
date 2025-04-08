'use client'

import React from 'react'

import Card from '@/components/ui/Card'
import List from '@/components/ui/List'
import Heading from '@/components/ui/Heading'

const Home: React.FC = () => {
  return (
    <>
      <Card>
        <Heading level="h2">Little Lions Impact</Heading>
        <List
          items={[
            { label: 'Townships', value: '6' },
            { label: 'Workshops', value: '1300' },
            { label: 'Children', value: '2000' },
          ]}
        />
      </Card>
    </>
  )
}

export default Home
