import { getToken } from '@/actions/auth'

import { TemplateEditPage } from './_components/template-edit-page'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function Page(props: PageProps) {
  const { id } = await props.params
  const token = await getToken()
  return <TemplateEditPage templateId={id} token={token ?? ''} />
}
