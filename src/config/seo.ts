export interface RouteSEOConfig {
  title: string;
  description: string;
  keywords?: string;
  image: string;
  type?: 'website' | 'article' | 'book' | 'course' | 'service';
  badge?: string;
  tag?: string;
}

export const DEFAULT_SEO: RouteSEOConfig = {
  title: 'ForenClue | Your Partner In Forensic Precision',
  description: "India's premier forensic science edtech platform. Master forensic analysis, cybersecurity, crime scene investigation, and digital forensics with expert masterclasses.",
  keywords: 'forensic science, forensic courses, crime scene investigation, forenclue, digital forensics, forensic career, learn finger print lifting, india forensics',
  image: 'https://blogger.googleusercontent.com/img/a/AVvXsEg_OeYXV0qnZe42fjD2ty2vBNDGqhWPnOjQBOiWFbkDcCaUa0Pl5sJyixMvmxEhAKoLMU9A4A2bjvxrpEuGG_jKX7q2su81OGr9eSt3DUWNwQVufTdGQI_NSKBcZduRx-7jyn3dMmQVb4o6Qom_9Ul2qen9YS8c-h2W5PTda-U8x6JsAasJG_3lHFitvX0',
  type: 'website',
  badge: 'Certified Learning & Investigations',
  tag: 'FORENSIC EDTECH PLATFORM'
};

export const ROUTE_SEO_CONFIG: Record<string, RouteSEOConfig> = {
  '/': DEFAULT_SEO,
  '/courses': {
    title: 'Forensic Science Courses & Training | ForenClue',
    description: 'Browse expert-led masterclasses in criminalistics, digital forensics, DNA profiling, cybercrime investigation, and crime scene documentation.',
    keywords: 'forensic science courses, digital forensics certification, criminalistics training, forensic online masterclass',
    image: 'https://www.forenclue.in/og/courses.png',
    type: 'course',
    badge: 'Industry Recognized Certificates',
    tag: 'COURSES & MASTERCLASSES'
  },
  '/cases': {
    title: 'Forensic Case Studies & Investigations | ForenClue',
    description: 'Explore real-world criminal case breakdowns, forensic evidence logs, pathology reports, digital footprints, and crime scene reconstructions.',
    keywords: 'forensic case studies, criminal case breakdown, crime scene reconstruction, digital evidence logs',
    image: 'https://www.forenclue.in/og/cases.png',
    type: 'article',
    badge: 'Real-World Investigation Logs',
    tag: 'CASE STUDIES ARCHIVE'
  },
  '/ebooks': {
    title: 'ForenClue E-Library & Study Reference Handbooks',
    description: 'Access verified scientific forensic handbooks, physical crime scene protocols, laboratory reference manuals, and digital investigation guidebooks.',
    keywords: 'forensic e-library, forensic books, crime scene manuals, digital forensics guidebooks',
    image: 'https://www.forenclue.in/og/ebooks.png',
    type: 'book',
    badge: 'Verified Scientific Handbooks',
    tag: 'E-LIBRARY & HANDBOOKS'
  },
  '/podcast': {
    title: 'Forensic Talk | Expert Podcast | ForenClue',
    description: 'Listen to in-depth discussions with veteran crime scene investigators, cyber forensic experts, pathologists, and legal scholars.',
    keywords: 'forensic talk podcast, crime scene podcast, forensic expert interviews, forensic science audio',
    image: 'https://www.forenclue.in/og/podcast.png',
    type: 'website',
    badge: 'Audio Episodes & Key Insights',
    tag: 'FORENSIC TALK PODCAST'
  },
  '/webinar': {
    title: 'Live Forensic Science Masterclasses & Webinars | ForenClue',
    description: 'Register for upcoming high-impact live webinars hosted by top forensic experts. Learn digital investigations, trace evidence analytics, and earn certification.',
    keywords: 'forensic live webinar, forensic workshops, interactive forensic masterclass, live cybersecurity training',
    image: 'https://www.forenclue.in/og/webinar.png',
    type: 'website',
    badge: 'Live Interactive Masterclasses',
    tag: 'LIVE MASTERCLASSES'
  },
  '/community': {
    title: 'Forensic Science Community & Discussion Forum | ForenClue',
    description: "Engage in India's premier forensic science peer community. Discuss case studies, clear academic doubts, and network with forensic analysts.",
    keywords: 'forensic science forum, forensic academic doubts, forensic student network, criminalistics community',
    image: 'https://www.forenclue.in/og/community.png',
    type: 'website',
    badge: 'Active Peer Network & Forum',
    tag: 'COMMUNITY HUB'
  },
  '/services': {
    title: 'Professional Forensic Services & Consultancy | ForenClue',
    description: 'Corporate and private forensic consultancy, cyber incident response, document authentication, digital evidence analysis, and expert witness support.',
    keywords: 'forensic consultancy, cyber incident response, document authentication, digital evidence analysis, expert witness',
    image: 'https://www.forenclue.in/og/services.png',
    type: 'service',
    badge: 'Confidential & Expert Consultancy',
    tag: 'FORENSIC CONSULTANCY'
  },
  '/about': {
    title: 'About Our Mission & Team | ForenClue',
    description: 'Meet the expert founders, academic counselors, and advisory board behind ForenClue. Transforming forensic science education and cyber research.',
    keywords: 'about forenclue, forensic founders, forensic edtech vision, cybersecurity researchers',
    image: 'https://www.forenclue.in/og/about.png',
    type: 'website',
    badge: 'Vision & Expert Leadership',
    tag: 'ABOUT FORENCLUE'
  },
  '/careers': {
    title: 'Careers, Research Roles & Internships | ForenClue',
    description: 'Join the ForenClue team. Explore career opportunities, hands-on forensic science internships, research roles, and advisory board positions.',
    keywords: 'forensic internships, forensic science jobs, cybersecurity research roles, forenclue careers',
    image: 'https://www.forenclue.in/og/careers.png',
    type: 'website',
    badge: 'Open Roles & Fellowships',
    tag: 'CAREERS & INTERNSHIPS'
  },
  '/contact': {
    title: 'Contact ForenClue Support & Inquiries',
    description: 'Get in touch with administrative directors, student support coordinators, or corporate partnership divisions for your educational queries.',
    keywords: 'contact forenclue, forensic support, forenclue email, student support coordinator',
    image: 'https://www.forenclue.in/og/contact.png',
    type: 'website',
    badge: 'Direct Expert Assistance',
    tag: 'STUDENT SUPPORT'
  },
  '/certificate': {
    title: 'Instant Certificate Verification Portal | ForenClue',
    description: 'Instantly authenticate and verify official academic credentials, masterclass badges, and course completion certificates issued by ForenClue.',
    keywords: 'certificate verification, verify forensic credential, authentic certificate check, forenclue badge',
    image: 'https://www.forenclue.in/og/certificate.png',
    type: 'website',
    badge: 'Tamper-Proof Verification',
    tag: 'CREDENTIAL VERIFICATION'
  },
  '/quizzes': {
    title: 'Forensic Quizzes & Weekly Challenges | ForenClue',
    description: 'Test your forensic science knowledge through interactive quizzes, challenges, and practical assessments. Learn, compete, and sharpen your investigative skills with ForenClue.',
    keywords: 'forensic quiz, weekly forensic challenge, crime scene protocol quiz, digital evidence leaderboard',
    image: 'https://blogger.googleusercontent.com/img/a/AVvXsEg_OeYXV0qnZe42fjD2ty2vBNDGqhWPnOjQBOiWFbkDcCaUa0Pl5sJyixMvmxEhAKoLMU9A4A2bjvxrpEuGG_jKX7q2su81OGr9eSt3DUWNwQVufTdGQI_NSKBcZduRx-7jyn3dMmQVb4o6Qom_9Ul2qen9YS8c-h2W5PTda-U8x6JsAasJG_3lHFitvX0',
    type: 'website',
    badge: 'Live Leaderboards & Scoring',
    tag: 'QUIZZES & CHALLENGES'
  },
  '/simulations': {
    title: 'Virtual Forensic Science Labs & Simulations | ForenClue',
    description: 'Experience realistic 3D virtual laboratory simulations including compound microscopy examination and spectrophotometer absorbance analysis.',
    keywords: 'virtual forensic lab, 3d microscope simulator, spectrophotometer lab simulation, interactive forensic lab',
    image: 'https://www.forenclue.in/og/simulations.png',
    type: 'website',
    badge: 'Interactive Virtual Workstations',
    tag: '3D VIRTUAL LABS'
  },
  '/simulations/microscope': {
    title: 'Virtual Compound Microscope Simulator | ForenClue',
    description: 'Interactive virtual microscope simulator for forensic specimen examination, magnification tuning, focal adjustment, and slide analysis.',
    keywords: 'virtual microscope, compound microscope simulation, slide examination, forensic specimen analysis',
    image: 'https://www.forenclue.in/og/microscope.png',
    type: 'website',
    badge: 'Interactive Slide Analysis',
    tag: 'VIRTUAL LAB SIMULATION'
  },
  '/simulations/comparison-microscope': {
    title: 'Scientific Comparison Microscope Simulator | ForenClue',
    description: 'Interactive 3D virtual comparison microscope simulation. Split-field side-by-side examination of fired bullets, cartridge breechface impressions, and forensic fibers.',
    keywords: 'comparison microscope simulation, ballistics comparison, bullet striation alignment, forensic comparison microscope, optical bridge simulator',
    image: 'https://www.forenclue.in/og/simulations.png',
    type: 'website',
    badge: 'Dual-Stage Optical Bridge',
    tag: 'VIRTUAL BALLISTICS LAB'
  },
  '/simulations/spectrophotometer': {
    title: 'UV-Vis Spectrophotometer Simulator | ForenClue',
    description: 'Interactive laboratory simulation for forensic chemical absorbance profiling, wavelength calibration, and quantitative analysis.',
    keywords: 'spectrophotometer simulator, uv-vis lab simulation, chemical absorbance profiling, wavelength calibration',
    image: 'https://www.forenclue.in/og/spectrophotometer.png',
    type: 'website',
    badge: 'Quantitative Wavelength Profiling',
    tag: 'VIRTUAL LAB SIMULATION'
  },
  '/employees': {
    title: 'Employee & Staff Verification Board | ForenClue',
    description: 'ForenClue official Employee Verification Portal. Search active duty badges, staff credentials, and digital cryptographic ID cards.',
    keywords: 'employee verification, staff badge check, forenclue staff directory, cryptographic ID cards',
    image: 'https://www.forenclue.in/og/employees.png',
    type: 'website',
    badge: 'Official Staff Credential Check',
    tag: 'STAFF VERIFICATION'
  },
  '/volunteers': {
    title: 'Volunteer Network & Youth Forensic Alliance | ForenClue',
    description: 'Join the ForenClue volunteer network and contribute to forensic science awareness, community outreach, and research initiatives.',
    keywords: 'forensic volunteers, youth forensic alliance, community outreach, forensic research initiatives',
    image: 'https://www.forenclue.in/og/volunteers.png',
    type: 'website',
    badge: 'Community Outreach & Impact',
    tag: 'YOUTH FORENSIC ALLIANCE'
  },
  '/ambassadors': {
    title: 'Campus Ambassador Program | ForenClue',
    description: 'Represent ForenClue at your university or institution as a Campus Ambassador and lead forensic science initiatives in your campus.',
    keywords: 'campus ambassador, university leadership, forensic student representative, campus initiatives',
    image: 'https://www.forenclue.in/og/ambassadors.png',
    type: 'website',
    badge: 'University Student Leadership',
    tag: 'CAMPUS AMBASSADOR'
  },
  '/privacy': {
    title: 'Privacy Policy | ForenClue',
    description: 'Understand how ForenClue collects, stores, and protects student data, examination records, and transaction security.',
    keywords: 'privacy policy, forenclue data protection, student data privacy',
    image: 'https://www.forenclue.in/og/privacy.png',
    type: 'website',
    badge: 'Data Protection & Security',
    tag: 'LEGAL & PRIVACY'
  },
  '/terms': {
    title: 'Terms of Service | ForenClue',
    description: 'Review user terms, educational guidelines, certificate code of conduct, and enrollment conditions for ForenClue.',
    keywords: 'terms of service, forenclue user agreement, platform usage terms',
    image: 'https://www.forenclue.in/og/terms.png',
    type: 'website',
    badge: 'Platform Usage Conditions',
    tag: 'LEGAL & TERMS'
  },
  '/login': {
    title: 'Secure Student & Specialist Login | ForenClue',
    description: 'Sign in to access your enrolled forensic courses, certificate dashboard, quiz rankings, and saved study materials.',
    keywords: 'forenclue login, student portal login, specialist sign in',
    image: 'https://www.forenclue.in/og/login.png',
    type: 'website',
    badge: 'Secure Authentication Portal',
    tag: 'MEMBER PORTAL'
  },
  '/dashboard': {
    title: 'Student & Researcher Dashboard | ForenClue',
    description: 'Track your course progress, upcoming masterclasses, quiz leaderboard ranks, and downloaded forensic handbooks.',
    keywords: 'student dashboard, learning progress, forenclue workspace',
    image: 'https://www.forenclue.in/og/dashboard.png',
    type: 'website',
    badge: 'Personalized Learning Workspace',
    tag: 'STUDENT DASHBOARD'
  },
  '/profile': {
    title: 'Forensic Specialist Profile | ForenClue',
    description: 'View earned forensic certifications, achievement badges, community contributions, and active enrollment records.',
    keywords: 'specialist profile, forensic portfolio, earned certificates, achievement badges',
    image: 'https://www.forenclue.in/og/profile.png',
    type: 'website',
    badge: 'Verified Credential Portfolio',
    tag: 'SPECIALIST PROFILE'
  }
};

/**
 * Helper function to retrieve SEO metadata for any route path with optional fallback
 */
export function getSEOForRoute(pathname: string): RouteSEOConfig {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';
  if (ROUTE_SEO_CONFIG[normalizedPath]) {
    return ROUTE_SEO_CONFIG[normalizedPath];
  }
  
  // Prefix matching for nested routes
  for (const route of Object.keys(ROUTE_SEO_CONFIG)) {
    if (route !== '/' && normalizedPath.startsWith(route)) {
      return ROUTE_SEO_CONFIG[route];
    }
  }

  return DEFAULT_SEO;
}
