import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  FileText, 
  HelpCircle, 
  Archive, 
  Search, 
  Download, 
  Eye, 
  ExternalLink,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  ChevronRight,
  Share2,
  Copy,
  Check,
  X,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { SEO } from '@/components/layout/SEO';
import { SEOManager } from '@/components/layout/SEOManager';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { PdfViewerModal } from '@/components/ui/PdfViewerModal';

// Static book cover asset (same as original/fallback)
const bookCoverUrl = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEive7NdnBis_kLLqaN2d8q37014tEMd2ftmqFkeCIiLjxkG2sDfip5VQldxh9izJC-KTsD4ZfXnILFWEOG2jmJkwdKww8-jqW-2jAqpTsv4AOE47MkqpHHibGcBN4GhPqN3OIF1xxIbs0KQLRgxfk2XJRsdlQyY_JqqRnajm2-pB1xoiZN4BnkdtDc9ICU/s1500/1779707899.png';

interface ForensicResource {
  id: string;
  title: string;
  author: string;
  year: number | string;
  category: string;
  tabCategory: 'books' | 'notes' | 'papers' | 'other';
  type: string;
  size: string;
  desc: string;
  pdfUrl?: string;
  image?: string;
  coverImage?: string;
  rating?: number;
  downloads?: number;
  // Volunteer & Member Contributor Recognition
  uploadedBy?: string;
  uploaderName?: string;
  uploaderRole?: string;
  uploaderPhoto?: string;
  volunteerId?: string;
}

// Premium forensic academic collection (fallback & defaults)
const defaultResources: ForensicResource[] = [];

const forensicCategories = [
  'All',
  'General',
  'DNA & Serology',
  'Fingerprinting & Dactyloscopy',
  'Digital Forensics & Cyber',
  'Ballistics & Firearms',
  'Crime Scene Investigation',
  'Toxicology & Pharmacology',
  'Forensic Medicine & Pathology',
  'Question Papers'
];

export default function EBooks() {
  const [activeTab, setActiveTab] = useState<'books' | 'notes' | 'papers' | 'other'>('books');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dbEBooks, setDbEBooks] = useState<ForensicResource[]>([]);
  const [selectedResource, setSelectedResource] = useState<ForensicResource | null>(null);
  const [sharingResource, setSharingResource] = useState<ForensicResource | null>(null);

  // Sync / Real-time fetch from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'ebooks'), (snapshot) => {
      const list: ForensicResource[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          title: d.title || 'Untitled Reference',
          author: d.author || 'Forensic Expert',
          year: d.year || 2024,
          category: d.category || 'General',
          tabCategory: (d.tabCategory as any) || 'books',
          type: d.type || 'PDF',
          size: d.size || '5MB',
          desc: d.desc || 'Forensic reference documentation.',
          pdfUrl: d.pdfUrl || '',
          image: d.image || d.coverImage || '',
          rating: d.rating || 4.5,
          downloads: d.downloads || 0,
          uploadedBy: d.uploadedBy || d.uploaderName || '',
          uploaderName: d.uploaderName || d.uploadedBy || '',
          uploaderRole: d.uploaderRole || 'Volunteer Contributor',
          uploaderPhoto: d.uploaderPhoto || '',
          volunteerId: d.volunteerId || ''
        });
      });
      setDbEBooks(list);
    }, (error) => {
      console.warn("Could not retrieve real-time eBooks from Firestore, using static repository:", error);
    });

    return () => unsubscribe();
  }, []);

  // Merge database items with our standard fallback collection
  const combinedCatalog = [...dbEBooks, ...defaultResources];

  // Filters
  const filteredCatalog = combinedCatalog.filter((item) => {
    if (item.tabCategory !== activeTab) return false;
    
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;

    if (searchQuery) {
      const queryStr = searchQuery.toLowerCase();
      const titleMatch = (item.title || '').toLowerCase().includes(queryStr);
      const authorMatch = (item.author || '').toLowerCase().includes(queryStr);
      const descMatch = (item.desc || '').toLowerCase().includes(queryStr);
      const uploaderMatch = (item.uploadedBy || item.uploaderName || '').toLowerCase().includes(queryStr);
      const volIdMatch = (item.volunteerId || '').toLowerCase().includes(queryStr);
      if (!titleMatch && !authorMatch && !descMatch && !uploaderMatch && !volIdMatch) return false;
    }

    return true;
  });

  const handleDownload = (item: ForensicResource) => {
    try {
      const link = document.createElement('a');
      link.href = item.pdfUrl || bookCoverUrl;
      link.setAttribute('download', `${item.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (_) {
      window.open(item.pdfUrl || bookCoverUrl, '_blank');
    }
  };

  const tabs = [
    { id: 'books' as const, name: 'Reference Books', icon: BookOpen },
    { id: 'notes' as const, name: 'Notes', icon: FileText },
    { id: 'papers' as const, name: 'Question Papers', icon: HelpCircle },
    { id: 'other' as const, name: 'Other Manuals', icon: Archive }
  ];

  return (
    <div className="pt-8 pb-20 min-h-screen bg-base relative overflow-hidden text-text-main font-sans">
      <SEOManager 
        collectionName="ebooks"
        docId={selectedResource?.id}
        initialData={selectedResource}
        fallbackTitle={selectedResource ? `${selectedResource.title} | ForenClue eLibrary` : "Academic eLibrary - Reference Textbook Vault"}
        fallbackDescription={selectedResource ? (selectedResource.desc || "Academic eLibrary resource") : "Access standard academic forensic medicine textbooks, handwritten toxicology notes, national eligibility solved papers, and standard extraction protocols."}
        keywords="forensic library, forenclue, forensic textbooks, toxicological revision keys, UGC NET papers"
        canonicalPath={selectedResource ? `/ebooks?id=${selectedResource.id}` : "/ebooks"}
        fallbackImage={selectedResource?.coverImage || selectedResource?.image || "/images/og/library.png"}
        type={selectedResource ? "book" : "website"}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'eLibrary', path: '/ebooks' },
          ...(selectedResource ? [{ name: selectedResource.title, path: `/ebooks?id=${selectedResource.id}` }] : [])
        ]}
        faqs={[
          { question: "What resources are in the ForenClue eLibrary?", answer: "Our library hosts digital forensic medicine manuals, toxicological revision notes, previous UGC NET exam paper solutions, and active lab extraction protocols." },
          { question: "Can I download these books and notes?", answer: "Yes, standard public reference books, revision notes, and past exams are fully available for on-demand study access on our learning portal." }
        ]}
      />


      {/* Grid Overlay */}
      <div className="absolute top-0 left-0 w-full h-[600px] z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.06] bg-grid-black/[0.1] dark:bg-grid-white/[0.1] bg-[size:30px_30px]" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        


        {/* --- HEADER BLOCK --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-black/10 dark:border-white/5">
          <div className="space-y-2 text-left">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-main uppercase">
              Digital <span className="text-warning">eLibrary</span>
            </h1>
            <p className="text-sm text-text-muted max-w-xl">
              Academic manuals, handwritten notes, previous exam keys, and toxicological analysis sheets organized dynamically under academic criteria.
            </p>
          </div>
        </div>

        {/* --- FILTER CONTROL BAR --- */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 bg-surface border border-black/10 dark:border-white/5 rounded-2xl mb-8">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-text-muted" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search symptoms, Galton pattern structures..."
              className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-text-main placeholder-text-muted/50 focus:outline-none focus:border-warning/50 focus:ring-1 focus:ring-warning/50 transition-all"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 text-text-muted text-[10px] font-mono uppercase tracking-wider">
              <SlidersHorizontal size={12} />
              <span>Category:</span>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-base border border-black/10 dark:border-white/10 text-xs text-text-main px-3 py-2.5 rounded-xl focus:outline-none focus:border-warning/50"
            >
              {forensicCategories.map((cat) => (
                <option key={cat} value={cat}>{cat === 'All' ? 'All Forensic Disciplines' : cat}</option>
              ))}
            </select>
          </div>

        </div>

        {/* --- TAB CONTROL ROW --- */}
        <div className="flex border-b border-black/10 dark:border-white/10 mb-8 gap-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery('');
                }}
                className={cn(
                  "pb-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all relative flex items-center gap-2 cursor-pointer",
                  isActive ? 'text-warning' : 'text-text-muted hover:text-text-main'
                )}
              >
                <Icon size={14} className={isActive ? 'text-warning' : 'text-text-muted'} />
                <span>{tab.name}</span>
                {isActive && (
                  <motion.div layoutId="elibTabUnderline" className="absolute bottom-0 left-0 right-0 h-[2px] bg-warning" />
                )}
              </button>
            );
          })}
        </div>

        {/* --- CATALOG GRID --- */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + selectedCategory + searchQuery}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {filteredCatalog.length === 0 ? (
              <div className="text-center py-16 bg-surface/50 border border-dashed border-black/10 dark:border-white/5 rounded-2xl">
                <BookOpen size={40} className="text-text-muted/40 mx-auto mb-3" />
                <h3 className="text-sm font-bold uppercase tracking-wider mb-1">No Library Records</h3>
                <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
                  We found no documents matching your search or category parameter in this section. Try clearing filters.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="mt-4 text-xs font-bold text-warning uppercase hover:underline"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCatalog.map((item) => (
                  <ResourceCard 
                    key={item.id} 
                    item={item} 
                    onOpen={() => setSelectedResource(item)}
                    onDownload={() => handleDownload(item)}
                    onShare={() => setSharingResource(item)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>

      {/* --- MODALS --- */}
      {selectedResource && (
        <PdfViewerModal 
          isOpen={!!selectedResource}
          onClose={() => setSelectedResource(null)}
          resource={selectedResource}
          startMaximized={true}
        />
      )}

      {/* --- SHARE MODAL --- */}
      {sharingResource && (
        <ShareModal
          isOpen={!!sharingResource}
          onClose={() => setSharingResource(null)}
          item={sharingResource}
        />
      )}

    </div>
  );
}

// Subcomponent: Share Modal
interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ForensicResource | null;
}

function ShareModal({ isOpen, onClose, item }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState('');

  if (!isOpen || !item) return null;

  const shareUrl = `${window.location.origin}/ebooks?id=${encodeURIComponent(item.id)}`;
  const shareText = `Check out "${item.title}" (${item.category || item.type}) by ${item.author} on ForenClue eLibrary!`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setCopiedNotice('Direct link copied to clipboard!');
      setTimeout(() => {
        setCopied(false);
        setCopiedNotice('');
      }, 3000);
    } catch (_) {
      // Fallback
    }
  };

  const handleInstagramShare = async () => {
    try {
      const formattedText = `${shareText}\n\nAccess file: ${shareUrl}`;
      await navigator.clipboard.writeText(formattedText);
      setCopiedNotice('Text copied! Launching Instagram...');
      setTimeout(() => setCopiedNotice(''), 4500);
      window.open('https://www.instagram.com/', '_blank');
    } catch (_) {
      window.open('https://www.instagram.com/', '_blank');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: shareText,
          url: shareUrl,
        });
      } catch (_) {}
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-surface border border-black/15 dark:border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden text-left"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-warning/10 text-warning rounded-xl">
                <Share2 size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wide text-text-main">
                  Share Reference Document
                </h3>
                <p className="text-[11px] text-text-muted">Spread reference files & academic guides</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-text-muted hover:text-text-main transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Item Preview Card */}
          <div className="mt-4 p-3 bg-base border border-black/10 dark:border-white/5 rounded-xl flex items-center gap-3">
            <div className="w-12 h-16 bg-black/30 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-white/10">
              {item.image || item.coverImage ? (
                <img src={item.image || item.coverImage} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <BookOpen size={20} className="text-warning/50" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[9px] font-mono uppercase bg-warning/10 text-warning px-1.5 py-0.5 rounded font-bold">
                {item.category}
              </span>
              <h4 className="text-xs font-bold text-text-main truncate mt-1" title={item.title}>
                {item.title}
              </h4>
              <p className="text-[10px] text-text-muted truncate mt-0.5">By {item.author}</p>
            </div>
          </div>

          {/* Toast Notice */}
          {copiedNotice && (
            <div className="mt-3 py-2 px-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2">
              <Check size={14} className="text-emerald-500" />
              <span>{copiedNotice}</span>
            </div>
          )}

          {/* Social Platforms Grid */}
          <div className="mt-4 space-y-2">
            <label className="text-[10px] font-mono text-text-muted uppercase tracking-wider block font-bold">
              Share to Social Media
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {/* WhatsApp */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-white transition-all group cursor-pointer"
              >
                <svg className="w-6 h-6 fill-current mb-1 group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 001.333 4.993L2 22l5.233-1.237a9.96 9.96 0 004.779 1.217h.004c5.505 0 9.988-4.478 9.989-9.985 0-2.669-1.038-5.176-2.925-7.062A9.92 9.92 0 0012.012 2zm5.836 14.159c-.241.677-1.398 1.309-1.921 1.38-.49.066-1.118.095-1.802-.124-.413-.131-.945-.304-1.636-.602-2.887-1.247-4.764-4.177-4.908-4.37-.143-.192-1.171-1.558-1.171-2.97 0-1.413.738-2.108 1.001-2.395.263-.288.572-.36.763-.36.19 0 .382.002.548.01.178.008.417-.067.652.496.242.58.825 2.011.897 2.155.072.144.12.312.024.504-.096.192-.144.312-.287.48-.143.168-.302.376-.431.504-.143.144-.292.302-.126.588.167.287.742 1.222 1.593 1.98 1.096.976 2.018 1.278 2.305 1.422.287.144.455.12.623-.072.168-.192.718-.838.909-1.126.192-.288.383-.24.646-.144.263.096 1.674.79 1.961.934.288.144.479.216.551.336.072.12.072.695-.169 1.372z"/></svg>
                <span className="text-[10px] font-bold">WhatsApp</span>
              </a>

              {/* Instagram */}
              <button
                onClick={handleInstagramShare}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-br from-[#833AB4]/10 via-[#FD1D1D]/10 to-[#FCB045]/10 border border-[#FD1D1D]/20 hover:from-[#833AB4] hover:via-[#FD1D1D] hover:to-[#FCB045] text-[#E1306C] hover:text-white transition-all group cursor-pointer"
              >
                <svg className="w-6 h-6 fill-current mb-1 group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                <span className="text-[10px] font-bold">Instagram</span>
              </button>

              {/* Telegram */}
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#0088cc]/10 border border-[#0088cc]/20 hover:bg-[#0088cc] text-[#0088cc] hover:text-white transition-all group cursor-pointer"
              >
                <svg className="w-6 h-6 fill-current mb-1 group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
                <span className="text-[10px] font-bold">Telegram</span>
              </a>

              {/* LinkedIn */}
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#0A66C2]/10 border border-[#0A66C2]/20 hover:bg-[#0A66C2] text-[#0A66C2] hover:text-white transition-all group cursor-pointer"
              >
                <svg className="w-6 h-6 fill-current mb-1 group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.6a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2z"/></svg>
                <span className="text-[10px] font-bold">LinkedIn</span>
              </a>

              {/* X / Twitter */}
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-black/10 dark:bg-white/10 border border-black/20 dark:border-white/20 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-text-main transition-all group cursor-pointer"
              >
                <svg className="w-6 h-6 fill-current mb-1 group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                <span className="text-[10px] font-bold">X (Twitter)</span>
              </a>

              {/* Facebook */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#1877F2]/10 border border-[#1877F2]/20 hover:bg-[#1877F2] text-[#1877F2] hover:text-white transition-all group cursor-pointer"
              >
                <svg className="w-6 h-6 fill-current mb-1 group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                <span className="text-[10px] font-bold">Facebook</span>
              </a>
            </div>
          </div>

          {/* Copy Direct Link */}
          <div className="mt-5 pt-4 border-t border-black/10 dark:border-white/10 space-y-2">
            <label className="text-[10px] font-mono text-text-muted uppercase tracking-wider block font-bold">
              Direct Reference Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-base border border-black/15 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-text-muted select-all focus:outline-none truncate"
              />
              <button
                onClick={handleCopyLink}
                className={cn(
                  "px-3.5 py-2 text-xs font-extrabold uppercase rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0",
                  copied
                    ? "bg-emerald-500 text-white"
                    : "bg-warning hover:bg-warning/90 text-crust"
                )}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Native Share button if supported */}
          {navigator.share && (
            <button
              onClick={handleNativeShare}
              className="mt-3 w-full py-2.5 bg-base hover:bg-black/5 dark:hover:bg-white/5 border border-black/15 dark:border-white/10 text-text-main text-xs font-extrabold uppercase rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Share2 size={14} className="text-warning" />
              <span>More Share Options</span>
            </button>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// Subcomponent: Resource Card
interface ResourceCardProps {
  item: ForensicResource;
  onOpen: () => void;
  onDownload: () => void;
  onShare: () => void;
}

function ResourceCard({ item, onOpen, onDownload, onShare }: ResourceCardProps) {
  const navigate = useNavigate();
  const profileQuery = item.volunteerId || item.uploaderName || item.uploadedBy || '';

  const handleProfileRedirect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (profileQuery) {
      navigate(`/employees?id=${encodeURIComponent(profileQuery.trim())}`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="bg-surface border border-black/15 dark:border-white/10 hover:border-warning/30 hover:shadow-md rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 relative overflow-hidden group text-left"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-warning/[0.01] rounded-full blur-xl pointer-events-none" />

      <div className="space-y-4">
        {/* Book Spine Portrait or Accent Banner */}
        <div 
          onClick={onOpen}
          className="aspect-[5/3] w-full rounded-xl bg-gradient-to-br from-[#0e1726] to-[#040812] border border-black/10 dark:border-white/5 relative overflow-hidden flex items-center justify-center p-4 shadow-inner cursor-pointer group-hover:border-warning/20"
        >
          {/* Subtle visual grid texture */}
          <div className="absolute inset-0 bg-grid-white/[0.01] bg-[size:16px_16px]" />
          
          {/* Quick Share Badge on Cover */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare();
            }}
            className="absolute top-2.5 right-2.5 p-2 bg-black/60 hover:bg-warning hover:text-crust backdrop-blur-md border border-white/20 text-white rounded-xl transition-all shadow-md active:scale-95 cursor-pointer z-10"
            title="Share on WhatsApp, Instagram, Telegram, LinkedIn, etc."
          >
            <Share2 size={13} />
          </button>

          {item.image || item.coverImage ? (
            <img 
              src={item.image || item.coverImage} 
              alt={item.title} 
              referrerPolicy="no-referrer"
              className="h-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] group-hover:scale-[1.03] transition-transform duration-300"
            />
          ) : (
            <div className="flex flex-col items-center justify-between h-full w-full py-2">
              <span className="text-[9px] font-mono text-warning/40 uppercase tracking-widest">{item.type}</span>
              <BookOpen size={24} className="text-warning/30 my-2 group-hover:scale-110 transition-transform text-center" />
              <div className="text-center">
                <span className="block text-[10px] font-bold text-slate-100 uppercase tracking-wide truncate max-w-[180px]">{item.title}</span>
                <span className="block text-[8px] font-mono text-text-muted mt-0.5 truncate max-w-[180px]">{item.author}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Button Row */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpen}
            className="flex-1 py-2.5 px-3 bg-warning hover:bg-warning/90 active:scale-[0.98] text-crust text-xs font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md hover:shadow-lg cursor-pointer truncate"
          >
            <Eye size={14} />
            <span>Read PDF</span>
          </button>

          <button
            onClick={onDownload}
            className="py-2.5 px-3 bg-base hover:bg-black/10 dark:hover:bg-white/10 active:scale-[0.98] text-text-main border border-black/15 dark:border-white/15 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:border-warning/50 text-xs font-bold shrink-0"
            title="Download PDF Document"
          >
            <Download size={14} />
            <span className="text-[11px] font-extrabold uppercase tracking-wider hidden sm:inline">Download</span>
          </button>
          
          <button
            onClick={onShare}
            className="py-2.5 px-3 bg-base hover:bg-black/10 dark:hover:bg-white/10 active:scale-[0.98] text-text-main border border-black/15 dark:border-white/15 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:border-warning/50 text-xs font-bold shrink-0"
            title="Share on WhatsApp, Instagram, Twitter, LinkedIn"
          >
            <Share2 size={14} className="text-warning" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider hidden sm:inline">Share</span>
          </button>
        </div>

        {/* Text information */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[9px] font-mono bg-warning/10 border border-warning/15 text-warning px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              {item.category}
            </span>
            <span className="text-[9px] font-mono text-text-muted">
              {item.year}
            </span>
          </div>

          <h3 
            onClick={onOpen}
            className="text-sm font-extrabold text-text-main leading-snug cursor-pointer hover:text-warning transition-colors uppercase line-clamp-1"
            title={item.title}
          >
            {item.title}
          </h3>

          <p className="text-[11px] text-text-muted line-clamp-2 leading-relaxed h-[34px]">
            {item.desc}
          </p>

          {/* Volunteer & Member Contributor Recognition */}
          {(item.uploadedBy || item.uploaderName || item.volunteerId) && (
            <div 
              onClick={handleProfileRedirect}
              className="mt-3 p-2.5 bg-warning/5 hover:bg-warning/15 dark:bg-warning/10 dark:hover:bg-warning/20 border border-warning/25 hover:border-warning/50 rounded-xl flex items-center justify-between gap-2 shadow-sm transition-all cursor-pointer group/uploader"
              title="Click to view digital ID card in verification system"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Profile Photo / Avatar Icon with Verification Checkmark */}
                <div className="relative shrink-0">
                  {item.uploaderPhoto ? (
                    <img 
                      src={item.uploaderPhoto} 
                      alt={item.uploaderName || item.uploadedBy || 'Contributor'} 
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover border border-warning/40 shadow-sm group-hover/uploader:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-warning/20 text-warning font-black text-xs flex items-center justify-center border border-warning/40 shadow-sm group-hover/uploader:scale-105 transition-transform">
                      {(item.uploaderName || item.uploadedBy || 'V').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center border border-surface text-[8px] text-white font-bold" title="Verified Volunteer/Member">
                    ✓
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-extrabold text-text-main group-hover/uploader:text-warning transition-colors truncate leading-tight">
                      {item.uploaderName || item.uploadedBy}
                    </span>
                    <span className="text-[8px] font-mono bg-warning/20 text-warning px-1.5 py-0.2 rounded font-bold uppercase shrink-0">
                      {item.uploaderRole || 'Volunteer Contributor'}
                    </span>
                  </div>
                  {item.volunteerId && (
                    <div className="text-[9px] font-mono text-text-muted truncate mt-0.5">
                      Volunteer ID: <span className="font-bold text-warning">{item.volunteerId}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="shrink-0 text-text-muted group-hover/uploader:text-warning transition-colors p-1" title="View Digital ID Card">
                <ShieldCheck size={16} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Row containing file size and format specification */}
      <div className="mt-5 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-3">
        <div className="text-[9px] font-mono text-text-muted uppercase">
          Size: <span className="font-bold text-text-main">{item.size}</span>
        </div>

        <div className="text-[9px] font-mono text-text-muted uppercase">
          Format: <span className="font-bold text-warning">{item.type}</span>
        </div>
      </div>

    </motion.div>
  );
}
