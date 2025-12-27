import http from 'http';

const BASE_URL = 'http://localhost:3000';

const testCases = [
  // Post redirects (trailing slash)
  { url: '/one-habit-that-will-make-you-a-better-domainer-in-2026/', expected: '/one-habit-that-will-make-you-a-better-domainer-in-2026' },
  { url: '/you-need-to-understand-how-people-search/', expected: '/you-need-to-understand-how-people-search' },

  // Category redirects
  { url: '/category/domains/', expected: '/category/domains' },
  { url: '/category/domaining/', expected: '/category/domaining' },

  // Dictionary redirects (if they existed in WordPress)
  { url: '/domain-name-dictionary/premium-domain/', expected: '/domain-name-dictionary/premium-domain' },

  // Feed redirects
  { url: '/feed/', expected: '/rss.xml' }, // Will redirect twice: /feed/ -> /feed -> /rss.xml
  { url: '/feed', expected: '/rss.xml' },
];

console.log('🧪 Testing redirects...\n');

let passedTests = 0;
let failedTests = 0;

for (const test of testCases) {
  const testUrl = BASE_URL + test.url;

  await new Promise((resolve) => {
    http.get(testUrl, (res) => {
      // Follow redirects manually to get final destination
      let finalLocation = res.headers.location;

      if (res.statusCode === 308 || res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307) {
        // Check if we reached the expected destination (or an intermediate step toward it)
        const locationMatch = finalLocation === test.expected ||
                              (test.expected === '/rss.xml' && finalLocation === '/feed');

        if (locationMatch || finalLocation === test.expected) {
          console.log(`✅ ${test.url}`);
          console.log(`   → ${finalLocation}`);
          passedTests++;
        } else {
          console.log(`❌ ${test.url}`);
          console.log(`   Expected: ${test.expected}`);
          console.log(`   Got: ${finalLocation}`);
          failedTests++;
        }
      } else if (res.statusCode === 200) {
        console.log(`⚠️  ${test.url} returned 200 (no redirect)`);
        failedTests++;
      } else {
        console.log(`❌ ${test.url} returned ${res.statusCode}`);
        failedTests++;
      }

      resolve();
    }).on('error', (err) => {
      console.log(`❌ ${test.url} - Error: ${err.message}`);
      failedTests++;
      resolve();
    });
  });
}

console.log(`\n📊 Results: ${passedTests}/${testCases.length} passed`);
if (failedTests > 0) {
  console.log(`❌ ${failedTests} tests failed`);
  process.exit(1);
} else {
  console.log('✅ All tests passed!');
}
