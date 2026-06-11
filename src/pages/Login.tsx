import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/contexts/AuthContext';
import DnaVisualizer from '../components/DnaVisualizer';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Fingerprint, 
  Search, 
  Key, 
  ArrowRight, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Terminal, 
  CheckCircle, 
  BookOpen, 
  Award, 
  Activity,
  AlertCircle,
  User as UserIcon
} from 'lucide-react';

export default function Login() {
  const { user, signInWithGoogle, signUpWithEmail, signInWithEmail, loading, adminLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  // Tabs for interactive Sign In vs Create Account
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  
  // Administrator access panel states
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);

  // Traditional inputs
  const [displayName, setDisplayName] = useState('');
  const [simulatedEmail, setSimulatedEmail] = useState('');
  const [simulatedPassword, setSimulatedPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from]);

  const handleGoogleLogin = async () => {
    setAuthError('');
    setAuthSuccess('');
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error("Login failed:", error);
      let errMsg = error.message || "An unexpected error occurred during Google sign-in.";
      if (error.code === 'auth/unauthorized-domain') {
        errMsg = "UNAUTHORIZED_DOMAIN";
      } else if (error.code === 'auth/operation-not-allowed' || error.code === 'auth/configuration-not-found') {
        errMsg = "GOOGLE_NOT_ENABLED";
      } else if (error.code === 'auth/popup-blocked') {
        errMsg = "The sign-in popup was blocked by your browser settings. Please allow popups for this site.";
      }
      setAuthError(errMsg);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    if (!adminEmail || !adminPassword) {
      setAdminError('Please fill in all administrator access keys.');
      return;
    }
    try {
      const success = await adminLogin(adminEmail, adminPassword);
      if (success) {
        navigate('/admin');
      } else {
        setAdminError('Access Denied. Cryptographic master key matches failed.');
      }
    } catch (err: any) {
      console.error("Admin sign-in error:", err);
      setAdminError(err.message || 'Access Denied.');
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setIsSubmitting(true);
    
    try {
      if (activeTab === 'signup') {
        const name = displayName.trim() || simulatedEmail.split('@')[0] || 'Investigator';
        await signUpWithEmail(simulatedEmail, simulatedPassword, name);
        setAuthSuccess('Account created successfully! Redirecting...');
      } else {
        await signInWithEmail(simulatedEmail, simulatedPassword);
        setAuthSuccess('Signed in successfully! Redirecting...');
      }
    } catch (err: any) {
      console.error("Authentication failed:", err);
      let errMsg = "An unexpected error occurred. Please try again.";
      if (err.code === 'auth/email-already-in-use') {
        errMsg = "This email is already registered. Please sign in instead.";
      } else if (err.code === 'auth/invalid-email') {
        errMsg = "The email address is invalid.";
      } else if (err.code === 'auth/weak-password') {
        errMsg = "The password must be at least 6 characters long.";
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        errMsg = "Invalid email or password combination.";
      } else if (err.code === 'auth/operation-not-allowed') {
        errMsg = "EMAIL_NOT_ENABLED";
      } else {
        errMsg = err.message || errMsg;
      }
      setAuthError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-base py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex items-center justify-center">
      {/* Dynamic scan line forensic grid background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #00f0ff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      <div className="absolute top-[10%] left-[5%] w-[40vw] h-[40vw] bg-warning/5 rounded-full blur-[140px] pointer-events-none opacity-30" />
      <div className="absolute bottom-[15%] right-[5%] w-[35vw] h-[35vw] bg-warning/5 rounded-full blur-[110px] pointer-events-none opacity-20" />

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative z-10">
        
        {/* Left Side: Interactive 3D DNA Helix & Forensic Scanner Pane (Desktop Only / Left 5 Columns) */}
        <motion.div 
          initial={{ opacity: 0, x: -35 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-5 hidden lg:flex flex-col items-stretch min-h-[500px]"
        >
          <DnaVisualizer />
        </motion.div>

        {/* Right Side: Enhanced Authentication Core (Right 7 Columns) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-7 bg-surface border border-black/15 dark:border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col justify-between"
        >
          <div>
            {/* Tab switch mechanism: Sign In vs Sign Up */}
            <div className="flex border-b border-black/10 dark:border-white/5 mb-8">
              <button 
                onClick={() => {
                  setActiveTab('signin');
                  setAuthError('');
                  setAuthSuccess('');
                }}
                className={`flex-1 pb-4 text-xs sm:text-sm font-heading font-black uppercase tracking-widest transition-all relative ${
                  activeTab === 'signin' ? 'text-warning' : 'text-text-muted/60 hover:text-text-main'
                }`}
              >
                Sign In
                {activeTab === 'signin' && (
                  <motion.div layoutId="authTabUnderline" className="absolute bottom-0 left-0 right-0 h-[2px] bg-warning" />
                )}
              </button>
              <button 
                onClick={() => {
                  setActiveTab('signup');
                  setAuthError('');
                  setAuthSuccess('');
                }}
                className={`flex-1 pb-4 text-xs sm:text-sm font-heading font-black uppercase tracking-widest transition-all relative ${
                  activeTab === 'signup' ? 'text-warning' : 'text-text-muted/60 hover:text-text-main'
                }`}
              >
                Create Account
                {activeTab === 'signup' && (
                  <motion.div layoutId="authTabUnderline" className="absolute bottom-0 left-0 right-0 h-[2px] bg-warning" />
                )}
              </button>
            </div>

            {/* Error and Success alerts */}
            <AnimatePresence mode="wait">
              {authError && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 px-4 py-3 rounded-lg text-xs flex items-start gap-2.5 mb-6 leading-relaxed w-full"
                >
                  <AlertCircle size={16} className="shrink-0 mt-0.5 animate-pulse" />
                  <div className="flex-1 min-w-0">
                    <span className="font-bold uppercase tracking-wider block mb-1">
                      {authError === 'EMAIL_NOT_ENABLED' 
                        ? "Email Sign-in Disabled" 
                        : authError === 'UNAUTHORIZED_DOMAIN' 
                        ? "Unauthorized Domain for Google Login" 
                        : authError === 'GOOGLE_NOT_ENABLED'
                        ? "Google Authentication Disabled"
                        : "Authorization Revoked"}
                    </span>
                    {authError === 'EMAIL_NOT_ENABLED' ? (
                      <div className="mt-2 text-text-muted space-y-2">
                        <p className="font-bold text-red-500 dark:text-red-400">
                          Email/Password sign-ins are not yet enabled in your Firebase Authentication settings.
                        </p>
                        <p className="text-[11px]">To enable Email accounts in your project:</p>
                        <ol className="list-decimal pl-4 space-y-1.5 mt-1 font-sans text-[11px] text-text-muted select-text">
                          <li>Go to the <span className="font-bold text-text-main underline">Firebase Console</span>.</li>
                          <li>Navigate to <span className="font-bold">Build &gt; Authentication</span>.</li>
                          <li>Click on the <span className="font-bold">Sign-in method</span> tab.</li>
                          <li>Click <span className="font-bold">Add new provider</span> and choose <span className="font-bold">Email/Password</span>.</li>
                          <li>Toggle <span className="font-bold">Enable</span> and click <span className="font-bold">Save</span>.</li>
                        </ol>
                        <p className="mt-3 text-[10px] border-t border-red-500/10 pt-2 text-warning font-bold">
                          💡 Alternative quick fix: You can use "Sign In with Google" below, which works immediately!
                        </p>
                      </div>
                    ) : authError === 'UNAUTHORIZED_DOMAIN' ? (
                      <div className="mt-2 text-text-muted space-y-2">
                        <p className="font-bold text-red-500 dark:text-red-400">
                          This website domain is not added to the authorized list in your Firebase project (<span className="font-mono">gen-lang-client-0244976845</span>).
                        </p>
                        <p className="text-[11px] font-semibold text-text-main">
                          Current Domain to Auth: <span className="bg-black/30 px-1.5 py-0.5 rounded font-mono text-warning text-sm select-all">{window.location.hostname}</span>
                        </p>
                        <p className="text-[11px]">To authorize this domain and enable Google Login:</p>
                        <ol className="list-decimal pl-4 space-y-1.5 mt-1 font-sans text-[11px] text-text-muted select-text">
                          <li>Go to the <span className="font-bold text-text-main underline">Firebase Console</span>.</li>
                          <li>Navigate to <span className="font-bold">Build &gt; Authentication</span>.</li>
                          <li>Click on the <span className="font-bold">Settings</span> tab on the top-right.</li>
                          <li>Select <span className="font-bold">Authorized domains</span> in the side pane.</li>
                          <li>Click <span className="font-bold">Add domain</span> and paste: <span className="bg-black/40 px-1 py-0.5 rounded font-mono text-warning select-all text-xs">{window.location.hostname}</span></li>
                          <li>Click <span className="font-bold">Add</span> to save the changes.</li>
                        </ol>
                        <p className="text-[10px] text-warning/90 mt-2 font-bold leading-relaxed">
                          💡 Note: If you have a custom domain mapped (like <span className="font-mono">forensicspot.com</span>), make sure both the preview/development URL AND your custom domain are added there!
                        </p>
                      </div>
                    ) : authError === 'GOOGLE_NOT_ENABLED' ? (
                      <div className="mt-2 text-text-muted space-y-2">
                        <p className="font-bold text-red-500 dark:text-red-400">
                          Google Login is not enabled in your Firebase Authentication settings.
                        </p>
                        <p className="text-[11px]">To enable Google Sign-In in your project:</p>
                        <ol className="list-decimal pl-4 space-y-1.5 mt-1 font-sans text-[11px] text-text-muted select-text">
                          <li>Go to the <span className="font-bold text-text-main underline">Firebase Console</span>.</li>
                          <li>Navigate to <span className="font-bold">Build &gt; Authentication</span>.</li>
                          <li>Click on the <span className="font-bold">Sign-in method</span> tab.</li>
                          <li>Click <span className="font-bold">Add new provider</span> and select <span className="font-bold">Google</span>.</li>
                          <li>Toggle <span className="font-bold">Enable</span>, select your <span className="font-bold">Project support email</span>, and click <span className="font-bold">Save</span>.</li>
                        </ol>
                      </div>
                    ) : (
                      <span>{authError}</span>
                    )}
                  </div>
                </motion.div>
              )}
              {authSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-success/10 border border-success/30 text-success px-4 py-3 rounded-lg text-xs flex items-start gap-2.5 mb-6 leading-relaxed"
                >
                  <CheckCircle size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold uppercase tracking-wider block mb-0.5 font-heading">Identity Secured</span>
                    {authSuccess}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Real Authentication Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4 mb-8">
              {activeTab === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5">
                    Profile Identifier (Name)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted/50">
                      <UserIcon size={16} />
                    </span>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="enter your name"
                      className="w-full bg-base/50 text-text-main placeholder-text-muted/40 text-xs rounded-xl border border-black/15 dark:border-white/5 pl-10 pr-4 h-11 focus:outline-none focus:border-warning/50 transition-all font-mono"
                    />
                  </div>
                </motion.div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted/50">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    value={simulatedEmail}
                    onChange={(e) => setSimulatedEmail(e.target.value)}
                    placeholder="enter your account email"
                    className="w-full bg-base/50 text-text-main placeholder-text-muted/40 text-xs rounded-xl border border-black/15 dark:border-white/5 pl-10 pr-4 h-11 focus:outline-none focus:border-warning/50 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5">
                  Password Key
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted/50">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    required
                    value={simulatedPassword}
                    onChange={(e) => setSimulatedPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-base/50 text-text-main placeholder-text-muted/40 text-xs rounded-xl border border-black/15 dark:border-white/5 pl-10 pr-4 h-11 focus:outline-none focus:border-warning/50 transition-all font-mono"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-base border border-black/15 dark:border-white/10 text-text-muted/80 hover:text-text-main font-heading font-black text-xs uppercase tracking-widest rounded-xl hover:bg-black/10 dark:hover:bg-white/5 transition-all text-center flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-warning border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {activeTab === 'signin' ? 'Verify Credentials' : 'Access Registration'}
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>

            {/* Split lines/Or */}
            <div className="relative flex items-center justify-center mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black/10 dark:border-white/5" />
              </div>
              <span className="px-3 bg-surface text-[10px] font-mono text-text-muted uppercase tracking-[0.25em] relative">
                OR
              </span>
            </div>

            {/* Primary Google Login Engine (The real active button) */}
            <div className="space-y-4">
              <motion.button 
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full h-14 bg-white text-black hover:bg-warning/20 border border-black/10 dark:border-white/5 font-heading font-black text-xs sm:text-sm uppercase tracking-[0.18em] rounded-xl hover:text-white transition-all flex items-center justify-center gap-4 group shadow-xl shadow-black/10 dark:shadow-warning/5 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-warning border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.81-2.43-.81-4.14 0-6.66z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>
                      {activeTab === 'signin' ? 'Sign In with Google' : 'Register with Google'}
                    </span>
                    <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform text-warning" />
                  </>
                )}
              </motion.button>
              
            </div>
          </div>

        </motion.div>
      </div>

      {/* Embedded Terms alignment links */}
      <div className="absolute bottom-4 left-0 right-0 text-center z-10">
        <p className="text-[10px] text-text-muted/60 uppercase tracking-widest">
          By signing in above, you agree to our{' '}
          <Link to="/terms" className="text-warning/70 hover:text-warning transition-colors underline">Terms</Link>
          {' '}and{' '}
          <Link to="/privacy" className="text-warning/70 hover:text-warning transition-colors underline">Privacy Policy</Link>.
        </p>
      </div>

    </div>
  );
}
