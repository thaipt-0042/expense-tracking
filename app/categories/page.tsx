'use client'

import { useState, useEffect } from 'react'
import CategoryList from '@/components/categories/CategoryList'
import CategoryForm from '@/components/categories/CategoryForm'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { Tables } from '@/types/database.types'

type Category = Tables<'categories'>

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/categories')

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.message || 'Failed to fetch categories')
      }

      const result = await response.json()
      setCategories(result.data)
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

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category)
    setIsEditModalOpen(true)
  }

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false)
    fetchCategories()
  }

  const handleEditSuccess = () => {
    setIsEditModalOpen(false)
    setSelectedCategory(null)
    fetchCategories()
  }

  const handleDelete = async () => {
    if (!selectedCategory) return

    try {
      setDeleteLoading(true)

      const response = await fetch(`/api/categories/${selectedCategory.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.message || 'Failed to delete category')
      }

      setIsDeleteModalOpen(false)
      setIsEditModalOpen(false)
      setSelectedCategory(null)
      fetchCategories()
    } catch (err) {
      console.error('Delete error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      setDeleteLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="mt-1 text-sm text-gray-500">
            Organize your transactions with custom categories
          </p>
        </div>
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
          New Category
        </Button>
      </div>

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

      {/* Category List */}
      {!loading && (
        <CategoryList
          categories={categories}
          onCategoryClick={handleCategoryClick}
          emptyMessage="No categories yet. Create your first category to organize your transactions!"
        />
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Category"
        size="md"
      >
        <CategoryForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedCategory(null)
        }}
        title="Edit Category"
        size="md"
      >
        {selectedCategory && (
          <>
            <CategoryForm
              categoryId={selectedCategory.id}
              initialData={{
                name: selectedCategory.name,
                color: selectedCategory.color,
                icon_id: selectedCategory.icon_id || undefined,
              }}
              onSuccess={handleEditSuccess}
              onCancel={() => {
                setIsEditModalOpen(false)
                setSelectedCategory(null)
              }}
            />
            <div className="mt-4 border-t pt-4">
              <Button
                variant="danger"
                onClick={() => {
                  setIsEditModalOpen(false)
                  setIsDeleteModalOpen(true)
                }}
                className="w-full"
              >
                Delete Category
              </Button>
            </div>
          </>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Category"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this category? Transactions using this category
            will become uncategorized. This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteModalOpen(false)
                setIsEditModalOpen(true)
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleteLoading}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
