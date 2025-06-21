'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageUpload } from './image-upload'
import { createProduct, updateProduct } from '@/app/actions/products'
import { getCategories } from '@/app/actions/categories'
import type { ProductWithCategory, Category } from '@/types/database'

interface ProductFormProps {
  product?: ProductWithCategory
  onSuccess?: () => void
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<string[]>(product?.images || [])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(
    product?.category_id || undefined
  )

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (error) {
        console.error('Failed to load categories:', error)
      }
    }
    loadCategories()
  }, [])

  const formatPrice = (value: string) => {
    // Remove any non-numeric characters except decimal point
    const numericValue = value.replace(/[^\d.]/g, '')
    // Ensure only one decimal point
    const parts = numericValue.split('.')
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('')
    }
    return numericValue
  }

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setError(null)

    try {
      // Add images and category to form data
      formData.set('images', JSON.stringify(images))
      if (selectedCategoryId) {
        formData.set('category_id', selectedCategoryId)
      }

      if (product) {
        await updateProduct(product.id, formData)
      } else {
        await createProduct(formData)
      }
      
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sku">SKU *</Label>
          <Input
            id="sku"
            name="sku"
            defaultValue={product?.sku || ''}
            required
            placeholder="Enter product SKU"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            name="name"
            defaultValue={product?.name || ''}
            required
            placeholder="Enter product name"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          defaultValue={product?.description || ''}
          placeholder="Enter product description (optional)"
          className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category (optional)" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="regular_price">Regular Price *</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <Input
              id="regular_price"
              name="regular_price"
              type="text"
              defaultValue={product?.regular_price ? product.regular_price.toFixed(2) : ''}
              required
              placeholder="0.00"
              className="pl-8"
              onChange={(e) => {
                e.target.value = formatPrice(e.target.value)
              }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sale_price">Sale Price</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <Input
              id="sale_price"
              name="sale_price"
              type="text"
              defaultValue={product?.sale_price ? product.sale_price.toFixed(2) : ''}
              placeholder="0.00 (optional)"
              className="pl-8"
              onChange={(e) => {
                e.target.value = formatPrice(e.target.value)
              }}
            />
          </div>
        </div>
      </div>

      {/* Images */}
      <ImageUpload images={images} onImagesChange={setImages} />

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  )
} 