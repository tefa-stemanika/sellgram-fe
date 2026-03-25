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

export async function getProducts(token: string): Promise<Product[]> {
  const response = await fetcher<{ success: boolean; data: Product[] }>('/products', { token })
  return response.data
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
