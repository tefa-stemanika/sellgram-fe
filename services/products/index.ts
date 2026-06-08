import { fetcher } from '../fetcher'

export type Product = {
  id: number
  name: string
  description: string
  price: number
  emoji: string
  isAvailable: boolean
  stock: number
  stockEnabled: boolean
  allowOversell: boolean
  lowStockAlert: number
  createdAt: string
  updatedAt: string
}

export type CreateProductPayload = {
  name: string
  description: string
  price: number
  emoji: string
  stock?: number
  stockEnabled?: boolean
  allowOversell?: boolean
  lowStockAlert?: number
}

export type UpdateProductPayload = Partial<CreateProductPayload> & {
  isAvailable?: boolean
}

export type ListProductsParams = {
  page?: number
  limit?: number
  search?: string
  isAvailable?: string
  sortBy?: string
  sortDir?: string
}

export type ListProductsResponse = {
  success: boolean
  message: string
  data: Product[]
  metadata: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export async function getProducts(
  token: string,
  params: ListProductsParams = {}
): Promise<{
  data: Product[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.search) query.set('search', params.search)
  if (params.isAvailable) query.set('isAvailable', params.isAvailable)
  if (params.sortBy) query.set('sortBy', params.sortBy)
  if (params.sortDir) query.set('sortDir', params.sortDir)

  const qs = query.toString()
  const response = await fetcher<ListProductsResponse>(`/products${qs ? `?${qs}` : ''}`, { token })

  return {
    data: response.data,
    meta: response.metadata
  }
}

export async function getProductById(token: string, id: number): Promise<Product> {
  const response = await fetcher<{ success: boolean; data: Product }>(`/products/${id}`, { token })
  return response.data
}

export async function createProduct(token: string, payload: CreateProductPayload): Promise<Product> {
  const response = await fetcher<{ success: boolean; data: Product }>('/products', {
    method: 'POST',
    token,
    body: JSON.stringify(payload)
  })
  return response.data
}

export async function updateProduct(token: string, id: number, payload: UpdateProductPayload): Promise<Product> {
  const response = await fetcher<{ success: boolean; data: Product }>(`/products/${id}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(payload)
  })
  return response.data
}

export async function deleteProduct(token: string, id: number): Promise<void> {
  await fetcher<{ success: boolean }>(`/products/${id}`, {
    method: 'DELETE',
    token
  })
}

export type StockLog = {
  id: number
  productId: number
  type: 'RESTOCK' | 'SALE' | 'ADJUSTMENT'
  delta: number
  stockAfter: number
  note: string | null
  orderId: number | null
  createdAt: string
  updatedAt: string
}

export type ListStockLogsResponse = {
  success: boolean
  message: string
  data: StockLog[]
  metadata: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export async function restockProduct(token: string, id: number, payload: { quantity: number; note?: string }): Promise<Product> {
  const response = await fetcher<{ success: boolean; data: Product }>(`/products/${id}/restock`, {
    method: 'POST',
    token,
    body: JSON.stringify(payload)
  })
  return response.data
}

export async function adjustStock(token: string, id: number, payload: { quantity: number; note?: string }): Promise<Product> {
  const response = await fetcher<{ success: boolean; data: Product }>(`/products/${id}/stock`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload)
  })
  return response.data
}

export async function getStockLogs(
  token: string,
  id: number,
  params: { page?: number; limit?: number } = {}
): Promise<{
  data: StockLog[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))

  const qs = query.toString()
  const response = await fetcher<ListStockLogsResponse>(`/products/${id}/stock-logs${qs ? `?${qs}` : ''}`, { token })

  return {
    data: response.data,
    meta: response.metadata
  }
}
