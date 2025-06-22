export interface Category {
  id: string
  name: string
  buyer_name: string | null
  created_at: string
  updated_at: string
}

export interface CreateCategoryData {
  name: string
  buyer_name?: string | null
}

export interface UpdateCategoryData {
  name?: string
  buyer_name?: string | null
}

export interface Product {
  id: string
  sku: string
  name: string
  description: string | null
  regular_price: number
  sale_price: number | null
  category_id: string | null
  images: string[]
  created_at: string
  updated_at: string
}

export interface ProductWithCategory extends Product {
  category?: Category | null
}

export interface CreateProductData {
  sku: string
  name: string
  description?: string | null
  regular_price: number
  sale_price?: number | null
  category_id?: string | null
  images?: string[]
}

export interface UpdateProductData {
  sku?: string
  name?: string
  description?: string | null
  regular_price?: number
  sale_price?: number | null
  category_id?: string | null
  images?: string[]
}

export interface Sale {
  id: string
  name: string
  start_date: string
  end_date: string
  created_at: string
  updated_at: string
}

export interface SaleProduct {
  sale_id: string
  product_id: string
  sale_price: number
  created_at: string
}

export interface SaleWithProducts extends Sale {
  sale_products?: (SaleProduct & {
    product: ProductWithCategory
  })[]
  product_count?: number
}

export interface CreateSaleData {
  name: string
  start_date: string
  end_date: string
}

export interface UpdateSaleData {
  name?: string
  start_date?: string
  end_date?: string
}

export type SaleStatus = 'upcoming' | 'active' | 'ended' 