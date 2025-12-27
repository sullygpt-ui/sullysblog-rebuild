#!/usr/bin/env python3
"""
Migrate WordPress featured images (thumbnails) to Supabase Storage
"""

from lxml import etree as ET
import os
import re
import requests
from pathlib import Path
from supabase import create_client
from dotenv import load_dotenv
from urllib.parse import urlparse
import time

# Load environment variables
load_dotenv('.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
BUCKET_NAME = 'blog-images'
XML_PATH = '/Users/michaelsullivan/Downloads/sullysblogcom.WordPress.2025-12-24.xml'

# WordPress XML namespaces
NAMESPACES = {
    'wp': 'http://wordpress.org/export/1.2/',
    'content': 'http://purl.org/rss/1.0/modules/content/',
}

def parse_attachments_from_xml():
    """Parse WordPress XML to extract attachment URLs"""
    print("Parsing WordPress XML for attachments...")

    parser = ET.XMLParser(recover=True, encoding='utf-8')
    tree = ET.parse(XML_PATH, parser)
    root = tree.getroot()
    channel = root.find('channel')

    # Map of attachment ID -> image URL
    attachment_map = {}

    for item in channel.findall('item'):
        # Only process attachments (images)
        post_type = item.find('wp:post_type', NAMESPACES)
        if post_type is None or post_type.text != 'attachment':
            continue

        # Get attachment ID
        post_id_elem = item.find('wp:post_id', NAMESPACES)
        if post_id_elem is None:
            continue

        attachment_id = post_id_elem.text

        # Get attachment URL
        attachment_url_elem = item.find('wp:attachment_url', NAMESPACES)
        if attachment_url_elem is not None and attachment_url_elem.text:
            attachment_map[attachment_id] = attachment_url_elem.text

    print(f"Found {len(attachment_map)} attachments")
    return attachment_map

def parse_post_thumbnails():
    """Parse WordPress XML to get post -> thumbnail ID mappings"""
    print("Parsing post thumbnail mappings...")

    parser = ET.XMLParser(recover=True, encoding='utf-8')
    tree = ET.parse(XML_PATH, parser)
    root = tree.getroot()
    channel = root.find('channel')

    # Map of wordpress post ID -> thumbnail attachment ID
    thumbnail_map = {}

    for item in channel.findall('item'):
        # Only process posts
        post_type = item.find('wp:post_type', NAMESPACES)
        if post_type is None or post_type.text != 'post':
            continue

        # Get post ID
        post_id_elem = item.find('wp:post_id', NAMESPACES)
        if post_id_elem is None:
            continue

        post_id = post_id_elem.text

        # Look for _thumbnail_id in postmeta
        for meta in item.findall('wp:postmeta', NAMESPACES):
            meta_key = meta.find('wp:meta_key', NAMESPACES)
            if meta_key is not None and meta_key.text == '_thumbnail_id':
                meta_value = meta.find('wp:meta_value', NAMESPACES)
                if meta_value is not None and meta_value.text:
                    thumbnail_map[post_id] = meta_value.text
                    break

    print(f"Found {len(thumbnail_map)} posts with featured images")
    return thumbnail_map

def download_image(url, local_path):
    """Download image from URL to local path"""
    try:
        response = requests.get(url, timeout=30, stream=True)
        response.raise_for_status()

        # Create directory if it doesn't exist
        local_path.parent.mkdir(parents=True, exist_ok=True)

        # Save image
        with open(local_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        return True
    except Exception as e:
        print(f"  ✗ Failed to download {url}: {e}")
        return False

def upload_to_supabase(supabase, local_path, storage_path):
    """Upload image to Supabase Storage"""
    try:
        with open(local_path, 'rb') as f:
            file_data = f.read()

        # Check if file already exists
        try:
            existing = supabase.storage.from_(BUCKET_NAME).list(str(Path(storage_path).parent))
            file_name = Path(storage_path).name
            if any(f['name'] == file_name for f in existing):
                # File exists, just return the URL
                return True
        except:
            pass

        # Upload file
        supabase.storage.from_(BUCKET_NAME).upload(
            storage_path,
            file_data,
            file_options={"content-type": get_content_type(local_path)}
        )

        return True
    except Exception as e:
        if 'already exists' in str(e):
            return True
        print(f"  ✗ Failed to upload {storage_path}: {e}")
        return False

def get_content_type(file_path):
    """Get content type based on file extension"""
    ext = file_path.suffix.lower()
    types = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml'
    }
    return types.get(ext, 'application/octet-stream')

def get_public_url(supabase, storage_path):
    """Get public URL for uploaded image"""
    result = supabase.storage.from_(BUCKET_NAME).get_public_url(storage_path)
    return result

def main():
    print("=== Featured Image Migration ===\n")

    # Initialize Supabase
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Parse XML for attachments and thumbnails
    attachment_map = parse_attachments_from_xml()
    thumbnail_map = parse_post_thumbnails()

    # Get all posts from database
    print("\nFetching posts from database...")
    result = supabase.table('posts').select('id, wordpress_id, slug, title').execute()
    posts = result.data
    print(f"Found {len(posts)} posts in database")

    # Create mapping of wordpress_id -> post
    posts_by_wp_id = {str(p['wordpress_id']): p for p in posts if p['wordpress_id']}

    # Create temp directory for downloads
    temp_dir = Path('temp_featured_images')
    temp_dir.mkdir(exist_ok=True)

    print(f"\n=== Processing Featured Images ===\n")

    success_count = 0
    fail_count = 0
    skip_count = 0

    for wp_post_id, thumbnail_id in thumbnail_map.items():
        # Check if we have this attachment
        if thumbnail_id not in attachment_map:
            skip_count += 1
            continue

        # Check if we have this post in our database
        if wp_post_id not in posts_by_wp_id:
            skip_count += 1
            continue

        post = posts_by_wp_id[wp_post_id]
        attachment_url = attachment_map[thumbnail_id]

        print(f"[{success_count + fail_count + 1}] Processing: {post['title'][:50]}")
        print(f"  Image: {attachment_url}")

        # Parse URL to get path
        parsed = urlparse(attachment_url)
        match = re.search(r'/wp-content/uploads/(.+)$', parsed.path)
        if not match:
            print(f"  ✗ Could not parse path")
            fail_count += 1
            continue

        relative_path = match.group(1)
        local_path = temp_dir / relative_path

        # Download image
        if download_image(attachment_url, local_path):
            # Upload to Supabase
            if upload_to_supabase(supabase, local_path, relative_path):
                # Get public URL
                new_url = get_public_url(supabase, relative_path)

                # Update post in database
                supabase.table('posts').update({
                    'featured_image_url': new_url
                }).eq('id', post['id']).execute()

                print(f"  ✓ Updated successfully")
                success_count += 1
            else:
                fail_count += 1
        else:
            fail_count += 1

        # Small delay to avoid overwhelming servers
        time.sleep(0.3)

    print(f"\n=== Migration Complete ===")
    print(f"✓ Success: {success_count}")
    print(f"✗ Failed: {fail_count}")
    print(f"○ Skipped: {skip_count}")
    print(f"\nTotal posts with featured images: {success_count}")

    # Clean up temp directory
    print("\nCleaning up temporary files...")
    import shutil
    shutil.rmtree(temp_dir)
    print("✓ Cleanup complete")

if __name__ == '__main__':
    main()
