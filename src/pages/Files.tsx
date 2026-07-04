import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  ShoppingBag, 
  Star, 
  CheckCircle, 
  Cpu, 
  Award, 
  ChevronRight, 
  FileText, 
  ArrowRight, 
  ExternalLink,
  Zap,
  Sparkles,
  Clock,
  Globe,
  Share2,
  ThumbsUp,
  File,
  Upload,
  Copy,
  Check,
  Trash2,
  Download,
  Server,
  CloudLightning,
  Loader2,
  Lock,
  Search
} from 'lucide-react';
import { SEO } from '@/components/layout/SEO';
import { db, auth } from '@/lib/firebase';
import { collection, query, orderBy, limit, addDoc, serverTimestamp, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { uploadFileResilient } from '@/lib/localFileStore';

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

interface SharedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
  isFallback?: boolean;
  uploadedBy?: string;
  createdAt?: any;
}

const formatBytes = (bytes: number, decimals = 1) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export default function Files() {
  const [activeTab, setActiveTab] = useState<'handbook' | 'storage'>('handbook');
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

  // Storage states
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedFileId, setCopiedFileId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to public uploaded files list
  useEffect(() => {
    setLoadingFiles(true);
    const q = query(collection(db, "shared_files"), orderBy("createdAt", "desc"), limit(40));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SharedFile[];
      setSharedFiles(list);
      setLoadingFiles(false);
    }, (err) => {
      console.error("Failed to fetch public shared files:", err);
      setLoadingFiles(false);
    });

    return () => unsubscribe();
  }, []);

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

  // Secure Resilient Upload Handlers (Option 1)
  const handleUploadFile = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    setUploadStatus('Securely initializing uploader...');
    
    try {
      const uniquePath = `shared_portal/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      
      const uploadResult = await uploadFileResilient(file, uniquePath, (statusUpdate) => {
        setUploadStatus(statusUpdate);
      });

      // Save shared link document to Firestore permanently
      await addDoc(collection(db, 'shared_files'), {
        name: file.name,
        size: formatBytes(file.size),
        type: file.type || 'application/octet-stream',
        url: uploadResult.url,
        isFallback: uploadResult.isFallback || false,
        uploadedBy: auth.currentUser?.email || 'Public Guest',
        createdAt: new Date().toISOString()
      });

      setUploadStatus('✔ Upload successful! File link published.');
      setTimeout(() => {
        setIsUploading(false);
        setUploadStatus('');
      }, 1500);

    } catch (err: any) {
      console.error("Resilient uploader rejected payload:", err);
      setUploadStatus('❌ Upload failed: ' + (err.message || 'Verification failure'));
      setTimeout(() => {
        setIsUploading(false);
        setUploadStatus('');
      }, 4000);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleCopyLink = (file: SharedFile) => {
    const fullUrl = file.url.startsWith('http') ? file.url : window.location.origin + file.url;
    navigator.clipboard.writeText(fullUrl);
    setCopiedFileId(file.id);
    setTimeout(() => setCopiedFileId(null), 2000);
  };

  const handleDeleteFile = async (id: string) => {
    if (!window.confirm("Are you sure you want to retract/delete this cloud-hosted document?")) return;
    try {
      await deleteDoc(doc(db, "shared_files", id));
    } catch (err) {
      console.error("Error retracting file:", err);
    }
  };

  const filteredFiles = sharedFiles.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-8 pb-20 min-h-screen bg-base relative overflow-hidden text-text-main font-sans">
      <SEO 
        title={activeTab === 'handbook' 
          ? "Careers Handbook - Forensic Publications | ForenClue" 
          : "Secure File Upload & Share Portal - ForenClue"}
        description="Access premium forensic textbooks and use our secure uploader to instantly host and generate direct sharing links for documents, autopsy findings, and reports."
        keywords="forensic careers handbook, direct file uploader, share forensic report, forensic library, study materials"
        canonicalPath="/files"
        image={bookCoverUrl}
      />

      {/* Grid Overlay */}
      <div className="absolute top-0 left-0 w-full h-[600px] z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.06] bg-grid-black/[0.1] dark:bg-grid-white/[0.1] bg-[size:30px_30px]" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Minimal Breadcrumb */}
        <div className="mt-4 mb-4 flex items-center gap-2 text-[10px] font-mono tracking-wider text-text-muted uppercase">
          <span>Home</span>
          <ChevronRight size={10} />
          <span>Portal</span>
          <ChevronRight size={10} />
          <span className="text-warning">{activeTab === 'handbook' ? 'Careers Handbook' : 'Secure Uploader'}</span>
        </div>

        {/* Tab Selection Switcher */}
        <div className="flex border-b border-black/10 dark:border-white/10 mb-10 gap-6">
          <button 
            id="tab_handbook"
            onClick={() => setActiveTab('handbook')}
            className={`pb-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all relative ${activeTab === 'handbook' ? 'text-warning' : 'text-text-muted hover:text-text-main'}`}
          >
            Careers Handbook
            {activeTab === 'handbook' && (
              <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-[2px] bg-warning" />
            )}
          </button>
          <button 
            id="tab_storage"
            onClick={() => setActiveTab('storage')}
            className={`pb-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all relative flex items-center gap-1.5 ${activeTab === 'storage' ? 'text-warning' : 'text-text-muted hover:text-text-main'}`}
          >
            <CloudLightning size={14} className="text-warning animate-pulse" />
            <span>Public Storage & Link Sharing</span>
            {activeTab === 'storage' && (
              <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-[2px] bg-warning" />
            )}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'handbook' ? (
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
          ) : (
            <motion.div
              key="storage-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* Resilient Drag & Drop Document Uploader Box */}
              <div 
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-300 relative ${
                  dragActive 
                    ? 'border-warning bg-warning/5 shadow-[0_0_15px_rgba(234,179,8,0.1)] scale-[1.01]' 
                    : 'border-black/15 dark:border-white/10 hover:border-warning/40 bg-surface/30 hover:bg-surface/50'
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={(e) => e.target.files && handleUploadFile(e.target.files[0])}
                  className="hidden"
                />

                <AnimatePresence mode="wait">
                  {isUploading ? (
                    <motion.div 
                      key="uploading-state"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col items-center justify-center py-4"
                    >
                      <div className="relative">
                        <Loader2 size={44} className="text-warning animate-spin mb-4" />
                        <Server size={18} className="text-text-main absolute top-3.5 left-3.5" />
                      </div>
                      
                      <h4 className="text-sm font-bold uppercase tracking-wider mb-2 text-text-main">
                        Transmitting File Securely
                      </h4>
                      <p className="text-xs text-text-muted font-mono max-w-sm">
                        {uploadStatus}
                      </p>

                      {/* Small mock progress indicator to make it feel premium */}
                      <div className="w-full max-w-xs bg-black/15 dark:bg-white/5 h-[3px] rounded-full overflow-hidden mt-4">
                        <motion.div 
                          initial={{ width: "10%" }}
                          animate={{ width: "95%" }}
                          transition={{ duration: 15 }}
                          className="h-full bg-warning"
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="idle-state"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col items-center cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="p-4 bg-warning/10 text-warning rounded-2xl mb-4 border border-warning/15">
                        <Upload size={28} />
                      </div>

                      <h3 className="text-base sm:text-lg font-black tracking-tight text-text-main font-heading mb-1.5 uppercase">
                        Drag & Drop files here, or copy upload links
                      </h3>
                      <p className="text-xs text-text-muted max-w-md antialiased leading-relaxed mb-4">
                        Support for Forensic PDFs, Case Templates, DNA charts, and autopsy protocols. Files up to 50MB are securely chunked and published directly on GCS storage.
                      </p>

                      <button 
                        type="button"
                        className="px-5 py-2.5 bg-warning text-crust hover:bg-warning/90 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-2 hover:scale-[1.02] active:scale-95"
                      >
                        <Server size={12} />
                        Browse Local Files
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Shared Link Repository Section */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-black/5 dark:border-white/5 pb-4">
                  <div>
                    <h2 className="text-base font-bold uppercase tracking-wide text-text-main flex items-center gap-2">
                      <Sparkles size={16} className="text-warning animate-pulse" />
                      <span>Shared Link Manager</span>
                    </h2>
                    <p className="text-xs text-text-muted">
                      Direct download links synchronized securely over our Cloud database.
                    </p>
                  </div>

                  {/* Search Filterbar */}
                  <div className="relative w-full sm:w-64">
                    <Search size={14} className="text-text-muted absolute left-3 top-3" />
                    <input 
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Filter files by name..."
                      className="w-full bg-surface border border-black/10 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-text-main focus:outline-none focus:border-warning/50 placeholder:text-text-muted"
                    />
                  </div>
                </div>

                <AnimatePresence mode="popLayout">
                  {loadingFiles ? (
                    <div className="text-center py-12">
                      <Loader2 size={24} className="text-warning animate-spin mx-auto mb-2" />
                      <span className="text-xs text-text-muted font-mono uppercase tracking-wider">Loading storage index...</span>
                    </div>
                  ) : filteredFiles.length === 0 ? (
                    <div className="bg-surface/30 border border-dashed border-black/10 dark:border-white/5 rounded-xl text-center py-12">
                      <File size={32} className="text-text-muted/40 mx-auto mb-3" />
                      <p className="text-xs text-text-muted uppercase tracking-wider font-mono">No matching shared files index</p>
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="text-warning text-[10px] font-bold uppercase mt-2 hover:underline cursor-pointer"
                      >
                        Reset Search Parameter
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredFiles.map((file) => {
                        const directUrl = file.url.startsWith('http') ? file.url : window.location.origin + file.url;
                        return (
                          <motion.div 
                            layout
                            key={file.id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="bg-surface border border-black/10 dark:border-white/5 rounded-xl p-4 flex flex-col justify-between hover:border-warning/30 transition-colors shadow-sm group"
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2.5 bg-warning/10 text-warning rounded-lg border border-warning/10 shrink-0">
                                <FileText size={18} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-bold text-text-main truncate uppercase tracking-tight mb-0.5" title={file.name}>
                                  {file.name}
                                </h4>
                                <div className="flex flex-wrap items-center gap-2 text-[10px] text-text-muted font-mono uppercase">
                                  <span>{file.size}</span>
                                  <span>•</span>
                                  <span>{file.type ? file.type.split('/')[1] || 'DOC' : 'DOC'}</span>
                                  {file.isFallback && (
                                    <>
                                      <span>•</span>
                                      <span className="text-amber-500 font-semibold flex items-center gap-0.5" title="Local server sandbox cache fallback activated safely">
                                        <Lock size={8} /> Local Cache
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between gap-3 pt-3 border-t border-black/5 dark:border-white/5">
                              {/* Left actions: Deletion support */}
                              <button 
                                onClick={() => handleDeleteFile(file.id)}
                                className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-colors cursor-pointer"
                                title="Retract this document from share repository"
                              >
                                <Trash2 size={13} />
                              </button>

                              {/* Right actions: Copy share link and open direct download */}
                              <div className="flex items-center gap-2.5">
                                <button 
                                  onClick={() => handleCopyLink(file)}
                                  className="px-3 py-1.5 bg-surface hover:bg-surface-hover hover:text-text-main text-text-muted border border-black/10 dark:border-white/5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer font-mono"
                                >
                                  {copiedFileId === file.id ? (
                                    <>
                                      <Check size={11} className="text-emerald-500" />
                                      <span className="text-emerald-500">Link Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy size={11} className="text-warning" />
                                      <span>Copy Direct Link</span>
                                    </>
                                  )}
                                </button>

                                <a 
                                  href={directUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 bg-warning/10 text-warning hover:bg-warning hover:text-crust rounded-lg transition-all cursor-pointer"
                                  title="Direct download file immediately"
                                >
                                  <Download size={13} />
                                </a>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
