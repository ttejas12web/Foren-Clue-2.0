import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { CrimeTape } from '@/components/ui/CrimeTape';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Search, ShieldAlert, BookOpen, Users, Star, Download, Calendar, Video, Award, Clock, Sparkles, X, ZoomIn } from 'lucide-react';
import { EvidenceMarker } from '@/components/ui/EvidenceMarker';
import { EditableText } from '@/components/ui/EditableText';
import { SEO } from '@/components/layout/SEO';
import { ForensicGridCanvas } from '@/components/ui/ForensicGridCanvas';
import { UpcomingQuizSection } from '@/components/quiz/UpcomingQuizSection';
import { RecentELibrarySection } from '@/components/library/RecentELibrarySection';

const MotionLink = motion.create(Link);

export default function Home() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const [isPosterOpen, setIsPosterOpen] = useState(false);

  // Prevent background scrolling when lightbox is open
  useEffect(() => {
    if (isPosterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isPosterOpen]);
  
  const rotateX = useTransform(y, [-300, 300], [10, -10]);
  const rotateY = useTransform(x, [-300, 300], [-10, 10]);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isCompleted: false
  });

  useEffect(() => {
    const targetDate = new Date('2026-07-15T14:00:00+05:30').getTime();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isCompleted: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isCompleted: false });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, []);

  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const scrollTarget = searchParams.get('scroll');
    if (scrollTarget === 'book-mockup') {
      const element = document.getElementById('book-mockup-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Clean up the search parameter so it doesn't scroll again on manual reloads
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('scroll');
        setSearchParams(newParams, { replace: true });
      }
    }
  }, [searchParams, setSearchParams]);

  function handleMouseMove(event: React.MouseEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const handleDownloadSample = () => {
    const content = `======================================================================
FORENCLUE SCIENTIFIC EXAMINATION HANDBOOK (PREVIEW CLASSROOM PACKET)
======================================================================
ForenClue Publications Ltd. | www.forenclue.edu
Classification: Exclusive Forensic Blueprint Sample
Document Reference: FEP-2026-HBK-001X

Dear forensic student/educator,

Thank you for downloading the exclusive sample chapter from the upcoming
"Forensic Investigation Handbook: Theory, Application & Protocols".

Here is a quick operational checklist included in Chapter 2:

SECTION 2.4: SYSTEMATIC CRIME SCENE PROTOCOLS
----------------------------------------------
1. Establish Boundary Control
   - Define Outer, Inner, and Core security perimeters.
   - Deploy high-contrast physical barriers (Crime Scene Tape).
   - Authorize Entry/Exit logging to secure chain of custody.

2. Comprehensive Photography & Documentation
   - Take overall room context shots before introducing evidence markers.
   - Utilize linear measurement grids and macro exposure for specific trace materials.
   - Implement stereoscopic capture for reconstruction algorithms.

3. Live Sample Retention
   - Always wear double-layered nitrile gloves. Use separate tweezers for distinct hairs.
   - Place biological trace materials only into well-aerated paper bags to prevent humidity-based mold decomposition.
   - Package volatile digital storage hardware immediately into anti-static Faraday shielding.

Find complete lessons, certifications, and active community doubts folders
on ForenClue platform!

Keep Investigating,
The ForenClue Curriculum Board
======================================================================`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ForenClue_Forensic_Investigation_Handbook_Sample.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SEO 
        title="Your Partner In Forensic Precision"
        description="Master forensic science, crime scene investigation, fingerprint lifting, digital forensics, and cybersecurity with India's first dedicated, expert-led forensic platform."
        keywords="forensic science, crime scene investigation, fingerprint analysis, digital forensics, ballistics, bloodstain pattern analysis, forensic training india, docudraft, forenclue"
        canonicalPath=""
        breadcrumbs={[
          { name: 'Home', path: '/' }
        ]}
        faqs={[
          { question: "What is ForenClue?", answer: "ForenClue is India's first dedicated, expert-led forensic EdTech platform, providing specialized masterclasses, certification courses, solved crime case archives, and study resources." },
          { question: "Who can enroll in ForenClue courses?", answer: "Students, legal professionals, law enforcement officers, cyber security enthusiasts, and anyone interested in forensic science and crime scene investigation can enroll." }
        ]}
      />

      
      {/* Hero Section */}
      <section 
        className="relative min-h-[75vh] sm:min-h-[80vh] flex items-center justify-center overflow-hidden bg-crust pt-4 sm:pt-6 pb-12 sm:pb-16"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Animated Forensic Science, Radar Reticles & Cyber Grid Canvas */}
        <ForensicGridCanvas />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center perspective-1000">
          <motion.div
            style={{ rotateX, rotateY, z: 50, transformStyle: "preserve-3d" }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.span 
              style={{ translateZ: 20 }}
              className="inline-block py-1 px-4 rounded-full bg-warning/10 border border-warning/30 text-warning text-sm font-semibold mb-3 uppercase tracking-wider block-shadow"
            >
              ForenClue • Forensic Education & Investigation Platform
            </motion.span>
            <motion.h1 
              style={{ translateZ: 50 }}
              className="font-heading font-black text-5xl md:text-7xl lg:text-8xl leading-[0.9] tracking-tighter mb-6 uppercase text-text-main drop-shadow-2xl"
            >
              Foren<span className="text-warning">Clue</span> <br/>
              <span className="text-3xl md:text-5xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-warning to-warning-dark block mt-2">
                Forensic Precision
              </span>
            </motion.h1>
            <motion.p 
              style={{ translateZ: 30 }}
              className="text-base sm:text-lg md:text-xl lg:text-2xl font-body text-text-muted max-w-3xl mx-auto leading-relaxed mb-10 text-center px-4"
            >
              <EditableText 
                id="home_hero_subtitle" 
                defaultText="ForenClue is India's dedicated forensic science platform empowering students, educators, and legal professionals with case-based learning, e-books, virtual simulations, and career pathways."
                isTextArea
                className="text-center"
              />
            </motion.p>
            
            <motion.div style={{ translateZ: 40 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <MotionLink 
                to="/cases"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-8 py-4 bg-warning text-crust font-black uppercase tracking-wider rounded-none relative group overflow-hidden transition-all shadow-xl shadow-warning/20"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start Learning <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-warning-dark transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 z-0" />
              </MotionLink>
              <MotionLink 
                to="/community" 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-8 py-4 bg-surface text-text-main font-bold uppercase tracking-wider rounded-none border border-black/10 dark:border-white/10 hover:border-warning/50 hover:bg-black/5 dark:bg-white/5 transition-all shadow-xl"
              >
                Join Community
              </MotionLink>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <CrimeTape text="INVESTIGATION IN PROGRESS - DO NOT CROSS -" />

      {/* Live Webinar Event Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="py-16 bg-surface border-y border-black/10 dark:border-white/5 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-warning/5 rounded-full blur-[80px] -z-10 animate-pulse"></div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="bg-crust border-2 border-warning/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-warning to-amber-500"></div>
            
            <div className="space-y-6">
              
              {/* Creative Exclusive Event Text */}
              <div className="flex justify-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-warning/15 border border-warning/30 rounded-full text-[10px] font-mono uppercase tracking-[0.2em] text-warning font-black shadow-sm">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  Exclusive Live Session
                </span>
              </div>

              {/* Event Poster Card */}
              <div 
                onClick={() => setIsPosterOpen(true)}
                className="relative rounded-2xl overflow-hidden border border-black/15 dark:border-white/10 shadow-lg bg-black/50 w-full cursor-zoom-in group transition-all duration-300 hover:border-warning/50 hover:shadow-warning/10"
              >
                <img 
                  src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjC8OssiOJ4AHrnFMj8XrEz4-2WzvQqBvhsg4ztM5HnSlunwKoH6ZIAnDh8eL9wCjiWXy5tT7CwKs9HSrZUzE2l9ph6oefi97nIraWGguJ5L-aMsDEmadDi3LpiBiUir1xgBr8xyrrAGQrElx1Szy-x7Ob4NO_iEiWmFpuAJFBb5ihvG0_HRXC58Gujzzo/s1524/Forensic%20Odontologist%20%20Dental%20Surgeon%20%20Certified%20Professional%20in%20Criminal%20Profiling,%20Forensic%20&%20Investigative%20Psychology%20%20Gold%20Medalist%20(2022-2024)%20%20Member%20-%20IDA%20Fellow-Pierre%20Fauchard%20Academy,%20US.png"
                  alt="Official Webinar Event Poster - Beyond The Smiles"
                  className="w-full h-auto block"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                />
                
                {/* Click to zoom overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2">
                  <div className="bg-warning/90 text-crust p-3 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <ZoomIn size={24} className="font-bold" />
                  </div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-white font-bold bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm shadow-sm">
                    Click to view full screen
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {/* 3D Touchable View Recent Event Button */}
                <Link 
                  to="/webinar?event=beyond-the-smiles"
                  className="group relative w-full inline-flex items-center justify-center gap-3 px-6 py-4 bg-warning hover:bg-warning-dark text-crust font-black uppercase tracking-wider rounded-xl text-xs sm:text-sm shadow-[0_6px_0_0_#9a3412] hover:shadow-[0_4px_0_0_#9a3412] active:shadow-[0_0px_0_0_#9a3412] active:translate-y-[6px] border border-amber-500/20 transition-all text-center cursor-pointer font-sans"
                >
                  <Video size={16} className="text-crust" />
                  <span>View Recent Event</span>
                </Link>
              </div>

            </div>
          </div>
        </div>
      </motion.section>

      {/* Upcoming & Active Quiz Challenges */}
      <UpcomingQuizSection />

      {/* Featured Recently Uploaded E-Library Material */}
      <RecentELibrarySection />

      {/* About ForenClue & Application Purpose */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="py-20 bg-crust relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="font-heading font-black text-3xl md:text-5xl uppercase tracking-tight text-text-main">
              About <span className="text-warning">ForenClue</span> & Purpose
            </h2>
            <p className="text-text-muted text-base max-w-2xl mx-auto mt-3">
              ForenClue is designed for public access to forensic knowledge, case studies, and career tools.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
            
            <div className="relative flex flex-col justify-between">
              <div className="absolute -inset-2 bg-warning/10 border border-warning/20 transform rotate-1 rounded-2xl" />
              <div className="bg-surface p-8 relative rounded-2xl border border-black/10 dark:border-white/5 shadow-2xl backdrop-blur-sm h-full flex flex-col justify-between">
                 <div>
                   <EvidenceMarker number={<Star size={24} fill="currentColor" />} className="absolute -top-10 -left-6" />
                   <h3 className="font-heading font-black text-2xl mb-4 text-text-main uppercase">
                     Educational Purpose
                   </h3>
                   <p className="text-text-muted text-base leading-relaxed mb-4">
                     <EditableText id="home_about_par1" defaultText="ForenClue is an expert-led forensic science edtech and research platform designed to bridge the gap between theoretical forensic education and real-world criminal investigation protocols." isTextArea />
                   </p>
                   <p className="text-text-muted text-base leading-relaxed border-l-4 border-warning pl-4 mb-4">
                     <EditableText id="home_about_par2" defaultText="Visitors can freely browse case study breakdowns, e-library resource catalogues, webinar recordings, forensic podcasts, and virtual laboratory simulations without needing to log in." isTextArea />
                   </p>
                 </div>
                 
                 <div className="bg-base/60 p-4 rounded-xl border border-black/10 dark:border-white/5 mt-4">
                   <h4 className="font-bold text-xs uppercase tracking-wider text-warning mb-1">
                     Public & Open Access
                   </h4>
                   <p className="text-xs text-text-muted leading-normal">
                     All learning materials, case study summaries, podcasts, webinars, and college directories on ForenClue are accessible publicly without requiring account registration or payment.
                   </p>
                 </div>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-6">
              <div className="bg-surface p-6 rounded-2xl border border-black/10 dark:border-white/5 shadow-xl">
                <h3 className="font-heading font-bold text-xl mb-3 text-text-main uppercase flex items-center gap-2">
                  <ShieldAlert size={20} className="text-warning" />
                  Why Sign In With Google?
                </h3>
                <p className="text-sm text-text-muted leading-relaxed mb-3">
                  Logging in with your Google account is optional and provides personalized learner features:
                </p>
                <ul className="space-y-2 text-xs text-text-muted">
                  <li className="flex items-start gap-2">
                    <span className="text-warning font-bold">•</span>
                    <span><strong>Learner Profile:</strong> Save course completion progress and active quiz scores.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-warning font-bold">•</span>
                    <span><strong>Verified Certificates:</strong> Generate authenticated certificates for completed forensic masterclasses.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-warning font-bold">•</span>
                    <span><strong>Community Forum:</strong> Post forensic investigation doubts and participate in discussions with peers.</span>
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Search, title: "Case Studies", desc: "Real crime case breakdowns" },
                  { icon: BookOpen, title: "E-Library", desc: "Expert books & materials" },
                  { icon: Users, title: "Career Guidance", desc: "Forensic roadmap" },
                  { icon: ShieldAlert, title: "Certifications", desc: "Recognized certificates" }
                ].map((feature, i) => (
                  <div 
                    key={i}
                    className="bg-surface/80 border border-black/10 dark:border-white/5 p-4 rounded-xl hover:border-warning/30 transition-colors group"
                  >
                    <feature.icon size={24} className="text-warning mb-2 group-hover:scale-110 transition-transform" />
                    <h4 className="font-heading font-bold text-sm mb-1">{feature.title}</h4>
                    <p className="text-[11px] text-text-muted leading-snug">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </motion.section>




      {/* Exclusive Forensic Handbook / Book Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        id="book-mockup-section" className="py-24 bg-base relative overflow-hidden border-t border-black/10 dark:border-white/5"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Book Mockup & Download Block (12 cols) */}
            <div className="lg:col-span-12 flex flex-col items-center justify-center">
              {/* Available Now Tag */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-warning/15 border border-warning/30 rounded-full text-warning text-xs font-black uppercase tracking-widest mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Available Now
              </div>

              <Link to="/files" className="relative group max-w-sm w-full block cursor-pointer">
                {/* Subtle Ambient Glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-warning to-amber-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                
                <div className="relative bg-surface border border-black/10 dark:border-white/5 p-6 rounded-2xl shadow-2xl flex flex-col items-center text-center animate-fadeIn transition-colors hover:bg-surface-hover">
                  {/* Book Image */}
                  <div className="relative overflow-hidden rounded-xl border border-black/10 dark:border-white/10 aspect-[3/4] w-full max-w-[280px] mb-6 shadow-xl transition-all duration-500 group-hover:scale-105">
                    <img 
                      src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEive7NdnBis_kLLqaN2d8q37014tEMd2ftmqFkeCIiLjxkG2sDfip5VQldxh9izJC-KTsD4ZfXnILFWEOG2jmJkwdKww8-jqW-2jAqpTsv4AOE47MkqpHHibGcBN4GhPqN3OIF1xxIbs0KQLRgxfk2XJRsdlQyY_JqqRnajm2-pB1xoiZN4BnkdtDc9ICU/s1500/1779707899.png" 
                      alt="Careers in Forensic Science Handbook Cover" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute top-3 right-3 bg-warning text-crust text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded shadow-lg">
                      Kindle Edition
                    </div>
                  </div>

                  {/* Title / Description under book */}
                  <h3 className="font-heading font-black text-xl mb-2 uppercase tracking-tight text-text-main group-hover:text-warning transition-colors">
                    Careers in Forensic Science
                  </h3>
                  
                  <p className="text-xs text-text-muted mb-6 leading-relaxed max-w-xs">
                    Comprehensive Handbook For Careers In Forensic Science. Tap to view pathways, entrance examinations guidelines, admission guides, and reader reviews.
                  </p>

                  <div className="w-full px-6 py-3 bg-warning hover:bg-warning-dark text-crust font-black uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-xs shadow-lg hover:shadow-warning/20">
                    <span>View Handbook Details</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </div>

          </div>
        </div>
      </motion.section>

      {/* Social Proof */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="py-20 bg-warning text-crust"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-12">
             <h2 className="font-heading font-black text-3xl md:text-5xl uppercase tracking-tight">
               Trusted by 100+ Learners
             </h2>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
             {[
               {
                 quote: "The Forensic Careers Handbook and Pathfinder Engine charted my entire career path, helping me structure my electives perfectly.",
                 author: "Forensic Student"
               },
               {
                 quote: "Working through the reference Case Studies felt like actual investigative work. The depth of evidence review is unmatched.",
                 author: "Forensic Student"
               },
               {
                 quote: "The real-time Case Analyzer combined with the Community doubts hub let me resolve complex toxicological case queries instantly.",
                 author: "Forensic Student"
               },
               {
                 quote: "As an active investigator, using the high-fidelity case blueprints and expert podcast streams keeps my investigative skills incredibly sharp.",
                 author: "Forensic Professional"
               },
               {
                 quote: "The combination of interactive case files, structured career handbooks, and community peer support has been vital for my lab placement prep.",
                 author: "Forensic Student"
               }
             ].map((testimonial, i) => (
               <div key={i} className="bg-crust/5 p-6 rounded-lg flex flex-col justify-between">
                 <div>
                   <div className="flex text-crust mb-3">
                     {[...Array(5)].map((_, j) => (
                       <svg key={j} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                         <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                       </svg>
                     ))}
                   </div>
                   <p className="font-medium text-base leading-snug font-serif italic mb-4">
                     "{testimonial.quote}"
                   </p>
                 </div>
                 <p className="font-bold text-xs uppercase tracking-wider">- {testimonial.author}</p>
               </div>
             ))}
           </div>
        </div>
      </motion.section>
      
      <CrimeTape text="CROSSING BOUNDARIES OF SCIENCE" angle={1} className="bg-white text-black" />

      {/* Lightbox Modal for Poster */}
      {isPosterOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 md:p-6 backdrop-blur-md transition-all duration-300"
          onClick={() => setIsPosterOpen(false)}
        >
          <div className="absolute top-4 right-4 z-50">
            <button 
              onClick={() => setIsPosterOpen(false)}
              className="p-3 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-full transition-all border border-white/10 hover:scale-105"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
          <div 
            className="relative max-w-full max-h-[90vh] md:max-h-[95vh] rounded-xl overflow-hidden shadow-2xl transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjC8OssiOJ4AHrnFMj8XrEz4-2WzvQqBvhsg4ztM5HnSlunwKoH6ZIAnDh8eL9wCjiWXy5tT7CwKs9HSrZUzE2l9ph6oefi97nIraWGguJ5L-aMsDEmadDi3LpiBiUir1xgBr8xyrrAGQrElx1Szy-x7Ob4NO_iEiWmFpuAJFBb5ihvG0_HRXC58Gujzzo/s1524/Forensic%20Odontologist%20%20Dental%20Surgeon%20%20Certified%20Professional%20in%20Criminal%20Profiling,%20Forensic%20&%20Investigative%20Psychology%20%20Gold%20Medalist%20(2022-2024)%20%20Member%20-%20IDA%20Fellow-Pierre%20Fauchard%20Academy,%20US.png"
              alt="Official Webinar Event Poster - Full Screen"
              className="max-w-full max-h-[90vh] md:max-h-[95vh] object-contain rounded-lg"
              referrerPolicy="no-referrer"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      )}

    </div>
  );
}
