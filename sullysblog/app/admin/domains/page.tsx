import { getAllDomains } from '@/lib/queries/domains'
import { DomainsManager } from '@/components/admin/DomainsManager'

export default async function AdminDomainsPage() {
  const domains = await getAllDomains()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Domains for Sale
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your domain listings that appear in the sidebar
        </p>
      </div>

      <DomainsManager initialDomains={domains} />
    </div>
  )
}
