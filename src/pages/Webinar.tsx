import { useState, useEffect } from 'react';
import { Clock, Sparkles, X, ZoomIn } from 'lucide-react';
import { SEO } from '@/components/layout/SEO';

export default function Webinar() {
  const [isPosterOpen, setIsPosterOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isCompleted: false
  });

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

  return (
    <div className="min-h-screen bg-base py-16 px-4 sm:px-6 relative overflow-hidden flex items-center justify-center text-text-main">
      <SEO 
        title="Webinar: Career Pathways in Cybersecurity"
        description="Join Delhi Police Crime Branch Digital Forensic Professional, Mr. Ashutosh Singh, for an exclusive overview of roles, roadmaps, and career transition opportunities in cybersecurity and digital forensics."
        keywords="cybersecurity webinar, forensic science careers, digital forensics expert, Delhi Police Crime Branch, Ashutosh Singh, ForenClue events"
      />

      {/* Decorative background ambient light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-warning/5 rounded-full blur-[120px] -z-10 animate-pulse"></div>

      <div className="w-full max-w-2xl relative z-10">
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

            {/* Event Poster Card with Click-to-Zoom */}
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
