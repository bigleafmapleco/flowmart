'use server'

import { createServerClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import type { CreateSaleData, UpdateSaleData, SaleWithProducts, ProductWithCategory } from '@/types/database'

export async function createSale(formData: FormData) {
  try {
    const supabase = await createServerClient()

    const data: CreateSaleData = {
      name: formData.get('name') as string,
      start_date: formData.get('start_date') as string,
      end_date: formData.get('end_date') as string,
    }

    // Validate required fields
    if (!data.name || data.name.trim() === '') {
      throw new Error('Sale name is required')
    }
    if (!data.start_date) {
      throw new Error('Start date is required')
    }
    if (!data.end_date) {
      throw new Error('End date is required')
    }
    if (new Date(data.start_date) >= new Date(data.end_date)) {
      throw new Error('End date must be after start date')
    }

    const { error } = await supabase
      .from('sales')
      .insert([data])

    if (error) {
      throw new Error(`Failed to create sale: ${error.message}`)
    }

    revalidatePath('/sales')
    return { success: true, message: 'Sale created successfully' }
  } catch (error) {
    console.error('Error creating sale:', error)
    throw error
  }
}

export async function updateSale(id: string, formData: FormData) {
  try {
    const supabase = await createServerClient()

    const data: UpdateSaleData = {
      name: formData.get('name') as string,
      start_date: formData.get('start_date') as string,
      end_date: formData.get('end_date') as string,
    }

    // Validate required fields
    if (!data.name || data.name.trim() === '') {
      throw new Error('Sale name is required')
    }
    if (!data.start_date) {
      throw new Error('Start date is required')
    }
    if (!data.end_date) {
      throw new Error('End date is required')
    }
    if (new Date(data.start_date) >= new Date(data.end_date)) {
      throw new Error('End date must be after start date')
    }

    const { error } = await supabase
      .from('sales')
      .update(data)
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to update sale: ${error.message}`)
    }

    revalidatePath('/sales')
    return { success: true, message: 'Sale updated successfully' }
  } catch (error) {
    console.error('Error updating sale:', error)
    throw error
  }
}

export async function deleteSale(id: string) {
  try {
    const supabase = await createServerClient()

    // First delete all sale_products
    const { error: deleteProductsError } = await supabase
      .from('sale_products')
      .delete()
      .eq('sale_id', id)

    if (deleteProductsError) {
      throw new Error(`Failed to delete sale products: ${deleteProductsError.message}`)
    }

    // Then delete the sale
    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete sale: ${error.message}`)
    }

    revalidatePath('/sales')
    return { success: true, message: 'Sale deleted successfully' }
  } catch (error) {
    console.error('Error deleting sale:', error)
    throw error
  }
}

export async function getSales(): Promise<SaleWithProducts[]> {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        sale_products (
          sale_price,
          created_at,
          product:products (
            *,
            category:categories (*)
          )
        )
      `)
      .order('start_date', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch sales: ${error.message}`)
    }

    // Add product count to each sale
    const salesWithCounts = (data || []).map(sale => ({
      ...sale,
      product_count: sale.sale_products?.length || 0
    }))

    return salesWithCounts
  } catch (error) {
    console.error('Error fetching sales:', error)
    throw error
  }
}

export async function addProductsToSale(saleId: string, productIds: string[], salePrice?: number) {
  try {
    const supabase = await createServerClient()

    // If no sale price provided, use the product's regular price
    let saleProducts = []
    
    if (salePrice) {
      // Use the same sale price for all products
      saleProducts = productIds.map(productId => ({
        sale_id: saleId,
        product_id: productId,
        sale_price: salePrice
      }))
    } else {
      // Get each product's regular price
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, regular_price')
        .in('id', productIds)

      if (productsError) {
        throw new Error(`Failed to fetch product prices: ${productsError.message}`)
      }

      saleProducts = products.map(product => ({
        sale_id: saleId,
        product_id: product.id,
        sale_price: product.regular_price
      }))
    }

    const { error } = await supabase
      .from('sale_products')
      .insert(saleProducts)

    if (error) {
      throw new Error(`Failed to add products to sale: ${error.message}`)
    }

    revalidatePath('/sales')
    return { success: true, message: 'Products added to sale successfully' }
  } catch (error) {
    console.error('Error adding products to sale:', error)
    throw error
  }
}

export async function removeProductFromSale(saleId: string, productId: string) {
  try {
    const supabase = await createServerClient()

    const { error } = await supabase
      .from('sale_products')
      .delete()
      .eq('sale_id', saleId)
      .eq('product_id', productId)

    if (error) {
      throw new Error(`Failed to remove product from sale: ${error.message}`)
    }

    revalidatePath('/sales')
    return { success: true, message: 'Product removed from sale successfully' }
  } catch (error) {
    console.error('Error removing product from sale:', error)
    throw error
  }
}

export async function getProductsInSale(saleId: string) {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('sale_products')
      .select(`
        *,
        product:products (
          *,
          category:categories (*)
        )
      `)
      .eq('sale_id', saleId)

    if (error) {
      throw new Error(`Failed to fetch products in sale: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error('Error fetching products in sale:', error)
    throw error
  }
}

export async function getAvailableProducts(): Promise<ProductWithCategory[]> {
  try {
    const supabase = await createServerClient()

    // Get products that are not in any active sales
    const now = new Date().toISOString()
    
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories (*)
      `)
      .order('name')

    if (error) {
      throw new Error(`Failed to fetch available products: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error('Error fetching available products:', error)
    throw error
  }
}

 