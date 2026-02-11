import { createClient } from '@/lib/supabase/server'
import { transactionSchema } from '@/lib/utils/validation'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/transactions
 * List transactions with pagination and filters
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const search = searchParams.get('search') || undefined
    const categoryId = searchParams.get('category_id') || undefined
    const type = searchParams.get('type') as 'income' | 'expense' | undefined
    const startDate = searchParams.get('start_date') || undefined
    const endDate = searchParams.get('end_date') || undefined
    const sort = searchParams.get('sort') || 'date_desc'

    // Build query
    let query = supabase
      .from('transactions')
      .select('*, category:categories(*)', { count: 'exact' })

    // Apply filters
    if (search) {
      query = query.ilike('description', `%${search}%`)
    }

    if (categoryId) {
      if (categoryId === 'uncategorized') {
        query = query.is('category_id', null)
      } else {
        query = query.eq('category_id', categoryId)
      }
    }

    if (type) {
      query = query.eq('type', type)
    }

    if (startDate) {
      query = query.gte('date', startDate)
    }

    if (endDate) {
      query = query.lt('date', endDate)
    }

    // Apply sorting
    switch (sort) {
      case 'date_asc':
        query = query.order('date', { ascending: true })
        break
      case 'amount_desc':
        query = query.order('amount', { ascending: false })
        break
      case 'amount_asc':
        query = query.order('amount', { ascending: true })
        break
      case 'date_desc':
      default:
        query = query.order('date', { ascending: false })
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'DATABASE_ERROR', message: error.message },
        { status: 500 }
      )
    }

    const totalPages = count ? Math.ceil(count / limit) : 0

    return NextResponse.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
      },
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/transactions
 * Create a new transaction
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = transactionSchema.safeParse(body)

    if (!validationResult.success) {
      const errors = validationResult.error.flatten()
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'Invalid transaction data',
          details: errors.fieldErrors,
        },
        { status: 400 }
      )
    }

    const { amount, description, date, type, category_id } = validationResult.data

    // Insert transaction
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        amount,
        description,
        date,
        type,
        category_id: category_id || null,
      })
      .select('*, category:categories(*)')
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'DATABASE_ERROR', message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    
    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'INVALID_JSON', message: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
