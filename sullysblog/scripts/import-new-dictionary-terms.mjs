import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://mqiolwqitoquzdrrwbpj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xaW9sd3FpdG9xdXpkcnJ3YnBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ4MDQ4OCwiZXhwIjoyMDgyMDU2NDg4fQ.pfRKSrqadQOfr1GTUVfo4CHJBUIm8UfbVmSaKEnYdSk'
)

// Helper to create slug from term
const createSlug = (term) => {
  return term
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// New dictionary terms to add
const newTerms = [
  {
    term: "Appraisal",
    short_definition: "A professional or automated assessment of a domain name's market value based on factors like length, keywords, and comparable sales.",
    full_definition: `<p>A professional or automated assessment of a domain name's market value. Appraisals consider factors like domain length, keyword popularity, extension, brandability, comparable sales, and search volume.</p>
<p>While automated tools like Estibot or GoDaddy's appraisal provide quick estimates, professional appraisals from experienced brokers often carry more weight in negotiations.</p>`
  },
  {
    term: "BFCM (Brandable For Common Meaning)",
    short_definition: "A domain investing strategy focused on acquiring short, pronounceable, made-up words that could serve as brand names across multiple industries.",
    full_definition: `<p>A domain investing strategy focused on acquiring short, pronounceable, made-up words that could serve as brand names across multiple industries. Examples include names like Vimeo, Hulu, or Zappos—words that didn't exist before but are easy to say, spell, and remember.</p>`
  },
  {
    term: "Blocklist",
    short_definition: "A list of domain names or IP addresses flagged for spam, malware, or other malicious activities.",
    full_definition: `<p>A list of domain names or IP addresses that have been flagged for spam, malware, or other malicious activities. Domains on blocklists may have email delivery issues or be flagged by browsers.</p>
<p>Before purchasing a domain, investors should check its history to ensure it's not blocklisted.</p>`
  },
  {
    term: "Broker",
    short_definition: "A professional intermediary who facilitates domain name transactions between buyers and sellers, typically earning a 10-20% commission.",
    full_definition: `<p>A professional intermediary who facilitates domain name transactions between buyers and sellers. Brokers handle outreach, negotiation, and transaction management, typically earning a commission of 10-20% of the sale price.</p>
<p>They're particularly valuable for high-value acquisitions where anonymity or expert negotiation is important.</p>`
  },
  {
    term: "CDN (Content Delivery Network)",
    short_definition: "A network of geographically distributed servers that deliver web content to users based on their location for improved speed and reliability.",
    full_definition: `<p>A network of geographically distributed servers that deliver web content to users based on their location. CDNs improve website speed and reliability by serving content from the nearest server.</p>
<p>Popular CDN providers include Cloudflare, Akamai, and Amazon CloudFront.</p>`
  },
  {
    term: "Cease and Desist",
    short_definition: "A formal legal letter demanding that someone stop an allegedly illegal activity, such as using a trademarked term in a domain name.",
    full_definition: `<p>A formal legal letter demanding that someone stop an allegedly illegal activity, such as using a trademarked term in a domain name.</p>
<p>Receiving a cease and desist doesn't necessarily mean you've done something wrong, but it should be taken seriously and potentially reviewed by a legal professional.</p>`
  },
  {
    term: "Churning",
    short_definition: "The unethical practice of repeatedly selling domains among a small group of investors to artificially inflate prices or create a false sales history.",
    full_definition: `<p>The practice of repeatedly selling domains among a small group of investors to artificially inflate prices or create a false sales history. This unethical practice can mislead buyers about a domain's true market value.</p>`
  },
  {
    term: "CIRA (Canadian Internet Registration Authority)",
    short_definition: "The organization that manages the .ca country code top-level domain for Canada.",
    full_definition: `<p>The organization that manages the .ca country code top-level domain for Canada. CIRA sets policies for .ca registrations and requires registrants to meet Canadian presence requirements.</p>`
  },
  {
    term: "Cleanup",
    short_definition: "The process of reviewing and dropping underperforming domains from a portfolio to reduce renewal costs.",
    full_definition: `<p>The process of reviewing and dropping underperforming domains from a portfolio to reduce renewal costs. Regular cleanup helps investors focus resources on their best assets rather than paying to renew domains unlikely to sell.</p>`
  },
  {
    term: "Cloaking",
    short_definition: "A technique where different content is shown to search engines than to regular visitors, often considered a black-hat SEO practice.",
    full_definition: `<p>A technique where different content is shown to search engines than to regular visitors. While sometimes used legitimately, cloaking is often considered a black-hat SEO practice and can result in search engine penalties.</p>`
  },
  {
    term: "Comps (Comparables)",
    short_definition: "Historical sales data for similar domain names used to estimate a domain's value.",
    full_definition: `<p>Historical sales data for similar domain names used to estimate a domain's value. When valuing a domain, investors look at recent sales of comparable domains with similar length, keywords, extension, and characteristics.</p>`
  },
  {
    term: "Defensive Registration",
    short_definition: "Registering domain names to protect a brand rather than for direct use or resale.",
    full_definition: `<p>Registering domain names to protect a brand rather than for direct use or resale. Companies often defensively register common misspellings, variations, and different extensions of their main domain to prevent competitors or cybersquatters from acquiring them.</p>`
  },
  {
    term: "Dev Domain",
    short_definition: "A domain name using the .dev extension, intended for software development purposes and requiring HTTPS.",
    full_definition: `<p>A domain name, typically using the .dev extension, intended for software development purposes. The .dev TLD requires HTTPS and is popular among developers and tech companies.</p>`
  },
  {
    term: "DomainTools",
    short_definition: "A leading provider of domain name research and monitoring services including WHOIS history and reverse lookups.",
    full_definition: `<p>A leading provider of domain name research and monitoring services. DomainTools offers WHOIS history, reverse WHOIS lookups, and other intelligence tools used by domain investors, brand protection teams, and cybersecurity professionals.</p>`
  },
  {
    term: "DNS Records",
    short_definition: "Configuration entries that tell DNS servers how to handle requests for a domain, including A, CNAME, MX, and TXT records.",
    full_definition: `<p>Configuration entries that tell DNS servers how to handle requests for a domain. Common record types include A records (point to IP addresses), CNAME records (create aliases), MX records (direct email), and TXT records (store text information like verification codes).</p>`
  },
  {
    term: "Drop Date",
    short_definition: "The specific date and time when an expired domain becomes available for registration again.",
    full_definition: `<p>The specific date and time when an expired domain becomes available for registration again. Drop dates vary by registry and registrar, and specialized services track these dates for investors interested in catching valuable expiring domains.</p>`
  },
  {
    term: "EMD (Exact Match Domain)",
    short_definition: "A domain name that exactly matches a search query, such as CheapFlights.com for 'cheap flights.'",
    full_definition: `<p>A domain name that exactly matches a search query, such as CheapFlights.com for "cheap flights." EMDs were historically valuable for SEO benefits, though search engines have reduced this advantage over time.</p>
<p>They remain valuable for their descriptive nature and type-in traffic potential.</p>`
  },
  {
    term: "EPP Code",
    short_definition: "A unique authorization code required to transfer a domain from one registrar to another, also called a transfer code.",
    full_definition: `<p>Also called an authorization code or transfer code, this is a unique password required to transfer a domain from one registrar to another. The EPP code prevents unauthorized transfers and should be kept secure.</p>`
  },
  {
    term: "Expiry Auction",
    short_definition: "An auction held for a domain name that wasn't renewed by its owner before it becomes publicly available.",
    full_definition: `<p>An auction held for a domain name that wasn't renewed by its owner. Registrars and aftermarket platforms hold expiry auctions before domains become available to the general public, giving existing backorder customers first opportunity.</p>`
  },
  {
    term: "Extension",
    short_definition: "The suffix at the end of a domain name, also called a TLD, such as .com, .net, .org, or country codes like .uk.",
    full_definition: `<p>The suffix at the end of a domain name, also called a TLD (Top-Level Domain). Extensions include generic options like .com, .net, and .org, as well as country codes like .uk and newer options like .io, .ai, and .xyz.</p>`
  },
  {
    term: "Forwarding",
    short_definition: "Redirecting visitors from one domain to another, commonly used for alternate domains or misspellings.",
    full_definition: `<p>Redirecting visitors from one domain to another. Domain forwarding is commonly used to send traffic from alternate domains or misspellings to a primary website, or to monetize parked domains.</p>`
  },
  {
    term: "GoDaddy Auctions",
    short_definition: "One of the largest domain name auction platforms, hosting both user-listed domains and expired domain auctions.",
    full_definition: `<p>One of the largest domain name auction platforms, operated by GoDaddy, the world's largest domain registrar. GoDaddy Auctions hosts both user-listed domains and expired domain auctions.</p>`
  },
  {
    term: "Grace Period",
    short_definition: "A window after a domain expires during which the original owner can renew it at the standard price, typically 30-45 days.",
    full_definition: `<p>A window after a domain expires during which the original owner can renew it, usually at the standard renewal price. Grace periods vary by registrar and extension but typically last 30-45 days.</p>`
  },
  {
    term: "Holding Page",
    short_definition: "A temporary webpage displayed on a domain that's not yet fully developed, often showing 'coming soon' or 'for sale' messages.",
    full_definition: `<p>A temporary webpage displayed on a domain that's not yet fully developed. Holding pages might show "coming soon" messages, contact information, or indicate the domain is for sale.</p>`
  },
  {
    term: "IDN (Internationalized Domain Name)",
    short_definition: "A domain name that includes characters from non-Latin scripts, such as Chinese, Arabic, or Cyrillic.",
    full_definition: `<p>A domain name that includes characters from non-Latin scripts, such as Chinese, Arabic, or Cyrillic. IDNs allow users to access websites using domain names in their native languages.</p>`
  },
  {
    term: "Inbound Link",
    short_definition: "A hyperlink from another website pointing to your domain, which can improve search rankings and domain value.",
    full_definition: `<p>A hyperlink from another website pointing to your domain. Inbound links from quality websites improve search engine rankings and can add value to a domain name.</p>`
  },
  {
    term: "Landing Page",
    short_definition: "A single webpage designed for a specific purpose, such as collecting leads or providing information about a domain for sale.",
    full_definition: `<p>A single webpage designed for a specific purpose, such as collecting leads, selling products, or providing information about a domain for sale. Effective landing pages can increase the value of parked domains.</p>`
  },
  {
    term: "Landrush",
    short_definition: "A period during the launch of a new TLD when domains can be registered before general availability, often at premium prices.",
    full_definition: `<p>A period during the launch of a new TLD when trademark holders and others can register domains before general availability, often at premium prices. Landrush registrations typically follow sunrise periods.</p>`
  },
  {
    term: "Lead Generation",
    short_definition: "Using domain names to capture potential customer information through parked pages with contact forms or advertising.",
    full_definition: `<p>Using domain names to capture potential customer information, often through parked pages with contact forms or click-through advertising. Quality exact-match domains can generate valuable leads.</p>`
  },
  {
    term: "Legacy TLD",
    short_definition: "The original group of top-level domains including .com, .net, .org, .edu, .gov, and .mil.",
    full_definition: `<p>The original group of top-level domains including .com, .net, .org, .edu, .gov, and .mil. Legacy TLDs, especially .com, remain the most valuable and recognizable extensions.</p>`
  },
  {
    term: "LLL.com",
    short_definition: "A domain consisting of exactly three letters followed by .com, with only 17,576 possible combinations making them scarce and valuable.",
    full_definition: `<p>A domain consisting of exactly three letters followed by .com. With only 17,576 possible combinations, LLL.com domains are scarce and valuable, often selling for five to six figures.</p>`
  },
  {
    term: "Listing",
    short_definition: "Adding a domain to a marketplace or sales platform to make it available for purchase.",
    full_definition: `<p>Adding a domain to a marketplace or sales platform to make it available for purchase. Listings typically include asking prices, descriptions, and category information.</p>`
  },
  {
    term: "LOI (Letter of Intent)",
    short_definition: "A formal document expressing a buyer's serious interest in purchasing a domain, often including proposed terms.",
    full_definition: `<p>A formal document expressing a buyer's serious interest in purchasing a domain, often including proposed terms. LOIs are common in high-value transactions and may include exclusivity periods during negotiation.</p>`
  },
  {
    term: "Locking",
    short_definition: "A security feature that prevents unauthorized changes or transfers of a domain name.",
    full_definition: `<p>A security feature that prevents unauthorized changes or transfers of a domain name. Registrar locks are standard, while registry locks provide additional protection for high-value domains.</p>`
  },
  {
    term: "Monetization",
    short_definition: "Generating revenue from domain names through parking, development, lead generation, or affiliate marketing.",
    full_definition: `<p>Generating revenue from domain names, typically through parking (displaying ads), development, lead generation, or affiliate marketing. Effective monetization can cover renewal costs while waiting for the right buyer.</p>`
  },
  {
    term: "Nameserver",
    short_definition: "A server that handles DNS queries for a domain, translating the domain name into its IP address.",
    full_definition: `<p>A server that handles DNS queries for a domain, translating the domain name into its IP address. Domains typically have at least two nameservers for redundancy.</p>`
  },
  {
    term: "NDA (Non-Disclosure Agreement)",
    short_definition: "A legal contract requiring parties to keep transaction details confidential, common in high-value domain sales.",
    full_definition: `<p>A legal contract requiring parties to keep transaction details confidential. NDAs are common in high-value domain sales where buyers or sellers want to keep the price or their identity private.</p>`
  },
  {
    term: "Negotiation",
    short_definition: "The process of discussing and agreeing on a price for a domain name between buyer and seller.",
    full_definition: `<p>The process of discussing and agreeing on a price for a domain name. Effective negotiation requires understanding the domain's value, the buyer's needs, and market conditions.</p>`
  },
  {
    term: "New gTLD",
    short_definition: "Generic top-level domains introduced through ICANN's expansion program starting in 2014, including .app, .blog, and .shop.",
    full_definition: `<p>Generic top-level domains introduced through ICANN's expansion program starting in 2014. New gTLDs include extensions like .app, .blog, .shop, .io, and hundreds of others.</p>`
  },
  {
    term: "NNNN.com",
    short_definition: "A domain consisting of exactly four numeric digits followed by .com, with only 10,000 possible combinations.",
    full_definition: `<p>A domain consisting of exactly four numeric digits followed by .com. With only 10,000 possible combinations, NNNN.com domains are collectible and can be valuable, especially memorable patterns.</p>`
  },
  {
    term: "Pending Delete",
    short_definition: "The final stage before an expired domain is released back to the public, during which it cannot be renewed.",
    full_definition: `<p>The final stage before an expired domain is released back to the public. During pending delete, the domain cannot be renewed and will soon become available for registration.</p>`
  },
  {
    term: "PMD (Partial Match Domain)",
    short_definition: "A domain containing keywords related to a search query but not matching exactly, such as BestCheapFlights.com.",
    full_definition: `<p>A domain containing keywords related to a search query but not matching exactly. For example, BestCheapFlights.com would be a partial match for "cheap flights."</p>`
  },
  {
    term: "Private Registration",
    short_definition: "A service that replaces the domain owner's contact information in WHOIS records with the privacy service's information.",
    full_definition: `<p>A service that replaces the domain owner's contact information in WHOIS records with the privacy service's information. Private registration protects against spam and unwanted contact but may be viewed skeptically in sales negotiations.</p>`
  },
  {
    term: "Redirect",
    short_definition: "Automatically sending visitors from one URL to another, used to consolidate domains or preserve SEO value.",
    full_definition: `<p>Automatically sending visitors from one URL to another. Redirects are used to consolidate domains, preserve SEO value when changing URLs, or forward parked domains to active sites.</p>`
  },
  {
    term: "Redemption Period",
    short_definition: "A period after the grace period when an expired domain can still be recovered, but at a significantly higher fee.",
    full_definition: `<p>A period after the grace period when an expired domain can still be recovered, but at a significantly higher fee. Redemption periods typically last 30 days and involve registry-level fees.</p>`
  },
  {
    term: "Reserve Price",
    short_definition: "The minimum price a seller will accept at auction; if bidding doesn't reach the reserve, the domain isn't sold.",
    full_definition: `<p>The minimum price a seller will accept at auction. If bidding doesn't reach the reserve, the domain isn't sold. Some auctions display whether the reserve has been met.</p>`
  },
  {
    term: "Reseller",
    short_definition: "A company that sells domain registrations through a registrar's system, often white-labeled under their own brand.",
    full_definition: `<p>A company that sells domain registrations through a registrar's system, often white-labeled under their own brand. Resellers can offer different pricing and services than the underlying registrar.</p>`
  },
  {
    term: "ROI (Return on Investment)",
    short_definition: "The profit or loss from a domain investment relative to its cost, including registration, renewal, and marketing expenses.",
    full_definition: `<p>The profit or loss from a domain investment relative to its cost. Calculating ROI on domains must include registration, renewal, and marketing costs against eventual sale revenue.</p>`
  },
  {
    term: "Short Domain",
    short_definition: "A domain name with few characters, typically under 6 letters, valued for being easier to remember and type.",
    full_definition: `<p>A domain name with few characters, typically under 6 letters. Short domains are easier to remember, type, and brand, making them more valuable than longer alternatives.</p>`
  },
  {
    term: "Stealth Acquisition",
    short_definition: "Purchasing a domain without revealing the true buyer's identity, often through a broker or shell company.",
    full_definition: `<p>Purchasing a domain without revealing the true buyer's identity, often through a broker or shell company. Large companies use stealth acquisitions to avoid price inflation when sellers know who's buying.</p>`
  },
  {
    term: "Thin WHOIS",
    short_definition: "A WHOIS system that provides only basic registrar information, requiring additional queries for full contact details.",
    full_definition: `<p>A WHOIS system that provides only basic registrar information, requiring additional queries to the registrar for full contact details. Many registries now use thin WHOIS for privacy.</p>`
  },
  {
    term: "Traffic",
    short_definition: "Visitors to a domain name or website; domains with existing traffic are more valuable than those with no visitors.",
    full_definition: `<p>Visitors to a domain name or website. Domains with existing traffic from type-ins, backlinks, or search are more valuable than those with no visitors.</p>`
  },
  {
    term: "Trustee Service",
    short_definition: "A service that holds domains on behalf of registrants who don't meet local presence requirements for certain ccTLDs.",
    full_definition: `<p>A service that holds domains on behalf of registrants who don't meet local presence requirements for certain ccTLDs. Trustees provide a local address while allowing foreign ownership.</p>`
  }
]

console.log(`\n📚 Importing ${newTerms.length} new dictionary terms...\n`)

let successCount = 0
let errorCount = 0

for (const termData of newTerms) {
  const slug = createSlug(termData.term)

  const { error } = await supabase
    .from('dictionary_terms')
    .insert({
      term: termData.term,
      slug: slug,
      short_definition: termData.short_definition,
      full_definition: termData.full_definition
    })

  if (error) {
    console.error(`❌ Error adding "${termData.term}":`, error.message)
    errorCount++
  } else {
    console.log(`✅ Added: ${termData.term}`)
    successCount++
  }
}

console.log(`\n✨ Import complete!`)
console.log(`   Success: ${successCount}`)
console.log(`   Errors: ${errorCount}`)
console.log(`   Total terms now in dictionary: ${103 + successCount}\n`)
