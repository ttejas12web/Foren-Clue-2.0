import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  LogOut, 
  User as UserIcon, 
  Sun, 
  Moon, 
  ChevronDown,
  BookOpen, 
  FileText, 
  Mic, 
  Video, 
  Award, 
  ShieldCheck, 
  Info, 
  Users, 
  GraduationCap 
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/contexts/AuthContext';

const directLinks = [
  { name: 'Home', path: '/' },
  { name: 'Case Studies', path: '/cases' },
  { name: 'Services', path: '/services' },
  { name: 'Community', path: '/community' },
];

const resourcesDropdown = [
  { name: 'E-Library', path: '/ebooks', icon: BookOpen },
  { name: 'Podcast', path: '/podcast', icon: Mic },
  { name: 'Webinars', path: '/webinar', icon: Video },
];

const verifyDropdown = [
  { name: 'Certificate Verification', path: '/certificate', icon: Award },
  { name: 'ID Card Verification', path: '/employees', icon: ShieldCheck },
];

const teamDropdown = [
  { name: 'Volunteers', path: '/volunteers', icon: Users },
  { name: 'Campus Ambassadors', path: '/ambassadors', icon: GraduationCap },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileResourcesOpen, setIsMobileResourcesOpen] = useState(false);
  const [isMobileVerifyOpen, setIsMobileVerifyOpen] = useState(false);
  const [isMobileTeamOpen, setIsMobileTeamOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signInWithGoogle, logout } = useAuth();
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved !== 'light' : true;
  });

  useEffect(() => {
    if (['/ebooks', '/podcast', '/webinar'].includes(location.pathname)) {
      setIsMobileResourcesOpen(true);
    }
    if (['/certificate', '/employees'].includes(location.pathname)) {
      setIsMobileVerifyOpen(true);
    }
    if (['/volunteers', '/ambassadors'].includes(location.pathname)) {
      setIsMobileTeamOpen(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    
    const handleOrientationChange = () => {
        setIsOpen(false);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);
  
  return (
    <nav className="print:hidden fixed top-0 left-0 right-0 z-50 bg-crust/90 backdrop-blur-md border-b border-black/10 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link 
            to={location.pathname === '/podcast' ? "/podcast" : "/"} 
            className="group block"
          >
            {location.pathname === '/podcast' ? (
               <div className="flex items-center gap-3">
                 <span className="font-black text-xl tracking-tight text-text-main group-hover:text-warning transition-colors">ForenClue Podcast</span>
               </div>
            ) : (
              <>
                <Logo />
                <span className="text-[9px] text-text-muted uppercase tracking-widest mt-1 block">Your Partner in Forensic Precision.</span>
              </>
            )}
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {directLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "px-3 py-2 font-medium text-sm transition-colors rounded-md hover:bg-black/5 dark:hover:bg-white/5",
                  location.pathname === link.path
                    ? "text-warning"
                    : "text-text-muted hover:text-text-main"
                )}
              >
                {link.name}
              </Link>
            ))}

            {/* Resources Dropdown */}
            <div className="relative group/resources-dropdown">
              <button
                className={cn(
                  "flex items-center gap-1 px-3 py-2 font-medium text-sm transition-colors cursor-default rounded-md hover:bg-black/5 dark:hover:bg-white/5",
                  ['/ebooks', '/podcast', '/webinar'].includes(location.pathname)
                    ? "text-warning"
                    : "text-text-muted hover:text-text-main"
                )}
              >
                Resources
                <ChevronDown size={14} className="transition-transform duration-200 group-hover/resources-dropdown:rotate-180" />
              </button>

              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 opacity-0 invisible group-hover/resources-dropdown:opacity-100 group-hover/resources-dropdown:visible transition-all duration-200 z-50">
                <div className="w-56 bg-surface border border-black/10 dark:border-white/10 rounded-md shadow-xl overflow-hidden py-1">
                  {resourcesDropdown.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={cn(
                          "flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-muted hover:text-warning hover:bg-black/5 dark:hover:bg-black/5 dark:bg-white/5 transition-colors",
                          location.pathname === link.path && "text-warning bg-black/5 dark:bg-white/5"
                        )}
                      >
                        <Icon size={16} className="text-warning/80" />
                        <span>{link.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Verify Dropdown */}
            <div className="relative group/verify-dropdown">
              <button
                className={cn(
                  "flex items-center gap-1 px-3 py-2 font-medium text-sm transition-colors cursor-default rounded-md hover:bg-black/5 dark:hover:bg-white/5",
                  ['/certificate', '/employees'].includes(location.pathname)
                    ? "text-warning"
                    : "text-text-muted hover:text-text-main"
                )}
              >
                Verify
                <ChevronDown size={14} className="transition-transform duration-200 group-hover/verify-dropdown:rotate-180" />
              </button>

              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 opacity-0 invisible group-hover/verify-dropdown:opacity-100 group-hover/verify-dropdown:visible transition-all duration-200 z-50">
                <div className="w-60 bg-surface border border-black/10 dark:border-white/10 rounded-md shadow-xl overflow-hidden py-1">
                  {verifyDropdown.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={cn(
                          "flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-muted hover:text-warning hover:bg-black/5 dark:hover:bg-black/5 dark:bg-white/5 transition-colors",
                          location.pathname === link.path && "text-warning bg-black/5 dark:bg-white/5"
                        )}
                      >
                        <Icon size={16} className="text-warning/80" />
                        <span>{link.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Team Dropdown */}
            <div className="relative group/team-dropdown">
              <button
                className={cn(
                  "flex items-center gap-1 px-3 py-2 font-medium text-sm transition-colors cursor-default rounded-md hover:bg-black/5 dark:hover:bg-white/5",
                  ['/volunteers', '/ambassadors'].includes(location.pathname)
                    ? "text-warning"
                    : "text-text-muted hover:text-text-main"
                )}
              >
                Team
                <ChevronDown size={14} className="transition-transform duration-200 group-hover/team-dropdown:rotate-180" />
              </button>

              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 opacity-0 invisible group-hover/team-dropdown:opacity-100 group-hover/team-dropdown:visible transition-all duration-200 z-50">
                <div className="w-56 bg-surface border border-black/10 dark:border-white/10 rounded-md shadow-xl overflow-hidden py-1">
                  {teamDropdown.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={cn(
                          "flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-muted hover:text-warning hover:bg-black/5 dark:hover:bg-black/5 dark:bg-white/5 transition-colors",
                          location.pathname === link.path && "text-warning bg-black/5 dark:bg-white/5"
                        )}
                      >
                        <Icon size={16} className="text-warning/80" />
                        <span>{link.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* About Us */}
            <Link
              to="/about"
              className={cn(
                "px-3 py-2 font-medium text-sm transition-colors rounded-md hover:bg-black/5 dark:hover:bg-white/5",
                location.pathname === '/about'
                  ? "text-warning"
                  : "text-text-muted hover:text-text-main"
              )}
            >
              About Us
            </Link>

            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 ml-2 rounded-full text-text-muted hover:text-warning hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <div className="flex items-center gap-3 ml-4">
                <div className="relative group/nav-dropdown">
                  <Link 
                    to="/dashboard"
                    className="flex items-center gap-2 px-1 transition-colors group/profile"
                  >
                     {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName || 'User'} className="w-6 h-6 rounded-full" />
                     ) : (
                        <UserIcon size={18} className="text-text-muted group-hover/profile:text-warning" />
                     )}
                     <span className="text-xs font-medium text-text-main max-w-[80px] truncate group-hover/profile:text-warning transition-colors">Dashboard</span>
                  </Link>

                  <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover/nav-dropdown:opacity-100 group-hover/nav-dropdown:visible transition-all duration-200 z-50">
                    <div className="w-48 bg-surface border border-black/10 dark:border-white/10 rounded-md shadow-xl overflow-hidden py-1">
                      <Link to="/profile" className="block px-4 py-2 text-sm text-text-muted hover:text-warning hover:bg-black/5 dark:hover:bg-black/5 dark:bg-white/5 transition-colors">
                        View Profile
                      </Link>
                      <button 
                        onClick={async () => {
                          await logout();
                          navigate('/');
                        }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-text-muted hover:text-warning hover:bg-black/5 dark:hover:bg-black/5 dark:bg-white/5 transition-colors"
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link 
                to="/login"
                className="ml-4 px-5 py-2.5 bg-warning text-white font-bold text-sm tracking-wide rounded-md hover:bg-warning-dark transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-md text-text-muted hover:text-warning hover:bg-black/10 dark:hover:bg-black/5 dark:bg-white/10 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-text-muted hover:text-text-main hover:bg-black/10 dark:hover:bg-black/5 dark:bg-white/10 transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-crust border-b border-black/10 dark:border-white/10 overflow-y-auto max-h-[calc(100dvh-80px)]"
          >
            <div className="px-4 py-4 space-y-1">
              {directLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block px-4 py-3 font-medium transition-colors rounded-md",
                    location.pathname === link.path
                      ? "text-warning bg-black/5 dark:bg-white/5"
                      : "text-text-muted hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5"
                  )}
                >
                  {link.name}
                </Link>
              ))}

              {/* Resources Dropdown / Accordion on Mobile */}
              <div className="space-y-1">
                <button
                  onClick={() => setIsMobileResourcesOpen(!isMobileResourcesOpen)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 font-medium transition-colors text-left rounded-md",
                    ['/ebooks', '/podcast', '/webinar'].includes(location.pathname)
                      ? "text-warning bg-black/5 dark:bg-white/5"
                      : "text-text-muted hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5"
                  )}
                >
                  <span>Resources</span>
                  <ChevronDown size={18} className={cn("transition-transform duration-200", isMobileResourcesOpen && "rotate-180")} />
                </button>
                
                <AnimatePresence initial={false}>
                  {isMobileResourcesOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pl-4 space-y-1 overflow-hidden"
                    >
                      {resourcesDropdown.map((link) => {
                        const Icon = link.icon;
                        return (
                          <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              "flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors rounded-md",
                              location.pathname === link.path
                                ? "text-warning bg-black/5 dark:bg-white/5"
                                : "text-text-muted hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5"
                            )}
                          >
                            <Icon size={16} className="text-warning/80" />
                            <span>{link.name}</span>
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Verify Dropdown / Accordion on Mobile */}
              <div className="space-y-1">
                <button
                  onClick={() => setIsMobileVerifyOpen(!isMobileVerifyOpen)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 font-medium transition-colors text-left rounded-md",
                    ['/certificate', '/employees'].includes(location.pathname)
                      ? "text-warning bg-black/5 dark:bg-white/5"
                      : "text-text-muted hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5"
                  )}
                >
                  <span>Verify</span>
                  <ChevronDown size={18} className={cn("transition-transform duration-200", isMobileVerifyOpen && "rotate-180")} />
                </button>
                
                <AnimatePresence initial={false}>
                  {isMobileVerifyOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pl-4 space-y-1 overflow-hidden"
                    >
                      {verifyDropdown.map((link) => {
                        const Icon = link.icon;
                        return (
                          <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              "flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors rounded-md",
                              location.pathname === link.path
                                ? "text-warning bg-black/5 dark:bg-white/5"
                                : "text-text-muted hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5"
                            )}
                          >
                            <Icon size={16} className="text-warning/80" />
                            <span>{link.name}</span>
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Team Dropdown / Accordion on Mobile */}
              <div className="space-y-1">
                <button
                  onClick={() => setIsMobileTeamOpen(!isMobileTeamOpen)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 font-medium transition-colors text-left rounded-md",
                    ['/volunteers', '/ambassadors'].includes(location.pathname)
                      ? "text-warning bg-black/5 dark:bg-white/5"
                      : "text-text-muted hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5"
                  )}
                >
                  <span>Team</span>
                  <ChevronDown size={18} className={cn("transition-transform duration-200", isMobileTeamOpen && "rotate-180")} />
                </button>
                
                <AnimatePresence initial={false}>
                  {isMobileTeamOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pl-4 space-y-1 overflow-hidden"
                    >
                      {teamDropdown.map((link) => {
                        const Icon = link.icon;
                        return (
                          <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              "flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors rounded-md",
                              location.pathname === link.path
                                ? "text-warning bg-black/5 dark:bg-white/5"
                                : "text-text-muted hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5"
                            )}
                          >
                            <Icon size={16} className="text-warning/80" />
                            <span>{link.name}</span>
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* About Us */}
              <Link
                to="/about"
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block px-4 py-3 font-medium transition-colors rounded-md",
                  location.pathname === '/about'
                    ? "text-warning bg-black/5 dark:bg-white/5"
                    : "text-text-muted hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5"
                )}
              >
                About Us
              </Link>

              {user ? (
                 <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10">
                   <Link 
                     to="/dashboard"
                     onClick={() => setIsOpen(false)}
                     className="flex items-center gap-3 px-4 mb-4 group"
                   >
                     {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName || 'User'} className="w-10 h-10 rounded-full" />
                     ) : (
                        <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center">
                           <UserIcon size={20} className="text-text-muted transition-colors group-hover:text-warning" />
                        </div>
                     )}
                     <div>
                       <p className="text-sm font-medium text-text-main group-hover:text-warning transition-colors">{user.displayName || 'User'}</p>
                       <p className="text-[10px] text-text-muted uppercase tracking-widest">Dashboard</p>
                     </div>
                   </Link>
                   <Link
                     to="/profile"
                     onClick={() => setIsOpen(false)}
                     className="block px-4 py-3 mb-2 font-medium text-text-muted hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5 transition-colors rounded-md"
                   >
                     View Profile
                   </Link>
                   <button 
                     onClick={async () => { 
                       await logout(); 
                       setIsOpen(false); 
                       navigate('/');
                     }}
                     className="w-full flex items-center justify-center gap-2 px-5 py-3 text-text-muted font-bold hover:text-text-main transition-colors hover:bg-black/5 dark:hover:bg-white/5 rounded-md"
                   >
                     <LogOut size={18} />
                     Sign Out
                   </button>
                 </div>
              ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full block text-center mt-4 px-5 py-3 bg-warning text-white font-bold rounded-md hover:bg-warning-dark transition-colors"
                  >
                    Sign In
                  </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
