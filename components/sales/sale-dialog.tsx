'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SaleForm } from './sale-form'
import type { SaleWithProducts } from '@/types/database'

interface SaleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sale?: SaleWithProducts
}

export function SaleDialog({ open, onOpenChange, sale }: SaleDialogProps) {
  const handleSuccess = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {sale ? 'Edit Sale' : 'Create New Sale'}
          </DialogTitle>
        </DialogHeader>
        <SaleForm sale={sale} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
} 