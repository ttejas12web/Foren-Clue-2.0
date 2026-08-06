import { initializeApp } from 'firebase/app';
import { getFirestore, getDocs, collection } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function escapeCdata(text) {
  if (!text) return '';
  return String(text).replace(/\]\]>/g, ']]&gt;');
}

function formatDate(dateInput) {
  if (!dateInput) return new Date().toUTCString();
  const d = new Date(dateInput);
  return isNaN(d.getTime()) ? new Date().toUTCString() : d.toUTCString();
}

async function generateRssFeed() {
  console.log('Generating RSS 2.0 Feed (/rss.xml)...');

  const baseUrl = 'https://www.forenclue.in';
  const nowUtc = new Date().toUTCString();

  let itemsXml = '';
  let totalItems = 0;

  try {
    const configPath = path.resolve(__dirname, '../firebase-applet-config.json');
    let db = null;
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      const app = initializeApp(config);
      db = getFirestore(app, config.firestoreDatabaseId);
    }

    // 1. Fetch Cases
    if (db) {
      try {
        const casesSnap = await getDocs(collection(db, "cases"));
        casesSnap.forEach((doc) => {
          const data = doc.data();
          if (data.status === 'draft') return;
          totalItems++;
          const title = data.title || 'Forensic Case Analysis';
          const link = `${baseUrl}/cases?case=${doc.id}`;
          const description = data.summary || data.description || 'Forensic investigation case analysis and findings.';
          const category = data.category || 'Case Study';
          const pubDate = formatDate(data.createdAt || data.date);
          const imageUrl = data.image || data.thumbnail;

          itemsXml += `    <item>\n`;
          itemsXml += `      <title><![CDATA[${escapeCdata(title)}]]></title>\n`;
          itemsXml += `      <link>${link}</link>\n`;
          itemsXml += `      <guid isPermaLink="true">${link}</guid>\n`;
          itemsXml += `      <pubDate>${pubDate}</pubDate>\n`;
          itemsXml += `      <description><![CDATA[${escapeCdata(description)}]]></description>\n`;
          itemsXml += `      <category><![CDATA[${escapeCdata(category)}]]></category>\n`;
          if (imageUrl) {
            itemsXml += `      <enclosure url="${imageUrl.replace(/&/g, '&amp;')}" length="0" type="image/jpeg" />\n`;
          }
          itemsXml += `    </item>\n`;
        });
      } catch (err) {
        console.warn("Could not fetch cases for RSS:", err.message);
      }
    }

    // 2. Fetch Courses
    if (db) {
      try {
        const coursesSnap = await getDocs(collection(db, "courses"));
        coursesSnap.forEach((doc) => {
          const data = doc.data();
          totalItems++;
          const title = data.title || 'Forensic Course';
          const link = `${baseUrl}/courses?id=${doc.id}`;
          const description = data.description || 'Professional forensic science certification course on ForenClue.';
          const category = data.category || 'Courses';
          const pubDate = formatDate(data.createdAt || data.date);
          const imageUrl = data.thumbnail || data.image;

          itemsXml += `    <item>\n`;
          itemsXml += `      <title><![CDATA[${escapeCdata(title)}]]></title>\n`;
          itemsXml += `      <link>${link}</link>\n`;
          itemsXml += `      <guid isPermaLink="true">${link}</guid>\n`;
          itemsXml += `      <pubDate>${pubDate}</pubDate>\n`;
          itemsXml += `      <description><![CDATA[${escapeCdata(description)}]]></description>\n`;
          itemsXml += `      <category><![CDATA[${escapeCdata(category)}]]></category>\n`;
          if (imageUrl) {
            itemsXml += `      <enclosure url="${imageUrl.replace(/&/g, '&amp;')}" length="0" type="image/jpeg" />\n`;
          }
          itemsXml += `    </item>\n`;
        });
      } catch (err) {
        console.warn("Could not fetch courses for RSS:", err.message);
      }
    }

    // 3. Fetch EBooks
    if (db) {
      try {
        const ebooksSnap = await getDocs(collection(db, "ebooks"));
        ebooksSnap.forEach((doc) => {
          const data = doc.data();
          totalItems++;
          const title = data.title || 'Forensic E-Book & Magazine';
          const link = `${baseUrl}/ebooks?id=${doc.id}`;
          const description = data.description || data.summary || 'Forensic science literature and research e-books on ForenClue.';
          const category = data.category || 'E-Books';
          const pubDate = formatDate(data.createdAt || data.date);
          const imageUrl = data.image || data.coverImage;

          itemsXml += `    <item>\n`;
          itemsXml += `      <title><![CDATA[${escapeCdata(title)}]]></title>\n`;
          itemsXml += `      <link>${link}</link>\n`;
          itemsXml += `      <guid isPermaLink="true">${link}</guid>\n`;
          itemsXml += `      <pubDate>${pubDate}</pubDate>\n`;
          itemsXml += `      <description><![CDATA[${escapeCdata(description)}]]></description>\n`;
          itemsXml += `      <category><![CDATA[${escapeCdata(category)}]]></category>\n`;
          if (imageUrl) {
            itemsXml += `      <enclosure url="${imageUrl.replace(/&/g, '&amp;')}" length="0" type="image/jpeg" />\n`;
          }
          itemsXml += `    </item>\n`;
        });
      } catch (err) {
        console.warn("Could not fetch ebooks for RSS:", err.message);
      }
    }

    // 4. Fetch Podcasts
    if (db) {
      try {
        const podcastsSnap = await getDocs(collection(db, "podcasts"));
        podcastsSnap.forEach((doc) => {
          const data = doc.data();
          totalItems++;
          const title = data.title || 'The ForenClue Podcast Episode';
          const link = `${baseUrl}/podcast`;
          const description = data.description || 'Deep dive into forensic science, crime scene investigation, and digital forensics.';
          const category = 'Podcast';
          const pubDate = formatDate(data.date || data.createdAt);
          const imageUrl = data.image || data.thumbnail || `${baseUrl}/og/podcast.png`;

          itemsXml += `    <item>\n`;
          itemsXml += `      <title><![CDATA[${escapeCdata(title)}]]></title>\n`;
          itemsXml += `      <link>${link}</link>\n`;
          itemsXml += `      <guid isPermaLink="false">podcast-${doc.id}</guid>\n`;
          itemsXml += `      <pubDate>${pubDate}</pubDate>\n`;
          itemsXml += `      <description><![CDATA[${escapeCdata(description)}]]></description>\n`;
          itemsXml += `      <category><![CDATA[${escapeCdata(category)}]]></category>\n`;
          if (imageUrl) {
            itemsXml += `      <enclosure url="${imageUrl.replace(/&/g, '&amp;')}" length="0" type="image/jpeg" />\n`;
          }
          itemsXml += `    </item>\n`;
        });
      } catch (err) {
        console.warn("Could not fetch podcasts for RSS:", err.message);
      }
    }

    // 5. Fetch Webinars
    if (db) {
      try {
        const webinarsSnap = await getDocs(collection(db, "webinars"));
        webinarsSnap.forEach((doc) => {
          const data = doc.data();
          totalItems++;
          const title = data.title || 'Forensic Science Webinar';
          const link = `${baseUrl}/webinar`;
          const description = data.description || 'Interactive masterclass and expert-led forensic webinar.';
          const category = 'Webinar';
          const pubDate = formatDate(data.date || data.createdAt);

          itemsXml += `    <item>\n`;
          itemsXml += `      <title><![CDATA[${escapeCdata(title)}]]></title>\n`;
          itemsXml += `      <link>${link}</link>\n`;
          itemsXml += `      <guid isPermaLink="false">webinar-${doc.id}</guid>\n`;
          itemsXml += `      <pubDate>${pubDate}</pubDate>\n`;
          itemsXml += `      <description><![CDATA[${escapeCdata(description)}]]></description>\n`;
          itemsXml += `      <category><![CDATA[${escapeCdata(category)}]]></category>\n`;
          itemsXml += `    </item>\n`;
        });
      } catch (err) {
        console.warn("Could not fetch webinars for RSS:", err.message);
      }
    }

    // Default static items if total dynamic items are zero or low
    if (totalItems === 0) {
      itemsXml += `    <item>\n`;
      itemsXml += `      <title><![CDATA[Introduction to Forensic Science]]></title>\n`;
      itemsXml += `      <link>${baseUrl}/courses?id=1</link>\n`;
      itemsXml += `      <guid isPermaLink="true">${baseUrl}/courses?id=1</guid>\n`;
      itemsXml += `      <pubDate>${nowUtc}</pubDate>\n`;
      itemsXml += `      <description><![CDATA[Master the fundamentals of forensic science, physical evidence handling, crime scene analysis, and lab techniques on ForenClue.]]></description>\n`;
      itemsXml += `      <category><![CDATA[Courses]]></category>\n`;
      itemsXml += `    </item>\n`;

      itemsXml += `    <item>\n`;
      itemsXml += `      <title><![CDATA[Digital Forensics & Incident Response]]></title>\n`;
      itemsXml += `      <link>${baseUrl}/courses?id=2</link>\n`;
      itemsXml += `      <guid isPermaLink="true">${baseUrl}/courses?id=2</guid>\n`;
      itemsXml += `      <pubDate>${nowUtc}</pubDate>\n`;
      itemsXml += `      <description><![CDATA[Learn digital evidence collection, file system analysis, network traffic forensics, and malware incident response.]]></description>\n`;
      itemsXml += `      <category><![CDATA[Courses]]></category>\n`;
      itemsXml += `    </item>\n`;

      itemsXml += `    <item>\n`;
      itemsXml += `      <title><![CDATA[The ForenClue Podcast - Forensic Investigation Insights]]></title>\n`;
      itemsXml += `      <link>${baseUrl}/podcast</link>\n`;
      itemsXml += `      <guid isPermaLink="true">${baseUrl}/podcast</guid>\n`;
      itemsXml += `      <pubDate>${nowUtc}</pubDate>\n`;
      itemsXml += `      <description><![CDATA[Tune in to expert interviews, real crime analysis, cyber security breaches, and forensic technology breakthroughs.]]></description>\n`;
      itemsXml += `      <category><![CDATA[Podcast]]></category>\n`;
      itemsXml += `    </item>\n`;
      totalItems = 3;
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>ForenClue | Forensic Science EdTech &amp; Investigation Intelligence</title>
    <link>${baseUrl}</link>
    <description>India's premier forensic science edtech platform. Case studies, forensic analysis, cybersecurity, crime scene investigation, podcasts, masterclasses, and research e-books.</description>
    <language>en-us</language>
    <lastBuildDate>${nowUtc}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${baseUrl}/og/home.png</url>
      <title>ForenClue</title>
      <link>${baseUrl}</link>
    </image>
${itemsXml}  </channel>
</rss>`;

    const publicDir = path.resolve(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(path.join(publicDir, 'rss.xml'), xml);
    console.log(`✅ Successfully generated /public/rss.xml with ${totalItems} feed items.`);
    process.exit(0);

  } catch (error) {
    console.error("Failed to generate RSS feed:", error);
    process.exit(1);
  }
}

generateRssFeed();
