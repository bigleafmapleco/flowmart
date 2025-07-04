'use server'

import { createServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import type { CreateCategoryData, UpdateCategoryData } from '@/types/database'

export async function createCategory(formData: FormData) {
  try {
    const supabase = await createServerClient()

    const data: CreateCategoryData = {
      name: formData.get('name') as string,
      buyer_name: formData.get('buyer_name') as string || null,
    }

    // Validate required fields
    if (!data.name || data.name.trim() === '') {
      throw new Error('Category name is required')
    }

    const { error } = await supabase
      .from('categories')
      .insert([data])

    if (error) {
      throw new Error(`Failed to create category: ${error.message}`)
    }

    revalidatePath('/categories')
    return { success: true, message: 'Category created successfully' }
  } catch (error) {
    console.error('Error creating category:', error)
    throw error
  }
}

export async function updateCategory(id: string, formData: FormData) {
  try {
    const supabase = await createServerClient()

    const data: UpdateCategoryData = {
      name: formData.get('name') as string,
      buyer_name: formData.get('buyer_name') as string || null,
    }

    // Validate required fields
    if (!data.name || data.name.trim() === '') {
      throw new Error('Category name is required')
    }

    const { error } = await supabase
      .from('categories')
      .update(data)
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to update category: ${error.message}`)
    }

    revalidatePath('/categories')
    return { success: true, message: 'Category updated successfully' }
  } catch (error) {
    console.error('Error updating category:', error)
    throw error
  }
}

export async function deleteCategory(id: string) {
  try {
    const supabase = await createServerClient()

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete category: ${error.message}`)
    }

    revalidatePath('/categories')
    return { success: true, message: 'Category deleted successfully' }
  } catch (error) {
    console.error('Error deleting category:', error)
    throw error
  }
}

export async function getCategories() {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error('Error fetching categories:', error)
    throw error
  }
} 