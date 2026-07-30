import React from 'react';
import { LeaderboardEntry } from '@/types/quiz';
import { Trophy, Medal, Award, Clock, CheckCircle2, User as UserIcon, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface LeaderboardPodiumProps {
  entries: LeaderboardEntry[];
  quizTitle?: string;
}

export function LeaderboardPodium({ entries, quizTitle }: LeaderboardPodiumProps) {
  const top1 = entries.find(e => e.rank === 1);
  const top2 = entries.find(e => e.rank === 2);
  const top3 = entries.find(e => e.rank === 3);
  const restEntries = entries.filter(e => e.rank > 3);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-10">
      
      {/* Top 3 Premium Podium Section */}
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest">
          <Trophy size={14} /> Official Leaderboard
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tight text-text-main">
          Top 10 Participants
        </h2>
        {quizTitle && (
          <p className="text-text-muted text-sm max-w-xl mx-auto">
            {quizTitle}
          </p>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="bg-surface/50 rounded-2xl border border-white/10 p-12 text-center text-text-muted">
          No leaderboard entries submitted yet. Be the first to attempt this quiz!
        </div>
      ) : (
        <>
          {/* Podium Display (2nd, 1st, 3rd) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-6">
            
            {/* 2nd Place (Silver) */}
            <div className="order-2 md:order-1">
              {top2 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-surface border border-slate-400/30 rounded-2xl p-6 text-center relative shadow-lg overflow-hidden group hover:border-slate-400/60 transition-all"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-400/50 via-slate-200 to-slate-400/50" />
                  <div className="absolute top-3 right-3 bg-slate-500/10 text-slate-300 border border-slate-400/30 text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Medal size={14} className="text-slate-300" /> #2 SILVER
                  </div>

                  <div className="relative mx-auto w-20 h-20 rounded-full border-2 border-slate-300/50 p-1 mb-4">
                    {top2.userPhoto ? (
                      <img src={top2.userPhoto} alt={top2.userName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-xl">
                        {top2.userName.charAt(0)}
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold text-lg text-text-main line-clamp-1 mb-1">
                    {top2.userName}
                  </h3>
                  

                  <div className="grid grid-cols-2 gap-2 bg-black/40 rounded-xl p-3 border border-white/5">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-text-muted block">Score</span>
                      <span className="font-extrabold text-sm text-slate-200">{top2.score}/{top2.totalPoints || 100}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-text-muted block">Time</span>
                      <span className="font-extrabold text-sm text-slate-200">{formatTime(top2.timeTakenSeconds)}</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-surface/30 border border-dashed border-white/10 rounded-2xl p-6 text-center text-text-muted text-sm">
                  2nd Place Available
                </div>
              )}
            </div>

            {/* 1st Place (Gold Champion - Center Elevated) */}
            <div className="order-1 md:order-2 md:-translate-y-4">
              {top1 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-b from-amber-500/15 via-surface to-surface border-2 border-amber-500/50 rounded-3xl p-7 text-center relative shadow-[0_0_40px_rgba(245,158,11,0.2)] overflow-hidden group hover:border-amber-400 transition-all"
                >
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500" />
                  
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-black uppercase tracking-widest mb-4 shadow-sm">
                    <Trophy size={14} className="text-yellow-400 fill-yellow-400" /> #1 CHAMPION
                  </div>

                  <div className="relative mx-auto w-24 h-24 rounded-full border-4 border-yellow-400 p-1 mb-4 shadow-[0_0_20px_rgba(250,204,21,0.4)]">
                    {top1.userPhoto ? (
                      <img src={top1.userPhoto} alt={top1.userName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-amber-950 flex items-center justify-center text-yellow-400 font-bold text-2xl">
                        {top1.userName.charAt(0)}
                      </div>
                    )}
                  </div>

                  <h3 className="font-extrabold text-xl text-text-main line-clamp-1 mb-1">
                    {top1.userName}
                  </h3>
                  

                  <div className="grid grid-cols-2 gap-2 bg-amber-500/10 rounded-2xl p-3.5 border border-amber-500/20">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300/80 block">Score</span>
                      <span className="font-black text-lg text-yellow-300">{top1.score}/{top1.totalPoints || 100}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300/80 block">Time</span>
                      <span className="font-black text-lg text-yellow-300">{formatTime(top1.timeTakenSeconds)}</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-surface/30 border border-dashed border-white/10 rounded-3xl p-8 text-center text-text-muted text-sm">
                  1st Place Available
                </div>
              )}
            </div>

            {/* 3rd Place (Bronze) */}
            <div className="order-3">
              {top3 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-surface border border-amber-700/40 rounded-2xl p-6 text-center relative shadow-lg overflow-hidden group hover:border-amber-600/60 transition-all"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700" />
                  <div className="absolute top-3 right-3 bg-amber-700/10 text-amber-500 border border-amber-700/30 text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Award size={14} className="text-amber-500" /> #3 BRONZE
                  </div>

                  <div className="relative mx-auto w-20 h-20 rounded-full border-2 border-amber-600/50 p-1 mb-4">
                    {top3.userPhoto ? (
                      <img src={top3.userPhoto} alt={top3.userName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-amber-950 flex items-center justify-center text-amber-500 font-bold text-xl">
                        {top3.userName.charAt(0)}
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold text-lg text-text-main line-clamp-1 mb-1">
                    {top3.userName}
                  </h3>
                  

                  <div className="grid grid-cols-2 gap-2 bg-black/40 rounded-xl p-3 border border-white/5">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-text-muted block">Score</span>
                      <span className="font-extrabold text-sm text-amber-200">{top3.score}/{top3.totalPoints || 100}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-text-muted block">Time</span>
                      <span className="font-extrabold text-sm text-amber-200">{formatTime(top3.timeTakenSeconds)}</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-surface/30 border border-dashed border-white/10 rounded-2xl p-6 text-center text-text-muted text-sm">
                  3rd Place Available
                </div>
              )}
            </div>

          </div>

          {/* Ranks 4 to 10 Table */}
          {restEntries.length > 0 && (
            <div className="bg-surface rounded-2xl border border-white/10 overflow-hidden shadow-xl mt-8">
              <div className="px-6 py-4 bg-black/40 border-b border-white/5 flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-text-muted">
                  Runner-Up Rankings (Ranks 4 - 10)
                </span>
                <span className="text-xs text-text-muted">
                  Sorted by Score & Completion Time
                </span>
              </div>

              <div className="divide-y divide-white/5">
                {restEntries.map((entry) => (
                  <div 
                    key={entry.userId + entry.completedAt}
                    className="p-4 px-6 flex items-center justify-between hover:bg-white/5 transition-colors gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center font-black text-sm text-text-muted">
                        #{entry.rank}
                      </span>

                      <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-dark flex-shrink-0 border border-white/10">
                        {entry.userPhoto ? (
                          <img src={entry.userPhoto} alt={entry.userName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-text-muted">
                            {entry.userName.charAt(0)}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="font-bold text-sm text-text-main truncate">
                          {entry.userName}
                        </div>
                        
                      </div>
                    </div>

                    <div className="flex items-center gap-6 flex-shrink-0 text-right">
                      <div>
                        <div className="text-xs text-text-muted">Accuracy</div>
                        <div className="font-bold text-sm text-info">{entry.accuracyPercentage}%</div>
                      </div>

                      <div>
                        <div className="text-xs text-text-muted">Time Taken</div>
                        <div className="font-bold text-sm text-text-main flex items-center gap-1 justify-end">
                          <Clock size={12} className="text-text-muted" />
                          {formatTime(entry.timeTakenSeconds)}
                        </div>
                      </div>

                      <div className="bg-black/40 border border-white/10 px-3 py-1.5 rounded-xl">
                        <div className="text-[10px] uppercase text-text-muted">Points</div>
                        <div className="font-black text-sm text-warning">{entry.score} pts</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
