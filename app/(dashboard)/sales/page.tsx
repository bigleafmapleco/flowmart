import { Suspense } from 'react'
import { SalesContent } from './sales-content'
import { getSales } from '@/app/actions/sales'
import type { SaleWithProducts } from '@/types/database'

export default async function SalesPage() {
  let sales: SaleWithProducts[] = []
  let error = null

  try {
    sales = await getSales()
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load sales'
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Sales</h1>
        <p className="mt-2 text-gray-600">Track your sales performance</p>
      </div>
      
      <Suspense fallback={<div>Loading sales...</div>}>
        <SalesContent initialSales={sales} error={error} />
      </Suspense>
    </div>
  )
} 