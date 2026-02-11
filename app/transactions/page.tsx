'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import TransactionList from '@/components/transactions/TransactionList'
import TransactionForm from '@/components/transactions/TransactionForm'
import SearchBar from '@/components/transactions/SearchBar'
import TransactionFilters from '@/components/transactions/TransactionFilters'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { Tables } from '@/types/database.types'

type Transaction = Tables<'transactions'> & {
  category?: Tables<'categories'> | null
}

type Category = Tables<'categories'>

function TransactionsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Get filter values from URL
  const search = searchParams.get('search') || ''
  const hasFilters = searchParams.get('category_id') || searchParams.get('type') || 
                     searchParams.get('start_date') || searchParams.get('end_date') || search

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const result = await response.json()
        setCategories(result.data)
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError(null)

      // Build query string from search params
      const params = new URLSearchParams(searchParams.toString())
      const queryString = params.toString()

      const response = await fetch(`/api/transactions${queryString ? `?${queryString}` : ''}`)

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.message || 'Failed to fetch transactions')
      }

      const result = await response.json()
      setTransactions(result.data)
    } catch (err) {
      console.error('Fetch error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [searchParams])

  const handleTransactionClick = (transaction: Transaction) => {
    router.push(`/transactions/${transaction.id}`)
  }

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false)
    fetchTransactions()
  }

  // Determine empty message based on context
  const getEmptyMessage = () => {
    if (hasFilters) {
      return 'No transactions found matching your filters. Try adjusting your search or filters.'
    }
    return 'No transactions yet. Create your first transaction to get started!'
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="-ml-1 mr-1 h-5 w-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Transaction
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchBar placeholder="Search by description..." />
        </div>
        <TransactionFilters categories={categories} />
      </div>

      {/* Active Filters Indicator */}
      {hasFilters && (
        <div className="mb-4 flex items-center justify-between rounded-lg bg-blue-50 px-4 py-2 text-sm">
          <span className="text-blue-700">
            Filters active • {transactions.length} result{transactions.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={() => router.push('/transactions')}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
        </div>
      )}

      {/* Transaction List */}
      {!loading && (
        <TransactionList
          transactions={transactions}
          onTransactionClick={handleTransactionClick}
          emptyMessage={getEmptyMessage()}
        />
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Transaction"
        size="md"
      >
        <TransactionForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>
    </div>
  )
}

export default function TransactionsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
          </div>
        </div>
      }
    >
      <TransactionsContent />
    </Suspense>
  )
}
