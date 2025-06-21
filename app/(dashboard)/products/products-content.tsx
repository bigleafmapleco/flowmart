'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ProductDialog } from '@/components/products/product-dialog'
import { DeleteProductDialog } from '@/components/products/delete-product-dialog'
import { Plus, Edit, Trash2, RefreshCw, Package } from 'lucide-react'
import { getProducts } from '@/app/actions/products'
import type { ProductWithCategory } from '@/types/database'

interface ProductsContentProps {
  initialProducts: ProductWithCategory[]
  error: string | null
}

export function ProductsContent({ initialProducts, error: initialError }: ProductsContentProps) {
  const [products, setProducts] = useState<ProductWithCategory[]>(initialProducts)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(initialError)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductWithCategory | null>(null)

  const refreshProducts = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const updatedProducts = await getProducts()
      setProducts(updatedProducts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh products')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product: ProductWithCategory) => {
    setSelectedProduct(product)
    setEditDialogOpen(true)
  }

  const handleDelete = (product: ProductWithCategory) => {
    setSelectedProduct(product)
    setDeleteDialogOpen(true)
  }

  const handleDialogClose = () => {
    refreshProducts()
  }

  const formatPrice = (price: number | null) => {
    if (price === null) return '—'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
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
        <img
          src={images[0]}
          alt="Product"
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  // Listen for router refresh events
  useEffect(() => {
    refreshProducts()
  }, [])

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <div className="flex justify-between items-center">
            <p><strong>Error:</strong> {error}</p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={refreshProducts}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">All Products</h2>
          <p className="text-sm text-gray-600">
            {products.length} {products.length === 1 ? 'product' : 'products'} total
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={refreshProducts}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Product
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {products.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium">No products yet</p>
            <p className="mt-1">Get started by creating your first product.</p>
            <Button 
              className="mt-4" 
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Product
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Image</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Regular Price</TableHead>
                  <TableHead>Sale Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{getThumbnail(product.images)}</TableCell>
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      {product.category?.name || (
                        <span className="text-gray-400 italic">Uncategorized</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(product.regular_price)}
                    </TableCell>
                    <TableCell>
                      {product.sale_price ? (
                        <span className="text-green-600 font-medium">
                          {formatPrice(product.sale_price)}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(product)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <ProductDialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open)
          if (!open) handleDialogClose()
        }}
      />

      <ProductDialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open)
          if (!open) handleDialogClose()
        }}
        product={selectedProduct || undefined}
      />

      {selectedProduct && (
        <DeleteProductDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open)
            if (!open) handleDialogClose()
          }}
          product={selectedProduct}
        />
      )}
    </div>
  )
} 