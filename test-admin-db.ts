import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
admin.initializeApp({ projectId: config.projectId });

const demoEmployees = [
  {
    employeeId: 'FC-EMP-102',
    fullName: 'Ashutosh Singh',
    position: 'Cyber Forensic Expert',
    department: 'Cybersecurity & Digital Forensics',
    joiningDate: '2024-01-12',
    expiryDate: '2029-01-12',
    status: 'Active',
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
    status: 'Active',
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
    status: 'Active',
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
    id: 'v0FbBY5KebZ0L6HbCyHqE',
    title: 'The Mystery of Lab 104: Saliva DNA Profiling',
    tag: 'DNA Profiling',
    year: '2024',
    location: 'Mumbai Forensic Lab',
    difficulty: 'Expert',
    type: 'Homicide',
    image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e024?auto=format&fit=crop&q=80&w=1000',
    summary: 'A high-profile homicide case solved using state-of-the-art DNA profiling. Secretion extraction from a partially smoked cigarette butt led to positive database matching.',
    details: '## Case Background\nOn May 12, 2024, Dr. Vikram Sarabhai was found dead in his private research office at the Mumbai Forensic Institute. There were signs of a struggle, but no clear weapon or fingerprints left at the primary scene. The suspect had meticulously wiped down all physical surfaces with ethanol.\n\n## Forensic Recovery\nInvestigating officers recovered a single, partially smoked cigarette butt from an ashtray inside the lab. Initial inspection suggested it had been left recently. Standard fingerprinting yielded no clear ridges due to moisture.\n\n## Laboratory Analysis\n1. **DNA Extraction**: Forensic technicians used a modified Differential Extraction protocol to isolate cellular material left in the saliva residues on the cigarette filter.\n2. **PCR Amplification**: The recovered DNA was amplified using standard multiplex PCR targeting 24 CODIS STR loci.\n3. **Electropherogram Results**: A clear, single-source male profile was generated. The profile was queried against the National Forensic Database.\n\n## Break in the Case\nThe search yielded a perfect match with a former research assistant, Rohan Mehra, who had been terminated three months prior for security violations. Confronted with the DNA evidence, the suspect confessed to the homicide.\n\n## Scientific Evidence and Conclusion\nThe likelihood ratio of the match was calculated at 1 in 4.8 quadrillion, presenting irrefutable proof in a court of law.',
    status: 'published',
    createdBy: 'forenclue@gmail.com',
    evidenceLabels: ['Cigarette Butt', 'Saliva Resides', 'Dr. Sarabhai Blood Spatter'],
    forensicTechniques: ['PCR Multiplexing', 'STR Analysis', 'Differential DNA Extraction'],
    contentImages: [
      {
        url: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=600',
        caption: 'Laboratory DNA Extraction Chamber with Centrifuge Setup'
      },
      {
        url: 'https://images.unsplash.com/photo-1542382257-80dedb725088?auto=format&fit=crop&q=80&w=600',
        caption: 'Automated Capillary Electrophoresis STR Output Peaks'
      }
    ],
    attachments: ['https://forenclue.in/sample_cert.pdf'],
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
    details: '## Investigative Overview\nIn January 2024, a major defense manufacturing plant in Bangalore suffered a total lockdown of its internal operations due to a highly sophisticated ransomware strain. All active workstations displayed a decryption fee demand of 45 BTC.\n\n## Digital Ingress Analysis\n1. **Log Triaging**: Firewalls, active directory logs, and VPN server history were analyzed. A suspicious session was detected originating from a leased IP range in Eastern Europe.\n2. **Registry and Malware Analysis**: Analysts extracted a memory dump from the compromised primary domain controller. Reverse engineering of the payload (`win_crypto_v4.dll`) revealed standard techniques to evade endpoint protection services.\n3. **Decryption Vector**: The threat actors utilized a zero-day vulnerability in the SSL VPN appliance to bypass multi-factor authentication checks.\n\n## Forensic Insights\nThe forensic team traced the cryptocurrency wallet address specified in the ransom note. By collaborating with international exchanges, they identified previous laundering paths linked to the infamous APT-33 group.\n\n## Lessons Learned\n- Enforce complete network segmentation between administrative and active operational technology (OT) systems.\n- Keep VPN firmware up to date with urgent patches.',
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
    details: '## Case Introduction\nA highly contested inheritance claim hinged on a land transfer deed dated September 14, 1965. The deed featured the official signature of the registrar and an embossed rubber-stamp seal.\n\n## Physical and Chemical Examination\n1. **Embossing Analysis**: True seals of that era produce distinct physical paper deformation (embossing). Oblique light examination revealed zero indentation on the disputed deed.\n2. **Microscopic Ink Analysis**: Under high-resolution microscopy, the red stamp ink showed distinct CMYK droplet splatters characteristic of modern inkjet printers, rather than the oil-based stamp pads utilized in the 1960s.\n3. **Paper Degradation**: Mass spectrometry of the paper cellulose fibers indicated a level of lignin decomposition consistent with wood-pulp paper manufactured after 1990.\n\n## Resolution\nConfronted with the physical evidence report, the claimants admitted to forging the document using high-resolution flatbed scanning and artificial chemical aging techniques.\n\n## Scientific Significance\nThis case demonstrates that physical and chemical properties of materials serve as infallible indicators of temporal anomalies in document fabrication.',
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
    details: '## Case Background\nOn March 14, 2024, security staff at the National Museum of India reported that a rare Mughal-era gold dinar had been replaced with a high-quality replica. The display case had been breached without triggering local laser tripwires.\n\n## Forensic Recovery\nInvestigating officers recovered a discarded cotton work glove near the ventilation duct. Microscopic analysis of the display case glass window showed a localized edge fracture, indicating a precision mechanical glass cutter had been used. Soil particulates were extracted from the palm side of the recovered glove.\n\n## Laboratory Analysis\n1. **Soil mineralogy**: X-ray diffraction (XRD) of the soil particulates showed high concentrations of kaolinite and specific quartz sand ratios matching a specific construction site located 2.4 kilometers away from the museum.\n2. **Glass Fracture Refractive Index**: The glass fragments salvaged from the exhibit had a refractive index matching standard 4mm tempered architectural glass, showing clear trace markings from a diamond-tip circular cutter.\n3. **Latent Prints**: Superglue fuming of the inner surface of the glove successfully yielded a partial latent print corresponding to a known repeat offender, Ajay Verma.\n\n## Break in the Case\nAjay Verma was located at the identified construction site. A search warrant of his residence recovered the genuine gold dinar hidden inside a toolbox. The physical soil match and the latent print from the glove provided a watertight prosecution case.\n\n## Scientific Evidence and Conclusion\nTrace geological mineral comparison and physical glass fracture matches provided irrefutable chemical and spatial evidence linking the suspect to both the crime scene and his arrest location.',
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
    details: '## Case Background\nIn October 2022, hikers in Crimson Creek Woods discovered partial skeletal remains exposed due to heavy soil erosion. Initial autopsy indicated the individual had been buried for over a decade. Traditional identification methods like DNA profiling failed initially because no direct family references were available.\n\n## Anthropological Assessment\nForensic anthropologists reconstructed the cranium and pelvis to determine biological profile:\n1. **Sex**: Male, determined from subpubic angle and robust cranial features.\n2. **Age**: 28-32 years at death, based on epiphyseal fusion and dental wear patterns.\n3. **Ancestry**: South Asian.\n4. **Stature**: Estimated at 178 cm using femur length formulas.\n\n## Laboratory Analysis & 3D Reconstruction\n1. **3D Facial Reconstruction**: The skull was digitized using a high-precision structured light 3D scanner. Virtual tissue depth markers were placed on standard anatomical landmarks (e.g., nasion, glabella, gnathion) based on South Asian average databases.\n2. **Isotope Analysis**: Carbon-13 and Nitrogen-15 isotope ratios from bone collagen suggested a diet rich in inland grains, placing the individual\'s childhood origin in northern rural agricultural zones.\n3. **Facial Rendering**: An artist overlaid digital muscle groups and skin tissue to produce a high-fidelity facial portrait.\n\n## Break in the Case\nThe reconstructed face was broadcast on regional news channels. It was recognized by a family in Shimla as Vikram Kapoor, who had mysteriously disappeared in 2007. Subsequent DNA comparison with Vikram\'s living siblings yielded a positive kinship match of 99.98% probability. Police investigation then focused on Vikram\'s former business partner, leading to a successful conviction for manslaughter.\n\n## Scientific Significance\nThis case highlights the power of combining traditional osteology, 3D computerized facial rendering, and modern stable isotope analysis to give a face and a name to long-forgotten victims.',
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

async function run() {
  try {
    const db = getFirestore(admin.app(), config.firestoreDatabaseId);
    console.log("Connected to Firestore:", config.firestoreDatabaseId || "(default)");

    console.log("Restoring Employee Verification Database...");
    for (const emp of demoEmployees) {
      const safeId = emp.employeeId.toUpperCase().trim().replace(/[\/\s]/g, '_');
      await db.collection("employees").doc(safeId).set(emp);
      console.log(`Seeded Employee: ${emp.employeeId} (${emp.fullName})`);
    }

    console.log("Restoring Certificate Verification Database...");
    for (const cert of demoCertificates) {
      const safeId = cert.certificateNo.toUpperCase().trim().replace(/[\/\s]/g, '_');
      await db.collection("certificates").doc(safeId).set(cert);
      console.log(`Seeded Certificate: ${cert.certificateNo} (${cert.fullName})`);
    }

    console.log("Restoring Cases Database...");
    for (const c of demoCases) {
      const safeId = c.id;
      await db.collection("cases").doc(safeId).set(c);
      console.log(`Seeded Case Study: ${c.id} (${c.title})`);
    }

    console.log("Database successfully restored and seeded with verified credentials.");
  } catch (e) {
    console.error("Error restoring database:", e);
  }
}
run();

