'use client'

import { useTheme } from '@/components/providers/ThemeProvider'

export function HeaderTagline() {
  const { theme } = useTheme()

  return (
    <p
      className="text-sm mt-2"
      style={{ color: theme === 'dark' ? '#ffffff' : '#4b5563' }}
    >
      Domain investing tips, strategies, and industry insights
    </p>
  )
}
