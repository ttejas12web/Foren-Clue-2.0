import { useEffect } from 'react';

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
}: SEOProps) {
  useEffect(() => {
    const siteTitle = 'ForenClue | Forensic EdTech Mastery';
    const formattedTitle = title ? `${title} | ForenClue` : siteTitle;
    document.title = formattedTitle;

    // Helper to view or update/create meta elements
    const setMetaTag = (attrName: string, attrVal: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper to find, update, or create link tags (like canonical)
    const setLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // Standard Meta Tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1');
    setMetaTag('name', 'content-language', 'en-IN');
    
    // Geographic Targeting for Forensic Training Excellence in India and globally
    setMetaTag('name', 'geo.region', 'IN-DL');
    setMetaTag('name', 'geo.placename', 'Delhi');
    setMetaTag('name', 'geo.position', '28.6139;77.2090');
    setMetaTag('name', 'ICBM', '28.6139, 77.2090');

    if (keywords) {
      setMetaTag('name', 'keywords', keywords);
    } else {
      setMetaTag('name', 'keywords', 'forensic science, forensic courses, crime scene investigation, forenclue, digital forensics, forensic career, learn finger print lifting, india forensics');
    }

    // Canonical link setup
    const absoluteCanonicalUrl = `https://forenclue.in${canonicalPath}`;
    setLinkTag('canonical', absoluteCanonicalUrl);

    // OpenGraph social preview metadata
    const shareTitle = title ? `${title} | Forensic Science Hub` : 'ForenClue - Master Forensic Science & Investigations';
    setMetaTag('property', 'og:title', shareTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', type === 'article' ? 'article' : 'website');
    setMetaTag('property', 'og:url', absoluteCanonicalUrl);
    setMetaTag('property', 'og:site_name', 'ForenClue');
    setMetaTag('property', 'og:locale', 'en_IN');

    // Determine the optimal image URL (override low-res thumbnail parameters if present)
    let ogImg = 'https://forenclue.in/forenclue_og_banner.jpg';
    if (image) {
      ogImg = image;
    }

    // Proactively optimize Blogger and Google User Content image parameters to deliver ultra-crisp s1200 sizes for social crawlers (Telegram, WhatsApp, etc.)
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

    setMetaTag('property', 'og:image', ogImg);
    setMetaTag('property', 'og:image:secure_url', ogImg);
    setMetaTag('property', 'og:image:width', '1200');
    setMetaTag('property', 'og:image:height', '630');

    // Twitter Card social preview metadata
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', shareTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImg);
    setMetaTag('name', 'twitter:site', '@ForenClue');
    setMetaTag('name', 'twitter:creator', '@ForenClue');

    // Structured Data Graph Architecture (Organizes multiple relational entities)
    const graphData: any[] = [
      {
        '@type': 'EducationalOrganization',
        '@id': 'https://forenclue.in/#organization',
        'name': 'ForenClue',
        'url': 'https://forenclue.in',
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
        'isPartOf': { '@id': 'https://forenclue.in/#website' },
        'publisher': { '@id': 'https://forenclue.in/#organization' }
      }
    ];

    // Rich Article Additions
    if (type === 'article') {
      const articleNode: any = {
        '@type': 'BlogPosting',
        '@id': `${absoluteCanonicalUrl}#article`,
        'isPartOf': { '@id': `${absoluteCanonicalUrl}#webpage` },
        'headline': title,
        'description': description,
        'image': ogImg,
        'publisher': { '@id': 'https://forenclue.in/#organization' }
      };
      if (authorName) {
        articleNode.author = {
          '@type': 'Person',
          'name': authorName
        };
      }
      if (publishDate) {
        articleNode.datePublished = publishDate;
      }
      graphData.push(articleNode);
    }

    // Course Rich Schema Additions
    if (type === 'course' && courseDetails) {
      graphData.push({
        '@type': 'Course',
        '@id': `${absoluteCanonicalUrl}#course`,
        'name': courseDetails.name,
        'description': courseDetails.description || description,
        'provider': {
          '@id': 'https://forenclue.in/#organization'
        },
        'category': courseDetails.category || 'Forensic Science'
      });
    }

    // Service Rich Schema Additions
    if (type === 'service') {
      graphData.push({
        '@type': 'Service',
        '@id': `${absoluteCanonicalUrl}#service`,
        'name': title,
        'description': description,
        'provider': {
          '@id': 'https://forenclue.in/#organization'
        }
      });
    }

    // FAQPage Structured Data (Highly recommended for high-intent SEO queries)
    if (faqs && faqs.length > 0) {
      graphData.push({
        '@type': 'FAQPage',
        '@id': `${absoluteCanonicalUrl}#faq`,
        'mainEntity': faqs.map(faq => ({
          '@type': 'Question',
          'name': faq.question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': faq.answer
          }
        }))
      });
    }

    // BreadcrumbList Structured Data (Translates physical page layouts into intuitive breadcrumb trails)
    if (breadcrumbs && breadcrumbs.length > 0) {
      graphData.push({
        '@type': 'BreadcrumbList',
        '@id': `${absoluteCanonicalUrl}#breadcrumbs`,
        'itemListElement': breadcrumbs.map((crumb, idx) => ({
          '@type': 'ListItem',
          'position': idx + 1,
          'name': crumb.name,
          'item': `https://forenclue.in${crumb.path}`
        }))
      });
    }

    const jsonLdData = {
      '@context': 'https://schema.org',
      '@graph': graphData
    };

    let scriptTag = document.querySelector('script[type="application/ld+json"]');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(jsonLdData);

  }, [title, description, keywords, canonicalPath, image, type, noindex, authorName, publishDate, courseDetails, faqs, breadcrumbs]);

  return null; // Side-effect only component
}

