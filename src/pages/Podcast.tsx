import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  MoreHorizontal, 
  PlusCircle, 
  CheckCircle,
  SkipBack, 
  SkipForward, 
  RotateCcw,
  RotateCw,
  Volume2, 
  VolumeX,
  Share2,
  Clock,
  Heart,
  ChevronDown,
  Maximize2,
  Link2,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SEO } from '@/components/layout/SEO';
import { ResilientImage, resolveFileUrl } from '@/lib/localFileStore';

const PODCAST_INFO = {
  title: "ForenClue Podcast",
  presenter: "ForenClue Ventures",
  description: "Dive deep into the world of forensic science, competitive exams (UGC NET & FACT), and criminal case studies. An auditory learning experience designed for aspiring forensic experts.",
  coverImage: "https://www.dropbox.com/scl/fi/mcd47n75jiji29z8hyl9l/IMG_1221.png?rlkey=710x7h05bztk8kjcmxrvgpomj&st=hd2lg2mz&raw=1", // Using raw=1 for direct access
  color: "from-blue-600",
}

const EPISODES: any[] = [];

export default function Podcast() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [episodesList, setEpisodesList] = useState<any[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState<any>(null);
  const [resolvedAudioUrl, setResolvedAudioUrl] = useState('');
  const [realDuration, setRealDuration] = useState<number>(0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isPodcastOptionsOpen, setIsPodcastOptionsOpen] = useState(false);
  const [isEpisodeOptionsOpen, setIsEpisodeOptionsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const shareEpisode = async () => {
    if (!currentEpisode) return;
    const shareData = {
      title: currentEpisode.title,
      text: `Listen to "${currentEpisode.title}" on ForenClue Podcast`,
      url: window.location.href,
    };
    
    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return;
      }
    } catch (err) {
      console.log("Web Share API error:", err);
    }
    
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('Episode link copied!');
    } catch (err) {
      const subject = encodeURIComponent(`Listen to ${currentEpisode.title}`);
      const body = encodeURIComponent(`Check out this episode: ${window.location.href}`);
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }
  };
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // We enforce dark mode locally for the spotify feel
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    const loadDynamicEpisodes = async () => {
      try {
        const { db } = await import('@/lib/firebase');
        const { collection, getDocs } = await import('firebase/firestore');
        const querySnapshot = await getDocs(collection(db, 'podcastEpisodes'));
        const loaded: any[] = [];
        querySnapshot.forEach((docSnap) => {
          const d = docSnap.data();
          loaded.push({
            id: docSnap.id,
            title: d.title,
            description: d.description,
            date: d.date,
            duration: d.duration,
            durationSec: Number(d.durationSec) || 1800,
            audioUrl: d.audioUrl,
            image: d.coverImage || d.image || "https://www.dropbox.com/scl/fi/mcd47n75jiji29z8hyl9l/IMG_1221.png?rlkey=710x7h05bztk8kjcmxrvgpomj&st=hd2lg2mz&raw=1",
            createdAt: d.createdAt
          });
        });
        
        loaded.sort((a, b) => {
          const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dbVal = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dbVal - da; // Show newest custom episodes first
        });

        // Keep only active/admin uploaded episodes from Firestore directly, removing other static filters and list combinations
        setEpisodesList(loaded);
        
        if (loaded.length > 0) {
          setCurrentEpisode(loaded[0]);
        }
      } catch (err) {
        console.error("Failed to load custom podcast episodes from Firestore:", err);
      }
    };
    loadDynamicEpisodes();
  }, []);

  useEffect(() => {
    let active = true;
    let fallbackObjectUrl = '';

    const resolve = async () => {
      if (!currentEpisode || !currentEpisode.audioUrl) {
        setResolvedAudioUrl('');
        return;
      }
      
      try {
        // Resolve any localdb:// or standard relative URLs to local blob URLs or direct URLs
        const resolved = await resolveFileUrl(currentEpisode.audioUrl);
        if (active) {
          setResolvedAudioUrl(resolved);
          if (resolved.startsWith('blob:')) {
            fallbackObjectUrl = resolved;
          }
        }
      } catch (err) {
        console.warn("Failed to resolve audio URL:", err);
        if (active) {
          setResolvedAudioUrl(currentEpisode.audioUrl);
        }
      }
    };

    resolve();

    return () => {
      active = false;
      if (fallbackObjectUrl) {
        URL.revokeObjectURL(fallbackObjectUrl);
      }
    };
  }, [currentEpisode]);

  useEffect(() => {
    if (currentEpisode) {
      setRealDuration(currentEpisode.durationSec || 0);
    }
  }, [currentEpisode]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log("Audio playback failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentEpisode, playbackRate]);

  const togglePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 2];
    const nextRateIndex = (rates.indexOf(playbackRate) + 1) % rates.length;
    setPlaybackRate(rates[nextRateIndex]);
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      const d = audioRef.current.duration || realDuration;
      if (d) {
        audioRef.current.currentTime = Math.min(d, audioRef.current.currentTime + 10);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const d = audioRef.current.duration;
      if (d && d !== realDuration && !isNaN(d) && isFinite(d)) {
        setRealDuration(d);
      }
      if (d) {
        setProgress((current / d) * 100);
      }
    }
  };

  const playNextEpisode = () => {
    if (!currentEpisode) return;
    const currentIndex = episodesList.findIndex(ep => ep.id === currentEpisode.id);
    if (currentIndex < episodesList.length - 1) {
      const nextEp = episodesList[currentIndex + 1];
      setCurrentEpisode(nextEp);
      setIsPlaying(true);
      setProgress(0);
    }
  };

  const playPrevEpisode = () => {
    if (!currentEpisode) return;
    const currentIndex = episodesList.findIndex(ep => ep.id === currentEpisode.id);
    if (currentIndex > 0) {
      const prevEp = episodesList[currentIndex - 1];
      setCurrentEpisode(prevEp);
      setIsPlaying(true);
      setProgress(0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setProgress(val);
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = (val / 100) * audioRef.current.duration;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const playEpisode = (episode: any) => {
    if (currentEpisode && currentEpisode.id === episode.id) {
      if (!isPlaying) {
        setIsPlaying(true);
      }
      setIsPlayerExpanded(true);
    } else {
      setCurrentEpisode(episode);
      setIsPlaying(true);
      setProgress(0);
      setIsPlayerExpanded(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white pb-28 font-sans selection:bg-green-500/30 selection:text-green-200 pl-0 md:pl-2">
      <SEO 
        title="ForenClue Podcast - ForenClue" 
        description="Listen to the ForenClue Podcast by ForenClue."
        keywords="podcast, forensic science podcast, neet cracker, ugc net"
      />
      
      {/* Audio Element */}
      <audio 
        ref={audioRef} 
        src={resolvedAudioUrl || currentEpisode?.audioUrl || undefined} 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (audioRef.current && audioRef.current.duration) {
            const d = audioRef.current.duration;
            if (!isNaN(d) && isFinite(d)) {
              setRealDuration(d);
            }
          }
        }}
        onDurationChange={() => {
          if (audioRef.current && audioRef.current.duration) {
            const d = audioRef.current.duration;
            if (!isNaN(d) && isFinite(d)) {
              setRealDuration(d);
            }
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          playNextEpisode();
        }}
      />

      <div className="w-full relative h-[350px] sm:h-[450px] flex items-end p-6 sm:p-8 overflow-hidden">
        {/* Background Wide Fade Image */}
        <div className="absolute inset-0 z-0">
          <img src={PODCAST_INFO.coverImage} alt="Cover Background" className="w-full h-full object-cover object-center opacity-70" />
        </div>
        
        {/* Gradients for fade effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/70 to-transparent z-0"></div>
        <div className={`absolute inset-0 bg-gradient-to-b ${PODCAST_INFO.color} to-transparent opacity-40 z-0`}></div>
        <div className="absolute inset-0 bg-black/30 z-0"></div>
        
        <div className="relative z-10 flex flex-col gap-2 w-full max-w-6xl mx-auto drop-shadow-xl pt-10">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest block text-white/80">Podcast</span>
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter mb-2 text-white" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.6)' }}>
            ForenClue Podcast
          </h1>
          <h2 className="text-lg sm:text-2xl font-bold text-white/90">{PODCAST_INFO.presenter}</h2>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 relative z-10">
        <div className="bg-black/20 p-6 -mx-6 mb-8 flex items-center gap-6">
           {currentEpisode && (
             <button 
                onClick={() => playEpisode(currentEpisode)}
                className="w-14 h-14 rounded-full bg-[#1db954] hover:scale-105 transition-transform flex items-center justify-center text-black"
             >
                {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
             </button>
           )}
           
           <div className="relative">
             <button 
               className="text-white/60 hover:text-white transition-colors"
               onClick={() => setIsPodcastOptionsOpen(true)}
             >
               <MoreHorizontal size={32} />
             </button>

             <AnimatePresence>
               {isPodcastOptionsOpen && (
                 <>
                   <div className="fixed inset-0 z-40" onClick={() => setIsPodcastOptionsOpen(false)} />
                   <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: -10 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: -10 }}
                     transition={{ duration: 0.15, ease: "easeOut" }}
                     className="absolute left-0 sm:left-auto sm:right-0 top-12 w-56 bg-[#282828] border border-white/10 rounded-md shadow-2xl py-1 z-50 overflow-hidden"
                   >
                     <button className="w-full px-4 py-3 flex items-center gap-3 text-sm hover:bg-white/10 text-white/90 hover:text-white text-left transition-colors" onClick={() => { navigator.clipboard.writeText(window.location.href); showToast('Podcast link copied!'); setIsPodcastOptionsOpen(false); }}>
                       <Link2 size={18} />
                       <span>Copy Link to Podcast</span>
                     </button>
                     <button className="w-full px-4 py-3 flex items-center gap-3 text-sm hover:bg-white/10 text-white/90 hover:text-white text-left transition-colors" onClick={() => { 
                       const subject = encodeURIComponent(`Listen to ${PODCAST_INFO.title}`);
                       const body = encodeURIComponent(`Check out this podcast: ${window.location.href}`);
                       window.location.href = `mailto:?subject=${subject}&body=${body}`;
                       setIsPodcastOptionsOpen(false); 
                     }}>
                       <Share2 size={18} />
                       <span>Share via Email</span>
                     </button>
                     <div className="h-[1px] bg-white/10 my-1 w-full" />
                     <button className="w-full px-4 py-3 flex items-center gap-3 text-sm hover:bg-white/10 text-white/90 hover:text-white text-left transition-colors" onClick={() => {
                       document.getElementById('about-show')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                       setIsPodcastOptionsOpen(false);
                     }}>
                       <Info size={18} />
                       <span>About Show</span>
                     </button>
                   </motion.div>
                 </>
               )}
             </AnimatePresence>
           </div>
        </div>

        <div className="max-w-4xl" id="about-show">
          <p className="text-white/60 mb-8 leading-relaxed max-w-2xl">
            {PODCAST_INFO.description}
          </p>

          <h3 className="text-xl sm:text-2xl font-bold mb-6">Episodes</h3>
          
          <div className="flex flex-col gap-4">
            {episodesList.length === 0 ? (
              <div className="text-white/40 text-sm py-12 border border-dashed border-white/10 rounded-xl text-center bg-white/5 font-medium">
                No active episodes uploaded yet. Check back soon!
              </div>
            ) : (
              episodesList.map((ep) => {
                const isCurrentEp = currentEpisode && currentEpisode.id === ep.id;
                
                return (
                  <div 
                    key={ep.id} 
                    className={cn(
                      "group flex gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5",
                      isCurrentEp && "bg-white/5"
                    )}
                    onClick={() => playEpisode(ep)}
                  >
                    <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-md overflow-hidden shrink-0 mt-1">
                      <ResilientImage src={ep.image} alt={ep.title} className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex flex-col flex-1 justify-center relative pr-12">
                       <h4 className={cn("font-bold text-base sm:text-lg mb-1 leading-tight", isCurrentEp ? "text-[#1db954]" : "text-white")}>{ep.title}</h4>
                       <p className="text-sm text-white/60 line-clamp-2 md:line-clamp-none max-w-3xl mb-2 sm:mb-3">{ep.description}</p>
                       
                      <div className="flex items-center gap-4 text-xs font-semibold text-white/50">
                        <span>{ep.date}</span>
                        <span>•</span>
                        <span>{ep.duration}</span>
                      </div>
  
                      <button className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        {isCurrentEp && isPlaying ? <Pause fill="currentColor" size={24} /> : <Play fill="currentColor" size={24} />}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Mobile Mini Player */}
      {currentEpisode && (
        <div 
          className="md:hidden fixed bottom-4 left-2 right-2 h-[56px] bg-[#333333] hover:bg-[#3f3f3f] rounded-md z-50 flex flex-col overflow-hidden cursor-pointer shadow-xl transition-colors"
          onClick={() => setIsPlayerExpanded(true)}
        >
          <div className="flex-1 flex items-center px-2 justify-between">
            <div className="flex items-center gap-2 overflow-hidden flex-1 mr-2">
              <ResilientImage src={currentEpisode.image || "https://www.dropbox.com/scl/fi/mcd47n75jiji29z8hyl9l/IMG_1221.png?rlkey=710x7h05bztk8kjcmxrvgpomj&st=hd2lg2mz&raw=1"} alt="Ep Cover" className="w-10 h-10 rounded shadow-md shrink-0" />
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm text-white font-medium truncate">{currentEpisode.title}</span>
                <span className="text-xs text-[#b3b3b3] truncate">{PODCAST_INFO.presenter}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 mr-2">
               <button 
                 className="text-white/80 hover:text-white p-1 transition-colors"
                 onClick={(e) => { e.stopPropagation(); /* Add to liked episodes logic */ }}
               >
                 <Heart size={20} />
               </button>
               <button 
                 className="text-white hover:text-white/80 p-1 transition-colors"
                 onClick={(e) => { e.stopPropagation(); playEpisode(currentEpisode); }}
               >
                 {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
               </button>
            </div>
          </div>
          <div className="w-full h-[2px] bg-white/20">
            <div className="h-full bg-white rounded-r-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Desktop Player Bar */}
      {currentEpisode && (
        <div className="hidden md:flex fixed bottom-0 left-0 right-0 h-[90px] bg-[#181818] border-t border-[#282828] z-50 px-4 items-center justify-between">
           <div 
             className="flex items-center gap-4 w-[30%] min-w-[180px] cursor-pointer group hover:bg-white/5 p-2 -ml-2 rounded-lg transition-colors"
             onClick={() => setIsPlayerExpanded(true)}
           >
             <ResilientImage src={currentEpisode.image || "https://www.dropbox.com/scl/fi/mcd47n75jiji29z8hyl9l/IMG_1221.png?rlkey=710x7h05bztk8kjcmxrvgpomj&st=hd2lg2mz&raw=1"} alt="Ep Cover" className="w-14 h-14 rounded overflow-hidden" />
             <div className="flex flex-col overflow-hidden hidden sm:flex">
               <span className="text-sm text-white font-medium truncate group-hover:underline">{currentEpisode.title}</span>
               <span className="text-xs text-white/60 truncate group-hover:text-white">{PODCAST_INFO.title}</span>
             </div>
             <button 
               className="text-white/60 hover:text-white ml-2 hidden lg:block"
               onClick={(e) => { e.stopPropagation(); /* Add to liked episodes logic */ }}
             >
               <Heart size={16} />
             </button>
           </div>
  
           <div className="flex flex-col items-center max-w-[40%] flex-1">
             <div className="flex items-center gap-5 sm:gap-6 mb-2">
               <button 
                  className="text-white/60 hover:text-white hidden sm:block transition-colors" 
                  onClick={skipBackward}
                  title="Rewind 10 seconds"
                >
                  <RotateCcw size={20} />
                </button>
               <button 
                 className="w-8 h-8 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 transition-transform"
                 onClick={() => playEpisode(currentEpisode)}
               >
                  {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
               </button>
               <button 
                  className="text-white/60 hover:text-white hidden sm:block transition-colors" 
                  onClick={skipForward}
                  title="Forward 10 seconds"
                >
                  <RotateCw size={20} />
                </button>
             </div>
             
             <div className="flex items-center gap-2 w-full text-[11px] text-white/60 font-mono">
               <span className="min-w-[40px] text-right">{formatTime(audioRef.current?.currentTime || 0)}</span>
               <div className="h-1 lg:h-1.5 flex-1 bg-[#4d4d4d] rounded-full group cursor-pointer relative flex items-center">
                 <input 
                   type="range" 
                   min="0" 
                   max="100" 
                   value={progress}
                   onChange={handleSeek}
                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                 />
                 <div 
                   className="h-full bg-white group-hover:bg-[#1db954] rounded-full absolute left-0 top-0 pointer-events-none" 
                   style={{ width: `${progress}%` }}
                 />
               </div>
               <span className="min-w-[40px]">{formatTime(realDuration)}</span>
             </div>
           </div>
  
           <div className="flex w-[30%] justify-end items-center gap-2 hidden md:flex">
              <Maximize2 size={16} className="text-white/60 hover:text-white cursor-pointer mr-4" onClick={() => setIsPlayerExpanded(true)} />
              <Volume2 size={16} className="text-white/60" />
              <div className="w-24 h-1 lg:h-1.5 bg-[#4d4d4d] rounded-full group cursor-pointer relative flex items-center">
                 <input 
                   type="range" 
                   min="0" 
                   max="1" 
                   step="0.01"
                   value={volume}
                   onChange={handleVolumeChange}
                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                 />
                 <div 
                   className="h-full bg-white group-hover:bg-[#1db954] rounded-full absolute left-0 top-0 pointer-events-none" 
                   style={{ width: `${volume * 100}%` }}
                 />
              </div>
           </div>
        </div>
      )}

      {/* Full Screen Player */}
      <AnimatePresence>
        {isPlayerExpanded && currentEpisode && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-gradient-to-b from-zinc-800 to-black text-white flex flex-col pt-6 sm:pt-10 px-6 pb-8 overflow-y-auto"
          >
            {/* Top Header */}
            <div className="flex justify-between items-center mb-4 sm:mb-8 shrink-0">
              <button onClick={() => setIsPlayerExpanded(false)} className="text-white/70 hover:text-white p-2">
                <ChevronDown size={32} />
              </button>
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-white/50">Playing from podcast</span>
              </div>
              <div className="relative">
                <button 
                  className="text-white/70 hover:text-white p-2"
                  onClick={() => setIsEpisodeOptionsOpen(true)}
                >
                  <MoreHorizontal size={28} />
                </button>
                <AnimatePresence>
                  {isEpisodeOptionsOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsEpisodeOptionsOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 top-12 w-56 bg-[#282828] border border-white/10 rounded-md shadow-2xl py-1 z-50 overflow-hidden"
                      >
                        <button className="w-full px-4 py-3 flex items-center gap-3 text-sm hover:bg-white/10 text-white/90 hover:text-white text-left transition-colors" onClick={() => { navigator.clipboard.writeText(window.location.href); showToast('Episode link copied!'); setIsEpisodeOptionsOpen(false); }}>
                          <Link2 size={18} />
                          <span>Copy Episode Link</span>
                        </button>
                        <button className="w-full px-4 py-3 flex items-center gap-3 text-sm hover:bg-white/10 text-white/90 hover:text-white text-left transition-colors" onClick={() => { 
                          const subject = encodeURIComponent(`Listen to ${currentEpisode.title}`);
                          const body = encodeURIComponent(`Check out this episode: ${window.location.href}`);
                          window.location.href = `mailto:?subject=${subject}&body=${body}`;
                          setIsEpisodeOptionsOpen(false); 
                        }}>
                          <Share2 size={18} />
                          <span>Share Episode</span>
                        </button>
                        <div className="h-[1px] bg-white/10 my-1 w-full" />
                        <button className="w-full px-4 py-3 flex items-center gap-3 text-sm hover:bg-white/10 text-white/90 hover:text-white text-left transition-colors" onClick={() => { setIsEpisodeOptionsOpen(false); setIsPlayerExpanded(false); }}>
                          <Info size={18} />
                          <span>Go to Podcast</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Album Art */}
            <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] mb-8 shrink-0">
              <ResilientImage src={currentEpisode.image} alt="Cover" className="w-full max-w-[300px] sm:max-w-[400px] aspect-square object-cover shadow-[0_10px_50px_rgba(0,0,0,0.5)] rounded-xl sm:rounded-2xl" />
            </div>

            {/* Info & Controls */}
            <div className="max-w-[500px] w-full mx-auto flex flex-col gap-6 shrink-0 pt-auto pb-10">
              <div className="flex justify-between items-end">
                <div className="flex flex-col overflow-hidden mr-4">
                  <h2 className="text-[22px] sm:text-2xl font-bold truncate mb-1">{currentEpisode.title}</h2>
                  <p className="text-base sm:text-lg text-white/60 truncate">{PODCAST_INFO.presenter}</p>
                </div>
                <button className="text-[#1db954] hover:scale-110 transition-transform p-1">
                  <CheckCircle size={28} />
                </button>
              </div>

              {/* Progress */}
              <div className="flex flex-col gap-2">
                <div className="h-1.5 w-full bg-white/20 rounded-full group cursor-pointer relative flex items-center mt-2">
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={progress}
                    onChange={handleSeek}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div 
                    className="h-full bg-white group-hover:bg-[#1db954] rounded-full absolute left-0 top-0 pointer-events-none" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-white/50 font-mono font-medium">
                  <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
                  <span>{formatTime(realDuration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between px-2 sm:px-4 mt-2">
                <button className="text-white/60 hover:text-white transition-colors" onClick={togglePlaybackRate}>
                  <span className="font-bold text-sm sm:text-base">{playbackRate}x</span>
                </button>
                <button 
                  className="text-white hover:text-white/80 transition-colors" 
                  onClick={skipBackward}
                  title="Rewind 10 seconds"
                >
                  <RotateCcw size={32} className="sm:w-8 sm:h-8" />
                </button>
                <button 
                   className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 transition-transform shadow-lg"
                   onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause size={32} fill="currentColor" className="sm:w-10 sm:h-10" /> : <Play size={32} fill="currentColor" className="ml-1 sm:w-10 sm:h-10" />}
                </button>
                <button 
                  className="text-white hover:text-white/80 transition-colors" 
                  onClick={skipForward}
                  title="Forward 10 seconds"
                >
                  <RotateCw size={32} className="sm:w-8 sm:h-8" />
                </button>
                <button className="text-white/60 hover:text-white" onClick={shareEpisode}>
                   <Share2 size={24} className="sm:w-7 sm:h-7" />
                </button>
              </div>

              {/* Episode Description Card (Spotify Cloning Style) */}
              <div className="bg-white/5 rounded-xl p-4 sm:p-5 border border-white/10 mt-4 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-bold text-white/50 tracking-wider uppercase mb-1">
                  <span>About this episode</span>
                  <span>{currentEpisode.date}</span>
                </div>
                <p className="text-sm sm:text-base text-white/85 leading-relaxed">
                  {currentEpisode.description}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-28 md:bottom-28 left-1/2 -translate-x-1/2 z-[200] bg-white text-black font-semibold px-6 py-3 rounded-full shadow-2xl flex items-center gap-3"
          >
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
