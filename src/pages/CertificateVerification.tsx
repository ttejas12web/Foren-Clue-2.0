import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, Search, CheckCircle2, Calendar, User, Download, 
  ExternalLink, FileText, AlertTriangle, ShieldCheck, 
  Sparkles, RefreshCw, Copy, Check, FileCheck, BookmarkCheck, Zap 
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { SEO } from '@/components/layout/SEO';

interface CertificateData {
  certificateNo: string;
  fullName: string;
  courseTitle: string;
  certificateType: string;
  issueDate: string;
  imageUrl?: string;
  pdfUrl?: string;
  additionalDetails?: string;
  createdAt?: string;
}

export default function CertificateVerification() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [certificateNo, setCertificateNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Auto-fetch if 'id' or 'no' is present in URL search parameters
  useEffect(() => {
    const queryId = searchParams.get('id') || searchParams.get('no');
    if (queryId) {
      const normalized = queryId.trim();
      setCertificateNo(normalized);
      fetchCertificate(normalized);
    }
  }, [searchParams]);

  const fetchCertificate = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setError('');
    setCertificate(null);
    setSearched(true);

    try {
      // Normalize document ID to uppercase, replace slashes with underscores, and trim to avoid formatting discrepancies
      const safeId = id.toUpperCase().trim().replace(/\//g, '_');
      const docRef = doc(db, 'certificates', safeId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setCertificate(docSnap.data() as CertificateData);
      } else {
        setError('No certificate found matching this verification code. Please check the number and try again.');
      }
    } catch (err: any) {
      console.error('Error fetching certificate:', err);
      setError('An error occurred while validating the certificate. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certificateNo.trim()) return;
    
    // Update URL query parameter
    setSearchParams({ id: certificateNo.toUpperCase().trim() });
  };

  const handleCopyLink = () => {
    const currentUrl = `${window.location.origin}/certificate?id=${encodeURIComponent(certificateNo.toUpperCase().trim())}`;
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-[85vh] bg-base pb-24 relative overflow-hidden text-text-main">
      <SEO 
        title={certificate ? `Verify Certificate: ${certificate.fullName}` : "Official Certificate Verification"}
        description={certificate 
          ? `Official verification record of ${certificate.fullName} for completing '${certificate.courseTitle}' (${certificate.certificateType || 'Certification'}). Authenticity verified by ForenClue.`
          : "Verify the authenticity of ForenClue certificates, credentials, and forensic course completions using our secure, official verification system."
        }
        keywords={certificate 
          ? `verify certificate, ${certificate.fullName}, ${certificate.courseTitle}, forensic science, cybersecurity certification, forenclue, credential verification`
          : "certificate verification, verify credentials, forensic science certificates, authentic forenclue certificates, MSME registered forensic certification"
        }
      />
      {/* Decorative ambient gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[30rem] z-0 opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[10%] w-[35rem] h-[35rem] rounded-full bg-warning/10 blur-[120px]"></div>
        <div className="absolute top-[20%] right-[10%] w-[30rem] h-[30rem] rounded-full bg-blue-500/5 blur-[100px]"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 relative z-10 pt-10 sm:pt-16">
        {/* Header Title */}
        <div className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-warning/10 border border-warning/20 text-warning text-xs font-mono uppercase tracking-widest rounded-full mb-4"
          >
            <ShieldCheck size={14} className="animate-pulse" />
            <span>Forenclue Verification System</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-heading font-black uppercase tracking-tight text-text-main"
          >
            Certificate <span className="text-warning">Verification</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-text-muted mt-3 max-w-xl mx-auto leading-relaxed"
          >
            Instantly verify and authenticate credentials, internship completions, and specialized achievements issued by ForenClue.
          </motion.p>
        </div>

        {/* Search Bar Container */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface border border-black/10 dark:border-white/5 rounded-2xl p-6 shadow-xl mb-10 max-w-2xl mx-auto"
        >
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input 
                type="text"
                value={certificateNo}
                onChange={(e) => setCertificateNo(e.target.value)}
                placeholder="Enter Certificate No. (e.g., FC-1025-AB)"
                className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold tracking-wider outline-none text-text-main focus:border-warning/50 transition-colors uppercase"
                disabled={loading}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3.5 bg-warning text-crust hover:bg-warning/90 disabled:opacity-50 font-black rounded-xl text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-warning/10"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Validating...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={14} />
                  <span>Verify Credentials</span>
                </>
              )}
            </button>
          </form>

          {/* Quick instructions / Info */}
          <div className="mt-4 flex items-center gap-2 text-xs text-text-muted font-mono justify-center">
            <span>Example:</span>
            <button 
              type="button"
              onClick={() => {
                setCertificateNo('FC-1025-AB');
                setSearchParams({ id: 'FC-1025-AB' });
              }}
              className="text-warning border-b border-dashed border-warning/30 hover:border-warning transition-colors uppercase font-bold"
            >
              FC-1025-AB
            </button>
            <span className="text-text-muted/30">|</span>
            <span>All codes are case-insensitive</span>
          </div>
        </motion.div>

        {/* Dynamic Display Area */}
        <div className="min-h-[200px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div 
                key="loading-spinner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12 gap-3"
              >
                <RefreshCw size={32} className="animate-spin text-warning" />
                <span className="text-xs font-mono uppercase tracking-widest text-text-muted animate-pulse">Verifying Credentials...</span>
              </motion.div>
            )}

            {error && !loading && (
              <motion.div 
                key="error-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 sm:p-8 text-center max-w-2xl mx-auto shadow-lg"
              >
                <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-lg font-bold text-text-main mb-2">Verification Failed</h3>
                <p className="text-xs text-text-muted leading-relaxed max-w-md mx-auto mb-6">
                  {error}
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-3 text-xs">
                  <button 
                    onClick={() => {
                      setCertificateNo('');
                      setSearchParams({});
                      setSearched(false);
                      setError('');
                    }}
                    className="px-4 py-2 border border-black/10 dark:border-white/10 rounded-lg text-xs font-bold hover:bg-surface transition-colors text-text-muted hover:text-text-main"
                  >
                    Clear Search
                  </button>
                  <a 
                    href="mailto:support@forenclue.in"
                    className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg font-bold hover:bg-red-500/30 transition-colors text-center"
                  >
                    Contact Forenclue Support
                  </a>
                </div>
              </motion.div>
            )}

            {certificate && !loading && (
              <motion.div 
                key="verification-success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Blue Tick Verified Badge and Action Row */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 text-crust rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)] shrink-0">
                      <CheckCircle2 size={20} className="stroke-[3]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-black text-emerald-400 uppercase tracking-widest">VERIFIED CREDENTIAL</span>
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center shrink-0" title="ForenClue Official Blue Tick">
                          <Check size={10} className="text-white stroke-[4]" />
                        </div>
                      </div>
                      <h2 className="text-sm font-bold font-mono tracking-wider text-text-main mt-0.5 uppercase">
                        CODE: {certificate.certificateNo}
                      </h2>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button 
                      onClick={handleCopyLink}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 py-2 border border-black/10 dark:border-white/10 hover:border-warning/30 rounded-xl text-xs font-bold bg-surface hover:text-warning transition-colors"
                      title="Copy validation link"
                    >
                      {copied ? <Check size={14} className="text-green-400 animate-bounce" /> : <Copy size={14} />}
                      <span>{copied ? 'Copied Link!' : 'Share Verification Link'}</span>
                    </button>
                    {certificate.pdfUrl && (
                      <a 
                        href={certificate.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 py-2 bg-warning text-crust font-black rounded-xl text-xs uppercase tracking-wider hover:bg-warning/90 transition-colors"
                      >
                        <Download size={14} />
                        <span>Download PDF</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Certificate Display Container */}
                {certificate.imageUrl ? (
                  <div className="space-y-8">
                    {/* 1. Image Preview Panel */}
                    <div className="bg-surface border border-black/10 dark:border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
                      <div className="border-b border-black/10 dark:border-white/5 pb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileCheck size={18} className="text-warning" />
                          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-text-main">
                            Digital Certificate Preview
                          </h3>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest font-black">
                          Verified Copy
                        </span>
                      </div>

                      <div className="overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-base relative group">
                        <img 
                          src={certificate.imageUrl} 
                          alt="Verified Certificate Copy"
                          referrerPolicy="no-referrer"
                          className="w-full h-auto object-contain max-h-[600px] mx-auto"
                        />
                      </div>
                    </div>

                    {/* 2. Certificate Credentials Below It */}
                    <div className="bg-surface border border-black/10 dark:border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
                      <div className="border-b border-black/10 dark:border-white/5 pb-4 flex items-center gap-2">
                        <Award size={18} className="text-warning" />
                        <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-text-main">
                          Official Credential Details
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block">Recipient Full Name</span>
                          <p className="text-sm font-bold text-text-main">{certificate.fullName}</p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block">Credential Type</span>
                          <span className="inline-block text-[10px] font-bold text-warning bg-warning/10 px-2.5 py-1 rounded-lg border border-warning/20 uppercase tracking-wider">
                            {certificate.certificateType || 'Certificate of Excellence'}
                          </span>
                        </div>

                        <div className="space-y-1 md:col-span-2">
                          <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block">Course Title / Specialization</span>
                          <p className="text-sm font-bold text-text-main leading-relaxed">{certificate.courseTitle}</p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block">Issue Date</span>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-text-main">
                            <Calendar size={14} className="text-warning" />
                            <span>{certificate.issueDate}</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block">Credential Code</span>
                          <p className="text-xs font-mono font-bold text-text-main uppercase tracking-wider">{certificate.certificateNo}</p>
                        </div>
                      </div>

                      {certificate.additionalDetails && (
                        <div className="bg-base/40 border border-black/5 dark:border-white/5 p-4 rounded-xl space-y-1.5">
                          <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block">Additional Details & Accomplishments</span>
                          <p className="text-xs text-text-muted leading-relaxed whitespace-pre-line">{certificate.additionalDetails}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Fallback when no imageUrl is present - just show the details panel */
                  <div className="bg-surface border border-black/10 dark:border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
                    <div className="border-b border-black/10 dark:border-white/5 pb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award size={18} className="text-warning" />
                        <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-text-main">
                          Official Verification Record
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest font-black">
                        Active
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block">Recipient Full Name</span>
                        <p className="text-sm font-bold text-text-main">{certificate.fullName}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block">Credential Type</span>
                        <span className="inline-block text-[10px] font-bold text-warning bg-warning/10 px-2.5 py-1 rounded-lg border border-warning/20 uppercase tracking-wider">
                          {certificate.certificateType || 'Certificate of Excellence'}
                        </span>
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block">Course Title / Specialization</span>
                        <p className="text-sm font-bold text-text-main leading-relaxed">{certificate.courseTitle}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block">Issue Date</span>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-text-main">
                          <Calendar size={14} className="text-warning" />
                          <span>{certificate.issueDate}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block">Credential Code</span>
                        <p className="text-xs font-mono font-bold text-text-main uppercase tracking-wider">{certificate.certificateNo}</p>
                      </div>
                    </div>

                    {certificate.additionalDetails && (
                      <div className="bg-base/40 border border-black/5 dark:border-white/5 p-4 rounded-xl space-y-1.5">
                        <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block">Additional Details & Accomplishments</span>
                        <p className="text-xs text-text-muted leading-relaxed whitespace-pre-line">{certificate.additionalDetails}</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {!searched && !loading && (
              <motion.div 
                key="verification-features"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto"
              >
                <div className="bg-surface border border-black/10 dark:border-white/5 p-6 rounded-2xl text-center hover:border-warning/30 transition-colors">
                  <div className="w-12 h-12 bg-warning/10 text-warning rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck size={22} />
                  </div>
                  <h3 className="font-bold text-sm mb-1.5 uppercase tracking-wider text-text-main">Authentic Verification</h3>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Every certificate is securely registered in our official database to prevent counterfeiting or unauthorized claims.
                  </p>
                </div>

                <div className="bg-surface border border-black/10 dark:border-white/5 p-6 rounded-2xl text-center hover:border-warning/30 transition-colors">
                  <div className="w-12 h-12 bg-warning/10 text-warning rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap size={22} />
                  </div>
                  <h3 className="font-bold text-sm mb-1.5 uppercase tracking-wider text-text-main">Instant Validation</h3>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Check credentials on-demand. Simply paste the certificate number or scan the QR code to verify any candidate instantly.
                  </p>
                </div>

                <div className="bg-surface border border-black/10 dark:border-white/5 p-6 rounded-2xl text-center hover:border-warning/30 transition-colors">
                  <div className="w-12 h-12 bg-warning/10 text-warning rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText size={22} />
                  </div>
                  <h3 className="font-bold text-sm mb-1.5 uppercase tracking-wider text-text-main">Official Recognition</h3>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Ensures course completion, merit accolades, or internship accomplishments are easily shareable with prospective employers.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
