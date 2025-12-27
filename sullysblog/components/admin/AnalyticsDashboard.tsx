'use client'

import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { AnalyticsData } from '@/lib/queries/analytics'

type AnalyticsDashboardProps = {
  data: AnalyticsData
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4']

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Resources"
          value={data.totalResources}
          icon="📁"
          color="blue"
        />
        <StatCard
          title="Total Clicks (30d)"
          value={data.totalClicks}
          icon="🖱️"
          color="purple"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${data.monthlyRevenue.toFixed(2)}`}
          icon="💰"
          color="green"
        />
        <StatCard
          title="Annual Revenue"
          value={`$${data.annualRevenue.toFixed(2)}`}
          icon="📈"
          color="yellow"
        />
      </div>

      {/* Resource Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Resource Distribution
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">{data.featuredCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Featured</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{data.sponsoredCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Sponsored</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-600">{data.freeCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Free</div>
          </div>
        </div>
      </div>

      {/* Clicks Over Time */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Clicks Over Time (Last 30 Days)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.clicksByDay}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Resources */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Resources (30 Days)
          </h3>
          <div className="space-y-3">
            {data.topResources.slice(0, 10).map((resource, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {index + 1}. {resource.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {resource.category} • {resource.listing_type}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-600">{resource.clicks}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">clicks</div>
                </div>
              </div>
            ))}
            {data.topResources.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No click data yet
              </div>
            )}
          </div>
        </div>

        {/* Clicks by Category */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Clicks by Category
          </h3>
          {data.clicksByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.clicksByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="clicks" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No category data yet
            </div>
          )}
        </div>
      </div>

      {/* Revenue Projection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Monthly Revenue Projection
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.revenueByMonth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

type StatCardProps = {
  title: string
  value: string | number
  icon: string
  color: 'blue' | 'purple' | 'green' | 'yellow'
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
  }

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-lg shadow-lg p-6 text-white`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium opacity-90">{title}</div>
        <div className="text-2xl">{icon}</div>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  )
}
