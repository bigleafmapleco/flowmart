import type { SaleStatus } from '@/types/database'

export function getSaleStatus(sale: { start_date: string; end_date: string }): SaleStatus {
  const now = new Date()
  const startDate = new Date(sale.start_date)
  const endDate = new Date(sale.end_date)

  if (now < startDate) {
    return 'upcoming'
  } else if (now >= startDate && now <= endDate) {
    return 'active'
  } else {
    return 'ended'
  }
}

export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  // If same year, show "Mar 15 - Mar 22, 2024"
  if (start.getFullYear() === end.getFullYear()) {
    const startFormatted = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const endFormatted = formatter.format(end)
    return `${startFormatted} - ${endFormatted}`
  }
  
  // If different years, show full dates
  return `${formatter.format(start)} - ${formatter.format(end)}`
} 