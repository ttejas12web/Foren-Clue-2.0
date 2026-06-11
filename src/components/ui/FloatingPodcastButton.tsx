import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function FloatingPodcastButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Show after 1s
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    // Auto-collapse the label text after 5 seconds to keep the UI clean
    const collapseTimer = setTimeout(() => {
      setIsExpanded(false);
    }, 6000);

    return () => {
      clearTimeout(timer);
      clearTimeout(collapseTimer);
    };
  }, []);

  // Hide on the podcast page
  if (location.pathname === '/podcast') {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
          className="fixed bottom-6 right-6 z-50 pointer-events-auto"
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
        >
          <Link
            to="/podcast"
            aria-label="ForenClue Podcast"
            className="flex items-center h-14 bg-gradient-to-r from-neutral-900 via-neutral-950 to-emerald-950 hover:to-[#0f3a1e] text-white border-2 border-[#1db954] rounded-full shadow-[0_12px_40px_rgba(29,185,84,0.3)] hover:shadow-[0_12px_40px_rgba(29,185,84,0.55)] transition-all duration-300 group overflow-hidden pl-3.5 pr-4"
          >
            {/* Pulsing Live Podcast waves */}
            <div className="flex items-center justify-center w-7 h-7 bg-[#1db954] text-black rounded-full shrink-0 relative mr-2 shadow-sm">
              <Mic className="w-3.5 h-3.5" />
              <span className="absolute -inset-1 rounded-full border-2 border-emerald-400/30 animate-ping" />
            </div>

            {/* Dynamic Sliding Text */}
            <motion.div
              initial={false}
              animate={{ width: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden flex items-center whitespace-nowrap"
            >
              <div className="flex flex-col pr-1 h-10 justify-center">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#1db954]/90 block leading-none">OFFICIAL</span>
                <span className="text-xs font-bold font-sans text-neutral-10 tracking-tight leading-normal">ForenClue Podcast</span>
              </div>
            </motion.div>

            {/* Pulsing indicator when collapsed */}
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#1db954] border border-black"></span>
            </span>
          </Link>

          {/* Fallback Screenreader/Hover Tooltip if collapsed */}
          {!isExpanded && (
            <div className="absolute right-16 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="bg-neutral-900 border border-neutral-800 text-neutral-100 text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                Listen to <span className="text-[#1db954]">ForenClue Podcast</span>
                <div className="absolute top-1/2 -translate-y-1/2 -right-[4px] w-0 h-0 border-t-[5px] border-t-transparent border-l-[5px] border-l-neutral-900 border-b-[5px] border-b-transparent" />
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
