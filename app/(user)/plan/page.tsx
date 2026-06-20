import { getToken } from '@/actions/auth'
import { Metadata } from 'next'

import { PlanClient } from './_components/plan-client'

export const metadata: Metadata = {
  title: 'Langganan',
}

async function PlanPage() {
  const token = await getToken()

  return <PlanClient token={token ?? ''} />
}

export default PlanPage
