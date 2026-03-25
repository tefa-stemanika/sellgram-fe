import { getToken } from '@/actions/auth'
import { getProducts } from '@/services/products'

import { ProductsClient } from './_components/products-client'

export default async function ProductsPage() {
  const token = await getToken()
  const safeToken = token ?? ''
  const initialData = safeToken ? await getProducts(safeToken).catch(() => []) : []

  return <ProductsClient token={safeToken} initialData={initialData} />
}
