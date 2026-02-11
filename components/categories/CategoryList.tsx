import CategoryBadge from './CategoryBadge'
import EmptyState from '@/components/ui/EmptyState'
import { Tables } from '@/types/database.types'

type Category = Tables<'categories'>

interface CategoryListProps {
  categories: Category[]
  onCategoryClick?: (category: Category) => void
  emptyMessage?: string
}

export default function CategoryList({
  categories,
  onCategoryClick,
  emptyMessage = 'No categories found',
}: CategoryListProps) {
  if (categories.length === 0) {
    return (
      <EmptyState
        title="No Categories"
        description={emptyMessage}
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-8 w-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
          </svg>
        }
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <div
          key={category.id}
          onClick={onCategoryClick ? () => onCategoryClick(category) : undefined}
          className={`rounded-lg border bg-white p-4 transition-shadow ${
            onCategoryClick ? 'cursor-pointer hover:shadow-md' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <CategoryBadge category={category} size="lg" />
            {onCategoryClick && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-5 w-5 text-gray-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
