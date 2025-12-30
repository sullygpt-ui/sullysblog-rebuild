import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { getAllCustomers, getCustomerSummary } from '@/lib/queries/customers'

export async function GET() {
  try {
    const authClient = await createServerClient()

    const { data: { user } } = await authClient.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [customers, summary] = await Promise.all([
      getAllCustomers(),
      getCustomerSummary()
    ])

    return NextResponse.json({ customers, summary })
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}
