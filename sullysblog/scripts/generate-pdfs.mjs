import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer';

const envContent = fs.readFileSync('.env.local', 'utf8');
const lines = envContent.split('\n');
let url, key;
for (const line of lines) {
  const trimmedLine = line.trim();
  if (trimmedLine.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = trimmedLine.split('=').slice(1).join('=').trim();
  if (trimmedLine.startsWith('SUPABASE_SERVICE_KEY=')) key = trimmedLine.split('=').slice(1).join('=').trim();
}

const supabase = createClient(url, key);

// Get posts from October 10, 2025 onwards
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

console.log(`Generating PDFs for ${posts.length} posts...\n`);

// Create output directory
const outputDir = path.join(process.cwd(), 'pdf-exports');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Launch browser
const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

for (let i = 0; i < posts.length; i++) {
  const post = posts[i];
  const date = post.published_at ? new Date(post.published_at) : new Date(post.created_at);
  const dateStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const fileDate = date.toISOString().split('T')[0];

  // Create safe filename
  const safeTitle = post.slug.replace(/[^a-z0-9-]/g, '-').substring(0, 50);
  const filename = `${fileDate}-${safeTitle}.pdf`;
  const filepath = path.join(outputDir, filename);

  console.log(`${i + 1}/${posts.length}: ${post.title}`);

  // Create HTML content
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #1a1a1a;
      padding: 60px;
      max-width: 100%;
    }

    .header {
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }

    .site-name {
      font-size: 14pt;
      color: #2563eb;
      font-weight: 600;
      margin-bottom: 20px;
    }

    h1 {
      font-size: 24pt;
      font-weight: 700;
      color: #111;
      line-height: 1.2;
      margin-bottom: 15px;
    }

    .meta {
      font-size: 11pt;
      color: #666;
    }

    .status-scheduled {
      display: inline-block;
      background: #dbeafe;
      color: #1e40af;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10pt;
      margin-left: 10px;
    }

    .content {
      font-size: 12pt;
      line-height: 1.8;
    }

    .content p {
      margin-bottom: 16px;
    }

    .content h2 {
      font-size: 18pt;
      font-weight: 700;
      margin-top: 30px;
      margin-bottom: 15px;
      color: #111;
    }

    .content h3 {
      font-size: 14pt;
      font-weight: 600;
      margin-top: 25px;
      margin-bottom: 12px;
      color: #333;
    }

    .content ul, .content ol {
      margin-bottom: 16px;
      padding-left: 30px;
    }

    .content li {
      margin-bottom: 8px;
    }

    .content blockquote {
      border-left: 4px solid #2563eb;
      padding-left: 20px;
      margin: 20px 0;
      font-style: italic;
      color: #555;
    }

    .content a {
      color: #2563eb;
      text-decoration: underline;
    }

    .content strong {
      font-weight: 600;
    }

    .content em {
      font-style: italic;
    }

    .content img {
      max-width: 100%;
      height: auto;
      margin: 20px 0;
    }

    .content pre {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
      font-family: monospace;
      font-size: 10pt;
      margin: 16px 0;
    }

    .content code {
      background: #f5f5f5;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: monospace;
      font-size: 10pt;
    }

    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 10pt;
      color: #666;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="site-name">SullysBlog.com</div>
    <h1>${post.title}</h1>
    <div class="meta">
      ${dateStr}
      ${post.status === 'scheduled' ? '<span class="status-scheduled">Scheduled</span>' : ''}
    </div>
  </div>

  <div class="content">
    ${post.content || '<p>No content available.</p>'}
  </div>

  <div class="footer">
    © ${date.getFullYear()} SullysBlog.com | https://sullysblog.com/${post.slug}
  </div>
</body>
</html>
  `;

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    await page.pdf({
      path: filepath,
      format: 'Letter',
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      },
      printBackground: true
    });

    await page.close();
  } catch (err) {
    console.error(`  Error generating PDF: ${err.message}`);
  }
}

await browser.close();

console.log(`\nDone! PDFs saved to: ${outputDir}`);
console.log(`\nFiles generated:`);
fs.readdirSync(outputDir).filter(f => f.endsWith('.pdf')).forEach(f => console.log(`  ${f}`));
