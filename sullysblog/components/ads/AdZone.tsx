import { getAdsByZone } from '@/lib/queries/ads'
import { AdDisplay } from './AdDisplay'

type AdZoneProps = {
  zone: string
  className?: string
}

export async function AdZone({ zone, className = '' }: AdZoneProps) {
  const ads = await getAdsByZone(zone)

  if (ads.length === 0) {
    return null
  }

  // For now, show the first ad (highest priority)
  // Later we can implement rotation or show multiple ads
  const ad = ads[0]

  return (
    <div className={`ad-zone ad-zone-${zone} ${className}`}>
      <AdDisplay ad={ad} />
    </div>
  )
}
