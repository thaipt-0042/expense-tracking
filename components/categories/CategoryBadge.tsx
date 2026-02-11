import { Tables } from '@/types/database.types'

type Category = Tables<'categories'>

interface CategoryBadgeProps {
  category: Category
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function CategoryBadge({ 
  category, 
  size = 'md',
  className = '' 
}: CategoryBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: `${category.color}20`,
        color: category.color,
      }}
    >
      {category.icon_id && (
        <span className="mr-1" aria-hidden="true">
          {/* Icon placeholder - can be replaced with actual icon component */}
          ●
        </span>
      )}
      {category.name}
    </span>
  )
}
