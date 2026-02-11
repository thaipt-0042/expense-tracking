'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Button from '@/components/ui/Button'

interface TransactionFiltersProps {
  categories?: Array<{ id: string; name: string; color: string }>
}

export default function TransactionFilters({ categories = [] }: TransactionFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [filters, setFilters] = useState({
    category_id: searchParams.get('category_id') || '',
    type: searchParams.get('type') || '',
    start_date: searchParams.get('start_date') || '',
    end_date: searchParams.get('end_date') || '',
  })

  const [isOpen, setIsOpen] = useState(false)

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())

    // Update or remove filter params
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    // Reset to page 1 when filtering
    params.set('page', '1')

    router.push(`/transactions?${params.toString()}`)
    setIsOpen(false)
  }

  const clearFilters = () => {
    setFilters({
      category_id: '',
      type: '',
      start_date: '',
      end_date: '',
    })

    const params = new URLSearchParams(searchParams.toString())
    params.delete('category_id')
    params.delete('type')
    params.delete('start_date')
    params.delete('end_date')
    params.set('page', '1')

    router.push(`/transactions?${params.toString()}`)
  }

  const hasActiveFilters = Object.values(filters).some((value) => value !== '')

  return (
    <div className="relative">
      {/* Filter Button */}
      <Button
        variant={hasActiveFilters ? 'primary' : 'secondary'}
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <svg
          className="mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        Filters
        {hasActiveFilters && (
          <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-semibold text-blue-600">
            {Object.values(filters).filter((v) => v).length}
          </span>
        )}
      </Button>

      {/* Filter Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 z-20 mt-2 w-80 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Filter Transactions</h3>

            <div className="space-y-4">
              {/* Category Filter */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  value={filters.category_id}
                  onChange={(e) =>
                    setFilters({ ...filters, category_id: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  <option value="uncategorized">Uncategorized</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) =>
                    setFilters({ ...filters, type: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.start_date}
                  onChange={(e) =>
                    setFilters({ ...filters, start_date: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.end_date}
                  onChange={(e) =>
                    setFilters({ ...filters, end_date: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-between">
              <Button variant="ghost" onClick={clearFilters} disabled={!hasActiveFilters}>
                Clear All
              </Button>
              <Button variant="primary" onClick={applyFilters}>
                Apply Filters
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
