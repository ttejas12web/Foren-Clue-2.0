import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Trophy, Clock, Calendar, ArrowRight, Sparkles, 
  Award, HelpCircle, CheckCircle2, ShieldAlert, Zap, Timer, Users
} from 'lucide-react';
import { Quiz } from '@/types/quiz';
import { fetchQuizzes } from '@/services/quizService';
import { cn } from '@/lib/utils';

export function UpcomingQuizSection() {
  const [weeklyQuizzes, setWeeklyQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuizzes() {
      try {
        const allQuizzes = await fetchQuizzes();
        // Filter for weekly challenges
        const weekly = allQuizzes.filter(q => q.isWeeklyChallenge);
        setWeeklyQuizzes(weekly);
      } catch (err) {
        console.error("Failed to load upcoming quizzes:", err);
      } finally {
        setLoading(false);
      }
    }
    loadQuizzes();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-crust border-b border-black/10 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-text-muted">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-surface/50 w-64 mx-auto rounded-xl"></div>
            <div className="h-4 bg-surface/30 w-96 mx-auto rounded-lg"></div>
          </div>
        </div>
      </section>
    );
  }

  if (weeklyQuizzes.length === 0) {
    return null; // Don't show empty block if no challenges exist
  }

  return (
    <motion.section 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      className="py-20 bg-crust relative overflow-hidden border-b border-black/10 dark:border-white/5"
    >
      {/* Background Cyber Glowing Accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-warning/5 rounded-full blur-[140px] pointer-events-none -z-0" />
      <div className="absolute top-0 right-10 w-72 h-72 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-warning/15 border border-warning/30 text-warning text-xs font-mono uppercase tracking-widest font-black mb-3 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-warning"></span>
              </span>
              <span>Timed Competitions</span>
            </div>
            
            <h2 className="font-heading font-black text-4xl sm:text-5xl md:text-6xl uppercase tracking-tighter text-text-main flex flex-wrap items-center gap-3 lg:gap-4 drop-shadow-sm">
              Upcoming Quiz <span className="text-transparent bg-clip-text bg-gradient-to-r from-warning to-amber-500 drop-shadow-[0_0_15px_rgba(252,211,77,0.4)]">Challenges</span>
              <Trophy size={42} className="text-warning hidden sm:inline-block animate-bounce drop-shadow-[0_0_10px_rgba(252,211,77,0.5)]" />
            </h2>
            <p className="text-sm sm:text-base text-text-muted mt-2 max-w-2xl">
              Compete against forensic science students across India, test your analytical precision under pressure, and secure a spot on the National Leaderboard!
            </p>
          </div>
        </div>

        {/* Quiz Challenge Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {weeklyQuizzes.map((quiz, idx) => {
            const now = new Date();
            let startTime = quiz.scheduledStartTime ? new Date(quiz.scheduledStartTime) : null;
            let endTime = quiz.scheduledEndTime ? new Date(quiz.scheduledEndTime) : null;

            const isLive = startTime && startTime <= now && (!endTime || endTime > now);
            const isUpcoming = startTime && startTime > now;

            return (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative bg-surface rounded-2xl border border-warning/30 hover:border-warning/70 shadow-xl shadow-warning/5 hover:shadow-warning/15 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Header Tag / Banner */}
                <div className="bg-gradient-to-r from-warning via-amber-500 to-yellow-500 px-4 py-2 flex items-center justify-between text-crust font-black text-[11px] uppercase tracking-widest shadow-sm">
                  <span className="flex items-center gap-1.5">
                    <Trophy size={14} className="fill-crust" /> WEEKLY CHALLENGE #{idx + 1}
                  </span>
                  
                  {isLive ? (
                    <span className="flex items-center gap-1.5 bg-crust text-warning px-2 py-0.5 rounded-full font-mono text-[10px] font-black border border-warning/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE NOW
                    </span>
                  ) : isUpcoming ? (
                    <span className="flex items-center gap-1.5 bg-crust/90 text-amber-300 px-2 py-0.5 rounded-full font-mono text-[10px] font-black">
                      <Clock size={11} /> UPCOMING
                    </span>
                  ) : (
                    <span className="bg-crust/80 text-white/80 px-2 py-0.5 rounded-full font-mono text-[10px]">
                      ACTIVE
                    </span>
                  )}
                </div>

                {/* Card Main Body */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Category & Points Pill */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-black uppercase tracking-wider text-warning bg-warning/10 px-3 py-1 rounded-full border border-warning/20">
                        {quiz.category || 'Forensic Challenge'}
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-500 flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg">
                        <Award size={14} /> {quiz.totalPoints || 100} PTS
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-heading font-black text-lg text-text-main group-hover:text-warning transition-colors leading-snug mb-2">
                      {quiz.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-text-muted line-clamp-3 leading-relaxed mb-4">
                      {quiz.description}
                    </p>
                  </div>

                  {/* Date & Time Metadata */}
                  <div className="space-y-2 border-t border-black/10 dark:border-white/10 pt-4 text-xs font-mono">
                    {startTime && (
                      <div className="flex items-center justify-between text-text-muted">
                        <span className="flex items-center gap-1.5 text-[11px]">
                          <Calendar size={13} className="text-warning shrink-0" /> Scheduled Start:
                        </span>
                        <span className="font-bold text-text-main text-[11px]">
                          {startTime.toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-text-muted">
                      <span className="flex items-center gap-1.5 text-[11px]">
                        <Timer size={13} className="text-warning shrink-0" /> Time Limit:
                      </span>
                      <span className="font-bold text-text-main text-[11px]">
                        {quiz.durationMinutes} Minutes
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-text-muted">
                      <span className="flex items-center gap-1.5 text-[11px]">
                        <HelpCircle size={13} className="text-warning shrink-0" /> Questions:
                      </span>
                      <span className="font-bold text-text-main text-[11px]">
                        {quiz.questions?.length || 0} Questions
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 bg-base/50 border-t border-black/10 dark:border-white/10 flex items-center gap-2">
                  <Link
                    to={`/quizzes/${quiz.id}`}
                    className="flex-1 bg-warning hover:bg-warning-dark text-crust font-black text-xs uppercase tracking-wider py-3 rounded-xl transition-all text-center flex items-center justify-center gap-2 shadow-md shadow-warning/20 cursor-pointer"
                  >
                    {isLive ? 'Attempt Now' : 'View Challenge'} <ArrowRight size={14} />
                  </Link>
                  <Link
                    to={`/quizzes/${quiz.id}/leaderboard`}
                    className="p-3 bg-surface hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 hover:border-amber-500/50 text-amber-500 rounded-xl transition-all cursor-pointer"
                    title="View Leaderboard"
                  >
                    <Trophy size={16} />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Banner Note */}
        <div className="mt-16 flex justify-center relative z-10">
          <Link
            to="/quizzes"
            className="group px-8 py-4 bg-gradient-to-r from-warning to-amber-500 hover:from-amber-400 hover:to-yellow-500 text-black font-black text-xs sm:text-sm uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-[0_8px_30px_rgba(252,211,77,0.4)] hover:shadow-[0_12px_40px_rgba(252,211,77,0.6)] hover:-translate-y-1 flex items-center gap-3 cursor-pointer ring-1 ring-white/20 overflow-hidden relative"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <span className="relative z-10">Enter Quiz Arena</span>
            <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </motion.section>
  );
}
