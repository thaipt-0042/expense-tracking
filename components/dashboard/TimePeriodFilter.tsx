'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface TimePeriodFilterProps {
  currentPeriod: 'day' | 'week' | 'month'
}

export default function TimePeriodFilter({ currentPeriod }: TimePeriodFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePeriodChange = (period: 'day' | 'week' | 'month') => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('period', period)
    router.push(`/dashboard?${params.toString()}`)
  }

  const periods = [
    { value: 'day', label: 'Day', icon: 'calendar-day' },
    { value: 'week', label: 'Week', icon: 'calendar-week' },
    { value: 'month', label: 'Month', icon: 'calendar' },
  ] as const

  return (
    <div className="flex items-center space-x-2">
      {periods.map((period) => {
        const isActive = currentPeriod === period.value

        return (
          <button
            key={period.value}
            onClick={() => handlePeriodChange(period.value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              {period.value === 'day' && (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              )}
              {period.value === 'week' && (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              )}
              {period.value === 'month' && (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              )}
              <span>{period.label}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
