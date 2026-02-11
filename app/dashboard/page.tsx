import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardStats from '@/components/dashboard/DashboardStats'
import TimePeriodFilter from '@/components/dashboard/TimePeriodFilter'
import CategoryBreakdown from '@/components/dashboard/CategoryBreakdown'
import { getPeriodDates } from '@/lib/utils/date'

interface DashboardPageProps {
  searchParams: Promise<{ period?: string; date?: string }>
}

async function DashboardContent({ searchParams }: { searchParams: { period?: string; date?: string } }) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get period from query params, default to 'month'
  const period = (searchParams.period as 'day' | 'week' | 'month') || 'month'
  const dateParam = searchParams.date

  // Calculate period boundaries
  const referenceDate = dateParam ? new Date(dateParam) : new Date()
  const { startDate, endDate } = getPeriodDates(period, referenceDate)

  // Call the database function directly
  const { data, error } = await supabase.rpc('get_dashboard_stats', {
    p_start_date: startDate,
    p_end_date: endDate,
  })

  if (error) {
    console.error('Dashboard RPC error:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })
    // Return empty data instead of throwing to allow page to render
    const emptyStats = {
      total_income: 0,
      total_expenses: 0,
      net_balance: 0,
      category_breakdown: [],
    }
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Financial Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              Overview of your financial activity for the selected period
            </p>
          </div>
          <Suspense fallback={<div className="h-10 w-64 animate-pulse rounded bg-gray-200" />}>
            <TimePeriodFilter currentPeriod={period} />
          </Suspense>
        </div>

        <div className="rounded-lg bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">
            Unable to load dashboard data. Error: {error.message}
          </p>
        </div>

        <DashboardStats
          totalIncome={0}
          totalExpenses={0}
          netBalance={0}
        />
      </div>
    )
  }

  // The RPC function returns a single row
  const stats = data?.[0] || {
    total_income: 0,
    total_expenses: 0,
    net_balance: 0,
    category_breakdown: [],
  }

  // Parse category_breakdown if it's a string
  const categoryBreakdown = typeof stats.category_breakdown === 'string' 
    ? JSON.parse(stats.category_breakdown) 
    : stats.category_breakdown || []

  // Transform and calculate percentages for category breakdown
  const totalExpenses = Number(stats.total_expenses)
  const transformedBreakdown = categoryBreakdown.map((category: any) => {
    const totalAmount = Number(category.total_amount)
    const percentage = totalExpenses > 0 ? (totalAmount / totalExpenses) * 100 : 0

    return {
      category_id: category.category_id,
      category_name: category.category_name,
      category_color: category.category_color,
      category_icon: category.category_icon || null,
      total_amount: totalAmount,
      transaction_count: category.transaction_count || 0,
      percentage: Math.round(percentage * 100) / 100,
    }
  })

  const dashboardData = {
    total_income: Number(stats.total_income),
    total_expenses: Number(stats.total_expenses),
    net_balance: Number(stats.net_balance),
    category_breakdown: transformedBreakdown,
    start_date: startDate,
    end_date: endDate,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Overview of your financial activity for the selected period
          </p>
        </div>
        <Suspense fallback={<div className="h-10 w-64 animate-pulse rounded bg-gray-200" />}>
          <TimePeriodFilter currentPeriod={period} />
        </Suspense>
      </div>

      {/* Stats Cards */}
      <DashboardStats
        totalIncome={dashboardData.total_income}
        totalExpenses={dashboardData.total_expenses}
        netBalance={dashboardData.net_balance}
      />

      {/* Category Breakdown */}
      {dashboardData.category_breakdown && dashboardData.category_breakdown.length > 0 && (
        <CategoryBreakdown categories={dashboardData.category_breakdown} />
      )}

      {/* Period Info */}
      <div className="text-center text-xs text-gray-500">
        Showing data from {new Date(dashboardData.start_date).toLocaleDateString()} to{' '}
        {new Date(dashboardData.end_date).toLocaleDateString()}
      </div>
    </div>
  )
}

function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-96 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="flex space-x-2">
          <div className="h-10 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-10 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-10 w-20 animate-pulse rounded bg-gray-200" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-200" />
        ))}
      </div>

      {/* Category Breakdown Skeleton */}
      <div className="h-96 animate-pulse rounded-lg bg-gray-200" />
    </div>
  )
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Suspense fallback={<DashboardLoading />}>
        <DashboardContent searchParams={params} />
      </Suspense>
    </div>
  )
}
