import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { CrimeTape } from '@/components/ui/CrimeTape';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Search, ShieldAlert, BookOpen, Users, Star, Download, Calendar, Video, Award, Clock, Sparkles, X, ZoomIn } from 'lucide-react';
import { EvidenceMarker } from '@/components/ui/EvidenceMarker';
import { EditableText } from '@/components/ui/EditableText';
import { SEO } from '@/components/layout/SEO';
import { ForensicGridCanvas } from '@/components/ui/ForensicGridCanvas';

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
        title="Your Partner In Forensic Precision !"
        description="Master forensic science, crime scene investigation, fingerprint lifting, digital forensics, and cybersecurity with India's first dedicated, expert-led forensic platform."
        keywords="forensic science, crime scene investigation, fingerprint analysis, digital forensics, ballistics, bloodstain pattern analysis, forensic training india, docudraft, forenclue"
        canonicalPath=""
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
              className="inline-block py-1 px-3 rounded-full bg-warning/10 border border-warning/30 text-warning text-sm font-semibold mb-3 uppercase tracking-wider block-shadow"
            >
              India's First Dedicated Platform
            </motion.span>
            <motion.h1 
              style={{ translateZ: 50 }}
              className="font-heading font-black text-5xl md:text-7xl lg:text-8xl leading-[0.9] tracking-tighter mb-8 uppercase text-text-main drop-shadow-2xl"
            >
              Forensic <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-warning to-warning-dark inline-block transform -skew-x-6 mt-2">
                Precision
              </span>
            </motion.h1>
            <motion.p 
              style={{ translateZ: 30 }}
              className="text-base sm:text-lg md:text-xl lg:text-2xl font-body text-text-muted max-w-3xl mx-auto leading-relaxed mb-10 text-center px-4"
            >
              <EditableText 
                id="home_hero_subtitle" 
                defaultText="Empowering students, educators, and professionals with real-world forensic knowledge, case-based learning, and career guidance."
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
                  src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgiJ2oOCQiw2cxeNN6p5b40F-AKZdIkdSRRZ9V14gvIgg2MOymbNvpD2_QcaQ8gB9UxMzmp1l3iafah8Tdz2GChCInBXR8HeRIr3x_-N7a3zrpUejvhRpRhN_8UrEcvMxKN46sAl322fuGSgE3WRyeURXB0MiRstqFsk7jPALV8r3Vx8TyN_eWEPULmX0w/s1492/Mr.%20Ashutosh%20Singh.png"
                  alt="Official Webinar Event Poster - Career Pathways in Cybersecurity"
                  className="w-full h-auto block"
                  referrerPolicy="no-referrer"
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

              {/* Live Countdown Timer */}
              <div className="bg-surface border border-warning/15 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-warning font-bold">
                    <Clock size={12} className="animate-pulse" />
                    Timer Till 15th July Live Event
                  </span>
                  {timeLeft.isCompleted && (
                    <span className="text-[10px] font-mono text-emerald-500 font-bold uppercase tracking-wider animate-pulse">
                      🟢 Live Now
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-crust border border-black/10 dark:border-white/5 rounded-xl p-2 text-center">
                    <span className="font-mono text-lg sm:text-xl font-black text-warning block leading-none">
                      {timeLeft.days.toString().padStart(2, '0')}
                    </span>
                    <span className="text-[8px] font-mono uppercase text-text-muted mt-1 block font-semibold">Days</span>
                  </div>
                  <div className="bg-crust border border-black/10 dark:border-white/5 rounded-xl p-2 text-center">
                    <span className="font-mono text-lg sm:text-xl font-black text-warning block leading-none">
                      {timeLeft.hours.toString().padStart(2, '0')}
                    </span>
                    <span className="text-[8px] font-mono uppercase text-text-muted mt-1 block font-semibold">Hours</span>
                  </div>
                  <div className="bg-crust border border-black/10 dark:border-white/5 rounded-xl p-2 text-center">
                    <span className="font-mono text-lg sm:text-xl font-black text-warning block leading-none">
                      {timeLeft.minutes.toString().padStart(2, '0')}
                    </span>
                    <span className="text-[8px] font-mono uppercase text-text-muted mt-1 block font-semibold">Mins</span>
                  </div>
                  <div className="bg-crust border border-black/10 dark:border-white/5 rounded-xl p-2 text-center">
                    <span className="font-mono text-lg sm:text-xl font-black text-warning block leading-none">
                      {timeLeft.seconds.toString().padStart(2, '0')}
                    </span>
                    <span className="text-[8px] font-mono uppercase text-text-muted mt-1 block font-semibold">Secs</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* 3D Touchable Registration Button */}
                <a 
                  href="https://docs.google.com/forms/d/e/1FAIpQLSf7F7kaCXA2LQuL94Ipq4hADtx2yG8cOL52P024-53l8Pm0Uw/viewform?usp=header"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative w-full inline-flex items-center justify-center gap-3 px-6 py-4 bg-warning hover:bg-warning-dark text-crust font-black uppercase tracking-wider rounded-xl text-xs sm:text-sm shadow-[0_6px_0_0_#9a3412] hover:shadow-[0_4px_0_0_#9a3412] active:shadow-[0_0px_0_0_#9a3412] active:translate-y-[6px] border border-amber-500/20 transition-all text-center"
                >
                  <Sparkles size={16} className="animate-pulse text-crust" />
                  <span>Click Here To Register</span>
                </a>


              </div>

            </div>
          </div>
        </div>
      </motion.section>

      {/* About Snapshot */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="py-24 bg-crust relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div className="relative">
              <div className="absolute -inset-4 bg-warning/10 border border-warning/20 transform rotate-3" />
              <div className="bg-surface p-8 relative border border-black/10 dark:border-white/5 shadow-2xl backdrop-blur-sm">
                 <EvidenceMarker number={<Star size={24} fill="currentColor" />} className="absolute -top-10 -left-6" />
                 <h2 className="font-heading font-black text-4xl mb-6">Bridge the Gap</h2>
                 <p className="text-text-muted text-lg leading-relaxed mb-6">
                   <EditableText id="home_about_par1" defaultText="ForenClue is a next-generation forensic education platform designed to bridge the gap between theoretical learning and real-world forensic science applications." isTextArea />
                 </p>
                 <p className="text-text-muted text-lg leading-relaxed border-l-4 border-warning pl-4">
                   <EditableText id="home_about_par2" defaultText="We provide structured e-books, case studies, and career pathways tailored for aspiring forensic professionals." isTextArea />
                 </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: Search, title: "Case-Based", desc: "Real crime case breakdowns" },
                { icon: BookOpen, title: "E-Library", desc: "Expert books & materials" },
                { icon: Users, title: "Career Path", desc: "Skills roadmap & guidance" },
                { icon: ShieldAlert, title: "Certified", desc: "Recognized certification programs" }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-base/50 border border-black/10 dark:border-white/5 p-6 hover:border-warning/30 transition-colors group"
                >
                  <feature.icon size={32} className="text-warning mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-heading font-bold text-xl mb-2">{feature.title}</h3>
                  <p className="text-sm text-text-muted">{feature.desc}</p>
                </motion.div>
              ))}
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
              src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgiJ2oOCQiw2cxeNN6p5b40F-AKZdIkdSRRZ9V14gvIgg2MOymbNvpD2_QcaQ8gB9UxMzmp1l3iafah8Tdz2GChCInBXR8HeRIr3x_-N7a3zrpUejvhRpRhN_8UrEcvMxKN46sAl322fuGSgE3WRyeURXB0MiRstqFsk7jPALV8r3Vx8TyN_eWEPULmX0w/s1492/Mr.%20Ashutosh%20Singh.png"
              alt="Official Webinar Event Poster - Full Screen"
              className="max-w-full max-h-[90vh] md:max-h-[95vh] object-contain rounded-lg"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}

    </div>
  );
}
