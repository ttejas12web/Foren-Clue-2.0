import { ReactNode, useState, useEffect } from 'react';
import { Monitor } from 'lucide-react';
import { Link } from 'react-router-dom';

export function DesktopOnly({ children }: { children: ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-warning/10 p-6 rounded-full mb-6">
          <Monitor size={48} className="text-warning" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-widest text-text-main mb-4">
          Desktop Required
        </h2>
        <p className="text-text-muted mb-8 max-w-md leading-relaxed">
          Our interactive 3D simulations require a larger screen for a seamless experience. Please access this page on a desktop or laptop computer.
        </p>
        <Link 
          to="/"
          className="bg-info text-black font-bold uppercase tracking-widest text-sm px-8 py-3 rounded-xl hover:bg-info/90 transition-all"
        >
          Return Home
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
