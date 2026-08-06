import React, { useState, useEffect } from 'react';
import { Quiz, QuizAttempt } from '@/types/quiz';
import { fetchQuizzes, enrollInQuiz, fetchUserQuizAttempts, isWeeklyChallengeExpired } from '@/services/quizService';
import { QuizCard } from '@/components/quiz/QuizCard';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Trophy, HelpCircle, CheckCircle2, Target, Award, Sparkles, BookOpen
} from 'lucide-react';
import { SEO } from '@/components/layout/SEO';

export default function Quizzes() {
  const { user, signInWithGoogle } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [userAttemptsMap, setUserAttemptsMap] = useState<Record<string, QuizAttempt>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'weekly' | 'practice'>('weekly');
  const [enrollingQuizId, setEnrollingQuizId] = useState<string | null>(null);
  const [enrollSuccessMsg, setEnrollSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadQuizzes();
  }, [user]);

  const loadQuizzes = async () => {
    setLoading(true);
    const data = await fetchQuizzes();
    setQuizzes(data);

    if (user?.uid) {
      try {
        const attempts = await fetchUserQuizAttempts(user.uid);
        const map: Record<string, QuizAttempt> = {};
        attempts.forEach(att => {
          // keep the highest score or most recent attempt for each quiz
          if (!map[att.quizId] || att.score > map[att.quizId].score) {
            map[att.quizId] = att;
          }
        });
        setUserAttemptsMap(map);
      } catch (err) {
        console.warn("Error loading user quiz attempts:", err);
      }
    } else {
      setUserAttemptsMap({});
    }

    setLoading(false);
  };

  const handleEnroll = async (quizId: string) => {
    if (!user) {
      signInWithGoogle();
      return;
    }
    setEnrollingQuizId(quizId);
    const ok = await enrollInQuiz(quizId, user.uid);
    if (ok) {
      setEnrollSuccessMsg('Successfully enrolled in Weekly Quiz Challenge!');
      setTimeout(() => setEnrollSuccessMsg(null), 4000);
      loadQuizzes();
    }
    setEnrollingQuizId(null);
  };

  // Active / Upcoming Weekly Challenges (not yet expired)
  const activeWeeklyChallenges = quizzes.filter(q => q.isWeeklyChallenge && !isWeeklyChallengeExpired(q));

  // Practice Quizzes includes standard practice quizzes + concluded weekly challenges whose date and time has passed
  const practiceQuizzes = quizzes.filter(q => !q.isWeeklyChallenge || isWeeklyChallengeExpired(q));

  const filteredQuizzes = activeTab === 'weekly' ? activeWeeklyChallenges : practiceQuizzes;

  return (
    <div className="min-h-screen bg-background text-text-main py-12 px-4 sm:px-6 lg:px-8">
      <SEO 
        title="Forensic Quizzes & Weekly Challenges | ForenClue"
        description="Test your forensic science knowledge through interactive quizzes, challenges, and practical assessments. Learn, compete, and sharpen your investigative skills with ForenClue."
        image="https://blogger.googleusercontent.com/img/a/AVvXsEg_OeYXV0qnZe42fjD2ty2vBNDGqhWPnOjQBOiWFbkDcCaUa0Pl5sJyixMvmxEhAKoLMU9A4A2bjvxrpEuGG_jKX7q2su81OGr9eSt3DUWNwQVufTdGQI_NSKBcZduRx-7jyn3dMmQVb4o6Qom_9Ul2qen9YS8c-h2W5PTda-U8x6JsAasJG_3lHFitvX0"
      />

      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Page Header Banner */}
        <div className="relative rounded-3xl bg-gradient-to-r from-surface via-surface-dark to-black border border-white/10 p-8 sm:p-12 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black uppercase tracking-widest">
              <Trophy size={14} className="text-amber-400" /> ForenClue Quiz Arena
            </div>

            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-text-main leading-tight">
              Weekly Quiz <span className="text-amber-400">Challenges</span> & Practice Tests
            </h1>

            <p className="text-text-muted text-base sm:text-lg leading-relaxed">
              Enrolled participants compete live during active challenge dates. Once a weekly challenge concludes, it is automatically preserved in <strong className="text-amber-400">Practice Quizzes</strong> for endless future practice!
            </p>

            {enrollSuccessMsg && (
              <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-sm flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 size={18} /> {enrollSuccessMsg}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-6">
          <div className="flex items-center gap-2 bg-surface dark:bg-black/40 p-1.5 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm">
            <button
              onClick={() => setActiveTab('weekly')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'weekly' 
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              <Trophy size={15} /> Active Challenges ({activeWeeklyChallenges.length})
            </button>

            <button
              onClick={() => setActiveTab('practice')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'practice' 
                  ? 'bg-warning text-crust shadow-lg shadow-warning/30 font-black' 
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              <Target size={15} /> Practice Quizzes ({practiceQuizzes.length})
            </button>
          </div>

          {activeTab === 'practice' && (
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400/90 bg-amber-500/10 px-3.5 py-1.5 rounded-xl border border-amber-500/20">
              <BookOpen size={14} />
              <span>Includes concluded weekly challenges moved for self-paced practice</span>
            </div>
          )}
        </div>

        {/* Quizzes List Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => (
              <div key={n} className="bg-surface/40 h-80 rounded-2xl animate-pulse border border-white/5" />
            ))}
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="bg-surface/30 rounded-2xl border border-white/10 p-12 text-center text-text-muted space-y-3">
            <HelpCircle size={40} className="mx-auto text-text-muted opacity-50" />
            <p className="text-lg font-bold">No quizzes available in this section.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map(quiz => (
              <QuizCard 
                key={quiz.id} 
                quiz={quiz} 
                onEnroll={handleEnroll}
                isEnrolling={enrollingQuizId === quiz.id}
                userAttempt={userAttemptsMap[quiz.id]}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
