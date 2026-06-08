import { fetcher } from '../fetcher'

export type Product = {
  id: number
  name: string
  description: string
  price: number
  emoji: string
  isAvailable: boolean
  createdAt: string
  updatedAt: string
}

export type CreateProductPayload = {
  name: string
  description: string
  price: number
  emoji: string
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
