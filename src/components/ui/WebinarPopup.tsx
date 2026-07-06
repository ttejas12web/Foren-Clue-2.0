import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Sparkles, X, ZoomIn } from 'lucide-react';

export function WebinarPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPosterZoomed, setIsPosterZoomed] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isCompleted: false
  });

  // Calculate countdown timer
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

  // Trigger popup immediately on successful loading
  useEffect(() => {
    const hasBeenShown = sessionStorage.getItem('webinar_popup_shown_v2');
    
    if (!hasBeenShown) {
      setIsOpen(true);
      sessionStorage.setItem('webinar_popup_shown_v2', 'true');
    }
  }, []);

  // Prevent background scrolling when popup is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop blur & overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Popup Container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="bg-crust border-2 border-warning/30 rounded-3xl p-4 sm:p-6 max-w-md w-full relative overflow-hidden shadow-2xl z-10 flex flex-col"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-warning to-amber-500"></div>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-3.5 right-3.5 p-1.5 bg-surface/50 hover:bg-surface border border-black/10 dark:border-white/5 text-text-muted hover:text-text-main rounded-full transition-all z-20"
                aria-label="Close popup"
              >
                <X size={16} />
              </button>

              {/* Compact container without scrollability */}
              <div className="space-y-4 select-none flex flex-col justify-between overflow-hidden">
                
                {/* Exclusive Live Session Tag */}
                <div className="flex justify-center pt-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-warning/15 border border-warning/30 rounded-full text-[9px] font-mono uppercase tracking-[0.2em] text-warning font-black shadow-sm">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    Exclusive Live Session
                  </span>
                </div>

                {/* Countdown Timer (Above Poster) */}
                <div className="bg-surface border border-warning/15 rounded-xl p-2 px-3 shadow-inner">
                  <div className="flex items-center justify-between mb-1 px-1">
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest text-warning font-bold">
                      <Clock size={10} className="animate-pulse" />
                      Timer Till Live Event (15th July)
                    </span>
                    {timeLeft.isCompleted && (
                      <span className="text-[9px] font-mono text-emerald-500 font-bold uppercase tracking-wider animate-pulse">
                        🟢 Live Now
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-1 sm:gap-1.5">
                    <div className="bg-crust border border-black/10 dark:border-white/5 rounded-lg py-1 text-center">
                      <span className="font-mono text-sm sm:text-base font-black text-warning block leading-none">
                        {timeLeft.days.toString().padStart(2, '0')}
                      </span>
                      <span className="text-[6px] font-mono uppercase text-text-muted mt-0.5 block font-semibold">Days</span>
                    </div>
                    <div className="bg-crust border border-black/10 dark:border-white/5 rounded-lg py-1 text-center">
                      <span className="font-mono text-sm sm:text-base font-black text-warning block leading-none">
                        {timeLeft.hours.toString().padStart(2, '0')}
                      </span>
                      <span className="text-[6px] font-mono uppercase text-text-muted mt-0.5 block font-semibold">Hours</span>
                    </div>
                    <div className="bg-crust border border-black/10 dark:border-white/5 rounded-lg py-1 text-center">
                      <span className="font-mono text-sm sm:text-base font-black text-warning block leading-none">
                        {timeLeft.minutes.toString().padStart(2, '0')}
                      </span>
                      <span className="text-[6px] font-mono uppercase text-text-muted mt-0.5 block font-semibold">Mins</span>
                    </div>
                    <div className="bg-crust border border-black/10 dark:border-white/5 rounded-lg py-1 text-center">
                      <span className="font-mono text-sm sm:text-base font-black text-warning block leading-none">
                        {timeLeft.seconds.toString().padStart(2, '0')}
                      </span>
                      <span className="text-[6px] font-mono uppercase text-text-muted mt-0.5 block font-semibold">Secs</span>
                    </div>
                  </div>
                </div>

                {/* Event Poster (Original aspect ratio, restricted height to prevent scroll) */}
                <div 
                  onClick={() => setIsPosterZoomed(true)}
                  className="relative rounded-2xl overflow-hidden border border-black/15 dark:border-white/10 shadow-lg bg-black/50 w-full cursor-zoom-in group transition-all duration-300 hover:border-warning/50 max-h-[38vh] flex items-center justify-center overflow-hidden"
                >
                  <img 
                    src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgiJ2oOCQiw2cxeNN6p5b40F-AKZdIkdSRRZ9V14gvIgg2MOymbNvpD2_QcaQ8gB9UxMzmp1l3iafah8Tdz2GChCInBXR8HeRIr3x_-N7a3zrpUejvhRpRhN_8UrEcvMxKN46sAl322fuGSgE3WRyeURXB0MiRstqFsk7jPALV8r3Vx8TyN_eWEPULmX0w/s1492/Mr.%20Ashutosh%20Singh.png"
                    alt="Official Webinar Event Poster - Career Pathways in Cybersecurity"
                    className="max-h-[38vh] w-auto object-contain block"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Click to zoom overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-1">
                    <div className="bg-warning/90 text-crust p-2 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <ZoomIn size={16} className="font-bold" />
                    </div>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-white font-bold bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm">
                      Click to view full screen
                    </span>
                  </div>
                </div>

                {/* 3D Register Button */}
                <div className="pt-0.5">
                  <a 
                    href="https://docs.google.com/forms/d/e/1FAIpQLSf7F7kaCXA2LQuL94Ipq4hADtx2yG8cOL52P024-53l8Pm0Uw/viewform?usp=header"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-warning hover:bg-warning-dark text-crust font-black uppercase tracking-wider rounded-xl text-xs shadow-[0_4px_0_0_#9a3412] hover:shadow-[0_2px_0_0_#9a3412] active:shadow-[0_0px_0_0_#9a3412] active:translate-y-[4px] border border-amber-500/20 transition-all text-center"
                  >
                    <Sparkles size={14} className="animate-pulse text-crust" />
                    <span>Click Here To Register</span>
                  </a>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Nested Zoom Lightbox */}
      <AnimatePresence>
        {isPosterZoomed && (
          <div 
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/95 p-4 md:p-6 backdrop-blur-md"
            onClick={() => setIsPosterZoomed(false)}
          >
            <div className="absolute top-4 right-4 z-[10001]">
              <button 
                onClick={() => setIsPosterZoomed(false)}
                className="p-3 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-full transition-all border border-white/10 hover:scale-105"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-full max-h-[90vh] md:max-h-[95vh] rounded-xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgiJ2oOCQiw2cxeNN6p5b40F-AKZdIkdSRRZ9V14gvIgg2MOymbNvpD2_QcaQ8gB9UxMzmp1l3iafah8Tdz2GChCInBXR8HeRIr3x_-N7a3zrpUejvhRpRhN_8UrEcvMxKN46sAl322fuGSgE3WRyeURXB0MiRstqFsk7jPALV8r3Vx8TyN_eWEPULmX0w/s1492/Mr.%20Ashutosh%20Singh.png"
                alt="Official Webinar Event Poster - Full Screen"
                className="max-w-full max-h-[90vh] md:max-h-[95vh] object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
