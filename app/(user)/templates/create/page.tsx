import { getToken } from '@/actions/auth'

import { TemplateCreatePage } from './_components/template-create-page'

export default async function Page() {
  const token = await getToken()
  return <TemplateCreatePage token={token ?? ''} />
}
