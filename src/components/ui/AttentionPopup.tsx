import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';

export function AttentionPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed this attention disclaimer
    const isDismissed = sessionStorage.getItem('forenclue_attention_popup_dismissed') === 'true' 
                     || localStorage.getItem('forenclue_attention_popup_dismissed_v2') === 'true';
    
    if (!isDismissed) {
      // Small 1.2s delay to let the initial page load seamlessly first
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcknowledge = () => {
    setIsOpen(false);
    sessionStorage.setItem('forenclue_attention_popup_dismissed', 'true');
    localStorage.setItem('forenclue_attention_popup_dismissed_v2', 'true');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Soft, modern backdrop filter overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleAcknowledge}
          className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm"
        />

        {/* Minimal humanized Notice Container */}
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 10 }}
          transition={{ type: "spring", damping: 25, stiffness: 220 }}
          className="relative max-w-md w-full bg-surface dark:bg-zinc-900 border border-black/10 dark:border-white/10 shadow-2xl rounded-2xl p-6 sm:p-8 z-50 flex flex-col overflow-hidden"
        >
          {/* Subtle modern background gradient highlight */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-warning/40 via-warning to-warning/40" />

          {/* Header */}
          <div className="flex items-center gap-3.5 mb-5">
            <div className="p-2.5 bg-warning/10 text-warning rounded-xl shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold tracking-widest text-warning uppercase block mb-0.5">
                Welcome & Updates
              </span>
              <h3 className="text-lg font-heading font-black text-text-main dark:text-white uppercase tracking-tight leading-tight">
                A Quick platform Note
              </h3>
            </div>
          </div>

          {/* Content Body */}
          <div className="space-y-4 text-sm text-text-muted leading-relaxed font-sans mb-6">
            <p className="text-text-main/95 dark:text-zinc-200">
              Hello! We have recently updated the ForenClue platform to optimize your learning experience. Please keep the following changes in mind:
            </p>

            <div className="space-y-3.5 pt-1">
              <div className="flex gap-3 items-start">
                <span className="text-warning text-xs mt-1">•</span>
                <p className="text-xs sm:text-sm">
                  <strong className="text-text-main dark:text-white font-semibold">Active Interactive Cases:</strong> We have retired standard courses to focus purely on hands-on **Case Studies** and our curated forensic **E-Library**.
                </p>
              </div>

              <div className="flex gap-3 items-start">
                <span className="text-warning text-xs mt-1">•</span>
                <p className="text-xs sm:text-sm">
                  <strong className="text-text-main dark:text-white font-semibold">Educational Hub:</strong> All case files, toxicological templates, and simulation reports are built solely for study, reference analysis, and career development.
                </p>
              </div>
            </div>
          </div>

          {/* Clean Dismiss Controls */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-black/5 dark:border-white/5">
            <button
              id="acknowledge_attention_bulletin"
              onClick={handleAcknowledge}
              className="w-full sm:w-auto px-5 py-2.5 bg-warning hover:bg-warning-dark text-crust text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 rounded-xl border border-warning/10 active:scale-95 cursor-pointer hover:shadow-lg hover:shadow-warning/10"
            >
              <span>Explore Platform</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

