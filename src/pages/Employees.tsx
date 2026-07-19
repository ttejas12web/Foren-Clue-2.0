import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, Search, RefreshCw, AlertTriangle, User, Mail, Phone, Calendar,
  Briefcase, Award, Check, Copy, Download, Users, Plus, Edit2, Trash2, 
  ChevronRight, Lock, Key, Settings, Sparkles, Database, FileText, CheckCircle2,
  Fingerprint, FileCheck, Share2, Printer
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { db, auth, handleFirestoreError, OperationType } from '@/lib/firebase';
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { SEO } from '@/components/layout/SEO';

// Custom Type for Employee Data
interface EmployeeData {
  employeeId: string;
  fullName: string;
  position: string;
  department: string;
  joiningDate: string;
  expiryDate: string;
  status: 'Active' | 'Suspended' | 'Expired';
  email?: string;
  phone?: string;
  skills?: string[];
  imageUrl?: string;
  qrCodeUrl?: string;
  createdAt: any;
  clearanceLevel?: string; // Level 1 to 4
  checksum?: string; // SHA-256 Mock Checksum
}

export default function Employees() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAdmin } = useAuth();
  
  // Public verification states
  const [employeeId, setEmployeeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  // States for 3D tilt effect on hover
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    
    // Normalize to range -1 to 1
    const normalizedX = x / (box.width / 2);
    const normalizedY = y / (box.height / 2);
    
    // Tilt max 12 degrees
    setRotateX(-normalizedY * 12);
    setRotateY(normalizedX * 12);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  // Handle URL searches (e.g., /employees?id=FC-EMP-102)
  useEffect(() => {
    const queryId = searchParams.get('id') || searchParams.get('code');
    if (queryId) {
      const normalized = queryId.trim().toUpperCase();
      setEmployeeId(normalized);
      fetchEmployee(normalized);
    }
  }, [searchParams]);

  const fetchEmployee = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setError('');
    setEmployee(null);
    setSearched(true);
    setIsFlipped(false);

    try {
      // Normalize document ID to uppercase, replace non-alphanumeric with underscores to prevent Firestore issues
      const safeId = id.toUpperCase().trim().replace(/[\/\s]/g, '_');
      const docRef = doc(db, 'employees', safeId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setEmployee(docSnap.data() as EmployeeData);
      } else {
        setError(`No active credentials found matching employee ID: "${id}". Please verify and try again.`);
      }
    } catch (err: any) {
      console.error('Error fetching employee record:', err);
      setError('An error occurred during verification. Please check your network connection.');
      handleFirestoreError(err, OperationType.GET, 'employees');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId.trim()) return;
    setSearchParams({ id: employeeId.toUpperCase().trim() });
  };

  const handleCopyLink = () => {
    if (!employee) return;
    const currentUrl = `${window.location.origin}/employees?id=${encodeURIComponent(employee.employeeId)}`;
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-[85vh] bg-base pb-24 relative overflow-hidden text-text-main print:bg-white print:pb-0">
      <SEO 
        title={employee ? `Verify Employee: ${employee.fullName}` : "Official Employee Verification"}
        description={employee 
          ? `Official corporate verification profile for ${employee.fullName} (${employee.position}) at ForenClue. Security clearance verified.`
          : "ForenClue secure Employee Verification Portal. Search active duty badges, credentials, and digital cryptographic ID cards."
        }
        keywords="employee verification, verify identity, cyber forensics credentials, forenclue, active badges, MSME registered forensic experts"
      />

      {/* Decorative cyber ambient circles */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[30rem] z-0 opacity-30 pointer-events-none print:hidden">
        <div className="absolute top-[-10%] left-[5%] w-[32rem] h-[32rem] rounded-full bg-warning/5 blur-[120px]"></div>
        <div className="absolute top-[30%] right-[5%] w-[28rem] h-[28rem] rounded-full bg-warning/5 blur-[100px]"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 relative z-10 pt-10 sm:pt-16 print:pt-0">
        
        {/* PUBLIC ID SEARCH & DISPLAY PORTAL */}
        <div className="text-center mb-12 print:hidden">
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
                Employee <span className="text-warning">Verification</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm text-text-muted mt-3 max-w-xl mx-auto leading-relaxed"
              >
                Enter an official ForenClue Employee ID to authenticate their active status, professional role, and department credentials.
              </motion.p>
            </div>

            {/* Search Panel */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-surface border border-black/10 dark:border-white/5 rounded-2xl p-6 shadow-xl mb-10 max-w-2xl mx-auto print:hidden"
            >
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                  <input 
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="Enter Employee ID (e.g. FC-EMP-102)"
                    className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm font-bold tracking-wider outline-none text-text-main focus:border-warning/50 transition-colors uppercase"
                    disabled={loading}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3.5 bg-warning text-crust hover:bg-warning/90 disabled:opacity-50 font-black rounded-xl text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-warning/10 font-mono"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={14} />
                      <span>Authenticate ID</span>
                    </>
                  )}
                </button>
              </form>


            </motion.div>

            {/* Verification Status Display */}
            <div className="min-h-[200px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {loading && (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-12 gap-3"
                  >
                    <RefreshCw size={32} className="animate-spin text-warning" />
                    <span className="text-xs font-mono uppercase tracking-widest text-text-muted animate-pulse">Running Cryptographic Handshake...</span>
                  </motion.div>
                )}

                {error && !loading && (
                  <motion.div 
                    key="error"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 sm:p-8 text-center max-w-2xl mx-auto shadow-lg"
                  >
                    <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-text-main mb-2">Access Denied / Verification Failed</h3>
                    <p className="text-xs text-text-muted leading-relaxed max-w-md mx-auto mb-6">
                      {error}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-3 text-xs">
                      <button 
                        onClick={() => {
                          setEmployeeId('');
                          setSearchParams({});
                          setSearched(false);
                          setError('');
                        }}
                        className="px-4 py-2 border border-black/10 dark:border-white/10 rounded-lg text-xs font-bold hover:bg-surface transition-colors text-text-muted hover:text-text-main"
                      >
                        Reset Portal
                      </button>
                      <a 
                        href="mailto:support@forenclue.com"
                        className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg font-bold hover:bg-red-500/30 transition-colors text-center"
                      >
                        Contact Cyber Command Support
                      </a>
                    </div>
                  </motion.div>
                )}

                {employee && !loading && (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-8"
                  >
                    {/* Glowing Validation Success Banner */}
                    <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg print:hidden ${
                      employee.status === 'Active' 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                        : employee.status === 'Suspended'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          : 'bg-red-500/10 border-red-500/30 text-red-400'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg shrink-0 ${
                          employee.status === 'Active' 
                            ? 'bg-emerald-500 text-crust shadow-emerald-500/20' 
                            : employee.status === 'Suspended'
                              ? 'bg-amber-500 text-crust shadow-amber-500/20'
                              : 'bg-red-500 text-white shadow-red-500/20'
                        }`}>
                          <CheckCircle2 size={20} className="stroke-[3]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-black uppercase tracking-widest">
                              {employee.status} EMPLOYEE RECORD
                            </span>
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center shrink-0" title="Cryptographically Signed & Certified">
                              <Check size={10} className="text-white stroke-[4]" />
                            </div>
                          </div>
                          <h2 className="text-sm font-bold font-mono tracking-wider text-text-main mt-0.5">
                            SIGNATURE HASH ID: {employee.employeeId}
                          </h2>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button 
                          onClick={handleCopyLink}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 py-2 border border-black/10 dark:border-white/10 hover:border-warning/30 rounded-xl text-xs font-bold bg-surface hover:text-warning transition-colors"
                          title="Copy security share link"
                        >
                          {copied ? <Check size={14} className="text-green-400 animate-pulse" /> : <Share2 size={14} />}
                          <span>{copied ? 'Link Copied!' : 'Copy Secure Link'}</span>
                        </button>
                        <button 
                          onClick={handlePrint}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 py-2 bg-warning text-crust font-black rounded-xl text-xs uppercase tracking-wider hover:bg-warning/90 transition-colors font-mono"
                        >
                          <Printer size={14} />
                          <span>Print ID Pass</span>
                        </button>
                      </div>
                    </div>

                    {/* Double-Sided 3D Flip Card Container */}
                    <div className="flex flex-col items-center gap-6">
                      <p className="text-xs text-text-muted font-mono tracking-wider animate-pulse print:hidden">
                        💡 Click or tap the card to see back details
                      </p>

                      {/* 3D Wrapper */}
                      <div 
                        className="w-full max-w-[420px] h-[580px] cursor-pointer select-none print:max-w-none print:w-auto print:h-auto print:flex print:flex-col print:items-center print:gap-8"
                        onClick={() => setIsFlipped(!isFlipped)}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        onMouseEnter={() => setIsHovered(true)}
                        style={{ perspective: '1200px' }}
                      >
                        <div 
                          className="w-full h-full relative print:!transform-none rounded-2xl print:flex print:flex-col print:gap-8 print:items-center"
                          style={{ 
                            transformStyle: 'preserve-3d',
                            WebkitTransformStyle: 'preserve-3d',
                            transform: `rotateY(${isFlipped ? 180 - rotateY : rotateY}deg) rotateX(${isFlipped ? -rotateX : rotateX}deg) scale(${isHovered ? 1.03 : 1})`,
                            transition: isHovered 
                              ? 'transform 0.08s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.3s ease' 
                              : 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1.15), box-shadow 0.3s ease',
                            boxShadow: isHovered 
                              ? '0 30px 60px -15px rgba(251,191,36,0.12), 0 20px 40px -20px rgba(0,0,0,0.5)' 
                              : '0 20px 40px -15px rgba(0,0,0,0.5)'
                          }}
                        >
                          
                          {/* FRONT OF THE ID CARD */}
                          <div 
                            className={`absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-surface to-crust border-2 ${isHovered ? 'border-warning/65 shadow-[inset_0_0_15px_rgba(251,191,36,0.15)]' : 'border-warning/35'} transition-all duration-300 p-6 flex flex-col justify-between shadow-2xl overflow-hidden select-none print:!transform-none print:static print:w-[420px] print:h-[580px] print:shrink-0`}
                            style={{ 
                              backfaceVisibility: 'hidden', 
                              WebkitBackfaceVisibility: 'hidden',
                              transformStyle: 'preserve-3d',
                              WebkitTransformStyle: 'preserve-3d',
                              transform: 'rotateY(0deg) translateZ(1px)'
                            }}
                          >
                            {/* Metallic Inner Border Bevels */}
                            <div className="absolute inset-[1px] rounded-[15px] border border-white/10 pointer-events-none z-25" />
                            <div className="absolute inset-[2px] rounded-[14px] border border-warning/20 pointer-events-none z-25 shadow-[inset_0_0_12px_rgba(251,191,36,0.1)]" />

                            {/* Hologram security grid layout overlay */}
                            <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ffbe0b_1px,transparent_1px)] bg-[size:16px_16px] z-0"></div>

                            {/* Interactive Metallic Shine / Holographic Overlay */}
                            <div 
                              className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-500 overflow-hidden rounded-2xl"
                              style={{
                                opacity: isHovered ? 0.25 : 0.08,
                                background: `linear-gradient(
                                  135deg,
                                  rgba(255, 255, 255, 0) 0%,
                                  rgba(255, 255, 255, 0) 30%,
                                  rgba(255, 215, 0, 0.4) 42%,
                                  rgba(255, 255, 255, 0.9) 50%,
                                  rgba(255, 215, 0, 0.4) 58%,
                                  rgba(0, 229, 255, 0.3) 65%,
                                  rgba(255, 255, 255, 0) 75%,
                                  rgba(255, 255, 255, 0) 100%
                                )`,
                                transform: `translateX(${(rotateY / 12) * 160}px) translateY(${(-rotateX / 12) * 160}px) scale(2.2)`,
                                transition: isHovered ? 'transform 0.08s ease-out, opacity 0.3s ease' : 'transform 0.8s ease-out, opacity 0.5s ease',
                              }}
                            />

                            {/* Foil Micro-Texture */}
                            <div 
                              className="absolute inset-0 pointer-events-none z-20 opacity-[0.04]"
                              style={{
                                backgroundImage: `linear-gradient(45deg, #000 25%, transparent 25%), 
                                                  linear-gradient(-45deg, #000 25%, transparent 25%), 
                                                  linear-gradient(45deg, transparent 75%, #000 75%), 
                                                  linear-gradient(-45deg, transparent 75%, #000 75%)`,
                                backgroundSize: '4px 4px',
                                opacity: 0.1,
                              }}
                            />
                            
                            {/* Card Header */}
                            <div className="flex justify-between items-start border-b border-warning/20 pb-4 relative z-40">
                              <div>
                                <span className="font-heading font-black text-lg tracking-tight text-text-main">
                                  FOREN<span className="text-warning">CLUE</span>
                                </span>
                                <span className="block text-[8px] text-text-muted uppercase tracking-widest font-mono font-bold mt-0.5">
                                  Forensic Intelligence Command
                                </span>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-[7px] font-bold font-mono text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                  SECURE ID
                                </span>
                                <span className="text-[6px] text-text-muted font-mono uppercase tracking-widest mt-1">
                                  Govt. MSME Regd.
                                </span>
                              </div>
                            </div>

                            {/* Card Body - Photo & Main details */}
                            <div className="my-auto flex flex-col items-center text-center gap-4 relative z-40">
                              {/* Photo slot */}
                              <div className="relative">
                                <div className="w-28 h-28 rounded-xl border-2 border-warning/40 overflow-hidden bg-base/50 p-1 shadow-lg shadow-warning/5">
                                  {employee.imageUrl ? (
                                    <img 
                                      src={employee.imageUrl} 
                                      alt={employee.fullName} 
                                      referrerPolicy="no-referrer"
                                      className="w-full h-full object-cover rounded-lg"
                                    />
                                  ) : (
                                    <div className="w-full h-full rounded-lg bg-surface flex items-center justify-center text-text-muted">
                                      <User size={48} className="stroke-[1.5]" />
                                    </div>
                                  )}
                                </div>
                                <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 bg-warning text-crust text-[8px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                                  VERIFIED
                                </div>
                              </div>

                              {/* Identity Titles */}
                              <div>
                                <h3 className="text-xl font-heading font-black tracking-tight text-text-main uppercase">
                                  {employee.fullName}
                                </h3>
                                <p className="text-xs font-mono font-bold text-warning uppercase tracking-wide mt-1">
                                  {employee.position}
                                </p>
                                <p className="text-[10px] text-text-muted font-bold font-mono mt-0.5">
                                  {employee.department}
                                </p>
                              </div>

                              {/* Microchip graphic and Clearance Level */}
                              <div className="w-full flex justify-between items-center bg-base/50 border border-black/10 dark:border-white/5 p-2 px-3 rounded-xl mt-2">
                                <div className="flex items-center gap-2">
                                  {employee.clearanceLevel?.includes('Level 3') ? (
                                    <svg className="w-7 h-7 text-warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                                      <polygon points="12 2 22 7 22 17 12 22 2 17 2 7" fill="currentColor" fillOpacity="0.15" />
                                      <polygon points="12 5 18 8.5 18 15.5 12 19 6 15.5 6 8.5" strokeDasharray="2 2" />
                                      <circle cx="12" cy="12" r="2" fill="currentColor" />
                                      <path d="M12 2v3M12 19v3M22 7l-2.5 1.5M4.5 15.5L2 17M22 17l-2.5-1.5M4.5 8.5L2 7" />
                                    </svg>
                                  ) : employee.clearanceLevel?.includes('Level 2') ? (
                                    <svg className="w-7 h-7 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                                      <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" fillOpacity="0.1" transform="rotate(45 12 12)" />
                                      <rect x="7" y="7" width="10" height="10" rx="1" transform="rotate(45 12 12)" strokeDasharray="2 2" />
                                      <circle cx="12" cy="12" r="2" fill="currentColor" />
                                    </svg>
                                  ) : (
                                    <svg className="w-7 h-7 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                                      <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1" />
                                      <circle cx="12" cy="12" r="6" strokeDasharray="2 2" />
                                      <circle cx="12" cy="12" r="2" fill="currentColor" />
                                      <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
                                    </svg>
                                  )}
                                  <div className="text-left">
                                    <span className="block text-[6px] text-text-muted font-mono uppercase">SECURITY LEVEL</span>
                                    <span className="text-[9px] font-mono font-black text-text-main uppercase">
                                      {employee.clearanceLevel || 'Level 1 - Employee'}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="block text-[6px] text-text-muted font-mono uppercase">STATUS</span>
                                  <span className={`text-[9px] font-mono font-black flex items-center gap-1 uppercase ${
                                    employee.status === 'Active' ? 'text-emerald-400' : 'text-red-400'
                                  }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                                      employee.status === 'Active' ? 'bg-emerald-400' : 'bg-red-400'
                                    }`}></span>
                                    {employee.status}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Card Footer - Dynamic QR and ID Code */}
                            <div className="border-t border-warning/10 pt-4 flex justify-between items-end relative z-40">
                              <div className="text-left space-y-1">
                                <span className="block text-[6px] text-text-muted font-mono uppercase">EMPLOYEE ID</span>
                                <span className="text-xs font-mono font-black text-warning uppercase tracking-widest">
                                  {employee.employeeId}
                                </span>
                                <span className="block text-[6px] text-text-muted font-mono uppercase mt-1">VALIDITY</span>
                                <span className="text-[8px] font-mono font-bold text-text-main">
                                  {['tejas tapse', 'mrunmayee bodhe', 'ayush gaikwad'].includes(employee.fullName.toLowerCase()) ? 'N/A' : `THRU ${employee.expiryDate}`}
                                </span>
                              </div>
                              
                              {/* Real QR Code linking to verification */}
                              <div className="w-16 h-16 bg-white p-1 rounded-md shadow border border-warning/20">
                                <QRCode 
                                  value={`${window.location.origin}/employees?id=${employee.employeeId}`}
                                  size={256}
                                  style={{ height: "100%", width: "100%" }}
                                  viewBox={`0 0 256 256`}
                                />
                              </div>
                            </div>
                          </div>

                          {/* BACK OF THE ID CARD */}
                          <div 
                            className={`absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-b from-neutral-950 via-zinc-900 to-neutral-950 border-2 ${isHovered ? 'border-warning/65 shadow-[inset_0_0_15px_rgba(251,191,36,0.15)]' : 'border-warning/40'} transition-all duration-300 p-6 pt-16 flex flex-col justify-between shadow-2xl overflow-hidden select-none print:static print:w-[420px] print:h-[580px] print:shrink-0 print:!transform-none`}
                            style={{ 
                              backfaceVisibility: 'hidden', 
                              WebkitBackfaceVisibility: 'hidden',
                              transformStyle: 'preserve-3d',
                              WebkitTransformStyle: 'preserve-3d',
                              transform: 'rotateY(180deg) translateZ(1px)'
                            }}
                          >
                            {/* Metallic Inner Border Bevels (Back) */}
                            <div className="absolute inset-[1px] rounded-[15px] border border-white/5 pointer-events-none z-25" />
                            <div className="absolute inset-[2px] rounded-[14px] border border-warning/15 pointer-events-none z-25 shadow-[inset_0_0_12px_rgba(251,191,36,0.08)]" />
                            {/* Interactive Metallic Shine / Holographic Overlay (Back) */}
                            <div 
                              className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-500 overflow-hidden rounded-2xl"
                              style={{
                                opacity: isHovered ? 0.25 : 0.08,
                                background: `linear-gradient(
                                  135deg,
                                  rgba(255, 255, 255, 0) 0%,
                                  rgba(255, 255, 255, 0) 30%,
                                  rgba(255, 215, 0, 0.4) 42%,
                                  rgba(255, 255, 255, 0.9) 50%,
                                  rgba(255, 215, 0, 0.4) 58%,
                                  rgba(0, 229, 255, 0.3) 65%,
                                  rgba(255, 255, 255, 0) 75%,
                                  rgba(255, 255, 255, 0) 100%
                                )`,
                                transform: `translateX(${(-rotateY / 12) * 160}px) translateY(${(-rotateX / 12) * 160}px) scale(2.2)`,
                                transition: isHovered ? 'transform 0.08s ease-out, opacity 0.3s ease' : 'transform 0.8s ease-out, opacity 0.5s ease',
                              }}
                            />

                            {/* Foil Micro-Texture (Back) */}
                            <div 
                              className="absolute inset-0 pointer-events-none z-20 opacity-[0.04]"
                              style={{
                                backgroundImage: `linear-gradient(45deg, #000 25%, transparent 25%), 
                                                  linear-gradient(-45deg, #000 25%, transparent 25%), 
                                                  linear-gradient(45deg, transparent 75%, #000 75%), 
                                                  linear-gradient(-45deg, transparent 75%, #000 75%)`,
                                backgroundSize: '4px 4px',
                                opacity: 0.1,
                              }}
                            />

                            {/* Real-world style magnetic stripe */}
                            <div className="w-full h-10 bg-gradient-to-r from-neutral-950 to-neutral-900 border-b border-warning/10 absolute top-4 left-0 z-0 shadow-inner"></div>

                            {/* High-tech antenna / circuit board trace overlay */}
                            <div className="absolute inset-2 border border-warning/5 rounded-xl pointer-events-none z-0">
                              <svg className="w-full h-full opacity-5 text-warning" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
                                {/* Intersecting lines simulating an NFC loop antenna */}
                                <rect x="2" y="2" width="96" height="96" rx="4" strokeWidth="0.8" />
                                <rect x="4" y="4" width="92" height="92" rx="3" strokeWidth="0.4" strokeDasharray="1 3" />
                                {/* Circuit corners */}
                                <path d="M10,10 L25,10 M10,10 L10,25" />
                                <path d="M90,10 L75,10 M90,10 L90,25" />
                                <path d="M10,90 L25,90 M10,90 L10,75" />
                                <path d="M90,90 L75,90 M90,90 L90,75" />
                              </svg>
                            </div>

                            {/* Gold Smart Chip contact pad on the left edge */}
                            <div className="absolute top-16 right-6 w-10 h-8 rounded bg-gradient-to-br from-amber-500 via-yellow-400 to-amber-600 border border-amber-700/50 p-1 flex flex-col justify-between opacity-80 z-0">
                              <div className="w-full h-[1px] bg-amber-800/20"></div>
                              <div className="flex justify-between h-full w-full">
                                <div className="w-[1px] h-full bg-amber-800/20"></div>
                                <div className="w-[1px] h-full bg-amber-800/20"></div>
                              </div>
                              <div className="w-full h-[1px] bg-amber-800/20"></div>
                            </div>

                            {/* Stamp Watermark in background */}
                            <div className="absolute left-[60%] bottom-28 -translate-x-1/2 w-32 h-32 border-2 border-warning/5 rounded-full pointer-events-none flex items-center justify-center opacity-10 z-0">
                              <div className="w-28 h-28 border border-dashed border-warning/5 rounded-full flex items-center justify-center">
                                <span className="text-[5px] font-mono font-bold text-warning text-center uppercase tracking-widest rotate-12">
                                  FORENCLUE INTEL COMMAND • SECURE DEPT • AUTHENTIC
                                </span>
                              </div>
                            </div>

                            {/* Hologram security grid layout overlay */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffbe0b_1px,transparent_1px)] bg-[size:16px_16px] z-0"></div>
                            
                            {/* Card Header Back */}
                            <div className="border-b border-warning/20 pb-3 flex justify-between items-center relative z-40 mt-1">
                              <div>
                                <span className="text-[10px] font-heading font-black tracking-widest text-warning uppercase">
                                  SYSTEM VERIFICATION CLAUSE
                                </span>
                                <span className="block text-[6px] text-text-muted uppercase tracking-widest font-mono mt-0.5">
                                  SECURE ENCRYPTED MICRO-ASSET
                                </span>
                              </div>
                              <Fingerprint size={18} className="text-warning" />
                            </div>

                            {/* Card Body Back */}
                            <div className="my-auto space-y-3.5 text-left relative z-40">
                              {/* Metadata list */}
                              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                                <div className="bg-neutral-950/50 border border-white/5 rounded-lg p-2 flex flex-col justify-between">
                                  <span className="block text-[6px] text-text-muted uppercase tracking-wider">HOLDER ID CODE</span>
                                  <span className="font-bold text-text-main text-[11px] font-mono">{employee.employeeId}</span>
                                </div>
                                <div className="bg-neutral-950/50 border border-white/5 rounded-lg p-2 flex flex-col justify-between">
                                  <span className="block text-[6px] text-text-muted uppercase tracking-wider">CLEARANCE LEVEL</span>
                                  <span className="font-bold text-warning text-[10px] font-mono">{employee.clearanceLevel || 'Level 1 - Employee'}</span>
                                </div>
                                <div className="bg-neutral-950/50 border border-white/5 rounded-lg p-2 flex flex-col justify-between">
                                  <span className="block text-[6px] text-text-muted uppercase tracking-wider font-mono">COMMISSIONED ON</span>
                                  <span className="font-bold text-text-main text-[10px]">{employee.joiningDate}</span>
                                </div>
                                <div className="bg-neutral-950/50 border border-white/5 rounded-lg p-2 flex flex-col justify-between">
                                  <span className="block text-[6px] text-text-muted uppercase tracking-wider font-mono">EXPIRY THRESHOLD</span>
                                  <span className="font-bold text-text-main text-[10px]">
                                    {['tejas tapse', 'mrunmayee bodhe', 'ayush gaikwad'].includes(employee.fullName.toLowerCase()) ? 'N/A' : employee.expiryDate}
                                  </span>
                                </div>
                                <div className="col-span-2 bg-neutral-950/50 border border-white/5 rounded-lg p-2 flex flex-col justify-between">
                                  <span className="block text-[6px] text-text-muted uppercase tracking-wider">OFFICIAL COMMUNICATIONS NODE</span>
                                  <span className="font-bold text-text-main text-[11px] truncate block">{employee.email || 'contact@forenclue.com'}</span>
                                </div>
                                {employee.phone && (
                                  <div className="col-span-2 bg-neutral-950/50 border border-white/5 rounded-lg p-2 flex flex-col justify-between">
                                    <span className="block text-[6px] text-text-muted uppercase tracking-wider">SECURE TRANSMISSION PHONE</span>
                                    <span className="font-bold text-text-main text-[11px]">{employee.phone}</span>
                                  </div>
                                )}
                              </div>

                              {/* Specialization skills block */}
                              {employee.skills && employee.skills.length > 0 && (
                                <div className="space-y-1 bg-neutral-950/30 border border-white/5 rounded-lg p-2">
                                  <span className="block text-[6px] font-mono text-text-muted uppercase tracking-wider">SYSTEM SPECIALIZATION TAGS</span>
                                  <div className="flex flex-wrap gap-1">
                                    {employee.skills.map((skill, index) => (
                                      <span key={index} className="text-[8px] font-mono font-bold bg-warning/10 border border-warning/20 text-warning px-2 py-0.5 rounded-md flex items-center gap-1">
                                        <span className="w-1 h-1 rounded-full bg-warning animate-pulse"></span>
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Secure reflective holographic sticker */}
                              <div className="absolute right-4 bottom-24 w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-400 via-pink-400 to-yellow-300 opacity-[0.15] mix-blend-screen pointer-events-none flex items-center justify-center border border-white/20 shadow-lg">
                                <div className="text-[6px] font-mono font-black text-white uppercase tracking-widest text-center leading-none rotate-12">
                                  SECURE<br />PASS
                                </div>
                              </div>

                              {/* Terms clause */}
                              <div className="text-[7px] text-text-muted leading-relaxed font-mono border-t border-white/5 pt-3 space-y-1">
                                <div className="flex items-center gap-1 text-warning/50">
                                  <Lock size={8} />
                                  <span className="text-[6px] font-bold uppercase tracking-wider">RESTRICTED GOVERNMENTAL/ENTERPRISE PROPERTY</span>
                                </div>
                                <p>
                                  1. This cryptographic identity card is the exclusive property of ForenClue.
                                </p>
                                <p>
                                  2. Bearer is subject under penal law to forensic nondisclosure parameters. Altering, duplicating, or mimicking this pass constitutes direct cyber-treason under federal security protocols.
                                </p>
                              </div>
                            </div>

                            {/* Card Footer Back - Barcode and Signatures */}
                            <div className="border-t border-warning/15 pt-3 flex justify-between items-center relative z-40">
                              {/* Procedural Vector Barcode */}
                              <div className="bg-white p-1.5 rounded-md shadow-md border border-neutral-800 flex flex-col gap-1 items-center">
                                <svg className="w-28 h-6 text-black stroke-current" viewBox="0 0 100 30" preserveAspectRatio="none">
                                  <g strokeWidth="2.5">
                                    <line x1="5" y1="0" x2="5" y2="30" />
                                    <line x1="8" y1="0" x2="8" y2="30" />
                                    <line x1="14" y1="0" x2="14" y2="30" />
                                    <line x1="17" y1="0" x2="17" y2="30" strokeWidth="1" />
                                    <line x1="22" y1="0" x2="22" y2="30" />
                                    <line x1="28" y1="0" x2="28" y2="30" />
                                    <line x1="33" y1="0" x2="33" y2="30" strokeWidth="1" />
                                    <line x1="38" y1="0" x2="38" y2="30" strokeWidth="3" />
                                    <line x1="44" y1="0" x2="44" y2="30" />
                                    <line x1="49" y1="0" x2="49" y2="30" />
                                    <line x1="54" y1="0" x2="54" y2="30" strokeWidth="1" />
                                    <line x1="60" y1="0" x2="60" y2="30" strokeWidth="4" />
                                    <line x1="68" y1="0" x2="68" y2="30" />
                                    <line x1="74" y1="0" x2="74" y2="30" />
                                    <line x1="79" y1="0" x2="79" y2="30" strokeWidth="1" />
                                    <line x1="84" y1="0" x2="84" y2="30" />
                                    <line x1="90" y1="0" x2="90" y2="30" strokeWidth="3" />
                                    <line x1="95" y1="0" x2="95" y2="30" />
                                  </g>
                                </svg>
                                <span className="text-[6px] font-black font-mono tracking-widest text-black/80 leading-none">
                                  * {employee.employeeId} *
                                </span>
                              </div>

                              {/* CEO Signature (Mrunmayee Bodhe) */}
                              <div className="text-right flex flex-col items-end relative min-w-[120px]">
                                {/* Amber ink stamp watermark circle for CEO */}
                                <div className="absolute right-0 bottom-4 w-12 h-12 rounded-full border border-amber-500/35 text-amber-500/40 flex items-center justify-center select-none -rotate-12 pointer-events-none text-[4.5px] font-mono font-bold leading-none uppercase text-center">
                                  <div className="scale-75">
                                    FC OFFICE<br/>CEO SEAL
                                  </div>
                                </div>
                                
                                {/* Procedural CEO Signature Line */}
                                <svg className="w-20 h-8 text-amber-400 opacity-95 drop-shadow-[0_0_1px_rgba(245,158,11,0.5)] relative z-40" viewBox="0 0 100 40" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                  {/* Elegant cursive "Mrunmayee Bodhe" flow */}
                                  <path d="M8,26 C15,3 18,30 24,18 C28,11 31,27 35,21 C39,13 42,25 46,17 C50,11 53,23 58,19 C66,13 72,11 82,14 C87,15 78,23 90,19" />
                                  <path d="M10,24 Q45,29 80,22" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
                                  <path d="M15,22 L75,18" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 2" opacity="0.3" />
                                </svg>
                                <span className="text-[5.5px] font-mono text-warning font-black uppercase tracking-widest block mt-0.5 relative z-40">
                                  MRUNMAYEE BODHE
                                </span>
                                <span className="text-[4.5px] font-mono text-text-muted uppercase tracking-widest block relative z-40 leading-none">
                                  CHIEF EXECUTIVE OFFICER
                                </span>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>

                  </motion.div>
                )}

                {!searched && !loading && (
                  <motion.div 
                    key="features"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto print:hidden"
                  >
                    <div className="bg-surface border border-black/10 dark:border-white/5 p-6 rounded-2xl text-center hover:border-warning/30 transition-colors">
                      <div className="w-12 h-12 bg-warning/10 text-warning rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck size={22} />
                      </div>
                      <h3 className="font-bold text-sm mb-1.5 uppercase tracking-wider text-text-main">Official Check</h3>
                      <p className="text-xs text-text-muted leading-relaxed">
                        Securely authenticate any investigator's digital badge, credentials, and organizational level within ForenClue.
                      </p>
                    </div>

                    <div className="bg-surface border border-black/10 dark:border-white/5 p-6 rounded-2xl text-center hover:border-warning/30 transition-colors">
                      <div className="w-12 h-12 bg-warning/10 text-warning rounded-full flex items-center justify-center mx-auto mb-4">
                        <Fingerprint size={22} />
                      </div>
                      <h3 className="font-bold text-sm mb-1.5 uppercase tracking-wider text-text-main">3D Digital Badge</h3>
                      <p className="text-xs text-text-muted leading-relaxed">
                        Flippable dynamic digital smart ID contains barcode encryption, custom specialized expertise tags, and cryptographically secure validation keys.
                      </p>
                    </div>

                    <div className="bg-surface border border-black/10 dark:border-white/5 p-6 rounded-2xl text-center hover:border-warning/30 transition-colors">
                      <div className="w-12 h-12 bg-warning/10 text-warning rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users size={22} />
                      </div>
                      <h3 className="font-bold text-sm mb-1.5 uppercase tracking-wider text-text-main">Admin Managed</h3>
                      <p className="text-xs text-text-muted leading-relaxed">
                        Enables seamless and real-time status updates (Active, Suspended, or Revoked/Expired) immediately visible to verifying clients.
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
