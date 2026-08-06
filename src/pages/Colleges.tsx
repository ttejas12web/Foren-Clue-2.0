import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, MapPin, Globe, BookOpen, GraduationCap, DollarSign, 
  Search, Filter, ExternalLink, Award, Sparkles, CheckCircle2, 
  ChevronRight, Bookmark, Share2, Phone, Mail, FileText, X, 
  Compass, ArrowRight, ShieldCheck, Info, RefreshCw, ArrowLeft, Loader2, Star
} from 'lucide-react';
import { SEOManager } from '@/components/layout/SEOManager';
import { College, CollegeFilters } from '@/types/college';
import { fetchColleges, fetchCollegeById } from '@/services/collegeService';
import { cn } from '@/lib/utils';

// Helper to format fee strings appropriately, converting to ₹ for Indian colleges if needed
const formatFee = (feeStr?: string, country?: string): string => {
  if (!feeStr) return '';

  const isIndia = country?.toLowerCase().includes('india');

  if (isIndia) {
    if (feeStr.includes('₹') || feeStr.toLowerCase().includes('inr')) {
      return feeStr;
    }

    if (feeStr.includes('$')) {
      return feeStr.replace(/\$\s*([\d,]+(\.\d+)?)/g, (_, amountStr) => {
        const num = parseFloat(amountStr.replace(/,/g, ''));
        if (isNaN(num)) return `₹${amountStr}`;
        const inrVal = Math.round(num * 83.5);
        return `₹${inrVal.toLocaleString('en-IN')}`;
      });
    }

    if (/^[\d\s\,\-\/a-zA-Z\.]*$/.test(feeStr) && !/[£€]/.test(feeStr)) {
      return feeStr.replace(/([\d,]{3,})/g, (m) => {
        const val = parseInt(m.replace(/,/g, ''), 10);
        return isNaN(val) ? m : `₹${val.toLocaleString('en-IN')}`;
      }).replace(/^(\d)/, '₹$1');
    }

    return feeStr;
  }

  return feeStr;
};

export default function Colleges() {
  const { id } = useParams<{ id?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [savedCollegeIds, setSavedCollegeIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('forenclue_saved_colleges');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Filters state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCountry, setSelectedCountry] = useState(searchParams.get('country') || 'All');
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || 'All');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || 'All');
  const [selectedDegree, setSelectedDegree] = useState(searchParams.get('degree') || 'All');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'All');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'name-asc' | 'courses-desc'>('featured');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const targetId = id || searchParams.get('id');

  // Load Colleges
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchColleges();
      setColleges(data);
      setLoading(false);

      if (targetId) {
        const found = data.find(c => c.id.toLowerCase() === targetId.toLowerCase());
        if (found) {
          setSelectedCollege(found);
        } else {
          const single = await fetchCollegeById(targetId);
          if (single) setSelectedCollege(single);
        }
      }
    };
    loadData();
  }, [targetId]);

  // Sync bookmark updates to localStorage
  const toggleSaveCollege = (e: React.MouseEvent, collegeId: string) => {
    e.stopPropagation();
    setSavedCollegeIds(prev => {
      const exists = prev.includes(collegeId);
      const updated = exists ? prev.filter(i => i !== collegeId) : [...prev, collegeId];
      try {
        localStorage.setItem('forenclue_saved_colleges', JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save college bookmark:", err);
      }
      return updated;
    });
  };

  // Derive unique Filter Options
  const countries = useMemo(() => {
    const set = new Set(colleges.map(c => c.country).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [colleges]);

  const states = useMemo(() => {
    let filtered = colleges;
    if (selectedCountry !== 'All') {
      filtered = filtered.filter(c => c.country === selectedCountry);
    }
    const set = new Set(filtered.map(c => c.state).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [colleges, selectedCountry]);

  const cities = useMemo(() => {
    let filtered = colleges;
    if (selectedCountry !== 'All') filtered = filtered.filter(c => c.country === selectedCountry);
    if (selectedState !== 'All') filtered = filtered.filter(c => c.state === selectedState);
    const set = new Set(filtered.map(c => c.city).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [colleges, selectedCountry, selectedState]);

  // Filtered & Sorted Colleges
  const filteredColleges = useMemo(() => {
    const list = colleges.filter(college => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = college.name.toLowerCase().includes(q) || (college.shortName && college.shortName.toLowerCase().includes(q));
        const matchesLocation = college.city.toLowerCase().includes(q) || college.state.toLowerCase().includes(q) || college.country.toLowerCase().includes(q);
        const matchesCourses = college.coursesOffered.some(course => course.name.toLowerCase().includes(q) || (course.specializations && course.specializations.some(s => s.toLowerCase().includes(q))));
        if (!matchesName && !matchesLocation && !matchesCourses) return false;
      }

      if (selectedCountry !== 'All' && college.country !== selectedCountry) return false;
      if (selectedState !== 'All' && college.state !== selectedState) return false;
      if (selectedCity !== 'All' && college.city !== selectedCity) return false;
      if (selectedType !== 'All' && college.type !== selectedType) return false;

      if (selectedDegree !== 'All') {
        const hasDegree = college.coursesOffered.some(c => c.degreeLevel === selectedDegree);
        if (!hasDegree) return false;
      }

      if (featuredOnly && !college.featured) return false;

      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === 'featured') {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'courses-desc') {
        return (b.coursesOffered?.length || 0) - (a.coursesOffered?.length || 0);
      }
      return 0;
    });
  }, [colleges, searchQuery, selectedCountry, selectedState, selectedCity, selectedType, selectedDegree, featuredOnly, sortBy]);

  const handleOpenDetails = (college: College) => {
    navigate(`/colleges/${college.id}`);
  };

  const handleShareLink = (college: College) => {
    const shareUrl = `${window.location.origin}/colleges/${college.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCountry('All');
    setSelectedState('All');
    setSelectedCity('All');
    setSelectedDegree('All');
    setSelectedType('All');
    setFeaturedOnly(false);
    setSearchParams({});
  };

  // Render Full-Page Dedicated College View if targetId is present in URL
  if (targetId) {
    if (loading) {
      return (
        <div className="min-h-screen bg-background py-20 px-4 flex flex-col items-center justify-center gap-3">
          <Loader2 size={36} className="animate-spin text-warning" />
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Loading College Profile...</span>
        </div>
      );
    }

    const college = selectedCollege || colleges.find(c => c.id.toLowerCase() === targetId.toLowerCase());

    if (!college) {
      return (
        <div className="min-h-[75vh] bg-background py-20 px-4 flex flex-col items-center justify-center text-center">
          <Building2 size={56} className="text-warning mb-4 opacity-40" />
          <h1 className="text-2xl sm:text-3xl font-black text-text-main mb-2">College Record Not Found</h1>
          <p className="text-sm text-text-muted mb-8 max-w-md">
            The requested university or college record ({targetId}) could not be located in our directory.
          </p>
          <Link
            to="/colleges"
            className="px-6 py-3.5 rounded-xl bg-warning text-crust font-black text-xs uppercase tracking-wider shadow-lg hover:bg-warning/90 transition-all flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            <span>Back to Colleges Directory</span>
          </Link>
        </div>
      );
    }

    const isSaved = savedCollegeIds.includes(college.id);

    return (
      <div className="min-h-screen bg-background pb-20 pt-6">
        <SEOManager
          fallbackTitle={`${college.name} | Forensic Science Colleges`}
          fallbackDescription={college.description}
          canonicalPath={`/colleges/${college.id}`}
          fallbackImage={college.bannerImage || college.logo || "/images/og/colleges.png"}
          breadcrumbs={[
            { name: 'Home', path: '/' },
            { name: 'Colleges', path: '/colleges' },
            { name: college.shortName || college.name, path: `/colleges/${college.id}` }
          ]}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Top Bar / Navigation & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/colleges"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-black/10 dark:border-white/10 text-xs font-bold text-text-main hover:border-warning/50 hover:text-warning transition-all min-h-[40px] shadow-sm"
            >
              <ArrowLeft size={16} />
              <span>Back to Colleges Directory</span>
            </Link>

            <div className="flex items-center gap-3">
              <button
                onClick={(e) => toggleSaveCollege(e, college.id)}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all min-h-[40px] border shadow-sm",
                  isSaved
                    ? "bg-warning/10 border-warning text-warning"
                    : "bg-surface border-black/10 dark:border-white/10 text-text-main hover:border-warning/50"
                )}
              >
                <Bookmark size={15} className={cn(isSaved && "fill-warning")} />
                <span>{isSaved ? "Saved to Bookmarks" : "Save College"}</span>
              </button>

              <button
                onClick={() => handleShareLink(college)}
                className="px-4 py-2.5 rounded-xl bg-surface border border-black/10 dark:border-white/10 text-text-main hover:border-warning/50 text-xs font-bold flex items-center gap-2 transition-all min-h-[40px] shadow-sm"
              >
                <Share2 size={15} />
                <span>{copiedLink ? "Link Copied!" : "Share Link"}</span>
              </button>
            </div>
          </div>

          {/* Full Page Hero Header Card */}
          <div className="relative rounded-3xl bg-surface border border-black/10 dark:border-white/10 overflow-hidden shadow-xl">
            {/* Banner Cover Image */}
            <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-crust">
              <img
                src={college.bannerImage || college.logo || "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&q=80&w=1200"}
                alt={college.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/65 to-black/70" />
            </div>

            {/* Hero Details Header */}
            <div className="relative -mt-32 p-6 sm:p-10 space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                
                {/* Logo, Title & Badges */}
                <div className="flex flex-col sm:flex-row items-start gap-5">
                  {college.logo ? (
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-surface border-2 border-warning/30 p-2 shadow-2xl shrink-0 overflow-hidden flex items-center justify-center">
                      <img src={college.logo} alt={college.name} className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-warning/10 border-2 border-warning/30 flex items-center justify-center shrink-0">
                      <Building2 size={40} className="text-warning" />
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-warning text-crust font-black text-xs uppercase tracking-wider">
                        {college.type}
                      </span>
                      {college.accreditation && (
                        <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-amber-300 font-bold text-xs uppercase tracking-wider border border-amber-500/30">
                          {college.accreditation}
                        </span>
                      )}
                      {college.featured && (
                        <span className="px-3 py-1 rounded-full bg-amber-500 text-crust font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                          <Star size={13} className="fill-crust text-crust" /> Featured Institution
                        </span>
                      )}
                    </div>

                    <h1 className="text-2xl sm:text-4xl font-black text-text-main tracking-tight leading-tight">
                      {college.name}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-text-muted">
                      <span className="flex items-center gap-1.5 text-warning font-semibold">
                        <MapPin size={15} />
                        {college.city}, {college.state ? `${college.state}, ` : ''}{college.country}
                      </span>
                      {college.ranking && (
                        <span className="flex items-center gap-1.5 text-text-main">
                          <Award size={15} className="text-warning" />
                          {college.ranking}
                        </span>
                      )}
                    </div>
                  </div>
                </div>


              </div>

              {/* Highlights Summary Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-black/10 dark:border-white/10">
                <div className="bg-background/80 backdrop-blur-md p-4 rounded-2xl border border-black/5 dark:border-white/5 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-text-muted block">Location</span>
                  <span className="text-xs font-bold text-text-main block truncate">{college.city}, {college.country}</span>
                </div>
                <div className="bg-background/80 backdrop-blur-md p-4 rounded-2xl border border-black/5 dark:border-white/5 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-text-muted block">Estimated Fee</span>
                  <span className="text-xs font-black text-warning block truncate">
                    {formatFee(college.feesRange, college.country) || 'Contact University'}
                  </span>
                </div>
                <div className="bg-background/80 backdrop-blur-md p-4 rounded-2xl border border-black/5 dark:border-white/5 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-text-muted block">Forensic Programs</span>
                  <span className="text-xs font-bold text-text-main block">{college.coursesOffered.length} Courses Offered</span>
                </div>
                <div className="bg-background/80 backdrop-blur-md p-4 rounded-2xl border border-black/5 dark:border-white/5 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-text-muted block">Institution Category</span>
                  <span className="text-xs font-bold text-text-main block truncate">{college.type}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left 2 Columns: Deep Details */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Campus Overview */}
              <div className="bg-surface border border-black/10 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
                <h2 className="text-xs font-black uppercase tracking-widest text-warning flex items-center gap-2">
                  <Info size={18} /> Campus Overview & Background
                </h2>
                <p className="text-sm sm:text-base text-text-muted leading-relaxed font-medium">
                  {college.description}
                </p>
              </div>

              {/* Forensic Courses Offered */}
              <div className="bg-surface border border-black/10 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
                  <h2 className="text-xs font-black uppercase tracking-widest text-warning flex items-center gap-2">
                    <GraduationCap size={18} /> Forensic Science Degree Programs ({college.coursesOffered.length})
                  </h2>
                </div>

                <div className="space-y-4">
                  {college.coursesOffered.map((course, idx) => (
                    <div
                      key={idx}
                      className="bg-background border border-black/10 dark:border-white/10 rounded-2xl p-5 space-y-4 hover:border-warning/40 transition-colors shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <h3 className="text-base sm:text-lg font-black text-text-main">
                          {course.name}
                        </h3>
                        <span className="px-3 py-1.5 rounded-xl bg-warning/10 text-warning font-black text-xs uppercase tracking-wider self-start sm:self-auto shrink-0 border border-warning/20">
                          {course.degreeLevel} • {course.duration}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-text-muted pt-3 border-t border-black/5 dark:border-white/5">
                        {course.eligibility && (
                          <div className="bg-surface p-3 rounded-xl border border-black/5 dark:border-white/5 space-y-1">
                            <span className="text-text-main font-bold block text-[11px] uppercase tracking-wider">Eligibility Criteria:</span>
                            <span className="text-text-muted leading-relaxed">{course.eligibility}</span>
                          </div>
                        )}
                        {course.estimatedFees && (
                          <div className="bg-surface p-3 rounded-xl border border-black/5 dark:border-white/5 space-y-1">
                            <span className="text-text-main font-bold block text-[11px] uppercase tracking-wider">Tuition Fee:</span>
                            <span className="text-warning font-black text-sm">{formatFee(course.estimatedFees, college.country)}</span>
                          </div>
                        )}
                      </div>

                      {course.specializations && course.specializations.length > 0 && (
                        <div className="pt-2 flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] font-black uppercase tracking-wider text-text-muted mr-1">Specializations:</span>
                          {course.specializations.map((spec, sIdx) => (
                            <span key={sIdx} className="px-2.5 py-1 rounded-lg bg-surface border border-black/10 dark:border-white/10 text-xs font-bold text-text-main">
                              {spec}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Admission Process */}
              {college.admissionProcess && (
                <div className="bg-surface border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
                  <h2 className="text-xs font-black uppercase tracking-widest text-warning flex items-center gap-2">
                    <FileText size={18} /> Admission Procedure & Entrance Examinations
                  </h2>
                  <p className="text-xs sm:text-sm text-text-main leading-relaxed font-semibold">
                    {college.admissionProcess}
                  </p>
                </div>
              )}

              {/* Campus Facilities */}
              {college.facilities && college.facilities.length > 0 && (
                <div className="bg-surface border border-black/10 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
                  <h2 className="text-xs font-black uppercase tracking-widest text-warning flex items-center gap-2">
                    <Building2 size={18} /> Campus Infrastructure & Laboratories
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {college.facilities.map((fac, fIdx) => (
                      <div key={fIdx} className="p-3.5 rounded-2xl bg-background border border-black/5 dark:border-white/5 text-xs font-bold text-text-main flex items-center gap-3">
                        <CheckCircle2 size={16} className="text-warning shrink-0" />
                        <span>{fac}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right 1 Column Sidebar */}
            <div className="space-y-6">
              
              {/* Quick Summary Card */}
              <div className="bg-surface border border-black/10 dark:border-white/10 rounded-3xl p-6 space-y-5 shadow-sm sticky top-24">
                <h3 className="text-xs font-black uppercase tracking-widest text-text-main border-b border-black/10 dark:border-white/10 pb-3">
                  University Summary
                </h3>

                <div className="space-y-4 text-xs font-bold">
                  <div className="flex justify-between items-center py-1 border-b border-black/5 dark:border-white/5">
                    <span className="text-text-muted">Type:</span>
                    <span className="text-text-main font-black">{college.type}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-black/5 dark:border-white/5">
                    <span className="text-text-muted">City / Region:</span>
                    <span className="text-text-main">{college.city}, {college.state || college.country}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-black/5 dark:border-white/5">
                    <span className="text-text-muted">Country:</span>
                    <span className="text-text-main">{college.country}</span>
                  </div>
                  {college.accreditation && (
                    <div className="flex justify-between items-center py-1 border-b border-black/5 dark:border-white/5">
                      <span className="text-text-muted">Accreditation:</span>
                      <span className="text-amber-400 font-bold">{college.accreditation}</span>
                    </div>
                  )}
                  {college.feesRange && (
                    <div className="flex justify-between items-center py-1 border-b border-black/5 dark:border-white/5">
                      <span className="text-text-muted">Est. Annual Fee:</span>
                      <span className="text-warning font-black">{formatFee(college.feesRange, college.country)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-1">
                    <span className="text-text-muted">Programs Listed:</span>
                    <span className="text-text-main font-bold">{college.coursesOffered.length} Courses</span>
                  </div>
                </div>

                {/* Contact details */}
                {(college.address || college.contactEmail || college.contactPhone) && (
                  <div className="pt-4 border-t border-black/10 dark:border-white/10 space-y-3">
                    <span className="text-[11px] font-black uppercase tracking-wider text-text-muted block">Contact Information</span>
                    {college.address && (
                      <p className="text-xs text-text-muted leading-relaxed font-semibold">
                        {college.address}
                      </p>
                    )}
                    {college.contactEmail && (
                      <a href={`mailto:${college.contactEmail}`} className="flex items-center gap-2 text-xs font-bold text-warning hover:underline truncate">
                        <Mail size={14} className="shrink-0" />
                        <span className="truncate">{college.contactEmail}</span>
                      </a>
                    )}
                    {college.contactPhone && (
                      <div className="flex items-center gap-2 text-xs font-bold text-text-main">
                        <Phone size={14} className="text-warning shrink-0" />
                        <span>{college.contactPhone}</span>
                      </div>
                    )}
                  </div>
                )}

                {college.website && (
                  <a
                    href={college.website.startsWith('http') ? college.website : `https://${college.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 bg-warning text-crust font-black text-xs uppercase tracking-wider rounded-xl shadow-lg hover:bg-warning/90 transition-all flex items-center justify-center gap-2 mt-4"
                  >
                    <span>Visit Official Website</span>
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    );
  }

  // Render Colleges Directory Page
  return (
    <div className="min-h-screen bg-background pb-20">
      <SEOManager 
        fallbackTitle="Forensic Colleges Directory | Forenclue"
        fallbackDescription="Explore top global universities and institutes offering accredited forensic science degree programs, diplomas, and research courses."
        canonicalPath="/colleges"
        fallbackImage="/images/og/colleges.png"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Forensic Colleges', path: '/colleges' }
        ]}
      />

      {/* Hero Banner Header */}
      <section className="relative py-16 lg:py-20 bg-surface border-b border-black/10 dark:border-white/10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-warning/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Premium Main Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black text-text-main tracking-tight leading-none"
          >
            Your City, <span className="bg-gradient-to-r from-amber-400 via-warning to-amber-500 bg-clip-text text-transparent drop-shadow-xs">Your College</span>
          </motion.h1>

          {/* Search Bar Input */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto pt-2"
          >
            <div className="relative flex items-center">
              <Search className="absolute left-4 text-warning" size={20} />
              <input
                type="text"
                placeholder="Search by university name, city, course name, or specialization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-4 rounded-2xl bg-background border-2 border-black/10 dark:border-white/10 text-text-main placeholder:text-text-muted/60 font-semibold text-sm focus:border-warning focus:outline-none transition-all shadow-lg"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 text-text-muted hover:text-text-main p-1"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Container - Filter Sidebar & College Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block w-72 shrink-0 space-y-6">
            <div className="bg-surface border border-black/5 dark:border-white/10 rounded-2xl p-6 space-y-6 shadow-lg sticky top-24">
              <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/10">
                <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wider text-text-main">
                  <Filter size={16} className="text-warning" />
                  <span>Refine Search</span>
                </div>
                {(selectedCountry !== 'All' || selectedState !== 'All' || selectedCity !== 'All' || selectedType !== 'All' || selectedDegree !== 'All' || featuredOnly || searchQuery) && (
                  <button
                    onClick={resetFilters}
                    className="text-xs font-bold text-warning hover:underline flex items-center gap-1"
                  >
                    <RefreshCw size={12} /> Reset
                  </button>
                )}
              </div>

              {/* Country Filter */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <Globe size={14} className="text-warning" /> Country
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => {
                    setSelectedCountry(e.target.value);
                    setSelectedState('All');
                    setSelectedCity('All');
                  }}
                  className="w-full bg-background border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs font-semibold text-text-main focus:border-warning focus:outline-none"
                >
                  {countries.map(c => (
                    <option key={c} value={c}>{c === 'All' ? 'All Countries' : c}</option>
                  ))}
                </select>
              </div>

              {/* State Filter */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <MapPin size={14} className="text-warning" /> State / Region
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSelectedCity('All');
                  }}
                  className="w-full bg-background border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs font-semibold text-text-main focus:border-warning focus:outline-none"
                >
                  {states.map(s => (
                    <option key={s} value={s}>{s === 'All' ? 'All States / Regions' : s}</option>
                  ))}
                </select>
              </div>

              {/* City Filter */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <Building2 size={14} className="text-warning" /> City
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-background border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs font-semibold text-text-main focus:border-warning focus:outline-none"
                >
                  {cities.map(ct => (
                    <option key={ct} value={ct}>{ct === 'All' ? 'All Cities' : ct}</option>
                  ))}
                </select>
              </div>

              {/* Institution Type Filter */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-warning" /> Institution Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-background border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs font-semibold text-text-main focus:border-warning focus:outline-none"
                >
                  <option value="All">All Institution Types</option>
                  <option value="Government">Government / Public</option>
                  <option value="Institute of National Importance">Institute of National Importance</option>
                  <option value="Private">Private University</option>
                  <option value="Deemed University">Deemed University</option>
                  <option value="Autonomous">Autonomous Institute</option>
                </select>
              </div>

              {/* Degree Level Filter */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <GraduationCap size={14} className="text-warning" /> Degree Level
                </label>
                <select
                  value={selectedDegree}
                  onChange={(e) => setSelectedDegree(e.target.value)}
                  className="w-full bg-background border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs font-semibold text-text-main focus:border-warning focus:outline-none"
                >
                  <option value="All">All Degrees</option>
                  <option value="Bachelor">Bachelor (B.Sc. / B.Tech.)</option>
                  <option value="Master">Master (M.Sc. / M.Tech.)</option>
                  <option value="Doctorate">Doctorate (Ph.D.)</option>
                  <option value="Diploma">PG Diploma / Diploma</option>
                  <option value="Certificate">Certificate Course</option>
                </select>
              </div>

              {/* Featured Only Checkbox */}
              <div className="pt-2 border-t border-black/5 dark:border-white/10">
                <label className="flex items-center gap-3 cursor-pointer text-xs font-bold text-text-main select-none">
                  <input
                    type="checkbox"
                    checked={featuredOnly}
                    onChange={(e) => setFeaturedOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-warning focus:ring-warning border-black/20"
                  />
                  <span className="flex items-center gap-1.5">
                    <Star size={14} className="text-warning fill-warning" />
                    Show Featured Colleges Only
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Directory Grid View */}
          <div className="flex-1 space-y-6 min-w-0">
            
            {/* Control Bar: Mobile Filter Button, Sorting & Active Count */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface border border-black/5 dark:border-white/10 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between sm:justify-start gap-3">
                {/* Mobile Filter Drawer Trigger Button */}
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl bg-warning/10 border border-warning/30 text-warning font-black text-xs uppercase tracking-wider hover:bg-warning hover:text-crust transition-all min-h-[44px]"
                >
                  <Filter size={16} />
                  <span>Filters</span>
                  {(selectedCountry !== 'All' || selectedState !== 'All' || selectedCity !== 'All' || selectedType !== 'All' || selectedDegree !== 'All' || featuredOnly) && (
                    <span className="w-5 h-5 rounded-full bg-warning text-crust text-[10px] font-black flex items-center justify-center">
                      !
                    </span>
                  )}
                </button>

                <div className="text-xs font-bold text-text-muted">
                  Showing <span className="text-warning font-black text-sm">{filteredColleges.length}</span> institutes
                </div>
              </div>

              {/* Sorting & Saved Counter */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5 dark:border-white/5">
                {savedCollegeIds.length > 0 && (
                  <span className="text-xs font-bold text-warning bg-warning/10 border border-warning/20 px-3 py-1.5 rounded-xl flex items-center gap-1 shrink-0">
                    <Bookmark size={12} className="fill-warning" /> {savedCollegeIds.length} Saved
                  </span>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase text-text-muted hidden sm:inline">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-background border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-text-main focus:border-warning focus:outline-none min-h-[40px]"
                  >
                    <option value="featured">Featured First</option>
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="courses-desc">Most Programs</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filter Chips / Pills */}
            {(searchQuery || selectedCountry !== 'All' || selectedState !== 'All' || selectedCity !== 'All' || selectedType !== 'All' || selectedDegree !== 'All' || featuredOnly) && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-mono text-text-muted uppercase">Active Filters:</span>
                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning/10 border border-warning/30 text-warning text-xs font-bold">
                    Search: "{searchQuery}"
                    <button onClick={() => setSearchQuery('')} className="hover:text-text-main"><X size={12} /></button>
                  </span>
                )}
                {selectedCountry !== 'All' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-black/10 dark:border-white/10 text-xs font-bold text-text-main">
                    {selectedCountry}
                    <button onClick={() => setSelectedCountry('All')} className="text-text-muted hover:text-text-main"><X size={12} /></button>
                  </span>
                )}
                {selectedState !== 'All' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-black/10 dark:border-white/10 text-xs font-bold text-text-main">
                    {selectedState}
                    <button onClick={() => setSelectedState('All')} className="text-text-muted hover:text-text-main"><X size={12} /></button>
                  </span>
                )}
                {selectedCity !== 'All' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-black/10 dark:border-white/10 text-xs font-bold text-text-main">
                    {selectedCity}
                    <button onClick={() => setSelectedCity('All')} className="text-text-muted hover:text-text-main"><X size={12} /></button>
                  </span>
                )}
                {selectedType !== 'All' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-black/10 dark:border-white/10 text-xs font-bold text-text-main">
                    Type: {selectedType}
                    <button onClick={() => setSelectedType('All')} className="text-text-muted hover:text-text-main"><X size={12} /></button>
                  </span>
                )}
                {selectedDegree !== 'All' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-black/10 dark:border-white/10 text-xs font-bold text-text-main">
                    Degree: {selectedDegree}
                    <button onClick={() => setSelectedDegree('All')} className="text-text-muted hover:text-text-main"><X size={12} /></button>
                  </span>
                )}
                {featuredOnly && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning text-crust text-xs font-black shadow-xs">
                    <Star size={12} className="fill-crust text-crust" /> Featured Only
                    <button onClick={() => setFeaturedOnly(false)} className="hover:opacity-75"><X size={12} /></button>
                  </span>
                )}
                <button
                  onClick={resetFilters}
                  className="text-xs font-bold text-warning hover:underline ml-1"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-surface border border-black/5 dark:border-white/5 rounded-2xl h-80 animate-pulse p-6 space-y-4">
                    <div className="h-40 bg-black/10 dark:bg-white/10 rounded-xl" />
                    <div className="h-6 bg-black/10 dark:bg-white/10 rounded w-3/4" />
                    <div className="h-4 bg-black/10 dark:bg-white/10 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredColleges.length === 0 ? (
              /* Empty Search Results State */
              <div className="bg-surface border border-black/5 dark:border-white/10 rounded-3xl p-12 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-warning/10 text-warning flex items-center justify-center mx-auto">
                  <Building2 size={32} />
                </div>
                <h3 className="text-lg font-black text-text-main">No Institutes Found</h3>
                <p className="text-xs text-text-muted max-w-sm mx-auto font-medium">
                  We couldn't find any colleges matching your selected filters or search terms. Try broadening your criteria or search query.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 rounded-xl bg-warning text-crust font-black text-xs uppercase tracking-wider shadow-md hover:bg-warning/90 transition-all inline-flex items-center gap-2"
                >
                  <RefreshCw size={14} /> Reset Filters
                </button>
              </div>
            ) : (
              /* College Cards Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredColleges.map((college) => {
                  const isSaved = savedCollegeIds.includes(college.id);

                  return (
                    <motion.div
                      key={college.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group bg-surface border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-warning/30 transition-all flex flex-col cursor-pointer"
                      onClick={() => handleOpenDetails(college)}
                    >
                      {/* Banner / Cover Header */}
                      <div className="relative h-40 bg-crust overflow-hidden">
                        <img 
                          src={college.bannerImage || college.logo || "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&q=80&w=800"} 
                          alt={college.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-black/50" />

                        {/* Type & Featured Badge */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                          <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white font-black text-[10px] uppercase tracking-wider border border-white/10">
                            {college.type}
                          </span>

                          <div className="flex items-center gap-2">
                            {college.featured && (
                              <span className="px-2.5 py-1 rounded-full bg-warning text-crust font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md">
                                <Star size={11} className="fill-crust text-crust" /> Featured
                              </span>
                            )}

                            <button
                              onClick={(e) => toggleSaveCollege(e, college.id)}
                              className="p-1.5 rounded-full bg-black/60 text-white hover:text-warning transition-colors backdrop-blur-md"
                              title={isSaved ? "Remove Bookmark" : "Save College"}
                            >
                              <Bookmark size={14} className={cn(isSaved && "fill-warning text-warning")} />
                            </button>
                          </div>
                        </div>

                        {/* Location & Accreditation overlay */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-bold text-white z-10">
                          <span className="flex items-center gap-1 drop-shadow-md text-amber-200">
                            <MapPin size={12} className="text-warning" />
                            {college.city}, {college.state ? `${college.state}, ` : ''}{college.country}
                          </span>
                          {college.accreditation && (
                            <span className="bg-amber-500/80 text-crust font-black text-[10px] px-2 py-0.5 rounded uppercase">
                              {college.accreditation.split('|')[0]}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          <h3 className="text-lg font-black tracking-tight text-text-main group-hover:text-warning transition-colors line-clamp-2">
                            {college.name}
                          </h3>
                          <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                            {college.description}
                          </p>
                        </div>

                        {/* Courses Offered Preview Tags */}
                        <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/5">
                          <div className="text-[11px] font-black uppercase tracking-wider text-text-muted flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <BookOpen size={12} className="text-warning" /> Key Programs:
                            </span>
                            <span className="text-warning font-bold">{college.coursesOffered.length} Courses</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1.5">
                            {college.coursesOffered.slice(0, 3).map((course, idx) => (
                              <span 
                                key={idx} 
                                className="px-2.5 py-1 rounded-md bg-background border border-black/5 dark:border-white/10 text-[11px] font-bold text-text-main line-clamp-1"
                              >
                                {course.name}
                              </span>
                            ))}
                            {college.coursesOffered.length > 3 && (
                              <span className="px-2 py-1 rounded-md bg-warning/10 text-warning font-black text-[10px]">
                                +{college.coursesOffered.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Card Action Buttons */}
                        <div className="pt-3 flex items-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDetails(college);
                            }}
                            className="w-full py-2.5 px-4 bg-warning text-crust font-black text-xs uppercase tracking-wider rounded-xl shadow-md hover:bg-warning/90 transition-all flex items-center justify-center gap-2 min-h-[40px]"
                          >
                            <span>Explore College</span>
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Off-Canvas Filter Drawer */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-[999] lg:hidden flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xs sm:max-w-sm bg-surface border-l border-warning/30 h-full z-10 flex flex-col shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-crust">
                <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wider text-text-main">
                  <Filter size={18} className="text-warning" />
                  <span>Refine Search</span>
                </div>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-2 rounded-xl bg-surface text-text-muted hover:text-text-main"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Body - Filter Controls */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* Country Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                    <Globe size={14} className="text-warning" /> Country
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => {
                      setSelectedCountry(e.target.value);
                      setSelectedState('All');
                      setSelectedCity('All');
                    }}
                    className="w-full bg-background border border-black/10 dark:border-white/10 rounded-xl px-3 py-3 text-xs font-semibold text-text-main focus:border-warning focus:outline-none min-h-[44px]"
                  >
                    {countries.map(c => (
                      <option key={c} value={c}>{c === 'All' ? 'All Countries' : c}</option>
                    ))}
                  </select>
                </div>

                {/* State Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                    <MapPin size={14} className="text-warning" /> State / Region
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => {
                      setSelectedState(e.target.value);
                      setSelectedCity('All');
                    }}
                    className="w-full bg-background border border-black/10 dark:border-white/10 rounded-xl px-3 py-3 text-xs font-semibold text-text-main focus:border-warning focus:outline-none min-h-[44px]"
                  >
                    {states.map(s => (
                      <option key={s} value={s}>{s === 'All' ? 'All States / Regions' : s}</option>
                    ))}
                  </select>
                </div>

                {/* City Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                    <Building2 size={14} className="text-warning" /> City
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full bg-background border border-black/10 dark:border-white/10 rounded-xl px-3 py-3 text-xs font-semibold text-text-main focus:border-warning focus:outline-none min-h-[44px]"
                  >
                    {cities.map(ct => (
                      <option key={ct} value={ct}>{ct === 'All' ? 'All Cities' : ct}</option>
                    ))}
                  </select>
                </div>

                {/* Institution Type Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-warning" /> Institution Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full bg-background border border-black/10 dark:border-white/10 rounded-xl px-3 py-3 text-xs font-semibold text-text-main focus:border-warning focus:outline-none min-h-[44px]"
                  >
                    <option value="All">All Institution Types</option>
                    <option value="Government">Government / Public</option>
                    <option value="Institute of National Importance">Institute of National Importance</option>
                    <option value="Private">Private University</option>
                    <option value="Deemed University">Deemed University</option>
                    <option value="Autonomous">Autonomous Institute</option>
                  </select>
                </div>

                {/* Degree Level Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                    <GraduationCap size={14} className="text-warning" /> Degree Level
                  </label>
                  <select
                    value={selectedDegree}
                    onChange={(e) => setSelectedDegree(e.target.value)}
                    className="w-full bg-background border border-black/10 dark:border-white/10 rounded-xl px-3 py-3 text-xs font-semibold text-text-main focus:border-warning focus:outline-none min-h-[44px]"
                  >
                    <option value="All">All Degrees</option>
                    <option value="Bachelor">Bachelor (B.Sc. / B.Tech.)</option>
                    <option value="Master">Master (M.Sc. / M.Tech.)</option>
                    <option value="Doctorate">Doctorate (Ph.D.)</option>
                    <option value="Diploma">PG Diploma / Diploma</option>
                    <option value="Certificate">Certificate Course</option>
                  </select>
                </div>

                {/* Featured Only Checkbox */}
                <div className="pt-2 border-t border-black/5 dark:border-white/10">
                  <label className="flex items-center gap-3 cursor-pointer text-xs font-bold text-text-main select-none">
                    <input
                      type="checkbox"
                      checked={featuredOnly}
                      onChange={(e) => setFeaturedOnly(e.target.checked)}
                      className="w-5 h-5 rounded text-warning focus:ring-warning border-black/20"
                    />
                    <span className="flex items-center gap-1.5">
                      <Star size={14} className="text-warning fill-warning" />
                      Show Featured Colleges Only
                    </span>
                  </label>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-5 border-t border-black/10 dark:border-white/10 bg-crust flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    resetFilters();
                    setIsMobileFilterOpen(false);
                  }}
                  className="px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 text-text-muted hover:text-text-main text-xs font-bold min-h-[44px]"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 px-6 py-3 rounded-xl bg-warning text-crust font-black text-xs uppercase tracking-wider shadow-lg hover:bg-warning/90 transition-all min-h-[44px]"
                >
                  Apply Filters ({filteredColleges.length})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
