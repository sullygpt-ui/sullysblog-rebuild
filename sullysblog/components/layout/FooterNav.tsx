'use client'

import { useState, useEffect, Fragment } from 'react'
import Link from 'next/link'

type NavLink = {
  href: string
  label: string
}

const baseNavLinks: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/domain-name-dictionary', label: 'Dictionary' },
  { href: '/store', label: 'Playbooks & Training' },
  { href: '/domain-resources', label: 'Resources' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function FooterNav() {
  const [storeVisible, setStoreVisible] = useState(true)

  useEffect(() => {
    async function fetchStoreVisibility() {
      try {
        const response = await fetch('/api/settings/store-visible')
        if (response.ok) {
          const data = await response.json()
          setStoreVisible(data.visible !== false)
        }
      } catch (error) {
        console.error('Error fetching store visibility:', error)
      }
    }
    fetchStoreVisibility()
  }, [])

  const navLinks = storeVisible
    ? baseNavLinks
    : baseNavLinks.filter(link => link.href !== '/store')

  return (
    <nav className="flex flex-wrap justify-center gap-y-2 text-sm">
      {navLinks.map((link, index) => (
        <Fragment key={link.href}>
          <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
            {link.label}
          </Link>
          {index < navLinks.length - 1 && (
            <span className="text-gray-600 mx-3">|</span>
          )}
        </Fragment>
      ))}
    </nav>
  )
}
