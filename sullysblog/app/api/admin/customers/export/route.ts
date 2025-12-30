import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { getAllCustomers, customersToCSV } from '@/lib/queries/customers'

export async function GET() {
  try {
    const authClient = await createServerClient()

    const { data: { user } } = await authClient.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const customers = await getAllCustomers()
    const csv = customersToCSV(customers)

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="customers-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error) {
    console.error('Error exporting customers:', error)
    return NextResponse.json({ error: 'Failed to export customers' }, { status: 500 })
  }
}
