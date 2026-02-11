'use client'

interface CategoryBreakdownItem {
  category_id: string
  category_name: string
  category_color: string
  category_icon: string | null
  total_amount: number
  transaction_count: number
  percentage: number
}

interface CategoryBreakdownProps {
  categories: CategoryBreakdownItem[]
}

export default function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <svg
          className="mx-auto h-10 w-10 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
        <p className="mt-2 text-sm text-gray-500">No category data available for this period</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
      
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.category_id} className="space-y-2">
            {/* Category Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Category Badge */}
                <span
                  className="inline-flex items-center rounded-md px-2.5 py-1 text-sm font-medium"
                  style={{
                    backgroundColor: category.category_color + '20',
                    color: category.category_color,
                  }}
                >
                  {category.category_icon && <span className="mr-1">●</span>}
                  {category.category_name}
                </span>
                <span className="text-xs text-gray-500">
                  {category.transaction_count} {category.transaction_count === 1 ? 'transaction' : 'transactions'}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(category.total_amount)}
                </span>
                <span className="text-xs font-medium text-gray-500">
                  {category.percentage.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${category.percentage}%`,
                  backgroundColor: category.category_color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      {categories.length > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">Total Spending</span>
            <span className="font-semibold text-gray-900">
              {formatCurrency(categories.reduce((sum, cat) => sum + cat.total_amount, 0))}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
