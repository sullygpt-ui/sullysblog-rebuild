/**
 * Bulk import script for domain resources
 * Run with: NEXT_PUBLIC_SUPABASE_URL="..." SUPABASE_SERVICE_KEY="..." npx tsx scripts/import-resources.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

type ResourceInput = {
  name: string
  category: string
  short_description: string
  destination_url: string
  has_affiliate?: boolean
  affiliate_notes?: string
}

// Helper to create slug from name
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const resources: ResourceInput[] = [
  // ===== REGISTRATION =====
  { name: 'Dynadot', category: 'registration', short_description: 'Best for domain investors with competitive pricing, portfolio tools, and built-in marketplace', destination_url: 'https://www.dynadot.com', has_affiliate: true, affiliate_notes: 'Affiliate program with varying commission by product' },
  { name: 'NameSilo', category: 'registration', short_description: 'Low, stable pricing with free WHOIS privacy for life. Great for bulk purchases', destination_url: 'https://www.namesilo.com', has_affiliate: true, affiliate_notes: '10% commission on first order, 1-year cookie' },
  { name: 'Namecheap', category: 'registration', short_description: 'Budget-friendly with 24M+ domains managed. Free privacy protection included', destination_url: 'https://www.namecheap.com', has_affiliate: true, affiliate_notes: '20-35% commission via Impact/CJ/ShareASale' },
  { name: 'Porkbun', category: 'registration', short_description: 'Known for lowest prices on many TLDs with free WHOIS privacy', destination_url: 'https://porkbun.com', has_affiliate: true, affiliate_notes: 'Affiliate program available' },
  { name: 'Cloudflare Registrar', category: 'registration', short_description: 'At-cost pricing with zero markup. Best for active websites', destination_url: 'https://www.cloudflare.com/products/registrar/', has_affiliate: false },
  { name: 'GoDaddy', category: 'registration', short_description: 'Largest registrar (82M+ domains) with integrated aftermarket platform', destination_url: 'https://www.godaddy.com', has_affiliate: true, affiliate_notes: 'Affiliate program via CJ' },
  { name: 'Spaceship', category: 'registration', short_description: 'New registrar from Namecheap team with clean interface and low fees', destination_url: 'https://www.spaceship.com', has_affiliate: false },
  { name: 'Google Domains', category: 'registration', short_description: 'Simple interface, transparent pricing. Now managed by Squarespace', destination_url: 'https://domains.squarespace.com', has_affiliate: false },

  // ===== AFTERMARKET (BUY/SELL) =====
  { name: 'Afternic', category: 'aftermarket', short_description: 'Owned by GoDaddy. Largest inventory with Fast Lane distribution to 100+ registrar marketplaces', destination_url: 'https://www.afternic.com', has_affiliate: false },
  { name: 'Sedo', category: 'aftermarket', short_description: 'Largest/oldest platform (est. 2001) with 18M+ domains. Strong European presence', destination_url: 'https://sedo.com', has_affiliate: true, affiliate_notes: '15% of Sedo sales commission for referrals' },
  { name: 'Atom.com', category: 'aftermarket', short_description: 'Specializes in brandable domains. Low 7.5% commission with white label option', destination_url: 'https://www.atom.com', has_affiliate: false },
  { name: 'Squadhelp', category: 'aftermarket', short_description: 'Curated brandable domain marketplace with naming contest platform', destination_url: 'https://www.squadhelp.com', has_affiliate: true, affiliate_notes: 'Affiliate program available' },
  { name: 'BrandBucket', category: 'aftermarket', short_description: 'Premium brandable domains with logos and taglines included', destination_url: 'https://www.brandbucket.com', has_affiliate: true, affiliate_notes: 'Affiliate program available' },

  // ===== APPRAISAL & VALUATION =====
  { name: 'EstiBot', category: 'appraisal', short_description: 'Industry standard. Appraises 2M+ domains daily with bulk analysis tools', destination_url: 'https://www.estibot.com', has_affiliate: false },
  { name: 'GoDaddy Appraisal', category: 'appraisal', short_description: 'Free tool using 27M+ historical sales for machine learning valuations', destination_url: 'https://www.godaddy.com/domain-value-appraisal', has_affiliate: false },
  { name: 'HumbleWorth', category: 'appraisal', short_description: 'Free bulk valuations up to 2,000 domains using 20+ years of auction data', destination_url: 'https://humbleworth.com', has_affiliate: false },
  { name: 'NameWorth', category: 'appraisal', short_description: 'Claims 95% accuracy for English domains with detailed reports', destination_url: 'https://www.nameworth.com', has_affiliate: false },
  { name: 'Saw.com Appraisals', category: 'appraisal', short_description: 'Premium appraisals with 5-7 page detailed reports from industry experts', destination_url: 'https://saw.com/appraisals', has_affiliate: false },
  { name: 'Dynadot Appraisal', category: 'appraisal', short_description: 'AI-powered tool evaluating length, keywords, TLD strength, and trends', destination_url: 'https://www.dynadot.com/domain/appraisal', has_affiliate: false },
  { name: 'Epik Appraisal', category: 'appraisal', short_description: 'Free basic appraisal or $399 professional written report', destination_url: 'https://www.epik.com', has_affiliate: false },

  // ===== AUCTIONS =====
  { name: 'NameJet', category: 'auctions', short_description: 'Pre-release auctions from Network Solutions, Register.com, Bluehost. $69 minimum bid', destination_url: 'https://www.namejet.com', has_affiliate: false },
  { name: 'SnapNames', category: 'auctions', short_description: 'Same inventory as NameJet (both owned by Newfold). Private auctions for backorders', destination_url: 'https://www.snapnames.com', has_affiliate: false },
  { name: 'DropCatch', category: 'auctions', short_description: 'Highest drop-catching success rates with 1,200+ registrar accreditations. $59-60/backorder', destination_url: 'https://www.dropcatch.com', has_affiliate: false },
  { name: 'GoDaddy Auctions', category: 'auctions', short_description: 'Huge marketplace with 10-day auction format. Integrated with largest registrar', destination_url: 'https://auctions.godaddy.com', has_affiliate: false },
  { name: 'Dynadot Auctions', category: 'auctions', short_description: '7-11 day auctions with user-consigned and expired domains', destination_url: 'https://www.dynadot.com/market/auction', has_affiliate: false },

  // ===== BROKERS =====
  { name: 'MediaOptions', category: 'brokers', short_description: 'Highest-grossing broker since 2016 with $600M+ in sales and 82% success rate', destination_url: 'https://mediaoptions.com', has_affiliate: false },
  { name: 'Grit Brokerage', category: 'brokers', short_description: 'Led by Brian Harbin with 60 years combined team experience. Known for fierce negotiation', destination_url: 'https://www.gritbrokerage.com', has_affiliate: false },
  { name: 'Sedo Brokerage', category: 'brokers', short_description: 'Enterprise-level brokerage service from the largest domain marketplace', destination_url: 'https://sedo.com/us/services/broker-service/', has_affiliate: false },
  { name: 'GoDaddy Broker Service', category: 'brokers', short_description: 'Access to largest buyer network with Domain Club discounts', destination_url: 'https://www.godaddy.com/domains/domain-broker-service', has_affiliate: false },
  { name: 'VPN.com Brokerage', category: 'brokers', short_description: 'Premium acquisitions for six-figure and enterprise-level domains', destination_url: 'https://www.vpn.com', has_affiliate: false },
  { name: 'Saw.com', category: 'brokers', short_description: 'Boutique brokerage with stealth acquisition services', destination_url: 'https://saw.com', has_affiliate: false },

  // ===== ESCROW SERVICES =====
  { name: 'Escrow.com', category: 'escrow', short_description: 'Industry standard. Handled uber.com, instagram.com, twitter.com. Fees: 3.25% up to $5K', destination_url: 'https://www.escrow.com', has_affiliate: true, affiliate_notes: 'Partner program with referral tracking' },
  { name: 'AtomPay', category: 'escrow', short_description: 'Low 4.5% commission. Supports Wise.com payments', destination_url: 'https://www.atom.com', has_affiliate: false },

  // ===== EXPIRED / DROPS =====
  { name: 'ExpiredDomains.net', category: 'expired', short_description: 'Largest free expired domain database with powerful filters for age, backlinks, and metrics', destination_url: 'https://www.expireddomains.net', has_affiliate: false },
  { name: 'DomCop', category: 'expired', short_description: 'Premium tool with 10M+ domains and 90+ metrics including Majestic/Moz data', destination_url: 'https://www.domcop.com', has_affiliate: true, affiliate_notes: 'Affiliate program available' },
  { name: 'SpamZilla', category: 'expired', short_description: 'Expired domain finder focused on SEO metrics and spam detection. $37/month', destination_url: 'https://spamzilla.io', has_affiliate: true, affiliate_notes: 'Affiliate program available' },
  { name: 'Gname Backorder', category: 'expired', short_description: 'Backorder service for .com/.net with 500+ ICANN-accredited registrars', destination_url: 'https://www.gname.com/dropcatch', has_affiliate: false },
  { name: 'Odys Global', category: 'expired', short_description: 'Pre-vetted expired domains with guaranteed quality and clean history', destination_url: 'https://odys.global', has_affiliate: true, affiliate_notes: 'Affiliate program available' },

  // ===== HOSTING & PARKING =====
  { name: 'Bodis', category: 'hosting', short_description: 'Top parking service with dynamic ad optimization and detailed reporting', destination_url: 'https://www.bodis.com', has_affiliate: true, affiliate_notes: 'Referral program for new customers' },
  { name: 'ParkingCrew', category: 'hosting', short_description: 'Aggressive optimization algorithms. Great for large portfolios', destination_url: 'https://www.parkingcrew.com', has_affiliate: false },
  { name: 'Sedo Parking', category: 'hosting', short_description: 'Integrated with marketplace. Automatic activation when domains listed for sale', destination_url: 'https://sedo.com/us/park-domains/', has_affiliate: false },
  { name: 'ParkLogic', category: 'hosting', short_description: 'Premium parking optimization with algorithmic traffic routing', destination_url: 'https://www.parklogic.com', has_affiliate: false },

  // ===== MARKETPLACES =====
  { name: 'Afternic Marketplace', category: 'marketplaces', short_description: 'GoDaddy-owned. Largest inventory with Fast Lane to 100+ registrars. 15-25% commission', destination_url: 'https://www.afternic.com', has_affiliate: false },
  { name: 'Sedo Marketplace', category: 'marketplaces', short_description: '18M+ domains listed. 10-15% commission. Strong globally', destination_url: 'https://sedo.com', has_affiliate: true, affiliate_notes: '15% of Sedo sales commission for referrals' },
  { name: 'Spaceship Marketplace', category: 'marketplaces', short_description: 'New marketplace with only 5% commission', destination_url: 'https://www.spaceship.com', has_affiliate: false },
  { name: 'NamePros Marketplace', category: 'marketplaces', short_description: '0% commission on classified listings. Active community', destination_url: 'https://www.namepros.com/domains/', has_affiliate: false },

  // ===== NEWS =====
  { name: 'DomainNameWire', category: 'news', short_description: 'Leading industry trade publication since 2005. Cited by WSJ, NYT, NPR', destination_url: 'https://domainnamewire.com', has_affiliate: false },
  { name: 'DNJournal', category: 'news', short_description: 'Original domain news by Ron Jackson. Weekly sales reports and annual reviews', destination_url: 'https://www.dnjournal.com', has_affiliate: false },
  { name: 'TheDomains', category: 'news', short_description: 'Industry news since 2007 by Michael Berkens', destination_url: 'https://www.thedomains.com', has_affiliate: false },
  { name: 'DomainInvesting.com', category: 'news', short_description: 'News, strategy, and tips by Elliot Silver. Award-winning coverage', destination_url: 'https://domaininvesting.com', has_affiliate: false },
  { name: 'Domaining.com', category: 'news', short_description: 'News and views about making money with domain names', destination_url: 'https://www.domaining.com', has_affiliate: false },

  // ===== PORTFOLIO MANAGEMENT =====
  { name: 'DomainIQ', category: 'portfolio', short_description: 'Portfolio analyzer with WHOIS, value, and risk reports. Trusted by government and legal firms', destination_url: 'https://www.domainiq.com', has_affiliate: false },
  { name: 'WhoisXML API', category: 'portfolio', short_description: '23.8B+ WHOIS records with Domain Research Suite for monitoring and analysis', destination_url: 'https://www.whoisxmlapi.com', has_affiliate: true, affiliate_notes: 'Partner program available' },
  { name: 'DomainPunch', category: 'portfolio', short_description: 'Desktop software syncing with multiple registrars for large portfolio tracking', destination_url: 'https://www.domainpunch.com', has_affiliate: false },

  // ===== DOMAIN TOOLS =====
  { name: 'Who.is', category: 'tools', short_description: 'WHOIS lookup with RDAP support and comprehensive domain data', destination_url: 'https://who.is', has_affiliate: false },
  { name: 'MxToolbox', category: 'tools', short_description: 'DNS lookup, email testing, and network diagnostics', destination_url: 'https://mxtoolbox.com', has_affiliate: false },
  { name: 'DNSlytics', category: 'tools', short_description: 'Investigation tool with reverse IP, historical DNS, and provider data', destination_url: 'https://dnslytics.com', has_affiliate: false },
  { name: 'DomainTools', category: 'tools', short_description: 'Enterprise WHOIS and DNS intelligence with DNSDB Scout', destination_url: 'https://www.domaintools.com', has_affiliate: false },
  { name: 'BuiltWith', category: 'tools', short_description: 'Technology lookup showing what websites are built with', destination_url: 'https://builtwith.com', has_affiliate: false },
  { name: 'Wayback Machine', category: 'tools', short_description: 'Internet Archive for viewing historical website snapshots', destination_url: 'https://web.archive.org', has_affiliate: false },
  { name: 'Namecheckr', category: 'tools', short_description: 'Check domain and social media username availability across platforms', destination_url: 'https://www.namecheckr.com', has_affiliate: false },

  // ===== BLOGS =====
  { name: 'DomainInvesting Blog', category: 'blogs', short_description: "Elliot Silver's award-winning blog with daily industry coverage", destination_url: 'https://domaininvesting.com', has_affiliate: false },
  { name: 'DomainSherpa', category: 'blogs', short_description: 'Educational content and expert interviews for domain investors', destination_url: 'https://domainsherpa.com', has_affiliate: false },
  { name: 'TheDomains Blog', category: 'blogs', short_description: "Michael Berkens' domain industry blog since 2007", destination_url: 'https://www.thedomains.com', has_affiliate: false },

  // ===== BOOKS =====
  { name: 'Domain Graduate', category: 'books', short_description: 'Comprehensive guidebook for your entire domaining career by Sean Stafford', destination_url: 'https://www.amazon.com/s?k=domain+graduate', has_affiliate: true, affiliate_notes: 'Amazon Associates' },
  { name: 'Domaining Guide', category: 'books', short_description: 'Beginner-friendly guide from a domainer since 2006 by Jerome Robertson', destination_url: 'https://www.amazon.com/Domaining-Guide-Profit-Domain-Names/dp/1541053559', has_affiliate: true, affiliate_notes: 'Amazon Associates' },
  { name: 'Domain Flipping 101', category: 'books', short_description: 'Art and science of buying and reselling domains by Taylor Royce', destination_url: 'https://www.amazon.com/Domain-Flipping-101-Successful-Investing/dp/B0DCJQ6V6B', has_affiliate: true, affiliate_notes: 'Amazon Associates' },
  { name: 'The Domain Game', category: 'books', short_description: "WSJ reporter David Kesmodel's book on the domain industry's wild history", destination_url: 'https://www.amazon.com/s?k=the+domain+game+kesmodel', has_affiliate: true, affiliate_notes: 'Amazon Associates' },

  // ===== PODCASTS =====
  { name: 'DomainSherpa Review', category: 'podcasts', short_description: 'Weekly domain portfolio reviews with industry Sherpas like Andrew Rosener', destination_url: 'https://domainsherpa.com/review/', has_affiliate: false },
  { name: 'DNW Podcast', category: 'podcasts', short_description: "Domain Name Wire's podcast covering weekly industry news and interviews", destination_url: 'https://domainnamewire.com/category/podcast/', has_affiliate: false },
  { name: 'DNAcademy Podcast', category: 'podcasts', short_description: "Michael Cyger's educational podcast for domain investors", destination_url: 'https://open.spotify.com/show/3kcHwUwaGMQSCqxwmpYQgm', has_affiliate: false },

  // ===== NEWSLETTERS =====
  { name: 'DNJournal Newsletter', category: 'newsletters', short_description: "Ron Jackson's weekly sales reports and industry updates", destination_url: 'https://www.dnjournal.com', has_affiliate: false },
  { name: 'Domain Name Wire Newsletter', category: 'newsletters', short_description: 'Daily/weekly news from Andrew Allemann', destination_url: 'https://domainnamewire.com', has_affiliate: false },
  { name: 'NamePros Digest', category: 'newsletters', short_description: 'Weekly roundup of top forum discussions and deals', destination_url: 'https://www.namepros.com', has_affiliate: false },

  // ===== FORUMS & COMMUNITIES =====
  { name: 'NamePros', category: 'forums', short_description: 'Largest domain forum (est. 2003). Active community, marketplace, and chat rooms', destination_url: 'https://www.namepros.com', has_affiliate: false },
  { name: 'DN Forum', category: 'forums', short_description: 'One of the earliest forums (est. 2001). Recently acquired by Digital Candy', destination_url: 'https://www.dnforum.com', has_affiliate: false },
  { name: 'Domain Boardroom', category: 'forums', short_description: 'Invitation-only private community for serious investors. Founded by Donna Mahony', destination_url: 'https://www.domainboardroom.com', has_affiliate: false },

  // ===== CONFERENCES & EVENTS =====
  { name: 'NamesCon Global', category: 'conferences', short_description: '#1 domaining event. Miami, Nov 5-6, 2025. Co-located with CloudFest USA', destination_url: 'https://namescon.com', has_affiliate: false },
  { name: 'DomainX', category: 'conferences', short_description: "India's premier domain conference. Connects consultants, entrepreneurs, and investors", destination_url: 'https://domainx.org', has_affiliate: false },
  { name: 'Domain Days Dubai', category: 'conferences', short_description: 'Middle East focused domain industry networking event', destination_url: 'https://www.domaindaysdubai.com', has_affiliate: false },

  // ===== LEGAL RESOURCES =====
  { name: 'ESQwire', category: 'legal', short_description: "Ari Goldberger's firm specializing in UDRP. Hundreds of cases handled", destination_url: 'https://esqwire.com', has_affiliate: false },
  { name: 'Lewis & Lin LLC', category: 'legal', short_description: 'UDRP and ACPA specialists representing both trademark owners and registrants', destination_url: 'https://ilawco.com', has_affiliate: false },
  { name: 'WIPO Arbitration', category: 'legal', short_description: 'World Intellectual Property Organization for UDRP decisions and filings', destination_url: 'https://www.wipo.int/amc/en/domains/', has_affiliate: false },

  // ===== BUSINESS TOOLS =====
  { name: 'Wave', category: 'business', short_description: 'Free accounting and invoicing. Great for small domain businesses', destination_url: 'https://www.waveapps.com', has_affiliate: true, affiliate_notes: 'Referral program available' },
  { name: 'QuickBooks', category: 'business', short_description: 'Industry-leading small business accounting with invoicing', destination_url: 'https://quickbooks.intuit.com', has_affiliate: true, affiliate_notes: 'Affiliate program via various networks' },
  { name: 'FreshBooks', category: 'business', short_description: 'Easy invoicing, time tracking, and expense management', destination_url: 'https://www.freshbooks.com', has_affiliate: true, affiliate_notes: 'Affiliate program available' },
  { name: 'Stripe', category: 'business', short_description: 'Payment processing for domain sales with checkout pages', destination_url: 'https://stripe.com', has_affiliate: false },
  { name: 'Wise', category: 'business', short_description: 'Low-cost international transfers for global domain sales', destination_url: 'https://wise.com', has_affiliate: true, affiliate_notes: 'Referral program with bonuses' },
  { name: 'DNTaxGuide', category: 'business', short_description: 'Tax guidance specifically for domain investors', destination_url: 'https://www.dntaxguide.com', has_affiliate: false },
]

async function importResources() {
  console.log(`Starting import of ${resources.length} resources...`)

  let imported = 0
  let skipped = 0
  let errors = 0

  for (const resource of resources) {
    const slug = slugify(resource.name)
    const redirect_slug = slugify(resource.name)

    // Check if resource already exists
    const { data: existing } = await supabase
      .from('resources')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existing) {
      console.log(`⏭️  Skipping (exists): ${resource.name}`)
      skipped++
      continue
    }

    // Build full description with affiliate info
    let full_description = resource.short_description
    if (resource.has_affiliate && resource.affiliate_notes) {
      full_description += `\n\n**Affiliate Program:** ${resource.affiliate_notes}`
    }

    const { error } = await supabase.from('resources').insert({
      name: resource.name,
      slug,
      category: resource.category,
      short_description: resource.short_description,
      full_description,
      destination_url: resource.destination_url,
      redirect_slug,
      listing_type: 'free',
      monthly_fee: 0,
      status: 'active',
      display_order: 100,
    })

    if (error) {
      console.error(`❌ Error importing ${resource.name}:`, error.message)
      errors++
    } else {
      console.log(`✅ Imported: ${resource.name}`)
      imported++
    }
  }

  console.log('\n========================================')
  console.log(`Import complete!`)
  console.log(`  ✅ Imported: ${imported}`)
  console.log(`  ⏭️  Skipped: ${skipped}`)
  console.log(`  ❌ Errors: ${errors}`)
  console.log('========================================\n')

  // Print affiliate summary
  const affiliates = resources.filter(r => r.has_affiliate)
  console.log(`\n📊 AFFILIATE PROGRAMS FOUND: ${affiliates.length}`)
  console.log('----------------------------------------')
  affiliates.forEach(r => {
    console.log(`• ${r.name}: ${r.affiliate_notes}`)
  })
}

importResources().catch(console.error)
