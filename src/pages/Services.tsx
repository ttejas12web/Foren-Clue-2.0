import { SEO } from "@/components/layout/SEO";
import { Link } from "react-router-dom";
import { Video, Award, GraduationCap } from "lucide-react";

export default function Services() {
  const services = [
    { 
      title: "Workshops & Webinars", 
      desc: "Live sessions with industry veterans and investigators.",
      path: "/webinar",
      icon: Video
    },
    { 
      title: "Certification Programs", 
      desc: "Recognized certificates to boost your career profile.",
      path: "/certificate",
      icon: Award
    },
    { 
      title: "College Collaborations", 
      desc: "Partner with us to bring forensic programs to your institute.",
      path: "/contact",
      icon: GraduationCap
    }
  ];

  return (
    <div className="py-20 px-4 max-w-7xl mx-auto">
      <SEO 
        title="Forensic Workshops, Certifications, and College Collaborations"
        description="Boost your profile with recognized forensic certification credentials, live webinars, physical hands-on workshops, and institutional university affiliations."
        keywords="forensic science workshops, forensic science certified online, forensic university collaboration, study forensics program"
        canonicalPath="/services"
      />
      <h1 className="text-4xl md:text-6xl font-heading font-black mb-16 text-center uppercase tracking-tight">
        Our <span className="text-warning">Services</span>
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {services.map((service, i) => (
          <div key={i} className="bg-surface p-10 border border-black/10 dark:border-white/5 hover:border-warning transition-colors group relative overflow-hidden">
            {/* Absolute accent element for micro-interaction */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-warning/5 rounded-full blur-2xl group-hover:bg-warning/10 transition-all duration-300 pointer-events-none" />
            
            {/* Vector Clipart Container */}
            <div className="mb-8 relative w-24 h-24 flex items-center justify-center bg-warning/[0.03] border border-warning/15 rounded-2xl overflow-hidden group-hover:bg-warning/[0.08] group-hover:border-warning/30 transition-all duration-300">
              {/* Tech vector coordinate line accents */}
              <div className="absolute inset-2 border border-dashed border-warning/10 rounded-xl pointer-events-none" />
              {/* Radial background design */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #facc15 1px, transparent 1px)', backgroundSize: '8px 8px' }} />
              <div className="absolute w-12 h-12 rounded-full bg-warning/10 blur-xl group-hover:bg-warning/20 transition-all duration-300" />
              
              {/* Clean Vector Icon representation */}
              <service.icon className="w-12 h-12 text-warning relative z-10 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3" strokeWidth={1.25} />
            </div>

            <h2 className="text-2xl font-heading font-bold mb-4">{service.title}</h2>
            <p className="text-text-muted mb-8">{service.desc}</p>
            <Link 
              to={service.path}
              className="text-sm font-bold text-warning uppercase tracking-widest inline-flex items-center gap-2 group-hover:gap-4 transition-all"
            >
              Learn More <span>→</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

