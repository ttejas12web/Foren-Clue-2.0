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
    title: "India's Premier Forensic Science & Cyber EdTech Platform",
    subtitle: "Cyber Forensics, Crime Scene Investigation, Digital Evidence, Research & Practical Learning",
    accentColor: '#f59e0b',
    iconSymbol: '🔍',
    tags: ['Cyber Forensics', 'Crime Scene Labs', 'DNA Profiling', 'Verified Certifications'],
    watermarkType: 'fingerprint'
  },
  {
    filenames: ['case-studies.png', 'cases.png'],
    badge: 'CASE ARCHIVES',
    title: 'Forensic Case Studies & Criminal Investigations',
    subtitle: 'Real Criminal Case Reconstruction, DNA Profiling, Trace Evidence & Digital Crime Analysis',
    accentColor: '#ef4444',
    iconSymbol: '📁',
    tags: ['Ballistics', 'Toxicology Report', 'Digital Evidence', 'Crime Reconstruction'],
    watermarkType: 'reticle'
  },
  {
    filenames: ['courses.png'],
    badge: 'ACADEMIC MASTERY',
    title: 'Forensic Science Masterclasses & Training',
    subtitle: 'Expert-Led Practical Courses in Fingerprint Lifting, Cyber Crime & DNA Analysis',
    accentColor: '#3b82f6',
    iconSymbol: '🎓',
    tags: ['Practical Modules', 'Expert Instructors', 'Lifetime Access', 'Skill Certification'],
    watermarkType: 'dna'
  },
  {
    filenames: ['services.png'],
    badge: 'CONSULTANCY & SOLUTIONS',
    title: 'Professional Forensic & Cyber Services',
    subtitle: 'Cyber Incident Response, Digital Investigations, Document Verification & Corporate Solutions',
    accentColor: '#2563eb',
    iconSymbol: '🛡️',
    tags: ['Cyber Incident', 'Document Auth', 'Expert Witness', 'Digital Footprint'],
    watermarkType: 'shield'
  },
  {
    filenames: ['community.png'],
    badge: 'PEER NETWORK',
    title: 'ForenClue Forensic Community Forum',
    subtitle: "Connect with India's Fastest Growing Network of Forensic Scholars, Analysts & Researchers",
    accentColor: '#8b5cf6',
    iconSymbol: '💬',
    tags: ['Doubt Clearance', 'Research Groups', 'Case Discussions', 'Peer Mentorship'],
    watermarkType: 'network'
  },
  {
    filenames: ['resources.png'],
    badge: 'STUDY MATERIALS',
    title: 'Forensic Resources & Reference Handbooks',
    subtitle: 'Comprehensive Forensic Study Materials, Lab Guides, Research Articles & Examination Protocols',
    accentColor: '#10b981',
    iconSymbol: '📚',
    tags: ['Lab Protocols', 'Study Guides', 'Standard Operating Procedures', 'Research Papers'],
    watermarkType: 'dna'
  },
  {
    filenames: ['quiz.png', 'quizzes.png'],
    badge: 'WEEKLY CHALLENGES',
    title: 'Forensic Science Quizzes & Competitions',
    subtitle: 'Test Your Knowledge in DNA, Fingerprints & Cyber Forensics. Climb Live National Leaderboards',
    accentColor: '#f59e0b',
    iconSymbol: '⚡',
    tags: ['Weekly Contests', 'Live Rankings', 'Interactive MCQs', 'Certificate Rewards'],
    watermarkType: 'reticle'
  },
  {
    filenames: ['library.png', 'ebooks.png'],
    badge: 'E-LIBRARY ARCHIVE',
    title: 'Forensic Digital E-Library & Reference Books',
    subtitle: 'Access Digital Forensic Books, Journals, Scientific Papers & Educational Handbooks',
    accentColor: '#06b6d4',
    iconSymbol: '📖',
    tags: ['PDF E-Books', 'Case Archives', 'Reference Books', 'Forensic Journals'],
    watermarkType: 'dna'
  },
  {
    filenames: ['podcast.png'],
    badge: 'EXPERT TALKS',
    title: 'ForenClue Forensic Science Podcast',
    subtitle: 'Deep-Dive Interviews with Veteran Crime Scene Investigators, Pathologists & Cyber Experts',
    accentColor: '#ec4899',
    iconSymbol: '🎙️',
    tags: ['Expert Interviews', 'Crime Analysis', 'Career Advice', 'Real Cases'],
    watermarkType: 'wave'
  },
  {
    filenames: ['webinars.png', 'webinar.png'],
    badge: 'LIVE MASTERCLASSES',
    title: 'Interactive Forensic Science Webinars',
    subtitle: 'Attend Live Webinars, Cyber Crime Workshops & Hands-on Masterclasses by Top Experts',
    accentColor: '#f97316',
    iconSymbol: '🎥',
    tags: ['Live Q&A', 'Hands-on Demos', 'Certificate of Participation', 'Expert Mentors'],
    watermarkType: 'reticle'
  },
  {
    filenames: ['simulation.png', 'simulations.png'],
    badge: '3D VIRTUAL LABS',
    title: 'Virtual Forensic Lab & Crime Scene Simulators',
    subtitle: 'Interactive Practical Simulations: Compound Microscopy, UV-Vis Spectrophotometry & Evidence Analysis',
    accentColor: '#14b8a6',
    iconSymbol: '🔬',
    tags: ['Optical Microscopy', 'UV-Vis Spectroscopy', '3D Lab Simulator', 'Evidence Handling'],
    watermarkType: 'lens'
  },
  {
    filenames: ['microscope.png'],
    badge: '3D VIRTUAL LAB',
    title: 'Virtual Compound Microscope Simulator',
    subtitle: 'Interactive Optical Microscope Simulator for Specimen Magnification & Focal Analysis',
    accentColor: '#06b6d4',
    iconSymbol: '🔬',
    tags: ['Specimen Slides', 'Magnification Controls', 'Coarse & Fine Focus', 'Epidermis & Pollen'],
    watermarkType: 'lens'
  },
  {
    filenames: ['spectrophotometer.png'],
    badge: '3D VIRTUAL LAB',
    title: 'UV-Vis Spectrophotometer Simulator',
    subtitle: 'Quantitative Absorbance Profiling & Wavelength Analysis Laboratory Simulator',
    accentColor: '#8b5cf6',
    iconSymbol: '🧪',
    tags: ['Wavelength Calibration', 'Absorbance Spectrum', 'Cuvette Selection', 'Chemical Analysis'],
    watermarkType: 'lens'
  },
  {
    filenames: ['certificate.png'],
    badge: 'AUTHENTICATION PORTAL',
    title: 'Verify Official ForenClue Certificate',
    subtitle: 'Instantly Verify and Authenticate Official ForenClue Academic Certificates & Credentials',
    accentColor: '#10b981',
    iconSymbol: '🎓',
    tags: ['Cryptographic Verification', 'Instant Lookup', 'Official Badge', 'Shareable Credential'],
    watermarkType: 'seal'
  },
  {
    filenames: ['idcard.png', 'employees.png'],
    badge: 'VERIFICATION SYSTEM',
    title: 'Verify Official ID Card & Staff Credential',
    subtitle: 'Cryptographic Credential Authentication for Volunteers, Ambassadors, Scholars & Staff',
    accentColor: '#6366f1',
    iconSymbol: '🪪',
    tags: ['Staff Verification', 'Volunteer Badges', 'Ambassador ID', 'Security Clearance'],
    watermarkType: 'seal'
  },
  {
    filenames: ['team.png'],
    badge: 'MEET OUR TEAM',
    title: 'Meet The Leaders Behind ForenClue',
    subtitle: 'Founders, Forensic Scientists, Research Directors and Mentors Pioneering EdTech Innovation',
    accentColor: '#3b82f6',
    iconSymbol: '👥',
    tags: ['Forensic Mentors', 'Research Board', 'EdTech Leaders', 'Academic Advisory'],
    watermarkType: 'network'
  },
  {
    filenames: ['volunteers.png'],
    badge: 'YOUTH ALLIANCE',
    title: 'ForenClue Nationwide Volunteer Network',
    subtitle: 'Our Nationwide Network of Passionate Volunteers Driving Forensic Science Education',
    accentColor: '#a855f7',
    iconSymbol: '🌟',
    tags: ['Youth Leadership', 'Community Outreach', 'Forensic Awareness', 'Social Impact'],
    watermarkType: 'network'
  },
  {
    filenames: ['ambassador.png', 'ambassadors.png'],
    badge: 'CAMPUS LEADERSHIP',
    title: 'ForenClue Campus Ambassador Program',
    subtitle: 'Empowering Student Leaders Across Universities to Spearhead Forensic Awareness & Events',
    accentColor: '#eab308',
    iconSymbol: '🏛️',
    tags: ['University Leaders', 'Campus Events', 'Student Network', 'Leadership Recognition'],
    watermarkType: 'seal'
  },
  {
    filenames: ['about.png'],
    badge: 'MISSION & VISION',
    title: 'About ForenClue EdTech Platform',
    subtitle: "Empowering Next-Generation Forensic Investigators and EdTech Innovation Across India",
    accentColor: '#f59e0b',
    iconSymbol: '🌐',
    tags: ['Mission & Vision', 'Forensic Education', 'Cyber Training', 'EdTech Pioneer'],
    watermarkType: 'fingerprint'
  },
  {
    filenames: ['careers.png'],
    badge: 'JOIN OUR TEAM',
    title: 'Careers & Internships at ForenClue',
    subtitle: 'Explore Research Roles, Forensic Internships, Mentorships & EdTech Opportunities',
    accentColor: '#0284c7',
    iconSymbol: '💼',
    tags: ['Forensic Internships', 'Research Positions', 'Remote Opportunities', 'Career Growth'],
    watermarkType: 'network'
  },
  {
    filenames: ['contact.png'],
    badge: 'GET IN TOUCH',
    title: 'Contact ForenClue Support & Help Center',
    subtitle: 'Reach Out to Support Teams, Corporate Partnerships & Academic Counseling Divisions',
    accentColor: '#64748b',
    iconSymbol: '✉️',
    tags: ['Student Support', 'Corporate Inquiries', 'Academic Counseling', 'Direct Contact'],
    watermarkType: 'network'
  },
  {
    filenames: ['privacy.png'],
    badge: 'LEGAL & PROTECTION',
    title: 'Privacy Policy & Student Data Protection',
    subtitle: 'Comprehensive Overview of Data Privacy, Student Information Security & Standards',
    accentColor: '#475569',
    iconSymbol: '🔒',
    tags: ['Data Security', 'Student Rights', 'SSL Encryption', 'GDPR Compliance'],
    watermarkType: 'shield'
  },
  {
    filenames: ['terms.png'],
    badge: 'TERMS OF SERVICE',
    title: 'Terms of Service & Code of Conduct',
    subtitle: 'Official Terms, Academic Code of Conduct & Certification Enrollment Conditions',
    accentColor: '#475569',
    iconSymbol: '📜',
    tags: ['Academic Terms', 'User Guidelines', 'Certificate Policies', 'Legal Standards'],
    watermarkType: 'shield'
  },
  {
    filenames: ['login.png'],
    badge: 'STUDENT PORTAL',
    title: 'Student & Specialist Secure Sign In',
    subtitle: 'Access Your Enrolled Courses, Quiz Rankings, Certificates & Forensic Workspace',
    accentColor: '#f59e0b',
    iconSymbol: '🔑',
    tags: ['Student Login', 'Specialist Access', 'Dashboard Portal', 'Secure Auth'],
    watermarkType: 'reticle'
  },
  {
    filenames: ['dashboard.png', 'profile.png'],
    badge: 'WORKSPACE DASHBOARD',
    title: 'Student Workspace & Progress Dashboard',
    subtitle: 'Manage Enrolled Masterclasses, Badges, Saved Resources & Community Discussions',
    accentColor: '#10b981',
    iconSymbol: '📊',
    tags: ['Course Progress', 'Earned Badges', 'Saved Resources', 'Personal Workspace'],
    watermarkType: 'network'
  }
];

function wrapText(text, maxChars = 36) {
  const words = text.split(' ');
  const lines = [];
  let current = '';

  for (const w of words) {
    if ((current + ' ' + w).trim().length <= maxChars) {
      current = (current + ' ' + w).trim();
    } else {
      if (current) lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function renderWatermark(type, accentColor) {
  if (type === 'fingerprint') {
    return `
      <g opacity="0.12" stroke="${accentColor}" fill="none" stroke-width="2.5">
        <path d="M 900 220 A 80 80 0 0 1 1060 220 A 80 120 0 0 1 920 310" />
        <path d="M 920 220 A 60 60 0 0 1 1040 220 A 60 100 0 0 1 940 300" />
        <path d="M 940 220 A 40 40 0 0 1 1020 220 A 40 80 0 0 1 960 280" />
        <path d="M 960 220 A 20 20 0 0 1 1000 220 A 20 50 0 0 1 980 260" />
      </g>
    `;
  }
  if (type === 'dna') {
    return `
      <g opacity="0.12" stroke="${accentColor}" fill="none" stroke-width="2">
        <path d="M 920 160 Q 970 240 1020 320 T 1120 480" />
        <path d="M 1020 160 Q 970 240 920 320 T 820 480" />
        <line x1="930" y1="200" x2="1010" y2="200" stroke-width="3" />
        <line x1="950" y1="260" x2="990" y2="260" stroke-width="3" />
        <line x1="930" y1="320" x2="1010" y2="320" stroke-width="3" />
        <line x1="890" y1="380" x2="1050" y2="380" stroke-width="3" />
      </g>
    `;
  }
  if (type === 'lens') {
    return `
      <g opacity="0.14" stroke="${accentColor}" fill="none" stroke-width="2">
        <circle cx="980" cy="270" r="110" stroke-width="3" />
        <circle cx="980" cy="270" r="75" stroke-dasharray="6,6" />
        <circle cx="980" cy="270" r="40" stroke-width="2" />
        <line x1="980" y1="130" x2="980" y2="410" stroke-dasharray="4,4" />
        <line x1="840" y1="270" x2="1120" y2="270" stroke-dasharray="4,4" />
      </g>
    `;
  }
  if (type === 'shield') {
    return `
      <g opacity="0.12" stroke="${accentColor}" fill="none" stroke-width="3">
        <path d="M 920 180 L 1040 180 L 1040 280 Q 1040 370 980 410 Q 920 370 920 280 Z" />
        <path d="M 945 205 L 1015 205 L 1015 275 Q 1015 345 980 375 Q 945 345 945 275 Z" stroke-width="1.5" />
      </g>
    `;
  }
  if (type === 'seal') {
    return `
      <g opacity="0.14" stroke="${accentColor}" fill="none" stroke-width="2">
        <circle cx="980" cy="270" r="95" stroke-width="3" />
        <polygon points="980,190 995,230 1035,230 1005,255 1018,295 980,270 942,295 955,255 925,230 965,230" fill="${accentColor}" fill-opacity="0.1" />
      </g>
    `;
  }
  if (type === 'wave') {
    return `
      <g opacity="0.15" fill="${accentColor}">
        <rect x="910" y="220" width="10" height="100" rx="5" />
        <rect x="930" y="180" width="10" height="180" rx="5" />
        <rect x="950" y="240" width="10" height="60" rx="5" />
        <rect x="970" y="150" width="10" height="240" rx="5" />
        <rect x="990" y="200" width="10" height="140" rx="5" />
        <rect x="1010" y="230" width="10" height="80" rx="5" />
        <rect x="1030" y="190" width="10" height="160" rx="5" />
      </g>
    `;
  }
  // Default reticle
  return `
    <g opacity="0.12" stroke="${accentColor}" fill="none" stroke-width="2">
      <circle cx="980" cy="270" r="90" stroke-width="2.5" />
      <circle cx="980" cy="270" r="50" stroke-dasharray="5,5" />
      <line x1="980" y1="150" x2="980" y2="390" stroke-width="2" />
      <line x1="860" y1="270" x2="1100" y2="270" stroke-width="2" />
    </g>
  `;
}

function generateSVG(config) {
  const { badge, title, subtitle, accentColor, iconSymbol, tags, watermarkType } = config;
  
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

  const titleLines = wrapText(safeTitle, 36);

  let tagElementsSVG = '';
  if (tags && tags.length > 0) {
    let currentX = 0;
    tagElementsSVG = tags.map((t) => {
      const safeT = escapeXML(t);
      const width = safeT.length * 8 + 24;
      const x = currentX;
      currentX += width + 12;
      return `
        <g transform="translate(${x}, 0)">
          <rect x="0" y="0" width="${width}" height="28" rx="14" fill="#1e293b" fill-opacity="0.8" stroke="${accentColor}" stroke-opacity="0.3" stroke-width="1" />
          <text x="${width / 2}" y="18" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="11" fill="#cbd5e1" text-anchor="middle">
            ${safeT}
          </text>
        </g>
      `;
    }).join('');
  }

  return `
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Background Radial Gradient -->
      <radialGradient id="bgGrad" cx="30%" cy="30%" r="90%">
        <stop offset="0%" stop-color="#111827" />
        <stop offset="60%" stop-color="#090d16" />
        <stop offset="100%" stop-color="#030712" />
      </radialGradient>

      <!-- Glow Accent Gradient -->
      <radialGradient id="glow" cx="85%" cy="20%" r="55%">
        <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.22" />
        <stop offset="100%" stop-color="${accentColor}" stop-opacity="0" />
      </radialGradient>

      <!-- Card Glass Gradient -->
      <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e293b" stop-opacity="0.85" />
        <stop offset="100%" stop-color="#0f172a" stop-opacity="0.92" />
      </linearGradient>

      <!-- Grid Pattern -->
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" stroke-width="1" stroke-opacity="0.2" />
      </pattern>

      <!-- Accent Line Gradient -->
      <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${accentColor}" />
        <stop offset="100%" stop-color="#38bdf8" />
      </linearGradient>
    </defs>

    <!-- Base Canvas Background -->
    <rect width="1200" height="630" fill="url(#bgGrad)" />
    <rect width="1200" height="630" fill="url(#grid)" />
    <rect width="1200" height="630" fill="url(#glow)" />

    <!-- Top Neon Accent Bar -->
    <rect x="0" y="0" width="1200" height="6" fill="url(#accentGrad)" />

    <!-- Outer Frame Reticle Border -->
    <rect x="30" y="30" width="1140" height="570" rx="20" fill="none" stroke="${accentColor}" stroke-opacity="0.25" stroke-width="1.5" />

    <!-- Main Glassmorphism Card Container -->
    <rect x="55" y="55" width="1090" height="520" rx="22" fill="url(#cardGrad)" stroke="#334155" stroke-opacity="0.6" stroke-width="1.5" />

    <!-- Forensic Reticle Corner Markers -->
    <path d="M 75 95 L 75 75 L 95 75" fill="none" stroke="${accentColor}" stroke-width="3" stroke-linecap="round" />
    <path d="M 1125 95 L 1125 75 L 1105 75" fill="none" stroke="${accentColor}" stroke-width="3" stroke-linecap="round" />
    <path d="M 75 535 L 75 555 L 95 555" fill="none" stroke="${accentColor}" stroke-width="3" stroke-linecap="round" />
    <path d="M 1125 535 L 1125 555 L 1105 555" fill="none" stroke="${accentColor}" stroke-width="3" stroke-linecap="round" />

    <!-- Domain-Specific Visual Watermark Motif -->
    ${renderWatermark(watermarkType, accentColor)}

    <!-- Header Section: Brand Logo & Badge Pill -->
    <g transform="translate(95, 100)">
      <!-- ForenClue Logo -->
      <text x="0" y="28" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="28" fill="#ffffff" letter-spacing="2">
        FOREN<tspan fill="${accentColor}">CLUE</tspan>
      </text>

      <!-- Badge Pill -->
      <rect x="230" y="2" width="${safeBadge.length * 10 + 28}" height="32" rx="16" fill="${accentColor}" fill-opacity="0.15" stroke="${accentColor}" stroke-opacity="0.45" stroke-width="1" />
      <text x="${244}" y="22" font-family="monospace, sans-serif" font-weight="800" font-size="12" fill="${accentColor}" letter-spacing="1.5">
        ${safeBadge}
      </text>
    </g>

    <!-- Top Right Medallion Icon -->
    <g transform="translate(1010, 100)">
      <circle cx="0" cy="18" r="36" fill="${accentColor}" fill-opacity="0.15" stroke="${accentColor}" stroke-opacity="0.4" stroke-width="2" />
      <text x="0" y="27" font-family="sans-serif" font-size="32" text-anchor="middle">${iconSymbol}</text>
    </g>

    <!-- Header Horizontal Line -->
    <line x1="95" y1="158" x2="1105" y2="158" stroke="#334155" stroke-opacity="0.5" stroke-width="1" />

    <!-- Wrapped Main Title -->
    <g transform="translate(95, 220)">
      ${titleLines.map((line, index) => `
        <text x="0" y="${index * 52}" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="${titleLines.length > 1 ? '40' : '44'}" fill="#ffffff" letter-spacing="-0.5">
          ${line}
        </text>
      `).join('')}
    </g>

    <!-- Subtitle / Description -->
    <g transform="translate(95, ${220 + titleLines.length * 52 + 10})">
      <text x="0" y="0" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="20" fill="#94a3b8" width="900">
        ${safeSubtitle}
      </text>
    </g>

    <!-- Domain Tags Pill Bar -->
    <g transform="translate(95, ${220 + titleLines.length * 52 + 55})">
      ${tagElementsSVG}
    </g>

    <!-- Footer Section -->
    <g transform="translate(95, 495)">
      <!-- Domain Name Pill -->
      <rect x="0" y="0" width="210" height="38" rx="10" fill="#0f172a" stroke="#334155" stroke-width="1" />
      <text x="105" y="24" font-family="monospace, sans-serif" font-weight="700" font-size="14" fill="#f8fafc" text-anchor="middle">
        www.forenclue.in
      </text>

      <!-- Verified Hub Pill -->
      <g transform="translate(225, 0)">
        <rect x="0" y="0" width="250" height="38" rx="10" fill="#10b981" fill-opacity="0.12" stroke="#10b981" stroke-opacity="0.35" stroke-width="1" />
        <text x="125" y="24" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="12" fill="#34d399" text-anchor="middle" letter-spacing="0.5">
          ✓ INDIA'S FORENSIC HUB
        </text>
      </g>

      <!-- Official Share Tag -->
      <text x="1010" y="24" font-family="monospace, sans-serif" font-weight="700" font-size="11" fill="#64748b" text-anchor="end" letter-spacing="1">
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
