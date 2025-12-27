#!/usr/bin/env python3
"""
Parse dictionary terms from extracted SQL
"""

import re

# Read the extracted SQL
with open('/tmp/dictionary-insert.sql', 'r', encoding='utf-8', errors='ignore') as f:
    sql = f.read()

# Find all VALUES entries using regex
# Pattern: (id,'term_name','slug',page_id,'definition',...)
pattern = r"\((\d+),'([^']+)','([^']+)',(\d+),"

matches = re.findall(pattern, sql)

print(f"\n📊 Found {len(matches)} dictionary terms:\n")

for i, (term_id, term_name, slug, page_id) in enumerate(matches, 1):
    print(f"{i}. {term_name}")
    print(f"   Slug: {slug}")
    print(f"   ID: {term_id}, Page ID: {page_id}")
    print()

print(f"\n✅ Total: {len(matches)} terms")
