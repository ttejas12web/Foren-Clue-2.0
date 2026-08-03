import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

declare global {
  interface Window {
    debugSEO?: () => void;
  }
}

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalPath?: string;
  image?: string;
  type?: 'website' | 'article' | 'book' | 'course' | 'service';
  noindex?: boolean;
  // Dynamic SEO Structured Data extensions
  authorName?: string;
  publishDate?: string;
  courseDetails?: {
    name: string;
    description?: string;
    provider?: string;
    category?: string;
  };
  faqs?: Array<{ question: string; answer: string }>;
  breadcrumbs?: Array<{ name: string; path: string }>;
  customSchema?: any[];
}

export function SEO({
  title,
  description,
  keywords,
  canonicalPath = '',
  image,
  type = 'website',
  noindex = false,
  authorName,
  publishDate,
  courseDetails,
  faqs,
  breadcrumbs,
  customSchema,
}: SEOProps) {
  const siteTitle = 'ForenClue | Forensic EdTech Mastery';
  const formattedTitle = title ? `${title} | ForenClue` : siteTitle;
  const shareTitle = title ? `${title} | Forensic Science Hub` : 'ForenClue - Master Forensic Science & Investigations';
  const metaKeywords = keywords || 'forensic science, forensic courses, crime scene investigation, forenclue, digital forensics, forensic career, learn finger print lifting, india forensics';
  const absoluteCanonicalUrl = `https://www.forenclue.in${canonicalPath}`;

  // Determine optimal image URL (must be absolute for social crawlers)
  let ogImg = 'https://www.forenclue.in/images/og/home.png';
  if (image) {
    if (image.startsWith('http://') || image.startsWith('https://')) {
      ogImg = image;
    } else {
      const cleanPath = image.startsWith('/') ? image : `/${image}`;
      ogImg = `https://www.forenclue.in${cleanPath}`;
    }
  }

  // Optimize Blogger and Google User Content image parameters to deliver s1200 sizes for social crawlers
  if (ogImg && ogImg.includes('googleusercontent.com')) {
    const pathRegex = /\/s\d+(?:-[a-zA-Z0-9_-]+)*\//;
    if (pathRegex.test(ogImg)) {
      ogImg = ogImg.replace(pathRegex, '/s1200/');
    } else {
      const queryRegex = /=s\d+(?:-[a-zA-Z0-9_-]+)*/;
      if (queryRegex.test(ogImg)) {
        ogImg = ogImg.replace(queryRegex, '=s1200');
      }
    }
  }

  // Structured Data Graph Architecture
  const graphData: any[] = [
    {
      '@type': 'EducationalOrganization',
      '@id': 'https://www.forenclue.in/#organization',
      'name': 'ForenClue',
      'url': 'https://www.forenclue.in',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj7yfh9aP-3k7exKSgvW9ynV7lb9j62shvwJrpkiEi_9yiWUSxntW5Poc-MOXQCA0fd635VLo8C35glEPFtlSByqxDDepzEAX6D5T4SzFX-8fyKDIoo7_wV3EXH6u-UDF6P344Q4RRlRFY-qfqITWnuSXa7feb89eDlR9SCODoodogdY89rBez2K7fOiQI/s1600/4b5616a4-6069-44a7-ba52-88f965165067.png'
      },
      'sameAs': [
        'https://www.youtube.com/@ForenClue',
        'https://www.instagram.com/forenclue',
        'https://t.me/forenclue'
      ]
    },
    {
      '@type': type === 'article' ? 'Article' : type === 'book' ? 'Book' : 'WebPage',
      '@id': `${absoluteCanonicalUrl}#webpage`,
      'url': absoluteCanonicalUrl,
      'name': title || 'ForenClue',
      'description': description,
      'isPartOf': { '@id': 'https://www.forenclue.in/#website' },
      'publisher': { '@id': 'https://www.forenclue.in/#organization' },
      'image': ogImg,
      'primaryImageOfPage': {
        '@type': 'ImageObject',
        '@id': `${absoluteCanonicalUrl}#primaryimage`,
        'url': ogImg
      }
    }
  ];

  if (type === 'article') {
    const articleNode: any = {
      '@type': 'BlogPosting',
      '@id': `${absoluteCanonicalUrl}#article`,
      'isPartOf': { '@id': `${absoluteCanonicalUrl}#webpage` },
      'headline': title,
      'description': description,
      'image': ogImg,
      'publisher': { '@id': 'https://www.forenclue.in/#organization' }
    };
    if (authorName) articleNode.author = { '@type': 'Person', 'name': authorName };
    if (publishDate) articleNode.datePublished = publishDate;
    graphData.push(articleNode);
  }

  if (type === 'course' && courseDetails) {
    graphData.push({
      '@type': 'Course',
      '@id': `${absoluteCanonicalUrl}#course`,
      'name': courseDetails.name,
      'description': courseDetails.description || description,
      'provider': { '@id': 'https://www.forenclue.in/#organization' },
      'category': courseDetails.category || 'Forensic Science',
      'image': ogImg
    });
  }

  if (type === 'service') {
    graphData.push({
      '@type': 'Service',
      '@id': `${absoluteCanonicalUrl}#service`,
      'name': title,
      'description': description,
      'provider': { '@id': 'https://www.forenclue.in/#organization' },
      'image': ogImg
    });
  }

  if (faqs && faqs.length > 0) {
    graphData.push({
      '@type': 'FAQPage',
      '@id': `${absoluteCanonicalUrl}#faq`,
      'mainEntity': faqs.map(faq => ({
        '@type': 'Question',
        'name': faq.question,
        'acceptedAnswer': { '@type': 'Answer', 'text': faq.answer }
      }))
    });
  }

  if (breadcrumbs && breadcrumbs.length > 0) {
    graphData.push({
      '@type': 'BreadcrumbList',
      '@id': `${absoluteCanonicalUrl}#breadcrumbs`,
      'itemListElement': breadcrumbs.map((crumb, idx) => ({
        '@type': 'ListItem',
        'position': idx + 1,
        'name': crumb.name,
        'item': `https://www.forenclue.in${crumb.path}`
      }))
    });
  }

  if (customSchema && customSchema.length > 0) {
    graphData.push(...customSchema);
  }

  const jsonLdData = {
    '@context': 'https://schema.org',
    '@graph': graphData
  };

  useEffect(() => {
    const printSEODebug = () => {
      const currentTitle = document.title;
      const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
      const ogDesc = document.querySelector('meta[property="og:description"]')?.getAttribute('content');
      const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
      const ogUrl = document.querySelector('meta[property="og:url"]')?.getAttribute('content');
      const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');

      console.groupCollapsed(`🔍 [SEO Debugger] ${currentTitle || formattedTitle}`);
      console.log('📌 Document Title:', currentTitle);
      console.log('🔗 OpenGraph Title:', ogTitle);
      console.log('📝 OpenGraph Description:', ogDesc);
      console.log('🖼️ OpenGraph Image:', ogImage);
      console.log('🌐 OpenGraph URL:', ogUrl);
      console.log('🎯 Canonical URL:', canonical);
      console.groupEnd();
    };

    window.debugSEO = printSEODebug;

    // Small delay to allow react-helmet-async to reflect tags in DOM
    const timer = setTimeout(printSEODebug, 150);
    return () => clearTimeout(timer);
  }, [formattedTitle, description, ogImg, absoluteCanonicalUrl, shareTitle]);

  return (
    <Helmet>
      <title>{formattedTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1'} />
      <meta name="content-language" content="en-IN" />
      <meta name="keywords" content={metaKeywords} />
      <meta name="geo.region" content="IN-DL" />
      <meta name="geo.placename" content="Delhi" />
      <meta name="geo.position" content="28.6139;77.2090" />
      <meta name="ICBM" content="28.6139, 77.2090" />

      <link rel="canonical" href={absoluteCanonicalUrl} />

      {/* OpenGraph */}
      <meta property="og:title" content={shareTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type === 'article' ? 'article' : 'website'} />
      <meta property="og:url" content={absoluteCanonicalUrl} />
      <meta property="og:site_name" content="ForenClue" />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:image" content={ogImg} />
      <meta property="og:image:secure_url" content={ogImg} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={shareTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImg} />
      <meta name="twitter:site" content="@ForenClue" />
      <meta name="twitter:creator" content="@ForenClue" />

      {/* Structured Data */}
      <script type="application/ld+json">{JSON.stringify(jsonLdData)}</script>
    </Helmet>
  );
}

export type SEOHeaderProps = SEOProps;
export const SEOHeader = SEO;

export { SEOManager } from './SEOManager';
export type { SEOManagerProps } from './SEOManager';

