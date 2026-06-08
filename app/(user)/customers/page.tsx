import { getToken } from '@/actions/auth'

import { CustomersClient } from './_components/customers-client'

export default async function CustomersPage() {
  const token = await getToken()
  const safeToken = token ?? ''

  return <CustomersClient token={safeToken} />
}
