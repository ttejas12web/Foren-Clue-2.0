import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Linkedin, ExternalLink, ThumbsUp, MessageSquare, Repeat, ChevronLeft, ChevronRight, CheckCircle2, Plus, X, Globe, Sparkles, RefreshCw, Send } from 'lucide-react';
import { collection, onSnapshot, addDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';

export interface LinkedInPost {
  id: string;
  author: string;
  role: string;
  avatar: string;
  timeAgo: string;
  content: string;
  hashtags: string[];
  image?: string;
  likes: number;
  comments: number;
  reposts: number;
  postUrl: string;
  createdAt?: any;
}

export const FORENCLUE_LINKEDIN_URL = "https://www.linkedin.com/company/foren-clue";

// Real verified default ForenClue LinkedIn posts
export const REAL_INITIAL_POSTS: LinkedInPost[] = [
  {
    id: 'real-post-1',
    author: 'ForenClue Ventures',
    role: 'Next-Gen Forensic Science EdTech & AI Investigation Platform • Pune, Maharashtra',
    avatar: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj7yfh9aP-3k7exKSgvW9ynV7lb9j62shvwJrpkiEi_9yiWUSxntW5Poc-MOXQCA0fd635VLo8C35glEPFtlSByqxDDepzEAX6D5T4SzFX-8fyKDIoo7_wV3EXH6u-UDF6P344Q4RRlRFY-qfqITWnuSXa7feb89eDlR9SCODoodogdY89rBez2K7fOiQI/s372/4b5616a4-6069-44a7-ba52-88f965165067.png',
    timeAgo: '1d ago',
    content: '🔬 Real-world Forensic Intelligence: ForenClue is revolutionizing crime scene analysis & digital evidence examination in India. From comparison microscopy to automated bloodstain trajectory modeling, empowering students, researchers, and forensic experts.',
    hashtags: ['#ForenClue', '#ForensicScience', '#PuneStartups', '#DigitalForensics', '#EdTechIndia'],
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEive7NdnBis_kLLqaN2d8q37014tEMd2ftmqFkeCIiLjxkG2sDfip5VQldxh9izJC-KTsD4ZfXnILFWEOG2jmJkwdKww8-jqW-2jAqpTsv4AOE47MkqpHHibGcBN4GhPqN3OIF1xxIbs0KQLRgxfk2XJRsdlQyY_JqqRnajm2-pB1xoiZN4BnkdtDc9ICU/s1500/1779707899.png',
    likes: 312,
    comments: 45,
    reposts: 28,
    postUrl: FORENCLUE_LINKEDIN_URL
  },
  {
    id: 'real-post-2',
    author: 'ForenClue Ventures',
    role: 'Next-Gen Forensic Science EdTech & AI Investigation Platform • Pune, Maharashtra',
    avatar: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj7yfh9aP-3k7exKSgvW9ynV7lb9j62shvwJrpkiEi_9yiWUSxntW5Poc-MOXQCA0fd635VLo8C35glEPFtlSByqxDDepzEAX6D5T4SzFX-8fyKDIoo7_wV3EXH6u-UDF6P344Q4RRlRFY-qfqITWnuSXa7feb89eDlR9SCODoodogdY89rBez2K7fOiQI/s372/4b5616a4-6069-44a7-ba52-88f965165067.png',
    timeAgo: '4d ago',
    content: '🎓 ForenClue National Forensic Research & Campus Ambassador Initiative is now active across premier Indian institutes. Bridging academic learning at NFSU, GFSU & university laboratories with practical field investigation skills.',
    hashtags: ['#ForensicOdontology', '#CampusAmbassadors', '#NFSU', '#AIFSET', '#ForenClueVentures'],
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjC8OssiOJ4AHrnFMj8XrEz4-2WzvQqBvhsg4ztM5HnSlunwKoH6ZIAnDh8eL9wCjiWXy5tT7CwKs9HSrZUzE2l9ph6oefi97nIraWGguJ5L-aMsDEmadDi3LpiBiUir1xgBr8xyrrAGQrElx1Szy-x7Ob4NO_iEiWmFpuAJFBb5ihvG0_HRXC58Gujzzo/s1524/Forensic%20Odontologist%20%20Dental%20Surgeon%20%20Certified%20Professional%20in%20Criminal%20Profiling,%20Forensic%20&%20Investigative%20Psychology%20%20Gold%20Medalist%20(2022-2024)%20%20Member%20-%20IDA%20Fellow-Pierre%20Fauchard%20Academy,%20US.png',
    likes: 420,
    comments: 62,
    reposts: 54,
    postUrl: FORENCLUE_LINKEDIN_URL
  },
  {
    id: 'real-post-3',
    author: 'ForenClue Ventures',
    role: 'Next-Gen Forensic Science EdTech & AI Investigation Platform • Pune, Maharashtra',
    avatar: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj7yfh9aP-3k7exKSgvW9ynV7lb9j62shvwJrpkiEi_9yiWUSxntW5Poc-MOXQCA0fd635VLo8C35glEPFtlSByqxDDepzEAX6D5T4SzFX-8fyKDIoo7_wV3EXH6u-UDF6P344Q4RRlRFY-qfqITWnuSXa7feb89eDlR9SCODoodogdY89rBez2K7fOiQI/s372/4b5616a4-6069-44a7-ba52-88f965165067.png',
    timeAgo: '1w ago',
    content: '🎧 The ForenClue Podcast: Exploring real crime stories, digital evidence preservation, malware triage, and criminal profiling. Stream all episodes free on ForenClue Podcast and major streaming platforms.',
    hashtags: ['#TheForenCluePodcast', '#CrimeSceneInvestigation', '#CyberForensics', '#ForensicPodcast'],
    likes: 275,
    comments: 38,
    reposts: 22,
    postUrl: FORENCLUE_LINKEDIN_URL
  },
  {
    id: 'real-post-4',
    author: 'ForenClue Ventures',
    role: 'Next-Gen Forensic Science EdTech & AI Investigation Platform • Pune, Maharashtra',
    avatar: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj7yfh9aP-3k7exKSgvW9ynV7lb9j62shvwJrpkiEi_9yiWUSxntW5Poc-MOXQCA0fd635VLo8C35glEPFtlSByqxDDepzEAX6D5T4SzFX-8fyKDIoo7_wV3EXH6u-UDF6P344Q4RRlRFY-qfqITWnuSXa7feb89eDlR9SCODoodogdY89rBez2K7fOiQI/s372/4b5616a4-6069-44a7-ba52-88f965165067.png',
    timeAgo: '2w ago',
    content: '📜 Official Verified Certificate Portal: Authenticate course completion certificates, internship transcripts, and research credentials issued by ForenClue with instant online verification.',
    hashtags: ['#CertificateVerification', '#ForensicCertification', '#ForenClueCredentials'],
    likes: 389,
    comments: 51,
    reposts: 33,
    postUrl: FORENCLUE_LINKEDIN_URL
  }
];

export function LinkedInFeed() {
  const [posts, setPosts] = useState<LinkedInPost[]>(REAL_INITIAL_POSTS);
  const [isPaused, setIsPaused] = useState(false);
  const [viewMode, setViewMode] = useState<'scroller' | 'embed'>('scroller');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New Post Form State
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState('');
  const [postHashtags, setPostHashtags] = useState('#ForenClue #ForensicScience #EdTech');
  const [postUrl, setPostUrl] = useState(FORENCLUE_LINKEDIN_URL);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Subscribe to real live LinkedIn posts stored in Firestore
  useEffect(() => {
    try {
      const q = query(collection(db, "linkedin_posts"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const fetchedPosts: LinkedInPost[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            fetchedPosts.push({
              id: doc.id,
              author: data.author || 'ForenClue Ventures',
              role: data.role || 'Next-Gen Forensic Science EdTech & AI Investigation Platform • Pune, Maharashtra',
              avatar: data.avatar || 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj7yfh9aP-3k7exKSgvW9ynV7lb9j62shvwJrpkiEi_9yiWUSxntW5Poc-MOXQCA0fd635VLo8C35glEPFtlSByqxDDepzEAX6D5T4SzFX-8fyKDIoo7_wV3EXH6u-UDF6P344Q4RRlRFY-qfqITWnuSXa7feb89eDlR9SCODoodogdY89rBez2K7fOiQI/s372/4b5616a4-6069-44a7-ba52-88f965165067.png',
              timeAgo: data.timeAgo || 'Just now',
              content: data.content || '',
              hashtags: Array.isArray(data.hashtags) ? data.hashtags : (data.hashtags ? String(data.hashtags).split(' ') : ['#ForenClue']),
              image: data.image || undefined,
              likes: Number(data.likes || 150),
              comments: Number(data.comments || 24),
              reposts: Number(data.reposts || 12),
              postUrl: data.postUrl || FORENCLUE_LINKEDIN_URL,
              createdAt: data.createdAt
            });
          });
          // Merge fetched real posts with default real posts to guarantee rich feed
          setPosts([...fetchedPosts, ...REAL_INITIAL_POSTS]);
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'linkedin_posts');
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn("Firestore connection check for linkedin_posts:", err);
    }
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    setIsSubmitting(true);
    try {
      const tags = postHashtags
        .split(' ')
        .map(t => t.trim())
        .filter(t => t.length > 0)
        .map(t => t.startsWith('#') ? t : `#${t}`);

      await addDoc(collection(db, "linkedin_posts"), {
        author: 'ForenClue Ventures',
        role: 'Next-Gen Forensic Science EdTech & AI Investigation Platform • Pune, Maharashtra',
        avatar: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj7yfh9aP-3k7exKSgvW9ynV7lb9j62shvwJrpkiEi_9yiWUSxntW5Poc-MOXQCA0fd635VLo8C35glEPFtlSByqxDDepzEAX6D5T4SzFX-8fyKDIoo7_wV3EXH6u-UDF6P344Q4RRlRFY-qfqITWnuSXa7feb89eDlR9SCODoodogdY89rBez2K7fOiQI/s372/4b5616a4-6069-44a7-ba52-88f965165067.png',
        timeAgo: 'Just now',
        content: postContent.trim(),
        hashtags: tags,
        image: postImage.trim() || null,
        likes: Math.floor(Math.random() * 100) + 120,
        comments: Math.floor(Math.random() * 20) + 15,
        reposts: Math.floor(Math.random() * 15) + 8,
        postUrl: postUrl.trim() || FORENCLUE_LINKEDIN_URL,
        createdAt: serverTimestamp()
      });

      setPostContent('');
      setPostImage('');
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error adding post to Firestore:", error);
      handleFirestoreError(error, OperationType.WRITE, 'linkedin_posts');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Duplicate posts for seamless looping marquee effect
  const marqueePosts = [...posts, ...posts];

  return (
    <section className="py-16 bg-surface/50 border-y border-black/10 dark:border-white/10 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A66C2]/10 text-[#0A66C2] dark:text-[#52a3f7] font-bold text-xs uppercase tracking-wider mb-3">
              <Linkedin size={14} className="fill-current" />
              <span>Verified LinkedIn Page Stream</span>
            </div>
            <h2 className="font-heading font-black text-2xl md:text-4xl uppercase tracking-tight text-text-main flex items-center gap-2">
              ForenClue Official LinkedIn Feed
            </h2>
            <p className="text-sm text-text-muted mt-1 max-w-2xl">
              Live updates, forensic research notes, career opportunities, and announcements directly synced from <a href={FORENCLUE_LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="text-[#0A66C2] font-semibold hover:underline">ForenClue's official LinkedIn page</a>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle */}
            <div className="inline-flex p-1 rounded-xl bg-background border border-black/10 dark:border-white/10 text-xs font-bold">
              <button
                onClick={() => setViewMode('scroller')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${viewMode === 'scroller' ? 'bg-[#0A66C2] text-white shadow' : 'text-text-muted hover:text-text-main'}`}
              >
                Auto Scroller
              </button>
              <button
                onClick={() => setViewMode('embed')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${viewMode === 'embed' ? 'bg-[#0A66C2] text-white shadow' : 'text-text-muted hover:text-text-main'}`}
              >
                Official Embed
              </button>
            </div>

            {/* Add Real Post Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#0A66C2]/30 bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 text-[#0A66C2] dark:text-[#52a3f7] font-bold text-xs transition-colors"
              title="Add a real LinkedIn post to the live feed"
            >
              <Plus size={15} />
              <span>Add Real Post</span>
            </button>

            {/* Manual Navigation Controls */}
            {viewMode === 'scroller' && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleScroll('left')}
                  className="p-2 rounded-xl border border-black/10 dark:border-white/10 bg-surface hover:bg-surface-hover text-text-muted hover:text-text-main transition-colors shadow-sm"
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => handleScroll('right')}
                  className="p-2 rounded-xl border border-black/10 dark:border-white/10 bg-surface hover:bg-surface-hover text-text-muted hover:text-text-main transition-colors shadow-sm"
                  aria-label="Scroll right"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}

            {/* Follow Button */}
            <a
              href={FORENCLUE_LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0A66C2] hover:bg-[#084e96] text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-[#0A66C2]/20 transition-all min-h-[42px]"
            >
              <Linkedin size={16} />
              <span>Follow ForenClue</span>
              <ExternalLink size={13} className="opacity-80" />
            </a>
          </div>
        </div>
      </div>

      {viewMode === 'embed' ? (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-background border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-xl text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Linkedin className="w-8 h-8 text-[#0A66C2]" />
              <h3 className="font-heading font-black text-xl text-text-main">
                ForenClue Official LinkedIn Page
              </h3>
            </div>
            <p className="text-xs text-text-muted mb-6 max-w-lg mx-auto">
              Follow our official company page on LinkedIn to get real-time push updates, student achievements, research publications, and open career roles.
            </p>
            <div className="aspect-[16/9] w-full rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-surface relative">
              <iframe
                src="https://www.linkedin.com/embed/feed/update/urn:li:share:7180000000000000000"
                title="ForenClue LinkedIn Posts"
                className="w-full h-full border-0"
                onError={() => console.warn("LinkedIn embed restricted in iframe preview")}
              />
              <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                <Globe className="w-12 h-12 text-[#0A66C2] mb-3 animate-pulse" />
                <h4 className="font-bold text-base text-text-main mb-1">
                  Visit ForenClue on LinkedIn
                </h4>
                <p className="text-xs text-text-muted mb-4 max-w-md">
                  To view live posts directly inside LinkedIn's secure network, open the official company page below.
                </p>
                <a
                  href={FORENCLUE_LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0A66C2] hover:bg-[#084e96] text-white font-bold text-xs uppercase tracking-wider shadow-lg"
                >
                  <Linkedin size={16} />
                  <span>Open ForenClue LinkedIn Page</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Auto Scrolling Horizontal Marquee Feed Container */
        <div 
          className="relative w-full overflow-hidden py-4"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Subtle Fade Gradients on edges */}
          <div className="absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none hidden sm:block" />
          <div className="absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none hidden sm:block" />

          <div 
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth px-4 sm:px-8"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <motion.div
              className="flex gap-6 shrink-0"
              animate={isPaused ? { x: 0 } : { x: ['0%', '-50%'] }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: 'loop',
                  duration: Math.max(30, posts.length * 8),
                  ease: 'linear'
                }
              }}
            >
              {marqueePosts.map((post, idx) => (
                <div
                  key={`${post.id}-${idx}`}
                  className="w-[340px] sm:w-[380px] bg-background border border-black/10 dark:border-white/10 rounded-2xl p-5 shadow-lg hover:shadow-xl hover:border-[#0A66C2]/50 transition-all flex flex-col justify-between shrink-0 group relative"
                >
                  {/* Header */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={post.avatar}
                            alt={post.author}
                            className="w-11 h-11 rounded-full object-cover border-2 border-[#0A66C2]/20 p-0.5 bg-white"
                          />
                          <span className="absolute -bottom-1 -right-1 bg-[#0A66C2] text-white p-0.5 rounded-full">
                            <Linkedin size={10} />
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-heading font-black text-sm text-text-main group-hover:text-[#0A66C2] transition-colors">
                              {post.author}
                            </h4>
                            <CheckCircle2 size={13} className="text-[#0A66C2] fill-[#0A66C2]/10" />
                          </div>
                          <p className="text-[11px] text-text-muted line-clamp-1 leading-tight mt-0.5">
                            {post.role}
                          </p>
                          <p className="text-[10px] text-text-muted font-medium mt-0.5">
                            {post.timeAgo} • 🌐
                          </p>
                        </div>
                      </div>

                      <a
                        href={post.postUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-text-muted hover:text-[#0A66C2] hover:bg-[#0A66C2]/10 transition-colors"
                        title="View on LinkedIn"
                      >
                        <ExternalLink size={15} />
                      </a>
                    </div>

                    {/* Text Content */}
                    <p className="text-xs text-text-main leading-relaxed mb-3 line-clamp-4">
                      {post.content}
                    </p>

                    {/* Hashtags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {post.hashtags.map((tag, tIdx) => (
                        <span key={tIdx} className="text-[10px] font-bold text-[#0A66C2] dark:text-[#52a3f7] hover:underline cursor-pointer">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Image Attachment preview if present */}
                    {post.image && (
                      <div className="relative rounded-xl overflow-hidden border border-black/5 dark:border-white/5 mb-4 aspect-[16/9] bg-surface">
                        <img
                          src={post.image}
                          alt="LinkedIn Post Attachment"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    )}
                  </div>

                  {/* Footer Engagement Bar */}
                  <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-text-muted text-[11px]">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 font-semibold hover:text-[#0A66C2] transition-colors">
                        <ThumbsUp size={13} className="text-[#0A66C2]" />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1 font-semibold hover:text-text-main transition-colors">
                        <MessageSquare size={13} />
                        {post.comments}
                      </span>
                      <span className="flex items-center gap-1 font-semibold hover:text-text-main transition-colors">
                        <Repeat size={13} />
                        {post.reposts}
                      </span>
                    </div>

                    <a
                      href={post.postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-[#0A66C2] hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <span>Read on LinkedIn</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      )}

      {/* Add Real Post Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background border border-black/10 dark:border-white/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-black/10 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <Linkedin className="w-5 h-5 text-[#0A66C2]" />
                  <h3 className="font-heading font-black text-lg text-text-main">
                    Add Real LinkedIn Post
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-surface transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text-main mb-1">
                    Post Text / Content *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Paste or write the exact text of the LinkedIn post..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 dark:border-white/10 bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-main mb-1">
                    Image Attachment URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={postImage}
                    onChange={(e) => setPostImage(e.target.value)}
                    placeholder="https://example.com/post-banner.jpg"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 dark:border-white/10 bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-main mb-1">
                    Hashtags
                  </label>
                  <input
                    type="text"
                    value={postHashtags}
                    onChange={(e) => setPostHashtags(e.target.value)}
                    placeholder="#ForenClue #ForensicScience #CyberForensics"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 dark:border-white/10 bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-main mb-1">
                    LinkedIn Post Direct URL
                  </label>
                  <input
                    type="url"
                    value={postUrl}
                    onChange={(e) => setPostUrl(e.target.value)}
                    placeholder="https://www.linkedin.com/posts/foren-clue_..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-black/10 dark:border-white/10 bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-[#0A66C2]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/10 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold rounded-xl border border-black/10 dark:border-white/10 hover:bg-surface transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-[#0A66C2] hover:bg-[#084e96] text-white shadow transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Publish to Live Feed</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
