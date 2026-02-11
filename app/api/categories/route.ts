import { createClient } from '@/lib/supabase/server'
import { categorySchema } from '@/lib/utils/validation'
import { DEFAULT_CATEGORY_COLOR } from '@/lib/constants'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/categories
 * List all categories for the authenticated user
 */
export async function GET() {
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

    // Fetch categories ordered by name
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'DATABASE_ERROR', message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: data || [] })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/categories
 * Create a new category
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
    const validationResult = categorySchema.safeParse(body)

    if (!validationResult.success) {
      const errors = validationResult.error.flatten()
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'Invalid category data',
          details: errors.fieldErrors,
        },
        { status: 400 }
      )
    }

    const { name, color, icon_id } = validationResult.data

    // Insert category with default color if not provided
    const { data, error } = await supabase
      .from('categories')
      .insert({
        user_id: user.id,
        name: name.trim(),
        color: color?.toUpperCase() || DEFAULT_CATEGORY_COLOR,
        icon_id: icon_id || null,
      })
      .select()
      .single()

    if (error) {
      // Handle unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          {
            error: 'CONFLICT',
            message: 'A category with this name already exists',
          },
          { status: 409 }
        )
      }

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
