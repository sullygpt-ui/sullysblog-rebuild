#!/usr/bin/env python3
"""
WordPress Posts Migration Script for SullysBlog

Migrates blog posts, pages, and comments from WordPress SQL dump to Supabase.

Requirements:
    pip install python-dotenv supabase sqlparse

Usage:
    python migrate-posts.py --sql-file path/to/backup.sql

Environment Variables (.env in sullysblog directory):
    NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
    SUPABASE_SERVICE_KEY=your-service-role-key
"""

import os
import re
import sys
import argparse
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from dotenv import load_dotenv
from supabase import create_client, Client

# WordPress table prefix
WP_PREFIX = "wp_5sn88nclkq_"

# Batch size for inserts
BATCH_SIZE = 50


def load_env_from_nextjs():
    """Load environment variables from Next.js .env.local"""
    nextjs_env = os.path.join(os.path.dirname(__file__), '..', 'sullysblog', '.env.local')
    if os.path.exists(nextjs_env):
        load_dotenv(nextjs_env)
        print(f"✓ Loaded environment from {nextjs_env}")
    else:
        print(f"⚠ Warning: {nextjs_env} not found")
        load_dotenv()


def init_supabase() -> Client:
    """Initialize Supabase client with service key"""
    supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_KEY")

    if not supabase_url:
        print("Error: NEXT_PUBLIC_SUPABASE_URL not found in environment")
        sys.exit(1)

    if not service_key:
        print("Error: SUPABASE_SERVICE_KEY not found in environment")
        print("Get your service key from: Supabase Dashboard > Settings > API > service_role key")
        sys.exit(1)

    return create_client(supabase_url, service_key)


def parse_sql_value(value: str) -> str:
    """Parse and unescape SQL string value"""
    if value == 'NULL':
        return None

    # Remove quotes
    if value.startswith("'") and value.endswith("'"):
        value = value[1:-1]

    # Unescape SQL strings
    value = value.replace("\\'", "'")
    value = value.replace("\\\"", "\"")
    value = value.replace("\\\\", "\\")
    value = value.replace("\\n", "\n")
    value = value.replace("\\r", "\r")
    value = value.replace("\\t", "\t")

    return value


def extract_insert_values(sql_file: str, table_name: str) -> List[List[str]]:
    """Extract all INSERT VALUES from a specific table"""
    print(f"Extracting data from {table_name}...")

    full_table = f"{WP_PREFIX}{table_name}"
    rows = []

    with open(sql_file, 'r', encoding='utf-8', errors='ignore') as f:
        current_insert = None

        for line in f:
            # Check if this is an INSERT for our table
            if f"INSERT INTO `{full_table}`" in line:
                current_insert = line
            elif current_insert:
                # Continue multi-line INSERT
                current_insert += line
                if line.rstrip().endswith(';'):
                    # Parse the complete INSERT statement
                    rows.extend(parse_insert_statement(current_insert))
                    current_insert = None

    print(f"  Found {len(rows)} rows in {table_name}")
    return rows


def parse_insert_statement(sql: str) -> List[List[str]]:
    """Parse INSERT INTO ... VALUES (...),(...),... statement"""
    # Find VALUES clause
    match = re.search(r'VALUES\s+(.+);', sql, re.DOTALL)
    if not match:
        return []

    values_part = match.group(1)
    rows = []

    # Split by ),( to get individual rows
    # This is simplified - a full parser would handle nested parentheses
    row_pattern = r'\(([^)]+(?:\([^)]*\)[^)]*)*)\)'

    for row_match in re.finditer(row_pattern, values_part):
        row_data = row_match.group(1)
        # Split by comma, but respect quoted strings
        values = split_sql_values(row_data)
        rows.append(values)

    return rows


def split_sql_values(row_data: str) -> List[str]:
    """Split SQL row values by comma, respecting quotes"""
    values = []
    current = []
    in_quote = False
    quote_char = None
    escape = False

    for char in row_data:
        if escape:
            current.append(char)
            escape = False
            continue

        if char == '\\':
            escape = True
            current.append(char)
            continue

        if char in ("'", '"') and not in_quote:
            in_quote = True
            quote_char = char
            current.append(char)
        elif char == quote_char and in_quote:
            in_quote = False
            quote_char = None
            current.append(char)
        elif char == ',' and not in_quote:
            values.append(''.join(current).strip())
            current = []
        else:
            current.append(char)

    if current:
        values.append(''.join(current).strip())

    return values


def get_category_map(supabase: Client) -> Dict[int, str]:
    """Get mapping of WordPress term_id to Supabase category UUID"""
    result = supabase.table("categories").select("id,name").execute()

    # For now, create a simple name-based mapping
    # In a full migration, we'd parse wp_terms and wp_term_taxonomy
    category_map = {}
    for cat in result.data:
        category_map[cat['name'].lower()] = cat['id']

    return category_map


def migrate_posts(sql_file: str, supabase: Client):
    """Migrate WordPress posts to Supabase"""
    print("\n" + "="*60)
    print("MIGRATING BLOG POSTS")
    print("="*60)

    # Extract posts data
    posts_rows = extract_insert_values(sql_file, "posts")

    # Get category mapping
    category_map = get_category_map(supabase)
    default_category_id = list(category_map.values())[0] if category_map else None

    # Filter for published posts only
    posts_to_migrate = []

    for row in posts_rows:
        # WordPress posts table columns (from schema)
        # 0:ID, 1:author, 2:post_date, 3:post_date_gmt, 4:content, 5:title,
        # 6:excerpt, 7:status, 8:comment_status, 9:ping_status, 10:password,
        # 11:post_name (slug), 12:to_ping, 13:pinged, 14:modified, 15:modified_gmt,
        # 16:filtered, 17:parent, 18:guid, 19:menu_order, 20:post_type, 21:mime, 22:comment_count

        if len(row) < 23:
            continue

        post_type = parse_sql_value(row[20])
        post_status = parse_sql_value(row[7])

        # Only migrate published posts (not pages, attachments, etc.)
        if post_type != 'post':
            continue

        if post_status != 'publish':
            continue

        # Parse post data
        post_id = int(parse_sql_value(row[0]))
        title = parse_sql_value(row[5])
        slug = parse_sql_value(row[11])
        content = parse_sql_value(row[4])
        excerpt = parse_sql_value(row[6])
        published_date = parse_sql_value(row[2])  # post_date
        modified_date = parse_sql_value(row[14])  # post_modified
        guid = parse_sql_value(row[18])  # Original URL

        # Clean up dates (WordPress uses '0000-00-00 00:00:00' for null)
        if published_date and published_date.startswith('0000'):
            published_date = None
        if modified_date and modified_date.startswith('0000'):
            modified_date = datetime.now().isoformat()

        # Build Supabase post object
        post_data = {
            "slug": slug or f"post-{post_id}",
            "title": title or "Untitled",
            "content": content or "",
            "excerpt": excerpt if excerpt else None,
            "featured_image_url": None,  # Will be updated from postmeta
            "author_id": str(uuid.uuid4()),  # Placeholder - update with real user
            "category_id": default_category_id,
            "status": "published",
            "published_at": published_date,
            "created_at": published_date or datetime.now().isoformat(),
            "updated_at": modified_date,
            "view_count": 0,
            "seo_title": None,
            "seo_description": None,
            "wordpress_id": post_id,
            "wordpress_url": guid
        }

        posts_to_migrate.append(post_data)

    print(f"\nFound {len(posts_to_migrate)} published posts to migrate")

    # Insert in batches
    total_inserted = 0
    failed = 0

    for i in range(0, len(posts_to_migrate), BATCH_SIZE):
        batch = posts_to_migrate[i:i+BATCH_SIZE]

        try:
            result = supabase.table("posts").insert(batch).execute()
            total_inserted += len(batch)
            print(f"  ✓ Inserted batch {i//BATCH_SIZE + 1}: {len(batch)} posts (total: {total_inserted})")
        except Exception as e:
            print(f"  ✗ Error inserting batch {i//BATCH_SIZE + 1}: {e}")

            # Try inserting one by one to identify problem posts
            for post in batch:
                try:
                    supabase.table("posts").insert(post).execute()
                    total_inserted += 1
                except Exception as e2:
                    failed += 1
                    print(f"    ✗ Failed to insert: {post['title'][:50]}... - {e2}")

    print(f"\n✓ Migration complete: {total_inserted} posts inserted, {failed} failed")

    return total_inserted


def migrate_pages(sql_file: str, supabase: Client):
    """Migrate WordPress pages to Supabase"""
    print("\n" + "="*60)
    print("MIGRATING PAGES")
    print("="*60)

    # Extract posts data (pages are in the same table)
    posts_rows = extract_insert_values(sql_file, "posts")

    pages_to_migrate = []

    for row in posts_rows:
        if len(row) < 23:
            continue

        post_type = parse_sql_value(row[20])
        post_status = parse_sql_value(row[7])

        # Only migrate published pages
        if post_type != 'page':
            continue

        if post_status != 'publish':
            continue

        # Parse page data (same structure as posts)
        page_id = int(parse_sql_value(row[0]))
        title = parse_sql_value(row[5])
        slug = parse_sql_value(row[11])
        content = parse_sql_value(row[4])
        published_date = parse_sql_value(row[2])
        modified_date = parse_sql_value(row[14])
        guid = parse_sql_value(row[18])

        if published_date and published_date.startswith('0000'):
            published_date = None
        if modified_date and modified_date.startswith('0000'):
            modified_date = datetime.now().isoformat()

        page_data = {
            "slug": slug or f"page-{page_id}",
            "title": title or "Untitled",
            "content": content or "",
            "featured_image_url": None,
            "author_id": str(uuid.uuid4()),
            "status": "published",
            "published_at": published_date,
            "created_at": published_date or datetime.now().isoformat(),
            "updated_at": modified_date,
            "seo_title": None,
            "seo_description": None,
            "wordpress_id": page_id,
            "wordpress_url": guid
        }

        pages_to_migrate.append(page_data)

    print(f"\nFound {len(pages_to_migrate)} published pages to migrate")

    # Insert in batches
    total_inserted = 0
    failed = 0

    for i in range(0, len(pages_to_migrate), BATCH_SIZE):
        batch = pages_to_migrate[i:i+BATCH_SIZE]

        try:
            result = supabase.table("pages").insert(batch).execute()
            total_inserted += len(batch)
            print(f"  ✓ Inserted batch {i//BATCH_SIZE + 1}: {len(batch)} pages (total: {total_inserted})")
        except Exception as e:
            print(f"  ✗ Error inserting batch: {e}")
            failed += len(batch)

    print(f"\n✓ Migration complete: {total_inserted} pages inserted, {failed} failed")

    return total_inserted


def verify_migration(supabase: Client):
    """Verify migration results"""
    print("\n" + "="*60)
    print("VERIFICATION")
    print("="*60)

    checks = [
        ("posts", 624),
        ("pages", 160),
        ("categories", 6),
    ]

    for table, expected in checks:
        try:
            result = supabase.table(table).select("id", count="exact").execute()
            actual = result.count if hasattr(result, 'count') else len(result.data)
            status = "✓" if actual >= expected else "⚠"
            print(f"{status} {table:15} {actual:4} / {expected:4}")
        except Exception as e:
            print(f"✗ {table:15} Error: {e}")


def main():
    parser = argparse.ArgumentParser(description="Migrate WordPress posts to Supabase")
    parser.add_argument("--sql-file", required=True, help="Path to WordPress SQL dump")
    parser.add_argument("--posts-only", action="store_true", help="Only migrate posts, skip pages")
    parser.add_argument("--pages-only", action="store_true", help="Only migrate pages, skip posts")

    args = parser.parse_args()

    if not os.path.exists(args.sql_file):
        print(f"Error: SQL file not found: {args.sql_file}")
        sys.exit(1)

    # Load environment and initialize Supabase
    load_env_from_nextjs()
    supabase = init_supabase()

    print("\n" + "="*60)
    print("WORDPRESS TO SUPABASE MIGRATION")
    print("="*60)
    print(f"SQL File: {args.sql_file}")
    print(f"File Size: {os.path.getsize(args.sql_file) / 1024 / 1024:.1f} MB")
    print()

    try:
        total_posts = 0
        total_pages = 0

        if not args.pages_only:
            total_posts = migrate_posts(args.sql_file, supabase)

        if not args.posts_only:
            total_pages = migrate_pages(args.sql_file, supabase)

        verify_migration(supabase)

        print("\n" + "="*60)
        print("MIGRATION COMPLETE!")
        print("="*60)
        print(f"✓ {total_posts} posts migrated")
        print(f"✓ {total_pages} pages migrated")
        print("\nNext steps:")
        print("1. Visit http://localhost:3000/blog to see your posts")
        print("2. Check individual post pages")
        print("3. Migrate comments (optional)")
        print("4. Upload images to Supabase Storage")

    except Exception as e:
        print(f"\n✗ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
