import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles } from 'lucide-react';

export default function BookPopup() {
  const [isOpen, setIsOpen] = useState(false);

  // Auto-trigger delay on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1500); // 1.5 seconds delay after load
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Glassmorphic background overlay */}
          <motion.div
            id="book-popup-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-base/90 backdrop-blur-md"
          />

          {/* Minimalist Card */}
          <motion.div
            id="book-popup-modal"
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="relative w-full max-w-[340px] bg-surface/95 border border-warning/20 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.15)] p-5 text-center select-none"
          >
            {/* Top Close Icon Button (44px min touch target range with padding) */}
            <button
              aria-label="Close popup"
              onClick={handleClose}
              className="absolute top-2.5 right-2.5 p-2 rounded-full text-text-muted hover:text-text-main hover:bg-white/5 transition-colors cursor-pointer z-20"
            >
              <X size={16} />
            </button>

            {/* Coming Soon Highlight Tag on Upper Area */}
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-warning/10 border border-warning/30 rounded-full text-warning text-[9px] font-black uppercase tracking-[0.2em] mb-4 mt-1">
              <Sparkles size={9} className="animate-pulse" />
              <span>Coming Soon</span>
            </div>

            {/* Book Cover Design in Original Aspect Ratio */}
            <div className="relative mx-auto rounded-xl overflow-hidden shadow-[0_12px_28px_rgba(0,0,0,0.5)] border border-white/10 group cursor-pointer" onClick={handleClose}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <img 
                src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhxqof8d16pIw99ooiQFBmvUy66_m-xt5h5dqkOo_FeIKmOI9zyDRi6ugPBrFFcwH7ctXZlTGOJjplnfSl7514_w1DTc5Lh9ofqasFs813oVYcSb0xGQXK_cGPTpn9QSXK0FJGtABFYcG6B9UJ05JoM8nngI_hcyATHhipGD63UP44zdyFidt_SZM16RHc/s1536/0E77EF71-2531-44E9-9C0B-0F14A5324EB3.png" 
                alt="Forensic Careers Blueprint Book" 
                className="w-full h-auto object-contain block transition-transform duration-700 group-hover:scale-102"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
