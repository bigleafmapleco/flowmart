'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { deleteSale } from '@/app/actions/sales'
import { formatDateRange } from '@/lib/utils/sales'
import type { SaleWithProducts } from '@/types/database'

interface DeleteSaleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sale: SaleWithProducts
}

export function DeleteSaleDialog({ open, onOpenChange, sale }: DeleteSaleDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setLoading(true)
    setError(null)

    try {
      await deleteSale(sale.id)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Sale</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this sale?
            </p>
            <div className="bg-gray-50 p-3 rounded border">
              <p className="font-medium">{sale.name}</p>
              <p className="text-sm text-gray-600">
                {formatDateRange(sale.start_date, sale.end_date)}
              </p>
              {sale.product_count && sale.product_count > 0 && (
                <p className="text-sm text-gray-600">
                  This will remove {sale.product_count} product(s) from the sale
                </p>
              )}
            </div>
            <p className="text-sm text-red-600 font-medium">
              This action cannot be undone.
            </p>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete Sale'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 