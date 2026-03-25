import { getToken } from '@/actions/auth'

import HomeLayout from './_layouts/home-layout'

type UserLayoutProps = {
  children: React.ReactNode
}

export default async function UserLayout({ children }: UserLayoutProps) {
  const token = await getToken()

  return <HomeLayout token={token}>{children}</HomeLayout>
}
