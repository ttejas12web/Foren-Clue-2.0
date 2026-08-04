import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const REQUIRED_OG_FILES = [
  'home.png',
  'case-studies.png',
  'cases.png',
  'courses.png',
  'colleges.png',
  'college.png',
  'services.png',
  'community.png',
  'resources.png',
  'quiz.png',
  'quizzes.png',
  'library.png',
  'ebooks.png',
  'podcast.png',
  'webinars.png',
  'webinar.png',
  'simulation.png',
  'simulations.png',
  'microscope.png',
  'spectrophotometer.png',
  'certificate.png',
  'idcard.png',
  'employees.png',
  'team.png',
  'volunteers.png',
  'ambassador.png',
  'ambassadors.png',
  'about.png',
  'careers.png',
  'contact.png',
  'privacy.png',
  'terms.png',
  'login.png',
  'dashboard.png',
  'profile.png'
];

const ROUTES_TO_TEST = [
  '/',
  '/cases',
  '/courses',
  '/colleges',
  '/college',
  '/services',
  '/community',
  '/resources',
  '/quizzes',
  '/library',
  '/podcast',
  '/webinars',
  '/simulations',
  '/simulations/microscope',
  '/simulations/spectrophotometer',
  '/certificate',
  '/idcard',
  '/team',
  '/volunteers',
  '/ambassadors',
  '/about',
  '/careers',
  '/contact',
  '/privacy',
  '/terms',
  '/login',
  '/dashboard'
];

async function fetchRouteHTML(routePath, port = 3000) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:${port}${routePath}`, {
      headers: {
        'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', err => reject(err));
    req.setTimeout(3000, () => {
      req.destroy();
      reject(new Error('Timeout fetching route'));
    });
  });
}

async function runVerification() {
  console.log('====================================================');
  console.log('  🔍 ForenClue OG Image & Absolute Meta Verification');
  console.log('====================================================\n');

  let errorsCount = 0;

  // 1. Check physical existence of OG image files in /public/images/og/
  console.log('📁 1. Checking physical files in /public/images/og/...');
  const ogDir = path.join(rootDir, 'public', 'images', 'og');

  if (!fs.existsSync(ogDir)) {
    console.error(`❌ Directory not found: ${ogDir}`);
    errorsCount++;
  } else {
    for (const filename of REQUIRED_OG_FILES) {
      const filePath = path.join(ogDir, filename);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log(`  ✓ /public/images/og/${filename} (${stats.size} bytes)`);
      } else {
        console.error(`  ❌ Missing: /public/images/og/${filename}`);
        errorsCount++;
      }
    }
  }

  console.log('\n🌐 2. Testing HTTP route metadata for absolute URL og:image tags...');
  
  for (const route of ROUTES_TO_TEST) {
    try {
      const html = await fetchRouteHTML(route);
      
      // Extract og:image content
      const ogMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i) ||
                      html.match(/<meta\s+content="([^"]+)"\s+property="og:image"/i);

      if (!ogMatch || !ogMatch[1]) {
        console.error(`  ❌ [${route}] Missing og:image meta tag!`);
        errorsCount++;
        continue;
      }

      const imageUrl = ogMatch[1];
      const isAbsolute = imageUrl.startsWith('http://') || imageUrl.startsWith('https://');

      if (!isAbsolute) {
        console.error(`  ❌ [${route}] og:image is relative, not absolute: "${imageUrl}"`);
        errorsCount++;
      } else {
        console.log(`  ✓ [${route}] -> og:image absolute URL: ${imageUrl}`);
      }

    } catch (err) {
      console.warn(`  ⚠️ Could not fetch route http://localhost:3000${route}: ${err.message}`);
    }
  }

  console.log('\n====================================================');
  if (errorsCount === 0) {
    console.log('✅ ALL OG IMAGES EXIST & ALL OG META TAGS ARE ABSOLUTE URLs!');
    console.log('====================================================\n');
    process.exit(0);
  } else {
    console.error(`❌ Verification completed with ${errorsCount} error(s).`);
    console.log('====================================================\n');
    process.exit(1);
  }
}

runVerification();
