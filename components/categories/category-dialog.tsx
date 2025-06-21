'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CategoryForm } from './category-form'
import type { Category } from '@/types/database'

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category
}

export function CategoryDialog({ open, onOpenChange, category }: CategoryDialogProps) {
  const handleSuccess = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {category ? 'Edit Category' : 'Create New Category'}
          </DialogTitle>
        </DialogHeader>
        <CategoryForm category={category} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
} 