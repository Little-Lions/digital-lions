'use client'

import React from 'react'
import Card from '@/components/Card'
import List from '@/components/List'
import Heading from '@/components/Heading'

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
