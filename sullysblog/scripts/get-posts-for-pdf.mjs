import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envContent = fs.readFileSync('.env.local', 'utf8');
const lines = envContent.split('\n');
let url, key;
for (const line of lines) {
  const trimmedLine = line.trim();
  if (trimmedLine.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = trimmedLine.split('=').slice(1).join('=').trim();
  if (trimmedLine.startsWith('SUPABASE_SERVICE_KEY=')) key = trimmedLine.split('=').slice(1).join('=').trim();
}

const supabase = createClient(url, key);

// Get posts from October 10, 2025 onwards (published and scheduled)
const { data: posts, error } = await supabase
  .from('posts')
  .select('id, title, slug, content, excerpt, status, published_at, created_at')
  .in('status', ['published', 'scheduled'])
  .gte('published_at', '2025-10-10T00:00:00.000Z')
  .order('published_at', { ascending: true });

if (error) {
  console.error('Error:', error);
  process.exit(1);
}

console.log(`Found ${posts.length} posts from October 10, 2025 onwards:\n`);
posts.forEach((post, i) => {
  const date = post.published_at ? new Date(post.published_at).toLocaleDateString() : 'No date';
  console.log(`${i + 1}. [${post.status}] ${date} - ${post.title}`);
});

// Export for use in PDF generation
export { posts };
