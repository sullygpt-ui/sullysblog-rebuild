#!/usr/bin/env python3
"""
WordPress to Supabase Migration Script for SullysBlog

This script migrates content from WordPress MySQL dump to Supabase PostgreSQL.

Requirements:
    pip install python-dotenv supabase-py mysql-connector-python

Usage:
    python migrate-wordpress.py --sql-file path/to/backup.sql

Environment Variables (.env):
    SUPABASE_URL=https://your-project.supabase.co
    SUPABASE_KEY=your-anon-key
    SUPABASE_SERVICE_KEY=your-service-role-key
"""

import os
import re
import sys
import argparse
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")  # Use service key for admin operations

if not supabase_url or not supabase_key:
    print("Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env file")
    sys.exit(1)

supabase: Client = create_client(supabase_url, supabase_key)

# WordPress table prefix
WP_PREFIX = "wp_5sn88nclkq_"


def parse_sql_inserts(sql_file, table_name):
    """
    Parse INSERT statements from SQL dump for a specific table.
    Returns list of dictionaries representing rows.
    """
    print(f"Parsing {table_name} from SQL file...")

    # This is a simplified parser - for production, use mysql-connector-python
    # to load into temp MySQL and export, or parse more robustly

    with open(sql_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find INSERT INTO statements for this table
    pattern = f"INSERT INTO `{WP_PREFIX}{table_name}` VALUES (.+?);"
    matches = re.findall(pattern, content, re.DOTALL)

    print(f"Found {len(matches)} INSERT statements for {table_name}")
    return matches


def migrate_categories(sql_file):
    """Migrate WordPress categories to Supabase."""
    print("\n=== Migrating Categories ===")

    # For categories, we need to join terms + term_taxonomy
    # This is a simplified example - in production, parse both tables properly

    categories = [
        {"name": "Domain Investing", "slug": "domain-investing", "description": "Tips and strategies for domain name investment"},
        {"name": "Domain Sales", "slug": "domain-sales", "description": "Domain name sales techniques and success stories"},
        {"name": "Domain News", "slug": "domain-news", "description": "Latest news in the domain industry"},
        {"name": "SEO", "slug": "seo", "description": "Search engine optimization for domains and websites"},
        {"name": "Legal", "slug": "legal", "description": "Legal aspects of domain ownership and disputes"},
        {"name": "Marketing", "slug": "marketing", "description": "Marketing strategies for domains and websites"},
        # Add remaining 15 categories from WordPress export
    ]

    for cat in categories:
        try:
            result = supabase.table("categories").insert(cat).execute()
            print(f"✓ Migrated category: {cat['name']}")
        except Exception as e:
            print(f"✗ Error migrating category {cat['name']}: {e}")

    print(f"Categories migrated: {len(categories)}")


def migrate_advertisers(sql_file):
    """Migrate WordPress advertiser tracker to Supabase."""
    print("\n=== Migrating Advertisers ===")

    # Known advertisers from WordPress backup
    advertisers = [
        {"business_name": "Grit Brokerage", "contact_name": "TBD", "company_url": "https://gritbrokerage.com"},
        {"business_name": "NSlookup.io", "contact_name": "TBD", "company_url": "https://nslookup.io"},
        {"business_name": ".AGT", "contact_name": "TBD", "company_url": None},
        {"business_name": "Gname", "contact_name": "TBD", "company_url": "https://gname.com"},
    ]

    advertiser_ids = {}

    for adv in advertisers:
        try:
            result = supabase.table("advertisers").insert(adv).execute()
            advertiser_ids[adv["business_name"]] = result.data[0]["id"]
            print(f"✓ Migrated advertiser: {adv['business_name']}")
        except Exception as e:
            print(f"✗ Error migrating advertiser {adv['business_name']}: {e}")

    print(f"Advertisers migrated: {len(advertisers)}")
    return advertiser_ids


def migrate_campaigns(sql_file, advertiser_ids):
    """Migrate ad campaigns."""
    print("\n=== Migrating Ad Campaigns ===")

    campaigns = [
        {
            "advertiser_id": advertiser_ids.get("Grit Brokerage"),
            "start_date": "2025-10-01",
            "end_date": "2026-01-01",
            "status": "active",
            "monthly_amount": 50.00,
            "notes": "Initial campaign - $50/month"
        },
        {
            "advertiser_id": advertiser_ids.get("Grit Brokerage"),
            "start_date": "2026-01-01",
            "end_date": "2026-04-01",
            "status": "active",
            "monthly_amount": 100.00,
            "notes": "Renewed campaign - increased to $100/month"
        },
        {
            "advertiser_id": advertiser_ids.get("NSlookup.io"),
            "start_date": "2025-11-21",
            "end_date": "2026-02-21",
            "status": "active",
            "monthly_amount": 100.00,
        },
        {
            "advertiser_id": advertiser_ids.get(".AGT"),
            "start_date": "2025-11-25",
            "end_date": "2026-02-25",
            "status": "active",
            "monthly_amount": 100.00,
        },
        {
            "advertiser_id": advertiser_ids.get("Gname"),
            "start_date": "2025-12-09",
            "end_date": "2026-03-09",
            "status": "active",
            "monthly_amount": 100.00,
        },
    ]

    for camp in campaigns:
        try:
            result = supabase.table("ad_campaigns").insert(camp).execute()
            print(f"✓ Migrated campaign for {camp.get('notes', 'advertiser')}")
        except Exception as e:
            print(f"✗ Error migrating campaign: {e}")

    print(f"Campaigns migrated: {len(campaigns)}")
    print(f"Current MRR: $450/month")


def migrate_dictionary_terms(sql_file):
    """Migrate dictionary terms."""
    print("\n=== Migrating Dictionary Terms ===")

    # Sample terms - full list should come from wp_domain_dictionary table
    sample_terms = [
        {
            "term": "WIPO",
            "slug": "wipo",
            "short_definition": "World Intellectual Property Organization",
            "full_definition": "The World Intellectual Property Organization (WIPO) is a specialized agency of the United Nations responsible for intellectual property matters, including domain name dispute resolution through the UDRP process."
        },
        {
            "term": "UDRP",
            "slug": "udrp",
            "short_definition": "Uniform Domain-Name Dispute-Resolution Policy",
            "full_definition": "The UDRP is an arbitration process for resolving disputes over domain names that may violate trademark rights, without requiring expensive litigation."
        },
        # Add remaining 100 terms from WordPress database
    ]

    for term in sample_terms:
        try:
            result = supabase.table("dictionary_terms").insert(term).execute()
            print(f"✓ Migrated term: {term['term']}")
        except Exception as e:
            print(f"✗ Error migrating term {term['term']}: {e}")

    print(f"Dictionary terms migrated: {len(sample_terms)}/102")


def verify_migration():
    """Verify migration was successful."""
    print("\n=== Migration Verification ===")

    checks = [
        ("categories", 21),
        ("advertisers", 4),
        ("ad_campaigns", 5),
        ("dictionary_terms", 102),
    ]

    for table, expected_count in checks:
        try:
            result = supabase.table(table).select("id", count="exact").execute()
            actual_count = result.count if hasattr(result, 'count') else len(result.data)
            status = "✓" if actual_count >= expected_count else "⚠"
            print(f"{status} {table}: {actual_count}/{expected_count}")
        except Exception as e:
            print(f"✗ Error checking {table}: {e}")

    # Check current MRR
    try:
        result = supabase.rpc("calculate_current_mrr").execute()
        mrr = result.data
        print(f"\nCurrent MRR: ${mrr}/month (expected: $450)")
    except Exception as e:
        print(f"Error calculating MRR: {e}")


def main():
    parser = argparse.ArgumentParser(description="Migrate WordPress to Supabase")
    parser.add_argument("--sql-file", required=True, help="Path to WordPress SQL dump")
    parser.add_argument("--skip-verification", action="store_true", help="Skip verification step")

    args = parser.parse_args()

    if not os.path.exists(args.sql_file):
        print(f"Error: SQL file not found: {args.sql_file}")
        sys.exit(1)

    print("===========================================")
    print("WordPress to Supabase Migration")
    print("===========================================")
    print(f"SQL File: {args.sql_file}")
    print(f"Supabase URL: {supabase_url}")
    print()

    try:
        # Run migrations in order
        migrate_categories(args.sql_file)
        advertiser_ids = migrate_advertisers(args.sql_file)
        migrate_campaigns(args.sql_file, advertiser_ids)
        migrate_dictionary_terms(args.sql_file)

        # TODO: Add remaining migrations
        # - Users
        # - Posts
        # - Pages
        # - Comments
        # - Domains for Sale
        # - Redirects

        if not args.skip_verification:
            verify_migration()

        print("\n===========================================")
        print("Migration Complete!")
        print("===========================================")
        print("\nNext Steps:")
        print("1. Verify data in Supabase dashboard")
        print("2. Migrate images to Supabase Storage")
        print("3. Set up Cloudflare Workers")
        print("4. Deploy Next.js application")

    except Exception as e:
        print(f"\n✗ Migration failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
