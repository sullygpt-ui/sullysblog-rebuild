#!/usr/bin/env python3
"""
Create test data: user, sample posts, and sample comments
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

print("Creating test data...\n")

# Step 1: Create a user (author)
print("1. Creating user...")
user_data = {
    "email": "michael@sullysblog.com",
    "name": "Michael Sullivan",
    "role": "admin",
    "created_at": datetime.now().isoformat()
}

try:
    user_result = supabase.table("users").insert(user_data).execute()
    author_id = user_result.data[0]['id']
    print(f"✓ Created user: {user_data['name']} (ID: {author_id})")
except Exception as e:
    # User might already exist, try to get it
    try:
        existing = supabase.table("users").select("id").eq("email", user_data['email']).single().execute()
        author_id = existing.data['id']
        print(f"✓ Using existing user (ID: {author_id})")
    except:
        print(f"✗ Error creating user: {e}")
        sys.exit(1)

# Step 2: Get a category
print("\n2. Getting category...")
categories = supabase.table("categories").select("id,name").limit(1).execute()
category_id = categories.data[0]['id'] if categories.data else None
print(f"✓ Using category: {categories.data[0]['name']}")

# Step 3: Create sample posts
print("\n3. Creating sample posts...")

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

<p>The domain Insurance.com sold for $35.6 million in 2010. While this is an extreme example, it illustrates the potential value of category-defining domains.</p>""",
        "excerpt": "Exploring whether premium domain names are worth their high price tags. Analysis of what makes domains valuable and when to invest in premium names.",
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

<p>When domain registrations expire, they enter auction. This is where you can find gems at reasonable prices.</p>

<h4>2. Emerging Trends</h4>

<p>Stay ahead of trends. When ChatGPT launched, AI-related domains skyrocketed. What's the next big thing?</p>

<h2>Selling Strategies</h2>

<p>Buying is only half the battle. Here's how to sell effectively:</p>

<ol>
<li><strong>Price it right</strong> - Research comparable sales</li>
<li><strong>List on marketplaces</strong> - Sedo, Flippa, Afternic</li>
<li><strong>Create a landing page</strong> - Show the domain is for sale</li>
</ol>""",
        "excerpt": "Comprehensive guide to domain flipping in 2024. Learn current trends, where to find undervalued domains, and proven selling strategies.",
    }
]

created_posts = []
for i, post_data in enumerate(sample_posts):
    post_data.update({
        "author_id": author_id,
        "category_id": category_id,
        "status": "published",
        "published_at": (datetime.now() - timedelta(days=30-i*10)).isoformat(),
        "created_at": (datetime.now() - timedelta(days=30-i*10)).isoformat(),
        "updated_at": datetime.now().isoformat(),
        "view_count": (100 - i*20),
        "featured_image_url": None,
        "seo_title": None,
        "seo_description": None,
    })

    try:
        result = supabase.table("posts").insert(post_data).execute()
        created_posts.append(result.data[0])
        print(f"  ✓ {post_data['title']}")
    except Exception as e:
        print(f"  ✗ Error: {e}")

# Step 4: Create some sample comments
print("\n4. Creating sample comments...")

if created_posts:
    first_post_id = created_posts[0]['id']

    comments = [
        {
            "post_id": first_post_id,
            "parent_id": None,
            "author_name": "John Domainer",
            "author_email": "john@example.com",
            "content": "<p>Great article! I've been domain investing for 5 years and this is solid advice for beginners.</p>",
            "status": "approved",
            "created_at": (datetime.now() - timedelta(days=5)).isoformat()
        },
        {
            "post_id": first_post_id,
            "parent_id": None,
            "author_name": "Sarah Tech",
            "author_email": "sarah@example.com",
            "content": "<p>What's your take on new TLDs like .ai and .io? Are they worth investing in?</p>",
            "status": "approved",
            "created_at": (datetime.now() - timedelta(days=3)).isoformat()
        }
    ]

    comment_ids = []
    for comment_data in comments:
        try:
            result = supabase.table("comments").insert(comment_data).execute()
            comment_ids.append(result.data[0]['id'])
            print(f"  ✓ Comment by {comment_data['author_name']}")
        except Exception as e:
            print(f"  ✗ Error: {e}")

    # Add a reply to the first comment
    if comment_ids:
        reply = {
            "post_id": first_post_id,
            "parent_id": comment_ids[0],
            "author_name": "Michael Sullivan",
            "author_email": "michael@sullysblog.com",
            "content": "<p>Thanks John! Glad you found it helpful. Feel free to share any tips from your experience!</p>",
            "status": "approved",
            "created_at": (datetime.now() - timedelta(days=4)).isoformat()
        }

        try:
            supabase.table("comments").insert(reply).execute()
            print(f"  ✓ Reply by {reply['author_name']}")
        except Exception as e:
            print(f"  ✗ Error: {e}")

print("\n" + "="*60)
print("TEST DATA CREATED SUCCESSFULLY!")
print("="*60)
print(f"\nCreated:")
print(f"  • 1 user (author)")
print(f"  • {len(created_posts)} blog posts")
print(f"  • 3 comments (including 1 nested reply)")
print("\nYou can now test your blog:")
print("  📝 Blog index: http://localhost:3000/blog")
print("  📄 First post: http://localhost:3000/getting-started-with-domain-investing")
print("  💬 Comments: Scroll to bottom of post page")
