import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalPath?: string;
  image?: string;
  type?: 'website' | 'article' | 'book';
  noindex?: boolean;
}

export function SEO({
  title,
  description,
  keywords,
  canonicalPath = '',
  image,
  type = 'website',
  noindex = false,
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
    setMetaTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    if (keywords) {
      setMetaTag('name', 'keywords', keywords);
    } else {
      setMetaTag('name', 'keywords', 'forensic science, forensic courses, crime scene investigation, forenclue, digital forensics, forensic career');
    }

    // Canonical link setup
    const absoluteCanonicalUrl = `https://forenclue.in${canonicalPath}`;
    setLinkTag('canonical', absoluteCanonicalUrl);

    // OpenGraph social preview metadata
    const shareTitle = title ? `${title} | Forensic Science Hub` : 'ForenClue - Master Forensic Science & Investigations';
    setMetaTag('property', 'og:title', shareTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:url', absoluteCanonicalUrl);

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

    // Dynamic insertion of Google Schema Markup Structured Data (Organization, Website details)
    const jsonLdData = {
      '@context': 'https://schema.org',
      '@type': type === 'article' ? 'Article' : type === 'book' ? 'Book' : 'WebSite',
      'name': title || 'ForenClue',
      'description': description,
      'url': absoluteCanonicalUrl,
      'publisher': {
        '@type': 'Organization',
        'name': 'ForenClue',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj7yfh9aP-3k7exKSgvW9ynV7lb9j62shvwJrpkiEi_9yiWUSxntW5Poc-MOXQCA0fd635VLo8C35glEPFtlSByqxDDepzEAX6D5T4SzFX-8fyKDIoo7_wV3EXH6u-UDF6P344Q4RRlRFY-qfqITWnuSXa7feb89eDlR9SCODoodogdY89rBez2K7fOiQI/s1600/4b5616a4-6069-44a7-ba52-88f965165067.png'
        }
      }
    };

    let scriptTag = document.querySelector('script[type="application/ld+json"]');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(jsonLdData);

  }, [title, description, keywords, canonicalPath, image, type, noindex]);

  return null; // Side-effect only component
}
