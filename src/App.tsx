/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route, useParams, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { FloatingWhatsAppButton } from './components/ui/FloatingWhatsAppButton';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleOneTap } from './components/ui/GoogleOneTap';
import { DesktopOnly } from './components/layout/DesktopOnly';
import { cn } from './lib/utils';

import { Loader2, WifiOff } from 'lucide-react';

function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    try {
      return await factory();
    } catch (error: any) {
      console.warn('Failed to load route chunk, attempting automatic reload...', error);
      const reloadedKey = 'chunk_error_reloaded';
      const lastReload = sessionStorage.getItem(reloadedKey);
      const now = Date.now();
      if (!lastReload || now - Number(lastReload) > 10000) {
        sessionStorage.setItem(reloadedKey, String(now));
        window.location.reload();
        return new Promise(() => {});
      }
      throw error;
    }
  });
}

const Home = lazyWithRetry(() => import('./pages/Home'));
const About = lazyWithRetry(() => import('./pages/About'));
const Courses = lazyWithRetry(() => import('./pages/Courses'));
const Cases = lazyWithRetry(() => import('./pages/Cases'));
const Careers = lazyWithRetry(() => import('./pages/Careers'));
const Community = lazyWithRetry(() => import('./pages/Community'));
const Services = lazyWithRetry(() => import('./pages/Services'));
const EBooks = lazyWithRetry(() => import('./pages/EBooks'));
const Files = lazyWithRetry(() => import('./pages/Files'));
const Contact = lazyWithRetry(() => import('./pages/Contact'));
const Profile = lazyWithRetry(() => import('./pages/Profile'));
const Podcast = lazyWithRetry(() => import('./pages/Podcast'));
const Dashboard = lazyWithRetry(() => import('./pages/Dashboard'));
const CoursePlayer = lazyWithRetry(() => import('./pages/CoursePlayer'));
const MyDoubts = lazyWithRetry(() => import('./pages/MyDoubts'));
const Login = lazyWithRetry(() => import('./pages/Login'));
const Admin = lazyWithRetry(() => import('./pages/Admin'));
const CertificateVerification = lazyWithRetry(() => import('./pages/CertificateVerification'));
const Webinar = lazyWithRetry(() => import('./pages/Webinar'));
const Employees = lazyWithRetry(() => import('./pages/Employees'));
const Volunteers = lazyWithRetry(() => import('./pages/Volunteers'));
const CampusAmbassadors = lazyWithRetry(() => import('./pages/CampusAmbassadors'));
const GoogleForms = lazyWithRetry(() => import('./pages/GoogleForms'));
const PrivacyPolicy = lazyWithRetry(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazyWithRetry(() => import('./pages/TermsOfService'));
const NotFound = lazyWithRetry(() => import('./pages/NotFound'));

const Webinars = lazyWithRetry(() => import('./pages/Webinar'));
const Simulations = lazyWithRetry(() => import('./pages/Simulations'));
const MicroscopeLab = lazyWithRetry(() => import('./pages/MicroscopeLab'));
const ComparisonMicroscopeLab = lazyWithRetry(() => import('./pages/ComparisonMicroscopeLab'));
const SpectrophotometerLab = lazyWithRetry(() => import('./pages/SpectrophotometerLab'));
const Quizzes = lazyWithRetry(() => import('./pages/Quizzes'));
const QuizPlayer = lazyWithRetry(() => import('./pages/QuizPlayer'));
const QuizLeaderboard = lazyWithRetry(() => import('./pages/QuizLeaderboard'));
const Colleges = lazyWithRetry(() => import('./pages/Colleges'));

function PageLoader() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 size={40} className="animate-spin text-warning" />
    </div>
  );
}

function RootShareResolver() {
  const { id } = useParams();
  const reserved = [
    'about', 'courses', 'cases', 'careers', 'community', 'services', 
    'ebooks', 'files', 'contact', 'privacy', 'terms', 'profile', 'dashboard', 'login', 'admin', 'podcast', 'certificate', 'webinar', 'employees', 'volunteers', 'ambassadors', 'forms', 'simulations', 'colleges', 'college'
  ];
  if (id && reserved.includes(id.toLowerCase())) {
    return <Navigate to={`/${id}`} replace />;
  }
  return <Navigate to={`/ebooks?id=${id}`} replace />;
}

function AppMain() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      <Navbar />
      <main className={cn("flex-grow", !isAdmin && "pt-20")}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/cases" element={<Cases />} />
            <Route path="/cases/:slug" element={<Cases />} />
            <Route path="/case-studies/:slug" element={<Cases />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/community" element={<Community />} />
            <Route path="/community/my-doubts" element={<MyDoubts />} />
            <Route path="/services" element={<Services />} />
            <Route path="/ebooks" element={<EBooks />} />
            <Route path="/files" element={<Files />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/podcast" element={<Podcast />} />
            <Route path="/certificate" element={<CertificateVerification />} />
            <Route path="/webinar" element={<Webinar />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/volunteers" element={<Volunteers />} />
            <Route path="/ambassadors" element={<CampusAmbassadors />} />
            <Route path="/forms" element={<GoogleForms />} />
            <Route path="/simulations" element={<DesktopOnly><Simulations /></DesktopOnly>} />
            <Route path="/simulations/microscope" element={<DesktopOnly><MicroscopeLab /></DesktopOnly>} />
            <Route path="/simulations/comparison-microscope" element={<DesktopOnly><ComparisonMicroscopeLab /></DesktopOnly>} />
            <Route path="/simulations/spectrophotometer" element={<DesktopOnly><SpectrophotometerLab /></DesktopOnly>} />
            <Route path="/quizzes" element={<Quizzes />} />
            <Route path="/quizzes/:quizId" element={<QuizPlayer />} />
            <Route path="/quizzes/:quizId/leaderboard" element={<QuizLeaderboard />} />
            <Route path="/colleges" element={<Colleges />} />
            <Route path="/colleges/:id" element={<Colleges />} />
            <Route path="/college" element={<Colleges />} />
            <Route path="/college/:id" element={<Colleges />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/:id" element={<RootShareResolver />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-base flex flex-col">
      <AnimatePresence>
        {isOffline && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 border-b border-red-500/50 flex items-center justify-center py-2 px-4 gap-3 shadow-lg"
          >
            <WifiOff size={16} className="text-text-main" />
            <span className="text-xs font-black uppercase tracking-widest text-text-main">Connection Lost. Operating in offline mode.</span>
          </motion.div>
        )}
      </AnimatePresence>
      <ScrollToTop />
      <FloatingWhatsAppButton />
      <GoogleOneTap />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/player/:courseId" element={<CoursePlayer />} />
          <Route path="*" element={<AppMain />} />
        </Routes>
      </Suspense>
    </div>
  );
}
