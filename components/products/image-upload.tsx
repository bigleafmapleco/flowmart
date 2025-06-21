'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Upload, Image as ImageIcon } from 'lucide-react'
import { uploadProductImage, deleteProductImage } from '@/app/actions/products'

interface ImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
}

export function ImageUpload({ images, onImagesChange, maxImages = 5 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    // Check if we exceed max images
    if (images.length + files.length > maxImages) {
      setUploadError(`Maximum ${maxImages} images allowed`)
      return
    }

    setUploading(true)
    setUploadError(null)

    try {
      const uploadPromises = files.map(file => uploadProductImage(file))
      const uploadedUrls = await Promise.all(uploadPromises)
      
      onImagesChange([...images, ...uploadedUrls])
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
      // Reset the input
      if (event.target) {
        event.target.value = ''
      }
    }
  }, [images, onImagesChange, maxImages])

  const handleRemoveImage = useCallback(async (index: number) => {
    const imageToRemove = images[index]
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)

    // Optionally delete from storage (be careful with this)
    try {
      await deleteProductImage(imageToRemove)
    } catch (error) {
      console.warn('Failed to delete image from storage:', error)
    }
  }, [images, onImagesChange])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Product Images ({images.length}/{maxImages})</Label>
        <div className="flex items-center space-x-2">
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            disabled={uploading || images.length >= maxImages}
            className="hidden"
            id="image-upload"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('image-upload')?.click()}
            disabled={uploading || images.length >= maxImages}
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? 'Uploading...' : 'Add Images'}
          </Button>
        </div>
      </div>

      {uploadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          {uploadError}
        </div>
      )}

      {images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                <img
                  src={image}
                  alt={`Product ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
              {index === 0 && (
                <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  Primary
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">No images uploaded</p>
          <p className="text-xs text-gray-500">Click "Add Images" to upload product photos</p>
        </div>
      )}
    </div>
  )
} 