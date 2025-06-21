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