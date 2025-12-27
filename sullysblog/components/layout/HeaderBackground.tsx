'use client'

import { useTheme } from '@/components/providers/ThemeProvider'
import { ReactNode } from 'react'

interface HeaderBackgroundProps {
  children: ReactNode
}

export function HeaderBackground({ children }: HeaderBackgroundProps) {
  const { theme } = useTheme()

  return (
    <div
      className="border-b border-gray-200 dark:border-gray-700"
      style={{ backgroundColor: theme === 'dark' ? '#000000' : '#ffffff' }}
    >
      {children}
    </div>
  )
}
