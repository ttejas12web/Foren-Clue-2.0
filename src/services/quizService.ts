import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { 
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, 
  query, where, orderBy, limit, arrayUnion, setDoc 
} from 'firebase/firestore';
import { Quiz, QuizAttempt, LeaderboardEntry } from '@/types/quiz';

const QUIZZES_COLLECTION = 'quizzes';
const ATTEMPTS_COLLECTION = 'quizAttempts';

// Initial sample quizzes for seed fallback
export const SAMPLE_QUIZZES: Quiz[] = [
  {
    id: 'weekly-challenge-1',
    title: 'Weekly Challenge #1: Fingerprint Analysis & Friction Ridge Patterns',
    description: 'Test your expertise in loop, whorl, and arch pattern classification, minutiae identification, and AFIS database matching under timed challenge conditions!',
    category: 'Forensic Identification',
    isWeeklyChallenge: true,
    scheduledStartTime: new Date(Date.now() + 86400000 * 2).toISOString(), // Starts in 2 days
    scheduledEndTime: new Date(Date.now() + 86400000 * 5).toISOString(), // Active for 3 days
    durationMinutes: 10,
    totalPoints: 100,
    passingScore: 70,
    enrolledUserIds: [],
    createdBy: 'ForenClue Team',
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: 'q1',
        question: 'Which of the following fingerprint ridge patterns is the most common in the human population?',
        options: ['Arches (5%)', 'Loops (60-65%)', 'Whorls (30-35%)', 'Accidental (1%)'],
        correctAnswerIndex: 1,
        explanation: 'Loop patterns account for approximately 60-65% of all human fingerprints, making them the most prevalent ridge pattern.',
        points: 20
      },
      {
        id: 'q2',
        question: 'What term describes individual ridge characteristics such as bifurcations, ridge endings, and dots used for identification?',
        options: ['Luminol', 'Minutiae', 'Striations', 'Agglutination'],
        correctAnswerIndex: 1,
        explanation: 'Minutiae are the major ridge characteristics used in friction ridge analysis to establish individual identity.',
        points: 20
      },
      {
        id: 'q3',
        question: 'Cyanoacrylate ester fuming (Superglue) is most effective for developing latent prints on which surface type?',
        options: ['Porous paper', 'Untreated wood', 'Non-porous surfaces like glass and plastic', 'Raw leather'],
        correctAnswerIndex: 2,
        explanation: 'Cyanoacrylate ester reacts with amino acids and water in latent print residues on non-porous surfaces to form a durable white polymer.',
        points: 20
      },
      {
        id: 'q4',
        question: 'In Henry Classification system, value numbers are assigned to finger pairs based on the presence of which pattern?',
        options: ['Radial Loops', 'Whorls', 'Plain Arches', 'Tented Arches'],
        correctAnswerIndex: 1,
        explanation: 'The Henry Classification system assigns numerical primary values exclusively to fingers containing whorl patterns.',
        points: 20
      },
      {
        id: 'q5',
        question: 'AFIS stands for which automated criminal investigation system?',
        options: ['Automated Forensic Identification System', 'Automated Fingerprint Identification System', 'Advanced Friction Image System', 'Automated Footwear Identification System'],
        correctAnswerIndex: 1,
        explanation: 'AFIS stands for Automated Fingerprint Identification System, used worldwide by law enforcement agencies.',
        points: 20
      }
    ]
  },
  {
    id: 'weekly-challenge-2',
    title: 'Weekly Challenge #2: Forensic Serology & DNA Profiling',
    description: 'Upcoming high-stakes quiz on STR profiling, Kastle-Meyer presumptive testing, and capillary electrophoresis analysis.',
    category: 'Forensic Biology',
    isWeeklyChallenge: true,
    scheduledStartTime: new Date(Date.now() + 86400000 * 2).toISOString(), // Starts in 2 days
    scheduledEndTime: new Date(Date.now() + 86400000 * 5).toISOString(),
    durationMinutes: 15,
    totalPoints: 100,
    passingScore: 75,
    enrolledUserIds: [],
    createdBy: 'Dr. A. Gaikwad',
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: 'q1',
        question: 'What enzyme present in red blood cells causes the rapid oxidation of phenolphthalein in the Kastle-Meyer test?',
        options: ['Amylase', 'Peroxidase activity of hemoglobin', 'Acid phosphatase', 'Creatine kinase'],
        correctAnswerIndex: 1,
        explanation: 'Hemoglobin exhibits peroxidase-like activity, catalyzing the breakdown of hydrogen peroxide to turn reduced phenolphthalein bright pink.',
        points: 25
      },
      {
        id: 'q2',
        question: 'Which loci type is primarily analyzed in standard CODIS forensic human DNA profiling?',
        options: ['Single Nucleotide Polymorphisms (SNPs)', 'Short Tandem Repeats (STRs)', 'Mitochondrial D-Loop', 'Restriction Fragment Length Polymorphisms (RFLPs)'],
        correctAnswerIndex: 1,
        explanation: 'CODIS core loci rely on STRs (Short Tandem Repeats) due to high variability and suitability for degraded DNA samples.',
        points: 25
      },
      {
        id: 'q3',
        question: 'Amelogenin gene analysis in DNA profiling is specifically used to determine:',
        options: ['Age of individual', 'Biological sex', 'Geographic ancestry', 'Eye color'],
        correctAnswerIndex: 1,
        explanation: 'The Amelogenin gene yields a 106 bp fragment for X and 112 bp fragment for Y chromosome, revealing biological sex.',
        points: 25
      },
      {
        id: 'q4',
        question: 'Which presumpive test for semen detects the presence of prostatic acid phosphatase enzyme?',
        options: ['Takayama Test', 'AP (Acid Phosphatase) Test', 'Teichmann Test', 'Leucomalachite Green Test'],
        correctAnswerIndex: 1,
        explanation: 'The Acid Phosphatase (AP) test uses alpha-naphthyl phosphate and Fast Blue B dye to produce a deep purple color reaction.',
        points: 25
      }
    ]
  },
  {
    id: 'weekly-challenge-0',
    title: 'Weekly Challenge #0: Forensic Ballistics & Firearms Identification',
    description: 'Concluded weekly challenge covering striation pattern comparison, gunshot residue (GSR) analysis, and caliber measurements. Available now for self-paced practice!',
    category: 'Forensic Ballistics',
    isWeeklyChallenge: true,
    scheduledStartTime: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
    scheduledEndTime: new Date(Date.now() - 86400000 * 3).toISOString(), // Ended 3 days ago
    durationMinutes: 12,
    totalPoints: 100,
    passingScore: 70,
    enrolledUserIds: [],
    createdBy: 'ForenClue Team',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    questions: [
      {
        id: 'b1',
        question: 'What microscopic instrument is essential for comparing striations on two fired bullets side-by-side?',
        options: ['Scanning Electron Microscope', 'Comparison Microscope', 'Stereo Microscope', 'Polarizing Light Microscope'],
        correctAnswerIndex: 1,
        explanation: 'A comparison microscope consists of two microscopes linked by an optical bridge, allowing side-by-side comparison of lands and grooves.',
        points: 25
      },
      {
        id: 'b2',
        question: 'Which elements are primarily tested for in chemical analysis of Gunshot Residue (GSR)?',
        options: ['Lead, Barium, Antimony', 'Iron, Copper, Zinc', 'Sodium, Potassium, Chloride', 'Carbon, Hydrogen, Oxygen'],
        correctAnswerIndex: 0,
        explanation: 'GSR primers typically contain Lead (Pb), Barium (Ba), and Antimony (Sb), detected via SEM-EDS or ICP-MS.',
        points: 25
      },
      {
        id: 'b3',
        question: 'The spiral grooves cut into the interior barrel of a firearm to impart spin on a bullet are known as:',
        options: ['Caliber', 'Rifling (Lands & Grooves)', 'Bore gauge', 'Firing pin impression'],
        correctAnswerIndex: 1,
        explanation: 'Rifling consists of helical lands and grooves cut inside the barrel to stabilize the bullet in flight.',
        points: 25
      },
      {
        id: 'b4',
        question: 'What automated database is used by firearm examiners to compare digitized bullet and cartridge casing impressions?',
        options: ['CODIS', 'NIBIN (National Integrated Ballistic Information Network)', 'AFIS', 'NCIC'],
        correctAnswerIndex: 1,
        explanation: 'NIBIN is the national database system maintained for ballistics evidence matching.',
        points: 25
      }
    ]
  },
  {
    id: 'quiz-general-1',
    title: 'Crime Scene Investigation Fundamentals',
    description: 'Standard practice quiz covering chain of custody, crime scene perimeter securing, 7 S\'s of CSI, and evidence collection protocol.',
    category: 'Crime Scene Investigation',
    isWeeklyChallenge: false,
    durationMinutes: 12,
    totalPoints: 100,
    passingScore: 60,
    enrolledUserIds: [],
    createdBy: 'ForenClue Admin',
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: 'g1',
        question: 'Who is responsible for securing the crime scene first upon arrival?',
        options: ['Lead Forensic Detective', 'First Responding Officer', 'Medical Examiner', 'Media Relations Specialist'],
        correctAnswerIndex: 1,
        explanation: 'The first responding law enforcement officer is responsible for preserving life and securing the perimeter of the scene.',
        points: 25
      },
      {
        id: 'g2',
        question: 'Why must biological evidence such as bloodstained clothing never be packaged in airtight plastic bags?',
        options: ['Plastic reacts with DNA', 'Trapped moisture causes mold growth that destroys biological material', 'Plastic absorbs bloodstain patterns', 'Plastic increases UV degradation'],
        correctAnswerIndex: 1,
        explanation: 'Moisture in sealed plastic causes rapid bacterial and fungal growth, degrading DNA evidence. Breathable paper bags must be used.',
        points: 25
      },
      {
        id: 'g3',
        question: 'What document establishes every individual who held, transferred, or analyzed physical evidence from collection to court?',
        options: ['Search Warrant', 'Chain of Custody', 'Affidavit of Probable Cause', 'Subpoena duces tecum'],
        correctAnswerIndex: 1,
        explanation: 'The Chain of Custody log documents the chronological paper trail verifying evidence integrity in legal proceedings.',
        points: 25
      },
      {
        id: 'g4',
        question: 'Which of Locard\'s fundamental principles states that every contact leaves a trace?',
        options: ['Locard\'s Exchange Principle', 'Frye Standard', 'Daubert Standard', 'Individualization Postulate'],
        correctAnswerIndex: 0,
        explanation: 'Locard\'s Exchange Principle asserts that whenever two objects come into contact, a mutual transfer of material occurs.',
        points: 25
      }
    ]
  }
];

// Sample seed attempts for realistic Leaderboard showcase
export const SAMPLE_LEADERBOARD_SEED: QuizAttempt[] = [
  {
    quizId: 'weekly-challenge-1',
    userId: 'u101',
    userName: 'Officer Sarah Jenkins',
    userEmail: 's.jenkins@forensics.org',
    userPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    score: 100,
    totalPoints: 100,
    timeTakenSeconds: 142, // ~2 mins 22 secs
    completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    answers: { q1: 1, q2: 1, q3: 2, q4: 1, q5: 1 }
  },
  {
    quizId: 'weekly-challenge-1',
    userId: 'u102',
    userName: 'Dr. Rahul Sharma',
    userEmail: 'r.sharma@forenclue.org',
    userPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    score: 100,
    totalPoints: 100,
    timeTakenSeconds: 185, // ~3 mins 5 secs
    completedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    answers: { q1: 1, q2: 1, q3: 2, q4: 1, q5: 1 }
  },
  {
    quizId: 'weekly-challenge-1',
    userId: 'u103',
    userName: 'Ananya Verma',
    userEmail: 'ananya.v@university.edu',
    userPhoto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    score: 100,
    totalPoints: 100,
    timeTakenSeconds: 210, // ~3 mins 30 secs
    completedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    answers: { q1: 1, q2: 1, q3: 2, q4: 1, q5: 1 }
  },
  {
    quizId: 'weekly-challenge-1',
    userId: 'u104',
    userName: 'Karan Patel',
    userEmail: 'karan.cyber@gmail.com',
    userPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    score: 80,
    totalPoints: 100,
    timeTakenSeconds: 160,
    completedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    answers: { q1: 1, q2: 1, q3: 2, q4: 0, q5: 1 }
  },
  {
    quizId: 'weekly-challenge-1',
    userId: 'u105',
    userName: 'Meera Nair',
    userEmail: 'mnair@crimelab.in',
    userPhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    score: 80,
    totalPoints: 100,
    timeTakenSeconds: 198,
    completedAt: new Date(Date.now() - 3600000 * 15).toISOString(),
    answers: { q1: 1, q2: 1, q3: 1, q4: 1, q5: 1 }
  },
  {
    quizId: 'weekly-challenge-1',
    userId: 'u106',
    userName: 'David Miller',
    userEmail: 'david.m@cyberforensics.org',
    userPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    score: 80,
    totalPoints: 100,
    timeTakenSeconds: 245,
    completedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    answers: { q1: 1, q2: 0, q3: 2, q4: 1, q5: 1 }
  },
  {
    quizId: 'weekly-challenge-1',
    userId: 'u107',
    userName: 'Priya Sundaram',
    userEmail: 'p.sundaram@forenclue.com',
    userPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    score: 60,
    totalPoints: 100,
    timeTakenSeconds: 175,
    completedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    answers: { q1: 1, q2: 1, q3: 0, q4: 0, q5: 1 }
  }
];

// Helper to check if a weekly challenge has completed/passed its scheduled date and time
export function isWeeklyChallengeExpired(quiz: Quiz): boolean {
  if (!quiz.isWeeklyChallenge) return false;
  if (!quiz.scheduledStartTime && !quiz.scheduledEndTime) return false;

  const now = Date.now();
  if (quiz.scheduledEndTime) {
    return now > new Date(quiz.scheduledEndTime).getTime();
  }
  if (quiz.scheduledStartTime) {
    const start = new Date(quiz.scheduledStartTime).getTime();
    const durationMs = (quiz.durationMinutes || 15) * 60000;
    return now > (start + durationMs);
  }
  return false;
}

// Helper to force sample challenges to have scheduled times if missing
function applyQuizOverrides(quiz: Quiz): Quiz {
  if (quiz.id === 'weekly-challenge-1') {
    if (!quiz.scheduledStartTime) {
      quiz.scheduledStartTime = new Date(Date.now() + 86400000 * 2).toISOString();
      quiz.scheduledEndTime = new Date(Date.now() + 86400000 * 5).toISOString();
    }
    quiz.isEnrollmentOpen = true;
  } else if (quiz.id === 'weekly-challenge-2') {
    if (!quiz.scheduledStartTime) {
      quiz.scheduledStartTime = new Date(Date.now() + 86400000 * 4).toISOString();
      quiz.scheduledEndTime = new Date(Date.now() + 86400000 * 7).toISOString();
    }
    quiz.isEnrollmentOpen = false;
  } else if (quiz.id === 'weekly-challenge-0') {
    if (!quiz.scheduledStartTime) {
      quiz.scheduledStartTime = new Date(Date.now() - 86400000 * 7).toISOString();
      quiz.scheduledEndTime = new Date(Date.now() - 86400000 * 3).toISOString();
    }
    quiz.isEnrollmentOpen = false;
  }
  return quiz;
}

// Fetch all Quizzes
export async function fetchQuizzes(): Promise<Quiz[]> {
  try {
    const qSnap = await getDocs(collection(db, QUIZZES_COLLECTION));
    if (qSnap.empty) {
      // Seed initial sample quizzes if DB is empty
      console.log("Seeding sample quizzes into Firestore...");
      for (const quiz of SAMPLE_QUIZZES) {
        await setDoc(doc(db, QUIZZES_COLLECTION, quiz.id), quiz);
      }
      return SAMPLE_QUIZZES.map(applyQuizOverrides);
    }
    const quizzes: Quiz[] = [];
    qSnap.forEach((docSnap) => {
      quizzes.push(applyQuizOverrides({ id: docSnap.id, ...docSnap.data() } as Quiz));
    });
    return quizzes;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, QUIZZES_COLLECTION);
    return SAMPLE_QUIZZES.map(applyQuizOverrides);
  }
}

// Fetch single quiz by ID
export async function fetchQuizById(quizId: string): Promise<Quiz | null> {
  try {
    const docRef = doc(db, QUIZZES_COLLECTION, quizId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return applyQuizOverrides({ id: docSnap.id, ...docSnap.data() } as Quiz);
    }
    // Fallback to sample array
    const sample = SAMPLE_QUIZZES.find(q => q.id === quizId);
    return sample ? applyQuizOverrides(sample) : null;
  } catch (err) {
    console.warn("Falling back to local sample quiz:", err);
    const sample = SAMPLE_QUIZZES.find(q => q.id === quizId);
    return sample ? applyQuizOverrides(sample) : null;
  }
}

// Enroll user in Weekly Challenge
export async function enrollInQuiz(quizId: string, userId: string): Promise<boolean> {
  try {
    const docRef = doc(db, QUIZZES_COLLECTION, quizId);
    await updateDoc(docRef, {
      enrolledUserIds: arrayUnion(userId)
    });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${QUIZZES_COLLECTION}/${quizId}`);
    return false;
  }
}

// Submit Quiz Attempt
export async function submitQuizAttempt(attempt: QuizAttempt): Promise<string> {
  const completedAt = attempt.completedAt || new Date().toISOString();
  let isPractice = attempt.isPractice || false;

  // Auto-detect if attempt should be marked as practice
  if (attempt.quizId) {
    try {
      const quiz = await fetchQuizById(attempt.quizId);
      if (quiz) {
        if (!quiz.isWeeklyChallenge || isWeeklyChallengeExpired(quiz)) {
          isPractice = true;
        } else {
          // Check if user has a prior live attempt for this weekly challenge
          const userAttempts = await fetchUserQuizAttempts(attempt.userId);
          const hasPriorAttempt = userAttempts.some(a => a.quizId === attempt.quizId && !a.isPractice);
          if (hasPriorAttempt) {
            isPractice = true;
          }
        }
      }
    } catch (e) {
      console.warn("Could not determine practice status for attempt:", e);
    }
  }

  const attemptWithTime: QuizAttempt = { ...attempt, completedAt, isPractice };

  // 1. Save to Local Storage Cache for instant retrieval
  if (attempt.userId) {
    const localKey = `forenclue_quiz_attempts_${attempt.userId}`;
    try {
      const existingRaw = localStorage.getItem(localKey);
      const existing: QuizAttempt[] = existingRaw ? JSON.parse(existingRaw) : [];
      existing.unshift(attemptWithTime);
      localStorage.setItem(localKey, JSON.stringify(existing));
    } catch (e) {
      console.warn("Failed to cache quiz attempt locally:", e);
    }

    // 2. Update user profile document in Firestore with total points and quiz history
    try {
      const userRef = doc(db, 'users', attempt.userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentPoints = userData.totalQuizPoints || 0;
        const currentHistory = userData.quizHistory || [];
        const existingQuizScores = userData.quizScores || {};
        const previousBest = existingQuizScores[attempt.quizId]?.bestScore || 0;
        
        await updateDoc(userRef, {
          totalQuizPoints: currentPoints + attempt.score,
          [`quizScores.${attempt.quizId}`]: {
            bestScore: Math.max(previousBest, attempt.score),
            lastScore: attempt.score,
            totalPoints: attempt.totalPoints,
            completedAt
          },
          quizHistory: [
            {
              quizId: attempt.quizId,
              score: attempt.score,
              totalPoints: attempt.totalPoints,
              timeTakenSeconds: attempt.timeTakenSeconds,
              completedAt
            },
            ...currentHistory
          ].slice(0, 50)
        });
      }
    } catch (e) {
      console.warn("Failed to update user profile with quiz points:", e);
    }
  }

  // 3. Save to Firestore attempts collection
  try {
    const docRef = await addDoc(collection(db, ATTEMPTS_COLLECTION), attemptWithTime);
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, ATTEMPTS_COLLECTION);
    return `local_${Date.now()}`;
  }
}

// Fetch all quiz attempts for a specific user
export async function fetchUserQuizAttempts(userId: string): Promise<QuizAttempt[]> {
  if (!userId) return [];

  const localKey = `forenclue_quiz_attempts_${userId}`;
  let localAttempts: QuizAttempt[] = [];
  try {
    const raw = localStorage.getItem(localKey);
    if (raw) localAttempts = JSON.parse(raw);
  } catch (e) {
    console.warn("Failed to parse local quiz attempts", e);
  }

  try {
    const attemptsRef = collection(db, ATTEMPTS_COLLECTION);
    const q = query(attemptsRef, where('userId', '==', userId));
    const snap = await getDocs(q);
    const remoteAttempts: QuizAttempt[] = [];
    snap.forEach((d) => {
      remoteAttempts.push({ id: d.id, ...d.data() } as QuizAttempt);
    });

    const mergedMap = new Map<string, QuizAttempt>();
    remoteAttempts.forEach(a => {
      const key = a.id || `${a.quizId}_${a.completedAt}`;
      mergedMap.set(key, a);
    });
    localAttempts.forEach(a => {
      const key = a.id || `${a.quizId}_${a.completedAt}`;
      if (!mergedMap.has(key)) {
        mergedMap.set(key, a);
      }
    });

    const combined = Array.from(mergedMap.values());
    combined.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

    try {
      localStorage.setItem(localKey, JSON.stringify(combined));
    } catch {}

    return combined;
  } catch (err) {
    console.warn("Falling back to local quiz attempts:", err);
    return localAttempts;
  }
}

// Fetch Top 10 Leaderboard for a quiz
export async function fetchLeaderboard(quiz: Quiz): Promise<LeaderboardEntry[]> {
  try {
    const attemptsRef = collection(db, ATTEMPTS_COLLECTION);
    const q = query(
      attemptsRef, 
      where('quizId', '==', quiz.id)
    );
    const snap = await getDocs(q);
    let attempts: QuizAttempt[] = [];
    
    snap.forEach((d) => {
      attempts.push({ id: d.id, ...d.data() } as QuizAttempt);
    });

    // If snap is empty and we have sample seeds for this quiz, merge sample seeds
    if (quiz.id === 'weekly-challenge-1') {
      // Do not use any sample seeds/mock seeds for challenge 1. Only show real attempts!
    } else if (attempts.length === 0) {
      attempts = SAMPLE_LEADERBOARD_SEED.filter(s => s.quizId === quiz.id);
    } else {
      // Merge sample seeds to ensure rich leaderboard
      const existingUserIds = new Set(attempts.map(a => a.userId));
      const seeds = SAMPLE_LEADERBOARD_SEED.filter(s => s.quizId === quiz.id && !existingUserIds.has(s.userId));
      attempts = [...attempts, ...seeds];
    }

    // Filter attempts based on challenge timeframe & practice status
    if (quiz.isWeeklyChallenge) {
      let startTime = 0;
      let endTime = Infinity;

      if (quiz.scheduledStartTime) {
        startTime = new Date(quiz.scheduledStartTime).getTime();
      }
      if (quiz.scheduledEndTime) {
        endTime = new Date(quiz.scheduledEndTime).getTime();
      } else if (startTime > 0) {
        endTime = startTime + (quiz.durationMinutes || 15) * 60000;
      }

      // 1. Exclude practice attempts and attempts submitted outside official challenge window
      attempts = attempts.filter(a => {
        if (a.isPractice) return false;
        if (!a.completedAt) return true; // keep sample seeds

        const compTime = new Date(a.completedAt).getTime();
        if (startTime > 0 && compTime < startTime) return false;
        if (endTime < Infinity && compTime > endTime) return false;

        return true;
      });

      // 2. Keep only each user's FIRST (earliest) attempt taken during the live challenge
      const firstAttempts = new Map<string, QuizAttempt>();
      const sortedByTime = [...attempts].sort((a, b) => {
        const tA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const tB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return tA - tB;
      });

      for (const att of sortedByTime) {
        if (!firstAttempts.has(att.userId)) {
          firstAttempts.set(att.userId, att);
        }
      }
      attempts = Array.from(firstAttempts.values());
    } else {
      // For practice quizzes, keep each user's best attempt
      const bestAttempts = new Map<string, QuizAttempt>();
      for (const att of attempts) {
        const existing = bestAttempts.get(att.userId);
        if (!existing || att.score > existing.score || (att.score === existing.score && att.timeTakenSeconds < existing.timeTakenSeconds)) {
          bestAttempts.set(att.userId, att);
        }
      }
      attempts = Array.from(bestAttempts.values());
    }

    // Recalculate score from answers to fix legacy point calculation glitch
    attempts = attempts.map(att => {
      let trueScore = 0;
      if (att.answers && quiz.questions) {
        quiz.questions.forEach(q => {
          if (att.answers[q.id] !== undefined && att.answers[q.id] === q.correctAnswerIndex) {
            trueScore += q.points || 10;
          }
        });
      } else {
        trueScore = att.score;
      }
      return {
        ...att,
        score: Math.min(trueScore, att.totalPoints || 100)
      };
    });

    // Sort: score DESC, timeTakenSeconds ASC
    attempts.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.timeTakenSeconds - b.timeTakenSeconds;
    });

    // Top 10 entries only
    const top10 = attempts.slice(0, 10).map((att, idx) => ({
      ...att,
      rank: idx + 1,
      accuracyPercentage: Math.round((att.score / (att.totalPoints || 100)) * 100)
    }));

    return top10;
  } catch (err) {
    console.warn("Using sample leaderboard fallback:", err);
    if (quiz.id === 'weekly-challenge-1') {
      return [];
    }
    const seeds = SAMPLE_LEADERBOARD_SEED.filter(s => s.quizId === quiz.id);
    seeds.sort((a, b) => b.score - a.score || a.timeTakenSeconds - b.timeTakenSeconds);
    return seeds.slice(0, 10).map((att, idx) => ({
      ...att,
      rank: idx + 1,
      accuracyPercentage: Math.round((att.score / (att.totalPoints || 100)) * 100)
    }));
  }
}

// Admin API: Save or Update Quiz
export async function saveQuiz(quiz: Partial<Quiz>): Promise<string> {
  try {
    if (quiz.id) {
      const docRef = doc(db, QUIZZES_COLLECTION, quiz.id);
      await setDoc(docRef, { ...quiz, updatedAt: new Date().toISOString() }, { merge: true });
      return quiz.id;
    } else {
      const docRef = await addDoc(collection(db, QUIZZES_COLLECTION), {
        ...quiz,
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, QUIZZES_COLLECTION);
    throw err;
  }
}

// Admin API: Delete Quiz
export async function deleteQuiz(quizId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, QUIZZES_COLLECTION, quizId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${QUIZZES_COLLECTION}/${quizId}`);
  }
}
