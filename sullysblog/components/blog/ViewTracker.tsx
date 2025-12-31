'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type ViewTrackerProps = {
  slug: string
}

export function ViewTracker({ slug }: ViewTrackerProps) {
  useEffect(() => {
    const trackView = async () => {
      const supabase = createClient()
      await supabase.rpc('increment_post_views', { post_slug: slug })
    }

    trackView()
  }, [slug])

  return null
}
