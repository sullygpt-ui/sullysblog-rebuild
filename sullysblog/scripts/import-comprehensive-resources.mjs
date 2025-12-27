import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Read .env.local
const envFile = readFileSync('.env.local', 'utf-8')
const env = {}
envFile.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length > 0) {
    env[key.trim()] = valueParts.join('=').trim()
  }
})

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_KEY
)

const comprehensiveResources = [
  // Registration & Hosting
  {
    name: 'Namecheap',
    slug: 'namecheap',
    category: 'registration',
    short_description: 'Affordable domains and hosting',
    full_description: 'Register domains at competitive prices with free WHOIS privacy and excellent customer support.',
    destination_url: 'https://www.namecheap.com',
    redirect_slug: 'namecheap',
    listing_type: 'free'
  },
  {
    name: 'Hover',
    slug: 'hover',
    category: 'registration',
    short_description: 'Simple domain management',
    full_description: 'Clean, simple domain registration and management with no upsells.',
    destination_url: 'https://www.hover.com',
    redirect_slug: 'hover',
    listing_type: 'free'
  },
  {
    name: 'Google Domains',
    slug: 'google-domains',
    category: 'registration',
    short_description: 'Google\'s domain registrar',
    full_description: 'Register domains with Google\'s straightforward registrar service.',
    destination_url: 'https://domains.google',
    redirect_slug: 'google-domains',
    listing_type: 'free'
  },
  {
    name: 'Dynadot',
    slug: 'dynadot',
    category: 'registration',
    short_description: 'Domain registration and marketplace',
    full_description: 'Register domains and access their marketplace with competitive pricing.',
    destination_url: 'https://www.dynadot.com',
    redirect_slug: 'dynadot',
    listing_type: 'free'
  },

  // Buy/Sell Domains (Aftermarket)
  {
    name: 'Sedo',
    slug: 'sedo',
    category: 'aftermarket',
    short_description: 'World\'s largest domain marketplace',
    full_description: 'Buy and sell domains on the world\'s largest domain marketplace with millions of listings.',
    destination_url: 'https://sedo.com',
    redirect_slug: 'sedo',
    listing_type: 'featured'
  },
  {
    name: 'DAN.com',
    slug: 'dan',
    category: 'aftermarket',
    short_description: 'Fast domain transactions',
    full_description: 'Modern domain marketplace with instant checkout, buyer protection, and fast transfers.',
    destination_url: 'https://dan.com',
    redirect_slug: 'dan',
    listing_type: 'sponsored'
  },
  {
    name: 'Afternic',
    slug: 'afternic',
    category: 'aftermarket',
    short_description: 'GoDaddy\'s domain marketplace',
    full_description: 'Large domain marketplace with distribution network to reach millions of buyers.',
    destination_url: 'https://www.afternic.com',
    redirect_slug: 'afternic',
    listing_type: 'free'
  },
  {
    name: 'Atom.com',
    slug: 'atom',
    category: 'aftermarket',
    short_description: 'Premium domain marketplace',
    full_description: 'Curated marketplace for premium domain names with negotiation tools.',
    destination_url: 'https://atom.com',
    redirect_slug: 'atom',
    listing_type: 'free'
  },
  {
    name: 'Flippa',
    slug: 'flippa',
    category: 'aftermarket',
    short_description: 'Buy and sell websites and domains',
    full_description: 'Marketplace for buying and selling websites, domains, and online businesses.',
    destination_url: 'https://flippa.com',
    redirect_slug: 'flippa',
    listing_type: 'free'
  },
  {
    name: 'BrandBucket',
    slug: 'brandbucket',
    category: 'aftermarket',
    short_description: 'Brandable domain names',
    full_description: 'Curated marketplace specializing in creative, brandable domain names.',
    destination_url: 'https://www.brandbucket.com',
    redirect_slug: 'brandbucket',
    listing_type: 'free'
  },

  // Portfolio Management
  {
    name: 'Efty',
    slug: 'efty',
    category: 'portfolio',
    short_description: 'Domain portfolio management',
    full_description: 'Comprehensive domain portfolio management with landing pages, analytics, and marketplace integration.',
    destination_url: 'https://efty.com',
    redirect_slug: 'efty',
    listing_type: 'free'
  },
  {
    name: 'Sawcom',
    slug: 'sawcom',
    category: 'portfolio',
    short_description: 'Domain portfolio software',
    full_description: 'Professional domain portfolio management and monetization platform.',
    destination_url: 'https://www.sawcom.com',
    redirect_slug: 'sawcom',
    listing_type: 'free'
  },
  {
    name: 'DomainIQ',
    slug: 'domainiq',
    category: 'portfolio',
    short_description: 'Portfolio analytics',
    full_description: 'Advanced domain portfolio analytics and management tools.',
    destination_url: 'https://domainiq.com',
    redirect_slug: 'domainiq',
    listing_type: 'free'
  },

  // Domain Tools
  {
    name: 'NameBio',
    slug: 'namebio',
    category: 'tools',
    short_description: 'Domain sales database',
    full_description: 'Comprehensive database of historical domain sales data for research and pricing.',
    destination_url: 'https://namebio.com',
    redirect_slug: 'namebio',
    listing_type: 'free'
  },
  {
    name: 'EstiBot',
    slug: 'estibot',
    category: 'tools',
    short_description: 'Domain appraisal tool',
    full_description: 'Automated domain name appraisal and valuation service with detailed metrics.',
    destination_url: 'https://estibot.com',
    redirect_slug: 'estibot',
    listing_type: 'free'
  },
  {
    name: 'DNPric.es',
    slug: 'dnprices',
    category: 'tools',
    short_description: 'Domain appraisal service',
    full_description: 'Professional domain appraisal service with market analysis.',
    destination_url: 'https://www.dnpric.es',
    redirect_slug: 'dnprices',
    listing_type: 'free'
  },
  {
    name: 'WhoisXML API',
    slug: 'whoisxml',
    category: 'tools',
    short_description: 'WHOIS and DNS data',
    full_description: 'Comprehensive WHOIS and DNS data API for domain research.',
    destination_url: 'https://www.whoisxmlapi.com',
    redirect_slug: 'whoisxml',
    listing_type: 'free'
  },
  {
    name: 'DomainTools',
    slug: 'domaintools',
    category: 'tools',
    short_description: 'Domain research tools',
    full_description: 'Professional domain research and monitoring tools for security and investigation.',
    destination_url: 'https://www.domaintools.com',
    redirect_slug: 'domaintools',
    listing_type: 'free'
  },
  {
    name: 'Lean Domain Search',
    slug: 'lean-domain-search',
    category: 'tools',
    short_description: 'Domain name generator',
    full_description: 'Fast domain name search and availability checker with creative suggestions.',
    destination_url: 'https://leandomainsearch.com',
    redirect_slug: 'lean-domain-search',
    listing_type: 'free'
  },

  // Blogs & News
  {
    name: 'DNJournal',
    slug: 'dnjournal',
    category: 'blogs',
    short_description: 'Domain industry news',
    full_description: 'The leading source for domain name industry news, sales reports, and analysis.',
    destination_url: 'https://dnjournal.com',
    redirect_slug: 'dnjournal',
    listing_type: 'free'
  },
  {
    name: 'Domain Name Wire',
    slug: 'domain-name-wire',
    category: 'blogs',
    short_description: 'Daily domain news',
    full_description: 'Daily domain name industry news, analysis, and insights.',
    destination_url: 'https://domainnamewire.com',
    redirect_slug: 'domain-name-wire',
    listing_type: 'free'
  },
  {
    name: 'Domain Gang',
    slug: 'domain-gang',
    category: 'blogs',
    short_description: 'Domain industry blog',
    full_description: 'Domain news, humor, and industry commentary.',
    destination_url: 'https://domaingang.com',
    redirect_slug: 'domain-gang',
    listing_type: 'free'
  },
  {
    name: 'OnlineDomain',
    slug: 'onlinedomain',
    category: 'blogs',
    short_description: 'Domain investing blog',
    full_description: 'Domain investing tips, strategies, and marketplace updates.',
    destination_url: 'https://onlinedomain.com',
    redirect_slug: 'onlinedomain',
    listing_type: 'free'
  },

  // Books
  {
    name: 'Domain Names: How to Choose and Protect a Great Name',
    slug: 'domain-names-book',
    category: 'books',
    short_description: 'Domain name selection guide',
    full_description: 'Comprehensive guide to choosing and protecting domain names for your business.',
    destination_url: 'https://www.amazon.com/Domain-Names-Choose-Protect-Great/dp/1413305636',
    redirect_slug: 'domain-names-book',
    listing_type: 'free'
  },

  // Podcasts
  {
    name: 'DomainSherpa',
    slug: 'domainsherpa',
    category: 'podcasts',
    short_description: 'Domain investing interviews',
    full_description: 'Video interviews with successful domain investors and industry experts.',
    destination_url: 'https://www.domainsherpa.com',
    redirect_slug: 'domainsherpa',
    listing_type: 'free'
  },

  // Newsletters
  {
    name: 'NamesCon Newsletter',
    slug: 'namescon-newsletter',
    category: 'newsletters',
    short_description: 'Domain conference updates',
    full_description: 'Regular updates from the domain industry\'s leading conference.',
    destination_url: 'https://www.namescon.com',
    redirect_slug: 'namescon-newsletter',
    listing_type: 'free'
  },

  // Forums & Communities
  {
    name: 'NamePros',
    slug: 'namepros',
    category: 'forums',
    short_description: 'Domain community forum',
    full_description: 'The largest domain name community with active forums, marketplace, and resources.',
    destination_url: 'https://namepros.com',
    redirect_slug: 'namepros',
    listing_type: 'free'
  },
  {
    name: 'DNForum',
    slug: 'dnforum',
    category: 'forums',
    short_description: 'Domain discussion forum',
    full_description: 'Active domain name discussion forum and marketplace community.',
    destination_url: 'https://www.dnforum.com',
    redirect_slug: 'dnforum',
    listing_type: 'free'
  },

  // Conferences & Events
  {
    name: 'NamesCon',
    slug: 'namescon',
    category: 'conferences',
    short_description: 'Premier domain conference',
    full_description: 'The domain industry\'s premier conference bringing together investors, registrars, and businesses.',
    destination_url: 'https://www.namescon.com',
    redirect_slug: 'namescon',
    listing_type: 'free'
  },
  {
    name: 'DomainFest',
    slug: 'domainfest',
    category: 'conferences',
    short_description: 'Domain industry conference',
    full_description: 'Global domain industry conference and networking event.',
    destination_url: 'https://www.domainfest.com',
    redirect_slug: 'domainfest',
    listing_type: 'free'
  },

  // Legal Resources
  {
    name: 'UDRP',
    slug: 'udrp',
    category: 'legal',
    short_description: 'Domain dispute resolution',
    full_description: 'Uniform Domain-Name Dispute-Resolution Policy information and resources.',
    destination_url: 'https://www.icann.org/resources/pages/help/dndr/udrp-en',
    redirect_slug: 'udrp',
    listing_type: 'free'
  },
  {
    name: 'WIPO Domain Name Services',
    slug: 'wipo',
    category: 'legal',
    short_description: 'International domain disputes',
    full_description: 'World Intellectual Property Organization domain name dispute resolution services.',
    destination_url: 'https://www.wipo.int/amc/en/domains/',
    redirect_slug: 'wipo',
    listing_type: 'free'
  },

  // Business Tools
  {
    name: 'Escrow.com',
    slug: 'escrow',
    category: 'business',
    short_description: 'Domain escrow service',
    full_description: 'Secure domain transaction escrow service for buyers and sellers.',
    destination_url: 'https://www.escrow.com',
    redirect_slug: 'escrow',
    listing_type: 'free'
  },
  {
    name: 'Squadhelp',
    slug: 'squadhelp',
    category: 'business',
    short_description: 'Branding and naming platform',
    full_description: 'Crowdsourced branding and business naming platform with domain marketplace.',
    destination_url: 'https://www.squadhelp.com',
    redirect_slug: 'squadhelp',
    listing_type: 'free'
  }
]

async function importResources() {
  console.log(`📊 Importing ${comprehensiveResources.length} comprehensive domain industry resources...\n`)

  let imported = 0
  let skipped = 0
  let errors = 0

  for (const resource of comprehensiveResources) {
    try {
      // Check if already exists
      const { data: existing } = await supabase
        .from('resources')
        .select('id')
        .eq('slug', resource.slug)
        .single()

      if (existing) {
        console.log(`⏭️  Skipping "${resource.name}" - already exists`)
        skipped++
        continue
      }

      const { error } = await supabase
        .from('resources')
        .insert({
          ...resource,
          status: 'active'
        })

      if (error) {
        console.error(`❌ Error importing "${resource.name}":`, error.message)
        errors++
      } else {
        console.log(`✅ Imported: ${resource.name} (${resource.listing_type} - ${resource.category})`)
        imported++
      }
    } catch (err) {
      console.error(`❌ Error importing "${resource.name}":`, err.message)
      errors++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 Import Summary:')
  console.log(`   ✅ Imported: ${imported}`)
  console.log(`   ⏭️  Skipped: ${skipped}`)
  console.log(`   ❌ Errors: ${errors}`)
  console.log(`   📋 Total: ${comprehensiveResources.length}`)
  console.log('='.repeat(60))
  console.log('\n✨ Import complete!')
  console.log('🌐 Visit /domain-resources to see all resources')
  console.log('📊 Visit /admin/analytics to see statistics')
}

importResources()
