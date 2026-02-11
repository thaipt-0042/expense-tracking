'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import TransactionForm from '@/components/transactions/TransactionForm'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { Tables } from '@/types/database.types'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/date'
import { use } from 'react'

type Transaction = Tables<'transactions'> & {
  category?: Tables<'categories'> | null
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function TransactionDetailPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchTransaction = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/transactions/${resolvedParams.id}`)

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.message || 'Failed to fetch transaction')
      }

      const result = await response.json()
      setTransaction(result.data)
    } catch (err) {
      console.error('Fetch error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransaction()
  }, [resolvedParams.id])

  const handleEditSuccess = () => {
    setIsEditModalOpen(false)
    fetchTransaction()
  }

  const handleDelete = async () => {
    try {
      setDeleteLoading(true)

      const response = await fetch(`/api/transactions/${resolvedParams.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.message || 'Failed to delete transaction')
      }

      router.push('/transactions')
      router.refresh()
    } catch (err) {
      console.error('Delete error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error || !transaction) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-lg bg-red-50 p-4 text-red-600">
          {error || 'Transaction not found'}
        </div>
        <Button onClick={() => router.push('/transactions')} className="mt-4">
          Back to Transactions
        </Button>
      </div>
    )
  }

  const isIncome = transaction.type === 'income'

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => router.push('/transactions')}
        className="mb-6 flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="mr-1 h-4 w-4"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back to Transactions
      </button>

      {/* Transaction Details Card */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {transaction.description}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {formatDate(transaction.date, 'long')}
            </p>
          </div>
          <span
            className={`text-3xl font-bold ${
              isIncome ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isIncome ? '+' : '-'}
            {formatCurrency(transaction.amount)}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-4 border-t pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-500">Type</span>
              <p className="mt-1 capitalize text-gray-900">{transaction.type}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Category</span>
              <p className="mt-1 text-gray-900">
                {transaction.category ? (
                  <span
                    className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
                    style={{
                      backgroundColor: `${transaction.category.color}20`,
                      color: transaction.category.color,
                    }}
                  >
                    {transaction.category.name}
                  </span>
                ) : (
                  <span className="text-gray-400">Uncategorized</span>
                )}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Created</span>
              <p className="mt-1 text-gray-900">
                {formatDate(transaction.created_at, 'medium')}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Last Updated</span>
              <p className="mt-1 text-gray-900">
                {formatDate(transaction.updated_at, 'medium')}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3 border-t pt-6">
          <Button
            variant="danger"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Delete
          </Button>
          <Button onClick={() => setIsEditModalOpen(true)}>
            Edit Transaction
          </Button>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Transaction"
        size="md"
      >
        <TransactionForm
          transactionId={transaction.id}
          initialData={{
            amount: transaction.amount.toString(),
            description: transaction.description,
            date: transaction.date.split('T')[0],
            type: transaction.type as 'income' | 'expense',
            category_id: transaction.category_id || undefined,
          }}
          onSuccess={handleEditSuccess}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Transaction"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this transaction? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleteLoading}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
