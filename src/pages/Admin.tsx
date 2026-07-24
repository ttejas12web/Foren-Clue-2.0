import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, Mail, Key, LayoutGrid, BookOpen, Plus, Trash2, 
  Settings, CheckCircle2, AlertCircle, FileText, Upload, 
  ExternalLink, LogOut, Loader2, Sparkles, HelpCircle, 
  Globe, Edit3, MessageSquare, Radio, Award,
  Users, RefreshCw, ShieldCheck, Database, Fingerprint, ClipboardList
} from 'lucide-react';
import { db, storage, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ResilientImage, uploadFileResilient } from '@/lib/localFileStore';
import { cn } from '@/lib/utils';

export default function Admin() {
  const { user, isAdmin, adminLogin, logout, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Authentication Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [btnLoading, setBtnLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

   // Active Tab: 'overview' | 'courses' | 'ebooks' | 'texts' | 'doubts' | 'podcast' | 'certificates' | 'employees'
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'ebooks' | 'texts' | 'doubts' | 'podcast' | 'certificates' | 'employees'>('overview');

  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editingEbookId, setEditingEbookId] = useState<string | null>(null);
  const [editingPodcastId, setEditingPodcastId] = useState<string | null>(null);

  // Courses Management State
  const [courses, setCourses] = useState<any[]>([]);
  const [doubts, setDoubts] = useState<any[]>([]);
  const [podcastEpisodes, setPodcastEpisodes] = useState<any[]>([]);
  const [courseLoading, setCourseLoading] = useState(false);
  const [podcastLoading, setPodcastLoading] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    instructor: 'Ayush Gaikwad',
    price: 0,
    originalPrice: 4999,
    level: 'Beginner',
    category: 'Forensic Science',
    duration: '12 Hours',
    description: '',
    thumbnail: '',
    instructorImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    instructorBio: 'Lead Forensic Investigator & Cyber Analyst.',
    curriculumLines: '',
  });
  // Simple modules/lessons schema
  const [modules, setModules] = useState<any[]>([
    {
      id: 'm1',
      title: 'Module 1: Introduction to forensics',
      lessons: [
        { id: 'l1', title: 'Lesson 1.1: Core concept overview', duration: '15 mins', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
      ]
    }
  ]);

  // Ebooks state
  const [ebooks, setEbooks] = useState<any[]>([]);
  const [ebookLoading, setEbookLoading] = useState(false);
  const [newEbook, setNewEbook] = useState({
    title: '',
    author: '',
    year: new Date().getFullYear(),
    category: 'Fundamentals',
    tabCategory: 'books', // 'books' | 'notes' | 'papers' | 'other'
    type: 'PDF',
    size: '12MB',
    image: '',
    pdfUrl: '',
    desc: ''
  });

  // Podcast Episode dynamic state
  const [newEpisode, setNewEpisode] = useState({
    title: '',
    description: '',
    coverImage: '',
    audioUrl: '',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    duration: '30:00',
    durationSec: 1800
  });

  // Direct Storage Upload loading states
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [isUploadingPodcastCover, setIsUploadingPodcastCover] = useState(false);

  // Individual file upload feedback states
  const [pdfErrorText, setPdfErrorText] = useState('');
  const [pdfSuccessText, setPdfSuccessText] = useState('');
  const [coverErrorText, setCoverErrorText] = useState('');
  const [coverSuccessText, setCoverSuccessText] = useState('');
  const [thumbErrorText, setThumbErrorText] = useState('');
  const [thumbSuccessText, setThumbSuccessText] = useState('');
  const [audioErrorText, setAudioErrorText] = useState('');
  const [audioSuccessText, setAudioSuccessText] = useState('');
  const [podcastCoverErrorText, setPodcastCoverErrorText] = useState('');
  const [podcastCoverSuccessText, setPodcastCoverSuccessText] = useState('');

  // Website copy state
  const [copiedTexts, setCopiedTexts] = useState<any[]>([]);
  const [textKey, setTextKey] = useState('');
  const [textVal, setTextVal] = useState('');

  // Certificate states
  const [certificates, setCertificates] = useState<any[]>([]);
  const [certificateLoading, setCertificateLoading] = useState(false);
  const [editingCertificateId, setEditingCertificateId] = useState<string | null>(null);
  const [newCertificate, setNewCertificate] = useState({
    certificateNo: '',
    fullName: '',
    courseTitle: '',
    certificateType: 'Internship Completion',
    issueDate: new Date().toISOString().split('T')[0],
    imageUrl: '',
    pdfUrl: '',
    additionalDetails: ''
  });

  const [isUploadingCertImage, setIsUploadingCertImage] = useState(false);
  const [isUploadingCertPdf, setIsUploadingCertPdf] = useState(false);
  const [certImageErrorText, setCertImageErrorText] = useState('');
  const [certImageSuccessText, setCertImageSuccessText] = useState('');
  const [certPdfErrorText, setCertPdfErrorText] = useState('');
  const [certPdfSuccessText, setCertPdfSuccessText] = useState('');

  // Employees Management State
  const [adminEmployees, setAdminEmployees] = useState<any[]>([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [isEditingEmployee, setIsEditingEmployee] = useState(false);
  const [editEmployeeId, setEditEmployeeId] = useState<string | null>(null);
  
  const [employeeFormData, setEmployeeFormData] = useState({
    employeeId: '',
    fullName: '',
    position: '',
    department: 'Cybersecurity & Digital Forensics',
    joiningDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString().split('T')[0],
    status: 'Active' as 'Active' | 'Suspended' | 'Expired',
    email: '',
    phone: '',
    skills: '',
    imageUrl: '',
    clearanceLevel: 'Level 1 - Employee'
  });

  // Seed Demo Employees & Certificates (Restore Databases)
  const seedDemoEmployees = async () => {
    setEmployeeLoading(true);
    setSuccessMsg('');
    setErrMsg('');
    try {
      const demoEmployees = [
        {
          employeeId: 'FC-EMP-102',
          fullName: 'Ashutosh Singh',
          position: 'Cyber Forensic Expert',
          department: 'Cybersecurity & Digital Forensics',
          joiningDate: '2024-01-12',
          expiryDate: '2029-01-12',
          status: 'Active' as const,
          email: 'ashutosh.forensics@forenclue.com',
          phone: '+91 99881 22334',
          skills: ['Incident Response', 'Malware Reverse Engineering', 'State Evidence Preservation'],
          imageUrl: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjtLXAx3JA_GV_s7QEAbL8YK43XS7e-5FrJngYv7szTZAs192ppvSo4zXQxX_0sNHnoDZ-rirNR8U6BGTwSPK9kAYRdR6YWVMLUCFLvs5Cbwy81gDHxep6XWIPhdynzKvZUMnai51-QoDEPYvkn0ObkO7K33ImRdWP3yPhV0FFkEA-zMP85DXlT3EOtoCE/s1024/1783083591880.png',
          clearanceLevel: 'Level 3 - Member',
          checksum: '8d4f20e98ab776c5dcd890a21cf3e6393b9d0b04a87c126d4efb7936746ef702',
          createdAt: new Date().toISOString()
        },
        {
          employeeId: 'FC-EMP-304',
          fullName: 'Ayush Gaikwad',
          position: 'Founder & Managing Director',
          department: 'Business Development & Partnerships',
          joiningDate: '2024-01-01',
          expiryDate: '2034-01-01',
          status: 'Active' as const,
          email: 'ayushgaikwad7050@gmail.com',
          phone: '+91 88776 65544',
          skills: ['Cyber Security Architecture', 'Digital Investigations', 'Threat Intelligence & SOC'],
          imageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
          clearanceLevel: 'Level 3 - Member',
          checksum: '1a5e30c9df76b5c00a9d80cf20efd6394c8e7bd7c9ab1264cde89bf98e09f531',
          createdAt: new Date().toISOString()
        },
        {
          employeeId: 'FC-EMP-519',
          fullName: 'Tejas Tapse',
          position: 'Senior Security Analyst & Instructor',
          department: 'Cybersecurity & Digital Forensics',
          joiningDate: '2024-02-15',
          expiryDate: '2029-02-15',
          status: 'Active' as const,
          email: 'tejas.tapse@forenclue.com',
          phone: '+91 77665 44332',
          skills: ['Network Forensics', 'Mobile Malware Triaging', 'Security Operations'],
          imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150',
          clearanceLevel: 'Level 3 - Member',
          checksum: 'c2e8f1920acbb83e748d1b1dfcf9a228394b92c4f1c7bf9e8a93e3d9fdf196d4',
          createdAt: new Date().toISOString()
        }
      ];

      const demoCertificates = [
        {
          certificateNo: 'FC-1025-AB',
          fullName: 'Nikitha B',
          courseTitle: 'Cyber Security & Digital Forensics',
          certificateType: 'Internship Completion',
          issueDate: '2026-07-20',
          imageUrl: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhofilNlkbJWvjAxFLk9i72sbgVT_2SwexBeXssxgZYH1EwiuEsAHceh5ESFONKrPOrvk1n7daXMe8lRVtXMpCtk20vWJC1BdHzG3V3sfQDuiBMD2E4WQYnge_a-ECnx6TSOjMB4s4ZFiEjPZM2WmCMhTeGN6mLT2Qjg333AwuyDoyapc3Vi8u_U6WcF4c/s1280/WhatsApp%20Image%202026-07-21%20at%2019.05.19.jpeg',
          pdfUrl: 'https://forenclue.in/sample_cert.pdf',
          additionalDetails: 'Successfully completed the intensive forensic analyst internship with distinction under direct academic and scientific mentorship.',
          createdAt: new Date().toISOString()
        },
        {
          certificateNo: 'FC-1026-CD',
          fullName: 'Ayush Gaikwad',
          courseTitle: 'Advanced Forensic DNA & Fingerprint Analysis',
          certificateType: 'Professional Certification',
          issueDate: '2024-05-15',
          imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600',
          pdfUrl: 'https://forenclue.in/sample_cert.pdf',
          additionalDetails: 'Credential verified and registered under official MSME guidelines by ForenClue expert board.',
          createdAt: new Date().toISOString()
        },
        {
          certificateNo: 'FC-1027-EF',
          fullName: 'Nikita Chauhan',
          courseTitle: 'Crime Scene Investigation & Reconstruction',
          certificateType: 'Internship Completion',
          issueDate: '2024-07-10',
          imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600',
          pdfUrl: 'https://forenclue.in/sample_cert.pdf',
          additionalDetails: 'Demonstrated outstanding aptitude in photographic log mapping, evidence indexing, and chain-of-custody preservation.',
          createdAt: new Date().toISOString()
        },
        {
          certificateNo: 'FC-1028-GH',
          fullName: 'Mayur Hengada',
          courseTitle: 'Digital Forensics & Malware Analysis Masterclass',
          certificateType: 'Professional Certification',
          issueDate: '2024-07-15',
          imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600',
          pdfUrl: 'https://forenclue.in/sample_cert.pdf',
          additionalDetails: 'Successfully completed advanced labs on volatile memory dumping, sandbox execution analysis, and reverse engineering.',
          createdAt: new Date().toISOString()
        }
      ];

      const demoCases = [
        {
          id: 'okq4BfBv5EEjsxvnn5dP',
          title: 'The RG Kar Medical College Tragedy: A Forensic Investigation',
          tag: 'Forensic Pathology',
          year: '2024',
          location: 'Kolkata, West Bengal',
          difficulty: 'Advanced',
          type: 'Homicide & Sexual Assault',
          image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1000',
          summary: 'A comprehensive forensic analysis of the August 2024 RG Kar Medical College tragedy in Kolkata, detailing the autopsy findings, CBI investigation, digital evidence, and DNA profiling that unraveled the brutal rape and murder of a trainee doctor.',
          details: '## Case Background\nOn the morning of August 9, 2024, the body of a 31-year-old postgraduate trainee doctor (commonly referred to as "Abhaya") was discovered in the seminar hall of R. G. Kar Medical College and Hospital in Kolkata. She had been on a grueling 36-hour shift and had gone to the seminar hall to rest. The horrific nature of the crime—involving severe sexual assault and murder—sparked massive nationwide protests among the medical community, demanding justice and better workplace security. The case was eventually transferred to the Central Bureau of Investigation (CBI) by the Calcutta High Court due to concerns over the initial police handling.\n\n## The Crime Scene & Initial Response\nThe victim was found on the podium of the seminar hall, partially clothed with severe visible injuries. \nThe initial response by local authorities was heavily criticized for failing to secure the crime scene effectively, leading to allegations of evidence tampering. During a subsequent protest on August 14, a mob vandalized the hospital, further complicating the scene, though police claimed the seminar hall remained secure.\n\n## Forensic Pathology and Autopsy Findings\nThe autopsy, conducted under intense scrutiny, revealed the sheer brutality of the attack. Key findings included:\n1. **Cause of Death**: Manual strangulation (throttling) associated with smothering. The thyroid cartilage was fractured, confirming forceful compression of the neck.\n2. **Physical Trauma**: The victim sustained 14 distinct injuries. Deep wounds were documented on her face, eyes, neck, belly, lips, and limbs. A severe head injury was also noted, suggesting her head was repeatedly bashed against a hard surface (likely the floor or wall).\n3. **Sexual Assault**: The medical examination confirmed aggravated sexual assault, with significant genital trauma. Crucially, the presence of seminal fluid was documented, which became the cornerstone of the DNA evidence.\n4. **Time of Death**: Forensic experts estimated the time of death to be between 3:00 AM and 5:00 AM on August 9.\n\n## Digital and Trace Evidence\nThe CBI\'s investigation utilized modern digital forensics to pinpoint the suspect:\n1. **CCTV Analysis**: Footage from the hospital corridors captured the primary suspect, a civic volunteer named Sanjay Roy, entering the chest medicine department building at around 4:03 AM and leaving approximately 35 minutes later.\n2. **Digital Forensics (The Bluetooth Earphone)**: A crucial piece of evidence—a broken Bluetooth earphone—was found near the victim\'s body. Investigators matched the MAC address and pairing logs of this earphone directly to Sanjay Roy\'s mobile phone, placing him at the exact scene of the crime.\n3. **Pornographic Material**: Digital forensics on the suspect\'s seized mobile phone revealed a history of consuming violent pornography, establishing a potential psychological profile.\n\n## DNA and Biological Evidence\nThe Central Forensic Science Laboratory (CFSL) in New Delhi played a pivotal role in confirming the suspect\'s involvement:\n- **Seminal Fluid Match**: The DNA extracted from the seminal fluid recovered from the victim\'s body conclusively matched the DNA profile of Sanjay Roy.\n- **Trace Evidence on Suspect**: Swabs taken from the suspect\'s body revealed defensive scratch marks. DNA from the victim was found in the suspect\'s nail clippings, and the suspect\'s skin cells were found under the victim\'s fingernails, evidencing a violent struggle.\n- **Blood Stains**: The suspect\'s clothes and shoes, which he had allegedly washed, were subjected to luminol testing, revealing trace amounts of the victim\'s blood.\n\n## Investigation Conclusion and Impact\nThe integration of the forensic pathology report, irrefutable DNA evidence, and digital tracking (CCTV and Bluetooth logs) allowed the CBI to build a watertight charge sheet against the accused. The case remains a stark reminder of the critical importance of secure crime scene management, rapid evidence collection, and the power of multidisciplinary forensic science in delivering justice.',
          status: 'published',
          createdBy: 'forenclue@gmail.com',
          evidenceLabels: ['Autopsy Report', 'CCTV Corridors', 'Bluetooth Earphone Log', 'CFSL DNA Report', 'Luminol Blood Trace'],
          forensicTechniques: ['Forensic Pathology', 'DNA Profiling', 'Digital Forensics', 'Crime Scene Reconstruction'],
          contentImages: [
            {
              url: 'https://images.unsplash.com/photo-1582719471384-894fbb16e024?auto=format&fit=crop&q=80&w=600',
              caption: 'Forensic Laboratory DNA Processing'
            },
            {
              url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=600',
              caption: 'Medical Examination and Pathology Lab'
            },
            {
              url: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&q=80&w=600',
              caption: 'Digital Forensics: Device Pairing Analysis'
            }
          ],
          attachments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'B1HNKkopZXlC8FNrhVh6',
          title: 'The Phantom Breach: APT-33 Ransomware Attack',
          tag: 'Digital Forensics',
          year: '2024',
          location: 'Bangalore IT Corridor',
          difficulty: 'Advanced',
          type: 'Cyber',
          image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1000',
          summary: 'A multi-stage cyber forensic investigation tracing an Advanced Persistent Threat (APT) attack targeting critical manufacturing systems. Analysts traced the initial ingress to a compromised VPN endpoint.',
          details: '## Investigative Overview\\nIn January 2024, a major defense manufacturing plant in Bangalore suffered a total lockdown of its internal operations due to a highly sophisticated ransomware strain. All active workstations displayed a decryption fee demand of 45 BTC.\\n\\n## Digital Ingress Analysis\\n1. **Log Triaging**: Firewalls, active directory logs, and VPN server history were analyzed. A suspicious session was detected originating from a leased IP range in Eastern Europe.\\n2. **Registry and Malware Analysis**: Analysts extracted a memory dump from the compromised primary domain controller. Reverse engineering of the payload (`win_crypto_v4.dll`) revealed standard techniques to evade endpoint protection services.\\n3. **Decryption Vector**: The threat actors utilized a zero-day vulnerability in the SSL VPN appliance to bypass multi-factor authentication checks.\\n\\n## Forensic Insights\\nThe forensic team traced the cryptocurrency wallet address specified in the ransom note. By collaborating with international exchanges, they identified previous laundering paths linked to the infamous APT-33 group.\\n\\n## Lessons Learned\\n- Enforce complete network segmentation between administrative and active operational technology (OT) systems.\\n- Keep VPN firmware up to date with urgent patches.',
          status: 'published',
          createdBy: 'forenclue@gmail.com',
          evidenceLabels: ['Domain Controller Memory Dump', 'Malware Payload DLL', 'VPN Connection Logs'],
          forensicTechniques: ['Volatile Memory Analysis', 'PE Reverse Engineering', 'Network Log Correlation'],
          contentImages: [
            {
              url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600',
              caption: 'Cyber Security Operations Center monitoring real-time network traffic graphs'
            }
          ],
          attachments: ['https://forenclue.in/sample_cert.pdf'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'SeVvdBKSqEJKozwwgT83',
          title: 'The Forged Stamp of the Royal Land Registry',
          tag: 'Document Verification',
          year: '2023',
          location: 'Delhi High Court Forensic Laboratory',
          difficulty: 'Beginner',
          type: 'Forgery',
          image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=1000',
          summary: 'A historic property dispute solved by forensic document examiners under the Delhi High Court. Microscopic ink examination proved that the official government seal was falsified using modern inkjet printing.',
          details: '## Case Introduction\\nA highly contested inheritance claim hinged on a land transfer deed dated September 14, 1965. The deed featured the official signature of the registrar and an embossed rubber-stamp seal.\\n\\n## Physical and Chemical Examination\\n1. **Embossing Analysis**: True seals of that era produce distinct physical paper deformation (embossing). Oblique light examination revealed zero indentation on the disputed deed.\\n2. **Microscopic Ink Analysis**: Under high-resolution microscopy, the red stamp ink showed distinct CMYK droplet splatters characteristic of modern inkjet printers, rather than the oil-based stamp pads utilized in the 1960s.\\n3. **Paper Degradation**: Mass spectrometry of the paper cellulose fibers indicated a level of lignin decomposition consistent with wood-pulp paper manufactured after 1990.\\n\\n## Resolution\\nConfronted with the physical evidence report, the claimants admitted to forging the document using high-resolution flatbed scanning and artificial chemical aging techniques.\\n\\n## Scientific Significance\\nThis case demonstrates that physical and chemical properties of materials serve as infallible indicators of temporal anomalies in document fabrication.',
          status: 'published',
          createdBy: 'forenclue@gmail.com',
          evidenceLabels: ['Disputed 1965 Land Deed', 'Embossed Seal Microscopy Scan', 'Paper Cellulose Fragment'],
          forensicTechniques: ['Oblique Light Photography', 'High-Resolution Paper Microscopy', 'Spectrophotometry'],
          contentImages: [
            {
              url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600',
              caption: 'High Resolution Document Examination Microscope with Oblique Lighting'
            }
          ],
          attachments: ['https://forenclue.in/sample_cert.pdf'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'TDc7giOcZULHX0MOKGSn',
          title: 'The Museum Heist: Trace Glass & Soil Analysis',
          tag: 'Trace Evidence',
          year: '2024',
          location: 'National Museum of India, Delhi',
          difficulty: 'Advanced',
          type: 'Theft',
          image: 'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?auto=format&fit=crop&q=80&w=1000',
          summary: 'An exquisite Mughal-era gold coin was stolen from a secure display. Soil trace minerals on a discarded glove and microscopic glass fracture analysis reconstructed the exact point of egress.',
          details: '## Case Background\\nOn March 14, 2024, security staff at the National Museum of India reported that a rare Mughal-era gold dinar had been replaced with a high-quality replica. The display case had been breached without triggering local laser tripwires.\\n\\n## Forensic Recovery\\nInvestigating officers recovered a discarded cotton work glove near the ventilation duct. Microscopic analysis of the display case glass window showed a localized edge fracture, indicating a precision mechanical glass cutter had been used. Soil particulates were extracted from the palm side of the recovered glove.\\n\\n## Laboratory Analysis\\n1. **Soil mineralogy**: X-ray diffraction (XRD) of the soil particulates showed high concentrations of kaolinite and specific quartz sand ratios matching a specific construction site located 2.4 kilometers away from the museum.\\n2. **Glass Fracture Refractive Index**: The glass fragments salvaged from the exhibit had a refractive index matching standard 4mm tempered architectural glass, showing clear trace markings from a diamond-tip circular cutter.\\n3. **Latent Prints**: Superglue fuming of the inner surface of the glove successfully yielded a partial latent print corresponding to a known repeat offender, Ajay Verma.\\n\\n## Break in the Case\\nAjay Verma was located at the identified construction site. A search warrant of his residence recovered the genuine gold dinar hidden inside a toolbox. The physical soil match and the latent print from the glove provided a watertight prosecution case.\\n\\n## Scientific Evidence and Conclusion\\nTrace geological mineral comparison and physical glass fracture matches provided irrefutable chemical and spatial evidence linking the suspect to both the crime scene and his arrest location.',
          status: 'published',
          createdBy: 'forenclue@gmail.com',
          evidenceLabels: ['Mughal Dinar Replica', 'Cotton Work Glove', 'Glass Fragment Edge Micro-fractures'],
          forensicTechniques: ['X-ray Diffraction (XRD)', 'Refractive Index Fluid Match', 'Cyanoacrylate Fuming'],
          contentImages: [
            {
              url: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&q=80&w=600',
              caption: 'Mughal Exhibit Gallery Display Case under Cross-Polarized Forensic Light'
            }
          ],
          attachments: ['https://forenclue.in/sample_cert.pdf'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'a60XHfJd43eKVU7httCw',
          title: 'The Bones of Crimson Creek: Facial Reconstruction',
          tag: 'Forensic Anthropology',
          year: '2022',
          location: 'Crimson Creek Woods, Himachal Pradesh',
          difficulty: 'Expert',
          type: 'Cold Case',
          image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1000',
          summary: 'Skeletal remains found in a shallow forest grave after 15 years. Forensic anthropologists reconstructed the skull and used 3D tissue depth mapping to identify the victim and solve a long-forgotten mystery.',
          details: '## Case Background\\nIn October 2022, hikers in Crimson Creek Woods discovered partial skeletal remains exposed due to heavy soil erosion. Initial autopsy indicated the individual had been buried for over a decade. Traditional identification methods like DNA profiling failed initially because no direct family references were available.\\n\\n## Anthropological Assessment\\nForensic anthropologists reconstructed the cranium and pelvis to determine biological profile:\\n1. **Sex**: Male, determined from subpubic angle and robust cranial features.\\n2. **Age**: 28-32 years at death, based on epiphyseal fusion and dental wear patterns.\\n3. **Ancestry**: South Asian.\\n4. **Stature**: Estimated at 178 cm using femur length formulas.\\n\\n## Laboratory Analysis & 3D Reconstruction\\n1. **3D Facial Reconstruction**: The skull was digitized using a high-precision structured light 3D scanner. Virtual tissue depth markers were placed on standard anatomical landmarks (e.g., nasion, glabella, gnathion) based on South Asian average databases.\\n2. **Isotope Analysis**: Carbon-13 and Nitrogen-15 isotope ratios from bone collagen suggested a diet rich in inland grains, placing the individual\'s childhood origin in northern rural agricultural zones.\\n3. **Facial Rendering**: An artist overlaid digital muscle groups and skin tissue to produce a high-fidelity facial portrait.\\n\\n## Break in the Case\\nThe reconstructed face was broadcast on regional news channels. It was recognized by a family in Shimla as Vikram Kapoor, who had mysteriously disappeared in 2007. Subsequent DNA comparison with Vikram\'s living siblings yielded a positive kinship match of 99.98% probability. Police investigation then focused on Vikram\'s former business partner, leading to a successful conviction for manslaughter.\\n\\n## Scientific Significance\\nThis case highlights the power of combining traditional osteology, 3D computerized facial rendering, and modern stable isotope analysis to give a face and a name to long-forgotten victims.',
          status: 'published',
          createdBy: 'forenclue@gmail.com',
          evidenceLabels: ['Reconstructed Cranium Specimen', 'Digitized 3D Tissue Map Grid', 'Femur Bone Fragments'],
          forensicTechniques: ['3D Laser Craniofacial Scanning', 'Osteobiographical Profiling', 'Stable Isotope Mass Spectrometry'],
          contentImages: [
            {
              url: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=600',
              caption: 'Digitized 3D Skull Model with Tissue-Depth Landmarks'
            }
          ],
          attachments: ['https://forenclue.in/sample_cert.pdf'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      // 1. Restore Employees
      for (const emp of demoEmployees) {
        const safeId = emp.employeeId.toUpperCase().trim().replace(/[\/\s]/g, '_');
        await setDoc(doc(db, 'employees', safeId), emp);
      }

      // 2. Restore Certificates
      for (const cert of demoCertificates) {
        const safeId = cert.certificateNo.toUpperCase().trim().replace(/[\/\s]/g, '_');
        await setDoc(doc(db, 'certificates', safeId), cert);
      }

      // 3. Restore Cases
      for (const c of demoCases) {
        const safeId = c.id;
        await setDoc(doc(db, 'cases', safeId), c);
      }

      setSuccessMsg('Employee, Certificate, and Case Study databases successfully restored and seeded directly via Client Console!');
      fetchCollections();
    } catch (err: any) {
      console.error('Error seeding demo data client-side:', err);
      setErrMsg(`Failed to restore databases: ${err.message}`);
    } finally {
      setEmployeeLoading(false);
    }
  };

  // Submit Employee Profile (Create or Edit)
  const handleEmployeeFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeFormData.employeeId.trim() || !employeeFormData.fullName.trim()) {
      setErrMsg('Employee ID and Full Name are required.');
      return;
    }

    setEmployeeLoading(true);
    setSuccessMsg('');
    setErrMsg('');

    const formattedId = employeeFormData.employeeId.toUpperCase().trim();
    const safeId = formattedId.replace(/[\/\s]/g, '_');

    // Split skills by commas and trim whitespace
    const skillsArray = employeeFormData.skills
      ? employeeFormData.skills.split(',').map(s => s.trim()).filter(s => s.length > 0)
      : [];

    // Mock hash generation if new
    const finalChecksum = isEditingEmployee && editEmployeeId
      ? (adminEmployees.find(emp => emp.employeeId === editEmployeeId)?.checksum || Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''))
      : Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');

    const payload: any = {
      employeeId: formattedId,
      fullName: employeeFormData.fullName.trim(),
      position: employeeFormData.position.trim(),
      department: employeeFormData.department,
      joiningDate: employeeFormData.joiningDate,
      expiryDate: employeeFormData.expiryDate,
      status: employeeFormData.status,
      skills: skillsArray,
      clearanceLevel: employeeFormData.clearanceLevel,
      checksum: finalChecksum,
      createdAt: isEditingEmployee && editEmployeeId
        ? (adminEmployees.find(emp => emp.employeeId === editEmployeeId)?.createdAt || new Date().toISOString())
        : new Date().toISOString()
    };

    if (employeeFormData.email.trim()) {
      payload.email = employeeFormData.email.trim();
    }
    if (employeeFormData.phone.trim()) {
      payload.phone = employeeFormData.phone.trim();
    }
    if (employeeFormData.imageUrl.trim()) {
      payload.imageUrl = employeeFormData.imageUrl.trim();
    }

    try {
      await setDoc(doc(db, 'employees', safeId), payload);
      setSuccessMsg(isEditingEmployee ? 'Employee profile updated successfully!' : 'New employee profile registered successfully!');
      
      // Reset form
      setEmployeeFormData({
        employeeId: '',
        fullName: '',
        position: '',
        department: 'Cybersecurity & Digital Forensics',
        joiningDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString().split('T')[0],
        status: 'Active',
        email: '',
        phone: '',
        skills: '',
        imageUrl: '',
        clearanceLevel: 'Level 1 - Employee'
      });
      setIsEditingEmployee(false);
      setEditEmployeeId(null);
      fetchCollections();
    } catch (err: any) {
      console.error('Error saving employee profile:', err);
      setErrMsg(`Failed to save record: ${err.message}`);
    } finally {
      setEmployeeLoading(false);
    }
  };

  const handleEmployeeEditInit = (emp: any) => {
    setIsEditingEmployee(true);
    setEditEmployeeId(emp.employeeId);
    setEmployeeFormData({
      employeeId: emp.employeeId,
      fullName: emp.fullName,
      position: emp.position,
      department: emp.department,
      joiningDate: emp.joiningDate,
      expiryDate: emp.expiryDate,
      status: emp.status,
      email: emp.email || '',
      phone: emp.phone || '',
      skills: emp.skills ? emp.skills.join(', ') : '',
      imageUrl: emp.imageUrl || '',
      clearanceLevel: emp.clearanceLevel || 'Level 1 - Employee'
    });
  };

  const handleEmployeeDelete = async (id: string) => {
    if (!window.confirm(`Are you absolutely sure you want to revoke and delete credentials for Employee ID "${id}"? This action cannot be undone.`)) return;

    setEmployeeLoading(true);
    setSuccessMsg('');
    setErrMsg('');
    try {
      const safeId = id.toUpperCase().trim().replace(/[\/\s]/g, '_');
      await deleteDoc(doc(db, 'employees', safeId));
      setSuccessMsg(`Credentials for ${id} have been successfully revoked.`);
      fetchCollections();
    } catch (err: any) {
      console.error('Error deleting record:', err);
      setErrMsg(`Failed to revoke credentials: ${err.message}`);
    } finally {
      setEmployeeLoading(false);
    }
  };

  // Notifications
  const [successMsg, setSuccessMsg] = useState('');
  const [errMsg, setErrMsg] = useState('');

  // Fetch Admin Collections
  const fetchCollections = async () => {
    if (!isAdmin) return;
    
    setCourseLoading(true);
    setEbookLoading(true);
    setPodcastLoading(true);
    setCertificateLoading(true);

    // 1. Courses
    try {
      const courseSnap = await getDocs(collection(db, 'courses'));
      const coursesList: any[] = [];
      courseSnap.forEach(docSnap => {
        coursesList.push({ docId: docSnap.id, ...docSnap.data() });
      });
      setCourses(coursesList);
    } catch (e) {
      console.error("Error fetching courses collection:", e);
      handleFirestoreError(e, OperationType.LIST, 'courses');
    } finally {
      setCourseLoading(false);
    }

    // 2. Ebooks
    try {
      const ebookSnap = await getDocs(collection(db, 'ebooks'));
      const ebooksList: any[] = [];
      ebookSnap.forEach(docSnap => {
        ebooksList.push({ docId: docSnap.id, ...docSnap.data() });
      });
      setEbooks(ebooksList);
    } catch (e) {
      console.error("Error fetching ebooks collection:", e);
      handleFirestoreError(e, OperationType.LIST, 'ebooks');
    } finally {
      setEbookLoading(false);
    }

    // 3. Website Texts
    try {
      const textSnap = await getDocs(collection(db, 'websiteTexts'));
      const textList: any[] = [];
      textSnap.forEach(docSnap => {
        textList.push({ id: docSnap.id, ...docSnap.data() });
      });
      setCopiedTexts(textList);
    } catch (e) {
      console.error("Error fetching websiteTexts collection:", e);
      handleFirestoreError(e, OperationType.LIST, 'websiteTexts');
    }

    // 4. Doubts
    try {
      const doubtsSnap = await getDocs(collection(db, 'doubts'));
      const doubtsList: any[] = [];
      doubtsSnap.forEach(docSnap => {
        doubtsList.push({ id: docSnap.id, ...docSnap.data() });
      });
      setDoubts(doubtsList);
    } catch (e) {
      console.error("Error fetching doubts collection:", e);
      handleFirestoreError(e, OperationType.LIST, 'doubts');
    }

    // 5. Podcast Episodes
    try {
      const podcastsSnap = await getDocs(collection(db, 'podcastEpisodes'));
      const podcastsList: any[] = [];
      podcastsSnap.forEach(docSnap => {
        podcastsList.push({ docId: docSnap.id, ...docSnap.data() });
      });
      // Sort podcasts by createdAt descending, if available
      podcastsList.sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dbVal = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dbVal - da;
      });
      setPodcastEpisodes(podcastsList);
    } catch (e) {
      console.error("Error fetching podcastEpisodes collection:", e);
      handleFirestoreError(e, OperationType.LIST, 'podcastEpisodes');
    } finally {
      setPodcastLoading(false);
    }

    // 6. Certificates
    try {
      const certSnap = await getDocs(collection(db, 'certificates'));
      const certList: any[] = [];
      certSnap.forEach(docSnap => {
        certList.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Sort certificates by createdAt descending if possible
      certList.sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dbVal = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dbVal - da;
      });
      // Deduplicate certificates by certificateNo to prevent double counting or listing
      const uniqueCertList: any[] = [];
      const seenNos = new Set<string>();
      certList.forEach(cert => {
        const certNo = cert.certificateNo || cert.id || '';
        const normalized = certNo.toUpperCase().trim().replace(/[\s\-_/]/g, '');
        if (normalized) {
          if (!seenNos.has(normalized)) {
            seenNos.add(normalized);
            uniqueCertList.push(cert);
          }
        } else {
          uniqueCertList.push(cert);
        }
      });
      setCertificates(uniqueCertList);
    } catch (e) {
      console.error("Error fetching certificates collection:", e);
    } finally {
      setCertificateLoading(false);
    }

    // 7. Employees
    setEmployeeLoading(true);
    try {
      const empSnap = await getDocs(collection(db, 'employees'));
      const empList: any[] = [];
      empSnap.forEach(docSnap => {
        empList.push(docSnap.data());
      });
      empList.sort((a, b) => (a.employeeId || '').localeCompare(b.employeeId || ''));
      setAdminEmployees(empList);
    } catch (e) {
      console.error("Error fetching employees collection:", e);
      handleFirestoreError(e, OperationType.LIST, 'employees');
    } finally {
      setEmployeeLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchCollections();
    }
  }, [isAdmin]);

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setBtnLoading(true);

    if (!adminLogin) {
      setAuthError('Authentication Service is currently starting. Please retry in 3 seconds.');
      setBtnLoading(false);
      return;
    }

    const success = adminLogin(email, password);
    setBtnLoading(false);

    if (success) {
      setSuccessMsg('Forenclue Core Credentials approved! Elevating access.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      setAuthError('Invalid credentials. Administrator role rejected.');
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError('');
    setGoogleLoading(true);
    try {
      if (signInWithGoogle) {
        await signInWithGoogle();
        setSuccessMsg('Forenclue Google Authentication approved! Elevating access.');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setAuthError('Authentication Service is currently starting. Please try again.');
      }
    } catch (error: any) {
      console.error("Admin Google login failed:", error);
      let errMsg = error.message || "An unexpected error occurred during Google sign-in.";
      if (error.code === 'auth/unauthorized-domain') {
        errMsg = "Unauthorized domain. Please authorize this URL in Firebase console.";
      } else if (error.code === 'auth/popup-blocked') {
        errMsg = "Sign-in popup blocked. Please allow popups for this site.";
      }
      setAuthError(errMsg);
    } finally {
      setGoogleLoading(false);
    }
  };

  // Add Course
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrMsg('');

    if (!newCourse.title || !newCourse.description) {
      setErrMsg('Please enter a course title and summary.');
      return;
    }

    try {
      const generatedId = editingCourseId || String(9000 + (courses.length + Math.floor(Math.random() * 1000)));
      const curriculum = newCourse.curriculumLines
        ? newCourse.curriculumLines.split('\n').filter(Boolean)
        : ['Fundamentals of analysis', 'Evidence collection techniques', 'Real world case audits'];

      const coursePayload = {
        id: Number(generatedId),
        title: newCourse.title,
        instructor: newCourse.instructor,
        price: Number(newCourse.price),
        originalPrice: Number(newCourse.originalPrice),
        level: newCourse.level,
        category: newCourse.category,
        duration: newCourse.duration,
        description: newCourse.description,
        thumbnail: newCourse.thumbnail || 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?auto=format&fit=crop&q=80&w=600',
        instructorImage: newCourse.instructorImage,
        instructorBio: newCourse.instructorBio,
        curriculum,
        notices: [
          { id: 1, date: new Date().toLocaleDateString(), content: 'Investigation course published. Welcome to the workspace.' }
        ],
        modules: modules
      };

      // Create or Update document in firestore with ID as document name
      await setDoc(doc(db, 'courses', String(generatedId)), coursePayload);
      
      setSuccessMsg(editingCourseId ? `Investigation Course updated!` : `Investigation Course "${newCourse.title}" successfully compiled and listed!`);
      setEditingCourseId(null);
      setNewCourse({
        title: '',
        instructor: 'Ayush Gaikwad',
        price: 0,
        originalPrice: 4999,
        level: 'Beginner',
        category: 'Forensic Science',
        duration: '12 Hours',
        description: '',
        thumbnail: '',
        instructorImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        instructorBio: 'Lead Forensic Investigator & Cyber Analyst.',
        curriculumLines: ''
      });
      fetchCollections();
    } catch (err: any) {
      console.error(err);
      setErrMsg(`Failed to submit: ${err.message}`);
    }
  };

  const handlePdfUploadDirect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setPdfErrorText('');
    setPdfSuccessText('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        setPdfErrorText('Please select a valid PDF document.');
        return;
      }
      setIsUploadingPdf(true);
      setPdfSuccessText('Processing eLibrary PDF...');
      try {
        const cleanName = `ebooks/pdfs/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const uploadResult = await uploadFileResilient(file, cleanName, (msg) => setPdfSuccessText(msg));
        const downloadUrl = uploadResult.url;
        
        // Calculate file size
        const bytes = file.size;
        const sizeStr = bytes > 1024 * 1024 
          ? `${(bytes / (1024 * 1024)).toFixed(1)}MB` 
          : `${Math.round(bytes / 1024)}KB`;

        setNewEbook(prev => ({
          ...prev,
          pdfUrl: downloadUrl,
          size: sizeStr
        }));
        setPdfSuccessText(uploadResult.isFallback 
          ? `PDF saved offline successfully! (${file.name})` 
          : `PDF uploaded successfully: ${file.name}`
        );
        setPdfErrorText('');
      } catch (err: any) {
        console.error(err);
        setPdfErrorText(`PDF upload failed: ${err.message || err}`);
        setPdfSuccessText('');
      } finally {
        setIsUploadingPdf(false);
      }
    }
  };

  const handleCoverUploadDirect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setCoverErrorText('');
    setCoverSuccessText('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setCoverErrorText('Please select a valid image file for the book cover.');
        return;
      }
      setIsUploadingCover(true);
      setCoverSuccessText('Processing cover image...');
      try {
        const cleanName = `ebooks/covers/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const uploadResult = await uploadFileResilient(file, cleanName, (msg) => setCoverSuccessText(msg));
        const downloadUrl = uploadResult.url;
        setNewEbook(prev => ({
          ...prev,
          image: downloadUrl
        }));
        setCoverSuccessText(uploadResult.isFallback
          ? `Cover image saved offline successfully! (${file.name})`
          : `Cover image uploaded successfully: ${file.name}`
        );
        setCoverErrorText('');
      } catch (err: any) {
        console.error(err);
        setCoverErrorText(`Cover image upload failed: ${err.message || err}`);
        setCoverSuccessText('');
      } finally {
        setIsUploadingCover(false);
      }
    }
  };

  const handleThumbUploadDirect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setThumbErrorText('');
    setThumbSuccessText('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setThumbErrorText('Please select a valid image file for the course thumbnail.');
        return;
      }
      setIsUploadingThumb(true);
      setThumbSuccessText('Processing course thumbnail...');
      try {
        const cleanName = `courses/thumbnails/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const uploadResult = await uploadFileResilient(file, cleanName, (msg) => setThumbSuccessText(msg));
        const downloadUrl = uploadResult.url;
        setNewCourse(prev => ({
          ...prev,
          thumbnail: downloadUrl
        }));
        setThumbSuccessText(uploadResult.isFallback
          ? `Course thumbnail saved offline successfully! (${file.name})`
          : `Course thumbnail uploaded successfully: ${file.name}`
        );
        setThumbErrorText('');
      } catch (err: any) {
        console.error(err);
        setThumbErrorText(`Course thumbnail upload failed: ${err.message || err}`);
        setThumbSuccessText('');
      } finally {
        setIsUploadingThumb(false);
      }
    }
  };

  // Add Ebook
  const handleCreateEbook = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrMsg('');

    if (!newEbook.title || !newEbook.pdfUrl) {
      setErrMsg('Please input eBook title and source PDF URL.');
      return;
    }

    try {
      const ebookPayload = {
        title: newEbook.title,
        author: newEbook.author || 'Forensic Expert',
        year: Number(newEbook.year),
        category: newEbook.category,
        tabCategory: newEbook.tabCategory,
        type: newEbook.type,
        size: newEbook.size,
        image: newEbook.image || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300',
        pdfUrl: newEbook.pdfUrl,
        desc: newEbook.desc || 'Forensic reference files.'
      };

      if (editingEbookId) {
        await setDoc(doc(db, 'ebooks', editingEbookId), ebookPayload);
        setSuccessMsg(`eBook "${newEbook.title}" updated!`);
      } else {
        await addDoc(collection(db, 'ebooks'), ebookPayload);
        setSuccessMsg(`eBook "${newEbook.title}" added to E-Library!`);
      }
      setEditingEbookId(null);
      setNewEbook({
        title: '',
        author: '',
        year: new Date().getFullYear(),
        category: 'Fundamentals',
        tabCategory: 'books',
        type: 'PDF',
        size: '12MB',
        image: '',
        pdfUrl: '',
        desc: ''
      });
      fetchCollections();
    } catch (err: any) {
      console.error(err);
      setErrMsg(`Failed to add ebook: ${err.message}`);
    }
  };

  // Edit / Add Website text general
  const handleUpdateWebsiteText = async (key: string, val: string) => {
    setSuccessMsg('');
    setErrMsg('');

    if (!key.trim() || !val.trim()) {
      setErrMsg('Please enter a valid key and paragraph text value.');
      return;
    }

    try {
      await setDoc(doc(db, 'websiteTexts', key.trim()), { text: val });
      setSuccessMsg(`Website Copy for "${key}" successfully saved live.`);
      setTextKey('');
      setTextVal('');
      fetchCollections();
    } catch (err: any) {
      console.error(err);
      setErrMsg(`Failed to save web copy: ${err.message}`);
    }
  };

  // Delete Course
  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm("Are you sure you want to declassify and delete this course? This action cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, 'courses', courseId));
      setSuccessMsg("Investigation course successfully purged.");
      fetchCollections();
    } catch (err: any) {
      setErrMsg(`Purge failed: ${err.message}`);
    }
  };

  // Delete Ebook
  const handleDeleteEbook = async (ebookId: string) => {
    if (!window.confirm("Delete this eBook resource?")) return;
    try {
      await deleteDoc(doc(db, 'ebooks', ebookId));
      setSuccessMsg("Resource successfully deleted.");
      fetchCollections();
    } catch (err: any) {
      setErrMsg(`Resource deletion failed: ${err.message}`);
    }
  };

  // Delete Case
  const handleDeleteCase = async (caseId: string) => {
    if (!window.confirm("Are you sure you want to delete this case study?")) return;
    try {
      await deleteDoc(doc(db, 'cases', caseId));
      setSuccessMsg("Case Study deleted successfully.");
      fetchCollections();
    } catch(e: any) {
      setErrMsg(`Failed to delete case: ${e.message}`);
    }
  };

  // Create or Update Certificate
  const handleCreateCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrMsg('');

    if (!newCertificate.certificateNo || !newCertificate.fullName || !newCertificate.courseTitle) {
      setErrMsg('Please enter a certificate number, full name, and course title.');
      return;
    }

    try {
      const normalizedNo = newCertificate.certificateNo.toUpperCase().trim();
      const safeDocId = normalizedNo.replace(/\//g, '_');
      const certificatePayload = {
        certificateNo: normalizedNo,
        fullName: newCertificate.fullName.trim(),
        courseTitle: newCertificate.courseTitle.trim(),
        certificateType: newCertificate.certificateType,
        issueDate: newCertificate.issueDate,
        imageUrl: newCertificate.imageUrl || '',
        pdfUrl: newCertificate.pdfUrl || '',
        additionalDetails: newCertificate.additionalDetails || '',
        createdAt: new Date().toISOString()
      };

      // Create or update document in certificates collection using a safe ID without slashes
      await setDoc(doc(db, 'certificates', safeDocId), certificatePayload);

      setSuccessMsg(editingCertificateId ? 'Certificate successfully updated!' : `Certificate "${normalizedNo}" issued and registered!`);
      setEditingCertificateId(null);
      setNewCertificate({
        certificateNo: '',
        fullName: '',
        courseTitle: '',
        certificateType: 'Internship Completion',
        issueDate: new Date().toISOString().split('T')[0],
        imageUrl: '',
        pdfUrl: '',
        additionalDetails: ''
      });
      fetchCollections();
    } catch (err: any) {
      console.error(err);
      setErrMsg(`Failed to submit certificate: ${err.message}`);
    }
  };

  // Delete Certificate
  const handleDeleteCertificate = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this certificate? This action cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, 'certificates', id));
      setSuccessMsg("Certificate successfully deleted.");
      fetchCollections();
    } catch (err: any) {
      setErrMsg(`Delete failed: ${err.message}`);
    }
  };

  // Upload Certificate Visual Image Copy
  const handleCertImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setCertImageErrorText('');
    setCertImageSuccessText('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setCertImageErrorText('Please select a valid image file.');
        return;
      }
      setIsUploadingCertImage(true);
      setCertImageSuccessText('Uploading certificate image copy...');
      try {
        const cleanName = `certificates/images/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const uploadResult = await uploadFileResilient(file, cleanName, (msg) => setCertImageSuccessText(msg));
        setNewCertificate(prev => ({
          ...prev,
          imageUrl: uploadResult.url
        }));
        setCertImageSuccessText(uploadResult.isFallback
          ? `Certificate image saved offline successfully! (${file.name})`
          : `Certificate image uploaded successfully: ${file.name}`
        );
      } catch (err: any) {
        console.error(err);
        setCertImageErrorText(`Upload failed: ${err.message || err}`);
      } finally {
        setIsUploadingCertImage(false);
      }
    }
  };

  // Upload Certificate PDF copy
  const handleCertPdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setCertPdfErrorText('');
    setCertPdfSuccessText('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        setCertPdfErrorText('Please select a valid PDF file.');
        return;
      }
      setIsUploadingCertPdf(true);
      setCertPdfSuccessText('Uploading certificate PDF copy...');
      try {
        const cleanName = `certificates/pdfs/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const uploadResult = await uploadFileResilient(file, cleanName, (msg) => setCertPdfSuccessText(msg));
        setNewCertificate(prev => ({
          ...prev,
          pdfUrl: uploadResult.url
        }));
        setCertPdfSuccessText(uploadResult.isFallback
          ? `Certificate PDF saved offline successfully! (${file.name})`
          : `Certificate PDF uploaded successfully: ${file.name}`
        );
      } catch (err: any) {
        console.error(err);
        setCertPdfErrorText(`Upload failed: ${err.message || err}`);
      } finally {
        setIsUploadingCertPdf(false);
      }
    }
  };

  const handlePodcastCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setPodcastCoverErrorText('');
    setPodcastCoverSuccessText('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setPodcastCoverErrorText('Please select a valid image file.');
        return;
      }
      setIsUploadingPodcastCover(true);
      setPodcastCoverSuccessText('Processing cover image...');
      try {
        const cleanName = `podcasts/covers/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const uploadResult = await uploadFileResilient(file, cleanName, (msg) => setPodcastCoverSuccessText(msg));
        setNewEpisode(prev => ({
          ...prev,
          coverImage: uploadResult.url
        }));
        setPodcastCoverSuccessText(uploadResult.isFallback
          ? `Cover saved offline successfully! (${file.name})`
          : `Cover uploaded successfully: ${file.name}`
        );
      } catch (err: any) {
        console.error(err);
        setPodcastCoverErrorText(`Cover upload failed: ${err.message || err}`);
      } finally {
        setIsUploadingPodcastCover(false);
      }
    }
  };

  const handleAudioUploadDirect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setAudioErrorText('');
    setAudioSuccessText('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('audio/') && !file.name.endsWith('.mp3') && !file.name.endsWith('.wav') && !file.name.endsWith('.m4a') && !file.name.endsWith('.mp4') && !file.name.endsWith('.aac')) {
        setAudioErrorText('Please select a valid audio file (e.g., mp3, wav, m4a).');
        return;
      }
      setIsUploadingAudio(true);
      setAudioSuccessText('Processing audio file...');
      try {
        const cleanName = `podcasts/audio/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const uploadResult = await uploadFileResilient(file, cleanName, (msg) => setAudioSuccessText(msg));
        
        let durationStr = "30:00";
        let durationSecVal = 1800;
        try {
          const audio = new Audio();
          audio.src = URL.createObjectURL(file);
          await new Promise<void>((resolve) => {
            audio.addEventListener('loadedmetadata', () => {
              const totalSecs = Math.round(audio.duration);
              durationSecVal = totalSecs;
              const mins = Math.floor(totalSecs / 60);
              const secs = totalSecs % 60;
              durationStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
              resolve();
            });
            audio.addEventListener('error', () => {
              resolve();
            });
            setTimeout(resolve, 3000);
          });
        } catch (e1) {
          console.log("Could not measure duration automatically:", e1);
        }

        setNewEpisode(prev => ({
          ...prev,
          audioUrl: uploadResult.url,
          duration: durationStr,
          durationSec: durationSecVal
        }));
        
        setAudioSuccessText(uploadResult.isFallback
          ? `Audio saved offline successfully! (${file.name})`
          : `Audio uploaded successfully: ${file.name}`
        );
      } catch (err: any) {
        console.error(err);
        setAudioErrorText(`Audio upload failed: ${err.message || err}`);
      } finally {
        setIsUploadingAudio(false);
      }
    }
  };

  const handleCreatePodcastEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrMsg('');

    if (!newEpisode.title || !newEpisode.audioUrl) {
      setErrMsg('Please enter a podcast title and audio URL.');
      return;
    }

    try {
      const episodePayload = {
        title: newEpisode.title,
        description: newEpisode.description || 'Listen to this podcast episode by ForenClue.',
        coverImage: newEpisode.coverImage || 'https://www.dropbox.com/scl/fi/mcd47n75jiji29z8hyl9l/IMG_1221.png?rlkey=710x7h05bztk8kjcmxrvgpomj&st=hd2lg2mz&raw=1',
        audioUrl: newEpisode.audioUrl,
        date: newEpisode.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        duration: newEpisode.duration || '30:00',
        durationSec: Number(newEpisode.durationSec) || 1800,
        createdAt: new Date().toISOString()
      };

      if (editingPodcastId) {
        await setDoc(doc(db, 'podcastEpisodes', editingPodcastId), episodePayload);
        setSuccessMsg(`Podcast Episode "${newEpisode.title}" updated successfully!`);
      } else {
        await addDoc(collection(db, 'podcastEpisodes'), episodePayload);
        setSuccessMsg(`Podcast Episode "${newEpisode.title}" published successfully!`);
      }
      
      setEditingPodcastId(null);
      setNewEpisode({
        title: '',
        description: '',
        coverImage: '',
        audioUrl: '',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        duration: '30:00',
        durationSec: 1800
      });
      fetchCollections();
    } catch (err: any) {
      console.error(err);
      setErrMsg(`Failed to submit podcast episode: ${err.message}`);
    }
  };

  const handleDeletePodcastEpisode = async (episodeId: string) => {
    if (!window.confirm("Are you sure you want to delete this podcast episode?")) return;
    try {
      await deleteDoc(doc(db, 'podcastEpisodes', episodeId));
      setSuccessMsg("Podcast Episode successfully deleted.");
      fetchCollections();
    } catch (err: any) {
      setErrMsg(`Failed to delete podcast: ${err.message}`);
    }
  };

  // Helper to add lesson to modules mock config
  const addLessonToModule = (modIdx: number) => {
    const updated = [...modules];
    const newLId = `l_${Date.now()}`;
    updated[modIdx].lessons.push({
      id: newLId,
      title: 'New Lesson Title',
      duration: '10 Mins',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    });
    setModules(updated);
  };

  const addModuleToCourse = () => {
    const newMId = `m_${Date.now()}`;
    setModules([
      ...modules,
      {
        id: newMId,
        title: `Module ${modules.length + 1}: Specimen investigation analysis`,
        lessons: [
          { id: `l_${Date.now()}`, title: 'Lesson 1: Introduction to Module Specimen', duration: '12 Mins', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
        ]
      }
    ]);
  };

  const handleLessonChange = (modIdx: number, lesIdx: number, field: string, val: string) => {
    const updated = [...modules];
    updated[modIdx].lessons[lesIdx] = {
      ...updated[modIdx].lessons[lesIdx],
      [field]: val
    };
    setModules(updated);
  };

  const handleModuleTitleChange = (modIdx: number, val: string) => {
    const updated = [...modules];
    updated[modIdx].title = val;
    setModules(updated);
  };

  return (
    <div className="pt-24 pb-16 min-h-screen bg-base relative overflow-hidden text-text-main">
      {/* Dynamic Background decor */}
      <div className="absolute top-0 left-0 w-full h-[36rem] bg-surface z-0 border-b border-black/10 dark:border-white/5 opacity-50">
        <div className="absolute inset-0 bg-grid-white/[0.015] bg-[size:24px_24px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-base"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Alerts and triggers */}
        <AnimatePresence>
          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 p-4 bg-green-500/15 border border-green-500/30 text-green-400 rounded-xl flex items-center gap-3 font-medium text-sm"
            >
              <CheckCircle2 className="shrink-0" size={18} />
              <span>{successMsg}</span>
            </motion.div>
          )}
          {errMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 p-4 bg-red-500/15 border border-red-500/30 text-red-400 rounded-xl flex items-center gap-3 font-medium text-sm"
            >
              <AlertCircle className="shrink-0" size={18} />
              <span>{errMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* NOT LOGGED IN CHALLENGE */}
        {!isAdmin ? (
          <div className="max-w-md mx-auto py-12">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-surface border border-black/10 dark:border-white/5 rounded-2xl p-8 shadow-2xl relative"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 bg-warning/10 border border-warning/20 text-warning rounded-full shadow-[0_0_20px_rgba(240,230,140,0.3)]">
                <Lock size={28} />
              </div>

              <div className="text-center mt-6 mb-8">
                <h1 className="text-2xl font-bold uppercase tracking-tight font-heading text-text-main">
                  Forenclue <span className="text-warning">Authorization</span> Setup
                </h1>
                <p className="text-xs text-text-muted mt-2 uppercase tracking-widest font-mono">
                  SECURE ADMINISTRATION PORTAL
                </p>
              </div>

              {authError && (
                <div className="p-3 bg-red-500/15 border border-red-500/30 text-red-500 rounded-lg text-xs font-mono mb-4 text-center">
                  {authError}
                </div>
              )}

              <form onSubmit={handleManualLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-text-muted mb-2 uppercase">Admin Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="forenclue@gmail.com"
                      className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs font-bold outline-none focus:border-warning/50 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-text-muted mb-2 uppercase">Password</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs font-bold outline-none focus:border-warning/50 transition-colors"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={btnLoading}
                  className="w-full bg-warning text-crust hover:bg-warning/90 py-3 rounded-xl text-xs font-extrabold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mt-6 shadow-[0_4px_20px_rgba(240,230,140,0.15)]"
                >
                  {btnLoading ? <Loader2 className="animate-spin" size={14} /> : 'Authorize Workspace'}
                </button>
              </form>

              <div className="relative flex items-center justify-center my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-black/10 dark:border-white/5" />
                </div>
                <span className="px-3 bg-surface text-[10px] font-mono text-text-muted uppercase tracking-[0.25em] relative">
                  OR
                </span>
              </div>

              <button 
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full h-12 bg-white text-black hover:bg-warning/20 border border-black/10 dark:border-white/5 font-heading font-black text-xs uppercase tracking-[0.18em] rounded-xl hover:text-white transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
              >
                {googleLoading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                    <span>Authorize with Google</span>
                  </>
                )}
              </button>
            </motion.div>
          </div>
        ) : (
          
          /* LOGGED IN ACTIVE WORKSPACE */
          <div>
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 border-b border-black/10 dark:border-white/5 pb-8">
              <div>
                <span className="text-[10px] bg-warning/10 text-warning px-3 py-1 font-mono uppercase tracking-widest rounded-full border border-warning/20">
                  Secure Administrative Station
                </span>
                <h1 className="text-4xl md:text-5xl font-heading font-black uppercase tracking-tighter mt-4 text-text-main">
                  Forenclue <span className="text-warning">Control Deck</span>
                </h1>
                <p className="text-sm text-text-muted mt-2 font-mono uppercase tracking-widest">
                  ROOT PRIVILEGES ACTIVE • LEVEL 1 FORENSIC ACCESS
                </p>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={() => navigate('/cases')} 
                  className="px-4 py-2 border border-black/10 dark:border-white/10 rounded-xl text-xs font-bold hover:bg-surface transition-colors flex items-center gap-2 hover:border-warning/30 text-text-muted hover:text-text-main"
                >
                  <Globe size={14} /> View Case Studies
                </button>
                <button 
                  onClick={logout} 
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
                >
                  <LogOut size={14} /> Relinquish Credentials
                </button>
              </div>
            </div>

            {/* Dashboard Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              {/* Workspace Navigation Sidebar */}
              <div className="space-y-2">
                <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest px-3 mb-2">Systems Controls</p>
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={`w-full text-left px-4 py-3 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-3 transition-colors ${activeTab === 'overview' ? 'bg-warning text-crust' : 'bg-surface hover:bg-surface/80 text-text-muted hover:text-text-main border border-black/5 dark:border-white/5'}`}
                >
                  <LayoutGrid size={16} /> Overview Reports
                </button>
                <button 
                  onClick={() => setActiveTab('courses')}
                  className={`w-full text-left px-4 py-3 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-3 transition-colors ${activeTab === 'courses' ? 'bg-warning text-crust' : 'bg-surface hover:bg-surface/80 text-text-muted hover:text-text-main border border-black/5 dark:border-white/5'}`}
                >
                  <BookOpen size={16} /> Core Courses
                </button>
                <button 
                  onClick={() => setActiveTab('ebooks')}
                  className={`w-full text-left px-4 py-3 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-3 transition-colors ${activeTab === 'ebooks' ? 'bg-warning text-crust' : 'bg-surface hover:bg-surface/80 text-text-muted hover:text-text-main border border-black/5 dark:border-white/5'}`}
                >
                  <FileText size={16} /> E-Library Books
                </button>
                <button 
                  onClick={() => setActiveTab('podcast')}
                  className={`w-full text-left px-4 py-3 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-3 transition-colors ${activeTab === 'podcast' ? 'bg-warning text-crust' : 'bg-surface hover:bg-surface/80 text-text-muted hover:text-text-main border border-black/5 dark:border-white/5'}`}
                >
                  <Radio size={16} /> ForenClue Podcast
                </button>
                <button 
                  onClick={() => setActiveTab('doubts')}
                  className={`w-full text-left px-4 py-3 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-3 transition-colors ${activeTab === 'doubts' ? 'bg-warning text-crust' : 'bg-surface hover:bg-surface/80 text-text-muted hover:text-text-main border border-black/5 dark:border-white/5'}`}
                >
                  <MessageSquare size={16} /> Community Doubts
                </button>
                <button 
                  onClick={() => setActiveTab('certificates')}
                  className={`w-full text-left px-4 py-3 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-3 transition-colors ${activeTab === 'certificates' ? 'bg-warning text-crust' : 'bg-surface hover:bg-surface/80 text-text-muted hover:text-text-main border border-black/5 dark:border-white/5'}`}
                >
                  <Award size={16} /> Certificates Manager
                </button>
                <button 
                  onClick={() => setActiveTab('employees')}
                  className={`w-full text-left px-4 py-3 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-3 transition-colors ${activeTab === 'employees' ? 'bg-warning text-crust' : 'bg-surface hover:bg-surface/80 text-text-muted hover:text-text-main border border-black/5 dark:border-white/5'}`}
                >
                  <Users size={16} /> Employee Manager
                </button>
                <Link 
                  to="/forms"
                  className="w-full text-left px-4 py-3 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-3 transition-colors bg-surface hover:bg-surface/80 text-text-muted hover:text-warning border border-black/5 dark:border-white/5 cursor-pointer"
                >
                  <ClipboardList size={16} /> Google Forms Portal
                </Link>
              </div>

              {/* Active Control Panel Canvas */}
              <div className="lg:col-span-3">
                
                {/* 1. OVERVIEW SYSTEM REPORT */}
                {activeTab === 'overview' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="bg-surface border border-black/10 dark:border-white/5 rounded-2xl p-6">
                      <h2 className="text-xl font-heading font-black uppercase tracking-tight mb-4">Workspace Analytics</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
                        <div className="bg-base border border-black/5 dark:border-white/5 p-4 rounded-xl text-center">
                          <span className="text-xs uppercase tracking-wider text-text-muted block mb-1">Dynamic Courses</span>
                          <span className="text-3xl font-heading font-black text-warning">{courses.length}</span>
                        </div>
                        <div className="bg-base border border-black/5 dark:border-white/5 p-4 rounded-xl text-center">
                          <span className="text-xs uppercase tracking-wider text-text-muted block mb-1">E-Library Resources</span>
                          <span className="text-3xl font-heading font-black text-warning">{ebooks.length}</span>
                        </div>
                        <div className="bg-base border border-black/5 dark:border-white/5 p-4 rounded-xl text-center">
                          <span className="text-xs uppercase tracking-wider text-text-muted block mb-1">Podcast Episodes</span>
                          <span className="text-3xl font-heading font-black text-warning">{podcastEpisodes.length}</span>
                        </div>
                        <div className="bg-base border border-black/5 dark:border-white/5 p-4 rounded-xl text-center">
                          <span className="text-xs uppercase tracking-wider text-text-muted block mb-1">Customised Copy Keys</span>
                          <span className="text-3xl font-heading font-black text-warning">{copiedTexts.length}</span>
                        </div>
                        <div className="bg-base border border-black/5 dark:border-white/5 p-4 rounded-xl text-center">
                          <span className="text-xs uppercase tracking-wider text-text-muted block mb-1">Certificates Issued</span>
                          <span className="text-3xl font-heading font-black text-warning">{certificates.length}</span>
                        </div>
                        <div className="bg-base border border-black/5 dark:border-white/5 p-4 rounded-xl text-center">
                          <span className="text-xs uppercase tracking-wider text-text-muted block mb-1">Employees Manager</span>
                          <span className="text-3xl font-heading font-black text-warning">{adminEmployees.length}</span>
                        </div>
                      </div>
                    </div>

                    {/* DATABASE RESTORATION ENGINE */}
                    <div className="bg-surface border border-black/10 dark:border-white/5 rounded-2xl p-6 mb-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-1">
                          <h2 className="text-lg font-heading font-black uppercase tracking-tight text-warning flex items-center gap-2">
                            <Database size={18} className="text-warning animate-pulse" /> 
                            Database Restoration Engine
                          </h2>
                          <p className="text-xs text-text-muted max-w-2xl leading-relaxed">
                            If your verification systems are empty or cleared, click below to instantly seed and restore all official **ForenClue Employee Digital IDs** and **Course/Internship Verification Certificates** in the database.
                          </p>
                        </div>
                        <button
                          onClick={seedDemoEmployees}
                          disabled={employeeLoading}
                          className="w-full sm:w-auto px-5 py-3 bg-warning hover:bg-warning/90 disabled:opacity-50 text-crust font-black rounded-xl text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-warning/10"
                        >
                          <RefreshCw size={14} className={employeeLoading ? "animate-spin" : ""} />
                          <span>{employeeLoading ? "Restoring..." : "Restore Databases"}</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-surface border border-black/10 dark:border-white/5 rounded-2xl p-6">
                      <h2 className="text-xl font-heading font-black uppercase tracking-tight mb-4">Quick Shortcuts</h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div 
                          onClick={() => setActiveTab('courses')}
                          className="p-4 bg-base hover:bg-black/10 dark:hover:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl cursor-pointer transition-colors"
                        >
                          <h3 className="font-bold text-sm text-warning mb-2 uppercase">Create Course Dossier</h3>
                          <p className="text-xs text-text-muted leading-relaxed">Submit syllabus, lectures, pricing tags, and noticeboards dynamically into Firestore.</p>
                        </div>
                        <div 
                          onClick={() => setActiveTab('podcast')}
                          className="p-4 bg-base hover:bg-black/10 dark:hover:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl cursor-pointer transition-colors"
                        >
                          <h3 className="font-bold text-sm text-warning mb-2 uppercase">Upload Podcast Episode</h3>
                          <p className="text-xs text-text-muted leading-relaxed">Publish new MP3 audio channels, dynamic titles, and podcast series covers directly.</p>
                        </div>
                        <div 
                          onClick={() => setActiveTab('certificates')}
                          className="p-4 bg-base hover:bg-black/10 dark:hover:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl cursor-pointer transition-colors"
                        >
                          <h3 className="font-bold text-sm text-warning mb-2 uppercase">Issue Verified Certificate</h3>
                          <p className="text-xs text-text-muted leading-relaxed">Register authentic Forenclue certificates with secure, verifiable verification codes.</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 2. DYNAMIC COURSE BUILDING ENGINE */}
                {activeTab === 'courses' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    {/* Add Course form container */}
                    <div className="bg-surface border border-black/10 dark:border-white/5 rounded-2xl p-6">
                      <h2 className="text-xl font-heading font-black uppercase tracking-tight mb-6">Build New Course Dossier</h2>
                      <form onSubmit={handleCreateCourse} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Course Title *</label>
                            <input 
                              type="text" 
                              value={newCourse.title} 
                              onChange={e => setNewCourse({...newCourse, title: e.target.value})} 
                              placeholder="e.g. Masterclass in Cyber Fingerprint Audits" 
                              className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-2 px-3 text-xs font-bold outline-none text-text-main focus:border-warning/50 transition-colors"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Instructor Name</label>
                            <input 
                              type="text" 
                              value={newCourse.instructor} 
                              onChange={e => setNewCourse({...newCourse, instructor: e.target.value})} 
                              placeholder="Ayush Gaikwad" 
                              className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-2 px-3 text-xs font-bold outline-none text-text-main focus:border-warning/50 transition-colors"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Price (INR)</label>
                            <input 
                              type="number" 
                              value={newCourse.price} 
                              onChange={e => setNewCourse({...newCourse, price: Number(e.target.value)})} 
                              className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-2 px-3 text-xs font-bold outline-none text-text-main focus:border-warning/50 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Original Price (INR)</label>
                            <input 
                              type="number" 
                              value={newCourse.originalPrice} 
                              onChange={e => setNewCourse({...newCourse, originalPrice: Number(e.target.value)})} 
                              className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-2 px-3 text-xs font-bold outline-none text-text-main focus:border-warning/50 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Course Level</label>
                            <select 
                              value={newCourse.level} 
                              onChange={e => setNewCourse({...newCourse, level: e.target.value})} 
                              className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-2 px-3 text-xs font-bold outline-none text-text-main focus:border-warning/50 transition-colors"
                            >
                              <option value="Beginner">Beginner Phase</option>
                              <option value="Intermediate">Intermediate Phase</option>
                              <option value="Advanced">Advanced Phase</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Category</label>
                            <input 
                              type="text" 
                              value={newCourse.category} 
                              onChange={e => setNewCourse({...newCourse, category: e.target.value})} 
                              placeholder="Cyber, Ballistics, etc." 
                              className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-2.5 px-3 text-xs font-bold outline-none text-text-main focus:border-warning/50 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Duration Block</label>
                            <input 
                              type="text" 
                              value={newCourse.duration} 
                              onChange={e => setNewCourse({...newCourse, duration: e.target.value})} 
                              placeholder="e.g. 14 Hours" 
                              className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-2.5 px-3 text-xs font-bold outline-none text-text-main focus:border-warning/50 transition-colors"
                            />
                          </div>
                          <div className="bg-base/30 border border-black/5 dark:border-white/5 rounded-xl p-2.5 space-y-2">
                            <label className="block text-[10px] font-mono text-text-muted uppercase">Thumbnail (URL or Upload)</label>
                            <input 
                              type="text" 
                              value={newCourse.thumbnail} 
                              onChange={e => setNewCourse({...newCourse, thumbnail: e.target.value})} 
                              placeholder="URL or click below to upload" 
                              className="w-full bg-base border border-black/10 dark:border-white/10 rounded-lg py-1.5 px-2 text-[11px] font-semibold outline-none text-text-main focus:border-warning/50 transition-colors"
                            />
                            <div className="flex items-center gap-2">
                              <label className="flex-1 flex items-center justify-center gap-1.5 bg-warning/10 hover:bg-warning/15 border border-warning/20 hover:border-warning/30 text-warning px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors">
                                <Upload size={12} />
                                <span>{isUploadingThumb ? 'Uploading...' : 'Upload Image'}</span>
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  onChange={handleThumbUploadDirect} 
                                  className="hidden" 
                                  disabled={isUploadingThumb}
                                />
                              </label>
                              {newCourse.thumbnail && (
                                <ResilientImage src={newCourse.thumbnail} alt="Preview" className="w-6 h-6 rounded object-cover border border-black/10 dark:border-white/10" />
                              )}
                            </div>
                            {thumbSuccessText && (
                              <p className="text-[10px] font-mono text-green-500 mt-1.5 bg-green-500/5 px-2 py-1 rounded border border-green-500/10">{thumbSuccessText}</p>
                            )}
                            {thumbErrorText && (
                              <p className="text-[10px] font-mono text-red-500 mt-1.5 bg-red-500/5 px-2 py-1 rounded border border-red-500/10">{thumbErrorText}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Description summary *</label>
                          <textarea 
                            value={newCourse.description} 
                            onChange={e => setNewCourse({...newCourse, description: e.target.value})} 
                            rows={3}
                            placeholder="Detailed overview mapping core specimen forensics..." 
                            className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-2 px-3 text-xs font-sans outline-none text-text-main focus:border-warning/50 transition-colors"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Curriculum Highlights (One bullet line per row)</label>
                          <textarea 
                            value={newCourse.curriculumLines} 
                            onChange={e => setNewCourse({...newCourse, curriculumLines: e.target.value})} 
                            rows={3}
                            placeholder="Specimen processing methods&#10;Ballistics testing systems&#10;Advanced chromatography audits" 
                            className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-2 px-3 text-xs font-mono outline-none text-text-main focus:border-warning/50 transition-colors"
                          />
                        </div>

                        {/* Modules Builder Section */}
                        <div className="border border-black/10 dark:border-white/5 rounded-xl p-4 bg-base/40 space-y-4">
                          <div className="flex justify-between items-center pb-2 border-b border-black/10 dark:border-white/10">
                            <div>
                              <h3 className="text-xs font-black uppercase text-warning">Modules & Video Lectures Syllabus</h3>
                              <p className="text-[10px] text-text-muted leading-none mt-1">Populate learning steps and Youtube iframe keys.</p>
                            </div>
                            <button 
                              type="button" 
                              onClick={addModuleToCourse}
                              className="px-3 py-1 bg-warning/10 border border-warning/20 text-warning text-[10px] uppercase font-black tracking-widest rounded-md hover:bg-warning/20 transition-colors"
                            >
                              + Append Module
                            </button>
                          </div>

                          {modules.map((mod, modIdx) => (
                            <div key={mod.id} className="p-3 bg-surface border border-black/5 dark:border-white/5 rounded-lg space-y-3">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-warning">M{modIdx + 1}:</span>
                                <input 
                                  type="text" 
                                  value={mod.title} 
                                  onChange={e => handleModuleTitleChange(modIdx, e.target.value)}
                                  className="flex-1 bg-base border border-black/5 dark:border-white/10 rounded-lg px-2 py-1 text-xs font-bold focus:border-warning outline-none text-text-main"
                                  placeholder="Module Heading Title"
                                />
                                <button 
                                  type="button" 
                                  onClick={() => addLessonToModule(modIdx)}
                                  className="text-[9px] text-warning bg-warning/5 border border-warning/10 px-2 py-1 rounded"
                                >
                                  + Append Lesson Video
                                </button>
                              </div>

                              <div className="pl-4 space-y-2">
                                {mod.lessons?.map((les: any, lesIdx: number) => (
                                  <div key={les.id} className="grid grid-cols-1 md:grid-cols-3 gap-2 p-2 bg-base/50 rounded border border-black/5 dark:border-white/5">
                                    <input 
                                      type="text" 
                                      value={les.title} 
                                      placeholder="Lesson Video Title"
                                      onChange={e => handleLessonChange(modIdx, lesIdx, 'title', e.target.value)}
                                      className="bg-surface border border-black/5 dark:border-white/10 rounded px-2 py-1 text-[11px] font-medium text-text-main"
                                    />
                                    <input 
                                      type="text" 
                                      value={les.duration} 
                                      placeholder="Duration (e.g. 15 Mins)"
                                      onChange={e => handleLessonChange(modIdx, lesIdx, 'duration', e.target.value)}
                                      className="bg-surface border border-black/5 dark:border-white/10 rounded px-2 py-1 text-[11px] font-medium text-text-main"
                                    />
                                    <input 
                                      type="text" 
                                      value={les.videoUrl} 
                                      placeholder="Youtube Embed URL"
                                      onChange={e => handleLessonChange(modIdx, lesIdx, 'videoUrl', e.target.value)}
                                      className="bg-surface border border-black/5 dark:border-white/10 rounded px-2 py-1 text-[11px] font-medium text-text-main"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center gap-4 mt-4">
                          <button 
                            type="submit" 
                            className="px-6 py-3 bg-warning text-crust font-black uppercase tracking-widest text-xs rounded-xl hover:bg-warning/90 transition-all flex items-center justify-center gap-2 flex-1"
                          >
                            <Sparkles size={14} /> {editingCourseId ? 'Update Course Live' : 'Submit Course Live'}
                          </button>
                          {editingCourseId && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCourseId(null);
                                setNewCourse({
                                  title: '',
                                  instructor: 'Ayush Gaikwad',
                                  price: 0,
                                  originalPrice: 4999,
                                  level: 'Beginner',
                                  category: 'Forensic Science',
                                  duration: '12 Hours',
                                  description: '',
                                  thumbnail: '',
                                  instructorImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
                                  instructorBio: 'Lead Forensic Investigator & Cyber Analyst.',
                                  curriculumLines: ''
                                });
                                setModules([]);
                              }}
                              className="px-6 py-3 bg-red-500/10 text-red-500 font-black uppercase tracking-widest text-xs rounded-xl hover:bg-red-500/20 transition-all flex items-center justify-center"
                            >
                              Cancel Edit
                            </button>
                          )}
                        </div>
                      </form>
                    </div>

                    {/* Courses currently listed dynamic */}
                    <div className="bg-surface border border-black/10 dark:border-white/5 rounded-2xl p-6">
                      <h3 className="text-lg font-heading font-black uppercase tracking-tight mb-4">Administrated Investigations Courses</h3>
                      {courseLoading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-warning" /></div>
                      ) : courses.length === 0 ? (
                        <p className="text-xs text-text-muted py-4">No custom dynamic courses uploaded yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {courses.map((c) => (
                            <div key={c.docId} className="flex items-center justify-between p-3 bg-base border border-black/5 dark:border-white/5 rounded-xl">
                              <div className="flex items-center gap-4">
                                <ResilientImage src={c.thumbnail || ''} className="w-16 h-10 object-cover rounded-lg" alt={c.title || 'Course thumbnail'} />
                                <div className="text-left">
                                  <h4 className="text-xs font-black uppercase text-text-main leading-tight">{c.title}</h4>
                                  <span className="text-[10px] uppercase font-mono tracking-widest text-warning font-black">{c.level} PHASE • {c.price} INR</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => {
                                    setEditingCourseId(c.docId);
                                    setNewCourse({
                                      title: c.title || '',
                                      instructor: c.instructor,
                                      price: c.price || 0,
                                      originalPrice: c.originalPrice || 0,
                                      level: c.level,
                                      category: c.category,
                                      duration: c.duration,
                                      description: c.description || '',
                                      thumbnail: c.thumbnail || '',
                                      instructorImage: c.instructorImage || '',
                                      instructorBio: c.instructorBio || '',
                                      curriculumLines: c.curriculum?.join('\n') || ''
                                    });
                                    setModules(c.modules || []);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                  className="p-2 border border-blue-500/10 hover:border-blue-500/30 text-blue-400 bg-blue-400/5 hover:bg-blue-400/10 rounded-lg transition-all"
                                  title="Edit course"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteCourse(c.docId)}
                                  className="p-2 border border-red-500/10 hover:border-red-500/30 text-red-400 bg-red-400/5 hover:bg-red-400/10 rounded-lg transition-all"
                                  title="Purge course"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* 3. E-LIBRARY PDF BUILDER */}
                {activeTab === 'ebooks' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="bg-surface border border-black/10 dark:border-white/5 rounded-2xl p-6">
                      <h2 className="text-xl font-heading font-black uppercase tracking-tight mb-6">Incorporate resource into E-Library</h2>
                      <form onSubmit={handleCreateEbook} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Book / Document Title *</label>
                            <input 
                              type="text" 
                              value={newEbook.title} 
                              onChange={e => setNewEbook({...newEbook, title: e.target.value})} 
                              placeholder="e.g. Principals of Cyber Fingerprint Chromatography" 
                              className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-2 px-3 text-xs font-bold outline-none text-text-main focus:border-warning/50 transition-colors"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Author / Publisher Name</label>
                            <input 
                              type="text" 
                              value={newEbook.author} 
                              onChange={e => setNewEbook({...newEbook, author: e.target.value})} 
                              placeholder="e.g. Dr. Apurba Nandy" 
                              className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-2 px-3 text-xs font-bold outline-none text-text-main focus:border-warning/50 transition-colors"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Publishing Year</label>
                            <input 
                              type="number" 
                              value={newEbook.year} 
                              onChange={e => setNewEbook({...newEbook, year: Number(e.target.value)})} 
                              className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-2 px-3 text-xs font-bold outline-none text-text-main focus:border-warning/50 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Subject Category</label>
                            <input 
                              type="text" 
                              value={newEbook.category} 
                              onChange={e => setNewEbook({...newEbook, category: e.target.value})} 
                              placeholder="Medicine, Ballistics, DNA" 
                              className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-2 px-3 text-xs font-bold outline-none text-text-main focus:border-warning/50 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">E-Library Tab Area</label>
                            <select 
                              value={newEbook.tabCategory} 
                              onChange={e => setNewEbook({...newEbook, tabCategory: e.target.value})} 
                              className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-2 px-3 text-xs font-bold outline-none text-text-main focus:border-warning/50 transition-colors"
                            >
                              <option value="books">Reference Books</option>
                              <option value="notes">Quick lecture Notes</option>
                              <option value="papers"> PYQ Question Papers</option>
                              <option value="other">Other Stuff Checklist</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">File weight (Size)</label>
                            <input 
                              type="text" 
                              value={newEbook.size} 
                              onChange={e => setNewEbook({...newEbook, size: e.target.value})} 
                              placeholder="e.g. 15MB" 
                              className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-2 px-3 text-xs font-bold outline-none text-text-main focus:border-warning/50 transition-colors"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-base/30 border border-black/10 dark:border-white/5 rounded-2xl p-4">
                            <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Cover Image (URL or Upload)</label>
                            <div className="space-y-2">
                              <input 
                                type="text" 
                                value={newEbook.image} 
                                onChange={e => setNewEbook({...newEbook, image: e.target.value})} 
                                placeholder="e.g. Image URL" 
                                className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-2 px-3 text-xs font-bold outline-none text-text-main focus:border-warning/50 transition-colors"
                              />
                              <div className="flex items-center gap-2">
                                <label className="flex-1 flex items-center justify-center gap-2 bg-warning/10 hover:bg-warning/15 border border-warning/20 hover:border-warning/30 text-warning px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors">
                                  <Upload size={13} />
                                  <span>{isUploadingCover ? 'Uploading...' : 'Upload Local Image'}</span>
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleCoverUploadDirect} 
                                    className="hidden" 
                                    disabled={isUploadingCover}
                                  />
                                </label>
                                {newEbook.image && (
                                  <ResilientImage src={newEbook.image} alt="Preview" className="w-8 h-8 rounded object-cover border border-black/10 dark:border-white/10" />
                                )}
                              </div>
                              {coverSuccessText && (
                                <p className="text-[10px] font-mono text-green-500 mt-1.5 bg-green-500/5 px-2 py-1 rounded border border-green-500/10">{coverSuccessText}</p>
                              )}
                              {coverErrorText && (
                                <p className="text-[10px] font-mono text-red-500 mt-1.5 bg-red-500/5 px-2 py-1 rounded border border-red-500/10">{coverErrorText}</p>
                              )}
                            </div>
                          </div>

                          <div className="bg-base/30 border border-black/10 dark:border-white/5 rounded-2xl p-4">
                            <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Document File (URL or Upload) *</label>
                            <div className="space-y-2">
                              <input 
                                type="text" 
                                value={newEbook.pdfUrl} 
                                onChange={e => setNewEbook({...newEbook, pdfUrl: e.target.value})} 
                                placeholder="e.g. PDF Download URL" 
                                className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-2 px-3 text-xs font-bold outline-none text-text-main focus:border-warning/50 transition-colors"
                                required
                              />
                              <div className="flex items-center gap-2">
                                <label className="flex-1 flex items-center justify-center gap-2 bg-warning/10 hover:bg-warning/15 border border-warning/20 hover:border-warning/30 text-warning px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors">
                                  <FileText size={13} />
                                  <span>{isUploadingPdf ? 'Uploading...' : 'Upload Local PDF'}</span>
                                  <input 
                                    type="file" 
                                    accept="application/pdf" 
                                    onChange={handlePdfUploadDirect} 
                                    className="hidden" 
                                    disabled={isUploadingPdf}
                                  />
                                </label>
                                {newEbook.pdfUrl && (
                                  <div className="text-xs font-mono text-green-400 bg-green-500/10 px-2 py-1.5 rounded-xl border border-green-500/20 truncate max-w-[150px]">
                                    Uploaded!
                                  </div>
                                )}
                              </div>
                              {pdfSuccessText && (
                                <p className="text-[10px] font-mono text-green-500 mt-1.5 bg-green-500/5 px-2 py-1 rounded border border-green-500/10">{pdfSuccessText}</p>
                              )}
                              {pdfErrorText && (
                                <p className="text-[10px] font-mono text-red-500 mt-1.5 bg-red-500/5 px-2 py-1 rounded border border-red-500/10">{pdfErrorText}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Brief Description</label>
                          <textarea 
                            value={newEbook.desc} 
                            onChange={e => setNewEbook({...newEbook, desc: e.target.value})} 
                            rows={2}
                            placeholder="Briefly describe the topics covered inside..." 
                            className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-2 px-3 text-xs font-sans outline-none text-text-main focus:border-warning/50 transition-colors"
                          />
                        </div>

                        <div className="flex items-center gap-4 mt-4">
                          <button 
                            type="submit" 
                            className="px-6 py-3 bg-warning text-crust font-black uppercase tracking-widest text-xs rounded-xl hover:bg-warning/90 transition-all flex items-center justify-center gap-2 flex-1"
                          >
                            <Plus size={14} /> {editingEbookId ? 'Update book metadata' : 'Incorporate book resources'}
                          </button>
                          {editingEbookId && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingEbookId(null);
                                setNewEbook({
                                  title: '', author: '', year: new Date().getFullYear(),
                                  category: 'Fundamentals', tabCategory: 'books', type: 'PDF',
                                  size: '12MB', image: '', pdfUrl: '', desc: ''
                                });
                              }}
                              className="px-6 py-3 bg-red-500/10 text-red-500 font-black uppercase tracking-widest text-xs rounded-xl hover:bg-red-500/20 transition-all flex items-center justify-center"
                            >
                              Cancel Edit
                            </button>
                          )}
                        </div>
                      </form>
                    </div>

                    <div className="bg-surface border border-black/10 dark:border-white/5 rounded-2xl p-6">
                      <h3 className="text-lg font-heading font-black uppercase tracking-tight mb-4">Dynamically Loaded Reference Ebooks</h3>
                      {ebookLoading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-warning" /></div>
                      ) : ebooks.length === 0 ? (
                        <p className="text-xs text-text-muted py-4">No custom library documents listed yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {ebooks.map((b) => (
                            <div key={b.docId} className="flex items-center justify-between p-3 bg-base border border-black/5 dark:border-white/5 rounded-xl">
                              <div className="flex items-center gap-4 text-left">
                                <ResilientImage src={b.image || b.coverImage || ''} className="w-10 h-14 object-contain bg-surface border border-black/5 rounded shadow" alt={b.title || 'eBook Cover'} />
                                <div>
                                  <h4 className="text-xs font-black uppercase text-text-main leading-tight line-clamp-1">{b.title}</h4>
                                  <span className="text-[10px] font-mono uppercase tracking-widest text-warning font-black">{b.tabCategory} • {b.author || 'Author unspecified'}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => {
                                    setEditingEbookId(b.docId);
                                    setNewEbook({
                                      title: b.title || '',
                                      author: b.author || '',
                                      year: b.year || new Date().getFullYear(),
                                      category: b.category || 'Fundamentals',
                                      tabCategory: b.tabCategory || 'books',
                                      type: b.type || 'PDF',
                                      size: b.size || '12MB',
                                      image: b.image || '',
                                      pdfUrl: b.pdfUrl || '',
                                      desc: b.desc || ''
                                    });
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                  className="p-2 border border-blue-500/10 hover:border-blue-500/30 text-blue-400 bg-blue-400/5 hover:bg-blue-400/10 rounded-lg transition-all"
                                  title="Edit eBook metadata"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteEbook(b.docId)}
                                  className="p-2 border border-red-500/10 hover:border-red-500/30 text-red-400 bg-red-400/5 hover:bg-red-400/10 rounded-lg transition-all"
                                  title="Remove Document"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* 5. PODCASTS MANAGEMENT */}
                {activeTab === 'podcast' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="bg-surface border border-black/10 dark:border-white/5 rounded-2xl p-6">
                      <h2 className="text-xl font-heading font-black uppercase tracking-tight mb-6 flex items-center gap-2 text-warning">
                        <Radio size={20} className="text-warning animate-pulse" />
                        {editingPodcastId ? '🔧 Modify Podcast Episode' : '🎙️ Publish Podcast Episode'}
                      </h2>
                      
                      <form onSubmit={handleCreatePodcastEpisode} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-text-muted">Episode Title *</label>
                            <input
                              type="text"
                              value={newEpisode.title}
                              onChange={(e) => setNewEpisode(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="e.g., 5. Handwriting Analysis Secrets"
                              className="w-full bg-base border border-black/10 dark:border-white/5 rounded-lg px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-warning/50 text-text-main"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-text-muted">Publish Date</label>
                            <input
                              type="text"
                              value={newEpisode.date}
                              onChange={(e) => setNewEpisode(prev => ({ ...prev, date: e.target.value }))}
                              placeholder="e.g., Jun 21, 2026"
                              className="w-full bg-base border border-black/10 dark:border-white/5 rounded-lg px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-warning/50 text-text-main"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-text-muted">Short Description</label>
                          <textarea
                            value={newEpisode.description}
                            onChange={(e) => setNewEpisode(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Provide a clear, rich, brief summary of what forensics knowledge or test prep tips are covered in this episode."
                            rows={3}
                            className="w-full bg-base border border-black/10 dark:border-white/5 rounded-lg p-4 text-xs font-medium focus:outline-none focus:border-warning/50 text-text-main resize-none"
                          />
                        </div>

                        {/* Cover Art Configuration */}
                        <div className="bg-base border border-black/5 dark:border-white/5 p-4 rounded-xl space-y-3">
                          <span className="text-xs font-bold uppercase tracking-widest text-warning block">Cover Art Artwork</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium mb-1.5 text-text-muted">Direct Image URL upload (Optional)</label>
                              <input
                                type="text"
                                value={newEpisode.coverImage}
                                onChange={(e) => setNewEpisode(prev => ({ ...prev, coverImage: e.target.value }))}
                                placeholder="Paste cover image link here..."
                                className="w-full bg-surface border border-black/10 dark:border-white/5 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-warning/50 text-text-main"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1.5 text-text-muted">Or upload local cover JPG/PNG file</label>
                              <div className="relative">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handlePodcastCoverUpload}
                                  id="podcast-cover-upload"
                                  className="hidden"
                                />
                                <label
                                  htmlFor="podcast-cover-upload"
                                  className="flex items-center justify-center gap-2 w-full bg-surface hover:bg-surface/80 border border-dashed border-black/20 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-bold cursor-pointer transition-colors text-text-main"
                                >
                                  {isUploadingPodcastCover ? (
                                    <>
                                      <Loader2 size={14} className="animate-spin text-warning" />
                                      <span>Uploading cover...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Upload size={14} />
                                      <span>Browse Cover Image</span>
                                    </>
                                  )}
                                </label>
                              </div>
                              {podcastCoverErrorText && <p className="text-[10px] text-red-400 mt-1">{podcastCoverErrorText}</p>}
                              {podcastCoverSuccessText && <p className="text-[10px] text-green-400 mt-1">{podcastCoverSuccessText}</p>}
                            </div>
                          </div>
                        </div>

                        {/* Audio URL Configuration */}
                        <div className="bg-base border border-black/5 dark:border-white/5 p-4 rounded-xl space-y-3">
                          <span className="text-xs font-bold uppercase tracking-widest text-warning block">Acoustic Audio Channel *</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium mb-1.5 text-text-muted">Audio MP3 URL link *</label>
                              <input
                                type="text"
                                value={newEpisode.audioUrl}
                                onChange={(e) => setNewEpisode(prev => ({ ...prev, audioUrl: e.target.value }))}
                                placeholder="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
                                className="w-full bg-surface border border-black/10 dark:border-white/5 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-warning/50 text-text-main"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1.5 text-text-muted">Or Upload standard audio MP3 file</label>
                              <div className="relative">
                                <input
                                  type="file"
                                  accept="audio/*"
                                  onChange={handleAudioUploadDirect}
                                  id="podcast-audio-upload"
                                  className="hidden"
                                />
                                <label
                                  htmlFor="podcast-audio-upload"
                                  className="flex items-center justify-center gap-2 w-full bg-surface hover:bg-surface/80 border border-dashed border-black/20 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-bold cursor-pointer transition-colors text-text-main"
                                >
                                  {isUploadingAudio ? (
                                    <>
                                      <Loader2 size={14} className="animate-spin text-warning" />
                                      <span>Uploading Audio...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Upload size={14} />
                                      <span>Browse Audio File</span>
                                    </>
                                  )}
                                </label>
                              </div>
                              {audioErrorText && <p className="text-[10px] text-red-400 mt-1">{audioErrorText}</p>}
                              {audioSuccessText && <p className="text-[10px] text-green-400 mt-1">{audioSuccessText}</p>}
                            </div>
                          </div>
                        </div>

                        {/* Duration Override config fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-base border border-black/5 dark:border-white/5 p-4 rounded-xl">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-text-muted">Duration Display Tag</label>
                            <input
                              type="text"
                              value={newEpisode.duration}
                              onChange={(e) => setNewEpisode(prev => ({ ...prev, duration: e.target.value }))}
                              placeholder="e.g., 45 min 12 sec"
                              className="w-full bg-surface border border-black/10 dark:border-white/5 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-warning/50 text-text-main"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-text-muted">Duration (seconds)</label>
                            <input
                              type="number"
                              value={newEpisode.durationSec}
                              onChange={(e) => setNewEpisode(prev => ({ ...prev, durationSec: Number(e.target.value) }))}
                              placeholder="2712"
                              className="w-full bg-surface border border-black/10 dark:border-white/5 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-warning/50 text-text-main"
                            />
                          </div>
                        </div>

                        <div className="flex gap-3 justify-end pt-2">
                          {editingPodcastId && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPodcastId(null);
                                setNewEpisode({
                                  title: '',
                                  description: '',
                                  coverImage: '',
                                  audioUrl: '',
                                  date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                                  duration: '30:00',
                                  durationSec: 1800
                                });
                              }}
                              className="px-5 py-2.5 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold tracking-wider hover:bg-zinc-700 transition"
                            >
                              Cancel Edit
                            </button>
                          )}
                          <button
                            type="submit"
                            disabled={isUploadingAudio || isUploadingPodcastCover}
                            className={`px-6 py-2.5 bg-warning text-crust rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-warning/90 transition ${(isUploadingAudio || isUploadingPodcastCover) ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {editingPodcastId ? 'Update Episode' : 'Broadcast Episode'}
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Dynamic Published Episodes List */}
                    <div className="bg-surface border border-black/10 dark:border-white/5 rounded-2xl p-6">
                      <h2 className="text-xl font-heading font-black uppercase tracking-tight mb-6">🎙️ Dynamic Episodes Index</h2>
                      
                      {podcastLoading ? (
                        <div className="flex justify-center items-center py-10 font-mono text-xs text-text-muted gap-2">
                          <Loader2 size={16} className="animate-spin text-warning" /> Loading episodes...
                        </div>
                      ) : podcastEpisodes.length === 0 ? (
                        <div className="text-center py-12 text-xs text-text-muted font-mono border border-dashed border-black/10 dark:border-white/5 rounded-xl">
                          No episodes in dynamic database indexes yet. Any published episodes will overwrite or extend standard podcast indexes.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {podcastEpisodes.map((ep) => (
                            <div 
                              key={ep.docId}
                              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-base border border-black/5 dark:border-white/5 rounded-xl gap-4 hover:border-warning/20 transition-all group"
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={ep.coverImage || 'https://www.dropbox.com/scl/fi/mcd47n75jiji29z8hyl9l/IMG_1221.png?rlkey=710x7h05bztk8kjcmxrvgpomj&st=hd2lg2mz&raw=1'}
                                  alt={ep.title}
                                  referrerPolicy="no-referrer"
                                  className="w-12 h-12 rounded object-cover border border-black/10 dark:border-white/5 shrink-0"
                                />
                                <div>
                                  <h3 className="font-bold text-sm text-text-main group-hover:text-warning transition-colors">{ep.title}</h3>
                                  <div className="flex items-center gap-2 text-[10px] text-text-muted font-mono mt-1">
                                    <span>{ep.date}</span>
                                    <span>•</span>
                                    <span>{ep.duration || '30:00'}</span>
                                  </div>
                                  <p className="text-xs text-text-muted line-clamp-1 mt-1 max-w-sm sm:max-w-md lg:max-w-xl">
                                    {ep.description}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 self-end sm:self-auto">
                                <button
                                  onClick={() => {
                                    setEditingPodcastId(ep.docId);
                                    setNewEpisode({
                                      title: ep.title || '',
                                      description: ep.description || '',
                                      coverImage: ep.coverImage || '',
                                      audioUrl: ep.audioUrl || '',
                                      date: ep.date || '',
                                      duration: ep.duration || '',
                                      durationSec: ep.durationSec || 1800
                                    });
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                  className="p-2 border border-blue-500/10 hover:border-blue-500/30 text-blue-400 bg-blue-400/5 hover:bg-blue-400/10 rounded-lg transition-all"
                                  title="Edit Episode Metadata"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeletePodcastEpisode(ep.docId)}
                                  className="p-2 border border-red-500/10 hover:border-red-500/30 text-red-400 bg-red-400/5 hover:bg-red-400/10 rounded-lg transition-all"
                                  title="Remove Episode"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* 4. DOUBTS MANAGEMENT */}
                {activeTab === 'doubts' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="bg-surface border border-black/10 dark:border-white/5 rounded-2xl p-6">
                      <h2 className="text-xl font-heading font-black uppercase tracking-tight mb-4">Manage Community Doubts</h2>
                      {doubts.length === 0 ? (
                        <p className="text-xs text-text-muted py-4">No doubts reported yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {doubts.map((doubt: any) => (
                            <div key={doubt.id} className="flex items-center justify-between p-3 bg-base border border-black/5 dark:border-white/5 rounded-xl">
                              <div>
                                <h4 className="text-xs font-black uppercase text-text-main leading-tight">{doubt.title}</h4>
                                <p className="text-[10px] text-text-muted truncate max-w-sm">{doubt.content}</p>
                                <span className="text-[10px] uppercase font-mono tracking-widest text-warning font-black">Author: {doubt.authorName}</span>
                              </div>
                              <button 
                                onClick={async () => {
                                  if (!window.confirm("Are you sure you want to delete this doubt?")) return;
                                  try {
                                    await deleteDoc(doc(db, 'doubts', doubt.id));
                                    setSuccessMsg("Doubt successfully purged.");
                                    fetchCollections();
                                  } catch (err: any) {
                                    setErrMsg(`Purge failed: ${err.message}`);
                                  }
                                }}
                                className="p-2 border border-red-500/10 hover:border-red-500/30 text-red-400 bg-red-400/5 hover:bg-red-400/10 rounded-lg transition-all"
                                title="Purge doubt"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* 5. CERTIFICATES VERIFICATION SYSTEM */}
                {activeTab === 'certificates' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="bg-surface border border-black/10 dark:border-white/5 rounded-2xl p-6">
                      <h2 className="text-xl font-heading font-black uppercase tracking-tight mb-6">
                        {editingCertificateId ? 'Modify Certificate Record' : 'Issue Verified Certificate'}
                      </h2>
                      <form onSubmit={handleCreateCertificate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Unique Certificate No. *</label>
                            <input 
                              type="text" 
                              value={newCertificate.certificateNo} 
                              onChange={e => setNewCertificate({...newCertificate, certificateNo: e.target.value})} 
                              placeholder="e.g. FC-1025-AB" 
                              className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-2 px-3 text-xs font-bold outline-none text-text-main focus:border-warning/50 transition-colors uppercase"
                              required
                              disabled={!!editingCertificateId}
                            />
                            {editingCertificateId && <span className="text-[10px] text-text-muted font-mono mt-1 block">Certificate numbers cannot be altered after registration.</span>}
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Recipient Full Name *</label>
                            <input 
                              type="text" 
                              value={newCertificate.fullName} 
                              onChange={e => setNewCertificate({...newCertificate, fullName: e.target.value})} 
                              placeholder="e.g. Ayush Gaikwad" 
                              className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-2 px-3 text-xs font-bold outline-none text-text-main focus:border-warning/50 transition-colors"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Course or Internship Title *</label>
                            <input 
                              type="text" 
                              value={newCertificate.courseTitle} 
                              onChange={e => setNewCertificate({...newCertificate, courseTitle: e.target.value})} 
                              placeholder="e.g. Advanced Cybersecurity Audit" 
                              className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-2 px-3 text-xs font-bold outline-none text-text-main focus:border-warning/50 transition-colors"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Certificate Type</label>
                            <select 
                              value={newCertificate.certificateType} 
                              onChange={e => setNewCertificate({...newCertificate, certificateType: e.target.value})} 
                              className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-2 px-3 text-xs font-bold outline-none text-text-main focus:border-warning/50 transition-colors"
                            >
                              <option value="Internship Completion">Internship Completion</option>
                              <option value="Course Completion">Course Completion</option>
                              <option value="Merit Certificate">Merit Certificate</option>
                              <option value="Professional Excellence">Professional Excellence</option>
                              <option value="Certificate Of Participation">Certificate Of Participation</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Issue Date *</label>
                            <input 
                              type="date" 
                              value={newCertificate.issueDate} 
                              onChange={e => setNewCertificate({...newCertificate, issueDate: e.target.value})} 
                              className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-2 px-3 text-xs font-bold outline-none text-text-main focus:border-warning/50 transition-colors"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Image Attachment */}
                          <div className="bg-base/30 border border-black/10 dark:border-white/5 rounded-2xl p-4">
                            <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Certificate Image Link (URL)</label>
                            <div className="space-y-2">
                              <input 
                                type="text" 
                                value={newCertificate.imageUrl} 
                                onChange={e => setNewCertificate({...newCertificate, imageUrl: e.target.value})} 
                                placeholder="e.g. https://forenclue.com/certificates/sample-image.png" 
                                className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-2 px-3 text-xs font-bold outline-none text-text-main focus:border-warning/50 transition-colors"
                              />
                              <div className="flex items-center gap-2">
                                <label className="flex-1 flex items-center justify-center gap-2 bg-warning/10 hover:bg-warning/15 border border-warning/20 hover:border-warning/30 text-warning px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors">
                                  <Upload size={13} />
                                  <span>{isUploadingCertImage ? 'Uploading Image...' : 'Upload Image to generate link'}</span>
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleCertImageUpload} 
                                    className="hidden" 
                                    disabled={isUploadingCertImage}
                                  />
                                </label>
                                {newCertificate.imageUrl && (
                                  <ResilientImage src={newCertificate.imageUrl} alt="Preview" className="w-8 h-8 rounded object-cover border border-black/10 dark:border-white/10" />
                                )}
                              </div>
                              <p className="text-[9px] text-text-muted font-mono leading-relaxed">
                                Enter a direct web link to the certificate image, or upload a local file to host it on our servers.
                              </p>
                              {certImageSuccessText && (
                                <p className="text-[10px] font-mono text-green-500 mt-1.5 bg-green-500/5 px-2 py-1 rounded border border-green-500/10">{certImageSuccessText}</p>
                              )}
                              {certImageErrorText && (
                                <p className="text-[10px] font-mono text-red-500 mt-1.5 bg-red-500/5 px-2 py-1 rounded border border-red-500/10">{certImageErrorText}</p>
                              )}
                            </div>
                          </div>

                          {/* PDF Attachment */}
                          <div className="bg-base/30 border border-black/10 dark:border-white/5 rounded-2xl p-4">
                            <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Official Document (PDF URL or Upload)</label>
                            <div className="space-y-2">
                              <input 
                                type="text" 
                                value={newCertificate.pdfUrl} 
                                onChange={e => setNewCertificate({...newCertificate, pdfUrl: e.target.value})} 
                                placeholder="e.g. https://domain.com/cert.pdf" 
                                className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-2 px-3 text-xs font-bold outline-none text-text-main focus:border-warning/50 transition-colors"
                              />
                              <div className="flex items-center gap-2">
                                <label className="flex-1 flex items-center justify-center gap-2 bg-warning/10 hover:bg-warning/15 border border-warning/20 hover:border-warning/30 text-warning px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors">
                                  <FileText size={13} />
                                  <span>{isUploadingCertPdf ? 'Uploading PDF...' : 'Upload PDF Copy'}</span>
                                  <input 
                                    type="file" 
                                    accept="application/pdf" 
                                    onChange={handleCertPdfUpload} 
                                    className="hidden" 
                                    disabled={isUploadingCertPdf}
                                  />
                                </label>
                                {newCertificate.pdfUrl && (
                                  <div className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1.5 rounded-xl border border-emerald-500/20 truncate max-w-[150px]">
                                    PDF Ready
                                  </div>
                                )}
                              </div>
                              {certPdfSuccessText && (
                                <p className="text-[10px] font-mono text-green-500 mt-1.5 bg-green-500/5 px-2 py-1 rounded border border-green-500/10">{certPdfSuccessText}</p>
                              )}
                              {certPdfErrorText && (
                                <p className="text-[10px] font-mono text-red-500 mt-1.5 bg-red-500/5 px-2 py-1 rounded border border-red-500/10">{certPdfErrorText}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Additional Certificate Details</label>
                          <textarea 
                            value={newCertificate.additionalDetails} 
                            onChange={e => setNewCertificate({...newCertificate, additionalDetails: e.target.value})} 
                            rows={3}
                            placeholder="Add secondary information e.g. Special Roles, Score: 95%, Duration: 3 Months, Grade A+..." 
                            className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-2 px-3 text-xs font-sans outline-none text-text-main focus:border-warning/50 transition-colors"
                          />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                          {editingCertificateId && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCertificateId(null);
                                setNewCertificate({
                                  certificateNo: '',
                                  fullName: '',
                                  courseTitle: '',
                                  certificateType: 'Internship Completion',
                                  issueDate: new Date().toISOString().split('T')[0],
                                  imageUrl: '',
                                  pdfUrl: '',
                                  additionalDetails: ''
                                });
                              }}
                              className="px-4 py-2 border border-black/10 dark:border-white/10 text-xs font-bold uppercase rounded-xl transition hover:bg-surface"
                            >
                              Cancel Edit
                            </button>
                          )}
                          <button
                            type="submit"
                            disabled={isUploadingCertImage || isUploadingCertPdf}
                            className="px-6 py-2.5 bg-warning text-crust hover:bg-warning/90 disabled:opacity-50 font-black rounded-xl text-xs uppercase tracking-widest transition flex items-center gap-2"
                          >
                            {isUploadingCertImage || isUploadingCertPdf ? (
                              <>
                                <Loader2 size={13} className="animate-spin" />
                                <span>Uploading assets...</span>
                              </>
                            ) : (
                              <>
                                <Award size={13} />
                                <span>{editingCertificateId ? 'Update Certificate' : 'Issue Certificate'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>

                    <div className="bg-surface border border-black/10 dark:border-white/5 rounded-2xl p-6">
                      <h2 className="text-xl font-heading font-black uppercase tracking-tight mb-6">Issued Credentials Index</h2>
                      
                      {certificateLoading ? (
                        <div className="flex justify-center items-center py-10 font-mono text-xs text-text-muted gap-2">
                          <Loader2 size={16} className="animate-spin text-warning" /> Loading certificates...
                        </div>
                      ) : certificates.length === 0 ? (
                        <div className="text-center py-12 text-xs text-text-muted font-mono border border-dashed border-black/10 dark:border-white/5 rounded-xl">
                          No certificates registered in the database yet.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {certificates.map((cert) => (
                            <div 
                              key={cert.id}
                              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-base border border-black/5 dark:border-white/5 rounded-xl gap-4 hover:border-warning/20 transition-all group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-warning/10 text-warning rounded-full flex items-center justify-center border border-warning/20">
                                  <Award size={20} />
                                </div>
                                <div>
                                  <h3 className="font-bold text-sm text-text-main group-hover:text-warning transition-colors uppercase">
                                    {cert.fullName}
                                  </h3>
                                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-text-muted font-mono mt-1">
                                    <span className="text-warning font-bold">{cert.id}</span>
                                    <span>•</span>
                                    <span>{cert.certificateType}</span>
                                    <span>•</span>
                                    <span>Issued: {cert.issueDate}</span>
                                  </div>
                                  <p className="text-xs text-text-muted line-clamp-1 mt-1 max-w-sm sm:max-w-md lg:max-w-xl">
                                    {cert.courseTitle} {cert.additionalDetails ? `(${cert.additionalDetails})` : ''}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 self-end sm:self-auto">
                                <button
                                  onClick={() => {
                                    setEditingCertificateId(cert.id);
                                    setNewCertificate({
                                      certificateNo: cert.certificateNo || cert.id,
                                      fullName: cert.fullName || '',
                                      courseTitle: cert.courseTitle || '',
                                      certificateType: cert.certificateType || 'Internship Completion',
                                      issueDate: cert.issueDate || '',
                                      imageUrl: cert.imageUrl || '',
                                      pdfUrl: cert.pdfUrl || '',
                                      additionalDetails: cert.additionalDetails || ''
                                    });
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                  className="p-2 border border-blue-500/10 hover:border-blue-500/30 text-blue-400 bg-blue-400/5 hover:bg-blue-400/10 rounded-lg transition-all"
                                  title="Edit Certificate"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteCertificate(cert.id)}
                                  className="p-2 border border-red-500/10 hover:border-red-500/30 text-red-400 bg-red-400/5 hover:bg-red-400/10 rounded-lg transition-all"
                                  title="Delete Certificate"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'employees' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="bg-surface border border-black/10 dark:border-white/5 rounded-2xl p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-heading font-black uppercase tracking-tight flex items-center gap-2">
                          <Users className="text-warning" /> 
                          {isEditingEmployee ? 'Edit Employee Identity' : 'Provision New Identity'}
                        </h2>
                        {adminEmployees.length === 0 && (
                          <button
                            onClick={seedDemoEmployees}
                            disabled={employeeLoading}
                            className="px-4 py-2 border border-black/10 dark:border-white/10 text-xs font-bold uppercase rounded-xl transition hover:bg-surface flex items-center gap-2"
                          >
                            <RefreshCw size={13} className={employeeLoading ? "animate-spin" : ""} /> Seed Demo Data
                          </button>
                        )}
                      </div>

                      <form onSubmit={handleEmployeeFormSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Employee ID (Must be Unique)</label>
                            <input 
                              type="text" 
                              required 
                              disabled={isEditingEmployee}
                              value={employeeFormData.employeeId} 
                              onChange={e => setEmployeeFormData({...employeeFormData, employeeId: e.target.value.toUpperCase()})} 
                              placeholder="e.g. FC-EMP-001" 
                              className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-2 px-3 text-xs font-bold outline-none text-text-main focus:border-warning/50 transition-colors disabled:opacity-50"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Full Name</label>
                            <input 
                              type="text" 
                              required 
                              value={employeeFormData.fullName} 
                              onChange={e => setEmployeeFormData({...employeeFormData, fullName: e.target.value})} 
                              placeholder="e.g. John Doe" 
                              className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-2 px-3 text-xs font-bold outline-none text-text-main focus:border-warning/50 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Position / Role</label>
                            <input 
                              type="text" 
                              required 
                              value={employeeFormData.position} 
                              onChange={e => setEmployeeFormData({...employeeFormData, position: e.target.value})} 
                              placeholder="e.g. Cybersecurity Analyst" 
                              className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-2 px-3 text-xs font-bold outline-none text-text-main focus:border-warning/50 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Department</label>
                            <select 
                              value={employeeFormData.department} 
                              onChange={e => setEmployeeFormData({...employeeFormData, department: e.target.value})} 
                              className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-2 px-3 text-xs font-bold outline-none text-text-main focus:border-warning/50 transition-colors"
                            >
                              <option>Forensic Case Studies & Publications</option>
                              <option>Business Development & Partnerships</option>
                              <option>Human Resources (HR)</option>
                              <option>Video Editing & Motion Graphics</option>
                              <option>Cybersecurity & Digital Forensics</option>
                              <option>Web Development</option>
                              <option>Marketing & Public Relations</option>
                              <option>Events & Operations</option>
                              <option>Social Media Management</option>
                              <option>Graphic Design & Branding</option>
                              <option>Content Writing & Editorial</option>
                              <option>Admin</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Joining Date</label>
                            <input 
                              type="date" 
                              required 
                              value={employeeFormData.joiningDate} 
                              onChange={e => setEmployeeFormData({...employeeFormData, joiningDate: e.target.value})} 
                              className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-2 px-3 text-xs font-bold outline-none text-text-main focus:border-warning/50 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Valid Until</label>
                            <input 
                              type="date" 
                              required 
                              value={employeeFormData.expiryDate} 
                              onChange={e => setEmployeeFormData({...employeeFormData, expiryDate: e.target.value})} 
                              className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-2 px-3 text-xs font-bold outline-none text-text-main focus:border-warning/50 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Status</label>
                            <select 
                              value={employeeFormData.status} 
                              onChange={e => setEmployeeFormData({...employeeFormData, status: e.target.value as any})} 
                              className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-2 px-3 text-xs font-bold outline-none text-text-main focus:border-warning/50 transition-colors"
                            >
                              <option value="Active">Active</option>
                              <option value="Suspended">Suspended</option>
                              <option value="Expired">Expired</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Security Clearance Level</label>
                            <select 
                              value={employeeFormData.clearanceLevel} 
                              onChange={e => setEmployeeFormData({...employeeFormData, clearanceLevel: e.target.value})} 
                              className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-2 px-3 text-xs font-bold outline-none text-text-main focus:border-warning/50 transition-colors"
                            >
                              <option>Level 1 - Employee</option>
                              <option>Level 2 - Intern</option>
                              <option>Level 3 - Member</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Email Address</label>
                            <input 
                              type="email" 
                              value={employeeFormData.email} 
                              onChange={e => setEmployeeFormData({...employeeFormData, email: e.target.value})} 
                              placeholder="e.g. name@forenclue.com" 
                              className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-2 px-3 text-xs font-bold outline-none text-text-main focus:border-warning/50 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Phone Number</label>
                            <input 
                              type="text" 
                              value={employeeFormData.phone} 
                              onChange={e => setEmployeeFormData({...employeeFormData, phone: e.target.value})} 
                              placeholder="e.g. +91 9988776655" 
                              className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-2 px-3 text-xs font-bold outline-none text-text-main focus:border-warning/50 transition-colors"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Skills & Specializations (Comma Separated)</label>
                            <input 
                              type="text" 
                              value={employeeFormData.skills} 
                              onChange={e => setEmployeeFormData({...employeeFormData, skills: e.target.value})} 
                              placeholder="e.g. Threat Intelligence, Incident Response, Malware Analysis" 
                              className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-2 px-3 text-xs font-bold outline-none text-text-main focus:border-warning/50 transition-colors"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-[10px] font-mono text-text-muted uppercase mb-1">Profile Photo URL</label>
                            <input 
                              type="text" 
                              value={employeeFormData.imageUrl} 
                              onChange={e => setEmployeeFormData({...employeeFormData, imageUrl: e.target.value})} 
                              placeholder="e.g. https://domain.com/photo.jpg" 
                              className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl py-2 px-3 text-xs font-bold outline-none text-text-main focus:border-warning/50 transition-colors"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                          {isEditingEmployee && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsEditingEmployee(false);
                                setEditEmployeeId(null);
                                setEmployeeFormData({
                                  employeeId: '',
                                  fullName: '',
                                  position: '',
                                  department: 'Cybersecurity & Digital Forensics',
                                  joiningDate: new Date().toISOString().split('T')[0],
                                  expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString().split('T')[0],
                                  status: 'Active',
                                  email: '',
                                  phone: '',
                                  skills: '',
                                  imageUrl: '',
                                  clearanceLevel: 'Level 1 - Employee'
                                });
                              }}
                              className="px-4 py-2 border border-black/10 dark:border-white/10 text-xs font-bold uppercase rounded-xl transition hover:bg-surface"
                            >
                              Cancel Edit
                            </button>
                          )}
                          <button
                            type="submit"
                            disabled={employeeLoading}
                            className="px-6 py-2.5 bg-warning text-crust hover:bg-warning/90 disabled:opacity-50 font-black rounded-xl text-xs uppercase tracking-widest transition flex items-center gap-2"
                          >
                            {employeeLoading ? (
                              <>
                                <Loader2 size={13} className="animate-spin" />
                                <span>Processing...</span>
                              </>
                            ) : (
                              <>
                                <ShieldCheck size={13} />
                                <span>{isEditingEmployee ? 'Update Identity' : 'Provision Identity'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>

                    <div className="bg-surface border border-black/10 dark:border-white/5 rounded-2xl p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-heading font-black uppercase tracking-tight">Active Directory</h2>
                        <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-3 py-1 rounded-lg flex items-center gap-2">
                          <Database size={12} className="text-warning" />
                          <span className="text-[10px] font-mono text-text-muted">Total Identities: {adminEmployees.length}</span>
                        </div>
                      </div>
                      
                      {employeeLoading && !isEditingEmployee ? (
                        <div className="flex justify-center items-center py-10 font-mono text-xs text-text-muted gap-2">
                          <Loader2 size={16} className="animate-spin text-warning" /> Synchronizing directory...
                        </div>
                      ) : adminEmployees.length === 0 ? (
                        <div className="text-center py-12 text-xs text-text-muted font-mono border border-dashed border-black/10 dark:border-white/5 rounded-xl flex flex-col items-center justify-center">
                          <Users size={32} className="mb-3 opacity-20" />
                          <p>No identities registered in the network.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {adminEmployees.map((emp) => (
                            <div 
                              key={emp.employeeId}
                              className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-base border border-black/5 dark:border-white/5 rounded-xl gap-4 hover:border-warning/20 transition-all group"
                            >
                              <div className="flex items-center gap-4">
                                {emp.imageUrl ? (
                                  <img 
                                    src={emp.imageUrl} 
                                    alt={emp.fullName}
                                    className="w-12 h-12 rounded-lg object-cover border border-black/10 dark:border-white/10"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-black/5 dark:bg-white/5 text-text-muted rounded-lg flex items-center justify-center border border-black/10 dark:border-white/10">
                                    <Users size={20} />
                                  </div>
                                )}
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-sm text-text-main group-hover:text-warning transition-colors uppercase">
                                      {emp.fullName}
                                    </h3>
                                    <span className={cn(
                                      "text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider",
                                      emp.status === 'Active' ? "bg-green-500/10 text-green-500" :
                                      emp.status === 'Suspended' ? "bg-red-500/10 text-red-500" :
                                      "bg-orange-500/10 text-orange-500"
                                    )}>
                                      {emp.status}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-text-muted font-mono mt-0.5">
                                    <span className="text-warning">{emp.employeeId}</span> • {emp.position}
                                  </p>
                                  <p className="text-[10px] text-text-muted/60 flex items-center gap-1 mt-1 font-mono uppercase">
                                    <Fingerprint size={10} /> clearance: {emp.clearanceLevel.split(' - ')[0]}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 border-black/5 dark:border-white/5 pt-3 md:pt-0">
                                <button
                                  onClick={() => {
                                    handleEmployeeEditInit(emp);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                  className="p-2 border border-blue-500/10 hover:border-blue-500/30 text-blue-400 bg-blue-400/5 hover:bg-blue-400/10 rounded-lg transition-all flex items-center gap-2 text-xs uppercase font-bold"
                                  title="Edit Identity"
                                >
                                  <Edit3 size={14} /> <span className="md:hidden">Edit</span>
                                </button>
                                <button
                                  onClick={() => handleEmployeeDelete(emp.employeeId)}
                                  className="p-2 border border-red-500/10 hover:border-red-500/30 text-red-400 bg-red-400/5 hover:bg-red-400/10 rounded-lg transition-all flex items-center gap-2 text-xs uppercase font-bold"
                                  title="Revoke Credentials"
                                >
                                  <Trash2 size={14} /> <span className="md:hidden">Revoke</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


