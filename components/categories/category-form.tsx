'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createCategory, updateCategory } from '@/app/actions/categories'
import type { Category } from '@/types/database'

interface CategoryFormProps {
  category?: Category
  onSuccess?: () => void
}

export function CategoryForm({ category, onSuccess }: CategoryFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setError(null)

    try {
      if (category) {
        await updateCategory(category.id, formData)
      } else {
        await createCategory(formData)
      }
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="name">Category Name *</Label>
        <Input
          id="name"
          name="name"
          defaultValue={category?.name || ''}
          required
          placeholder="Enter category name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="buyer_name">Buyer Name</Label>
        <Input
          id="buyer_name"
          name="buyer_name"
          defaultValue={category?.buyer_name || ''}
          placeholder="Enter buyer name (optional)"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
        </Button>
      </div>
    </form>
  )
} 