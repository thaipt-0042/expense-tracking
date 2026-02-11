'use client'

interface DashboardStatsProps {
  totalIncome: number
  totalExpenses: number
  netBalance: number
}

export default function DashboardStats({ totalIncome, totalExpenses, netBalance }: DashboardStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const hasData = totalIncome > 0 || totalExpenses > 0

  if (!hasData) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating your first transaction to see your financial overview.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Total Income Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Income</p>
            <p className="mt-2 text-3xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="rounded-full bg-green-100 p-3">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Total Expenses Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Expenses</p>
            <p className="mt-2 text-3xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
          </div>
          <div className="rounded-full bg-red-100 p-3">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Net Balance Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Net Balance</p>
            <p
              className={`mt-2 text-3xl font-bold ${
                netBalance >= 0 ? 'text-blue-600' : 'text-orange-600'
              }`}
            >
              {formatCurrency(netBalance)}
            </p>
          </div>
          <div className={`rounded-full ${netBalance >= 0 ? 'bg-blue-100' : 'bg-orange-100'} p-3`}>
            <svg
              className={`h-6 w-6 ${netBalance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  netBalance >= 0
                    ? 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    : 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                }
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
