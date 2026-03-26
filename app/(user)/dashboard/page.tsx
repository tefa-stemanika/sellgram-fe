import { getToken } from '@/actions/auth'

import { DashboardOverview } from '../_components/dashboard-overview'

async function DashboardPage() {
  const token = await getToken()

  return <DashboardOverview token={token ?? ''} />
}

export default DashboardPage
