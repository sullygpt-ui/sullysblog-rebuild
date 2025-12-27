import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LoginForm } from './LoginForm'
import Link from 'next/link'

export default async function CustomerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const params = await searchParams
  const redirectTo = params.redirectTo || '/store'

  // If already logged in, redirect
  if (user) {
    redirect(redirectTo)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Access your purchases and downloads
          </p>
        </div>
        <LoginForm redirectTo={redirectTo} />
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              href={`/auth/register${redirectTo !== '/store' ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`}
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
