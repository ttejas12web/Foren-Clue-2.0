import React from 'react';
import { motion } from 'motion/react';
import { Compass, Shield } from 'lucide-react';
import { SEO } from '@/components/layout/SEO';

export default function CampusAmbassadors() {
  return (
    <div className="min-h-screen bg-base relative overflow-hidden flex flex-col items-center justify-center py-20 px-4">
      <SEO 
        title="Campus Ambassadors | Coming Soon"
        description="The ForenClue Campus Ambassador portal is currently being calibrated. Coming soon."
        keywords="campus ambassador, forensic science, coming soon"
      />

      {/* Futuristic Ambient Grid Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.06] pointer-events-none" />
      
      {/* Radiant Glowing Orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] rounded-full bg-warning/5 blur-[120px] pointer-events-none" />

      <div className="max-w-2xl w-full text-center relative z-10 space-y-8">
        
        {/* Animated Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warning/10 border border-warning/30 text-warning text-xs font-mono font-bold uppercase tracking-widest"
        >
          <Shield size={12} className="stroke-[2.5]" />
          Work in Progress
        </motion.div>

        {/* Central Holographic Animation with Shining Badge */}
        <div className="relative w-56 h-56 mx-auto flex items-center justify-center">
          {/* Outer scanning shockwave */}
          <motion.div 
            animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full border border-warning/20"
          />
          {/* Middle pulsing zone */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.5, 0.15] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            className="absolute inset-6 rounded-full border border-warning/30"
          />
          {/* Sweeping radar line */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-10 rounded-full border border-dashed border-warning/40 border-t-transparent"
          />
          
          {/* Badge Container */}
          <motion.div 
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="relative w-36 h-36 bg-surface/80 dark:bg-crust/80 backdrop-blur-md border border-warning/30 rounded-full flex items-center justify-center p-3 shadow-[0_0_30px_rgba(245,158,11,0.15)] dark:shadow-[0_0_40px_rgba(245,158,11,0.1)] overflow-hidden group cursor-default"
          >
            {/* Ambient rotating background glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-warning/5 via-transparent to-warning/5 animate-spin [animation-duration:15s] pointer-events-none" />
            
            {/* Shining sweep overlay (sweeps every few seconds automatically) */}
            <motion.div 
              animate={{ x: ['-150%', '150%'] }}
              transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 2.8, ease: 'easeInOut' }}
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 z-20 pointer-events-none"
            />
            
            <img 
              src="https://blogger.googleusercontent.com/img/a/AVvXsEjnb4ZUOiND0rAIo-I8g9lVtlxNdiwc-uPrdSpWW2sPFQq4kPhDpOFRhEQmH1pnrHnNSRPuwWr0NdkrBka_MjU02zK15VK5-4DHQ01DUzJzLwx-M7-rUs9VEIp1RCYyV-6et12jaC5fleoimYUm1qwRQ-rMtZFH4a4-a_CyDhHsNo414RksWoPwo6cyfjI" 
              alt="Campus Ambassador Shining Badge" 
              className="w-28 h-28 object-contain relative z-10 select-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)] group-hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>

        {/* Title and Message */}
        <div className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-4xl sm:text-6xl font-heading font-black tracking-tight uppercase text-text-main"
          >
            Campus <span className="text-transparent bg-clip-text bg-gradient-to-r from-warning to-warning-dark">Ambassadors</span>
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-block"
          >
            <span className="text-xl sm:text-2xl font-mono font-bold text-warning uppercase tracking-wider bg-warning/5 border border-warning/20 px-6 py-2 rounded-xl">
              Coming Soon
            </span>
          </motion.div>
        </div>

        {/* Minimal Description */}
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-sm sm:text-base text-text-muted max-w-md mx-auto leading-relaxed font-body"
        >
          We are preparing our elite representative program. Soon, you will be able to apply and trigger forensics workshops directly from your college. Stay tuned!
        </motion.p>

      </div>
    </div>
  );
}
