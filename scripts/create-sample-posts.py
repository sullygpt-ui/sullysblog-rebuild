#!/usr/bin/env python3
"""
Create sample blog posts for testing
"""

import os
import sys
import uuid
from datetime import datetime, timedelta
from dotenv import load_dotenv
from supabase import create_client

# Load environment
nextjs_env = os.path.join(os.path.dirname(__file__), '..', 'sullysblog', '.env.local')
load_dotenv(nextjs_env)

supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
service_key = os.getenv("SUPABASE_SERVICE_KEY")

if not supabase_url or not service_key:
    print("Error: Environment variables not found")
    sys.exit(1)

supabase = create_client(supabase_url, service_key)

# Get first category
categories = supabase.table("categories").select("id,name").limit(1).execute()
category_id = categories.data[0]['id'] if categories.data else None

print("Creating sample blog posts...\n")

# Sample posts
sample_posts = [
    {
        "slug": "getting-started-with-domain-investing",
        "title": "Getting Started with Domain Investing: A Beginner's Guide",
        "content": """<p>Domain investing, also known as domaining, is the practice of buying domain names as an investment with the intention of selling them for a profit. It's similar to real estate investing, but in the digital world.</p>

<h2>Why Invest in Domain Names?</h2>

<p>Domain names are valuable digital assets because they're unique and finite. Just like prime real estate, premium domain names can appreciate significantly over time. Many investors have made substantial profits by identifying valuable domains early.</p>

<h3>Types of Domain Investments</h3>

<ul>
<li><strong>Generic domains</strong> - Common words like "insurance.com" or "loans.com"</li>
<li><strong>Brandable domains</strong> - Unique, memorable names perfect for startups</li>
<li><strong>Geo domains</strong> - Location-based domains like "NewYorkPizza.com"</li>
<li><strong>Industry-specific domains</strong> - Niche domains targeting specific markets</li>
</ul>

<h2>Getting Started</h2>

<p>Start small and learn the market. Research recent domain sales, understand pricing trends, and develop an eye for valuable names. The key is patience and strategic thinking.</p>

<blockquote>
<p>"The best time to buy a domain was 10 years ago. The second best time is today." - Anonymous Domain Investor</p>
</blockquote>

<p>Remember, domain investing requires patience, research, and sometimes a bit of luck. But with the right strategy, it can be a rewarding venture.</p>""",
        "excerpt": "Learn the basics of domain investing and how to get started in the world of digital real estate. Discover different types of domain investments and strategies for success.",
        "featured_image_url": None,
        "seo_title": "Domain Investing Guide for Beginners | SullysBlog",
        "seo_description": "Complete beginner's guide to domain investing. Learn about domain types, strategies, and how to start your domain portfolio.",
    },
    {
        "slug": "premium-domain-names-worth-investment",
        "title": "Premium Domain Names: Are They Worth the Investment?",
        "content": """<p>Premium domain names often come with premium price tags. But are they worth it? Let's dive into what makes a domain "premium" and whether investing in one makes sense for your business.</p>

<h2>What Makes a Domain Premium?</h2>

<p>Premium domains typically have these characteristics:</p>

<ul>
<li>Short and memorable (usually 1-2 words)</li>
<li>Generic keywords with high search volume</li>
<li>Easy to spell and pronounce</li>
<li>.com extension (the most valuable)</li>
<li>No hyphens or numbers</li>
</ul>

<h3>The Value Proposition</h3>

<p>A premium domain can provide several benefits:</p>

<ol>
<li><strong>Instant credibility</strong> - A great domain makes your business look established</li>
<li><strong>Better SEO</strong> - Exact match domains can still provide SEO benefits</li>
<li><strong>Type-in traffic</strong> - People may type your domain directly into their browser</li>
<li><strong>Brand protection</strong> - Own your category's prime real estate</li>
</ol>

<h2>Case Study: Insurance.com</h2>

<p>The domain Insurance.com sold for $35.6 million in 2010. While this is an extreme example, it illustrates the potential value of category-defining domains. The company that purchased it saw immediate brand recognition and traffic.</p>

<h3>When to Buy Premium</h3>

<p>Consider a premium domain if:</p>

<ul>
<li>You're building a long-term brand</li>
<li>The domain directly matches your business</li>
<li>You can afford it without straining finances</li>
<li>The ROI justifies the cost</li>
</ul>

<p>Remember, a premium domain is an asset, not an expense. Choose wisely, and it can pay dividends for years to come.</p>""",
        "excerpt": "Exploring whether premium domain names are worth their high price tags. Analysis of what makes domains valuable and when to invest in premium names.",
        "featured_image_url": None,
        "seo_title": "Are Premium Domain Names Worth It? Investment Analysis",
        "seo_description": "Detailed analysis of premium domain name investments, their value proposition, and when they make sense for your business.",
    },
    {
        "slug": "domain-flipping-strategy-2024",
        "title": "Domain Flipping Strategy for 2024: Trends and Opportunities",
        "content": """<p>Domain flipping - buying domains cheap and selling them for profit - remains a viable business model in 2024. Here's what's working now and where the opportunities lie.</p>

<h2>Current Market Trends</h2>

<p>The domain market in 2024 is influenced by several key factors:</p>

<ul>
<li>AI and machine learning related domains are hot</li>
<li>Sustainability and green energy domains are rising</li>
<li>Short .ai and .io domains command premium prices</li>
<li>Web3 and blockchain domains still have momentum</li>
</ul>

<h3>Finding Undervalued Domains</h3>

<p>The key to successful domain flipping is buying low. Here are strategies that work:</p>

<h4>1. Expired Domain Auctions</h4>

<p>When domain registrations expire, they enter auction. This is where you can find gems at reasonable prices. Tools like DropCatch and NameJet aggregate these opportunities.</p>

<h4>2. Emerging Trends</h4>

<p>Stay ahead of trends. When ChatGPT launched, AI-related domains skyrocketed. What's the next big thing? That's where opportunity lies.</p>

<h4>3. Misspellings and Variations</h4>

<p>Sometimes alternate spellings or versions of popular terms can be valuable. Just ensure they're brandable and not trademark infringement.</p>

<h2>Selling Strategies</h2>

<p>Buying is only half the battle. Here's how to sell effectively:</p>

<ol>
<li><strong>Price it right</strong> - Research comparable sales</li>
<li><strong>List on marketplaces</strong> - Sedo, Flippa, Afternic</li>
<li><strong>Create a landing page</strong> - Show the domain is for sale</li>
<li><strong>Reach out directly</strong> - Contact businesses who might need it</li>
</ol>

<blockquote>
<p>"In domain flipping, your profit is made when you buy, not when you sell. Buy smart." - Michael Sullivan</p>
</blockquote>

<h3>Realistic Expectations</h3>

<p>Most domains won't make you rich overnight. Expect:</p>

<ul>
<li>Average profit margins of 50-200% per domain</li>
<li>Some domains may take years to sell</li>
<li>About 20% of your portfolio will generate 80% of profits</li>
<li>Renewal costs add up - be selective</li>
</ul>

<p>Domain flipping in 2024 requires research, patience, and timing. But for those willing to put in the work, opportunities abound.</p>""",
        "excerpt": "Comprehensive guide to domain flipping in 2024. Learn current trends, where to find undervalued domains, and proven selling strategies.",
        "featured_image_url": None,
        "seo_title": "Domain Flipping Strategy 2024: Complete Guide",
        "seo_description": "Master domain flipping in 2024 with our complete guide covering market trends, buying strategies, and selling techniques.",
    }
]

# Create author ID (placeholder - in production you'd have real users)
author_id = str(uuid.uuid4())

created = 0
for i, post_data in enumerate(sample_posts):
    # Add required fields
    post_data.update({
        "author_id": author_id,
        "category_id": category_id,
        "status": "published",
        "published_at": (datetime.now() - timedelta(days=30-i*10)).isoformat(),
        "created_at": (datetime.now() - timedelta(days=30-i*10)).isoformat(),
        "updated_at": datetime.now().isoformat(),
        "view_count": (100 - i*20),  # Simulate some views
    })

    try:
        result = supabase.table("posts").insert(post_data).execute()
        created += 1
        print(f"✓ Created: {post_data['title']}")
    except Exception as e:
        print(f"✗ Error: {post_data['title']} - {e}")

print(f"\n✓ Created {created} sample posts")
print("\nYou can now test your blog at:")
print("  http://localhost:3000/blog")
print("  http://localhost:3000/getting-started-with-domain-investing")
