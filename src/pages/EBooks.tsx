import { useState, useEffect } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { SEO } from '@/components/layout/SEO';
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
}

// Premium forensic academic collection (fallback & defaults)
const defaultResources: ForensicResource[] = [
  { 
    id: 'reddy', 
    title: 'Concise Forensic Medicine & Toxicology', 
    author: 'Dr. K. S. Narayan Reddy', 
    year: 2015, 
    category: 'Forensic Medicine & Pathology', 
    tabCategory: 'books',
    type: 'PDF', 
    size: '28MB', 
    desc: 'The authoritative, de facto medical manual detailing legal inquests, dactylography pattern identification, postmortem changes, mechanical injuries, and clinical toxicological protocols.',
    rating: 4.9,
    downloads: 1420,
    image: bookCoverUrl
  },
  { 
    id: 'nandy', 
    title: 'Principles of Forensic Medicine', 
    author: 'Apurba Nandy', 
    year: 2021, 
    category: 'Forensic Medicine & Pathology', 
    tabCategory: 'books',
    type: 'PDF', 
    size: '15MB',
    desc: 'Critical guidelines for identifying postmortem artifacts, medical laws, ethics, and physical injury classifications for medical practitioners.',
    rating: 4.8,
    downloads: 890
  },
  { 
    id: 'bertino', 
    title: 'Forensic Science: Fundamentals and Investigations', 
    author: 'Anthony J. Bertino', 
    year: 2020, 
    category: 'General', 
    tabCategory: 'books',
    type: 'PDF', 
    size: '22MB',
    desc: 'A modern academic survey covering crime scene investigation foundations, hair/fiber analysis, human skeleton models, and ballistics.',
    rating: 4.7,
    downloads: 640
  },
  { 
    id: 'swanson', 
    title: 'Criminal Investigation', 
    author: 'Charles R. Swanson', 
    year: 2018, 
    category: 'Crime Scene Investigation', 
    tabCategory: 'books',
    type: 'EPUB', 
    size: '10MB',
    desc: 'Tactical study of physical evidence tracking, eyewitness interview systems, scene documentation, and criminal profiling logic.',
    rating: 4.6,
    downloads: 410
  },
  { 
    id: 'note-toxicology', 
    title: 'Toxicology Quick Revision Notes', 
    author: 'Dr. Amit Sharma', 
    year: 2024, 
    category: 'Toxicology & Pharmacology', 
    tabCategory: 'notes',
    type: 'PDF', 
    size: '2MB', 
    desc: 'High-yield revision summaries covering corrosive classifications, chelating therapy (EDTA, B.A.L.), organic irritants, and poison timelines.', 
    rating: 4.9,
    downloads: 1250
  },
  { 
    id: 'note-fingerprints', 
    title: 'Fingerprint Patterns & Poroscopy Guide', 
    author: 'Prof. Davis Pathak', 
    year: 2023, 
    category: 'Fingerprinting & Dactyloscopy', 
    tabCategory: 'notes',
    type: 'PDF', 
    size: '4MB', 
    desc: 'A condensed guide analyzing Galton ridges, latent fingerprint development reagents, and microscopic pore frequency calculations.', 
    rating: 4.8,
    downloads: 940
  },
  { 
    id: 'paper-ugc-2023', 
    title: 'UGC NET Forensic Science 2023 Solved Paper II', 
    author: 'ForenClue Academy', 
    year: 2023, 
    category: 'Question Papers', 
    tabCategory: 'papers',
    type: 'PDF', 
    size: '5MB', 
    desc: 'Solved UGC National Eligibility Test fully solved solutions with thorough reasoning for analytical chemical and biological sections.', 
    rating: 4.9,
    downloads: 2100
  },
  { 
    id: 'paper-fact-2021', 
    title: 'FACT Exam Solved Questionnaire (2021)', 
    author: 'ForenClue Team', 
    year: 2021, 
    category: 'Question Papers', 
    tabCategory: 'papers',
    type: 'PDF', 
    size: '4.5MB', 
    desc: 'Forensic Aptitude and Caliber Test solved questions and syllabus blueprints for entry-level analyst eligibility exam criteria.', 
    rating: 4.7,
    downloads: 1150
  },
  { 
    id: 'research-decomposition', 
    title: 'Microbial Succession Models on Soil Postmortem Degradation', 
    author: 'Dr. Jane Vance', 
    year: 2022, 
    category: 'DNA & Serology', 
    tabCategory: 'other',
    type: 'PDF', 
    size: '7.8MB', 
    desc: 'An advanced research paper detailing chemical soil profile shifts and bacterial successions for estimating postmortem intervals.', 
    rating: 4.8,
    downloads: 320
  },
  { 
    id: 'case-asphyxia', 
    title: 'Medicolegal Autopsy Findings of Homicidal Asphyxia Case Files', 
    author: 'Dr. R. K. Saxena', 
    year: 2021, 
    category: 'Forensic Medicine & Pathology', 
    tabCategory: 'other',
    type: 'PDF', 
    size: '6.4MB', 
    desc: 'Expert study files highlighting suicidal hangings versus homicidal strangulations based on cervical trauma.', 
    rating: 4.9,
    downloads: 710
  },
  { 
    id: 'manual-toxicology', 
    title: 'Standard Toxicological Extraction Protocols Manual', 
    author: 'Academic Council', 
    year: 2023, 
    category: 'Toxicology & Pharmacology', 
    tabCategory: 'other',
    type: 'PDF', 
    size: '8.2MB', 
    desc: 'Step-by-step chemical isolation protocols for acid/basic toxins from visceral tissues using chromatographic isolation methods.', 
    rating: 4.8,
    downloads: 1540
  }
];

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
          downloads: d.downloads || 0
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
      if (!titleMatch && !authorMatch && !descMatch) return false;
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
      <SEO 
        title="Academic eLibrary - Reference Textbook Vault"
        description="Access standard academic forensic medicine textbooks, handwritten toxicology notes, national eligibility solved papers, and standard extraction protocols."
        keywords="forensic library, forenclue, forensic textbooks, toxicological revision keys, UGC NET papers"
        canonicalPath="/ebooks"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'eLibrary', path: '/ebooks' }
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

    </div>
  );
}

// Subcomponent: Resource Card
interface ResourceCardProps {
  item: ForensicResource;
  onOpen: () => void;
  onDownload: () => void;
}

function ResourceCard({ item, onOpen, onDownload }: ResourceCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-surface border border-black/15 dark:border-white/10 hover:border-warning/30 hover:shadow-md rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 relative overflow-hidden group text-left"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-warning/[0.01] rounded-full blur-xl pointer-events-none" />

      <div className="space-y-4">
        {/* Book Spine Portrait or Accent Banner */}
        <div 
          onClick={onDownload}
          className="aspect-[5/3] w-full rounded-xl bg-gradient-to-br from-[#0e1726] to-[#040812] border border-black/10 dark:border-white/5 relative overflow-hidden flex items-center justify-center p-4 shadow-inner cursor-pointer group-hover:border-warning/20"
        >
          {/* Subtle visual grid texture */}
          <div className="absolute inset-0 bg-grid-white/[0.01] bg-[size:16px_16px]" />
          
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

        {/* Direct Download Button placed just below the cover page */}
        <button
          onClick={onDownload}
          className="w-full py-2.5 px-4 bg-warning hover:bg-warning/90 active:scale-[0.98] text-crust text-xs font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer"
        >
          <Download size={14} />
          <span>Download Reference File</span>
        </button>

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
            onClick={onDownload}
            className="text-sm font-extrabold text-text-main leading-snug cursor-pointer hover:text-warning transition-colors uppercase line-clamp-1"
            title={item.title}
          >
            {item.title}
          </h3>

          <p className="text-[11px] text-text-muted line-clamp-2 leading-relaxed h-[34px]">
            {item.desc}
          </p>
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
