#!/usr/bin/env python3
"""
Migrate WordPress XML export to Supabase
"""

from lxml import etree as ET
import os
import re
from datetime import datetime
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables from .env.local
load_dotenv('.env.local')

# Supabase credentials
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

# WordPress XML namespaces
NAMESPACES = {
    'wp': 'http://wordpress.org/export/1.2/',
    'content': 'http://purl.org/rss/1.0/modules/content/',
    'excerpt': 'http://wordpress.org/export/1.2/excerpt/',
    'dc': 'http://purl.org/dc/elements/1.1/'
}

def parse_wordpress_xml(xml_path):
    """Parse WordPress XML export and extract data"""
    print(f"Parsing XML file: {xml_path}")

    # Use lxml with recover mode to handle malformed XML
    parser = ET.XMLParser(recover=True, encoding='utf-8')
    tree = ET.parse(xml_path, parser)
    root = tree.getroot()
    channel = root.find('channel')

    print("Using lxml parser with recovery mode")

    # Extract categories
    categories = {}
    for cat in channel.findall('wp:category', NAMESPACES):
        term_id = cat.find('wp:term_id', NAMESPACES).text
        cat_name = cat.find('wp:cat_name', NAMESPACES).text
        cat_slug = cat.find('wp:category_nicename', NAMESPACES).text
        categories[term_id] = {
            'name': cat_name,
            'slug': cat_slug,
            'description': ''
        }

    print(f"Found {len(categories)} categories")

    # Extract posts
    posts = []
    comments = []
    image_urls = set()

    for item in channel.findall('item'):
        # Only process published posts
        post_type = item.find('wp:post_type', NAMESPACES)
        post_status = item.find('wp:status', NAMESPACES)

        if post_type is None or post_type.text != 'post':
            continue

        if post_status is None or post_status.text not in ['publish', 'future']:
            continue

        # Extract post data
        title = item.find('title').text or ''
        content_elem = item.find('content:encoded', NAMESPACES)
        content = content_elem.text if content_elem is not None and content_elem.text else ''
        excerpt_elem = item.find('excerpt:encoded', NAMESPACES)
        excerpt = excerpt_elem.text if excerpt_elem is not None and excerpt_elem.text else ''

        # Clean excerpt (remove HTML if any)
        excerpt = re.sub(r'<[^>]+>', '', excerpt)
        excerpt = excerpt.strip()[:500]  # Limit to 500 chars

        slug = item.find('wp:post_name', NAMESPACES).text
        post_date = item.find('wp:post_date_gmt', NAMESPACES).text
        post_id = item.find('wp:post_id', NAMESPACES).text

        # Parse date
        try:
            published_at = datetime.strptime(post_date, '%Y-%m-%d %H:%M:%S')
        except:
            published_at = datetime.now()

        # Extract category
        category_elem = item.find('category[@domain="category"]')
        category_name = category_elem.text if category_elem is not None else None
        category_slug = category_elem.get('nicename') if category_elem is not None else None

        # Extract featured image URL from postmeta
        featured_image_url = None
        for meta in item.findall('wp:postmeta', NAMESPACES):
            meta_key = meta.find('wp:meta_key', NAMESPACES)
            if meta_key is not None and meta_key.text == '_thumbnail_id':
                # We'll need to map this ID to actual image URL later
                thumbnail_id = meta.find('wp:meta_value', NAMESPACES).text
                break

        # Extract image URLs from content
        img_pattern = r'src="(https://sullysblog\.com/wp-content/uploads/[^"]+)"'
        images_in_content = re.findall(img_pattern, content)
        image_urls.update(images_in_content)

        post_data = {
            'wordpress_id': int(post_id),
            'title': title,
            'slug': slug,
            'content': content,
            'excerpt': excerpt if excerpt else None,
            'published_at': published_at.isoformat(),
            'status': 'published',
            'category_slug': category_slug,
            'category_name': category_name
        }

        posts.append(post_data)

        # Extract comments
        for comment in item.findall('wp:comment', NAMESPACES):
            comment_id = comment.find('wp:comment_id', NAMESPACES).text
            comment_author = comment.find('wp:comment_author', NAMESPACES).text
            comment_email = comment.find('wp:comment_author_email', NAMESPACES).text
            comment_content = comment.find('wp:comment_content', NAMESPACES).text
            comment_date = comment.find('wp:comment_date_gmt', NAMESPACES).text
            comment_approved = comment.find('wp:comment_approved', NAMESPACES).text
            comment_parent = comment.find('wp:comment_parent', NAMESPACES).text

            try:
                created_at = datetime.strptime(comment_date, '%Y-%m-%d %H:%M:%S')
            except:
                created_at = datetime.now()

            comment_data = {
                'wordpress_id': int(comment_id),
                'post_wordpress_id': int(post_id),
                'author_name': comment_author,
                'author_email': comment_email,
                'content': comment_content,
                'created_at': created_at.isoformat(),
                'status': 'approved' if comment_approved == '1' else 'pending',
                'parent_wordpress_id': int(comment_parent) if comment_parent != '0' else None
            }

            comments.append(comment_data)

    print(f"Found {len(posts)} published posts")
    print(f"Found {len(comments)} comments")
    print(f"Found {len(image_urls)} unique image URLs in content")

    return {
        'categories': categories,
        'posts': posts,
        'comments': comments,
        'image_urls': list(image_urls)
    }

def import_to_supabase(data):
    """Import parsed data to Supabase"""
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    print("\n=== Starting Supabase Import ===\n")

    # 1. Import categories
    print("Importing categories...")
    category_mapping = {}  # slug -> id

    for term_id, cat_data in data['categories'].items():
        # Check if category already exists
        result = supabase.table('categories').select('id').eq('slug', cat_data['slug']).execute()

        if result.data:
            category_mapping[cat_data['slug']] = result.data[0]['id']
            print(f"  ✓ Category '{cat_data['name']}' already exists")
        else:
            result = supabase.table('categories').insert(cat_data).execute()
            category_mapping[cat_data['slug']] = result.data[0]['id']
            print(f"  ✓ Created category '{cat_data['name']}'")

    # 2. Get or create default user
    print("\nGetting default user...")
    result = supabase.table('users').select('id').eq('email', 'michael@sullysblog.com').execute()

    if result.data:
        default_user_id = result.data[0]['id']
        print(f"  ✓ Using existing user")
    else:
        user_result = supabase.table('users').insert({
            'email': 'michael@sullysblog.com',
            'name': 'Michael Sullivan',
            'role': 'admin'
        }).execute()
        default_user_id = user_result.data[0]['id']
        print(f"  ✓ Created default user")

    # 3. Import posts
    print("\nImporting posts...")
    post_mapping = {}  # wordpress_id -> uuid

    for post in data['posts']:
        # Map category
        category_id = None
        if post['category_slug'] and post['category_slug'] in category_mapping:
            category_id = category_mapping[post['category_slug']]

        post_insert = {
            'title': post['title'],
            'slug': post['slug'],
            'content': post['content'],
            'excerpt': post['excerpt'],
            'published_at': post['published_at'],
            'status': post['status'],
            'author_id': default_user_id,
            'category_id': category_id
        }

        # Check if post already exists by slug
        result = supabase.table('posts').select('id').eq('slug', post['slug']).execute()

        if result.data:
            # Update existing post
            result = supabase.table('posts').update(post_insert).eq('slug', post['slug']).execute()
            post_mapping[post['wordpress_id']] = result.data[0]['id']
            print(f"  ✓ Updated post '{post['title']}'")
        else:
            # Insert new post
            result = supabase.table('posts').insert(post_insert).execute()
            post_mapping[post['wordpress_id']] = result.data[0]['id']
            print(f"  ✓ Created post '{post['title']}'")

    # 4. Import comments
    print("\nImporting comments...")
    comment_mapping = {}  # wordpress_id -> uuid

    # First pass: Create all comments without parent relationships
    for comment in data['comments']:
        if comment['post_wordpress_id'] not in post_mapping:
            continue

        comment_insert = {
            'post_id': post_mapping[comment['post_wordpress_id']],
            'author_name': comment['author_name'],
            'author_email': comment['author_email'],
            'content': comment['content'],
            'created_at': comment['created_at'],
            'status': comment['status']
        }

        result = supabase.table('comments').insert(comment_insert).execute()
        comment_mapping[comment['wordpress_id']] = result.data[0]['id']

    print(f"  ✓ Created {len(comment_mapping)} comments")

    # Second pass: Update parent relationships
    print("  Updating comment parent relationships...")
    for comment in data['comments']:
        if comment['parent_wordpress_id'] and comment['parent_wordpress_id'] in comment_mapping:
            parent_id = comment_mapping[comment['parent_wordpress_id']]
            comment_id = comment_mapping[comment['wordpress_id']]

            supabase.table('comments').update({
                'parent_id': parent_id
            }).eq('id', comment_id).execute()

    print("\n=== Import Complete ===")
    print(f"Categories: {len(category_mapping)}")
    print(f"Posts: {len(post_mapping)}")
    print(f"Comments: {len(comment_mapping)}")

    return data['image_urls']

def save_image_urls(urls, output_file='image_urls.txt'):
    """Save image URLs to a file for later processing"""
    with open(output_file, 'w') as f:
        for url in urls:
            f.write(url + '\n')
    print(f"\nSaved {len(urls)} image URLs to {output_file}")

if __name__ == '__main__':
    XML_PATH = '/Users/michaelsullivan/Downloads/sullysblogcom.WordPress.2025-12-24.xml'

    # Parse XML
    data = parse_wordpress_xml(XML_PATH)

    # Import to Supabase
    image_urls = import_to_supabase(data)

    # Save image URLs for later processing
    save_image_urls(image_urls, '/Users/michaelsullivan/claude-projects/sullysblog-rebuild/sullysblog/scripts/image_urls.txt')

    print("\nMigration complete! Image URLs saved for later download.")
