'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Package, Plus, X, ArrowRight } from 'lucide-react'
import { getAvailableProducts, getProductsInSale, addProductsToSale, removeProductFromSale } from '@/app/actions/sales'
import { getCategories } from '@/app/actions/categories'
import type { ProductWithCategory, Category, SaleProduct } from '@/types/database'

interface ProductSelectionProps {
  saleId: string
  onProductsChange?: () => void
}

export function ProductSelection({ saleId, onProductsChange }: ProductSelectionProps) {
  const [availableProducts, setAvailableProducts] = useState<ProductWithCategory[]>([])
  const [productsInSale, setProductsInSale] = useState<(SaleProduct & { product: ProductWithCategory })[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [bulkSalePrice, setBulkSalePrice] = useState('')

  const loadData = async () => {
    setLoading(true)
    try {
      const [available, inSale, categoryData] = await Promise.all([
        getAvailableProducts(),
        getProductsInSale(saleId),
        getCategories()
      ])
      
      setAvailableProducts(available)
      setProductsInSale(inSale)
      setCategories(categoryData)
    } catch (error) {
      console.error('Error loading product data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [saleId])

  const filteredAvailableProducts = availableProducts.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleAddProducts = async () => {
    if (selectedProducts.length === 0) return

    try {
      const salePrice = bulkSalePrice ? parseFloat(bulkSalePrice) : undefined
      await addProductsToSale(saleId, selectedProducts, salePrice)
      await loadData()
      setSelectedProducts([])
      setBulkSalePrice('')
      onProductsChange?.()
    } catch (error) {
      console.error('Error adding products:', error)
    }
  }

  const handleRemoveProduct = async (productId: string) => {
    try {
      await removeProductFromSale(saleId, productId)
      await loadData()
      onProductsChange?.()
    } catch (error) {
      console.error('Error removing product:', error)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const getSavingsPercentage = (regular: number, sale: number) => {
    const savings = ((regular - sale) / regular) * 100
    return Math.round(savings)
  }

  const getThumbnail = (images: string[]) => {
    if (!images || images.length === 0) {
      return (
        <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center">
          <Package className="w-5 h-5 text-gray-400" />
        </div>
      )
    }

    return (
      <div className="w-12 h-12 bg-gray-100 rounded border overflow-hidden">
        <img src={images[0]} alt="Product" className="w-full h-full object-cover" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Available Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Available Products
          </CardTitle>
          
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProducts.length > 0 && (
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  placeholder="Bulk sale price (optional)"
                  value={bulkSalePrice}
                  onChange={(e) => setBulkSalePrice(e.target.value)}
                  className="w-48"
                />
                <Button onClick={handleAddProducts} size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add {selectedProducts.length} Products
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-2 max-h-96 overflow-y-auto">
          {loading ? (
            <p className="text-center text-gray-500 py-4">Loading products...</p>
          ) : filteredAvailableProducts.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No products found</p>
          ) : (
            filteredAvailableProducts.map(product => (
              <div
                key={product.id}
                className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition-colors ${
                  selectedProducts.includes(product.id) ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                }`}
                onClick={() => {
                  setSelectedProducts(prev => 
                    prev.includes(product.id) 
                      ? prev.filter(id => id !== product.id)
                      : [...prev, product.id]
                  )
                }}
              >
                {getThumbnail(product.images)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.sku}</p>
                  <p className="text-sm font-medium">{formatPrice(product.regular_price)}</p>
                </div>
                {product.category && (
                  <Badge variant="secondary" className="text-xs">
                    {product.category.name}
                  </Badge>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Products in Sale */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-green-600" />
            Products in Sale ({productsInSale.length})
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-2 max-h-96 overflow-y-auto">
          {productsInSale.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No products in this sale</p>
          ) : (
            productsInSale.map(saleProduct => (
              <div key={`${saleProduct.sale_id}-${saleProduct.product_id}`} className="flex items-center gap-3 p-3 border rounded">
                {getThumbnail(saleProduct.product.images)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{saleProduct.product.name}</p>
                  <p className="text-sm text-gray-500">{saleProduct.product.sku}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(saleProduct.product.regular_price)}
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      {formatPrice(saleProduct.sale_price)}
                    </span>
                    {saleProduct.sale_price < saleProduct.product.regular_price && (
                      <Badge variant="destructive" className="text-xs">
                        {getSavingsPercentage(saleProduct.product.regular_price, saleProduct.sale_price)}% OFF
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveProduct(saleProduct.product.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
} 