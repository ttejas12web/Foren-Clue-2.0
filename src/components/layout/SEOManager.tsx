import { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SEO } from './SEO';

export interface SEOManagerProps {
  collectionName?: 'quizzes' | 'cases' | 'caseStudies' | 'courses' | 'ebooks' | 'podcasts' | 'webinars' | 'certificates' | string;
  docId?: string;
  slug?: string;
  initialData?: {
    title?: string;
    description?: string;
    summary?: string;
    image?: string;
    thumbnail?: string;
    coverImage?: string;
    bannerImage?: string;
    createdBy?: string;
    author?: string;
    createdAt?: any;
    [key: string]: any;
  } | null;
  fallbackTitle?: string;
  fallbackDescription?: string;
  fallbackImage?: string;
  keywords?: string;
  canonicalPath?: string;
  type?: 'website' | 'article' | 'book' | 'course' | 'service';
  authorName?: string;
  publishDate?: string;
  breadcrumbs?: Array<{ name: string; path: string }>;
  faqs?: Array<{ question: string; answer: string }>;
  customSchema?: any[];
}

export function SEOManager({
  collectionName,
  docId,
  slug,
  initialData,
  fallbackTitle = 'ForenClue | Your Partner In Forensic Precision',
  fallbackDescription = 'Master Forensic Science with interactive crime scene simulations, quizzes, case studies, and e-books.',
  fallbackImage = 'https://blogger.googleusercontent.com/img/a/AVvXsEg_OeYXV0qnZe42fjD2ty2vBNDGqhWPnOjQBOiWFbkDcCaUa0Pl5sJyixMvmxEhAKoLMU9A4A2bjvxrpEuGG_jKX7q2su81OGr9eSt3DUWNwQVufTdGQI_NSKBcZduRx-7jyn3dMmQVb4o6Qom_9Ul2qen9YS8c-h2W5PTda-U8x6JsAasJG_3lHFitvX0',
  keywords,
  canonicalPath = '',
  type = 'website',
  authorName,
  publishDate,
  breadcrumbs,
  faqs,
  customSchema
}: SEOManagerProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const identifier = docId || slug;

  useEffect(() => {
    let isMounted = true;

    async function fetchDynamicSEOData() {
      if (!collectionName || !identifier) return;

      setLoading(true);
      try {
        let dataFound: any = null;

        // Map collection aliases
        let targetCollection = collectionName;
        if (collectionName === 'caseStudies') targetCollection = 'cases';
        if (collectionName === 'podcasts') targetCollection = 'podcasts';

        // 1. Attempt direct document lookup by docId / identifier
        if (docId || identifier) {
          try {
            const docRef = doc(db, targetCollection, identifier);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              dataFound = { id: docSnap.id, ...docSnap.data() };
            }
          } catch (e) {
            // Ignore error and fall back to query
          }
        }

        // 2. If direct lookup returned null and identifier exists, try query by slug or id field
        if (!dataFound && identifier) {
          const colRef = collection(db, targetCollection);
          
          // Try query where 'slug' == identifier
          let q = query(colRef, where('slug', '==', identifier));
          let querySnap = await getDocs(q);
          
          if (querySnap.empty) {
            // Try query where 'id' == identifier
            q = query(colRef, where('id', '==', identifier));
            querySnap = await getDocs(q);
          }

          if (!querySnap.empty) {
            const firstDoc = querySnap.docs[0];
            dataFound = { id: firstDoc.id, ...firstDoc.data() };
          }
        }

        if (isMounted && dataFound) {
          setFetchedData(dataFound);
        }
      } catch (err) {
        console.warn(`[SEOManager] Could not fetch dynamic SEO for ${collectionName}/${identifier}:`, err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchDynamicSEOData();

    return () => {
      isMounted = false;
    };
  }, [collectionName, docId, slug, identifier]);

  // Combine initialData, fetchedData, and fallbacks
  const data = initialData || fetchedData || {};

  const resolvedTitle = data.title || data.name || data.heading || fallbackTitle;
  const resolvedDescription = 
    data.description || 
    data.summary || 
    data.overview || 
    data.details || 
    data.abstract || 
    fallbackDescription;

  const rawImage = 
    data.image || 
    data.thumbnail || 
    data.coverImage || 
    data.bannerImage || 
    data.cover || 
    fallbackImage;

  let resolvedImage = rawImage;
  if (resolvedImage) {
    if (!resolvedImage.startsWith('http://') && !resolvedImage.startsWith('https://')) {
      const clean = resolvedImage.startsWith('/') ? resolvedImage : `/${resolvedImage}`;
      resolvedImage = `https://www.forenclue.in${clean}`;
    }
  } else {
    resolvedImage = 'https://blogger.googleusercontent.com/img/a/AVvXsEg_OeYXV0qnZe42fjD2ty2vBNDGqhWPnOjQBOiWFbkDcCaUa0Pl5sJyixMvmxEhAKoLMU9A4A2bjvxrpEuGG_jKX7q2su81OGr9eSt3DUWNwQVufTdGQI_NSKBcZduRx-7jyn3dMmQVb4o6Qom_9Ul2qen9YS8c-h2W5PTda-U8x6JsAasJG_3lHFitvX0';
  }

  const resolvedAuthor = data.createdBy || data.author || authorName || 'ForenClue Forensic Experts';

  // Force DOM updates on route load / data change
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const fullTitle = resolvedTitle.includes('ForenClue') ? resolvedTitle : `${resolvedTitle} | ForenClue`;
      document.title = fullTitle;

      // Ensure open-graph and twitter meta tags update immediately on route load
      const updateMeta = (property: string, value: string) => {
        let el = document.querySelector(`meta[property="${property}"]`) || document.querySelector(`meta[name="${property}"]`);
        if (!el) {
          el = document.createElement('meta');
          if (property.startsWith('og:')) {
            el.setAttribute('property', property);
          } else {
            el.setAttribute('name', property);
          }
          document.head.appendChild(el);
        }
        el.setAttribute('content', value);
      };

      updateMeta('og:title', fullTitle);
      updateMeta('twitter:title', fullTitle);
      updateMeta('og:description', resolvedDescription);
      updateMeta('twitter:description', resolvedDescription);
      updateMeta('og:image', resolvedImage);
      updateMeta('twitter:image', resolvedImage);
    }
  }, [resolvedTitle, resolvedDescription, resolvedImage]);

  return (
    <SEO
      title={resolvedTitle}
      description={resolvedDescription}
      keywords={keywords}
      canonicalPath={canonicalPath || (slug ? `/${collectionName}/${slug}` : docId ? `/${collectionName}/${docId}` : '')}
      image={resolvedImage}
      type={type}
      authorName={resolvedAuthor}
      publishDate={publishDate}
      breadcrumbs={breadcrumbs}
      faqs={faqs}
      customSchema={customSchema}
    />
  );
}

export default SEOManager;
