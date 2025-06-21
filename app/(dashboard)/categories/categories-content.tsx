'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CategoryDialog } from '@/components/categories/category-dialog'
import { DeleteCategoryDialog } from '@/components/categories/delete-category-dialog'
import { Plus, Edit, Trash2 } from 'lucide-react'
import type { Category } from '@/types/database'

interface CategoriesContentProps {
  initialCategories: Category[]
  error: string | null
}

export function CategoriesContent({ initialCategories, error }: CategoriesContentProps) {
  const [categories] = useState<Category[]>(initialCategories)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    setEditDialogOpen(true)
  }

  const handleDelete = (category: Category) => {
    setSelectedCategory(category)
    setDeleteDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p><strong>Error:</strong> {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">All Categories</h2>
          <p className="text-sm text-gray-600">
            {categories.length} {categories.length === 1 ? 'category' : 'categories'} total
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Category
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg font-medium">No categories yet</p>
            <p className="mt-1">Get started by creating your first category.</p>
            <Button 
              className="mt-4" 
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Category
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Buyer Name</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    {category.buyer_name || (
                      <span className="text-gray-400 italic">No buyer assigned</span>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(category.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <CategoryDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <CategoryDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        category={selectedCategory || undefined}
      />

      {selectedCategory && (
        <DeleteCategoryDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          category={selectedCategory}
        />
      )}
    </div>
  )
} 