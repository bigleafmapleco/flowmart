'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SaleDialog } from '@/components/sales/sale-dialog'
import { DeleteSaleDialog } from '@/components/sales/delete-sale-dialog'
import { ProductSelection } from '@/components/sales/product-selection'
import { Plus, Edit, Trash2, RefreshCw, Calendar, Package, Settings } from 'lucide-react'
import { getSales } from '@/app/actions/sales'
import { getSaleStatus, formatDateRange } from '@/lib/utils/sales'
import type { SaleWithProducts, SaleStatus } from '@/types/database'

interface SalesContentProps {
  initialSales: SaleWithProducts[]
  error: string | null
}

export function SalesContent({ initialSales, error: initialError }: SalesContentProps) {
  const [sales, setSales] = useState<SaleWithProducts[]>(initialSales)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(initialError)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [selectedSale, setSelectedSale] = useState<SaleWithProducts | null>(null)

  const refreshSales = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const updatedSales = await getSales()
      setSales(updatedSales)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh sales')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (sale: SaleWithProducts) => {
    setSelectedSale(sale)
    setEditDialogOpen(true)
  }

  const handleDelete = (sale: SaleWithProducts) => {
    setSelectedSale(sale)
    setDeleteDialogOpen(true)
  }

  const handleManageProducts = (sale: SaleWithProducts) => {
    setSelectedSale(sale)
    setProductDialogOpen(true)
  }

  const handleDialogClose = () => {
    refreshSales()
  }

  const getStatusColor = (status: SaleStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'ended':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: SaleStatus) => {
    switch (status) {
      case 'active':
        return '🟢'
      case 'upcoming':
        return '🔵'
      case 'ended':
        return '⚪'
      default:
        return '⚪'
    }
  }

  // Listen for router refresh events
  useEffect(() => {
    refreshSales()
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
              onClick={refreshSales}
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
          <h2 className="text-lg font-medium text-gray-900">All Sales</h2>
          <p className="text-sm text-gray-600">
            {sales.length} {sales.length === 1 ? 'sale' : 'sales'} total
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={refreshSales}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Sale
          </Button>
        </div>
      </div>

      {sales.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium">No sales yet</p>
            <p className="mt-1">Get started by creating your first sale event.</p>
            <Button 
              className="mt-4" 
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Sale
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sales.map((sale) => {
            const status = getSaleStatus(sale)
            return (
              <Card key={sale.id} className="relative overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{sale.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getStatusColor(status)}>
                          {getStatusIcon(status)} {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(sale)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(sale)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {formatDateRange(sale.start_date, sale.end_date)}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Package className="w-4 h-4" />
                      {sale.product_count || 0} products
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleManageProducts(sale)}
                    className="w-full"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Products
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <SaleDialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open)
          if (!open) handleDialogClose()
        }}
      />

      <SaleDialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open)
          if (!open) handleDialogClose()
        }}
        sale={selectedSale || undefined}
      />

      {selectedSale && (
        <DeleteSaleDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open)
            if (!open) handleDialogClose()
          }}
          sale={selectedSale}
        />
      )}

      {selectedSale && (
        <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
          <DialogContent 
            className="!max-w-none !w-[90vw] !h-[90vh] p-0" 
            style={{ 
              maxWidth: '1400px !important', 
              width: '90vw !important', 
              maxHeight: '90vh !important', 
              height: '90vh !important',
              minWidth: '1200px !important'
            }}
          >
            <DialogHeader className="p-6 pb-4 border-b">
              <DialogTitle className="text-xl">
                Manage Products - {selectedSale.name}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-hidden px-8 pb-8 pt-4">
              <ProductSelection 
                saleId={selectedSale.id} 
                onProductsChange={handleDialogClose}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
} 