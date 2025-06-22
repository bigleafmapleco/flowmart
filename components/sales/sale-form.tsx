'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import { createSale, updateSale } from '@/app/actions/sales'
import type { SaleWithProducts } from '@/types/database'

interface SaleFormProps {
  sale?: SaleWithProducts
  onSuccess?: () => void
}

export function SaleForm({ sale, onSuccess }: SaleFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState<Date | undefined>(
    sale?.start_date ? new Date(sale.start_date) : undefined
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    sale?.end_date ? new Date(sale.end_date) : undefined
  )

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setError(null)

    try {
      // Add dates to form data
      if (startDate) {
        formData.set('start_date', startDate.toISOString().split('T')[0])
      }
      if (endDate) {
        formData.set('end_date', endDate.toISOString().split('T')[0])
      }

      if (sale) {
        await updateSale(sale.id, formData)
      } else {
        await createSale(formData)
      }
      
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Sale Name *</Label>
        <Input
          id="name"
          name="name"
          defaultValue={sale?.name || ''}
          required
          placeholder="Enter sale name (e.g., Spring Sale 2024)"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date *</Label>
          <DatePicker
            date={startDate}
            onDateChange={setStartDate}
            placeholder="Select start date"
          />
        </div>

        <div className="space-y-2">
          <Label>End Date *</Label>
          <DatePicker
            date={endDate}
            onDateChange={setEndDate}
            placeholder="Select end date"
          />
        </div>
      </div>

      {startDate && endDate && startDate >= endDate && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          End date must be after start date
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button 
          type="submit" 
          disabled={loading || !startDate || !endDate || startDate >= endDate}
        >
          {loading ? 'Saving...' : sale ? 'Update Sale' : 'Create Sale'}
        </Button>
      </div>
    </form>
  )
} 