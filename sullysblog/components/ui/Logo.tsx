'use client'

import Image from 'next/image'
import { useTheme } from '@/components/providers/ThemeProvider'

interface LogoProps {
  className?: string
  width?: number
  height?: number
}

export function Logo({ className = "h-12 w-auto", width = 200, height = 53 }: LogoProps) {
  const { theme } = useTheme()

  return (
    <Image
      src={theme === 'dark' ? '/logo-dark.png' : '/logo-light.png'}
      alt="SullysBlog"
      width={width}
      height={height}
      className={className}
      priority
    />
  )
}
