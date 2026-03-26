import { getToken } from '@/actions/auth'

import { ProductsClient } from './_components/products-client'

export default async function ProductsPage() {
  const token = await getToken()
  const safeToken = token ?? ''

  return <ProductsClient token={safeToken} />
}
