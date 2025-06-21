import { Suspense } from 'react'
import { ProductsContent } from './products-content'
import { getProducts } from '@/app/actions/products'
import type { ProductWithCategory } from '@/types/database'

export default async function ProductsPage() {
  let products: ProductWithCategory[] = []
  let error = null

  try {
    products = await getProducts()
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load products'
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <p className="mt-2 text-gray-600">Manage your product inventory</p>
      </div>
      
      <Suspense fallback={<div>Loading products...</div>}>
        <ProductsContent initialProducts={products} error={error} />
      </Suspense>
    </div>
  )
} 