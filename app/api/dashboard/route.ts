import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPeriodDates } from '@/lib/utils/date'

/**
 * GET /api/dashboard
 * Get dashboard statistics for the authenticated user
 * Query params:
 * - period: 'day' | 'week' | 'month' (default: 'month')
 * - date: ISO date string (default: current date)
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized', message: 'Authentication required' }, { status: 401 })
  }

  // Parse query params
  const searchParams = request.nextUrl.searchParams
  const period = (searchParams.get('period') as 'day' | 'week' | 'month') || 'month'
  const dateParam = searchParams.get('date')

  // Validate period
  if (!['day', 'week', 'month'].includes(period)) {
    return NextResponse.json(
      { error: 'VALIDATION_ERROR', message: 'Invalid period parameter', details: { period: ['Must be one of: day, week, month'] } },
      { status: 400 }
    )
  }

  // Calculate period boundaries
  const referenceDate = dateParam ? new Date(dateParam) : new Date()
  
  // Validate reference date
  if (dateParam && isNaN(referenceDate.getTime())) {
    return NextResponse.json(
      { error: 'VALIDATION_ERROR', message: 'Invalid date parameter', details: { date: ['Must be a valid ISO 8601 date string'] } },
      { status: 400 }
    )
  }

  const { startDate, endDate } = getPeriodDates(period, referenceDate)

  try {
    // Call the database function to get dashboard stats
    const { data, error } = await supabase.rpc('get_dashboard_stats', {
      p_start_date: startDate,
      p_end_date: endDate,
    })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'DATABASE_ERROR', message: 'Failed to retrieve dashboard statistics' },
        { status: 500 }
      )
    }

    // The RPC function returns a single row
    const stats = data?.[0] || {
      total_income: 0,
      total_expenses: 0,
      net_balance: 0,
      category_breakdown: [],
    }

    // Parse category_breakdown if it's a string (Supabase sometimes returns JSONB as string)
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
        percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
      }
    })

    // Return the response matching the API contract
    return NextResponse.json({
      data: {
        total_income: Number(stats.total_income),
        total_expenses: Number(stats.total_expenses),
        net_balance: Number(stats.net_balance),
        category_breakdown: transformedBreakdown,
        period,
        start_date: startDate,
        end_date: endDate,
      },
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
