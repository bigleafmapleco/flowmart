'use server'

import { createServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import type { CreateProductData, UpdateProductData, ProductWithCategory } from '@/types/database'

export async function createProduct(formData: FormData) {
  try {
    const supabase = await createServerClient()

    const data: CreateProductData = {
      sku: formData.get('sku') as string,
      name: formData.get('name') as string,
      description: formData.get('description') as string || null,
      regular_price: parseFloat(formData.get('regular_price') as string),
      sale_price: formData.get('sale_price') ? parseFloat(formData.get('sale_price') as string) : null,
      category_id: formData.get('category_id') as string || null,
      images: JSON.parse(formData.get('images') as string || '[]'),
    }

    // Validate required fields
    if (!data.sku || data.sku.trim() === '') {
      throw new Error('SKU is required')
    }
    if (!data.name || data.name.trim() === '') {
      throw new Error('Product name is required')
    }
    if (isNaN(data.regular_price) || data.regular_price <= 0) {
      throw new Error('Regular price must be a positive number')
    }

    const { error } = await supabase
      .from('products')
      .insert([data])

    if (error) {
      throw new Error(`Failed to create product: ${error.message}`)
    }

    revalidatePath('/products')
    return { success: true, message: 'Product created successfully' }
  } catch (error) {
    console.error('Error creating product:', error)
    throw error
  }
}

export async function updateProduct(id: string, formData: FormData) {
  try {
    const supabase = await createServerClient()

    const data: UpdateProductData = {
      sku: formData.get('sku') as string,
      name: formData.get('name') as string,
      description: formData.get('description') as string || null,
      regular_price: parseFloat(formData.get('regular_price') as string),
      sale_price: formData.get('sale_price') ? parseFloat(formData.get('sale_price') as string) : null,
      category_id: formData.get('category_id') as string || null,
      images: JSON.parse(formData.get('images') as string || '[]'),
    }

    // Validate required fields
    if (!data.sku || data.sku.trim() === '') {
      throw new Error('SKU is required')
    }
    if (!data.name || data.name.trim() === '') {
      throw new Error('Product name is required')
    }
    if (isNaN(data.regular_price!) || data.regular_price! <= 0) {
      throw new Error('Regular price must be a positive number')
    }

    const { error } = await supabase
      .from('products')
      .update(data)
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to update product: ${error.message}`)
    }

    revalidatePath('/products')
    return { success: true, message: 'Product updated successfully' }
  } catch (error) {
    console.error('Error updating product:', error)
    throw error
  }
}

export async function deleteProduct(id: string) {
  try {
    const supabase = await createServerClient()

    // First, get the product to access its images
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('images')
      .eq('id', id)
      .single()

    if (fetchError) {
      throw new Error(`Failed to fetch product: ${fetchError.message}`)
    }

    // Delete associated images from storage
    if (product?.images && product.images.length > 0) {
      const { error: storageError } = await supabase.storage
        .from('products')
        .remove(product.images)

      if (storageError) {
        console.warn('Error deleting product images:', storageError.message)
      }
    }

    // Delete the product
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete product: ${error.message}`)
    }

    revalidatePath('/products')
    return { success: true, message: 'Product deleted successfully' }
  } catch (error) {
    console.error('Error deleting product:', error)
    throw error
  }
}

export async function getProducts(): Promise<ProductWithCategory[]> {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error('Error fetching products:', error)
    throw error
  }
}

export async function uploadProductImage(file: File): Promise<string> {
  try {
    const supabase = await createServerClient()

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `products/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      throw new Error(`Failed to upload image: ${uploadError.message}`)
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

export async function deleteProductImage(imagePath: string) {
  try {
    const supabase = await createServerClient()

    // Extract path from URL
    const path = imagePath.split('/products/')[1]
    if (!path) {
      throw new Error('Invalid image path')
    }

    const { error } = await supabase.storage
      .from('products')
      .remove([`products/${path}`])

    if (error) {
      throw new Error(`Failed to delete image: ${error.message}`)
    }

    return { success: true, message: 'Image deleted successfully' }
  } catch (error) {
    console.error('Error deleting image:', error)
    throw error
  }
} 