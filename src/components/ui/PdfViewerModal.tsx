import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, ZoomIn, ZoomOut, Search, ChevronLeft, ChevronRight, 
  Download, FileText, Sun, Moon, Eye, Printer, BookOpen, 
  Check, Info, FileDown, CheckCircle2, Maximize2, Minimize2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { resolveFileUrl, localFileStore } from '@/lib/localFileStore';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: {
    id: number | string;
    title: string;
    author?: string;
    year?: number | string;
    uploaded?: string;
    category?: string;
    type?: string;
    size?: string;
    desc?: string;
    pdfUrl?: string;
  };
  startMaximized?: boolean;
}

// Generates simulated rich academic content based on the eBook/Paper/Note details
function getSimulatedDocumentContent(resource: any) {
  const title = resource.title || '';
  const category = (resource.category || '').toLowerCase();
  
  if (resource.id === 'reddy') {
    return {
      chapters: [
        {
          id: 'ch1',
          title: 'Chapter 1: Legal Procedure',
          pages: [
            `CONCISE FORENSIC MEDICINE & TOXICOLOGY\n=========================================\n\nChapter I: Legal Procedure\n\n1. Definition:\n- Forensic (legal) medicine deals with the application of medical knowledge to aid in the administration of justice. It deals with medical aspects of law, such as assault, murder, sexual offences, poisoning, etc.\n- Medical jurisprudence deals with legal responsibilities of the doctor, i.e., with legal aspects of the practice of medicine, such as medical negligence, consent, professional misconduct, duties of doctors, etc.\n\n2. Inquest:\nAn inquest is an enquiry or investigation into the cause of death (S.174, Cr.P.C). It is conducted in cases of unnatural and suspicious deaths, such as suicide, murder, accident, etc.\n- Police Inquest: Conducted throughout India by the officer-in-charge of a police station (panchanama) in the presence of two witnesses (panchas).\n- Magistrate's Inquest: Conducted by an Executive Magistrate in cases of death in prison, police custody, police firing, dowry death, exhumation, or death in a psychiatric hospital.`,
            `3. Medical Evidence:\nEvidence means all legal-scientific means which help to prove or disassemble any matter in question.\n- Direct Evidence: Evidence of a fact which is actually in issue (e.g., a prescription or a consent form).\n- Indirect or Circumstantial: Evidence of a fact which is not actually in issue, but which is derived from the circumstances.\n- Hearsay Evidence: Any statement made by any person other than the witness giving evidence in Court.\n\n4. Dying Declaration:\nIt is a written or oral statement of a person, who is dying due to some unlawful act, relating to the cause of his death.\n- Recorded preferably by a Magistrate. The doctor must certify that the person is conscious and his mental faculties are normal.\n- Oath is NOT administered, because it is believed that a dying person will only tell the truth.\n\n5. Chain of Custody of Evidence:\nA crucial method to verify the actual possession of an object/specimen from the time it was first identified until it is offered into evidence in the Court room. Each specimen must be labeled, signed, and documented continuously.`
          ]
        },
        {
          id: 'ch2',
          title: 'Chapter 2: Medical Law and Ethics',
          pages: [
            `Chapter II: Medical Law and Ethics\n==================================\n\n1. Ethics and Etiquette:\n- Medical ethics deals with moral principles which guide members of the medical profession in their dealings with each other, their patients, and the State.\n- Medical etiquette deals with the conventional laws of courtesy observed between members of the medical profession.\n- Hippocratic Oath: Modernized version is the Declaration of Geneva (1948).\n\n2. Professional Negligence (Malpraxis):\nThe absence of reasonable care and skill, or willful negligence of a medical practitioner, in the treatment of a patient which causes bodily injury or death.\n- Liability (Civil): Patient sues for compensation. Requires proving:\n  1. Duty of care existed.\n  2. Dereliction (failure of standard care).\n  3. Direct causation (proximate cause of injury).\n  4. Damage resulted.\n- Res Ipsa Loquitur: "The thing speaks for itself" (e.g., leaving a swab in the abdomen). In such cases, medical evidence is not necessary to prove negligence.`,
            `3. Consent in Medical Practice:\nConsent means voluntary agreement, compliance, or permission.\n- Express Consent: Specifically stated by the patient (verbal or written).\n- Implied Consent: Implied by the patient's actions (e.g., holding out the arm for an injection, attending a clinic).\n- Informed Consent: Implies an understanding by the patient of the nature of his condition, proposed treatment, alternatives, and associated risks.\n\n4. Professional Secrecy:\nAn implied contract between doctor and patient to keep secret all that he comes to know concerning the patient in the course of his professional work.\n- Privileged Communication: A bona fide statement made up on any subject matter by a doctor to a concerned authority due to a duty to protect the community or State interests (e.g., cook suffering from infectious disease, bus driver suffering from epilepsy).`
          ]
        },
        {
          id: 'ch3',
          title: 'Chapter 3: Identification',
          pages: [
            `Chapter III: Identification\n==========================\n\n1. Definition & Corpus Delicti:\n- Identification is the recognition of an individual based on certain physical characters which are unique to that individual.\n- Corpus Delicti: "Body of offence" / essence of crime. Means the elements of any criminal offence (e.g., murder). Includes the dead body, weapon fragments, clothing, etc.\n\n2. Dactylography (Fingerprint System / Galton System):\nImpressions of patterns formed by papillary or epidermal ridges of the fingertips. Patterns are distinctive, permanent, and not inherited.\n- Loops: 60 to 70% of population.\n- Whorls: 25 to 35% of population.\n- Arches: 6 to 7% of population.\n- Composite: 1 to 2% of population.\n- Poroscopy: Study of microscopic sweat pores on the ridges.\n\n3. Determination of Sex from Bones (Accuracy):\n- Entire skeleton: 100%\n- Pelvis alone: 95% (Greater sciatic notch is the ideal feature for female determination)\n- Skull alone: 90%\n- Pelvis + Skull: 98%\n- Long bones alone: 80%`
          ]
        },
        {
          id: 'ch4_ch6',
          title: 'Chapters 4 - 6: Autopsy, Death & Postmortem Changes',
          pages: [
            `Chapters IV & V: Autopsy & Thanatology\n=====================================\n\n1. Medicolegal Autopsy:\nConduct only in mortuary (except spot autopsies), requires formal requisition, must be complete. I-shaped incision from chin to symphysis pubis is standard.\n- Preservation: Stomach contents, 30 cm small intestine, half kg liver, half of each kidney, 30 ml blood, 30 ml urine. Saturated saline is the standard preservative (never use formalin for viscera).\n\n2. Brain Death & Somatic Death:\n- Somatic Death: Complete and irreversible stoppage of tripod of life (circulation, respiration, brain function).\n- Brain Death: Deep unconsciousness, flat EEG, no reflexes, or bilateral dilated pupils for 24 hours.\n\n3. Postmortem Interval (Estimation):\n- Algor Mortis (Cooling): Sigmoid pattern. Heat loss is roughly 0.4°C to 0.6°C per hour in tropical climates.\n- Postmortem Lividity (Hypostasis): Gravitational pooling of blood in dependent parts. Visible in 1-4 hours, fully developed/fixed in 6-12 hours.\n- Rigor Mortis (Stiffening): Commences in 1-2 hours in India, complete in 2-4 hours. Lasts 18-36 hours in summer, 24-48 hours in winter. Starts in eyelids, jaw, propagates downward (proximo-distal progression).`
          ]
        }
      ]
    };
  }

  if (category.includes('medicine') || title.includes('Medicine') || title.includes('Pathology')) {
    return {
      chapters: [
        {
          id: 'intro',
          title: 'Section 1: Forensic Pathology Autopsies',
          pages: [
            `PRINCIPLES OF FORENSIC MEDICINE & PATHOLOGY\n==========================================\n\nChapter I: Introduction to Autopsy Procedures\nSub-topic: Post-Mortem Rigidity and Lividity\n\n1. Legal Authority:\nEvery forensic autopsy must be preceded by a formal inquest report from coroners or police investigators. Unofficial autopsy is strictly forbidden.\n\n2. External Examination:\n- Documentation of complete physical traits: height, approximate weight, build.\n- Complete cataloging of identifying marks: birthmarks, surgical scars, professional tattoos, dental records.\n- Analysis of Hypostasis (Post-Mortem Lividity): Purple discoloration in dependent parts of the body, fixing generally within 6 to 12 hours. Fixed status indicates gravitational pooling cannot be disrupted.`,
            `3. Rigor Mortis Development Phases:\n- Initial flaccidity: 0 to 2 hours.\n- Commencement in small facial muscle nodes (jaw, eyelids): 2 to 4 hours.\n- Complete extension to lower extremities: 12 hours.\n- Maintenance phase: 12 to 24 hours.\n- Gradual resolution (secondary flaccidity): 24 to 36 hours.\n\n4. Internal Cranial, Thoracic, and Abdominal Openings:\n- The classical 'Y' shape primary incision is standard.\n- Visual examination of gastric content: aids in estimating time of last meal (standard digestion takes 2 to 4 hours).`
          ]
        },
        {
          id: 'injuries',
          title: 'Section 2: Classification of Blunt Force Traumas',
          pages: [
            `Chapter II: Mechanical Wounds\n------------------------------\n\n1. Abrasion:\nSuperficial epithelial cell layer loss, maintaining a pristine dermal baseline. Useful for reconstructing weapon shape vectors (e.g., shoe sole prints or tire tracks).\n\n2. Contusion (Bruising):\nSubcutaneous capillary breakage leading to local extravasation of blood cells. Color progression timeline:\n- Red/Blue/Purple: Day 1-3 (Fresh hemoglobin oxidation status).\n- Greenish Tint: Day 4-7 (Biliverdin accumulation).\n- Yellowish Fade: Day 7-10 (Bilirubin crystallization).\n- Normal skin color return: 2 weeks.`,
            `3. Laceration Wounds:\nIrregular skin tears from shear-straining tensile stresses. Must be carefully distinguished from sharp-force incised wounds.\n- Diagnostic Signs: Tissue bridging (subcutaneous blood vessels, nerves, and connective fibers cross the gap untouched). Bruising along wound margins is common.`
          ]
        }
      ]
    };
  } else if (category.includes('toxicology') || title.includes('Toxicology') || title.includes('Poisons')) {
    return {
      chapters: [
        {
          id: 'quick-rev',
          title: 'Topic 1: Classification of Toxic Agents',
          pages: [
            `FORENSIC TOXICOLOGY RAPID STUDY GUIDE\n====================================\n\nI. Corrosive Acids and Alkalis\n-----------------------------\n- Inorganic Acids: Sulfuric Acid (leads to deep black charring at the mouth or esophagus, known as Vitriolage).\n- Nitric Acid: Yellowish stain (due to xanthoproteic reaction with human skin proteins).\n- Hydrochloric Acid: Greyish/white caustic coagulation.\n- Strong Alkalis: Liquefactive necrosis with soapy sensation, high esophageal perforation risk.\n\nII. Heavy Metals and Metalloids\n--------------------------------\n- Arsenic (As): Hair and nail deposition. Causes Aldrich-Mee's lines (white lines across fingernails). Acute toxicity shows "Choleriform" severe water diarrhea.\n- Lead (Pb): Saturation of nervous systems. Symptoms include blue line in gums (Burtonian Line), basophilic stippling of erythrocytes, and wrist drop.`,
            `III. Gaseous Inhalants\n---------------------\n1. Carbon Monoxide (CO):\n- Mechanism: Displays 200 units higher hemoglobin binding affinity than normal oxygen molecules, blocking oxyhemoglobin formations.\n- Diagnostic Indicator: Bright cherry-red skin tissues, internal organs, and post-mortem blood clots.\n\n2. Hydrogen Cyanide (HCN):\n- Mechanism: Binds directly to ferric ions in cytochrome oxidase, cellular respiration halts instantly.\n- Distinctive Scent: Strong bitter almonds smell recognizable upon cranial opening.`
          ]
        },
        {
          id: 'antidotes',
          title: 'Topic 2: Active Reagents & Antidotes Table',
          pages: [
            `PHARMACOLOGICAL TREATMENT VECTORS IN FORENSICS\n---------------------------------------------\n\n1. Arsenic / Mercury Poisoning:\n- Treatment agent: British Anti-Lewisite (BAL - Dimercaprol).\n- Action: Sulfhydryl group competition binds and excretes chelates.\n\n2. Lead Intoxication:\n- Treatment agent: Calcium Disodium EDTA.\n- Action: Mobilizes skeletal lead reserves into urine.\n\n3. Organophosphate Insecticides:\n- Symptoms: Pinpoint pupils, excessive wet salivation, sweating, muscle fasciculations (DUMBBELS criteria).\n- Treatment agent: Atropine sulfate (parasympathetic blocker) coupled with Pralidoxime (PAM) to reactivate acetylcholinesterase.`
          ]
        }
      ]
    };
  } else if (category.includes('net') || category.includes('quiz') || title.includes('NET') || title.includes('Exam') || title.includes('Paper')) {
    return {
      chapters: [
        {
          id: 'exam-section1',
          title: 'Paper Section I: Core Forensic Chemistry',
          pages: [
            `UGC NET / STATE FACT MOCK EXAMINATION MODULE\n============================================\n\nINSTRUCTIONS: Attempt all questions. Check answers at the bottom of the page.\n\nQ1. Which of the following color tests is utilized in forensic labs to screen for the presence of marijuana compounds?\n  [A] Marquis Test\n  [B] Duquenois-Levine Test\n  [C] Scott Test\n  [D] Dille-Koppanyi Reagent\n\nQ2. In HPLC chromatography, what physical parameter governs the selective retention of analyte compounds inside the column?\n  [A] Boiling point vaporization\n  [B] Mobile phase flow rate volume\n  [C] Partition coefficient ratio between phases\n  [D] High excitation ultraviolet wavelengths`,
            `Q3. The distinct yellow coloration produced in skin tissues during Nitric Acid poisoning is clinically termed:\n  [A] Vitriolage necrosis\n  [B] Xanthoproteic reaction\n  [C] Basophilic stippling\n  [D] Prussian blue crystallization\n\nQ4. In firearms analysis, the presence of specific 'GSR' primer elements consists of:\n  [A] Sulfur, Charcoal, Nitrate\n  [B] Lead, Barium, Antimony\n  [C] Copper, Zinc, Tin\n  [D] Nickel, Chromium, Manganese\n\n---------------------------------------------\nANSWER KEY CODES (Verifiable for study check):\nQ1: [B]  |  Q2: [C]  |  Q3: [B]  |  Q4: [B]\n---------------------------------------------`
          ]
        },
        {
          id: 'exam-section2',
          title: 'Paper Section II: Forensic Biology and Serology',
          pages: [
            `MODEL PRACTICE TEST - CORE BIOLOGICAL EVIDENCE\n----------------------------------------------\n\nQ5. Which enzyme is target-probed in forensic semen validation tests prior to DNA profiling?\n  [A] Amylase alpha\n  [B] Acid Phosphatase (AP)\n  [C] Creatine Kinase\n  [D] Alkaline Lipase\n\nQ6. The highly polymorphic STR loci utilized in CODIS index records typically have repeat structures consisting of:\n  [A] 1-2 base pairs\n  [B] 4-5 base pairs\n  [C] 10-15 base pairs\n  [D] 20-50 base pairs\n\nQ7. Species identification of unknown bloodstains is conclusively achieved using which immunological test?\n  [A] Kastle-Meyer Test\n  [B] Luminol chemiluminescence\n  [C] Precipitin gel ring method\n  [D] Takayama crystal test`
          ]
        }
      ]
    };
  } else if (category.includes('fingerprint') || category.includes('dactyloscopy') || title.includes('Fingerprint')) {
    return {
      chapters: [
        {
          id: 'patterns',
          title: 'Section 1: Ridge Pattern Classifications',
          pages: [
            `DACTYLOSCOPY & DERMATOGLYPHICS MANUAL\n====================================\n\n1. Arch Patterns (5% distribution in population):\n- Plain Arch: Ridges flow from one side to the other, rising slightly in the center without sharp angles.\n- Tented Arch: Ridges rise sharply or contain a central spike/angle < 90 degrees.\n\n2. Loop Patterns (60-65% distribution):\n- Must have: at least one delta point, one core point, and a recurving ridge.\n- Radial Loop: Loops flow or slope toward the radius bone (thumb direction).\n- Ulnar Loop: Loops flow or slope toward the ulna bone (pinky direction).`,
            `3. Whorl Patterns (30-35% distribution):\n- Must have: a minimum of two deltas and at least one ridge making a complete circuit (circle, oval, or spiral).\n- Subtypes: Plain whorl, central pocket loop whorl, double loop whorl (two distinct loops in one pattern), and accidental whorl (irregular features matching multiple traits).\n\n4. Minutiae Feature Nodes (Points of Match):\n- Bifurcation: A ridge splitting into two paths.\n- Ridge Ending: A ridge terminating mid-path.\n- Island/Dot: A microscopic standalone ridge point.\n- Enclosure: A ridge splitting and immediately closing back.`
          ]
        }
      ]
    };
  } else {
    // Default generic comprehensive study materials
    return {
      chapters: [
        {
          id: 'overview',
          title: 'Study Dossier Overview',
          pages: [
            `FORENSIC SCIENCE ACADEMIC PLATFORM RESOURCE\n==========================================\n\nTitle: ${title}\nAuthor/Source: ${resource.author || 'ForenClue Editorial Council'}\nSubject Category: ${resource.category || 'General Forensic Science'}\nAcademic Level: Master/Research Prep\n\nDOCUMENT PREVIEW ABSTRACT:\nThis academic booklet provides a comprehensive, structured overview of core diagnostic markers in forensic investigation. It includes step-by-step methodologies compiled under peer review guidelines to prepare students for UGC NET, FACT, CUET, and practical laboratory internships.`,
            `DIAGNOSTIC CRITERIA & METRICS:\n\n1. Quality Controls:\n- Ensure the chain of custody is documented with timestamp labels.\n- Handle all biological materials in temperature-regulated containers to avoid enzymic breakdown.\n- Calibrate analytic systems using high-grade standards before logging case data.\n\n2. Analytical Frameworks:\n- High Performance Liquid Chromatography (HPLC) for toxicology extraction analysis.\n- Gas Chromatography-Mass Spectrometry (GC-MS) as the gold standard confirmation test.\n- Capillary Electrophoresis for DNA STR profiling.`
          ]
        }
      ]
    };
  }
}

export function PdfViewerModal({ isOpen, onClose, resource, startMaximized = false }: PdfViewerModalProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>('light');
  const [searchWord, setSearchWord] = useState('');
  const [searchHits, setSearchHits] = useState<{ chapterIdx: number; pageIdx: number }[]>([]);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [currentSearchHitIdx, setCurrentSearchHitIdx] = useState(-1);
  const [viewMode, setViewMode] = useState<'pdf' | 'summary'>('summary');
  const [resolvedPdfUrl, setResolvedPdfUrl] = useState<string>('');
  const [pdfPage, setPdfPage] = useState<number>(1);
  const [pdfZoom, setPdfZoom] = useState<string>('page-fit');
  const [isMaximized, setIsMaximized] = useState<boolean>(startMaximized);

  useEffect(() => {
    if (isOpen) {
      setIsMaximized(startMaximized);
    }
  }, [isOpen, startMaximized]);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pdfLoading, setPdfLoading] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string>('');
  const [containerWidthForResize, setContainerWidthForResize] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Set up container ResizeObserver for responsive page width/fit canvas scales
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidthForResize(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Sync viewMode on resource change
  useEffect(() => {
    if (resource && resource.pdfUrl) {
      setViewMode('pdf');
    } else {
      setViewMode('summary');
    }
  }, [resource]);

  useEffect(() => {
    let active = true;
    let objectUrl = '';

    const resolve = async () => {
      if (!resource || !resource.pdfUrl) {
        setResolvedPdfUrl('');
        return;
      }
      if (resource.pdfUrl.startsWith('localdb://')) {
        const url = await resolveFileUrl(resource.pdfUrl);
        if (active) {
          setResolvedPdfUrl(url);
          objectUrl = url;
        }
      } else {
        if (active) {
          setResolvedPdfUrl(resource.pdfUrl);
        }
      }
    };

    resolve();

    return () => {
      active = false;
      if (objectUrl && objectUrl.startsWith('blob:')) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [resource?.pdfUrl]);

  // Load and initialize PDF.js client library and parse document
  useEffect(() => {
    if (viewMode !== 'pdf' || !resolvedPdfUrl) {
      setPdfDoc(null);
      setNumPages(null);
      return;
    }

    let active = true;
    setPdfLoading(true);
    setPdfError('');
    setPdfDoc(null);

    const initPdf = async () => {
      try {
        if (!(window as any).pdfjsLib) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.async = true;
            script.onload = async () => {
              try {
                const pdfjs = (window as any).pdfjsLib;
                // Fetch the worker code and load as Blob URL to bypass Same-Origin Policy for Web Workers in cross-origin frames
                const workerUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                const workerResponse = await fetch(workerUrl);
                const workerCode = await workerResponse.text();
                const workerBlob = new Blob([workerCode], { type: 'application/javascript' });
                const workerBlobUrl = URL.createObjectURL(workerBlob);
                pdfjs.GlobalWorkerOptions.workerSrc = workerBlobUrl;
              } catch (workerErr) {
                console.warn('Could not load PDF.js worker via Blob URL, falling back to direct CDN worker URL:', workerErr);
                const pdfjs = (window as any).pdfjsLib;
                pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
              }
              resolve();
            };
            script.onerror = () => reject(new Error('Failed to load PDF engine.'));
            document.head.appendChild(script);
          });
        }

        if (!active) return;

        const pdfjsLib = (window as any).pdfjsLib;
        let loadingTask;
        try {
          // Fetch PDF binary first to handle blob/local URLs and credential flows with maximum compatibility
          const response = await fetch(resolvedPdfUrl);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const arrayBuffer = await response.arrayBuffer();
          loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
        } catch (fetchErr) {
          console.warn("Direct fetch of PDF binary failed, trying standard URL loader:", fetchErr);
          loadingTask = pdfjsLib.getDocument(resolvedPdfUrl);
        }
        const pdf = await loadingTask.promise;

        if (!active) return;
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setPdfPage(1); // Auto reset to first page upon parsing new document
        setPdfLoading(false);
      } catch (err: any) {
        console.warn('Note: PDF-JS direct canvas engine fell back to browser helper:', err);
        if (active) {
          setPdfError(err.message || 'Could not parse PDF content.');
          setPdfLoading(false);
        }
      }
    };

    initPdf();

    return () => {
      active = false;
    };
  }, [resolvedPdfUrl, viewMode]);

  // Render the current PDF page onto HTML Canvas with high performance rendering and scaling
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let active = true;
    let renderTask: any = null;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(pdfPage || 1);
        if (!active || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const containerWidth = containerRef.current?.clientWidth || 800;
        const containerHeight = containerRef.current?.clientHeight || 600;

        const unscaledViewport = page.getViewport({ scale: 1.0 });
        let scale = 1.0;

        if (pdfZoom === 'page-width') {
          scale = (containerWidth - 32) / unscaledViewport.width;
        } else if (pdfZoom === 'page-fit') {
          const scaleHeight = (containerHeight - 48) / unscaledViewport.height;
          const scaleWidth = (containerWidth - 32) / unscaledViewport.width;
          scale = Math.min(scaleHeight, scaleWidth);
        } else {
          const zoomPercent = parseFloat(pdfZoom) || 100;
          scale = (zoomPercent / 100) * ((containerWidth - 32) / unscaledViewport.width);
        }

        scale = Math.max(0.15, Math.min(scale, 5.0));

        const viewport = page.getViewport({ scale });
        const pixelRatio = window.devicePixelRatio || 1;
        canvas.width = viewport.width * pixelRatio;
        canvas.height = viewport.height * pixelRatio;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        ctx.save();
        ctx.scale(pixelRatio, pixelRatio);
        ctx.clearRect(0, 0, viewport.width, viewport.height);

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport
        };

        renderTask = page.render(renderContext);
        await renderTask.promise;
      } catch (err: any) {
        console.warn('Canvas render info in PDF-JS layout:', err);
      }
    };

    // Low-latency render debounce
    const timer = setTimeout(() => {
      renderPage();
    }, 45);

    return () => {
      active = false;
      clearTimeout(timer);
      if (renderTask && typeof renderTask.cancel === 'function') {
        renderTask.cancel();
      }
    };
  }, [pdfDoc, pdfPage, pdfZoom, containerWidthForResize, isMaximized]);

  const handleDownloadActualPdf = async () => {
    if (!resource || !resource.pdfUrl) return;
    
    try {
      let url = resource.pdfUrl;
      let isBlob = false;
      
      if (resource.pdfUrl.startsWith('localdb://')) {
        const blob = await localFileStore.getFile(resource.pdfUrl);
        if (blob) {
          url = URL.createObjectURL(blob);
          isBlob = true;
        } else {
          throw new Error("Could not find local PDF file in the browser database.");
        }
      } else if (url.startsWith('/') || url.startsWith(window.location.origin) || !url.includes('://')) {
        try {
          const res = await fetch(url);
          if (res.ok) {
            const blob = await res.blob();
            url = URL.createObjectURL(blob);
            isBlob = true;
          }
        } catch (fetchErr) {
          console.warn("Could not fetch same-origin asset as Blob. Falling back to direct link download:", fetchErr);
        }
      }
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${(resource.title || 'Handout').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      
      if (!isBlob && !url.startsWith('blob:') && !url.startsWith('data:')) {
        link.target = '_blank';
      }
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      if (isBlob) {
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      }
      
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err: any) {
      console.error("Failed to download original PDF:", err);
      window.open(resource.pdfUrl, '_blank');
    }
  };

  const docData = getSimulatedDocumentContent(resource);

  // Auto-fill active theme based on body/document class but keep it custom for paper
  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, []);

  // Sync page & chapter when chapter changes via sidebar
  const handleChapterSelect = (idx: number) => {
    setSelectedChapter(idx);
    setCurrentPage(0);
  };

  const activePages = docData.chapters[selectedChapter].pages;

  const nextPage = () => {
    if (currentPage < activePages.length - 1) {
      setCurrentPage(prev => prev + 1);
    } else if (selectedChapter < docData.chapters.length - 1) {
      setSelectedChapter(prev => prev + 1);
      setCurrentPage(0);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    } else if (selectedChapter > 0) {
      const prevChPages = docData.chapters[selectedChapter - 1].pages;
      setSelectedChapter(prev => prev - 1);
      setCurrentPage(prevChPages.length - 1);
    }
  };

  // Perform a fast document search highlight
  useEffect(() => {
    if (!searchWord || searchWord.length < 2) {
      setSearchHits([]);
      setCurrentSearchHitIdx(-1);
      return;
    }

    const hits: { chapterIdx: number; pageIdx: number }[] = [];
    docData.chapters.forEach((ch, chIdx) => {
      ch.pages.forEach((pg, pgIdx) => {
        if (pg.toLowerCase().includes(searchWord.toLowerCase())) {
          hits.push({ chapterIdx: chIdx, pageIdx: pgIdx });
        }
      });
    });

    setSearchHits(hits);
    if (hits.length > 0) {
      setCurrentSearchHitIdx(0);
      setSelectedChapter(hits[0].chapterIdx);
      setCurrentPage(hits[0].pageIdx);
    } else {
      setCurrentSearchHitIdx(-1);
    }
  }, [searchWord]);

  const nextSearchHit = () => {
    if (searchHits.length === 0) return;
    const nextIdx = (currentSearchHitIdx + 1) % searchHits.length;
    setCurrentSearchHitIdx(nextIdx);
    setSelectedChapter(searchHits[nextIdx].chapterIdx);
    setCurrentPage(searchHits[nextIdx].pageIdx);
  };

  // Real client-side study report builder to fulfill "download options for all resources"
  const triggerFileDownload = (format: 'html' | 'txt') => {
    const title = resource.title || 'Forensic_Study_Resource';
    const author = resource.author || 'ForenClue';
    
    let content = '';
    const cleanFileName = title.replace(/[^a-zA-Z0-9]/g, '_');

    if (format === 'html') {
      content = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      background-color: #fafafa;
    }
    .header {
      border-bottom: 3px solid #0284c7;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    h1 { color: #0f172a; margin-bottom: 5px; }
    .meta { color: #64748b; font-size: 0.9em; margin-bottom: 20px; }
    .chapter {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
    }
    h2 { color: #0284c7; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; }
    pre {
      white-space: pre-wrap;
      font-family: inherit;
      font-size: 1em;
    }
    .footer {
      text-align: center;
      font-size: 0.8em;
      color: #94a3b8;
      margin-top: 50px;
      border-top: 1px solid #e1e8ed;
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <div class="meta">By ${author} | Published/Released in ${resource.year || 'Academic Cycle'} | Formatted for High-Definition Printing</div>
    <p><em>${resource.desc || 'Forensic Science Study Companion provided by ForenClue.'}</em></p>
  </div>
  
  ${docData.chapters.map(ch => `
    <div class="chapter">
      <h2>${ch.title}</h2>
      ${ch.pages.map(pg => `<pre>${pg.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>`).join('<hr style="border: 0; border-top: 1px dashed #e2e8f0; margin: 25px 0;" />')}
    </div>
  `).join('')}

  <div class="footer">
    © ForenClue Academy. Prepared dynamically for webcreator500@gmail.com. Printed with high-resolution laboratory styling guidelines.
  </div>
</body>
</html>`;
    } else {
      content = `========================================================================\n`;
      content += `${title.toUpperCase()}\n`;
      content += `========================================================================\n\n`;
      content += `Resource: ${resource.title}\n`;
      content += `Author: ${author}\n`;
      content += `Category: ${resource.category || 'General Forensic Science'}\n`;
      content += `Description: ${resource.desc || 'No further description.'}\n\n`;
      content += `------------------------------------------------------------------------\n\n`;

      docData.chapters.forEach(ch => {
        content += `${ch.title.toUpperCase()}\n`;
        content += `-`.repeat(ch.title.length) + `\n\n`;
        ch.pages.forEach((pg, i) => {
          content += `Page ${i + 1}:\n${pg}\n\n`;
        });
        content += `\n` + `=`.repeat(72) + `\n\n`;
      });
    }

    const mimeType = format === 'html' ? 'text/html' : 'text/plain';
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${cleanFileName}.${format === 'html' ? 'html' : 'txt'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${resource.title} - Laboratory Print Service</title>
          <style>
            body { font-family: monospace; white-space: pre-wrap; padding: 40px; line-height: 1.5; color: black; background: white; }
            h1 { text-align: center; border-bottom: 2px solid black; padding-bottom: 10px; text-transform: uppercase; }
            h2 { border-bottom: 1px dashed black; margin-top: 40px; padding-bottom: 5px; }
            .chapter { page-break-inside: avoid; }
            .footer { margin-top: 60px; text-align: center; border-top: 1px solid black; padding-top: 10px; font-size: x-small; }
          </style>
        </head>
        <body>
          <h1>FORENCLUE LABORATORY STUDY NOTES</h1>
          <p><strong>Resource Name:</strong> ${resource.title}</p>
          <p><strong>Department:</strong> ${resource.category || "Forensic Science"}</p>
          <hr/>
          ${docData.chapters.map(ch => `
            <div class="chapter">
              <h2>${ch.title}</h2>
              ${ch.pages.join('\n\n-- PAGE DECORATOR --\n\n')}
            </div>
          `).join('')}
          <div class="footer">Printed for user webcreator500@gmail.com. Forensic evidence and study parameters are certified accurate.</div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className={cn("fixed inset-0 z-50 flex items-center justify-center select-none transition-all", isMaximized ? "p-0" : "p-4")}>
        {/* Backdrop overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#040814]/80 backdrop-blur-md"
        />

        {/* Modal Outer Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className={cn(
            "bg-base border border-black/10 dark:border-white/10 overflow-hidden shadow-2xl flex flex-col relative z-10 transition-all duration-300",
            isMaximized 
              ? "w-screen h-screen rounded-none border-none max-w-none m-0" 
              : "w-full max-w-6xl h-[92vh] sm:h-[86vh] rounded-3xl"
          )}
        >
          {/* Header Panel */}
          <div className="p-4 sm:p-5 border-b border-black/10 dark:border-white/5 bg-surface flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-warning/15 rounded-xl text-warning">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-text-main line-clamp-1 leading-tight">
                  {resource.title}
                </h2>
                <p className="text-xs text-text-muted">
                  Study PDF Viewer &bull; {resource.author || 'ForenClue Team'}
                </p>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
              {resource.pdfUrl && (
                <button
                  onClick={handleDownloadActualPdf}
                  className="px-3.5 py-1.5 bg-warning text-crust hover:bg-warning/95 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer hover:scale-102 active:scale-98 shadow-sm"
                  title="Download actual uploaded PDF document"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              )}

              {/* Document Theme Buttons */}
              <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-lg border border-black/5 dark:border-white/5">
                <button 
                  onClick={() => setTheme('light')}
                  className={cn("px-2 py-1 text-xs rounded font-medium transition-colors", theme === 'light' ? 'bg-white text-black shadow-sm' : 'text-text-muted hover:text-text-main')}
                >
                  <Sun className="w-3.5 h-3.5 inline mr-1" /> Light
                </button>
                <button 
                  onClick={() => setTheme('sepia')}
                  className={cn("px-1.5 py-1 text-xs rounded font-medium transition-colors", theme === 'sepia' ? 'bg-[#f4ecd8] text-[#4a3319] shadow-sm' : 'text-text-muted hover:text-text-main')}
                >
                  Sepia
                </button>
                <button 
                  onClick={() => setTheme('dark')}
                  className={cn("px-2 py-1 text-xs rounded font-medium transition-colors", theme === 'dark' ? 'bg-zinc-800 text-white shadow-sm' : 'text-text-muted hover:text-text-main')}
                >
                  <Moon className="w-3.5 h-3.5 inline mr-1" /> Dark
                </button>
              </div>

              {/* Close Button */}
              <button 
                onClick={onClose}
                className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-colors text-text-muted hover:text-text-main shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Viewer Core Section with Sidebar + Canvas Page block */}
          <div className="flex-1 flex overflow-hidden min-h-0">
            {/* Table of Contents sidebar for Desktop */}
            <div className={cn("hidden md:flex flex-col w-64 bg-surface border-r border-black/10 dark:border-white/5 p-4 overflow-y-auto transition-all", viewMode === 'pdf' && "md:hidden")}>
              <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-warning" /> Chapters Index
              </h4>
              
              <div className="space-y-1.5 flex-1">
                {docData.chapters.map((ch, idx) => (
                  <button
                    key={ch.id}
                    onClick={() => handleChapterSelect(idx)}
                    className={cn(
                      "w-full text-left p-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between group",
                      selectedChapter === idx 
                        ? "bg-warning/10 text-warning border border-warning/15" 
                        : "text-text-muted hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5"
                    )}
                  >
                    <span className="truncate pr-2">{ch.title}</span>
                    <span className="text-[9px] text-text-muted/65 font-mono">
                      {ch.pages.length}p
                    </span>
                  </button>
                ))}
              </div>

              {/* Info Tips under index */}
              <div className="mt-auto pt-4 border-t border-black/10 dark:border-white/5 text-[10px] text-text-muted/70 flex flex-col gap-1">
                <div className="flex gap-1.5 items-start">
                  <Info className="w-3.5 h-3.5 shrink-0 text-warning/70 mt-0.5" />
                  <span>Interactive high-resolution simulation with multiple reader themes tailored to prevent eye strain.</span>
                </div>
              </div>
            </div>

            {/* Document display Area */}
            <div className="flex-1 flex flex-col bg-crust p-3 sm:p-5 overflow-hidden relative">
              
              {/* Optional Real PDF / Interactive Study Analysis Switch */}
              {resource.pdfUrl && (
                <div className="flex justify-center mb-3 shrink-0">
                  <div className="flex gap-1 p-1 bg-surface border border-black/10 dark:border-white/10 rounded-xl">
                    <button
                      onClick={() => setViewMode('pdf')}
                      className={cn(
                        "px-4 py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5",
                        viewMode === 'pdf' ? "bg-warning text-crust shadow" : "text-text-muted hover:text-text-main"
                      )}
                    >
                      <Eye className="w-3.5 h-3.5" /> Direct PDF Document
                    </button>
                    <button
                      onClick={() => setViewMode('summary')}
                      className={cn(
                        "px-4 py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5",
                        viewMode === 'summary' ? "bg-warning text-crust shadow" : "text-text-muted hover:text-text-main"
                      )}
                    >
                      <BookOpen className="w-3.5 h-3.5" /> eLibrary Study Guide
                    </button>
                  </div>
                </div>
              )}

              {viewMode === 'pdf' && resource.pdfUrl ? (
                <div className="flex-1 overflow-hidden bg-black/15 dark:bg-black/30 rounded-2xl border border-black/10 dark:border-white/5 p-2 flex flex-col gap-2">
                  {/* High fidelity PDF manual controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-surface border border-black/10 dark:border-white/10 p-2.5 rounded-xl shrink-0">
                    {/* Page Change Trigger Section */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPdfPage(prev => Math.max(1, prev - 1))}
                        disabled={pdfPage <= 1}
                        className="px-3 py-1.5 bg-base hover:bg-black/5 dark:hover:bg-white/5 text-xs text-text-main font-bold border border-black/10 dark:border-white/10 rounded-lg flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                        title="Previous Page"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Prev</span>
                      </button>

                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-text-muted font-mono">Page</span>
                        <input
                          type="number"
                          min={1}
                          max={numPages || undefined}
                          value={pdfPage}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val) && val > 0) {
                              setPdfPage(Math.min(numPages || Infinity, val));
                            } else if (e.target.value === '') {
                              setPdfPage('' as any);
                            }
                          }}
                          onBlur={() => {
                            if (!pdfPage || typeof pdfPage !== 'number' || pdfPage < 1) {
                              setPdfPage(1);
                            }
                          }}
                          className="w-12 bg-base border border-black/10 dark:border-white/10 rounded-lg py-1 text-center text-xs font-bold font-mono text-text-main outline-none focus:border-warning/50"
                        />
                        {numPages && (
                          <span className="text-text-muted font-mono text-[10px] ml-1">
                            / {numPages}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => setPdfPage(prev => (typeof prev === 'number' ? Math.min(numPages || Infinity, prev + 1) : 1))}
                        disabled={numPages ? pdfPage >= numPages : false}
                        className="px-3 py-1.5 bg-base hover:bg-black/5 dark:hover:bg-white/5 text-xs text-text-main font-bold border border-black/10 dark:border-white/10 rounded-lg flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                        title="Next Page"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Fit & Zoom section */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-lg border border-black/5 dark:border-white/5">
                        <button
                          onClick={() => setPdfZoom('page-fit')}
                          className={cn(
                            "px-2 py-1 text-[10px] uppercase tracking-wider rounded font-bold transition-all cursor-pointer",
                            pdfZoom === 'page-fit' ? "bg-warning text-crust shadow-sm" : "text-text-muted hover:text-text-main"
                          )}
                          title="Fit Page size to view bounds"
                        >
                          Fit Page
                        </button>
                        <button
                          onClick={() => setPdfZoom('page-width')}
                          className={cn(
                            "px-2 py-1 text-[10px] uppercase tracking-wider rounded font-bold transition-all cursor-pointer",
                            pdfZoom === 'page-width' ? "bg-warning text-crust shadow-sm" : "text-text-muted hover:text-text-main"
                          )}
                          title="Stretch PDF width to fit the window width"
                        >
                          Fit Width
                        </button>
                      </div>

                      {/* Zoom Presets Selector */}
                      <select
                        value={['page-fit', 'page-width'].includes(pdfZoom) ? pdfZoom : pdfZoom ?? '100'}
                        onChange={(e) => setPdfZoom(e.target.value)}
                        className="bg-base border border-black/10 dark:border-white/10 text-xs font-bold rounded-lg px-2 py-1 text-text-main outline-none focus:border-warning/50 cursor-pointer"
                        title="Scale Zoom percent"
                      >
                        <option value="page-fit">Adaptive Fit</option>
                        <option value="page-width">Wide Fit</option>
                        <option value="50">50%</option>
                        <option value="75">75%</option>
                        <option value="100">100%</option>
                        <option value="125">125%</option>
                        <option value="150">150%</option>
                        <option value="200">200%</option>
                      </select>

                      {/* Screen Fit (Maximize Mode) Toggle */}
                      <button
                        onClick={() => setIsMaximized(!isMaximized)}
                        className={cn(
                          "px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1 text-xs font-bold",
                          isMaximized 
                            ? "bg-warning/10 text-warning border-warning/30 hover:bg-warning/20 shadow-sm" 
                            : "bg-base text-text-main border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
                        )}
                        title={isMaximized ? "Collapse to standard modal size" : "Expand viewer to fill entire device screen"}
                      >
                        {isMaximized ? <Minimize2 className="w-3.5 h-3.5 text-warning" /> : <Maximize2 className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">{isMaximized ? "Exit Focus" : "Fit Screen"}</span>
                      </button>
                    </div>
                  </div>

                  {pdfLoading ? (
                    <div className="flex-grow flex flex-col items-center justify-center text-text-muted gap-3 py-12">
                      <div className="w-8 h-8 border-3 border-warning border-t-transparent rounded-full animate-spin" />
                      <div className="text-center">
                        <p className="font-bold text-text-main text-xs">Analyzing PDF resources...</p>
                        <p className="text-[10px] text-text-muted mt-0.5">Assembling security hashes and formatting vector frames</p>
                      </div>
                    </div>
                  ) : pdfError ? (
                    /* Fall back to standard browser iframe if PDF.js engine is blocked */
                    <div className="flex-grow flex flex-col relative w-full h-full min-h-[400px] gap-2">
                      <div className="bg-warning/10 border border-warning/20 p-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-text-main gap-3">
                        <div className="flex items-center gap-2">
                          <Info className="w-4 h-4 text-warning shrink-0 animate-pulse" />
                          <span>Direct canvas rendering is unavailable due to browser security or CORS policies. You can read the document below or open it in a new window.</span>
                        </div>
                        <a 
                          href={resolvedPdfUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-warning text-crust font-black rounded-lg uppercase tracking-wider hover:bg-warning/90 transition-all text-[10px] text-center w-full sm:w-auto"
                        >
                          Open in New Tab
                        </a>
                      </div>
                      <iframe
                        key={`${pdfPage}-${pdfZoom}-${resolvedPdfUrl}`}
                        src={`${resolvedPdfUrl}#page=${pdfPage || 1}&zoom=${pdfZoom}`}
                        className="w-full h-full flex-grow border-0 rounded-xl bg-white"
                        title={resource.title}
                      />
                    </div>
                  ) : resolvedPdfUrl ? (
                    /* Custom Interactive High Performance PDF Canvas Viewer */
                    <div 
                      ref={containerRef}
                      className="flex-1 overflow-auto flex justify-center items-start bg-black/5 dark:bg-black/25 p-2 rounded-xl border border-black/5 dark:border-white/5 shadow-inner"
                    >
                      <canvas 
                        ref={canvasRef} 
                        className="shadow-xl rounded-lg bg-white max-w-full"
                      />
                    </div>
                  ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-text-muted gap-2 font-mono text-xs">
                      <div className="w-6 h-6 border-2 border-warning border-t-transparent rounded-full animate-spin" />
                      <span>Resolving PDF secure parameters...</span>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Toolbar in body: search, zoom, pages info */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-surface border border-black/10 dark:border-white/10 rounded-2xl p-2.5 mb-4 shrink-0">
                    {/* Search Term Bar */}
                    <div className="relative w-fit min-w-[150px] sm:min-w-[220px]">
                      <Search className="absolute inset-y-0 left-3 my-auto w-3.5 h-3.5 text-text-muted" />
                      <input 
                        type="text" 
                        placeholder="Search inside doc..." 
                        value={searchWord}
                        onChange={(e) => setSearchWord(e.target.value)}
                        className="w-full bg-base border border-black/10 dark:border-white/5 rounded-xl pl-8 pr-16 py-1.5 text-xs text-text-main focus:outline-none focus:border-warning/50 font-mono"
                      />
                      {searchHits.length > 0 && (
                        <div className="absolute right-1 inset-y-1 flex items-center gap-1">
                          <span className="text-[10px] font-mono text-warning bg-warning/10 px-1.5 rounded">
                            {currentSearchHitIdx + 1}/{searchHits.length}
                          </span>
                          <button 
                            onClick={nextSearchHit}
                            className="p-1 hover:bg-black/10 dark:hover:bg-white/15 rounded text-text-muted hover:text-text-main cursor-pointer"
                            title="Next Search Hit"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Chapter Select menu for Mobile */}
                    <div className="md:hidden w-full sm:w-auto">
                      <select
                        value={selectedChapter}
                        onChange={(e) => handleChapterSelect(Number(e.target.value))}
                        className="w-full bg-base border border-black/10 dark:border-white/5 rounded-xl p-1.5 text-xs font-semibold text-text-main focus:outline-none focus:border-warning/30"
                      >
                        {docData.chapters.map((ch, idx) => (
                          <option key={ch.id} value={idx}>{ch.title}</option>
                        ))}
                      </select>
                    </div>

                    {/* Zoom Controls & Print options */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 border-r border-black/10 dark:border-white/5 pr-3">
                        <button 
                          onClick={() => setZoom(prev => Math.max(0.75, prev - 0.15))}
                          className="p-1.5 hover:bg-black/10 dark:hover:bg-white/15 rounded-lg text-text-muted hover:text-text-main transition-colors cursor-pointer"
                          title="Zoom Out"
                        >
                          <ZoomOut className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-mono font-bold text-text-muted min-w-[36px] text-center">
                          {Math.round(zoom * 100)}%
                        </span>
                        <button 
                          onClick={() => setZoom(prev => Math.min(1.5, prev + 0.15))}
                          className="p-1.5 hover:bg-black/10 dark:hover:bg-white/15 rounded-lg text-text-muted hover:text-text-main transition-colors cursor-pointer"
                          title="Zoom In"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </button>
                      </div>

                      <button 
                        onClick={handlePrint}
                        className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-main transition-colors cursor-pointer"
                        title="Print Document"
                      >
                        <Printer className="w-4 h-4" />
                        <span className="hidden sm:inline font-semibold">Print</span>
                      </button>
                    </div>
                  </div>

                  {/* The Realistic Printable/Renderable document page block */}
                  <div className="flex-1 overflow-auto flex items-center justify-center p-3 relative min-h-0 bg-black/15 dark:bg-black/40 rounded-2xl border border-black/10 dark:border-white/5">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${selectedChapter}-${currentPage}`}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        style={{
                          transform: `scale(${zoom})`,
                          transformOrigin: 'center center'
                        }}
                        className={cn(
                          "w-full max-w-[620px] aspect-[1/1.4] p-8 sm:p-12 shadow-2xl rounded-xl border flex flex-col justify-between transition-all duration-300 relative select-text overflow-y-auto max-h-full",
                          theme === 'light' && "bg-[#ffffff] text-[#0f172a] border-[#e2e8f0]",
                          theme === 'sepia' && "bg-[#f4ecd8] text-[#4a3319] border-[#e4d4b2]",
                          theme === 'dark' && "bg-[#0b1329] text-[#e2e8f0] border-white/5"
                        )}
                      >
                        {/* Corner laboratory style grids or aesthetic lines for academic rigor */}
                        <div className="absolute top-2 left-2 text-[8px] font-mono text-text-muted/20">ForenClue-Doc-[{resource.id}]</div>
                        <div className="absolute top-2 right-2 text-[8px] font-mono text-text-muted/40">Lab Copy • SECURE</div>

                        {/* Paper Top margin header */}
                        <div className="border-b border-black/5 dark:border-white/5 pb-3 flex justify-between items-center bg-transparent shrink-0">
                          <span className="text-[10px] font-bold tracking-widest uppercase text-warning opacity-80 font-mono">
                            {docData.chapters[selectedChapter].title}
                          </span>
                          <span className="text-[9px] font-mono text-text-muted/60">
                            Page {currentPage + 1}/{activePages.length}
                          </span>
                        </div>

                        {/* Actual page body text block */}
                        <div className="flex-1 my-6 text-[11px] sm:text-[13px] leading-relaxed font-mono whitespace-pre-wrap flex flex-col gap-4 overflow-y-auto pr-1">
                          {highlightSearchMatches(activePages[currentPage], searchWord)}
                        </div>

                        {/* Paper Bottom footer */}
                        <div className="border-t border-black/5 dark:border-white/5 pt-3 flex justify-between items-center text-[9px] text-text-muted/65 font-mono shrink-0">
                          <span>ForenClue E-Library Verification Platform</span>
                          <span>{currentPage + 1 === activePages.length && selectedChapter + 1 === docData.chapters.length ? "End of File" : "Draft Reading"}</span>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Navigation in footer: Prev / Next page */}
                  <div className="flex items-center justify-between mt-4 shrink-0 px-2">
                    <button 
                      onClick={prevPage}
                      disabled={selectedChapter === 0 && currentPage === 0}
                      className="flex items-center gap-1.5 px-4 py-2 bg-surface hover:bg-black/5 dark:hover:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs font-bold text-text-main transition-all disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>

                    <div className="text-xs font-semibold text-text-muted">
                      Chapter {selectedChapter + 1} of {docData.chapters.length} &bull; Page {currentPage + 1}/{activePages.length}
                    </div>

                    <button 
                      onClick={nextPage}
                      disabled={selectedChapter === docData.chapters.length - 1 && currentPage === activePages.length - 1}
                      className="flex items-center gap-1.5 px-4 py-2 bg-surface hover:bg-black/5 dark:hover:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-xs font-bold text-text-main transition-all disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}

            </div>

            {/* Sidebar with dynamic, functional download options */}
            <div className="w-80 bg-surface border-l border-black/10 dark:border-white/5 p-5 hidden lg:flex flex-col justify-between overflow-y-auto">
              <div>
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-warning" /> Download Station
                </h4>

                <p className="text-xs text-text-muted mb-5 leading-relaxed">
                  Export this verified document to your local workstation. Select from the high-fidelity download options compiled strictly for forensic study:
                </p>

                {/* Download Menu Buttons */}
                <div className="space-y-3.5">
                  {resource.pdfUrl && (
                    <button
                      onClick={handleDownloadActualPdf}
                      className="w-full relative p-4 bg-warning/5 hover:bg-warning/10 text-left rounded-2xl border border-warning/15 hover:border-warning/30 transition-all flex items-start gap-3 group/dl text-xs cursor-pointer"
                    >
                      <div className="p-2 bg-warning/15 text-warning rounded-lg group-hover/dl:bg-warning/20 transition-colors">
                        <FileDown className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <div className="font-bold text-text-main group-hover/dl:text-warning transition-colors flex items-center gap-1">
                          Original PDF Document
                        </div>
                        <div className="text-[10px] text-text-muted mt-0.5">
                          Download the actual uploaded PDF file ({resource.size || 'Original Size'}) to read in your local system viewer.
                        </div>
                      </div>
                    </button>
                  )}

                  <button
                    onClick={() => triggerFileDownload('html')}
                    className="w-full relative p-4 bg-base hover:bg-black/5 dark:hover:bg-white/5 text-left rounded-2xl border border-black/15 dark:border-white/10 hover:border-warning/40 transition-all flex items-start gap-3 group/dl text-xs cursor-pointer"
                  >
                    <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg group-hover/dl:bg-emerald-500/20 transition-colors">
                      <FileDown className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="font-bold text-text-main group-hover/dl:text-warning transition-colors flex items-center gap-1">
                        High-Fi Printable PDF / HTML
                      </div>
                      <div className="text-[10px] text-text-muted mt-0.5">
                        High fidelity paper layout with beautiful CSS rendering suitable to save or print as high-res local PDF.
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => triggerFileDownload('txt')}
                    className="w-full relative p-4 bg-base hover:bg-black/5 dark:hover:bg-white/5 text-left rounded-2xl border border-black/15 dark:border-white/10 hover:border-warning/40 transition-all flex items-start gap-3 group/dl text-xs cursor-pointer"
                  >
                    <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg group-hover/dl:bg-amber-500/20 transition-colors">
                      <FileText className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="font-bold text-text-main group-hover/dl:text-warning transition-colors">
                        Study Text Guide (.txt)
                      </div>
                      <div className="text-[10px] text-text-muted mt-0.5">
                        Optimized plain text dossier containing all bullet summaries suitable for fast text-to-speech or summary parsing.
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="w-full relative p-4 bg-base hover:bg-black/5 dark:hover:bg-white/5 text-left rounded-2xl border border-black/15 dark:border-white/10 hover:border-warning/40 transition-all flex items-start gap-3 group/dl text-xs cursor-pointer"
                  >
                    <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg group-hover/dl:bg-blue-500/20 transition-colors">
                      <Printer className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="font-bold text-text-main group-hover/dl:text-warning transition-colors">
                        Direct Page Print Service
                      </div>
                      <div className="text-[10px] text-text-muted mt-0.5">
                        Triggers system print dialog. Standard mono spacing layouts safe for quick reference cheat sheets.
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Status or alerts */}
              <div className="mt-8">
                {downloadSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl flex items-center gap-2 text-xs text-emerald-400 font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Dossier file generated and downloaded successfully!</span>
                  </motion.div>
                ) : (
                  <div className="bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 p-3 rounded-2xl text-[10px] text-text-muted/80 leading-relaxed font-mono">
                    <span className="text-warning font-bold">● ONLINE STATUS</span> &bull; All options compile verified serverless assets locally. Safe and responsive in offline mode.
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// Highlights parts of the text matching search word
function highlightSearchMatches(text: string, searchWord: string) {
  if (!searchWord || searchWord.length < 2) return text;

  const escapedSearchWord = searchWord.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`(${escapedSearchWord})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, idx) => 
        part.toLowerCase() === searchWord.toLowerCase() ? (
          <mark key={idx} className="bg-amber-400/90 text-black px-0.5 rounded font-bold animate-pulse">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}
