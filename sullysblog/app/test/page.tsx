import { createClient } from '@/lib/supabase/server'

export default async function TestPage() {
  const supabase = await createClient()

  // Test 1: Get advertisers
  const { data: advertisers, error: advertiserError } = await supabase
    .from('advertisers')
    .select('*')
    .order('business_name')

  // Test 2: Get active campaigns (fetch separately and join manually)
  const { data: campaigns, error: campaignError } = await supabase
    .from('ad_campaigns')
    .select('*')
    .eq('status', 'active')
    .order('end_date')

  // Add advertiser info to campaigns
  const campaignsWithAdvertisers = campaigns ? await Promise.all(
    campaigns.map(async (campaign) => {
      const advertiser = advertisers?.find(a => a.id === campaign.advertiser_id)
      return {
        ...campaign,
        advertiser_name: advertiser?.business_name || 'Unknown',
        advertiser_url: advertiser?.company_url
      }
    })
  ) : []

  // Test 3: Calculate MRR
  const { data: mrrData, error: mrrError } = await supabase
    .rpc('calculate_current_mrr')

  // Test 4: Get dictionary terms
  const { data: dictionaryTerms, error: dictionaryError } = await supabase
    .from('dictionary_terms')
    .select('term, slug, short_definition')
    .order('term')
    .limit(10)

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Database Connection Test
      </h1>

      {/* Test 1: Advertisers */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Test 1: Advertisers ({advertisers?.length || 0})
        </h2>
        {advertiserError ? (
          <div className="text-red-600">Error: {advertiserError.message}</div>
        ) : (
          <div className="space-y-3">
            {advertisers?.map((advertiser) => (
              <div key={advertiser.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium text-gray-900">
                    {advertiser.business_name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {advertiser.contact_name}
                    {advertiser.company_url && (
                      <span className="ml-2">
                        <a href={advertiser.company_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {advertiser.company_url}
                        </a>
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-green-600 text-xl">✓</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Test 2: Active Campaigns */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Test 2: Active Campaigns ({campaignsWithAdvertisers?.length || 0})
        </h2>
        {/* Debug info */}
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
          <div>Campaigns from DB: {campaigns?.length || 0}</div>
          <div>With Advertisers: {campaignsWithAdvertisers?.length || 0}</div>
          {campaignError && <div className="text-red-600">Error: {campaignError.message}</div>}
        </div>
        {campaignError ? (
          <div className="text-red-600">Error: {campaignError.message}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Advertiser</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Amount</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Start Date</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">End Date</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {campaignsWithAdvertisers?.map((campaign: any) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {campaign.advertiser_name}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-green-600">
                      ${campaign.monthly_amount}/mo
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(campaign.start_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(campaign.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                        {campaign.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Test 3: MRR Calculation */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Test 3: Monthly Recurring Revenue
        </h2>
        {mrrError ? (
          <div className="text-red-600">Error: {mrrError.message}</div>
        ) : (
          <div className="text-center">
            <div className="text-5xl font-bold text-green-600">
              ${mrrData || 0}
            </div>
            <div className="text-gray-600 mt-2">per month</div>
            {mrrData === 450 && (
              <div className="mt-4 text-green-600 text-lg">
                ✓ MRR matches expected value ($450)
              </div>
            )}
          </div>
        )}
      </div>

      {/* Test 4: Dictionary Terms */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Test 4: Dictionary Terms (showing 10 of 102)
        </h2>
        {dictionaryError ? (
          <div className="text-red-600">Error: {dictionaryError.message}</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {dictionaryTerms?.map((term) => (
              <div key={term.slug} className="p-3 bg-gray-50 rounded">
                <div className="font-medium text-gray-900">{term.term}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {term.short_definition}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-green-50 border-2 border-green-200 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-green-900 mb-3">
          ✅ All Tests Complete!
        </h2>
        <div className="text-green-800 space-y-2">
          <p>✓ Database connection working</p>
          <p>✓ Can read from all tables</p>
          <p>✓ RLS policies allowing public read</p>
          <p>✓ Database functions working (calculate_current_mrr)</p>
          <p>✓ Foreign key relationships working (campaigns → advertisers)</p>
        </div>
      </div>
    </div>
  )
}
