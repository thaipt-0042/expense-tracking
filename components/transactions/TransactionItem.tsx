import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/date'
import { Tables } from '@/types/database.types'

type Transaction = Tables<'transactions'> & {
  category?: Tables<'categories'> | null
}

interface TransactionItemProps {
  transaction: Transaction
  onClick?: () => void
}

export default function TransactionItem({ transaction, onClick }: TransactionItemProps) {
  const isIncome = transaction.type === 'income'

  return (
    <div
      onClick={onClick}
      className={`rounded-lg border bg-white p-4 transition-shadow ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        {/* Left side - Description and details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-medium text-gray-900 truncate">
            {transaction.description}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <span>{formatDate(transaction.date, 'medium')}</span>
            {transaction.category && (
              <>
                <span className="text-gray-300">•</span>
                <span
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: `${transaction.category.color}20`,
                    color: transaction.category.color,
                  }}
                >
                  {transaction.category.name}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right side - Amount */}
        <div className="ml-4 flex flex-col items-end">
          <span
            className={`text-lg font-semibold ${
              isIncome ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isIncome ? '+' : '-'}
            {formatCurrency(transaction.amount)}
          </span>
          <span className="mt-0.5 text-xs text-gray-400 capitalize">
            {transaction.type}
          </span>
        </div>
      </div>
    </div>
  )
}
