import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { WhatsAppIcon } from './WhatsAppIcon';

export function FloatingWhatsAppButton() {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  // Hide WhatsApp floating button in admin workspace
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  useEffect(() => {
    // Show after 1s
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
          className="fixed bottom-6 right-6 z-50 pointer-events-auto"
        >
          <a
            href="https://chat.whatsapp.com/DVmTqoEYIDnJl4bpPFdWzK?s=cl&p=i&ilr=0"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Join WhatsApp Group"
            className="flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-[0_12px_40px_rgba(37,211,102,0.4)] hover:shadow-[0_12px_40px_rgba(37,211,102,0.65)] transition-all duration-300 hover:scale-110 active:scale-95 group relative"
          >
            {/* Pulsing Live WhatsApp waves */}
            <span className="absolute -inset-1.5 rounded-full border-2 border-emerald-400/35 animate-ping pointer-events-none" />
            <WhatsAppIcon className="w-8 h-8 fill-current transition-transform duration-300 group-hover:rotate-12" />

            {/* Fallback Screenreader/Hover Tooltip */}
            <div className="absolute right-16 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="bg-neutral-900 border border-neutral-800 text-neutral-100 text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                Join <span className="text-[#25D366]">WhatsApp Group</span>
                <div className="absolute top-1/2 -translate-y-1/2 -right-[4px] w-0 h-0 border-t-[5px] border-t-transparent border-l-[5px] border-l-neutral-900 border-b-[5px] border-b-transparent" />
              </div>
            </div>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

