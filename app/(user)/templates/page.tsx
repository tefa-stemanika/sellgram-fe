import { getToken } from '@/actions/auth'

import { TemplatesClient } from './_components/templates-client'

export default async function TemplatesPage() {
  const token = await getToken()
  const safeToken = token ?? ''

  return <TemplatesClient token={safeToken} />
}
