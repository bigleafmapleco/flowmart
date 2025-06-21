import { Suspense } from 'react'
import { CategoriesContent } from './categories-content'
import { getCategories } from '@/app/actions/categories'

export default async function CategoriesPage() {
  let categories = []
  let error = null

  try {
    categories = await getCategories()
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load categories'
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
        <p className="mt-2 text-gray-600">Organize your product categories</p>
      </div>
      
      <Suspense fallback={<div>Loading categories...</div>}>
        <CategoriesContent initialCategories={categories} error={error} />
      </Suspense>
    </div>
  )
} 