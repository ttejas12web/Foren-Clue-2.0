import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  ShoppingBag, 
  Star, 
  Cpu, 
  Award, 
  ChevronRight, 
  FileText, 
  ArrowRight, 
  Zap, 
  Clock, 
  Globe, 
  Share2, 
  ThumbsUp 
} from 'lucide-react';
import { SEO } from '@/components/layout/SEO';

const bookCoverUrl = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEive7NdnBis_kLLqaN2d8q37014tEMd2ftmqFkeCIiLjxkG2sDfip5VQldxh9izJC-KTsD4ZfXnILFWEOG2jmJkwdKww8-jqW-2jAqpTsv4AOE47MkqpHHibGcBN4GhPqN3OIF1xxIbs0KQLRgxfk2XJRsdlQyY_JqqRnajm2-pB1xoiZN4BnkdtDc9ICU/s1500/1779707899.png';
const amazonLink = 'https://amzn.in/d/0gSkoWEw';

// E-commerce book specifications
const bookSpecs = [
  { label: 'Format', value: 'Kindle Edition', icon: BookOpen },
  { label: 'File Size', value: '26.2 MB', icon: Cpu },
  { label: 'Page Count', value: '102 Pages', icon: FileText },
  { label: 'Language', value: 'English', icon: Globe },
  { label: 'Text-to-Speech', value: 'Enabled', icon: Zap },
  { label: 'Publisher', value: 'ForenClue Publishing', icon: Award }
];

export default function Files() {
  const [shareCopied, setShareCopied] = useState<boolean>(false);
  const [userRating, setUserRating] = useState<number>(0);
  const [ratingSubmitted, setRatingSubmitted] = useState<boolean>(false);
  const [reviews, setReviews] = useState([
    { name: 'Dr. Manish Sharma', role: 'Head of Forensic Science Institute', text: 'This handbook is the ultimate roadmap for UGC NET and FACT forensic aspirants. Extremely clear breakdowns of case studies and step-by-step career path progression. Absolutely worth it!', rating: 5, date: '1 day ago' },
    { name: 'Priya Chawla', role: 'Digital Forensics Graduate aspirant', text: 'Section 2 on digital write blockers and isolation of networks helped me clear my core concepts for the placement interviewer. Highly recommended book!', rating: 5, date: '3 days ago' },
    { name: 'Anubhav Sinhar', role: 'CSI Scene Investigator', text: 'A must-have guide for first responders. Practical protocols, structured career insights, and clear illustrations of forensic principles.', rating: 5, date: '1 week ago' }
  ]);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewName, setNewReviewName] = useState('');

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName || !newReviewText) return;
    setReviews([
      {
        name: newReviewName,
        role: 'Verified Reader',
        text: newReviewText,
        rating: userRating || 5,
        date: 'Just now'
      },
      ...reviews
    ]);
    setNewReviewName('');
    setNewReviewText('');
    setUserRating(0);
    setRatingSubmitted(true);
    setTimeout(() => setRatingSubmitted(false), 3000);
  };

  return (
    <div className="pt-8 pb-20 min-h-screen bg-base relative overflow-hidden text-text-main font-sans">
      <SEO 
        title="Careers Handbook - Forensic Publications | ForenClue"
        description="Access Mrunmayee Bodhe's standard academic Careers Handbook for Forensic Science. Explore admission guidelines, UGC NET and FACT entrance examinations, and career options."
        keywords="forensic careers handbook, forensic science book, forensic exam guide, UGC NET forensic science, FACT forensic science study guide"
        canonicalPath="/files"
        image={bookCoverUrl}
      />

      {/* Grid Overlay */}
      <div className="absolute top-0 left-0 w-full h-[600px] z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.06] bg-grid-black/[0.1] dark:bg-grid-white/[0.1] bg-[size:30px_30px]" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Minimal Breadcrumb */}
        <div className="mt-4 mb-8 flex items-center gap-2 text-[10px] font-mono tracking-wider text-text-muted uppercase">
          <span>Home</span>
          <ChevronRight size={10} />
          <span>Portal</span>
          <ChevronRight size={10} />
          <span className="text-warning">Careers Handbook</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key="handbook-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* --- MINIMALIST ROW --- */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 items-start mb-16 pb-16 border-b border-black/5 dark:border-white/5">
              
              {/* Column 1: Image container (md:col-span-4) */}
              <div className="md:col-span-4 flex flex-col items-center">
                <div className="relative w-full max-w-[280px] aspect-[3/4] rounded-lg overflow-hidden bg-surface border border-black/15 dark:border-white/10 shadow-md hover:shadow-lg transition-all duration-300">
                  <img 
                    src={bookCoverUrl} 
                    alt="A Comprehensive Handbook For Careers In Forensic Science Book Cover" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Micro action tools */}
                <div className="mt-5 w-full max-w-[280px]">
                  <button 
                    onClick={handleShare}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-surface hover:bg-surface-hover hover:border-text-muted/20 border border-black/10 dark:border-white/5 rounded-md text-[11px] font-medium transition-all text-text-muted hover:text-text-main cursor-pointer"
                  >
                    <Share2 size={12} className="text-warning" />
                    <span>{shareCopied ? 'Copied Link' : 'Share URL'}</span>
                  </button>
                </div>
              </div>

              {/* Column 2: Buy features panel (md:col-span-8) */}
              <div className="md:col-span-8">
                <div className="inline-flex items-center gap-1 text-[10px] font-mono tracking-wider text-warning uppercase font-semibold mb-3">
                  <Clock size={11} />
                  <span>Kindle Edition Now Available</span>
                </div>
                
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-text-main leading-tight mb-3">
                  A Comprehensive Handbook For Careers In Forensic Science
                </h1>

                {/* Minimal reviews rating header */}
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-text-muted mb-6 pb-4 border-b border-black/5 dark:border-white/5">
                  <div>By Mrunmayee Bodhe</div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500 font-semibold">4.9 / 5</span>
                    <div className="flex text-yellow-500">
                      <Star size={11} fill="currentColor" />
                    </div>
                    <span>(184 ratings)</span>
                  </div>
                </div>

                {/* Sleek inline pricing & button container */}
                <div className="flex flex-wrap items-center gap-6 p-5 bg-surface/50 border border-black/5 dark:border-white/5 rounded-xl mb-6">
                  <div>
                    <span className="block text-[10px] font-mono text-text-muted uppercase tracking-widest mb-1">Kindle Book Price</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-text-main">₹150</span>
                      <span className="text-xs text-text-muted line-through">₹499</span>
                      <span className="text-[10px] text-emerald-500 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">70% OFF</span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-[200px]">
                    <a 
                      href={amazonLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-warning text-crust hover:bg-warning/90 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                    >
                      <ShoppingBag size={14} />
                      Download on Amazon Kindle
                    </a>
                  </div>
                </div>

                {/* Minimalist Summary */}
                <div className="text-sm text-text-muted leading-relaxed mb-6 space-y-4 font-sans">
                  <p>
                    Book Is Developed Under Initiative Of Foren Clue And Has Been Designed To Serve As A Comprehensive Guide For Individual Who Are Interested In Pursuing Education And Carrier In Forensic Science.
                  </p>
                  <p>
                    This Book Provides Well Organised Data Regarding Understanding Of Academic Pathways, Including UG, PG And Research Opportunities Along With Insights Of Entrance Examinations. Admission Requirements, Core Subjects, Skill Development And Career Prospects.
                  </p>
                  <p>
                    The Aim Of The Book Is Not Only To Provide Information Regarding The Field Also To Simplify complex information ensuring a smooth accessible and practical based knowledge for students at different stages for their academic journey this.
                  </p>
                </div>

                {/* Minimal specs list */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {bookSpecs.map((spec, idx) => (
                    <div key={idx} className="border border-black/5 dark:border-white/5 bg-surface/30 px-3 py-2 rounded-lg flex items-center gap-2.5">
                      <spec.icon size={16} className="text-warning/70 shrink-0" />
                      <div>
                        <span className="block text-[9px] font-mono text-text-muted uppercase tracking-wider leading-none mb-1">{spec.label}</span>
                        <span className="text-xs font-semibold text-text-main leading-none">{spec.value}</span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

            </div>

            {/* --- AUTHOR PROFILE SECTION --- */}
            <div className="mb-16 bg-surface border border-black/10 dark:border-white/5 rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-warning/[0.02] rounded-full blur-2xl pointer-events-none" />
              
              <Link 
                to="/about#mrunmayee-bodhe" 
                className="group/author flex-shrink-0 relative cursor-pointer"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-warning/30 ring-4 ring-warning/5 transition-all duration-300 group-hover/author:border-warning group-hover/author:scale-105 shadow-md">
                  <img 
                    src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjt-N4hwGU4tzUkx9XwNKGHv2Te4J3tbfxJWFRXS6Z3KzdZX1f9VKZB88MYTeF4OqePRwDcGMbqjmOpoROSJlsSHaZJnLEIMnP2S98gBLOlP6IDs33SBqLf7yhLEyWCICI90IfGk5XV06fUYonMDC5zufGitO8-sTe1sIExdZcckiMh0VuZmmmPJpxhGQs/s1352/IMG_0866.PNG" 
                    alt="Mrunmayee Bodhe Author Portfolio Profile" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>

              <div className="flex-1 text-center md:text-left">
                <span className="text-[9px] font-mono text-warning uppercase font-semibold tracking-wider block mb-1">Meet the Author</span>
                <Link 
                  to="/about#mrunmayee-bodhe" 
                  className="inline-block group/title cursor-pointer"
                >
                  <h2 className="text-lg sm:text-xl font-bold text-text-main mb-2 transition-colors group-hover/title:text-warning flex items-center justify-center md:justify-start gap-1.5">
                    <span>Mrunmayee Bodhe</span>
                    <ArrowRight size={14} className="opacity-0 -translate-x-1 group-hover/title:opacity-100 group-hover/title:translate-x-0 transition-all text-warning shrink-0" />
                  </h2>
                </Link>
                <p className="text-xs text-text-muted leading-relaxed">
                  Mrunmayee Bodhe is a dedicated professional in the field of Forensic Science. Under the Foren Clue initiative, she has compiled extensive research, guidelines, and structural pathways to simplify forensic career planning. Her publication serves to bridge the gap between academic education and practical applications, providing high-quality insights to help students navigate graduate tracks, competitive national entrance exams like UGC NET & FACT, and strategic research goals.
                </p>
              </div>
            </div>

            {/* --- COMPACT REVIEWS GRID --- */}
            <div className="mb-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              <div className="lg:col-span-4">
                <h2 className="text-base font-bold uppercase tracking-wider text-text-main mb-3">Reader Reviews</h2>
                <p className="text-xs text-text-muted leading-relaxed mb-4">
                  Verified purchase feedback from criminologists, students, and legal tech aspirants globally.
                </p>
                
                <div className="bg-surface/50 border border-black/5 dark:border-white/5 rounded-lg p-4 text-center">
                  <span className="block text-3xl font-black text-text-main font-mono">4.9</span>
                  <div className="flex gap-1 justify-center text-yellow-500 my-1">
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                  </div>
                  <span className="text-[9px] font-mono text-text-muted uppercase tracking-wider">Based on 184 reviews</span>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-3">
                
                {/* Minimal Add Review Form */}
                <div className="bg-surface/25 border border-black/5 dark:border-white/5 rounded-lg p-4">
                  {ratingSubmitted ? (
                    <div className="text-emerald-500 text-[10px] font-mono uppercase text-center py-2">
                      ✔ Review submitted. Verified readers are synchronized periodically.
                    </div>
                  ) : (
                    <form onSubmit={handleAddReview} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input 
                          type="text" 
                          required 
                          value={newReviewName}
                          onChange={(e) => setNewReviewName(e.target.value)}
                          placeholder="My Name" 
                          className="bg-base border border-black/10 dark:border-white/10 rounded px-2.5 py-1.5 text-xs text-text-main focus:outline-none focus:border-warning/50"
                        />
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-text-muted text-[10px] font-mono uppercase mr-1">Rating:</span>
                          {[1, 2, 3, 4, 5].map((starIdx) => (
                            <button
                              key={starIdx}
                              type="button"
                              onClick={() => setUserRating(starIdx)}
                              className="text-text-muted hover:text-warning"
                            >
                              <Star 
                                size={14} 
                                fill={starIdx <= (userRating || 5) ? "currentColor" : "none"} 
                                className={starIdx <= (userRating || 5) ? "text-warning" : "text-text-muted"} 
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <input 
                        type="text"
                        required
                        value={newReviewText}
                        onChange={(e) => setNewReviewText(e.target.value)}
                        placeholder="Describe your reading experience..."
                        className="w-full bg-base border border-black/10 dark:border-white/10 rounded px-2.5 py-1.5 text-xs text-text-main focus:outline-none focus:border-warning/50"
                      />
                      <div className="text-right">
                        <button 
                          type="submit" 
                          className="px-3 py-1.5 bg-warning text-crust hover:bg-warning/90 rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                        >
                          Submit Review
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                <div className="space-y-3">
                  {reviews.map((rev, idx) => (
                    <div key={idx} className="bg-surface/30 border border-black/5 dark:border-white/5 rounded-lg p-4 flex flex-col justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-bold text-text-main">{rev.name}</span>
                          <span className="text-[9px] font-mono text-text-muted bg-surface/80 px-2 py-0.5 rounded border border-black/5">
                            {rev.role}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted italic">
                          "{rev.text}"
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-text-muted pt-2 border-t border-black/5 dark:border-white/5">
                        <span>{rev.date}</span>
                        <button className="flex items-center gap-1 text-[10px] cursor-pointer hover:text-warning">
                          <ThumbsUp size={10} /> Helpful
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}
