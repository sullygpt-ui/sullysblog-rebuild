#!/usr/bin/env python3
"""
Download images from WordPress and upload to Supabase Storage
"""

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

def create_storage_bucket(supabase):
    """Create Supabase storage bucket if it doesn't exist"""
    try:
        # Try to get bucket info
        supabase.storage.get_bucket(BUCKET_NAME)
        print(f"✓ Bucket '{BUCKET_NAME}' already exists")
    except:
        # Create bucket with public access
        try:
            supabase.storage.create_bucket(
                BUCKET_NAME,
                options={"public": True}
            )
            print(f"✓ Created bucket '{BUCKET_NAME}'")
        except Exception as e:
            print(f"Error creating bucket: {e}")
            print("Please create the bucket manually in Supabase dashboard")
            return False
    return True

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

        # Upload file
        supabase.storage.from_(BUCKET_NAME).upload(
            storage_path,
            file_data,
            file_options={"content-type": get_content_type(local_path)}
        )

        return True
    except Exception as e:
        # If file exists, try to update it
        if 'already exists' in str(e):
            try:
                supabase.storage.from_(BUCKET_NAME).update(
                    storage_path,
                    file_data,
                    file_options={"content-type": get_content_type(local_path)}
                )
                return True
            except:
                pass
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

def update_post_content(supabase, url_mapping):
    """Update all posts with new image URLs"""
    print("\nUpdating post content with new URLs...")

    # Get all posts
    posts = supabase.table('posts').select('id, content').execute()

    updated_count = 0
    for post in posts.data:
        content = post['content']
        original_content = content

        # Replace all old URLs with new ones
        for old_url, new_url in url_mapping.items():
            if old_url in content:
                content = content.replace(old_url, new_url)

        # Update if content changed
        if content != original_content:
            supabase.table('posts').update({
                'content': content
            }).eq('id', post['id']).execute()
            updated_count += 1

    print(f"✓ Updated {updated_count} posts with new image URLs")

def main():
    print("=== Image Migration to Supabase Storage ===\n")

    # Initialize Supabase
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Create storage bucket
    if not create_storage_bucket(supabase):
        return

    # Read image URLs
    image_urls_file = Path('scripts/image_urls.txt')
    if not image_urls_file.exists():
        print("Error: image_urls.txt not found")
        return

    with open(image_urls_file, 'r') as f:
        urls = [line.strip() for line in f if line.strip()]

    print(f"\nFound {len(urls)} images to migrate\n")

    # Create temp directory for downloads
    temp_dir = Path('temp_images')
    temp_dir.mkdir(exist_ok=True)

    url_mapping = {}
    success_count = 0
    fail_count = 0

    for i, url in enumerate(urls, 1):
        print(f"[{i}/{len(urls)}] Processing {url}")

        # Parse URL to get path
        parsed = urlparse(url)
        # Extract path after /wp-content/uploads/
        match = re.search(r'/wp-content/uploads/(.+)$', parsed.path)
        if not match:
            print(f"  ✗ Could not parse path from URL")
            fail_count += 1
            continue

        relative_path = match.group(1)
        local_path = temp_dir / relative_path

        # Download image
        if download_image(url, local_path):
            # Upload to Supabase
            if upload_to_supabase(supabase, local_path, relative_path):
                # Get public URL
                new_url = get_public_url(supabase, relative_path)
                url_mapping[url] = new_url
                print(f"  ✓ Uploaded successfully")
                success_count += 1
            else:
                fail_count += 1
        else:
            fail_count += 1

        # Small delay to avoid overwhelming servers
        time.sleep(0.5)

    print(f"\n=== Download/Upload Summary ===")
    print(f"✓ Success: {success_count}")
    print(f"✗ Failed: {fail_count}")

    # Update post content with new URLs
    if url_mapping:
        update_post_content(supabase, url_mapping)

    print(f"\n=== Migration Complete ===")
    print(f"Bucket: {BUCKET_NAME}")
    print(f"Images uploaded: {success_count}")
    print(f"Posts updated: Check blog to verify")

    # Clean up temp directory
    print("\nCleaning up temporary files...")
    import shutil
    shutil.rmtree(temp_dir)
    print("✓ Cleanup complete")

if __name__ == '__main__':
    main()
