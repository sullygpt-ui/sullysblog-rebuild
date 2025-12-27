'use client'

import { useState, useEffect } from 'react'

export function StoreVisibilityToggle() {
  const [isVisible, setIsVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchSetting()
  }, [])

  async function fetchSetting() {
    try {
      const response = await fetch('/api/admin/settings?key=store_visible')
      if (response.ok) {
        const data = await response.json()
        setIsVisible(data.value !== false)
      }
    } catch (error) {
      console.error('Error fetching setting:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function toggleVisibility() {
    setIsSaving(true)
    const newValue = !isVisible

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'store_visible',
          value: newValue
        })
      })

      if (response.ok) {
        setIsVisible(newValue)
      } else {
        console.error('Failed to update setting')
      }
    } catch (error) {
      console.error('Error updating setting:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse flex items-center justify-between">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
          <div className="h-6 w-11 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Playbooks & Training
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Show or hide the store link in navigation
          </p>
        </div>
        <button
          onClick={toggleVisibility}
          disabled={isSaving}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isVisible ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
          } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
          role="switch"
          aria-checked={isVisible}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isVisible ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
      <div className="mt-2">
        <span className={`text-xs font-medium ${isVisible ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {isVisible ? 'Visible in navigation' : 'Hidden from navigation'}
        </span>
      </div>
    </div>
  )
}
