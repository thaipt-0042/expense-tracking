import { createClient } from '@/lib/supabase/server'
import { transactionSchema } from '@/lib/utils/validation'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{ id: string }>
}

/**
 * GET /api/transactions/[id]
 * Get a single transaction by ID
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { id } = await context.params

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

    // Fetch transaction with category
    const { data, error } = await supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'NOT_FOUND', message: 'Transaction not found' },
          { status: 404 }
        )
      }

      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'DATABASE_ERROR', message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/transactions/[id]
 * Update a transaction
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { id } = await context.params

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
    
    // For updates, all fields are optional
    const updateSchema = transactionSchema.partial()
    const validationResult = updateSchema.safeParse(body)

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

    // Ensure at least one field is being updated
    if (Object.keys(validationResult.data).length === 0) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'At least one field must be provided for update',
        },
        { status: 400 }
      )
    }

    // Update transaction
    const { data, error } = await supabase
      .from('transactions')
      .update(validationResult.data)
      .eq('id', id)
      .select('*, category:categories(*)')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'NOT_FOUND', message: 'Transaction not found' },
          { status: 404 }
        )
      }

      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'DATABASE_ERROR', message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
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

/**
 * DELETE /api/transactions/[id]
 * Delete a transaction
 */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { id } = await context.params

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

    // Delete transaction
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'NOT_FOUND', message: 'Transaction not found' },
          { status: 404 }
        )
      }

      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'DATABASE_ERROR', message: error.message },
        { status: 500 }
      )
    }

    // Return 204 No Content on successful deletion
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
