import { getAllResources } from '@/lib/queries/resources'
import { ResourcesManager } from '@/components/admin/ResourcesManager'

export const metadata = {
  title: 'Manage Resources | Admin',
  description: 'Manage domain investing resources',
}

export default async function AdminResourcesPage() {
  const resources = await getAllResources()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Resource Directory
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage domain investing resources with sponsorship tracking
        </p>
      </div>

      <ResourcesManager initialResources={resources} />
    </div>
  )
}
