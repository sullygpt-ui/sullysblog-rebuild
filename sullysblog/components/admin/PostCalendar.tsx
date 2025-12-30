'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CalendarPost } from '@/lib/queries/posts'

type PostCalendarProps = {
  posts: CalendarPost[]
}

export function PostCalendar({ posts }: PostCalendarProps) {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay()

  // Get today's date for highlighting
  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month

  // Navigate between months
  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Get date string for a post (use published_at for published/scheduled, created_at for drafts)
  const getPostDate = (post: CalendarPost): string => {
    if (post.status === 'draft') {
      return post.created_at.split('T')[0]
    }
    return post.published_at ? post.published_at.split('T')[0] : post.created_at.split('T')[0]
  }

  // Get posts for a specific day
  const getPostsForDay = (day: number): CalendarPost[] => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return posts.filter(post => getPostDate(post) === dateStr)
  }

  // Handle clicking on a post
  const handlePostClick = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation()
    router.push(`/admin/posts/${postId}`)
  }

  // Handle clicking on an empty date
  const handleDateClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    router.push(`/admin/posts/new?date=${dateStr}`)
  }

  // Get status color classes
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-l-green-500'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-l-blue-500'
      case 'draft':
        return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 border-l-gray-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const monthName = currentDate.toLocaleString('default', { month: 'long' })
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Generate calendar grid
  const calendarDays: (number | null)[] = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null)
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <button
            onClick={goToPrevMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white min-w-[180px] text-center">
            {monthName} {year}
          </h2>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => router.push('/admin/posts/new')}
            className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            + New Post
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-green-500 rounded"></span>
          <span className="text-gray-600 dark:text-gray-400">Published</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-blue-500 rounded"></span>
          <span className="text-gray-600 dark:text-gray-400">Scheduled</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-gray-400 rounded"></span>
          <span className="text-gray-600 dark:text-gray-400">Draft</span>
        </div>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
        {weekDays.map(day => (
          <div
            key={day}
            className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          const isToday = isCurrentMonth && day === today.getDate()
          const dayPosts = day ? getPostsForDay(day) : []

          return (
            <div
              key={index}
              onClick={() => day && handleDateClick(day)}
              className={`
                min-h-[120px] p-1 border-b border-r border-gray-200 dark:border-gray-700
                ${day ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750' : 'bg-gray-50 dark:bg-gray-900'}
                ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
              `}
            >
              {day && (
                <>
                  <div className={`
                    text-sm font-medium mb-1 p-1
                    ${isToday
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300'
                    }
                  `}>
                    {day}
                  </div>
                  <div className="space-y-1 max-h-[80px] overflow-y-auto">
                    {dayPosts.map(post => (
                      <div
                        key={post.id}
                        onClick={(e) => handlePostClick(e, post.id)}
                        title={`${post.title} (${post.status})`}
                        className={`
                          text-xs px-1.5 py-1 rounded border-l-2 truncate cursor-pointer
                          hover:opacity-80 transition-opacity
                          ${getStatusColor(post.status)}
                        `}
                      >
                        {post.title}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
