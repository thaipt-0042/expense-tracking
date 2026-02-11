'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from '@/lib/constants'

export interface CategoryFormData {
  name: string
  color: string
  icon_id?: string
}

interface CategoryFormProps {
  initialData?: Partial<CategoryFormData>
  categoryId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export default function CategoryForm({
  initialData,
  categoryId,
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<CategoryFormData>({
    name: initialData?.name || '',
    color: initialData?.color || DEFAULT_CATEGORY_COLOR,
    icon_id: initialData?.icon_id,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      // Client-side validation
      const validationErrors: Record<string, string> = {}

      if (!formData.name.trim()) {
        validationErrors.name = 'Category name is required'
      } else if (formData.name.length > 50) {
        validationErrors.name = 'Category name cannot exceed 50 characters'
      }

      if (!formData.color.match(/^#[0-9A-F]{6}$/i)) {
        validationErrors.color = 'Please select a valid color'
      }

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        setLoading(false)
        return
      }

      // Prepare data for API
      const apiData = {
        name: formData.name.trim(),
        color: formData.color.toUpperCase(),
        icon_id: formData.icon_id || null,
      }

      // Determine API endpoint and method
      const url = categoryId ? `/api/categories/${categoryId}` : '/api/categories'
      const method = categoryId ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          setErrors({ name: 'A category with this name already exists' })
        } else if (result.details) {
          // Server validation errors
          const serverErrors: Record<string, string> = {}
          for (const [field, messages] of Object.entries(result.details)) {
            if (Array.isArray(messages) && messages.length > 0) {
              serverErrors[field] = messages[0]
            }
          }
          setErrors(serverErrors)
        } else {
          setErrors({ submit: result.message || 'Failed to save category' })
        }
        setLoading(false)
        return
      }

      // Success
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/categories')
        router.refresh()
      }
    } catch (error) {
      console.error('Submit error:', error)
      setErrors({ submit: 'An unexpected error occurred' })
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <Input
        label="Category Name"
        type="text"
        placeholder="e.g., Food, Transport, Salary"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
        helperText={`${formData.name.length}/50 characters`}
        required
      />

      {/* Color Picker */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Color <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-8 gap-2">
          {CATEGORY_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setFormData({ ...formData, color })}
              className={`h-10 w-10 rounded-lg border-2 transition-all ${
                formData.color.toUpperCase() === color.toUpperCase()
                  ? 'border-gray-900 scale-110'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
        {errors.color && (
          <p className="mt-1 text-sm text-red-600">{errors.color}</p>
        )}
      </div>

      {/* Color Preview */}
      <div className="rounded-lg border bg-gray-50 p-4">
        <p className="mb-2 text-sm font-medium text-gray-700">Preview</p>
        <span
          className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
          style={{
            backgroundColor: `${formData.color}20`,
            color: formData.color,
          }}
        >
          {formData.name || 'Category Name'}
        </span>
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {errors.submit}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading}>
          {categoryId ? 'Update' : 'Create'} Category
        </Button>
      </div>
    </form>
  )
}
