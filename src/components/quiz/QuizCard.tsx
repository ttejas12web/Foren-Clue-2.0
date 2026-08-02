import React, { useState, useEffect } from 'react';
import { Quiz, QuizAttempt } from '@/types/quiz';
import { Clock, Calendar, Users, Award, Trophy, ArrowRight, CheckCircle2, Lock, Sparkles, Target, Timer, BookOpen, Zap, Share2, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { RippleButton, RippleWrapper } from '@/components/ui/RippleButton';

interface QuizCardProps {
  quiz: Quiz;
  onEnroll?: (quizId: string) => void;
  isEnrolling?: boolean;
  userAttempt?: QuizAttempt;
}

export function QuizCard({ quiz, onEnroll, isEnrolling, userAttempt }: QuizCardProps) {
  const { user, signInWithGoogle } = useAuth();
  const [status, setStatus] = useState<'UPCOMING' | 'LIVE' | 'ENDED' | 'STANDARD'>('STANDARD');
  const [timeLeft, setTimeLeft] = useState<string>('');

  const isEnrolled = user && quiz.enrolledUserIds?.includes(user.uid);

  useEffect(() => {
    if (!quiz.isWeeklyChallenge || !quiz.scheduledStartTime) {
      setStatus('STANDARD');
      return;
    }

    const checkStatus = () => {
      const now = new Date().getTime();
      const start = new Date(quiz.scheduledStartTime!).getTime();
      const end = quiz.scheduledEndTime ? new Date(quiz.scheduledEndTime).getTime() : start + (quiz.durationMinutes * 60000);

      if (now < start) {
        setStatus('UPCOMING');
        const diff = start - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        
        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h left`);
        } else {
          setTimeLeft(`${hours}h ${mins}m ${secs}s`);
        }
      } else if (now >= start && now <= end) {
        setStatus('LIVE');
        const diff = end - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`Ends in ${hours}h ${mins}m ${secs}s`);
      } else {
        setStatus('ENDED');
        setTimeLeft('Ended');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 1000);
    return () => clearInterval(interval);
  }, [quiz]);

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/quizzes/${quiz.id}`;
    navigator.clipboard.writeText(url);
    alert('Quiz link copied to clipboard!');
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={cn(
      "bg-surface rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden relative group",
      quiz.isWeeklyChallenge 
        ? "border-amber-500/30 hover:border-amber-500/70 shadow-lg shadow-amber-500/5" 
        : "border-black/10 dark:border-white/10 hover:border-warning/60 shadow-md hover:shadow-warning/5"
    )}>
      {/* Top Banner Tag */}
      {quiz.isWeeklyChallenge ? (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 px-4 py-1.5 flex items-center justify-between text-black font-extrabold text-[11px] uppercase tracking-widest">
          <span className="flex items-center gap-1.5">
            <Trophy size={14} className="fill-black" /> WEEKLY QUIZ CHALLENGE
          </span>
          {status === 'LIVE' && (
            <span className="bg-black text-amber-400 px-2 py-0.5 rounded-full text-[10px] animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> LIVE NOW
            </span>
          )}
          {status === 'UPCOMING' && (
            <span className="bg-black/80 text-white px-2 py-0.5 rounded-full text-[10px]">
              UPCOMING
            </span>
          )}
          {status === 'ENDED' && (
            <span className="bg-black/90 text-amber-300 font-mono px-2 py-0.5 rounded-full text-[10px] font-black border border-amber-500/30">
              CONCLUDED • PRACTICE MODE
            </span>
          )}
          <button 
            onClick={handleShare}
            className="ml-auto flex items-center justify-center p-1 bg-black/10 hover:bg-black/20 rounded transition-colors"
            title="Share Quiz Link"
          >
            <Share2 size={12} />
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-warning/20 via-warning/10 to-transparent px-4 py-1.5 flex items-center justify-between text-warning font-extrabold text-[11px] uppercase tracking-widest border-b border-warning/10">
          <span className="flex items-center gap-1.5">
            <Target size={14} className="text-warning animate-pulse" />
            <BookOpen size={13} className="text-warning/80" />
            <span>PRACTICE QUIZ</span>
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-text-muted font-mono font-bold">
            <Timer size={13} className="text-warning" />
            <span>{quiz.durationMinutes ? `${quiz.durationMinutes} MINS` : 'SELF-PACED'}</span>
          </span>
          <button 
            onClick={handleShare}
            className="ml-2 flex items-center justify-center p-1 text-warning hover:bg-warning/10 rounded transition-colors"
            title="Share Quiz Link"
          >
            <Share2 size={13} />
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="p-6 space-y-4 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-warning bg-warning/10 px-3 py-1 rounded-full border border-warning/20">
            {quiz.category}
          </span>
          <span className="text-xs font-semibold text-text-muted flex items-center gap-1">
            <Clock size={13} /> {quiz.durationMinutes} Mins
          </span>
        </div>

        <h3 className="font-black text-xl text-text-main line-clamp-2 group-hover:text-warning transition-colors">
          {quiz.title}
        </h3>

        <p className="text-text-muted text-sm line-clamp-3 leading-relaxed">
          {quiz.description}
        </p>

        {/* Previous Attempt Score Box */}
        {userAttempt && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between text-xs my-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <p className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">Attempted • Previous Score</p>
                <p className="font-black text-text-main text-sm">
                  {userAttempt.score} / {userAttempt.totalPoints || quiz.totalPoints} PTS
                  <span className="text-emerald-400 font-bold ml-1.5 text-xs">
                    ({Math.round((userAttempt.score / (userAttempt.totalPoints || quiz.totalPoints || 100)) * 100)}%)
                  </span>
                </p>
              </div>
            </div>
            {userAttempt.timeTakenSeconds > 0 && (
              <div className="text-right text-[11px] text-text-muted font-mono hidden sm:block">
                <p className="font-bold text-text-main">{Math.floor(userAttempt.timeTakenSeconds / 60)}m {userAttempt.timeTakenSeconds % 60}s</p>
                <p className="text-[10px] opacity-75">{new Date(userAttempt.completedAt).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        )}

        {/* Schedule Info for Weekly Challenge */}
        {quiz.isWeeklyChallenge && quiz.scheduledStartTime && (
          <div className="bg-black/40 rounded-xl p-3.5 border border-white/5 space-y-2 text-xs">
            <div className="flex items-center justify-between text-text-muted">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-amber-400" /> Date & Time:
              </span>
              <span className="font-semibold text-text-main">
                {formatDate(quiz.scheduledStartTime)}
              </span>
            </div>

            {status !== 'ENDED' && (
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Countdown:</span>
                <span className="font-extrabold text-amber-400 tracking-wider">
                  {timeLeft}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1 border-t border-white/5">
              <span className="flex items-center gap-1.5 text-text-muted">
                <Users size={13} className="text-info" /> Enrolled Participants:
              </span>
              <span className="font-bold text-info">
                {quiz.enrolledUserIds?.length || 0} Users
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-6 pt-0 space-y-3">
        {quiz.isWeeklyChallenge ? (
          <div>
            {status === 'UPCOMING' && (
              <div>
                {user ? (
                  isEnrolled ? (
                    <div className="w-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 py-3 rounded-xl font-bold text-sm text-center flex items-center justify-center gap-2">
                      <CheckCircle2 size={16} /> Enrolled (Starts Soon)
                    </div>
                  ) : (
                    <RippleButton
                      onClick={() => onEnroll?.(quiz.id)}
                      disabled={isEnrolling}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm uppercase tracking-wider py-3 rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      {isEnrolling ? 'Enrolling...' : 'Enroll For Challenge'}
                    </RippleButton>
                  )
                ) : (
                  <RippleButton
                    onClick={() => signInWithGoogle()}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm uppercase tracking-wider py-3 rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    <Lock size={14} /> Login To Attempt
                  </RippleButton>
                )}
              </div>
            )}

            {status === 'LIVE' && (
              <div className="space-y-2">
                {user ? (
                  userAttempt ? (
                    <RippleWrapper className="rounded-xl">
                      <Link
                        to={`/quizzes/${quiz.id}`}
                        className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm uppercase tracking-wider py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
                      >
                        <RotateCcw size={16} /> Reattempt Challenge
                      </Link>
                    </RippleWrapper>
                  ) : isEnrolled ? (
                    <RippleWrapper className="rounded-xl">
                      <Link
                        to={`/quizzes/${quiz.id}`}
                        className="w-full bg-gradient-to-r from-red-500 to-amber-500 hover:opacity-90 text-white font-extrabold text-sm uppercase tracking-wider py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                      >
                        Attempt Challenge Now <ArrowRight size={16} />
                      </Link>
                    </RippleWrapper>
                  ) : (
                    <RippleButton
                      onClick={() => onEnroll?.(quiz.id)}
                      disabled={isEnrolling}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm uppercase tracking-wider py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Enroll & Attempt Now
                    </RippleButton>
                  )
                ) : (
                  <RippleButton
                    onClick={() => signInWithGoogle()}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm uppercase tracking-wider py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    Login To Attempt
                  </RippleButton>
                )}
              </div>
            )}

            {status === 'ENDED' && (
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <RippleWrapper className="w-full sm:flex-1 rounded-xl">
                  <Link
                    to={`/quizzes/${quiz.id}`}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
                  >
                    {userAttempt ? (
                      <>
                        <RotateCcw size={14} /> Reattempt Practice
                      </>
                    ) : (
                      <>
                        <Zap size={14} /> Start Practice Quiz
                      </>
                    )}
                  </Link>
                </RippleWrapper>
                <RippleWrapper className="w-full sm:flex-1 rounded-xl">
                  <Link
                    to={`/quizzes/${quiz.id}/leaderboard`}
                    className="w-full bg-surface-dark border border-amber-500/40 hover:bg-amber-500/10 text-amber-400 font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <Trophy size={14} /> Leaderboard
                  </Link>
                </RippleWrapper>
              </div>
            )}
          </div>
        ) : (
          /* Standard Practice Quiz */
          <div className="flex items-center gap-2">
            <RippleWrapper className="flex-1 rounded-xl">
              <Link
                to={`/quizzes/${quiz.id}`}
                className={cn(
                  "w-full font-black text-sm uppercase tracking-wider py-3 rounded-xl transition-all text-center flex items-center justify-center gap-2 shadow-md cursor-pointer block",
                  userAttempt 
                    ? "bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20" 
                    : "bg-warning hover:bg-warning/90 text-crust shadow-warning/10"
                )}
              >
                {userAttempt ? (
                  <>
                    <RotateCcw size={16} /> Reattempt Quiz
                  </>
                ) : (
                  <>
                    Start Quiz <ArrowRight size={16} />
                  </>
                )}
              </Link>
            </RippleWrapper>
            <RippleWrapper className="rounded-xl">
              <Link
                to={`/quizzes/${quiz.id}/leaderboard`}
                className="p-3 bg-surface dark:bg-black/40 border border-black/10 dark:border-white/10 hover:border-warning/50 text-warning rounded-xl transition-all flex items-center justify-center"
                title="View Leaderboard"
              >
                <Trophy size={18} />
              </Link>
            </RippleWrapper>
          </div>
        )}
      </div>
    </div>
  );
}
