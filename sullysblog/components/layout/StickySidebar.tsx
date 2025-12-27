'use client'

import { useEffect, useRef, useState, ReactNode } from 'react'

type StickySidebarProps = {
  children: ReactNode
}

export function StickySidebar({ children }: StickySidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [stickyTop, setStickyTop] = useState(16) // Default 1rem = 16px

  useEffect(() => {
    const calculateStickyTop = () => {
      if (!sidebarRef.current) return

      const sidebarHeight = sidebarRef.current.offsetHeight
      const viewportHeight = window.innerHeight
      const padding = 32 // 2rem total padding (top + bottom)

      if (sidebarHeight <= viewportHeight - padding) {
        // Sidebar fits in viewport, stick to top
        setStickyTop(16)
      } else {
        // Sidebar is taller than viewport
        // Calculate negative top so bottom of sidebar aligns with bottom of viewport
        const newTop = viewportHeight - sidebarHeight - 16
        setStickyTop(newTop)
      }
    }

    // Initial calculation
    calculateStickyTop()

    // Recalculate on resize
    window.addEventListener('resize', calculateStickyTop)

    // Also observe content changes that might affect height
    const resizeObserver = new ResizeObserver(calculateStickyTop)
    if (sidebarRef.current) {
      resizeObserver.observe(sidebarRef.current)
    }

    return () => {
      window.removeEventListener('resize', calculateStickyTop)
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <div
      ref={sidebarRef}
      className="sticky"
      style={{ top: `${stickyTop}px` }}
    >
      {children}
    </div>
  )
}
