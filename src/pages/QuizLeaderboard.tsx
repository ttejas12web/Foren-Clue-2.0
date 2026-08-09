import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Quiz, LeaderboardEntry } from '@/types/quiz';
import { fetchQuizById, fetchQuizzes, fetchLeaderboard } from '@/services/quizService';
import { LeaderboardPodium } from '@/components/quiz/LeaderboardPodium';
import { Trophy, ArrowLeft, RefreshCw, Sparkles, Award } from 'lucide-react';
import { SEOManager } from '@/components/layout/SEOManager';

export default function QuizLeaderboard() {
  const { quizId } = useParams<{ quizId: string }>();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [quizId]);

  const loadData = async () => {
    setLoading(true);
    const allQuizzes = await fetchQuizzes();
    setQuizzes(allQuizzes);

    let activeQuiz = allQuizzes.find(q => q.id === quizId) || allQuizzes[0] || null;
    setSelectedQuiz(activeQuiz);

    if (activeQuiz) {
      const topEntries = await fetchLeaderboard(activeQuiz);
      setEntries(topEntries);
    }
    setLoading(false);
  };

  const handleSelectQuiz = async (id: string) => {
    const found = quizzes.find(q => q.id === id);
    if (found) {
      setSelectedQuiz(found);
      setLoading(true);
      const topEntries = await fetchLeaderboard(found);
      setEntries(topEntries);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-main py-12 px-4 sm:px-6 lg:px-8">
      <SEOManager 
        collectionName="quizzes"
        docId={selectedQuiz?.id || quizId}
        initialData={selectedQuiz}
        fallbackTitle={`Quiz Leaderboard - ${selectedQuiz?.title || 'ForenClue'}`}
        fallbackDescription="Official Top 10 Leaderboard rankings for ForenClue weekly quiz challenges and practice tests."
        fallbackImage={selectedQuiz?.thumbnail}
        canonicalPath={`/quizzes/${selectedQuiz?.id || quizId}/leaderboard`}
      />

      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <Link
            to="/quizzes"
            className="inline-flex items-center gap-2 text-text-muted hover:text-white font-bold text-sm transition-colors"
          >
            <ArrowLeft size={16} /> Back to Quizzes Arena
          </Link>

          {quizzes.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Select Quiz:</span>
              <select
                value={selectedQuiz?.id || ''}
                onChange={(e) => handleSelectQuiz(e.target.value)}
                className="bg-black/50 border border-amber-500/30 text-amber-300 font-bold text-sm rounded-xl px-4 py-2 outline-none cursor-pointer"
              >
                {quizzes.map(q => (
                  <option key={q.id} value={q.id}>
                    {q.isWeeklyChallenge ? '🏆 ' : '📝 '} {q.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-20 text-center text-text-muted flex items-center justify-center gap-3">
            <RefreshCw size={24} className="animate-spin text-amber-500" />
            <span className="font-bold text-sm">Loading Leaderboard Rankings...</span>
          </div>
        ) : (
          <LeaderboardPodium entries={entries} quizTitle={selectedQuiz?.title} />
        )}

      </div>
    </div>
  );
}
