import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Play } from 'lucide-react';
import { ResilientImage } from '@/lib/localFileStore';

export function PodcastPromoPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user has already dismissed the popup in this session or forever
    const isDismissed = localStorage.getItem('forenclue_podcast_promo_dismissed') === 'true';
    
    // Only trigger on the homepage or landing view, and if not already on the podcast page
    if (!isDismissed && location.pathname !== '/podcast') {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000); // Exquisite 3-second natural entrance after initial loading settles
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('forenclue_podcast_promo_dismissed', 'true');
  };

  const handleListenNow = () => {
    setIsOpen(false);
    localStorage.setItem('forenclue_podcast_promo_dismissed', 'true');
    navigate('/podcast');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-sm"
        />

        {/* Modal content container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 180 }}
          className="relative max-w-[340px] w-full bg-[#121212] rounded-2xl overflow-hidden border border-neutral-800 shadow-[0_24px_50px_-12px_rgba(29,185,84,0.3)] z-50 flex flex-col"
        >
          {/* Top cover art with hover zoom */}
          <div className="relative aspect-square w-full bg-neutral-900 group overflow-hidden">
            <ResilientImage
              src="https://www.dropbox.com/scl/fi/mcd47n75jiji29z8hyl9l/IMG_1221.png?rlkey=710x7h05bztk8kjcmxrvgpomj&st=hd2lg2mz&raw=1"
              alt="Sheena Bora Murder Case Podcast Cover Art"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Soft gradient bottom vignette to integrate the button perfectly */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-black/40 pointer-events-none" />

            {/* Premium dismiss button overlying the upper right corner */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 bg-black/60 hover:bg-black/90 text-white hover:text-[#1db954] transition-all p-1.5 rounded-full border border-white/10"
              aria-label="Close podcast promo"
            >
              <X size={16} />
            </button>

            {/* Floating badge for branding context */}
            <div className="absolute bottom-4 left-4 bg-[#1db954] text-black text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow-md">
              New Episode
            </div>
          </div>

          {/* Action layout */}
          <div className="p-5 flex flex-col items-center bg-[#121212]">
            <h4 className="text-white font-sans font-black text-center text-base uppercase tracking-tight mb-1 leading-tight">
              Sheena Bora Murder Case
            </h4>
            <span className="text-[10px] font-black tracking-widest text-[#1db954] uppercase mb-4">
              FORENCLUE ORIGINAL PODCAST
            </span>

            {/* Custom styled Listen Now primary CTA */}
            <button
              onClick={handleListenNow}
              className="w-full py-3.5 bg-[#1db954] hover:bg-[#1ed760] active:scale-[0.98] text-black text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(29,185,84,0.3)]"
            >
              <Play size={14} fill="currentColor" className="text-black" />
              Listen Now
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
