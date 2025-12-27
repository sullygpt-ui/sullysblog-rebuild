'use client'

import { Logo } from '@/components/ui/Logo'

export function HeroLogo() {
  return (
    <div className="flex justify-center mb-6">
      <Logo className="h-20 md:h-24 w-auto" width={400} height={106} />
    </div>
  )
}
