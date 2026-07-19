import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Clock, Sparkles, ArrowLeft, Calendar, User, 
  Linkedin, Play, ExternalLink, Star, MessageSquare, Send, Check,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { SEO } from '@/components/layout/SEO';
import { motion, AnimatePresence } from 'motion/react';

interface Feedback {
  id: string;
  name: string;
  role: string;
  rating: number;
  text: string;
  date: string;
  verified: boolean;
}

interface WebinarEvent {
  id: string;
  sequence: number;
  title: string;
  subtitle: string;
  date: string;
  time: string;
  description: string;
  fullDetails: string;
  youtubeId: string;
  speaker: {
    name: string;
    role: string;
    avatar: string;
    linkedin: string;
    bio: string;
  };
  poster: string;
  tags: string[];
  feedbacks: Feedback[];
}

const WEBINARS_DATA: WebinarEvent[] = [
  {
    id: "cybersecurity-career-pathways",
    sequence: 1,
    title: "Interactive Session on Career Pathways in Cybersecurity & Digital Forensics",
    subtitle: "Delhi Police Crime Branch Digital Forensic Professional Mr. Ashutosh Singh details career roles, learning roadmaps, and transition guide in forensics.",
    date: "July 15, 2026",
    time: "2:00 PM IST",
    description: "Explore incident response frameworks, cyber laws, state agency investigation workflows, and a concrete roadmap to land high-impact digital forensic roles in India.",
    fullDetails: "In this high-impact masterclass, Mr. Ashutosh Singh, a serving Digital Forensic Professional with the Delhi Police Crime Branch, shares critical industry insights, professional methodologies, and structural frameworks.\n\nLearn how public security investigations utilize cellular tracking, packet inspection, registry manipulation logs, and memory forensics to construct reliable judicial evidence. He lays out actionable steps to kickstart your cybersecurity and digital forensics career in India, covering necessary certifications (CEH, CHFI), hands-on lab projects, and internship pipelines.",
    youtubeId: "_mP2hfptGao", 
    speaker: {
      name: "Mr. Ashutosh Singh",
      role: "Delhi Police Crime Branch Digital Forensic Professional",
      avatar: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjtLXAx3JA_GV_s7QEAbL8YK43XS7e-5FrJngYv7szTZAs192ppvSo4zXQxX_0sNHnoDZ-rirNR8U6BGTwSPK9kAYRdR6YWVMLUCFLvs5Cbwy81gDHxep6XWIPhdynzKvZUMnai51-QoDEPYvkn0ObkO7K33ImRdWP3yPhV0FFkEA-zMP85DXlT3EOtoCE/s1024/1783083591880.png",
      linkedin: "https://www.linkedin.com/in/ashutosh-singh-817b63237",
      bio: "Digital Forensic Professional Crime Branch,Delhi Police | Researcher| Cyber Security| SOC| Threat Intelligence | OSINT | Financial crime and Investigation |ISO-27001| Information security | Ex-FSL| NFSU-MHA|"
    },
    poster: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgiJ2oOCQiw2cxeNN6p5b40F-AKZdIkdSRRZ9V14gvIgg2MOymbNvpD2_QcaQ8gB9UxMzmp1l3iafah8Tdz2GChCInBXR8HeRIr3x_-N7a3zrpUejvhRpRhN_8UrEcvMxKN46sAl322fuGSgE3WRyeURXB0MiRstqFsk7jPALV8r3Vx8TyN_eWEPULmX0w/s1492/Mr.%20Ashutosh%20Singh.png",
    tags: ["Cybersecurity", "roadmap", "guidance", "Career Pathways"],
    feedbacks: [
      {
        id: "fb-new-1",
        name: "Akshay Mahindrakar",
        role: "MIT WPU, Pune",
        rating: 5,
        text: "Thank you so much, ForenClue Team, for today's amazing podcast! A special thanks to Ashutosh Singh, Cyber Forensic Expert, Crime Branch Delhi, for sharing such valuable insights. Heartfelt thanks to Tejas Tapse and the entire ForenClue team for organizing this wonderful session. We learned so many new things about Digital Forensics and Cyber Security. It was truly an informative and inspiring experience. Once again, thank you so much, ForenClue Team! 🙏💙",
        date: "July 18, 2026",
        verified: true
      },
      {
        id: "fb-new-2",
        name: "Mahima",
        role: "Nims University",
        rating: 5,
        text: "Session was amazing and very informative .I request Forensic clue team to create more such events series on cyber security and digital Forensic from basics to advance. On student friendly or free if possible",
        date: "July 18, 2026",
        verified: true
      },
      {
        id: "fb-new-3",
        name: "Prashant Goswami",
        role: "Guru Ghasidas Vishwavidyalaya",
        rating: 5,
        text: "The session on \"Career Pathways in Cybersecurity for Forensic Science Students & Professionals\" provided highly insightful, practical guidance that seamlessly connected forensic science concepts with the evolving landscape of digital security.",
        date: "July 18, 2026",
        verified: true
      },
      {
        id: "fb-new-4",
        name: "Ashmita Mondal",
        role: "Adamas University",
        rating: 5,
        text: "It was a good session. I just want to say that if the interaction could a bit better between sir and us , it would have been much more engaging. Except for that the overall organizing team did a great job. Looking forward to attend more such sessions in the future.",
        date: "July 18, 2026",
        verified: true
      },
      {
        id: "fb-new-5",
        name: "Aksh Tyagi",
        role: "Tecnia institute of advanced Studies",
        rating: 5,
        text: "Thanks for the session I learnt a alot",
        date: "July 18, 2026",
        verified: true
      },
      {
        id: "fb-1",
        name: "Shreya Iyer",
        role: "Amity University Forensic Student",
        rating: 5,
        text: "The session by Mr. Ashutosh was eye-opening! His explanation of Delhi Police case studies on cell tower analysis and packet inspection gave us practical insights we never get in textbooks.",
        date: "July 16, 2026",
        verified: true
      },
      {
        id: "fb-2",
        name: "Karthik Nair",
        role: "Associate Incident Responder",
        rating: 5,
        text: "The live demonstration of carving deleted headers from disk images was spectacular. Highly recommended for any cybersecurity aspirant!",
        date: "July 16, 2026",
        verified: true
      },
      {
        id: "fb-3",
        name: "Ananya Deshmukh",
        role: "M.Sc. Digital Forensics Student",
        rating: 5,
        text: "Very clear explanation on roadmaps and certifications. I finally know whether to go for CEH or CHFI first.",
        date: "July 17, 2026",
        verified: true
      }
    ]
  }
];

export default function Webinar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedEventId = searchParams.get('event');
  
  const [localEvents, setLocalEvents] = useState<WebinarEvent[]>(WEBINARS_DATA);
  
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -350, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 350, behavior: 'smooth' });
    }
  };
  
  // Custom feedback state
  const [newFeedback, setNewFeedback] = useState({
    name: '',
    role: '',
    rating: 5,
    text: ''
  });
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Active event mapping
  const currentEvent = localEvents.find(e => e.id === selectedEventId);

  // Auto-scrolling and page title coordination
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setFeedbackSuccess(false);
    setNewFeedback({ name: '', role: '', rating: 5, text: '' });
  }, [selectedEventId]);

  const selectEvent = (eventId: string | null) => {
    if (eventId) {
      setSearchParams({ event: eventId });
    } else {
      setSearchParams({});
    }
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedback.name.trim() || !newFeedback.text.trim() || !currentEvent) return;

    const feedbackObj: Feedback = {
      id: `fb-user-${Date.now()}`,
      name: newFeedback.name,
      role: newFeedback.role || 'Verified Participant',
      rating: newFeedback.rating,
      text: newFeedback.text,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      verified: true
    };

    // Update the event with the new feedback item
    const updatedEvents = localEvents.map(ev => {
      if (ev.id === currentEvent.id) {
        return {
          ...ev,
          feedbacks: [feedbackObj, ...ev.feedbacks]
        };
      }
      return ev;
    });

    setLocalEvents(updatedEvents);
    setFeedbackSuccess(true);
    setNewFeedback({ name: '', role: '', rating: 5, text: '' });

    // Success fadeout timer
    setTimeout(() => {
      setFeedbackSuccess(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-base py-16 px-4 sm:px-6 relative overflow-hidden text-text-main">
      {/* Decorative cyber grid overlay */}
      <div className="absolute inset-0 bg-grid-white/[0.01] bg-[size:32px_32px] pointer-events-none -z-10" />

      {/* Ambient background lights */}
      <div className="absolute top-1/4 left-1/4 w-[35rem] h-[35rem] bg-warning/5 rounded-full blur-[140px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[35rem] h-[35rem] bg-amber-500/5 rounded-full blur-[140px] -z-10 animate-pulse" />

      <AnimatePresence mode="wait">
        {currentEvent ? (
          /* ========================================================================= */
          /* DETAILED SINGLE WEBINAR SCREEN                                           */
          /* ========================================================================= */
          <motion.div
            key={`detail-${currentEvent.id}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="w-full max-w-5xl mx-auto space-y-8 relative z-10"
            id={`webinar-screen-${currentEvent.id}`}
          >
            <SEO 
              title={`Webinar ${currentEvent.sequence}: ${currentEvent.title} | ForenClue`}
              description={`${currentEvent.subtitle} Direct video capture, speaker credentials, and student feedbacks.`}
              keywords={`${currentEvent.tags.join(', ')}, forenclue, digital forensics webinar`}
            />

            {/* Premium Sticky-Ready Header Nav bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-6">
              <button
                onClick={() => selectEvent(null)}
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-warning hover:text-white transition-colors bg-surface border border-warning/20 hover:border-warning/50 px-4 py-2.5 rounded-xl cursor-pointer shadow-sm active:scale-95"
              >
                <ArrowLeft size={14} />
                <span>Return to Webinars</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono bg-warning/10 border border-warning/30 text-warning px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                  Webinar Series &bull; Session {currentEvent.sequence}
                </span>
              </div>
            </div>

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column Area: YouTube & General description (2/3 width) */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Webinar Narrative Details */}
                <div className="bg-crust border border-black/10 dark:border-white/5 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                  <div className="flex flex-wrap gap-2">
                    {currentEvent.tags.map((tag, idx) => (
                      <span key={idx} className="text-[10px] font-mono font-black uppercase bg-surface border border-black/15 dark:border-white/10 px-3 py-1 rounded-lg text-text-muted">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <h1 className="text-xl sm:text-2xl font-black text-text-main uppercase tracking-tight leading-snug">
                      Webinar {currentEvent.sequence}: {currentEvent.title}
                    </h1>
                  </div>
                </div>

                {/* Widescreen YouTube Video Player with Custom Border Accent */}
                <div className="bg-crust border border-warning/20 rounded-3xl p-3 sm:p-4 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-warning via-amber-500 to-warning" />
                  
                  {/* YouTube Embed Container */}
                  <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black relative border border-black/30">
                    <iframe
                      src={`https://www.youtube.com/embed/${currentEvent.youtubeId}?autoplay=0&rel=0&modestbranding=1`}
                      title={`ForenClue Webinar: ${currentEvent.title}`}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>

                  {/* Operational strip banner */}
                  <div className="mt-3.5 flex items-center justify-between px-1 text-[9px] font-mono text-text-muted tracking-widest uppercase">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                      Status: High Definition Playback Enabled
                    </span>
                    <span>Session {currentEvent.sequence}</span>
                  </div>
                </div>

                {/* FEEDBACKS AND TESTIMONIALS SECTION */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-4">
                    <MessageSquare className="text-warning w-5 h-5" />
                    <h2 className="text-base font-black uppercase text-text-main tracking-wider">
                      Participant Feedbacks & Reviews ({currentEvent.feedbacks.length})
                    </h2>
                  </div>



                  {/* Reviews List - Horizontal Modern Slider */}
                  <div className="relative space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest font-bold">
                        Slide or swipe to read reviews
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={scrollLeft}
                          className="p-1.5 rounded-lg bg-surface hover:bg-warning/10 border border-black/15 dark:border-white/10 text-text-main hover:text-warning transition-colors active:scale-95 cursor-pointer"
                          aria-label="Previous Review"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={scrollRight}
                          className="p-1.5 rounded-lg bg-surface hover:bg-warning/10 border border-black/15 dark:border-white/10 text-text-main hover:text-warning transition-colors active:scale-95 cursor-pointer"
                          aria-label="Next Review"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>

                    <div 
                      ref={sliderRef}
                      className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none scroll-smooth -mx-2 px-2"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {currentEvent.feedbacks.map((item) => (
                        <div 
                          key={item.id}
                          className="w-[280px] sm:w-[350px] shrink-0 snap-start bg-crust border border-black/10 dark:border-white/5 rounded-2xl p-5 space-y-4 relative overflow-hidden flex flex-col justify-between hover:border-warning/30 transition-colors shadow-lg"
                        >
                          {/* Top part: details */}
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-0.5">
                                <h4 className="text-xs font-black text-text-main uppercase line-clamp-1">{item.name}</h4>
                                <p className="text-[10px] font-mono text-warning font-semibold line-clamp-1">{item.role}</p>
                              </div>
                              {item.verified && (
                                <span className="text-[7px] tracking-wider font-mono bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
                                  VERIFIED
                                </span>
                              )}
                            </div>

                            {/* Star display */}
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, idx) => (
                                <Star 
                                  key={idx} 
                                  size={11} 
                                  className={idx < item.rating ? "fill-amber-400 text-amber-400" : "text-zinc-600"} 
                                />
                              ))}
                            </div>

                            <p className="text-xs text-text-muted leading-relaxed font-sans italic line-clamp-5">
                              "{item.text}"
                            </p>
                          </div>

                          {/* Footer details: Date */}
                          <div className="flex justify-between items-center border-t border-black/5 dark:border-white/5 pt-3 text-[9px] font-mono text-text-muted">
                            <span>Participant Feedback</span>
                            <span>{item.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

              {/* Right Column: Poster Box & Host Bio (1/3 width) */}
              <div className="space-y-8">
                
                {/* Distinguished Speaker Details */}
                <div className="bg-crust border border-black/10 dark:border-white/5 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-warning/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="text-center space-y-4">
                    <span className="inline-block text-[9px] font-mono bg-warning/10 border border-warning/20 text-warning px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-widest">
                      Speaker Profile
                    </span>

                    {/* Speaker Avatar */}
                    <div className="relative w-24 h-24 mx-auto rounded-2xl overflow-hidden border-2 border-warning/30 bg-surface shadow-md">
                      <img
                        src={currentEvent.speaker.avatar}
                        alt={currentEvent.speaker.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-base font-extrabold text-text-main uppercase">
                        {currentEvent.speaker.name}
                      </h4>
                      <p className="text-[11px] font-mono text-warning leading-snug">
                        {currentEvent.speaker.role}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-text-muted leading-relaxed font-sans text-center italic border-t border-black/5 dark:border-white/5 pt-4">
                    "{currentEvent.speaker.bio}"
                  </p>

                  {/* LinkedIn social handle only */}
                  <div className="pt-2">
                    <a
                      href={currentEvent.speaker.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#0a66c2] hover:bg-[#004182] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      <Linkedin size={14} className="fill-white stroke-none" />
                      <span>LinkedIn Handle</span>
                      <ExternalLink size={12} className="opacity-80" />
                    </a>
                  </div>
                </div>

                {/* Visual Cover Poster Thumbnail */}
                <div className="space-y-2">
                  <span className="block text-[10px] font-mono text-text-muted uppercase tracking-widest font-bold">
                    Official Session Poster
                  </span>
                  <div className="relative rounded-2xl overflow-hidden border border-warning/20 bg-black/40 shadow-xl">
                    <img 
                      src={currentEvent.poster}
                      alt={`${currentEvent.title} Promotional Poster`}
                      className="w-full h-auto block"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

              </div>

            </div>

            {/* Quick Explore Navigation Footer to other webinars */}
            {localEvents.filter(ev => ev.id !== currentEvent.id).length > 0 && (
              <div className="space-y-4 pt-8 border-t border-black/10 dark:border-white/10">
                <h3 className="text-xs font-mono uppercase tracking-widest text-warning font-black">
                  Explore Other Recorded Masterclasses
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {localEvents.filter(ev => ev.id !== currentEvent.id).map((ev) => (
                    <div
                      key={ev.id}
                      onClick={() => selectEvent(ev.id)}
                      className="bg-crust border border-black/15 dark:border-white/10 rounded-2xl p-5 hover:border-warning/40 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-warning">
                          <span className="font-bold">WEBINAR {ev.sequence}</span>
                          <span>{ev.date}</span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-black text-text-main uppercase group-hover:text-warning transition-colors line-clamp-1">
                          {ev.title}
                        </h4>
                        <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                          {ev.description}
                        </p>
                      </div>

                      <div className="border-t border-black/5 dark:border-white/5 pt-3 mt-4 flex items-center justify-between">
                        <span className="text-[10px] text-text-muted font-mono">
                          Host: {ev.speaker.name}
                        </span>
                        <span className="text-[10px] font-black text-warning uppercase tracking-wider flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          Explore <Play size={10} className="fill-warning" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </motion.div>
        ) : (
          /* ========================================================================= */
          /* MAIN GRID LIST VIEW (ALL WEBINARS STRUCTURED)                             */
          /* ========================================================================= */
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-5xl mx-auto space-y-12 relative z-10"
          >
            <SEO 
              title="Webinars & Virtual Training Masterclasses | ForenClue"
              description="Register for live forensic workshops, browse professional video lectures, and master legal investigation frameworks directly from verified practitioners."
              keywords="Delhi Police forensics, finger print analysis webinars, forensics genetic lectures, cybersecurity events"
            />

            {/* Interactive Webinar Hub - Premium Hero Design */}
            <div className="relative text-center w-full max-w-5xl mx-auto pt-0 pb-0 px-4 flex flex-col items-center">
              
              {/* Main HEADING with glowing text and audio wave visualizer graphics on sides */}
              <div className="relative flex items-center justify-center gap-4 sm:gap-8 w-full max-w-3xl mb-4">
                
                {/* Left Sound Wave Graphic */}
                <div className="hidden md:flex items-end gap-1.5 h-16 opacity-60">
                  <span className="w-[3px] h-4 bg-cyan-500/40 rounded-full animate-pulse"></span>
                  <span className="w-[3px] h-8 bg-cyan-500/60 rounded-full animate-pulse delay-75"></span>
                  <span className="w-[3px] h-14 bg-cyan-400 rounded-full animate-pulse delay-150"></span>
                  <span className="w-[3px] h-8 bg-cyan-500/60 rounded-full animate-pulse delay-300"></span>
                  <span className="w-[3px] h-4 bg-cyan-500/40 rounded-full animate-pulse delay-500"></span>
                </div>

                {/* WEBINARS text with back-glow and light-blue gradient */}
                <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-300 select-none relative z-10 drop-shadow-[0_0_20px_rgba(6,182,212,0.2)] font-sans">
                  WEBINARS
                </h1>

                {/* Right Sound Wave Graphic */}
                <div className="hidden md:flex items-end gap-1.5 h-16 opacity-60">
                  <span className="w-[3px] h-4 bg-cyan-500/40 rounded-full animate-pulse delay-500"></span>
                  <span className="w-[3px] h-8 bg-cyan-500/60 rounded-full animate-pulse delay-300"></span>
                  <span className="w-[3px] h-14 bg-cyan-400 rounded-full animate-pulse delay-150"></span>
                  <span className="w-[3px] h-8 bg-cyan-500/60 rounded-full animate-pulse delay-75"></span>
                  <span className="w-[3px] h-4 bg-cyan-500/40 rounded-full animate-pulse"></span>
                </div>
                
                {/* Subtle blue light flare behind the heading */}
                <div className="absolute inset-0 bg-cyan-500/10 blur-3xl rounded-full -z-10 w-2/3 mx-auto"></div>
              </div>

              {/* Thin neon light separator */}
              <div className="w-full max-w-xl h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent relative mb-8">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-cyan-400 rounded-full blur-[6px]" />
              </div>

              {/* Sleek Horizontal Category Liner */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-2 border-y border-cyan-500/10 py-6 bg-cyan-950/5 backdrop-blur-sm px-4 rounded-2xl">
                
                {/* SESSIONS */}
                <div className="flex items-start gap-3.5 text-left group">
                  <div className="relative p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)] group-hover:border-cyan-400/40 shrink-0 transition-colors">
                    <Play className="relative text-cyan-400 w-4 h-4 fill-cyan-400/20" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-mono font-extrabold uppercase tracking-widest text-white group-hover:text-cyan-400 transition-colors">
                      Sessions
                    </h3>
                    <p className="text-[11px] text-zinc-400 leading-normal font-sans">
                      Live expert sessions covering industry insights, case studies, and emerging trends.
                    </p>
                  </div>
                </div>

                {/* WORKSHOPS */}
                <div className="flex items-start gap-3.5 text-left group border-t md:border-t-0 md:border-x border-cyan-500/10 pt-4 md:pt-0 md:px-6">
                  <div className="relative p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)] group-hover:border-cyan-400/40 shrink-0 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400 animate-[spin_15s_linear_infinite]">
                      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-mono font-extrabold uppercase tracking-widest text-white group-hover:text-cyan-400 transition-colors">
                      Workshops
                    </h3>
                    <p className="text-[11px] text-zinc-400 leading-normal font-sans">
                      Hands-on interactive workshops designed to build practical skills and real-world expertise.
                    </p>
                  </div>
                </div>

                {/* SEMINARS */}
                <div className="flex items-start gap-3.5 text-left group border-t md:border-t-0 border-cyan-500/10 pt-4 md:pt-0">
                  <div className="relative p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)] group-hover:border-cyan-400/40 shrink-0 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-mono font-extrabold uppercase tracking-widest text-white group-hover:text-cyan-400 transition-colors">
                      Seminars
                    </h3>
                    <p className="text-[11px] text-zinc-400 leading-normal font-sans">
                      In-depth seminars on forensic science, technology, and professional development.
                    </p>
                  </div>
                </div>

              </div>

            </div>

            {/* structured webinars listing card blocks */}
            <div className="space-y-8" id="webinars-listing-block">
              {/* Redesigned grid with exact Webinar numbering formatting */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {localEvents.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => selectEvent(item.id)}
                    className="bg-crust border border-black/15 dark:border-white/10 rounded-2xl p-5 hover:border-warning/40 hover:shadow-xl hover:shadow-warning/[0.02] transition-all duration-300 group cursor-pointer flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      
                      {/* Image Thumbnail inside grid card */}
                      <div className="aspect-[16/10] w-full bg-surface rounded-xl overflow-hidden border border-black/10 dark:border-white/5 relative flex items-center justify-center">
                        <img 
                          src={item.poster}
                          alt={item.title}
                          className="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                        {/* Webinar Sequence Number Overlay */}
                        <div className="absolute top-2.5 left-2.5">
                          <span className="text-[9px] font-mono font-black uppercase bg-warning text-crust px-2.5 py-1 rounded-md shadow">
                            WEBINAR {item.sequence}
                          </span>
                        </div>
                      </div>

                      {/* Info text block */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-1 text-[9px] font-mono text-warning">
                          <Calendar size={11} />
                          <span>{item.date}</span>
                          <span className="text-text-muted">&bull;</span>
                          <span>{item.time}</span>
                        </div>

                        <h3 className="text-sm font-extrabold text-text-main group-hover:text-warning transition-colors uppercase line-clamp-2 leading-snug">
                          {item.title}
                        </h3>

                        <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                    </div>

                    {/* Footer strip details inside card */}
                    <div className="border-t border-black/5 dark:border-white/5 pt-4 mt-5 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <User size={11} className="text-text-muted" />
                        <span className="text-[10px] text-text-muted font-mono line-clamp-1 max-w-[120px]">
                          {item.speaker.name}
                        </span>
                      </div>

                      <span className="text-[9px] font-black uppercase tracking-wider text-warning flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        Explore Session
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
