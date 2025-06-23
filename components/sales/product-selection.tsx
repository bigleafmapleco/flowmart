'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Package, Plus, X, ArrowRight, Check } from 'lucide-react'
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
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

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

  // Get IDs of products already in sale for easy lookup
  const productsInSaleIds = new Set(productsInSale.map(sp => sp.product_id))

  const handleAddProducts = async () => {
    if (selectedProducts.length === 0) return

    setError(null)
    setSuccessMessage(null)

    try {
      const salePrice = bulkSalePrice ? parseFloat(bulkSalePrice) : undefined
      const result = await addProductsToSale(saleId, selectedProducts, salePrice)
      
      await loadData()
      setSelectedProducts([])
      setBulkSalePrice('')
      setSuccessMessage(result.message)
      onProductsChange?.()
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000)
    } catch (error) {
      console.error('Error adding products:', error)
      setError(error instanceof Error ? error.message : 'Failed to add products to sale')
      
      // Clear error message after 8 seconds
      setTimeout(() => setError(null), 8000)
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
    <div className="max-h-[80vh] md:max-h-[90vh] overflow-hidden flex flex-col">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 flex-1 overflow-hidden">
      {/* Available Products */}
      <Card className="flex flex-col h-full overflow-hidden">
        <CardHeader className="pb-3 flex-shrink-0 sticky top-0 bg-white z-10 border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="w-5 h-5" />
            Available Products
          </CardTitle>
          
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-40 h-9">
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

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-red-700">
                <X className="w-4 h-4" />
                {error}
              </div>
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-green-700">
                <Check className="w-4 h-4" />
                {successMessage}
              </div>
            </div>
          )}

          {/* Sticky Selection Controls */}
          {selectedProducts.length > 0 && (
            <div className="bg-white border border-blue-200 rounded-lg p-3 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                  <Check className="w-4 h-4" />
                  {selectedProducts.length} selected
                </div>
                <div className="flex-1 flex flex-col sm:flex-row gap-2">
                  <Input
                    type="number"
                    placeholder="Bulk sale price (optional)"
                    value={bulkSalePrice}
                    onChange={(e) => setBulkSalePrice(e.target.value)}
                    className="w-full sm:w-40 h-9"
                    min="0"
                    step="0.01"
                  />
                  <Button onClick={handleAddProducts} className="whitespace-nowrap h-9">
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Sale
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden p-6">
          <div 
            className="h-40 overflow-y-auto custom-scrollbar space-y-3 bg-yellow-50 border border-yellow-300"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#888 #f1f1f1'
            }}
          >
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Loading products...</p>
                </div>
              </div>
            ) : filteredAvailableProducts.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No products found</p>
                  <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
                </div>
              </div>
            ) : (
              filteredAvailableProducts.map(product => {
                const isSelected = selectedProducts.includes(product.id)
                const isAlreadyInSale = productsInSaleIds.has(product.id)
                
                return (
                  <div
                    key={product.id}
                    className={`group relative flex items-center gap-4 p-4 border-2 rounded-lg transition-all duration-200 w-full ${
                      isAlreadyInSale
                        ? 'bg-gray-50 border-gray-300 opacity-60 cursor-not-allowed'
                        : isSelected 
                          ? 'bg-blue-50 border-blue-300 shadow-sm cursor-pointer' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer'
                    }`}
                    onClick={() => {
                      if (isAlreadyInSale) {
                        setError('This product is already in the sale')
                        setTimeout(() => setError(null), 3000)
                        return
                      }
                      
                      setSelectedProducts(prev => 
                        prev.includes(product.id) 
                          ? prev.filter(id => id !== product.id)
                          : [...prev, product.id]
                      )
                    }}
                  >
                    {/* Selection Indicator */}
                    <div className={`absolute top-4 right-4 w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                      isAlreadyInSale 
                        ? 'bg-gray-400 border-gray-400'
                        : isSelected 
                          ? 'bg-blue-500 border-blue-500' 
                          : 'border-gray-300 group-hover:border-gray-400'
                    }`}>
                      {isAlreadyInSale ? (
                        <Check className="w-2.5 h-2.5 text-white" />
                      ) : isSelected ? (
                        <Check className="w-2.5 h-2.5 text-white" />
                      ) : null}
                    </div>
                    
                    {isAlreadyInSale && (
                      <div className="absolute top-1 right-1 bg-green-500 rounded-full p-1">
                        <Check className="w-2 h-2 text-white" />
                      </div>
                    )}

                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      {getThumbnail(product.images)}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0 pr-10">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-1" title={product.name}>
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-3">
                            <p className="text-sm text-gray-500 font-mono">
                              {product.sku}
                            </p>
                            {product.category && (
                              <Badge variant="secondary" className="text-xs">
                                {product.category.name}
                              </Badge>
                            )}
                          </div>
                          {product.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {product.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="text-right ml-4">
                          <p className="text-xl font-bold text-gray-900">
                            {formatPrice(product.regular_price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Products in Sale */}
      <Card className="flex flex-col h-full overflow-hidden">
        <CardHeader className="pb-3 flex-shrink-0 sticky top-0 bg-white z-10 border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ArrowRight className="w-5 h-5 text-green-600" />
            Products in Sale
            <Badge variant="outline" className="ml-2">
              {productsInSale.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden p-6">
          <div 
            className="h-40 overflow-y-auto custom-scrollbar space-y-3 bg-blue-50 border border-blue-300"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#888 #f1f1f1'
            }}
          >
            {productsInSale.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <ArrowRight className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No products in this sale</p>
                  <p className="text-sm text-gray-400 mt-1">Select products from the left to add them</p>
                </div>
              </div>
            ) : (
              productsInSale.map(saleProduct => (
                <div 
                  key={`${saleProduct.sale_id}-${saleProduct.product_id}`} 
                  className="flex items-center gap-4 p-4 border rounded-lg bg-green-50 border-green-200 w-full"
                >
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    {getThumbnail(saleProduct.product.images)}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0 pr-10">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-1" title={saleProduct.product.name}>
                          {saleProduct.product.name}
                        </h3>
                        <p className="text-sm text-gray-500 font-mono">
                          {saleProduct.product.sku}
                        </p>
                        {saleProduct.product.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {saleProduct.product.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="text-right ml-4">
                        <div className="flex items-center gap-2 justify-end mb-1">
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(saleProduct.product.regular_price)}
                          </span>
                          <span className="text-xl font-bold text-green-700">
                            {formatPrice(saleProduct.sale_price)}
                          </span>
                        </div>
                        {saleProduct.sale_price < saleProduct.product.regular_price && (
                          <div className="text-right">
                            <Badge variant="destructive" className="text-xs">
                              {getSavingsPercentage(saleProduct.product.regular_price, saleProduct.sale_price)}% OFF
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveProduct(saleProduct.product.id)}
                    className="flex-shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
} 