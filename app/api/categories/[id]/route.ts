import { createClient } from '@/lib/supabase/server'
import { categorySchema } from '@/lib/utils/validation'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{ id: string }>
}

/**
 * GET /api/categories/[id]
 * Get a single category by ID
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

    // Fetch category
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'NOT_FOUND', message: 'Category not found' },
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
 * PATCH /api/categories/[id]
 * Update a category
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
    const updateSchema = categorySchema.partial()
    const validationResult = updateSchema.safeParse(body)

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

    // Prepare update data
    const updateData: Record<string, string | null> = {}
    if (validationResult.data.name !== undefined) {
      updateData.name = validationResult.data.name.trim()
    }
    if (validationResult.data.color !== undefined) {
      updateData.color = validationResult.data.color.toUpperCase()
    }
    if (validationResult.data.icon_id !== undefined) {
      updateData.icon_id = validationResult.data.icon_id || null
    }

    // Update category
    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
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

      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'NOT_FOUND', message: 'Category not found' },
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
 * DELETE /api/categories/[id]
 * Delete a category
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

    // Delete category (CASCADE will set category_id to NULL in transactions)
    const { error } = await supabase.from('categories').delete().eq('id', id)

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'NOT_FOUND', message: 'Category not found' },
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
