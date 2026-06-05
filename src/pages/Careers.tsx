import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import { 
  motion, 
  AnimatePresence 
} from "motion/react";
import { 
  Camera, 
  Dna, 
  FlaskConical, 
  Binary, 
  Search, 
  Award, 
  Briefcase, 
  Compass, 
  ChevronRight, 
  ChevronDown, 
  TrendingUp, 
  MapPin, 
  Sparkles, 
  Clock, 
  BookOpen, 
  UserCheck, 
  AlertCircle, 
  RefreshCw, 
  PlayCircle, 
  ArrowRight,
  Shield,
  FileText,
  BookmarkCheck,
  CheckCircle2,
  Lock,
  Compass as CompassIcon,
  HelpCircle,
  FileSpreadsheet
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { DNAViewer } from "@/components/ui/ThreeDElement";
import { SEO } from "@/components/layout/SEO";

// Define TypeScript interfaces for our Career Roadmaps
interface Milestone {
  id: string;
  name: string;
  focus: string;
  duration: string;
  education: string;
  skills: string[];
  checklist: string[];
  expertTip: string;
}

interface ToolkitItem {
  name: string;
  purpose: string;
}

interface CareerTrack {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  description: string;
  salaryRange: string;
  demandLevel: 'Critically High' | 'High' | 'Growing';
  primarySOP: string;
  toolkit: ToolkitItem[];
  milestones: Milestone[];
}

export default function Careers() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Selected career track tab state
  const [activeTab, setActiveTab] = useState<string>('csi');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Quiz states
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [quizStep, setQuizStep] = useState<number>(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [quizRecommendation, setQuizRecommendation] = useState<string | null>(null);

  // Milestone expansion state: maps milestone ID to boolean
  const [expandedMilestones, setExpandedMilestones] = useState<Record<string, boolean>>({
    'csi_1': true, // Expand first step by default
    'dna_1': true,
    'tox_1': true,
    'digital_1': true
  });

  // Checklist completion states: maps `${userId}_${trackId}_${milestoneId}_${checkIndex}` -> boolean
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

  // Loading persisted state
  useEffect(() => {
    const userId = user?.uid || 'guest';
    const saved = localStorage.getItem(`forenclue_career_progress_${userId}`);
    if (saved) {
      try {
        setCompletedItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse career progress:", e);
      }
    }
  }, [user]);

  // Toggle item completion
  const handleToggleItem = (trackId: string, milestoneId: string, checkIndex: number) => {
    const userId = user?.uid || 'guest';
    const key = `${userId}_${trackId}_${milestoneId}_${checkIndex}`;
    const updated = {
      ...completedItems,
      [key]: !completedItems[key]
    };
    setCompletedItems(updated);
    localStorage.setItem(`forenclue_career_progress_${userId}`, JSON.stringify(updated));
  };

  // Toggle milestone expand/collapse
  const toggleMilestone = (id: string) => {
    setExpandedMilestones(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Static Career Roadmap Dataset
  const careerTracks: CareerTrack[] = useMemo(() => [
    {
      id: 'csi',
      title: 'Crime Scene Investigator (CSI)',
      icon: Camera,
      description: 'Master clean physical evidence collection, forensic photography, and trace evidence reconstruction protocols at raw incident venues.',
      salaryRange: '₹3.6L - ₹8.5L / year (Entry to Mid)',
      demandLevel: 'Critically High',
      primarySOP: 'ISO/IEC 17020 Crime Scene Investigation Standards',
      toolkit: [
        { name: 'Ninhydrin Formulation', purpose: 'For revealing latent friction ridge patterns on porous papers' },
        { name: 'Electrostatic Dust Lifter', purpose: 'Retrieving faint footmarks from tile/carpet surfaces via static charge' },
        { name: 'Forensic ALS (Alternate Light Source)', purpose: 'Illuminating trace biological fluids like semen and saliva using specialized wavelengths' },
        { name: 'Photo Evidence Scale markers', purpose: 'Accurate scale calculations for bullet trajectories and blood drop photography' }
      ],
      milestones: [
        {
          id: 'csi_1',
          name: 'Academic Foundation & Criminology Basics',
          focus: 'Build solid understanding of crime scene preservation laws and basic anatomy.',
          duration: '3 Years (Undergrad)',
          education: 'B.Sc. in Forensic Science or Criminology/General Biology',
          skills: ['Chain of custody regulations', 'Criminal legal codes (IPC / CrPC / IEA foundations)', 'Evidence decontamination rules'],
          checklist: [
            'Secure a registered B.Sc. in Forensic Science with a strong focus on physical evidence.',
            'Read the foundational DFSS (Directorate of Forensic Science Services) Standard Operating Manuals.',
            'Maintain laboratory notebooks explaining sterile forensic collection techniques.'
          ],
          expertTip: 'In crime scenes, preservation beats analysis. One single boot imprint contaminated can ruin a state prosecution case.'
        },
        {
          id: 'csi_2',
          name: 'Fingerprint Recovery & Biological Fluid Detection',
          focus: 'Master latent ridge development and presumptive chemical testing.',
          duration: '3-6 Months',
          education: 'ForenClue Intermediate Certs / Analytical Workshops',
          skills: ['Cyanoacrylate fuming', 'Kastle-Meyer chemical assays', 'Alternate Light Source (ALS) wavelength manipulation'],
          checklist: [
            'Complete the ForenClue Latent Fingerprint Processing & Dactyloscopy Workshop.',
            'Conduct hand-on fuming protocols using cyanoacrylate on non-porous mock evidence.',
            'Pass the standard Kastle-Meyer blood identification validation test.'
          ],
          expertTip: 'Luminol is a presumptive test. Remember that copper and bleach can create false positives—always follow up with confirmatory tests.'
        },
        {
          id: 'csi_3',
          name: 'Advanced Trajectory & Bloodstain Pattern Analysis',
          focus: 'Reconstruct physical scene equations like angles of impact and firing paths.',
          duration: '6 Months',
          education: 'Professional Specialization and Hands-on Seminars',
          skills: ['Trigonometric blood trajectory calculations', 'Laser scanning (FARO/Leica systems)', '3D Scene modeling'],
          checklist: [
            'Master trigonometric calculations of bloodstain impact angles (sine function equations).',
            'Perform stringing exercises to reconstruct converging point-sources for medium-velocity spatters.',
            'Learn to construct custom 3D scene blueprints using CAD or isometric reconstruction tools.'
          ],
          expertTip: 'Always document the ceiling and underneath furniture elements. Droplets often ricochet, revealing true struggle sequences.'
        },
        {
          id: 'csi_4',
          name: 'Inquest Internships & Mock testimonies',
          focus: 'Practical exposure under state laboratory officers and mock court sessions.',
          duration: '3-4 Months',
          education: 'State Laboratory (FSL) Internship / Court Simulation Program',
          skills: ['Legal inquest report writing', 'Moot court testimony representation', 'Cross-examination defense'],
          checklist: [
            'Secure an internship at a State or Regional Forensic Science Laboratory (FSL) physical division.',
            'Co-draft three complete mock Crime Scene Inquest report files.',
            'Participate in a moot court exercise defending an evidence chain-of-custody report.'
          ],
          expertTip: 'Faced with tough court lawyers, stick strictly to the empirical evidence notes. Saying "I do not know, but my notes show..." is a heavy defense.'
        },
        {
          id: 'csi_5',
          name: 'Board Certifications & Government Launch',
          focus: 'Clear aptitude exams to qualify for official physical forensic scientist vacancies.',
          duration: '6 Months',
          education: 'FACT (Forensic Aptitude Test) / Civil Board Reviews',
          skills: ['Fact exam preparation', 'Job portfolio compiling', 'FSL recruitment drills'],
          checklist: [
            'Prepare and register for the national FACT (Forensic Aptitude and Caliber Test) - physical sciences branch.',
            'Package your verified, high-contrast evidence-processing portfolio.',
            'Apply to active Junior Scientific Assistant (JSA) or Scientific Officer roles in central/regional laboratories.'
          ],
          expertTip: 'Government vacancies are highly competitive but extremely rewarding. High FACT score coupled with a robust digital portfolio will elevate you.'
        }
      ]
    },
    {
      id: 'dna',
      title: 'Forensic DNA Expert',
      icon: Dna,
      description: 'Acquire precise skills in extracting human genomic profiles, running multiplex PCR amplification, and analyzing STR statistics.',
      salaryRange: '₹4.2L - ₹11.0L / year (Mid to Senior)',
      demandLevel: 'High',
      primarySOP: 'SWGDAM (Scientific Working Group on DNA Analysis Methods)',
      toolkit: [
        { name: 'Magnetic Bead Extractor', purpose: 'For high-purity isolation of genomic DNA from compromised bone or fluid swabs' },
        { name: 'Genetic Analyzer Capillary Array', purpose: 'Running multi-color laser separation of short tandem repeat fragments' },
        { name: 'qPCR Thermal Cycler', purpose: 'Quantitating minute amounts of DNA before expensive STR multiplexing' },
        { name: 'CODIS Database Software', purpose: 'To compare suspect profiles against national databases matching felon indexes' }
      ],
      milestones: [
        {
          id: 'dna_1',
          name: 'Molecular Genetics & Laboratory Hygiene',
          focus: 'Master hereditary biology, genetics chemistry, and contamination-free operations.',
          duration: '3 Years (Undergrad)',
          education: 'B.Sc. in Biotechnology, Microbiology, or Biochemistry',
          skills: ['Sterile PCR operations', 'Mendelian frequency principles', 'Recombinant DNA history'],
          checklist: [
            'Perform cell biology and genomic structure coursework under academic tutors.',
            'Establish total hygiene control protocols to block ambient skin-DNA contamination.',
            'Understand theoretical histories of RFLP (Restriction Fragment) profiling versus dynamic PCR STR profiling.'
          ],
          expertTip: 'In the DNA lab, your own breath is the enemy. Always triple-mask, use barrier tips, and work facing the laminar flow hood.'
        },
        {
          id: 'dna_2',
          name: 'DNA Isolation & Real-Time Quantitation',
          focus: 'Safely recover trace DNA amounts and evaluate their absolute purity.',
          duration: '4 Months',
          education: 'ForenClue Lab Immersion Program',
          skills: ['Organic extraction', 'Magnetic bead extraction', 'qPCR estimation curves'],
          checklist: [
            'Learn to extract whole DNA from difficult materials like teeth, single hairs, or old stains.',
            'Understand real-time quantitative PCR (qPCR) to determine concentrations (ng/µL).',
            'Master spectrophotometric assessment (e.g., NanoDrop 260/280 ratio checks).'
          ],
          expertTip: 'Low template DNA (<100 picograms) can show massive PCR mutations like peak dropouts and stutters. Accurately estimate your quantities.'
        },
        {
          id: 'dna_3',
          name: 'STR Multiplex Amplification & Capillary Electrophoresis',
          focus: 'Amplify variable loci and separate them on modern high-end laser systems.',
          duration: '6 Months',
          education: 'Specialized Instruments Training',
          skills: ['Multiplex thermal PCR setups', 'Capillary array calibration', 'ABI 3500 series console operations'],
          checklist: [
            'Complete the ForenClue Molecular Profiling and Electrophoresis certification.',
            'Analyze electropherograms to isolate peak height thresholds and signal-to-noise ratios.',
            'Learn to identify peak artifacts like local pull-ups, -4bp stutters, and polymerase dye-blobs.'
          ],
          expertTip: 'Stutter peaks typically appear one full repeat unit shorter than the true allele. Use software sizing filters but visually verify them.'
        },
        {
          id: 'dna_4',
          name: 'Statistical Probability Analysis & CODIS Logic',
          focus: 'Calculate random match probabilities and process complex bi-parental mixtures.',
          duration: '5 Months',
          education: 'Biostatistics & Profile Database Seminars',
          skills: ['Likelihood Ratio (LR) models', 'Combined Probability of Inclusion (CPI)', 'STR population frequency sets'],
          checklist: [
            'Master biostatistical calculations for alleles using Hardy-Weinberg equilibrium values.',
            'Perform mixture interpretation studies with multiple contributors using Likelihood Ratio equations.',
            'Explore local database uploading protocols matching CODIS standards.'
          ],
          expertTip: 'Never declare "The DNA belongs to the suspect". Always present it as: "The probability that a random person matches is 1 in several billions." It holds much better.'
        },
        {
          id: 'dna_5',
          name: 'ISO 17025 Auditing & Laboratory Certification',
          focus: 'Ensure strict laboratory operations aligning with global credentialing agencies.',
          duration: '6 Months',
          education: 'ISO/IEC 17025 Compliance Training',
          skills: ['SOP validation protocols', 'Quality assurance reporting', 'Lab peer review audits'],
          checklist: [
            'Study NABL/ISO/IEC 17025 guidelines for testing and calibration laboratories.',
            'Participate in a complete laboratory audit roleplay, checking chemical logs and temperatures.',
            'Pass mock biological laboratory analyst board panels during career placement campaigns.'
          ],
          expertTip: 'ISO certification is non-negotiable. Forensic labs rely on absolute system audits. Undergoing quality certification will triple your starting salary potential.'
        }
      ]
    },
    {
      id: 'tox',
      title: 'Forensic Toxicologist',
      icon: FlaskConical,
      description: 'Acquire high-tech analytical skills to detect chemical poisons, heavy metals, drug overdoses, and toxic fluids in post-mortem specimens.',
      salaryRange: '₹3.9L - ₹9.6L / year (Entry to Senior)',
      demandLevel: 'High',
      primarySOP: 'SOFT/AAFS Forensic Toxicology Laboratory Guidelines',
      toolkit: [
        { name: 'GC-MS (Gas Chromatograph Mass Spec)', purpose: 'The ultimate standard for absolute chemical structure identification in blood samples' },
        { name: 'HPLC (High Perf Liquid Chromatography)', purpose: 'For non-volatile, heat-sensitive compounds and therapeutic drug monitors' },
        { name: 'SPE Columns (Solid Phase Extraction)', purpose: 'Purifying serum or urine by capturing specific drug factions on solid silica sorbents' },
        { name: 'Reinsch Test Kit', purpose: 'Rapid color assay for quick heavy metal (arsenic, bismuth, antimony) screens' }
      ],
      milestones: [
        {
          id: 'tox_1',
          name: 'Analytical Chemistry & Pharmacology',
          focus: 'Acquire skills in organic molecule properties and chemical toxicity pathways.',
          duration: '3 Years (Undergrad)',
          education: 'B.Sc. in Chemistry, Pharmacology, or Pharmaceutical Chemistry',
          skills: ['Toxicokinetics & absorption models', 'Heavy metal chemistry', 'Poison pathways'],
          checklist: [
            'Obtain a solid B.Sc. focusing heavily on Organic Chemistry and Biochemistry.',
            'Study lethal dosage measurements (LD50 and LC50 limits) for standard chemical agencies.',
            'Explore safe laboratory material protocols for organic solvents and carcinogens.'
          ],
          expertTip: 'Always understand target organs. Metals love the kidneys and hair, while volatile organic solvents are highly concentrated in brain lipids.'
        },
        {
          id: 'tox_2',
          name: 'Sample Isolation & Chromatographic Cleanup',
          focus: 'Isolate trace chemical toxins from bulky biological fats and proteins.',
          duration: '4 Months',
          education: 'ForenClue Instrumental Prep Course',
          skills: ['Liquid-Liquid Extraction (LLE)', 'Solid-Phase Extraction (SPE) cartridges', 'Thin-Layer Chromatography (TLC)'],
          checklist: [
            'Learn to digest liver and stomach tissues using acidic/alkaline enzymatic extractions.',
            'Practice loading SPE columns, optimizing wash volumes, and maximizing chemical yield.',
            'Verify active separation limits using simple Thin-Layer Chromatography techniques.'
          ],
          expertTip: 'If your sample cleanup is dirty, your GC-MS column will clog in under 5 runs. The secret to toxicology is immaculate initial sample preparation.'
        },
        {
          id: 'tox_3',
          name: 'Spectroscopy & Mass Spectrometry',
          focus: 'Read and operate high-powered gas and liquid chromatography instrumentation panels.',
          duration: '8 Months',
          education: 'Chromatography Lab Certification',
          skills: ['GC-MS column installation', 'Target compound spectrum identification (m/z lines)', 'HPLC solvent preparation'],
          checklist: [
            'Learn to run gas chromatographs, checking carrier gas pressures and injector temperature profiles.',
            'Compare fragmentation spectrometry outputs against official NIST mass spectral library databases.',
            'Obtain the ForenClue Advanced Analytical Chromatography certification.'
          ],
          expertTip: 'GC matching with retention times is great, but Mass Spec outputs represent absolute scientific proof. Master reading the fragmentation peak ratios.'
        },
        {
          id: 'tox_4',
          name: 'Post-Mortem Autopsy Chemistry interpretation',
          focus: 'Correlate chemical concentrations back to cause-of-death sequences.',
          duration: '5 Months',
          education: 'FSL Post-Mortem casework research guidance',
          skills: ['Postmortem redistribution calculations', 'Ethanol fermentation vs death ratios', 'Heavy metal poisoning profiles'],
          checklist: [
            'Study postmortem drug redistribution (PMR) dynamics where blood levels rise after death.',
            'Identify chemical indicators showing active carbon monoxide vs postmortem flame exposure.',
            'Co-analyze five medical-legal cases involving alleged organophosphate poisoning.'
          ],
          expertTip: 'Be careful with femoral vs cardiac blood values. Cardiac blood PMR is notoriously unreliable because drugs leak outward from the stomach core.'
        },
        {
          id: 'tox_5',
          name: 'Legal Reporting & Expert Board Panel Clears',
          focus: 'Pass state toxicologist credentials and represent chemistry findings in courts.',
          duration: '4 Months',
          education: 'National Toxicology Boards (e.g., FACT Chem or equivalent FSL Exams)',
          skills: ['Expert chemical reports compilation', 'Courtroom defense of instrumentation', 'FSL toxicologist exam prep'],
          checklist: [
            'Prepare and clear the FACT (Forensic Aptitude Test) - Chemical and Toxicological Sciences core.',
            'Compile complete analytical case reports presenting GC-MS graphs and validation files.',
            'Apply to FSL Forensic Toxicology Scientific Officer slots or medical exam centers.'
          ],
          expertTip: 'A Toxicologist in court faces challenges on calibration. Always keep your calibration curve certificates, and know your limits of detection.'
        }
      ]
    },
    {
      id: 'digital',
      title: 'Digital Forensics Expert',
      icon: Binary,
      description: 'Develop cyber competencies in acquiring binary clone drives, parsing system logs, recovering deleted sectors, and analyzing ransomware.',
      salaryRange: '₹4.5L - ₹12.0L / year (Entry to Enterprise)',
      demandLevel: 'Critically High',
      primarySOP: 'ISO/IEC 27037 Guidelines for Identification and Preservation of Digital Evidence',
      toolkit: [
        { name: 'Hardware Write-Blocker', purpose: 'Hardware locks preventing an operating system from touching or modifying the linked suspect storage drive' },
        { name: 'FTK Imager / EnCase', purpose: 'Industry standard softwares to capture bit-by-bit identical forensic image copies of hard drives' },
        { name: 'Volatility Memory Framework', purpose: 'Powerful CLI tool to analyze volatile RAM space, finding hidden processes and active encryption keys' },
        { name: 'Wireshark Packet Analyzer', purpose: 'Deep network capture toolkit to inspect protocol sequences during ransomware breaches' }
      ],
      milestones: [
        {
          id: 'digital_1',
          name: 'Os Architecture & Hex Foundations',
          focus: 'Learn file systems (NTFS, EXT4), memory tables, and hex partition signatures.',
          duration: '3-4 Years (Undergrad/B.Tech)',
          education: 'B.Sc./B.Tech in Computer Science, Cyber Security, or Forensic Computing',
          skills: ['NTFS partition layouts', 'Hexadecimal header recognition', 'Terminal scripting (Bash/Powershell)'],
          checklist: [
            'Earn your B.Tech/B.Sc. degree or complete comprehensive system architecture coursework.',
            'Understand FAT/NTFS/EXT4 file tables and sector layout structures.',
            'Inspect raw hex logs of major file formats (e.g., JPEG, PDF, PE) to map signature headers.'
          ],
          expertTip: 'Every file type has an absolute byte signature. For instance, a PDF always starts with "%PDF" (%50 %44 %46) - hex signatures never lie.'
        },
        {
          id: 'digital_2',
          name: 'Forensic Acquisition & Write-Blocking',
          focus: 'Acquire bit-stream clones of target media with complete hash integrity.',
          duration: '4 Months',
          education: 'ForenClue Practical Digital Workshops',
          skills: ['DD and E01 image acquisition', 'Hardware write-blocker setups', 'SHA-256 cryptographic verification'],
          checklist: [
            'Perform hardware and software write-blocked clones of suspect flash drives.',
            'Generate bit-stream images using FTK Imager, matching SHA-256 integrity hashes.',
            'Complete ForenClue\'s Practical Cyber Investigations & Imaging Masterclass.'
          ],
          expertTip: 'Plugging an evidence drive straight into Windows without a write-blocker modifies over 300 metadata registry lines instantly. Keep your blocker on!'
        },
        {
          id: 'digital_3',
          name: 'File Carving & RAM volatile Recovery',
          focus: 'Extract deleted files from unallocated space and parse raw operating system memory.',
          duration: '6 Months',
          education: 'Advanced Digital System Training',
          skills: ['File signature carving', 'Volatility memory framework', 'RAM dumping tools'],
          checklist: [
            'Use advanced signature carving concepts to recover deleted JPGs from a corrupted drive.',
            'Dump live computer volatile memory (RAM) and extract active network connections or active sessions.',
            'Use Volatility CLI syntax to search and isolate hidden active virus processes.'
          ],
          expertTip: 'RAM is gold. That is where chat channels, decrypted keys, and active network connections exist. Image the RAM before pulling the plug!'
        },
        {
          id: 'digital_4',
          name: 'Intrusion Analysis & Log Diagnostics',
          focus: 'Track hacker pathways, decrypt malware files, and recover system network captures.',
          duration: '6 Months',
          education: 'ForenClue Cyber Incident Response Seminars',
          skills: ['Wireshark packet logging', 'Windows Event Log analysis', 'Malware telemetry tracking'],
          checklist: [
            'Reconstruct a full cyber breach using Apache server log tracks and network packages.',
            'Extract Windows Event Logs (.evtx) to identify illegal system privilege escalations.',
            'Explore Indian IT Act 2000 Section 65A/65B certificate procedures for digital court admissibility.'
          ],
          expertTip: 'Under Section 65B of the Indian Evidence Act, any digital printout or CD needs a signed certificate certifying the device was in healthy working order.'
        },
        {
          id: 'digital_5',
          name: 'Elite Credentials & Enterprise Launch',
          focus: 'Earn top-tier certifications (CHFI, CEH) and represent digital evidence in court.',
          duration: '6 Months',
          education: 'CHFI / GCFA Cert Preparation & Sector Placements',
          skills: ['CHFI Board Exam preparation', 'Security Operations Center (SOC) entry-level prep', 'Digital chain of custody representation'],
          checklist: [
            'Study and pass the CHFI (Computer Hacking Forensic Investigator) or similar international exams.',
            'Establish an active GitHub repository documenting custom forensics parsing tools.',
            'Apply to Cyber Police Cells, Central government examiner agencies, or top enterprise auditing banks.'
          ],
          expertTip: 'Enterprise cyber forensic consultants make some of the highest salaries in tech. Gain solid incident-response skills to stand out instantly.'
        }
      ]
    }
  ], [user]);

  // Handle active track Tab Changes
  const activeTrack = useMemo(() => {
    return careerTracks.find(t => t.id === activeTab) || careerTracks[0];
  }, [activeTab, careerTracks]);

  // Compute completed counts and percentages for each track
  const progressMetrics = useMemo(() => {
    const userId = user?.uid || 'guest';
    const metrics: Record<string, { total: number; done: number; percent: number }> = {};

    careerTracks.forEach(track => {
      let totalItems = 0;
      let doneItems = 0;

      track.milestones.forEach(milestone => {
        milestone.checklist.forEach((_, idx) => {
          totalItems++;
          const key = `${userId}_${track.id}_${milestone.id}_${idx}`;
          if (completedItems[key]) {
            doneItems++;
          }
        });
      });

      metrics[track.id] = {
        total: totalItems,
        done: doneItems,
        percent: totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0
      };
    });

    return metrics;
  }, [completedItems, careerTracks, user]);

  // 3-Question Path Finder Quiz Logic
  const handleQuizAnswer = (option: string) => {
    const newAnswers = [...quizAnswers, option];
    setQuizAnswers(newAnswers);
    
    if (quizStep < 2) {
      setQuizStep(quizStep + 1);
    } else {
      // Analyze answers to recommend track
      const counts: Record<string, number> = { csi: 0, dna: 0, tox: 0, digital: 0 };
      newAnswers.forEach(ans => {
        if (ans === 'csi' || ans === 'dna' || ans === 'tox' || ans === 'digital') {
          counts[ans]++;
        }
      });

      // Simple recommendation engine matching highest answered track
      let maxTrack = 'csi';
      let maxVal = -1;
      Object.keys(counts).forEach(key => {
        if (counts[key] > maxVal) {
          maxVal = counts[key];
          maxTrack = key;
        }
      });

      setQuizRecommendation(maxTrack);
      setQuizStep(3); // Result screen
    }
  };

  const handleResetQuiz = () => {
    setQuizStep(0);
    setQuizAnswers([]);
    setQuizRecommendation(null);
  };

  const handleActivateRecommendation = (recTrack: string) => {
    setActiveTab(recTrack);
    setShowQuiz(false);
    handleResetQuiz();
    // Scroll smoothly to dashboard tab section
    document.getElementById('roadmap-viewer-anchor')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Search filtering - filter tracks or matching milestones
  const activeMilestonesFiltered = useMemo(() => {
    if (!searchQuery) return activeTrack.milestones;
    const query = searchQuery.toLowerCase();
    
    return activeTrack.milestones.filter(m => 
      m.name.toLowerCase().includes(query) ||
      m.focus.toLowerCase().includes(query) ||
      m.education.toLowerCase().includes(query) ||
      m.skills.some(s => s.toLowerCase().includes(query)) ||
      m.checklist.some(c => c.toLowerCase().includes(query)) ||
      m.expertTip.toLowerCase().includes(query)
    );
  }, [searchQuery, activeTrack]);

  return (
    <div className="py-12 md:py-20 px-4 max-w-7xl mx-auto relative overflow-hidden" id="careers-root-container">
      <SEO 
        title="Interactive Career Roadmaps Visualizer"
        description="Navigate your forensic education step-by-step. Discover precise milestones, practical task lists, and average forensic chemistry and dactyloscopy salaries in India."
        keywords="forensic science careers, molecular dna expert india, crime scene officer jobs, biometric investigator, trace evidence guide"
        canonicalPath="/careers"
      />
      
      {/* Background glowing particles, keeping the elegant layout */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] pointer-events-none opacity-20 -translate-y-1/2 -ml-32">
         <DNAViewer />
      </div>

      <div className="relative z-10">
        {/* Dynamic header / breadcrumb */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4 text-[10px] uppercase tracking-widest font-mono text-warning/80">
          <CompassIcon className="w-3.5 h-3.5 animate-spin-slow" />
          <span>Professional Competency Maps</span>
          <span className="text-white/20">•</span>
          <span>ForenClue Academia Protocols</span>
        </div>

        <h1 className="text-3xl md:text-6xl font-heading font-black mb-4 text-center uppercase tracking-tight text-white leading-none">
          Career <span className="text-warning font-sans italic font-extrabold text-glow">Roadmaps</span> Visualizer
        </h1>
        <p className="text-center text-text-muted mb-12 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          Bridge the massive gap between forensic science classrooms and field deployment. Track real-world skill checklists, master high-performance instruments, and audit your specialized competency.
        </p>

        {/* --- DYNAMIC PATH MATCHING QUIZ --- */}
        <div className="mb-14 max-w-3xl mx-auto">
          {!showQuiz ? (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative p-6 bg-gradient-to-r from-base-dark to-surface/90 border border-warning/20 shadow-2xl rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div className="flex items-center gap-4 text-center md:text-left self-start md:self-center">
                <div className="p-3.5 bg-warning/10 text-warning rounded-xl border border-warning/20 shrink-0">
                  <Compass className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-white">Not sure which sub-specialty suits you?</h3>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed max-w-md">
                    Take our 3-question Forensic Pathfinder Quiz to map your natural analytical style and interests to the perfect roadmap track.
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setShowQuiz(true); handleResetQuiz(); }}
                className="w-full md:w-auto px-6 py-3 bg-warning hover:bg-warning-dark text-crust font-black font-sans uppercase tracking-widest text-xs rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Find Your Career Path</span>
                <ArrowRight size={13} className="stroke-[3]" />
              </button>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 bg-surface border border-warning/30 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.05)] relative overflow-hidden"
            >
              {/* Reset Close Button on top right */}
              <button 
                onClick={() => setShowQuiz(false)} 
                className="absolute top-4 right-4 text-xs text-text-muted hover:text-white uppercase font-bold tracking-wider cursor-pointer"
              >
                Close ×
              </button>

              {quizStep < 3 ? (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-mono text-[10px] text-warning tracking-widest uppercase">Pathfinder Engine • Stepper {quizStep + 1}/3</span>
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className={`w-12 h-1 ${i <= quizStep ? 'bg-warning' : 'bg-white/10'} rounded-full transition-colors`} />
                      ))}
                    </div>
                  </div>

                  {quizStep === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <h3 className="text-lg md:text-xl font-heading font-bold mb-5 text-white">
                        Question 1: What is your primary scientific or investigation interest?
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button 
                          onClick={() => handleQuizAnswer('csi')}
                          className="p-4 bg-base hover:bg-base-lighter border border-white/5 hover:border-warning/40 rounded-xl text-left transition-all active:scale-[0.98] group flex items-start gap-3 cursor-pointer"
                        >
                          <Camera className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                          <div>
                            <span className="block text-xs font-bold uppercase text-white group-hover:text-warning transition-colors">Physical Analysis</span>
                            <span className="block text-[11px] text-text-muted mt-0.5">Processing latent dust, finger ridge patterns, blood trajectory, and physical artifacts.</span>
                          </div>
                        </button>
                        <button 
                          onClick={() => handleQuizAnswer('dna')}
                          className="p-4 bg-base hover:bg-base-lighter border border-white/5 hover:border-warning/40 rounded-xl text-left transition-all active:scale-[0.98] group flex items-start gap-3 cursor-pointer"
                        >
                          <Dna className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="block text-xs font-bold uppercase text-white group-hover:text-pink-400 transition-colors">Biological Sequencing</span>
                            <span className="block text-[11px] text-text-muted mt-0.5">Examining PCR amplification, matching biological fluids, and STR profiles.</span>
                          </div>
                        </button>
                        <button 
                          onClick={() => handleQuizAnswer('tox')}
                          className="p-4 bg-base hover:bg-base-lighter border border-white/5 hover:border-warning/40 rounded-xl text-left transition-all active:scale-[0.98] group flex items-start gap-3 cursor-pointer"
                        >
                          <FlaskConical className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="block text-xs font-bold uppercase text-white group-hover:text-green-400 transition-colors">Chemical Toxicology</span>
                            <span className="block text-[11px] text-text-muted mt-0.5">Testing chemical compounds, toxic drugs, poisons, and instrumentation panels.</span>
                          </div>
                        </button>
                        <button 
                          onClick={() => handleQuizAnswer('digital')}
                          className="p-4 bg-base hover:bg-base-lighter border border-white/5 hover:border-warning/40 rounded-xl text-left transition-all active:scale-[0.98] group flex items-start gap-3 cursor-pointer"
                        >
                          <Binary className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="block text-xs font-bold uppercase text-white group-hover:text-blue-400 transition-colors">Cyber Investigation</span>
                            <span className="block text-[11px] text-text-muted mt-0.5">Decrypting hidden hard-media partitions, log trackers, and parsing malware tags.</span>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {quizStep === 1 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <h3 className="text-lg md:text-xl font-heading font-bold mb-5 text-white">
                        Question 2: What is your preferred daily workplace environment?
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button 
                          onClick={() => handleQuizAnswer('csi')}
                          className="p-4 bg-base hover:bg-base-lighter border border-white/5 hover:border-warning/40 rounded-xl text-left transition-all active:scale-[0.98] group flex items-start gap-3 cursor-pointer"
                        >
                          <MapPin className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                          <div>
                            <span className="block text-xs font-bold uppercase text-white group-hover:text-warning transition-colors">On-Scene Exploration</span>
                            <span className="block text-[11px] text-text-muted mt-0.5">Active outdoor deployment, incident perimeter grids, taking photographs in real-time.</span>
                          </div>
                        </button>
                        <button 
                          onClick={() => handleQuizAnswer('dna')}
                          className="p-4 bg-base hover:bg-base-lighter border border-white/5 hover:border-warning/40 rounded-xl text-left transition-all active:scale-[0.98] group flex items-start gap-3 cursor-pointer"
                        >
                          <Shield className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="block text-xs font-bold uppercase text-white group-hover:text-pink-400 transition-colors">Ultra-Clean Bio Laboratory</span>
                            <span className="block text-[11px] text-text-muted mt-0.5">Laminar hoods, sterile pipettes, wearing protective gear to protect human biological samples.</span>
                          </div>
                        </button>
                        <button 
                          onClick={() => handleQuizAnswer('tox')}
                          className="p-4 bg-base hover:bg-base-lighter border border-white/5 hover:border-warning/40 rounded-xl text-left transition-all active:scale-[0.98] group flex items-start gap-3 cursor-pointer"
                        >
                          <FlaskConical className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="block text-xs font-bold uppercase text-white group-hover:text-green-400 transition-colors">Instrumentation Testing Bench</span>
                            <span className="block text-[11px] text-text-muted mt-0.5">Operating high-precision machinery (GC-MS, HPLC) and calibrating graphs.</span>
                          </div>
                        </button>
                        <button 
                          onClick={() => handleQuizAnswer('digital')}
                          className="p-4 bg-base hover:bg-base-lighter border border-white/5 hover:border-warning/40 rounded-xl text-left transition-all active:scale-[0.98] group flex items-start gap-3 cursor-pointer"
                        >
                          <Binary className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="block text-xs font-bold uppercase text-white group-hover:text-blue-400 transition-colors">Tech Forensic workstation</span>
                            <span className="block text-[11px] text-text-muted mt-0.5">Inspecting hex lines, volatile memory RAM arrays, and command lines on dual displays.</span>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {quizStep === 2 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <h3 className="text-lg md:text-xl font-heading font-bold mb-5 text-white">
                        Question 3: Which problem-solving style describes you best?
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button 
                          onClick={() => handleQuizAnswer('csi')}
                          className="p-4 bg-base hover:bg-base-lighter border border-white/5 hover:border-warning/40 rounded-xl text-left transition-all active:scale-[0.98] group flex items-start gap-3 cursor-pointer"
                        >
                          <HelpCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                          <div>
                            <span className="block text-xs font-bold uppercase text-white group-hover:text-warning transition-colors">Reconstructive & Meticulous</span>
                            <span className="block text-[11px] text-text-muted mt-0.5">Connecting physical dots, building timeline scenarios, observing angles and marks.</span>
                          </div>
                        </button>
                        <button 
                          onClick={() => handleQuizAnswer('dna')}
                          className="p-4 bg-base hover:bg-base-lighter border border-white/5 hover:border-warning/40 rounded-xl text-left transition-all active:scale-[0.98] group flex items-start gap-3 cursor-pointer"
                        >
                          <Dna className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="block text-xs font-bold uppercase text-white group-hover:text-pink-400 transition-colors">Extremely Precise Scientist</span>
                            <span className="block text-[11px] text-text-muted mt-0.5">Analyzing microscopically small variations, running stats match frequencies.</span>
                          </div>
                        </button>
                        <button 
                          onClick={() => handleQuizAnswer('tox')}
                          className="p-4 bg-base hover:bg-base-lighter border border-white/5 hover:border-warning/40 rounded-xl text-left transition-all active:scale-[0.98] group flex items-start gap-3 cursor-pointer"
                        >
                          <FlaskConical className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="block text-xs font-bold uppercase text-white group-hover:text-green-400 transition-colors">Curious Chemical Profiler</span>
                            <span className="block text-[11px] text-text-muted mt-0.5">Inspecting biochemical compounds, pharmacokinetics, and molecular toxicity codes.</span>
                          </div>
                        </button>
                        <button 
                          onClick={() => handleQuizAnswer('digital')}
                          className="p-4 bg-base hover:bg-base-lighter border border-white/5 hover:border-warning/40 rounded-xl text-left transition-all active:scale-[0.98] group flex items-start gap-3 cursor-pointer"
                        >
                          <Binary className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="block text-xs font-bold uppercase text-white group-hover:text-blue-400 transition-colors">Logical Cyber Sleuth</span>
                            <span className="block text-[11px] text-text-muted mt-0.5">Decoding digital registries, scripting log routines, and tracking system traces.</span>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-4"
                >
                  <Sparkles className="w-10 h-10 text-warning mx-auto mb-4 animate-bounce" />
                  <h3 className="text-xl md:text-2xl font-heading font-black uppercase text-white tracking-tight">
                    Custom Match Calculation Complete!
                  </h3>
                  <p className="text-xs text-text-muted mt-2 max-w-md mx-auto">
                    Based on your analytical preferences and workplace styles, our platform recommends focusing on:
                  </p>

                  <div className="my-6 inline-block bg-white/5 px-6 py-4 rounded-xl border border-warning/30 max-w-sm">
                    <span className="block font-mono text-[9px] uppercase tracking-wider text-warning mb-1">Recommended Pathway</span>
                    <span className="text-lg font-heading font-black text-white uppercase block">
                      {quizRecommendation === 'csi' && 'Crime Scene Investigator (CSI)'}
                      {quizRecommendation === 'dna' && 'Forensic DNA Expert'}
                      {quizRecommendation === 'tox' && 'Forensic Toxicologist'}
                      {quizRecommendation === 'digital' && 'Digital Forensics Expert'}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
                    <button
                      onClick={() => handleActivateRecommendation(quizRecommendation!)}
                      className="px-6 py-2.5 bg-warning hover:bg-warning-dark text-crust font-black uppercase tracking-wider text-xs rounded-xl cursor-pointer active:scale-95 transition-all w-full sm:w-auto"
                    >
                      Activate Path Roadmap
                    </button>
                    <button
                      onClick={handleResetQuiz}
                      className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold uppercase text-xs rounded-xl cursor-pointer transition-all w-full sm:w-auto"
                    >
                      Take Quiz Again
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>


        {/* --- MAIN DASHBOARD ROADMAP INTERFACE --- */}
        <div id="roadmap-viewer-anchor" className="scroll-mt-24">
          
          {/* Navigation Controls Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            {/* Choose Specialization Buttons */}
            <div className="flex flex-no-wrap overflow-x-auto gap-2 pb-2 md:pb-0 scrollbar-none select-none">
              {careerTracks.map(track => {
                const isSelected = activeTab === track.id;
                const TrackIcon = track.icon;
                const percentDone = progressMetrics[track.id]?.percent || 0;

                return (
                  <button
                    key={track.id}
                    onClick={() => setActiveTab(track.id)}
                    className={`relative flex items-center gap-3 px-5 py-3.5 border transition-all duration-300 rounded-xl shrink-0 cursor-pointer ${
                      isSelected 
                        ? 'bg-warning/10 border-warning/60 text-white shadow-md shadow-warning/5' 
                        : 'bg-surface/60 border-white/5 hover:border-white/10 text-text-muted hover:text-white'
                    }`}
                  >
                    <TrackIcon className={`w-4 h-4 ${isSelected ? 'text-warning' : 'text-text-muted'}`} />
                    <div className="text-left">
                      <span className="block text-xs font-black uppercase tracking-wide leading-tight">{track.title.split(' ')[0]} {track.id === 'csi' ? 'CSI' : track.id === 'dna' ? 'DNA' : track.title.split(' ').slice(1).join(' ')}</span>
                      <span className="block text-[9px] text-text-muted/80 mt-0.5">Progress: {percentDone}%</span>
                    </div>
                    {percentDone === 100 && (
                      <CheckCircle2 size={12} className="text-green-400 absolute top-1 right-1" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Keyword Search Input */}
            <div className="relative w-full md:max-w-xs shrink-0 select-text">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-text-muted">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Search tools, SOPs, keys..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface/80 text-white text-xs pl-10 pr-4 py-3 border border-white/5 focus:border-warning/50 rounded-xl outline-none placeholder:text-text-muted/60 transition-colors"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted hover:text-white text-xs uppercase font-sans font-bold cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Core Tracks Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 select-text">
            
            {/* Left 4 Cols: Track Overview Context Card */}
            <div className="lg:col-span-4 space-y-6">
              <motion.div 
                key={activeTrack.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-surface/80 p-6 border border-white/5 shadow-2xl rounded-2xl relative overflow-hidden"
              >
                {/* Visual Accent Decoration inside card */}
                <span className="absolute -right-8 -bottom-8 opacity-5 text-white/10 select-none pointer-events-none">
                  {React.createElement(activeTrack.icon, { size: 140 })}
                </span>

                <div className="flex items-center gap-2 px-2.5 py-1 bg-warning/10 border border-warning/20 rounded-full text-warning text-[9px] font-black uppercase tracking-wider mb-5 self-start inline-flex">
                  <TrendingUp size={10} />
                  <span>Demand State: {activeTrack.demandLevel}</span>
                </div>

                <h2 className="text-2xl font-heading font-black text-white uppercase tracking-tight">
                  {activeTrack.title}
                </h2>
                <p className="text-text-muted text-xs mt-3 leading-relaxed">
                  {activeTrack.description}
                </p>

                {/* Micro Metadata specs */}
                <div className="mt-6 border-t border-white/5 pt-5 space-y-3.5 text-xs text-text-muted">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock size={13} className="text-warning" />
                      <span>Avg Core Salary:</span>
                    </span>
                    <span className="font-mono text-white text-xs font-semibold">{activeTrack.salaryRange}</span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex items-center gap-1.5 shrink-0 font-medium">
                      <FileText size={13} className="text-warning mt-0.5" />
                      <span>Primary SOP:</span>
                    </span>
                    <span className="font-mono text-warning text-[10px] bg-warning/5 px-2 py-0.5 border border-warning/10 rounded font-semibold text-right max-w-[170px] break-words">
                      {activeTrack.primarySOP}
                    </span>
                  </div>
                </div>

                {/* Progress bar visual header */}
                <div className="mt-8 border-t border-white/5 pt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Competency Index</span>
                    <span className="text-xs font-mono font-bold text-warning">{progressMetrics[activeTrack.id]?.percent || 0}% Complete</span>
                  </div>
                  <div className="w-full h-2 bg-base rounded-full overflow-hidden border border-white/5 p-0.5">
                    <motion.div 
                      className="bg-gradient-to-r from-warning to-yellow-300 h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressMetrics[activeTrack.id]?.percent || 0}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-[10px] text-text-muted mt-2 text-center italic">
                    {progressMetrics[activeTrack.id]?.done === progressMetrics[activeTrack.id]?.total 
                      ? '🏆 Core credential path finalized! Apply today.' 
                      : `Mark off ${progressMetrics[activeTrack.id]?.total - progressMetrics[activeTrack.id]?.done} skill checklist items to reach 100%`}
                  </p>
                </div>
              </motion.div>

              {/* Forensic ToolKit showcase */}
              <motion.div 
                key={`toolkit_${activeTrack.id}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-surface/80 p-6 border border-white/5 shadow-xl rounded-2xl"
              >
                <div className="flex items-center gap-2 mb-4">
                  <BookmarkCheck size={16} className="text-warning" />
                  <h3 className="font-heading font-black text-xs uppercase tracking-wider text-white">SOP Instruments & Toolkit</h3>
                </div>
                <p className="text-[10px] text-text-muted mb-4 leading-relaxed">
                  Professional experts are tested directly on operating these critical devices. Click on any tool to review its specific objective in forensic court cases.
                </p>

                <div className="space-y-2.5">
                  {activeTrack.toolkit.map((tool, idx) => (
                    <div 
                      key={idx} 
                      className="p-3 bg-base/60 hover:bg-base/90 border border-white/5 hover:border-white/10 rounded-xl transition-all cursor-pointer group"
                    >
                      <span className="font-mono text-xs font-bold text-white group-hover:text-warning transition-colors block">{tool.name}</span>
                      <span className="block text-[10px] text-text-muted mt-1 leading-normal">{tool.purpose}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right 8 Cols: Interactive Timeline Stepper */}
            <div className="lg:col-span-8">
              
              {activeMilestonesFiltered.length === 0 ? (
                <div className="text-center py-20 bg-surface/30 p-8 border border-white/5 rounded-2xl shadow-inner uppercase tracking-wider text-xs font-bold text-text-muted">
                  <AlertCircle className="w-8 h-8 text-warning mx-auto mb-3" />
                  No milestones found matching "{searchQuery}"
                </div>
              ) : (
                <div className="space-y-6 relative pl-4 md:pl-8 before:absolute before:inset-y-3 before:left-[11px] md:before:left-[27px] before:w-[2px] before:bg-gradient-to-b before:from-warning/60 before:via-white/5 before:to-transparent">
                  {activeMilestonesFiltered.map((milestone, idx) => {
                    const isExpanded = !!expandedMilestones[milestone.id];
                    
                    // Precompute completion states for this milestone checklist
                    const userId = user?.uid || 'guest';
                    const listKeys = milestone.checklist.map((_, i) => `${userId}_${activeTrack.id}_${milestone.id}_${i}`);
                    const doneListCount = listKeys.filter(k => completedItems[k]).length;
                    const percentMilestone = Math.round((doneListCount / milestone.checklist.length) * 100);

                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        key={milestone.id}
                        className={`p-5 md:p-6 rounded-2xl border transition-all duration-300 relative ${
                          isExpanded 
                            ? 'bg-surface border-warning/20 shadow-xl' 
                            : 'bg-surface/50 border-white/5 hover:border-white/10 hover:bg-surface/70'
                        }`}
                      >
                        {/* Timeline Node Point on Left Margin */}
                        <div 
                          onClick={() => toggleMilestone(milestone.id)}
                          className={`absolute -left-[21px] md:-left-[37px] top-6 w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer z-10 ${
                            percentMilestone === 100 
                              ? 'bg-green-500 border-green-400 text-crust' 
                              : percentMilestone > 0 
                              ? 'bg-warning border-warning text-crust'
                              : 'bg-base border-white/20 text-white'
                          }`}
                        >
                          {percentMilestone === 100 ? (
                            <CheckCircle2 size={12} className="stroke-[3.5] text-white" />
                          ) : (
                            <span className="text-[9px] md:text-[10px] font-sans font-black">{idx + 1}</span>
                          )}
                        </div>

                        {/* Top Summary Header info clickable to toggle expand */}
                        <div 
                          onClick={() => toggleMilestone(milestone.id)}
                          className="flex justify-between items-start gap-4 cursor-pointer select-none"
                        >
                          <div>
                            <div className="flex flex-wrap items-center gap-2.5">
                              <span className="font-mono text-[9px] bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-text-muted font-bold tracking-wider">
                                STEP 0{idx + 1}
                              </span>
                              <span className="flex items-center gap-1 text-[9px] text-warning bg-warning/5 border border-warning/10 rounded px-1.5 py-0.5 font-bold uppercase tracking-widest">
                                <Clock size={9} />
                                {milestone.duration}
                              </span>
                              {percentMilestone > 0 && (
                                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                  percentMilestone === 100 
                                    ? 'bg-green-400/10 text-green-400 border border-green-400/20' 
                                    : 'bg-warning/10 text-warning border border-warning/20'
                                }`}>
                                  {percentMilestone}% Done
                                </span>
                              )}
                            </div>
                            <h3 className="text-sm md:text-base font-heading font-black text-white uppercase tracking-tight mt-2 hover:text-warning transition-colors flex items-center gap-2">
                              {milestone.name}
                            </h3>
                            <p className="text-[11px] text-text-muted mt-1 leading-snug">
                              {milestone.focus}
                            </p>
                          </div>

                          <button 
                            className="p-1 px-1.5 text-text-muted hover:text-white transition-colors cursor-pointer shrink-0 mt-1"
                            title={isExpanded ? "Collapse" : "Expand Details"}
                          >
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </button>
                        </div>

                        {/* Expandable Container details */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="pt-5 mt-5 border-t border-white/5 space-y-4 select-text">
                                
                                {/* Educational Benchmark Spec */}
                                <div className="p-3 bg-base/50 rounded-xl border border-white/5 flex items-start gap-2.5">
                                  <Award size={14} className="text-warning shrink-0 mt-0.5" />
                                  <div>
                                    <span className="block text-[10px] font-bold uppercase tracking-wider text-white">Target Educational Benchmark</span>
                                    <span className="block text-[11px] text-text-muted/90 mt-0.5 leading-normal">{milestone.education}</span>
                                  </div>
                                </div>

                                {/* Checklist Checklist Items */}
                                <div>
                                  <span className="block text-[10px] font-sans font-bold uppercase tracking-widest text-warning mb-2.5 select-none">
                                    Compulsory Practical Checklist
                                  </span>
                                  <div className="space-y-1.5">
                                    {milestone.checklist.map((itemStr, cIdx) => {
                                      const keyStr = `${userId}_${activeTrack.id}_${milestone.id}_${cIdx}`;
                                      const isChecked = !!completedItems[keyStr];

                                      return (
                                        <div 
                                          key={cIdx}
                                          onClick={() => handleToggleItem(activeTrack.id, milestone.id, cIdx)}
                                          className={`group flex items-start gap-3 p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                                            isChecked 
                                              ? 'bg-green-500/5 border-green-500/20 text-white/90' 
                                              : 'bg-[#1a1b1d] border-transparent hover:border-white/5 hover:bg-[#202124]'
                                          }`}
                                        >
                                          <div className={`w-3.5 h-3.5 border rounded mt-0.5 shrink-0 flex items-center justify-center transition-all ${
                                            isChecked 
                                              ? 'bg-green-500 border-green-400 text-white' 
                                              : 'border-white/20 group-hover:border-warning'
                                          }`}>
                                            {isChecked && <CheckCircle2 className="w-3 h-3 text-white stroke-[4]" />}
                                          </div>
                                          <span className={`text-[11px] leading-relaxed transition-all ${
                                            isChecked ? 'line-through text-text-muted/60 font-light' : 'text-text-muted group-hover:text-white'
                                          }`}>
                                            {itemStr}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Skills Earned Section */}
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  <span className="text-[9px] text-text-muted/80 self-center uppercase font-bold mr-1 shrink-0">Earned Competencies:</span>
                                  {milestone.skills.map((skill, sIdx) => (
                                    <span 
                                      key={sIdx} 
                                      className="text-[9px] font-mono bg-warning/5 text-warning font-semibold px-2 py-0.5 border border-warning/10 rounded"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>

                                {/* Pro Expert Advice Tip box */}
                                <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl flex items-start gap-2.5">
                                  <AlertCircle size={14} className="text-yellow-400 shrink-0 mt-0.5" />
                                  <p className="text-[10px] text-text-muted leading-relaxed italic">
                                    <strong className="text-white not-italic font-bold block uppercase tracking-wider text-[9px] mb-0.5 text-yellow-400">Expert Field Directive</strong>
                                    "{milestone.expertTip}"
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* --- DYNAMIC HANDBOOK REDIRECT CALL TO ACTION --- */}
        <div className="mt-16 bg-gradient-to-r from-[#202124] to-surface p-8 border border-white/5 rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-warning/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
            <div className="p-3.5 bg-warning/10 text-warning rounded-xl border border-warning/20">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-heading font-black text-white uppercase tracking-tight">Need a Comprehensive Physical Syllabus?</h3>
              <p className="text-xs text-text-muted mt-1 leading-relaxed max-w-lg">
                Unlock deeper forensic methodologies with other physical copies. Access exact guidelines, forensic syllabus modules, laboratory standards, and interview strategies.
              </p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/?scroll=book-mockup')}
            className="w-full md:w-auto px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-black font-sans uppercase tracking-widest text-xs rounded-xl shadow border border-white/10 hover:border-white/20 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Get Career Syllabus</span>
            <ArrowRight size={13} />
          </button>
        </div>

      </div>
    </div>
  );
}
