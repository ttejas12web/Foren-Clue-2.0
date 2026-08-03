import fs from 'fs';
import path from 'path';
import { Resvg } from '@resvg/resvg-js';

const outputDirs = [
  path.join(process.cwd(), 'public', 'images', 'og'),
  path.join(process.cwd(), 'public', 'og')
];

for (const dir of outputDirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const pages = [
  {
    filenames: ['home.png'],
    badge: 'EDTECH PLATFORM',
    title: "India's Premier Forensic EdTech Platform",
    subtitle: "Cyber Forensics, Crime Scene Investigation, Digital Evidence, Research & Practical Learning",
    accentColor: '#f59e0b',
    iconSymbol: '🔍'
  },
  {
    filenames: ['case-studies.png', 'cases.png'],
    badge: 'CASE ARCHIVES',
    title: 'Forensic Case Studies & Investigations',
    subtitle: 'Real Criminal Case Reconstruction, DNA Profiling, Trace Evidence & Digital Crime Analysis',
    accentColor: '#ef4444',
    iconSymbol: '📁'
  },
  {
    filenames: ['services.png'],
    badge: 'CONSULTANCY & SOLUTIONS',
    title: 'Professional Forensic Services',
    subtitle: 'Cyber Incident Response, Digital Investigations, Document Verification & Consultation',
    accentColor: '#3b82f6',
    iconSymbol: '🛡️'
  },
  {
    filenames: ['community.png'],
    badge: 'PEER NETWORK',
    title: 'ForenClue Forensic Community',
    subtitle: "Connect with India's Fastest Growing Network of Forensic Scholars, Analysts & Researchers",
    accentColor: '#8b5cf6',
    iconSymbol: '💬'
  },
  {
    filenames: ['resources.png'],
    badge: 'STUDY MATERIALS',
    title: 'Forensic Resources & Handbooks',
    subtitle: 'Comprehensive Forensic Study Materials, Guides, Research Articles & Protocols',
    accentColor: '#10b981',
    iconSymbol: '📚'
  },
  {
    filenames: ['quiz.png', 'quizzes.png'],
    badge: 'WEEKLY CHALLENGES',
    title: 'Forensic Quizzes & Competitions',
    subtitle: 'Test Your Knowledge in DNA, Fingerprints & Cyber Forensics. Climb Live Leaderboards',
    accentColor: '#f59e0b',
    iconSymbol: '⚡'
  },
  {
    filenames: ['library.png', 'ebooks.png'],
    badge: 'E-LIBRARY ARCHIVE',
    title: 'Forensic Digital E-Library',
    subtitle: 'Access Digital Forensic Books, Journals, Research Papers & Educational Handbooks',
    accentColor: '#06b6d4',
    iconSymbol: '📖'
  },
  {
    filenames: ['podcast.png'],
    badge: 'EXPERT TALKS',
    title: 'ForenClue Forensic Podcast',
    subtitle: 'Deep-Dive Interviews with Veteran Crime Scene Investigators, Pathologists & Cyber Experts',
    accentColor: '#ec4899',
    iconSymbol: '🎙️'
  },
  {
    filenames: ['webinars.png', 'webinar.png'],
    badge: 'LIVE MASTERCLASSES',
    title: 'Forensic Science Webinars',
    subtitle: 'Attend Interactive Live Webinars, Cyber Crime Workshops & Expert Masterclasses',
    accentColor: '#f97316',
    iconSymbol: '🎥'
  },
  {
    filenames: ['simulation.png', 'simulations.png'],
    badge: '3D VIRTUAL LABS',
    title: 'Virtual Crime Scene Simulations',
    subtitle: 'Interactive Practical Simulations: Compound Microscopy, UV-Vis Spectrophotometry & Evidence Analysis',
    accentColor: '#14b8a6',
    iconSymbol: '🔬'
  },
  {
    filenames: ['certificate.png'],
    badge: 'AUTHENTICATION PORTAL',
    title: 'Verify Official Certificate',
    subtitle: 'Instantly Verify and Authenticate Official ForenClue Academic Certificates & Badges',
    accentColor: '#10b981',
    iconSymbol: '🎓'
  },
  {
    filenames: ['idcard.png', 'employees.png'],
    badge: 'VERIFICATION SYSTEM',
    title: 'Verify Official ID Card & Staff Badge',
    subtitle: 'Cryptographic Credential Authentication for Volunteers, Ambassadors, Scholars & Staff',
    accentColor: '#6366f1',
    iconSymbol: '🪪'
  },
  {
    filenames: ['team.png'],
    badge: 'MEET OUR TEAM',
    title: 'Meet The ForenClue Team',
    subtitle: 'The Founders, Forensic Scientists, Research Directors and Mentors Behind ForenClue',
    accentColor: '#3b82f6',
    iconSymbol: '👥'
  },
  {
    filenames: ['volunteers.png'],
    badge: 'YOUTH ALLIANCE',
    title: 'ForenClue Volunteer Network',
    subtitle: 'Our Nationwide Network of Passionate Volunteers Driving Forensic Science Education',
    accentColor: '#a855f7',
    iconSymbol: '🌟'
  },
  {
    filenames: ['ambassador.png', 'ambassadors.png'],
    badge: 'CAMPUS LEADERSHIP',
    title: 'Campus Ambassador Program',
    subtitle: 'Empowering Student Leaders Across Universities to Spearhead Forensic Awareness',
    accentColor: '#eab308',
    iconSymbol: '🏛️'
  },
  {
    filenames: ['about.png'],
    badge: 'MISSION & VISION',
    title: 'About ForenClue',
    subtitle: "Empowering Next-Generation Forensic Investigators and EdTech Innovation Across India",
    accentColor: '#f59e0b',
    iconSymbol: '🌐'
  },
  {
    filenames: ['careers.png'],
    badge: 'JOIN OUR TEAM',
    title: 'Careers & Internships at ForenClue',
    subtitle: 'Explore Research Roles, Forensic Internships, Mentorships & Career Opportunities',
    accentColor: '#0284c7',
    iconSymbol: '💼'
  },
  {
    filenames: ['contact.png'],
    badge: 'GET IN TOUCH',
    title: 'Contact ForenClue Support',
    subtitle: 'Reach Out to Support Teams, Corporate Partnerships & Academic Counseling',
    accentColor: '#64748b',
    iconSymbol: '✉️'
  },
  {
    filenames: ['privacy.png'],
    badge: 'LEGAL & DATA PROTECTION',
    title: 'Privacy Policy | ForenClue',
    subtitle: 'Comprehensive Overview of Data Privacy, Student Information Protection & Security Standards',
    accentColor: '#475569',
    iconSymbol: '🔒'
  },
  {
    filenames: ['terms.png'],
    badge: 'TERMS OF SERVICE',
    title: 'Terms of Service | ForenClue',
    subtitle: 'Official Terms, Academic Code of Conduct & Enrollment Conditions',
    accentColor: '#475569',
    iconSymbol: '📜'
  },
  {
    filenames: ['login.png'],
    badge: 'STUDENT PORTAL',
    title: 'Student & Specialist Sign In',
    subtitle: 'Access Your Enrolled Courses, Quiz Rankings, Certificates & Forensic Workspace',
    accentColor: '#f59e0b',
    iconSymbol: '🔑'
  },
  {
    filenames: ['dashboard.png', 'profile.png'],
    badge: 'WORKSPACE DASHBOARD',
    title: 'Student Progress & Workspace',
    subtitle: 'Manage Enrolled Masterclasses, Badges, Saved Resources & Community Discussions',
    accentColor: '#10b981',
    iconSymbol: '📊'
  },
  {
    filenames: ['microscope.png'],
    badge: '3D VIRTUAL LAB',
    title: 'Compound Microscope Simulator',
    subtitle: 'Interactive Optical Microscope Simulator for Specimen Magnification & Focal Analysis',
    accentColor: '#06b6d4',
    iconSymbol: '🔬'
  },
  {
    filenames: ['spectrophotometer.png'],
    badge: '3D VIRTUAL LAB',
    title: 'UV-Vis Spectrophotometer Simulator',
    subtitle: 'Quantitative Absorbance Profiling & Wavelength Analysis Laboratory Simulator',
    accentColor: '#8b5cf6',
    iconSymbol: '🧪'
  }
];

function generateSVG(config) {
  const { badge, title, subtitle, accentColor, iconSymbol } = config;
  
  // Escape XML characters
  const escapeXML = (str) =>
    str.replace(/&/g, '&amp;')
       .replace(/</g, '&lt;')
       .replace(/>/g, '&gt;')
       .replace(/"/g, '&quot;')
       .replace(/'/g, '&apos;');

  const safeTitle = escapeXML(title);
  const safeSubtitle = escapeXML(subtitle);
  const safeBadge = escapeXML(badge);

  return `
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Background Gradient -->
      <radialGradient id="bgGrad" cx="30%" cy="30%" r="90%">
        <stop offset="0%" stop-color="#151e32" />
        <stop offset="50%" stop-color="#090d16" />
        <stop offset="100%" stop-color="#04060a" />
      </radialGradient>

      <!-- Glow Accent Gradient -->
      <radialGradient id="glow" cx="85%" cy="15%" r="50%">
        <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.25" />
        <stop offset="100%" stop-color="${accentColor}" stop-opacity="0" />
      </radialGradient>

      <!-- Card Glass Gradient -->
      <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e293b" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#0f172a" stop-opacity="0.9" />
      </linearGradient>

      <!-- Grid Pattern -->
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" stroke-width="1" stroke-opacity="0.25" />
      </pattern>

      <!-- Accent Line Gradient -->
      <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${accentColor}" />
        <stop offset="100%" stop-color="#38bdf8" />
      </linearGradient>
    </defs>

    <!-- Base Canvas -->
    <rect width="1200" height="630" fill="url(#bgGrad)" />
    <rect width="1200" height="630" fill="url(#grid)" />
    <rect width="1200" height="630" fill="url(#glow)" />

    <!-- Top Neon Accent Bar -->
    <rect x="0" y="0" width="1200" height="6" fill="url(#accentGrad)" />

    <!-- Outer Frame Border -->
    <rect x="30" y="30" width="1140" height="570" rx="20" fill="none" stroke="${accentColor}" stroke-opacity="0.2" stroke-width="2" />

    <!-- Glassmorphism Main Content Container -->
    <rect x="60" y="60" width="1080" height="510" rx="24" fill="url(#cardGrad)" stroke="#334155" stroke-opacity="0.5" stroke-width="1.5" />

    <!-- Decorative Corner Markers (Forensic Grid Motif) -->
    <path d="M 80 100 L 80 80 L 100 80" fill="none" stroke="${accentColor}" stroke-width="3" />
    <path d="M 1120 100 L 1120 80 L 1100 80" fill="none" stroke="${accentColor}" stroke-width="3" />
    <path d="M 80 530 L 80 550 L 100 550" fill="none" stroke="${accentColor}" stroke-width="3" />
    <path d="M 1120 530 L 1120 550 L 1100 550" fill="none" stroke="${accentColor}" stroke-width="3" />

    <!-- Header Section: Logo & Badge -->
    <g transform="translate(100, 105)">
      <!-- ForenClue Brand Title -->
      <text x="0" y="28" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="28" fill="#ffffff" letter-spacing="2">
        FOREN<tspan fill="${accentColor}">CLUE</tspan>
      </text>

      <!-- Badge Pill -->
      <rect x="230" y="2" width="${safeBadge.length * 11 + 30}" height="32" rx="16" fill="${accentColor}" fill-opacity="0.15" stroke="${accentColor}" stroke-opacity="0.4" stroke-width="1" />
      <text x="${245}" y="23" font-family="monospace, sans-serif" font-weight="800" font-size="13" fill="${accentColor}" letter-spacing="1.5">
        ${safeBadge}
      </text>
    </g>

    <!-- Main Icon & Graphic Badge -->
    <g transform="translate(1000, 105)">
      <circle cx="0" cy="20" r="36" fill="${accentColor}" fill-opacity="0.12" stroke="${accentColor}" stroke-opacity="0.3" stroke-width="2" />
      <text x="0" y="29" font-family="sans-serif" font-size="32" text-anchor="middle">${iconSymbol}</text>
    </g>

    <!-- Divider Line -->
    <line x1="100" y1="165" x2="1100" y2="165" stroke="#334155" stroke-opacity="0.6" stroke-width="1" />

    <!-- Main Title -->
    <g transform="translate(100, 240)">
      <text x="0" y="0" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="44" fill="#ffffff" letter-spacing="-0.5">
        ${safeTitle.length > 42 ? safeTitle.substring(0, 42) + '...' : safeTitle}
      </text>
    </g>

    <!-- Subtitle / Description -->
    <g transform="translate(100, 315)">
      <text x="0" y="0" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="21" fill="#94a3b8" width="900">
        ${safeSubtitle}
      </text>
    </g>

    <!-- Bottom Footer Bar -->
    <g transform="translate(100, 485)">
      <!-- Domain Name -->
      <rect x="0" y="0" width="220" height="38" rx="10" fill="#0f172a" stroke="#334155" stroke-width="1" />
      <text x="110" y="24" font-family="monospace, sans-serif" font-weight="700" font-size="14" fill="#f8fafc" text-anchor="middle">
        www.forenclue.in
      </text>

      <!-- Verified Tag -->
      <g transform="translate(240, 0)">
        <rect x="0" y="0" width="260" height="38" rx="10" fill="#10b981" fill-opacity="0.1" stroke="#10b981" stroke-opacity="0.3" stroke-width="1" />
        <text x="130" y="24" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="13" fill="#34d399" text-anchor="middle" letter-spacing="0.5">
          ✓ INDIA'S FORENSIC HUB
        </text>
      </g>

      <!-- Bottom Right Accent -->
      <text x="1000" y="25" font-family="monospace, sans-serif" font-weight="700" font-size="12" fill="#64748b" text-anchor="end">
        OFFICIAL VERIFIED SHARE CARD
      </text>
    </g>
  </svg>
  `;
}

async function run() {
  console.log("Generating high-resolution (1200x630) OG PNG images...");

  for (const page of pages) {
    const svgStr = generateSVG(page);
    const resvg = new Resvg(svgStr, {
      fitTo: {
        mode: 'width',
        value: 1200,
      },
    });
    const imageBuffer = resvg.render().asPng();

    for (const filename of page.filenames) {
      for (const dir of outputDirs) {
        const filePath = path.join(dir, filename);
        fs.writeFileSync(filePath, imageBuffer);
        console.log(`✓ Saved ${filePath} (${imageBuffer.length} bytes)`);
      }
    }
  }

  console.log("All OG images successfully generated and stored!");
}

run().catch(err => {
  console.error("Error generating OG images:", err);
  process.exit(1);
});
