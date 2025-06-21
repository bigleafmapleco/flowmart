'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ProductForm } from './product-form'
import type { ProductWithCategory } from '@/types/database'

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: ProductWithCategory
}

export function ProductDialog({ open, onOpenChange, product }: ProductDialogProps) {
  const handleSuccess = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Edit Product' : 'Create New Product'}
          </DialogTitle>
        </DialogHeader>
        <ProductForm product={product} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
} 