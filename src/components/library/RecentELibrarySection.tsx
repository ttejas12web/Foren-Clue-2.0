import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  FileText, 
  Download, 
  Eye, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink,
  HelpCircle,
  Archive,
  Star
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { PdfViewerModal } from '@/components/ui/PdfViewerModal';

const bookCoverUrl = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEive7NdnBis_kLLqaN2d8q37014tEMd2ftmqFkeCIiLjxkG2sDfip5VQldxh9izJC-KTsD4ZfXnILFWEOG2jmJkwdKww8-jqW-2jAqpTsv4AOE47MkqpHHibGcBN4GhPqN3OIF1xxIbs0KQLRgxfk2XJRsdlQyY_JqqRnajm2-pB1xoiZN4BnkdtDc9ICU/s1500/1779707899.png';

export interface ForensicResource {
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
  createdAt?: string;
  uploadedBy?: string;
  uploaderName?: string;
  uploaderRole?: string;
  uploaderPhoto?: string;
  volunteerId?: string;
}

// Fallback items if Firestore is empty
const defaultRecentResources: ForensicResource[] = [];

export function RecentELibrarySection() {
  const navigate = useNavigate();
  const [resources, setResources] = useState<ForensicResource[]>([]);
  const [selectedResource, setSelectedResource] = useState<ForensicResource | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // Real-time synchronization with Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'ebooks'), (snapshot) => {
      const dbList: ForensicResource[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        dbList.push({
          id: docSnap.id,
          title: d.title || 'Untitled Material',
          author: d.author || 'Forensic Scholar',
          year: d.year || 2024,
          category: d.category || 'General Forensic Science',
          tabCategory: (d.tabCategory as any) || 'books',
          type: d.type || 'PDF',
          size: d.size || '5MB',
          desc: d.desc || 'Academic study documentation and reference materials.',
          pdfUrl: d.pdfUrl || '',
          image: d.image || d.coverImage || '',
          rating: d.rating || 4.8,
          downloads: d.downloads || 0,
          createdAt: d.createdAt || new Date().toISOString(),
          uploadedBy: d.uploadedBy || d.uploaderName || '',
          uploaderName: d.uploaderName || d.uploadedBy || '',
          uploaderRole: d.uploaderRole || 'Volunteer Contributor',
          uploaderPhoto: d.uploaderPhoto || '',
          volunteerId: d.volunteerId || ''
        });
      });

      // Merge Firestore documents with standard defaults
      const combined = [...dbList, ...defaultRecentResources];

      // Deduplicate by ID
      const uniqueMap = new Map<string, ForensicResource>();
      combined.forEach(item => {
        if (!uniqueMap.has(item.id)) {
          uniqueMap.set(item.id, item);
        }
      });

      // Sort: Admin & Contributor uploads first, followed by newest additions
      const sorted = Array.from(uniqueMap.values()).sort((a, b) => {
        const aUploaded = Boolean(a.uploadedBy || a.uploaderName || a.volunteerId);
        const bUploaded = Boolean(b.uploadedBy || b.uploaderName || b.volunteerId);
        if (aUploaded && !bUploaded) return -1;
        if (!aUploaded && bUploaded) return 1;
        return 0;
      });

      setResources(sorted);
    }, (err) => {
      console.warn("Real-time E-Library query fallback to defaults:", err);
      setResources(defaultRecentResources);
    });

    return () => unsubscribe();
  }, []);

  const displayList = resources.slice(0, 6); // Top 6 recently uploaded items

  const handleOpenViewer = (item: ForensicResource) => {
    setSelectedResource(item);
    setIsViewerOpen(true);
  };

  const handleDownload = (e: React.MouseEvent, item: ForensicResource) => {
    e.stopPropagation();
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

  const handleProfileRedirect = (e: React.MouseEvent, profileQuery: string) => {
    e.stopPropagation();
    if (profileQuery) {
      navigate(`/employees?id=${encodeURIComponent(profileQuery.trim())}`);
    }
  };

  return (
    <section className="py-16 !bg-[#0B0F17] border-y border-white/10 relative overflow-hidden font-sans !text-white" style={{ backgroundColor: '#0B0F17', color: '#ffffff' }}>
      {/* Background Subtle Accent Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-warning/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-warning/15 border border-warning/30 rounded-full text-warning text-xs font-black uppercase tracking-widest mb-3 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Recently Uploaded E-Library Material</span>
            </div>
            
            <h2 className="font-heading font-black text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight !text-white" style={{ color: '#ffffff' }}>
              Explore E-Library
            </h2>
            
            <p className="text-sm sm:text-base !text-white mt-2 max-w-2xl leading-relaxed font-normal" style={{ color: '#ffffff', opacity: 0.95 }}>
              Explore recent forensic textbooks, reference keys, UGC NET papers, and laboratory manuals uploaded by admins and academic contributors.
            </p>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {displayList.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-[#121824] border border-dashed border-white/10 rounded-2xl p-6">
              <BookOpen size={36} className="text-warning/60 mx-auto mb-3" />
              <p className="text-sm font-black text-white uppercase tracking-wider">No E-Library Materials Uploaded Yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">Reference textbooks, notes, and solved question papers will appear here as admins and verified contributors upload them.</p>
            </div>
          ) : (
            displayList.map((item) => {
            const profileQuery = item.volunteerId || item.uploaderName || item.uploadedBy || '';

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
                className="!bg-[#121824] border border-white/10 hover:border-warning/50 rounded-2xl p-5 flex flex-col justify-between shadow-lg group transition-all"
                style={{ backgroundColor: '#121824', color: '#ffffff' }}
              >
                <div>
                  {/* Top Header Badge & Type */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-warning/15 text-warning px-2.5 py-0.5 rounded-md border border-warning/30">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-mono !text-slate-300 flex items-center gap-1 !bg-[#070A10] px-2 py-0.5 rounded border border-white/10" style={{ backgroundColor: '#070A10', color: '#cbd5e1' }}>
                      <Clock size={11} className="text-warning" />
                      <span>{item.type} &bull; {item.size}</span>
                    </span>
                  </div>

                  {/* Cover Image Container */}
                  <div 
                    onClick={() => handleOpenViewer(item)}
                    className="aspect-[16/9] sm:aspect-[16/10] w-full rounded-xl bg-gradient-to-br from-[#070A10] via-[#0E1524] to-[#162035] border border-white/10 relative overflow-hidden flex items-center justify-center p-2 mb-3.5 shadow-inner cursor-pointer group-hover:border-warning/40 transition-colors"
                  >
                    {item.image || item.coverImage ? (
                      <img 
                        src={item.image || item.coverImage} 
                        alt={item.title} 
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover sm:object-contain rounded-lg drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] group-hover:scale-[1.03] transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full w-full p-3 text-center">
                        <div className="p-2 rounded-full bg-warning/15 text-warning mb-1.5 border border-warning/25 shadow-sm">
                          <BookOpen size={20} />
                        </div>
                        <span className="text-[11px] font-black text-white uppercase tracking-wider line-clamp-1 max-w-[200px]" style={{ color: '#ffffff' }}>{item.title}</span>
                        <span className="text-[9px] font-mono text-slate-400 truncate max-w-[180px] mt-0.5">{item.author}</span>
                      </div>
                    )}
                  </div>

                  {/* Title & Author */}
                  <h3 
                    onClick={() => handleOpenViewer(item)}
                    className="font-heading font-black text-lg !text-white group-hover:text-warning transition-colors line-clamp-2 cursor-pointer mb-1 leading-snug"
                    style={{ color: '#ffffff' }}
                  >
                    {item.title}
                  </h3>

                  <p className="text-xs !text-slate-300 font-sans mb-3 flex items-center gap-1.5" style={{ color: '#cbd5e1' }}>
                    <span>By <strong className="!text-white" style={{ color: '#ffffff' }}>{item.author}</strong></span>
                    {item.year && <span className="!text-slate-400" style={{ color: '#94a3b8' }}>({item.year})</span>}
                  </p>

                  <p className="text-xs !text-slate-300 font-sans line-clamp-2 leading-relaxed mb-4" style={{ color: '#cbd5e1' }}>
                    {item.desc}
                  </p>

                  {/* Verified Contributor Recognition Banner (if uploaded by member/volunteer) */}
                  {profileQuery && (
                    <div 
                      onClick={(e) => handleProfileRedirect(e, profileQuery)}
                      className="mb-4 p-2.5 bg-warning/10 hover:bg-warning/20 border border-warning/30 hover:border-warning/60 rounded-xl flex items-center justify-between gap-2 shadow-sm transition-all cursor-pointer group/uploader"
                      title="Click to view digital ID card in verification system"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
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
                          <span className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 text-white p-0.5 rounded-full shadow-sm">
                            <CheckCircle2 size={9} />
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] font-extrabold !text-white group-hover/uploader:text-warning transition-colors truncate leading-tight" style={{ color: '#ffffff' }}>
                              {item.uploaderName || item.uploadedBy}
                            </span>
                            <span className="text-[8px] font-mono bg-warning/20 text-warning px-1.5 py-0.2 rounded font-bold uppercase shrink-0">
                              Verified Contributor
                            </span>
                          </div>
                          {item.volunteerId && (
                            <div className="text-[9px] font-mono !text-slate-400 truncate" style={{ color: '#94a3b8' }}>
                              ID: {item.volunteerId}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 text-slate-400 group-hover/uploader:text-warning transition-colors p-1" title="View Digital ID Card">
                        <ShieldCheck size={16} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2 mt-auto">
                  <button
                    onClick={() => handleOpenViewer(item)}
                    className="flex-1 py-2 px-3 bg-warning hover:bg-warning-dark text-slate-950 font-black uppercase text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                  >
                    <Eye size={14} />
                    <span>Read PDF</span>
                  </button>

                  <button
                    onClick={(e) => handleDownload(e, item)}
                    className="p-2 !bg-[#070A10] hover:bg-white/10 !text-white border border-white/10 rounded-xl transition-colors cursor-pointer"
                    style={{ backgroundColor: '#070A10', color: '#ffffff' }}
                    title="Download PDF Document"
                  >
                    <Download size={15} />
                  </button>

                  <Link
                    to={`/ebooks?id=${item.id}`}
                    className="p-2 !bg-[#070A10] hover:bg-white/10 !text-slate-300 hover:!text-white border border-white/10 rounded-xl transition-colors cursor-pointer"
                    style={{ backgroundColor: '#070A10', color: '#cbd5e1' }}
                    title="Open details in E-Library"
                  >
                    <ExternalLink size={15} />
                  </Link>
                </div>
              </motion.div>
            );
          }))}
        </div>

        {/* Footer Navigation Link */}
        <div className="text-center">
          <Link
            to="/ebooks"
            className="inline-flex items-center gap-3 px-8 py-4 !bg-[#121824] hover:bg-white/10 !text-white font-black uppercase tracking-wider rounded-xl border border-white/15 hover:border-warning/50 transition-all shadow-lg group font-sans"
            style={{ backgroundColor: '#121824', color: '#ffffff' }}
          >
            <BookOpen size={18} className="text-warning group-hover:scale-110 transition-transform" />
            <span style={{ color: '#ffffff' }}>Browse E-library</span>
            <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>

      </div>

      {/* Embedded PDF Reader Modal */}
      {selectedResource && (
        <PdfViewerModal
          isOpen={isViewerOpen}
          onClose={() => {
            setIsViewerOpen(false);
            setSelectedResource(null);
          }}
          resource={selectedResource}
        />
      )}
    </section>
  );
}
