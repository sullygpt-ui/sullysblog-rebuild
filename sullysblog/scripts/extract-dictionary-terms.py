#!/usr/bin/env python3
"""
Extract dictionary terms from WordPress SQL backup
"""

import re
import json

# Path to SQL file
SQL_FILE = '/Users/michaelsullivan/claude-projects/SullysBlog-122225-backup/backup.sql'

print("Extracting dictionary terms from WordPress backup...")

# Read the SQL file and find the dictionary table INSERT
with open(SQL_FILE, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Find the INSERT statement for domain_dictionary table
pattern = r"INSERT INTO `wp_5sn88nclkq_domain_dictionary` VALUES (.*?);"
match = re.search(pattern, content, re.DOTALL)

if not match:
    print("❌ Could not find dictionary INSERT statement")
    exit(1)

insert_data = match.group(1)

# Split by ),( to get individual records
# We need to be careful with the HTML content that might contain ),(
records = []
current_record = ""
paren_depth = 0
in_string = False
escape_next = False

for char in insert_data:
    if escape_next:
        current_record += char
        escape_next = False
        continue

    if char == '\\':
        escape_next = True
        current_record += char
        continue

    if char == "'" and not escape_next:
        in_string = not in_string

    if not in_string:
        if char == '(':
            paren_depth += 1
        elif char == ')':
            paren_depth -= 1
            if paren_depth == 0:
                # End of a record
                records.append(current_record)
                current_record = ""
                continue

    if paren_depth > 0:
        current_record += char

print(f"\n📊 Found {len(records)} dictionary terms\n")

# Parse each record to extract: id, term_name, slug, page_id, full_definition
terms = []
for i, record in enumerate(records, 1):
    # Split by comma, but be careful with commas in strings
    parts = []
    current_part = ""
    in_string = False
    escape_next = False

    for char in record:
        if escape_next:
            current_part += char
            escape_next = False
            continue

        if char == '\\':
            escape_next = True
            current_part += char
            continue

        if char == "'":
            in_string = not in_string
            current_part += char
            continue

        if char == ',' and not in_string:
            parts.append(current_part.strip())
            current_part = ""
            continue

        current_part += char

    if current_part:
        parts.append(current_part.strip())

    if len(parts) >= 5:
        # Extract values (remove quotes)
        term_id = parts[0]
        term_name = parts[1].strip("'")
        slug = parts[2].strip("'")
        page_id = parts[3]
        full_definition = parts[4].strip("'")

        # Create short definition (first 150 chars of text content)
        # Strip HTML for short definition
        short_def = re.sub(r'<[^>]+>', '', full_definition)
        short_def = re.sub(r'\s+', ' ', short_def).strip()
        short_def = short_def[:150] + "..." if len(short_def) > 150 else short_def

        terms.append({
            'term': term_name,
            'slug': slug,
            'short_definition': short_def,
            'full_definition': full_definition,
            'wordpress_page_id': int(page_id) if page_id.isdigit() else None
        })

        print(f"{i}. {term_name}")
        print(f"   Slug: {slug}")
        print(f"   Short def: {short_def[:80]}...")
        print()

# Save to JSON file
output_file = 'scripts/dictionary-terms.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(terms, f, indent=2, ensure_ascii=False)

print(f"\n✅ Extracted {len(terms)} terms")
print(f"📁 Saved to: {output_file}")
print(f"\nReady to import to Supabase!")
