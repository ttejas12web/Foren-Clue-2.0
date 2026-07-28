import { initializeApp } from 'firebase/app';
import { getFirestore, getDocs, collection } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateSitemap() {
  console.log('Generating dynamic case sitemap.xml...');

  try {
    // Read Firebase Config
    const configPath = path.resolve(__dirname, '../firebase-applet-config.json');
    if (!fs.existsSync(configPath)) {
        console.warn("No firebase-applet-config.json found! Skipping sitemap generation.");
        process.exit(0);
    }
    
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    
    // Initialize Firebase
    const app = initializeApp(config);
    const db = getFirestore(app, config.firestoreDatabaseId);

    const baseUrl = 'https://www.forenclue.in';
    const currentIsoDate = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
    xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    // Static pages configurations
    const staticPages = [
      { path: '/', priority: '1.0', changefreq: 'daily' },
      { path: '/about', priority: '0.8', changefreq: 'monthly' },
      { path: '/courses', priority: '0.9', changefreq: 'daily' },
      { path: '/cases', priority: '0.9', changefreq: 'daily' },
      { path: '/careers', priority: '0.7', changefreq: 'weekly' },
      { path: '/community', priority: '0.8', changefreq: 'daily' },
      { path: '/services', priority: '0.8', changefreq: 'weekly' },
      { path: '/ebooks', priority: '0.9', changefreq: 'daily' },
      { path: '/contact', priority: '0.8', changefreq: 'monthly' },
      { path: '/privacy', priority: '0.3', changefreq: 'monthly' },
      { path: '/terms', priority: '0.3', changefreq: 'monthly' },
      { path: '/podcast', priority: '0.8', changefreq: 'weekly' },
      { path: '/certificate', priority: '0.8', changefreq: 'monthly' },
      { path: '/webinar', priority: '0.8', changefreq: 'weekly' },
      { path: '/volunteers', priority: '0.7', changefreq: 'monthly' },
      { path: '/ambassadors', priority: '0.7', changefreq: 'monthly' },
      { path: '/simulations', priority: '0.8', changefreq: 'weekly' },
      { path: '/simulations/microscope', priority: '0.8', changefreq: 'weekly' },
      { path: '/simulations/spectrophotometer', priority: '0.8', changefreq: 'weekly' },
      { path: '/quizzes', priority: '0.8', changefreq: 'daily' },
    ];

    staticPages.forEach((page) => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${page.path}</loc>\n`;
      xml += `    <lastmod>${currentIsoDate}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    // 1. Dynamic Cases
    let casesFound = 0;
    try {
      const querySnapshot = await getDocs(collection(db, "cases"));
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === 'draft') return;
        casesFound++;

        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/cases?case=${doc.id}</loc>\n`;
        xml += `    <lastmod>${currentIsoDate}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;

        // Main image
        if (data.image) {
          xml += `    <image:image>\n`;
          const safeUrl = data.image.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          xml += `      <image:loc>${safeUrl}</image:loc>\n`;
          if (data.title) {
              const safeTitle = data.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
              xml += `      <image:title>${safeTitle}</image:title>\n`;
          }
          xml += `    </image:image>\n`;
        }

        // Content images
        if (Array.isArray(data.contentImages)) {
          data.contentImages.forEach((img) => {
            let url = "";
            let caption = "";
            if (typeof img === 'string') {
              url = img;
            } else if (img && img.url) {
              url = img.url;
              caption = img.caption || "";
            }

            if (url) {
              xml += `    <image:image>\n`;
              const safeUrl = url.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
              xml += `      <image:loc>${safeUrl}</image:loc>\n`;
              if (caption) {
                  const safeCaption = caption.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                  xml += `      <image:caption>${safeCaption}</image:caption>\n`;
              } else if (data.title) {
                  const safeTitle = data.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                  xml += `      <image:title>${safeTitle} - Case File Evidence</image:title>\n`;
              }
              xml += `    </image:image>\n`;
            }
          });
        }
        xml += `  </url>\n`;
      });
      console.log(`- Loaded ${casesFound} dynamic case study pages.`);
    } catch (err) {
      console.warn("Could not load dynamic cases for sitemap:", err.message || err);
    }

    // 2. Dynamic Courses
    let coursesFound = 0;
    try {
      const querySnapshot = await getDocs(collection(db, "courses"));
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        coursesFound++;
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/courses?id=${doc.id}</loc>\n`;
        xml += `    <lastmod>${currentIsoDate}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;

        const courseImg = data.thumbnail || data.image;
        if (courseImg) {
          xml += `    <image:image>\n`;
          const safeUrl = courseImg.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          xml += `      <image:loc>${safeUrl}</image:loc>\n`;
          if (data.title) {
            const safeTitle = data.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            xml += `      <image:title>${safeTitle}</image:title>\n`;
          }
          xml += `    </image:image>\n`;
        }
        xml += `  </url>\n`;
      });
      console.log(`- Loaded ${coursesFound} dynamic course pages.`);
    } catch (err) {
      console.warn("Could not load dynamic courses for sitemap:", err.message || err);
    }

    // 3. Dynamic eBooks
    let ebooksFound = 0;
    try {
      const querySnapshot = await getDocs(collection(db, "ebooks"));
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        ebooksFound++;
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/ebooks?id=${doc.id}</loc>\n`;
        xml += `    <lastmod>${currentIsoDate}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;

        const ebookImg = data.image || data.coverImage;
        if (ebookImg) {
          xml += `    <image:image>\n`;
          const safeUrl = ebookImg.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          xml += `      <image:loc>${safeUrl}</image:loc>\n`;
          if (data.title) {
            const safeTitle = data.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            xml += `      <image:title>${safeTitle}</image:title>\n`;
          }
          xml += `    </image:image>\n`;
        }
        xml += `  </url>\n`;
      });
      console.log(`- Loaded ${ebooksFound} dynamic ebook pages.`);
    } catch (err) {
      console.warn("Could not load dynamic ebooks for sitemap:", err.message || err);
    }

    // 4. Dynamic Quizzes
    let quizzesFound = 0;
    try {
      const querySnapshot = await getDocs(collection(db, "quizzes"));
      querySnapshot.forEach((doc) => {
        quizzesFound++;
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/quizzes/${doc.id}</loc>\n`;
        xml += `    <lastmod>${currentIsoDate}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `  </url>\n`;
      });
      console.log(`- Loaded ${quizzesFound} dynamic quiz pages.`);
    } catch (err) {
      console.warn("Could not load dynamic quizzes for sitemap:", err.message || err);
    }

    xml += `</urlset>`;

    const publicDir = path.resolve(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);
    console.log(`✅ successfully generated sitemap.xml with ${staticPages.length} static pages and ${casesFound + coursesFound + ebooksFound + quizzesFound} dynamic pages`);

    process.exit(0);

  } catch (error) {
    console.warn("Failed to generate sitemap:", error.message || error);
    process.exit(0);
  }
}

generateSitemap();
