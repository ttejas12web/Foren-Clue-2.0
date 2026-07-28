export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
  points: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  isWeeklyChallenge: boolean;
  scheduledStartTime?: string; // ISO string
  scheduledEndTime?: string;   // ISO string
  durationMinutes: number;    // e.g. 15 mins
  totalPoints: number;
  passingScore: number;
  enrolledUserIds?: string[];  // Array of user UIDs who enrolled
  isEnrollmentOpen?: boolean;  // Whether users can enroll
  questions: QuizQuestion[];
  createdAt?: string;
  createdBy?: string;
}

export interface QuizAttempt {
  id?: string;
  quizId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhoto?: string;
  score: number;
  totalPoints: number;
  timeTakenSeconds: number;
  completedAt: string;
  answers: Record<string, number>; // questionId -> selectedIndex
}

export interface LeaderboardEntry extends QuizAttempt {
  rank: number;
  accuracyPercentage: number;
}
