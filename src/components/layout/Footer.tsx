import { Link, useLocation } from 'react-router-dom';
import { Mail, MapPin, Youtube, Linkedin, Instagram, ArrowRight, ExternalLink } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export function Footer() {
  const location = useLocation();

  if (location.pathname.startsWith('/admin')) {
    return null;
  }
  return (
    <footer className="print:hidden bg-crust border-t border-black/10 dark:border-white/10 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-16">
          
          {/* Column 1: Brand & Contact Info (Spans 4 columns on large screens) */}
          <div className="lg:col-span-4 flex flex-col pr-0 lg:pr-8">
            <Link to="/" className="group inline-flex flex-col mb-6">
              <Logo className="justify-start" />
              <span className="text-[10px] text-text-muted uppercase tracking-widest mt-2 block font-medium">
                Your Partner in Forensic Precision
              </span>
            </Link>
            <p className="text-text-muted text-sm leading-relaxed mb-8 max-w-sm">
              India's first dedicated, expert-led forensic EdTech platform. We empower students, legal practitioners, and law enforcement with world-class education, virtual simulations, and real-world case studies.
            </p>
            
            {/* Social Media Links */}
            <div className="flex items-center gap-3">
              <a 
                href="https://www.youtube.com/forenclue" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2.5 bg-surface rounded-full text-text-muted hover:text-white hover:bg-[#FF0000] transition-colors duration-300"
                aria-label="YouTube Channel"
              >
                <Youtube size={18} />
              </a>
              <a 
                href="https://www.linkedin.com/company/foren-clue" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2.5 bg-surface rounded-full text-text-muted hover:text-white hover:bg-[#0A66C2] transition-colors duration-300"
                aria-label="LinkedIn Profile"
              >
                <Linkedin size={18} />
              </a>
              <a 
                href="https://www.instagram.com/forenclue/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2.5 bg-surface rounded-full text-text-muted hover:text-white hover:bg-gradient-to-tr hover:from-[#fd5949] hover:to-[#d6249f] transition-all duration-300"
                aria-label="Instagram Page"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Column 2: Platform Links */}
          <div className="lg:col-span-2">
            <h4 className="font-heading font-bold text-sm tracking-wider text-text-main mb-6 uppercase">
              Platform
            </h4>
            <ul className="space-y-3.5 text-sm text-text-muted">
              <li>
                <Link to="/simulations" className="hover:text-warning transition-colors duration-200">Virtual Labs</Link>
              </li>
              <li>
                <Link to="/cases" className="hover:text-warning transition-colors duration-200">Case Studies</Link>
              </li>
              <li>
                <Link to="/ebooks" className="hover:text-warning transition-colors duration-200">E-Library</Link>
              </li>
              <li>
                <Link to="/quizzes" className="hover:text-warning transition-colors duration-200">Quizzes & Assessments</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Community & Programs */}
          <div className="lg:col-span-3">
            <h4 className="font-heading font-bold text-sm tracking-wider text-text-main mb-6 uppercase">
              Community & Media
            </h4>
            <ul className="space-y-3.5 text-sm text-text-muted">
              <li>
                <Link to="/community" className="hover:text-warning transition-colors duration-200">Discussion Forum</Link>
              </li>
              <li>
                <Link to="/podcast" className="hover:text-warning transition-colors duration-200">Forensic Podcast</Link>
              </li>
              <li>
                <Link to="/webinar" className="hover:text-warning transition-colors duration-200">Webinars & Events</Link>
              </li>
              <li>
                <Link to="/ambassadors" className="hover:text-warning transition-colors duration-200">Campus Ambassadors</Link>
              </li>
              <li>
                <Link to="/volunteers" className="hover:text-warning transition-colors duration-200">Volunteer Program</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Company & Trust */}
          <div className="lg:col-span-3">
            <h4 className="font-heading font-bold text-sm tracking-wider text-text-main mb-6 uppercase">
              Company & Support
            </h4>
            <ul className="space-y-3.5 text-sm text-text-muted mb-8">
              <li>
                <Link to="/about" className="hover:text-warning transition-colors duration-200">About Us</Link>
              </li>
              <li>
                <Link to="/careers" className="hover:text-warning transition-colors duration-200">Careers</Link>
              </li>
              <li>
                <Link to="/certificate" className="flex items-center gap-1.5 hover:text-warning transition-colors duration-200">
                  Verify Certificate <ExternalLink size={12} className="opacity-70" />
                </Link>
              </li>
              <li>
                <Link to="/employees" className="flex items-center gap-1.5 hover:text-warning transition-colors duration-200">
                  Verify ID Card <ExternalLink size={12} className="opacity-70" />
                </Link>
              </li>
            </ul>

            {/* Contact Details */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm text-text-muted">
                <Mail size={16} className="text-warning shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <a href="mailto:support@forenclue.in" className="hover:text-warning transition-colors">support@forenclue.in</a>
                  <a href="mailto:forenclue@gmail.com" className="hover:text-warning transition-colors">forenclue@gmail.com</a>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm text-text-muted">
                <MapPin size={16} className="text-warning shrink-0 mt-0.5" />
                <span>Pune, Maharashtra, India</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright and legal area */}
        <div className="border-t border-black/10 dark:border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-text-muted">
          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <p>&copy; {new Date().getFullYear()} ForenClue. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] opacity-40 hidden md:inline">|</span>
              <a 
                href="https://www.dmca.com/r/8eqg90g" 
                title="DMCA.com Protection Status" 
                className="dmca-badge inline-block transition-opacity duration-200 hover:opacity-80"
                target="_blank" 
                rel="noopener noreferrer"
              >
                <img 
                  src="https://images.dmca.com/Badges/DMCA_logo-grn-btn120w.png?ID=cf5061f2-85e0-4a93-981a-645cfa86336c" 
                  alt="DMCA.com Protection Status" 
                  className="h-7 w-auto"
                />
              </a>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <Link className="hover:text-text-main transition-colors font-medium" to="/privacy">Privacy Policy</Link>
            <Link className="hover:text-text-main transition-colors font-medium" to="/terms">Terms of Service</Link>
            <Link className="hover:text-text-main transition-colors font-medium" to="/contact">Contact Us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
