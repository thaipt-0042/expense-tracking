'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { formatDateForInput } from '@/lib/utils/date'
import { Tables } from '@/types/database.types'

type Category = Tables<'categories'>

export interface TransactionFormData {
  amount: string
  description: string
  date: string
  type: 'income' | 'expense'
  category_id?: string
}

interface TransactionFormProps {
  initialData?: Partial<TransactionFormData>
  transactionId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export default function TransactionForm({
  initialData,
  transactionId,
  onSuccess,
  onCancel,
}: TransactionFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  const [formData, setFormData] = useState<TransactionFormData>({
    amount: initialData?.amount || '',
    description: initialData?.description || '',
    date: initialData?.date || formatDateForInput(new Date()),
    type: initialData?.type || 'expense',
    category_id: initialData?.category_id,
  })

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const result = await response.json()
          setCategories(result.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        setCategoriesLoading(false)
      }
    }

    fetchCategories()
  }, [])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      // Convert amount string to number
      const amount = parseFloat(formData.amount)

      // Client-side validation
      const validationErrors: Record<string, string> = {}

      if (!formData.amount || isNaN(amount)) {
        validationErrors.amount = 'Amount is required and must be a valid number'
      } else if (amount <= 0) {
        validationErrors.amount = 'Amount must be greater than 0'
      } else if (amount > 999999999.99) {
        validationErrors.amount = 'Amount cannot exceed 999,999,999.99'
      } else if (!/^\d+(\.\d{1,2})?$/.test(formData.amount)) {
        validationErrors.amount = 'Amount must have at most 2 decimal places'
      }

      if (!formData.description.trim()) {
        validationErrors.description = 'Description is required'
      } else if (formData.description.length > 500) {
        validationErrors.description = 'Description cannot exceed 500 characters'
      }

      if (!formData.date) {
        validationErrors.date = 'Date is required'
      }

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        setLoading(false)
        return
      }

      // Prepare data for API
      const apiData = {
        amount,
        description: formData.description.trim(),
        date: new Date(formData.date).toISOString(),
        type: formData.type,
        category_id: formData.category_id || null,
      }

      // Determine API endpoint and method
      const url = transactionId
        ? `/api/transactions/${transactionId}`
        : '/api/transactions'
      const method = transactionId ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.details) {
          // Server validation errors
          const serverErrors: Record<string, string> = {}
          for (const [field, messages] of Object.entries(result.details)) {
            if (Array.isArray(messages) && messages.length > 0) {
              serverErrors[field] = messages[0]
            }
          }
          setErrors(serverErrors)
        } else {
          setErrors({ submit: result.message || 'Failed to save transaction' })
        }
        setLoading(false)
        return
      }

      // Success
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/transactions')
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
      {/* Type Selection */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Type <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'expense' })}
            className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
              formData.type === 'expense'
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, type: 'income' })}
            className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
              formData.type === 'income'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            }`}
          >
            Income
          </button>
        </div>
      </div>

      {/* Amount */}
      <Input
        label="Amount"
        type="text"
        inputMode="decimal"
        placeholder="0.00"
        value={formData.amount}
        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
        error={errors.amount}
        required
      />

      {/* Description */}
      <Input
        label="Description"
        type="text"
        placeholder="e.g., Grocery shopping"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        error={errors.description}
        helperText={`${formData.description.length}/500 characters`}
        required
      />

      {/* Date */}
      <Input
        label="Date"
        type="date"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        error={errors.date}
        required
      />

      {/* Category */}
      <div>
        <label htmlFor="category" className="mb-1 block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          id="category"
          value={formData.category_id || ''}
          onChange={(e) =>
            setFormData({ ...formData, category_id: e.target.value || undefined })
          }
          disabled={categoriesLoading}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
        >
          <option value="">Uncategorized</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {categoriesLoading && (
          <p className="mt-1 text-sm text-gray-500">Loading categories...</p>
        )}
        {!categoriesLoading && categories.length === 0 && (
          <p className="mt-1 text-sm text-gray-500">
            No categories yet.{' '}
            <a href="/categories" className="text-blue-600 hover:underline">
              Create one
            </a>
          </p>
        )}
      </div>

      {/* lue={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        error={errors.description}
        helperText={`${formData.description.length}/500 characters`}
        required
      />

      {/* Date */}
      <Input
        label="Date"
        type="date"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        error={errors.date}
        required
      />

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
          {transactionId ? 'Update' : 'Create'} Transaction
        </Button>
      </div>
    </form>
  )
}
