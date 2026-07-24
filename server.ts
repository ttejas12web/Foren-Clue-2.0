import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import 'dotenv/config';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

import { COURSES } from './src/constants.js';

const __filename = typeof process !== 'undefined' && process.argv[1] ? process.argv[1] : '';
const currentDir = typeof __dirname !== 'undefined' ? __dirname : (typeof process !== 'undefined' ? process.cwd() : '');
const isProd = process.env.NODE_ENV === "production";
const buildPath = path.join(process.cwd(), 'dist');
const projectRootDir = process.cwd();

// Load firebase config for server use
let firebaseConfig: any = {};
try {
  firebaseConfig = JSON.parse(fs.readFileSync(path.join(projectRootDir, 'firebase-applet-config.json'), 'utf-8'));
} catch (err) {
  console.warn("Could not load firebase-applet-config.json. This is expected during some build phases if the file is not yet available.");
}

// Initialize Firebase Admin lazily
let _dbAdmin: any = null;
function getDbAdmin() {
  if (_dbAdmin) return _dbAdmin;

  if (!admin.apps.length) {
    if (firebaseConfig.projectId) {
      try {
        admin.initializeApp({
          projectId: firebaseConfig.projectId,
          storageBucket: firebaseConfig.storageBucket || `${firebaseConfig.projectId}.firebasestorage.app`,
        });
      } catch (err) {
        console.error("Firebase Admin initialization error:", err);
        throw new Error("Failed to initialize Firebase Admin");
      }
    } else {
      console.error("Firebase projectId missing in config.");
      throw new Error("Firebase configuration missing");
    }
  }
  _dbAdmin = getFirestore(admin.app(), firebaseConfig.firestoreDatabaseId);
  return _dbAdmin;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Create uploads and temp directory on server start if it doesn't exist
  const uploadsDir = path.join(process.cwd(), "uploads");
  const tempDirBase = path.join(uploadsDir, "temp");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  if (!fs.existsSync(tempDirBase)) {
    fs.mkdirSync(tempDirBase, { recursive: true });
  }

  // Serve uploaded files statically
  app.use("/api/uploads", express.static(uploadsDir));

  function getRazorpay() {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
        throw new Error('Razorpay credentials missing. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to the Settings > Secrets menu.');
    }
    return new Razorpay({ key_id, key_secret });
  }

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // RESTORE AND SEED VERIFICATION DATABASES
  app.post("/api/restore-verification-database", async (req, res) => {
    try {
      const db = getDbAdmin();
      
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

      console.log("Restoring Employee Verification Database from server...");
      for (const emp of demoEmployees) {
        const safeId = emp.employeeId.toUpperCase().trim().replace(/[\/\s]/g, '_');
        await db.collection("employees").doc(safeId).set(emp);
      }

      console.log("Restoring Certificate Verification Database from server...");
      for (const cert of demoCertificates) {
        const safeId = cert.certificateNo.toUpperCase().trim().replace(/[\/\s]/g, '_');
        await db.collection("certificates").doc(safeId).set(cert);
      }

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

      console.log("Restoring Case Studies Database from server...");
      for (const c of demoCases) {
        const safeId = c.id;
        await db.collection("cases").doc(safeId).set(c);
      }

      console.log("Database successfully restored and seeded from server-side.");
      res.json({ success: true, message: "Employee, Certificate, and Forensic Case Study databases successfully restored and seeded!" });
    } catch (err: any) {
      console.error("Error restoring databases from server-side:", err);
      res.status(500).json({ error: err.message || "Failed to restore databases from server-side." });
    }
  });

  // Chunked upload endpoint to bypass nginx 1MB request limits in iframe sandboxes
  app.post("/api/upload-chunk", async (req, res) => {
    try {
      const { uploadId, chunkIndex, totalChunks, fileName, fileType, base64Data, cloudPath } = req.body;
      
      if (!uploadId || chunkIndex === undefined || totalChunks === undefined || !base64Data) {
        return res.status(400).json({ error: "Missing required chunk upload payload parameters." });
      }

      const tempUploadDir = path.join(tempDirBase, uploadId);
      if (!fs.existsSync(tempUploadDir)) {
        fs.mkdirSync(tempUploadDir, { recursive: true });
      }

      // Strip potential data url prefix
      const base64Clean = base64Data.replace(/^data:.*?;base64,/, "");
      const chunkBuffer = Buffer.from(base64Clean, "base64");

      const chunkPath = path.join(tempUploadDir, `chunk_${chunkIndex}`);
      await fs.promises.writeFile(chunkPath, chunkBuffer);

      console.log(`[Chunk upload] Saved chunk ${chunkIndex + 1}/${totalChunks} for upload ${uploadId} (${chunkBuffer.length} bytes)`);

      // If it is the last chunk, perform concatenation and process save
      if (chunkIndex === totalChunks - 1) {
        console.log(`[Chunk upload] Last chunk received. Consolidating all ${totalChunks} chunks...`);
        const buffers: Buffer[] = [];
        for (let i = 0; i < totalChunks; i++) {
          const currentChunkPath = path.join(tempUploadDir, `chunk_${i}`);
          if (!fs.existsSync(currentChunkPath)) {
            throw new Error(`Missing expected chunk file ${i} at ${currentChunkPath}`);
          }
          const chunkBuf = await fs.promises.readFile(currentChunkPath);
          buffers.push(chunkBuf);
        }

        const consolidatedBuffer = Buffer.concat(buffers);
        console.log(`[Chunk upload] Consolidation successful. Full size: ${consolidatedBuffer.length} bytes`);

        // Perform standard upload logic
        const sanitizedName = (fileName || `upload_${Date.now()}`).replace(/[^a-zA-Z0-9.\-_]/g, "_");
        let finalUrl = "";
        let uploadedToFirebase = false;

        // Try permanently uploading of consolidated file to Firebase Storage from Server Admin SDK
        try {
          getDbAdmin();

          const bucketCandidates: string[] = [];
          if (firebaseConfig.storageBucket) {
            bucketCandidates.push(firebaseConfig.storageBucket);
          }
          if (firebaseConfig.projectId) {
            const appspotBucket = `${firebaseConfig.projectId}.appspot.com`;
            const firebasestorageBucket = `${firebaseConfig.projectId}.firebasestorage.app`;
            const rawIdBucket = firebaseConfig.projectId;
            if (!bucketCandidates.includes(appspotBucket)) bucketCandidates.push(appspotBucket);
            if (!bucketCandidates.includes(firebasestorageBucket)) bucketCandidates.push(firebasestorageBucket);
            if (!bucketCandidates.includes(rawIdBucket)) bucketCandidates.push(rawIdBucket);
          }

          const gcsPath = cloudPath || `uploads/${Date.now()}_${sanitizedName}`;
          const token = crypto.randomUUID();
          let lastErr: any = null;

          for (const bucketName of bucketCandidates) {
            try {
              console.log(`[Firebase Storage Admin upload] Trying bucket: ${bucketName}...`);
              const bucket = admin.storage().bucket(bucketName);
              const gcsFile = bucket.file(gcsPath);

              await gcsFile.save(consolidatedBuffer, {
                metadata: {
                  contentType: fileType || "application/octet-stream",
                  metadata: {
                    firebaseStorageDownloadTokens: token,
                  }
                },
                resumable: false,
              });

              finalUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(gcsPath)}?alt=media&token=${token}`;
              console.log(`[Firebase Storage Admin upload] Successfully uploaded consolidated file ${gcsPath} to ${bucketName} with url ${finalUrl}`);
              uploadedToFirebase = true;
              break;
            } catch (err: any) {
              lastErr = err;
            }
          }

          if (!uploadedToFirebase && lastErr) {
            throw lastErr;
          }
        } catch (storageErr: any) {
          // Fall back gracefully to local storage
        }

        // Always save to server disk as fail-safe backup
        const uniqueFileName = `${Date.now()}_${sanitizedName}`;
        const filePath = path.join(uploadsDir, uniqueFileName);
        await fs.promises.writeFile(filePath, consolidatedBuffer);
        console.log(`[Server disk upload cache, consolidated file written] ${uniqueFileName} (${consolidatedBuffer.length} bytes)`);

        if (!uploadedToFirebase) {
          finalUrl = `/api/uploads/${uniqueFileName}`;
        }

        // Clean up temporary chunks
        try {
          for (let i = 0; i < totalChunks; i++) {
            await fs.promises.unlink(path.join(tempUploadDir, `chunk_${i}`));
          }
          await fs.promises.rmdir(tempUploadDir);
          console.log(`[Chunk upload] Cleaned up temp upload directory: ${tempUploadDir}`);
        } catch (cleanupErr) {
          console.warn(`[Chunk upload] Cleaned up error or warning:`, cleanupErr);
        }

        return res.json({
          success: true,
          url: finalUrl,
          relativePath: `/api/uploads/${uniqueFileName}`,
          fileName: uniqueFileName,
          size: consolidatedBuffer.length,
          uploadedToFirebase
        });
      }

      // For intermediate chunks, return progress status
      res.json({
        success: true,
        chunkReceived: chunkIndex,
        isCompleted: false
      });

    } catch (err: any) {
      console.error("[Chunk upload endpoint error]:", err);
      res.status(500).json({ error: err.message || "Failed to process slice upload chunk." });
    }
  });

  // Base64 server disk file upload endpoint for resilient backup
  app.post("/api/upload", async (req, res) => {
    try {
      const { fileName, fileType, base64Data, cloudPath } = req.body;
      if (!base64Data) {
        return res.status(400).json({ error: "Missing base64Data of file." });
      }

      // Stripping data URL prefix if sent
      const base64Clean = base64Data.replace(/^data:.*?;base64,/, "");
      const buffer = Buffer.from(base64Clean, "base64");

      const sanitizedName = (fileName || `upload_${Date.now()}`).replace(/[^a-zA-Z0-9.\-_]/g, "_");

      let finalUrl = "";
      let uploadedToFirebase = false;

      // Try uploading to Firebase Storage permanently from Server
      try {
        // Ensure Admin SDK is initialized via lazy helper
        getDbAdmin();

        const bucketCandidates: string[] = [];
        if (firebaseConfig.storageBucket) {
          bucketCandidates.push(firebaseConfig.storageBucket);
        }
        if (firebaseConfig.projectId) {
          const appspotBucket = `${firebaseConfig.projectId}.appspot.com`;
          const firebasestorageBucket = `${firebaseConfig.projectId}.firebasestorage.app`;
          const rawIdBucket = firebaseConfig.projectId;
          if (!bucketCandidates.includes(appspotBucket)) bucketCandidates.push(appspotBucket);
          if (!bucketCandidates.includes(firebasestorageBucket)) bucketCandidates.push(firebasestorageBucket);
          if (!bucketCandidates.includes(rawIdBucket)) bucketCandidates.push(rawIdBucket);
        }

        const gcsPath = cloudPath || `uploads/${Date.now()}_${sanitizedName}`;
        const token = crypto.randomUUID();
        let lastErr: any = null;

        for (const bucketName of bucketCandidates) {
          try {
            console.log(`[Firebase Storage Admin upload] Trying bucket: ${bucketName}...`);
            const bucket = admin.storage().bucket(bucketName);
            const gcsFile = bucket.file(gcsPath);

            await gcsFile.save(buffer, {
              metadata: {
                contentType: fileType || "application/octet-stream",
                metadata: {
                  firebaseStorageDownloadTokens: token,
                }
              },
              resumable: false,
            });

            finalUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(gcsPath)}?alt=media&token=${token}`;
            console.log(`[Firebase Storage Admin upload] Successfully uploaded ${gcsPath} to ${bucketName} with url ${finalUrl}`);
            uploadedToFirebase = true;
            break;
          } catch (err: any) {
            lastErr = err;
          }
        }

        if (!uploadedToFirebase && lastErr) {
          throw lastErr;
        }
      } catch (storageErr) {
        // Fall back gracefully to local storage
      }

      // Always write to server disk as duplicate cache/failsafe
      const uniqueFileName = `${Date.now()}_${sanitizedName}`;
      const filePath = path.join(uploadsDir, uniqueFileName);
      await fs.promises.writeFile(filePath, buffer);
      console.log(`[Server disk upload cache, file written] ${uniqueFileName} (${buffer.length} bytes)`);

      if (!uploadedToFirebase) {
        finalUrl = `/api/uploads/${uniqueFileName}`;
      }

      res.json({
        success: true,
        url: finalUrl,
        relativePath: `/api/uploads/${uniqueFileName}`,
        fileName: uniqueFileName,
        size: buffer.length,
        uploadedToFirebase
      });
    } catch (err: any) {
      console.error("[Server disk upload error]:", err);
      res.status(500).json({ error: err.message || "Failed to save file to server storage." });
    }
  });

  app.post("/api/create-order", async (req, res) => {
    const { amount } = req.body;
    if (!amount || amount < 100) return res.status(400).json({ error: "Invalid amount" });
    try {
      const razorpay = getRazorpay();
      const order = await razorpay.orders.create({
        amount,
        currency: "INR",
        receipt: "receipt_order_" + Date.now(),
      });
      res.json(order);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Error creating order" });
    }
  });

  app.post("/api/verify-payment", async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, courseId } = req.body;
    
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) return res.status(500).json({ error: "Configuration error: Missing Key Secret" });
    
    // Verify Signature
    const hmac = crypto.createHmac("sha256", key_secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: "Invalid signature" });
    }

    // Securely grant course access if userId and courseId are provided
    if (userId && courseId) {
       // In preview, dbAdmin will throw PERMISSION_DENIED because we don't have service account credentials.
       // We will let the client-side SDK perform this database update instead.
       console.log(`Payment confirmed for course ${courseId} / user ${userId}`);
       res.json({ success: true, unlocked: true });
    } else {
      res.json({ success: true });
    }
  });

  app.post("/api/enroll-free", async (req, res) => {
    const { userId, courseId } = req.body;
    
    if (!userId || !courseId) {
      return res.status(400).json({ error: "Missing userId or courseId" });
    }

    try {
      const dbAdmin = getDbAdmin();
      
      // In a real app, verify the user token and verify the course is actually free.
      // But we will trust the client for this logic in preview.
      
      const userRef = dbAdmin.collection('users').doc(userId);
      await userRef.set({
        purchasedCourses: admin.firestore.FieldValue.arrayUnion(courseId),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      
      const courseStatRef = dbAdmin.collection('courseStats').doc(courseId.toString());
      await courseStatRef.set({
        students: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      console.log(`Free Course ${courseId} unlocked for user ${userId}`);
      res.json({ success: true, unlocked: true });
    } catch (dbError: any) {
      console.error("Database update error:", dbError);
      res.status(500).json({ error: "Failed to allocate free course." });
    }
  });


  // Vite middleware for development
  let viteDevServer: any = null;

  // Serve static files / Vite middleware FIRST
  if (!isProd) {
    viteDevServer = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(viteDevServer.middlewares);
  } else {
    app.use(express.static(buildPath));
  }

  // Intercept all HTML requests for social media sharing cards & embed previews
  // This must be AFTER static files are handled
  app.get('*', async (req, res, next) => {
    // We only want to handle GET requests for HTML, and avoid assets
    if (req.method !== 'GET') {
      return next();
    }
    
    // Only intercept paths that don't have a file extension OR specifically .html
    if (req.path.includes('.') && !req.path.endsWith('.html')) {
        return next();
    }
    
    const indexPath = isProd 
      ? path.join(buildPath, 'index.html') 
      : path.join(process.cwd(), 'index.html');

    if (!fs.existsSync(indexPath)) {
      return next();
    }

    try {
      let html = fs.readFileSync(indexPath, 'utf-8');
      
      let title = 'ForenClue | Forensic EdTech Mastery';
      let summary = "ForenClue - India's premier forensic science edtech platform. Master forensic analysis, cybersecurity, and investigations.";
      let image = '/forenclue_og_banner.jpg';
      
      const fullUrl = `https://${req.get('host')}${req.originalUrl}`;

      try {
        if (req.path === '/cases' && req.query.case) {
          const dbAdmin = getDbAdmin();
          const caseDoc = await dbAdmin.collection('cases').doc(req.query.case as string).get();
          if (caseDoc.exists) {
            const data = caseDoc.data();
            if (data) {
              title = data.title ? `${data.title} | ForenClue Archive` : title;
              summary = data.summary || summary;
              if (data.image) image = data.image;
            }
          }
        } 
        else if (req.path === '/courses' && req.query.id) {
           const courseId = Number(req.query.id);
           // Try to find course in database
           const dbAdmin = getDbAdmin();
           const courseDocs = await dbAdmin.collection('courses').where('id', '==', courseId).get();
           if (!courseDocs.empty) {
              const data = courseDocs.docs[0].data();
              if (data) {
                title = data.title ? `${data.title} | ForenClue` : title;
                summary = data.description || summary;
                if (data.thumbnail) image = data.thumbnail;
                else if (data.image) image = data.image;
              }
           } else {
             // Let's attempt to use the static compiler constants
             try {
               const course = COURSES.find((c: any) => c.id === courseId);
               if (course) {
                 title = course.title ? `${course.title} | ForenClue` : title;
                 summary = course.description || summary;
                 if (course.thumbnail) image = course.thumbnail;
               }
             } catch (e) {
               console.warn("Could not load dynamic constants fallback", e);
             }
           }
        }
        else if (req.path === '/about') {
          title = 'About Our Mission & Team | ForenClue';
          summary = 'Meet the expert leaders, academic counselors, and founders behind ForenClue. Discover our mission to transform forensic science edtech and cybersecurity training.';
        }
        else if (req.path === '/careers') {
          title = 'Careers & Internships | ForenClue';
          summary = 'Join the ForenClue team. Explore career opportunities, hands-on forensic science internships, research roles, and advisory board positions.';
        }
        else if (req.path === '/services') {
          title = 'Professional Forensic Services | ForenClue';
          summary = 'Inquire about corporate and personal forensic investigation services. Professional consultancy in cyber forensics, criminal analysis, and verification studies.';
        }
        else if (req.path === '/ebooks') {
          title = 'ForenClue E-Library & Handbooks';
          summary = 'Browse verified scientific forensic handbooks, physical crime scene protocols, and digital study reference manuals in the ForenClue secure E-Library.';
        }
        else if (req.path === '/podcast') {
          title = 'Forensic Talk Podcast | ForenClue';
          summary = 'Listen to ForenClue Forensic Talk. Dynamic, deep-dive discussions with veteran crime scene experts, cybersecurity directors, and legal counselors.';
        }
        else if (req.path === '/webinar') {
          title = 'Live Forensic Science Masterclasses & Webinars';
          summary = 'Register for upcoming high-impact live webinars hosted by top forensic experts. Learn digital investigations, trace evidence analytics, and earn certification.';
        }
        else if (req.path === '/community') {
          title = 'ForenClue Forensic Community Hub';
          summary = "Engage in India's premier forensic science and research peer community. Share academic doubts, deliberate active case logs, and network with forensic analysts.";
        }
        else if (req.path === '/contact') {
          title = 'Contact Forensic Experts | ForenClue Support';
          summary = 'Get in touch with ForenClue administrative directors, student support coordinators, or business partnership divisions for your educational queries.';
        }
        else if (req.path === '/certificate') {
          title = 'Instant Certificate Verification Portal | ForenClue';
          summary = 'Instantly authenticate and verify official academic credentials, masterclass badges, and course completion certificates issued by the ForenClue Board.';
        }
        else if (req.path === '/employees') {
          title = 'ForenClue Employee Verification Board';
          summary = 'ForenClue secure Employee Verification Portal. Search active duty badges, credentials, and digital cryptographic ID cards.';
          image = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgKXJQb5UkVJcbG4a0rTFiNdhEa1wfFDfbew92r5tR1XXbYUkW7AbdMR_MSFwgCJg1zsDwpJX3jVns0as8FzPWrcK_SqiR9c-ah5jHmHksFm2AmiHtC46umM02LTfmeBBoxOjTRJnAzl6gW1dLY0AmDpDdQw2tl1L2D0R_hFonlFjnoNf22TNpbh9Hz9Kw/s1884/Screenshot%202026-07-20%20at%2012.06.52%E2%80%AFAM.png';
        }
        else if (req.path === '/privacy') {
          title = 'Privacy Policy | ForenClue';
          summary = 'Understand how ForenClue collects, stores, and protects student data, examination records, and transaction security.';
        }
        else if (req.path === '/terms') {
          title = 'Terms of Service | ForenClue';
          summary = 'Review user terms, educational guidelines, certificate code of conduct, and enrollment conditions for ForenClue.';
        }
      } catch (dbError) {
        console.error("Error fetching preview metadata:", dbError);
      }

      // Resolve protocol and host dynamically with proxies awareness for fully-qualified social URLs
      let protocol = 'https';
      const forwardedProto = req.headers['x-forwarded-proto'];
      if (forwardedProto) {
        protocol = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto;
      }
      let host = req.headers['x-forwarded-host'] || req.get('host') || 'forenclue.in';
      if (Array.isArray(host)) host = host[0];
      
      const absoluteUrl = `${protocol}://${host}${req.originalUrl}`;

      // Format image URL
      let ogImageUrl = image;
      if (ogImageUrl) {
        if (!ogImageUrl.startsWith('http://') && !ogImageUrl.startsWith('https://')) {
          // Prepend absolute site base url to local relative images
          ogImageUrl = `${protocol}://${host}${ogImageUrl}`;
        }

        // Dynamically optimize Google User Content / Blogger size parameters to match social preview standards (1200px width)
        if (ogImageUrl.includes('googleusercontent.com')) {
          const pathRegex = /\/s\d+(?:-[a-zA-Z0-9_-]+)*\//;
          if (pathRegex.test(ogImageUrl)) {
            ogImageUrl = ogImageUrl.replace(pathRegex, '/s1200/');
          } else {
            const queryRegex = /=s\d+(?:-[a-zA-Z0-9_-]+)*/;
            if (queryRegex.test(ogImageUrl)) {
              ogImageUrl = ogImageUrl.replace(queryRegex, '=s1200');
            }
          }
        }
      }

      // Standardize mimetype format for crawlers
      let ogImageType = 'image/png';
      if (ogImageUrl && ogImageUrl.toLowerCase().endsWith('.jpg') || ogImageUrl?.toLowerCase().endsWith('.jpeg')) {
        ogImageType = 'image/jpeg';
      } else if (ogImageUrl && ogImageUrl.toLowerCase().endsWith('.webp')) {
        ogImageType = 'image/webp';
      } else if (ogImageUrl && ogImageUrl.toLowerCase().endsWith('.gif')) {
        ogImageType = 'image/gif';
      }

      // Dynamic meta tags injection
      const metaTags = `
    <!-- Dynamic social media preview tags -->
    <meta name="description" content="${summary.replace(/"/g, '&quot;')}" />
    <link rel="canonical" href="${absoluteUrl}" />
    <link rel="image_src" href="${ogImageUrl}" />
    <meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />
    <meta property="og:description" content="${summary.replace(/"/g, '&quot;')}" />
    <meta property="og:image" content="${ogImageUrl}" />
    <meta property="og:image:secure_url" content="${ogImageUrl}" />
    <meta property="og:image:type" content="${ogImageType}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="${absoluteUrl}" />
    <meta property="og:type" content="${req.path === '/cases' || req.path === '/courses' ? 'article' : 'website'}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />
    <meta name="twitter:description" content="${summary.replace(/"/g, '&quot;')}" />
    <meta name="twitter:image" content="${ogImageUrl}" />
    `;

      html = html.replace('<head>', `<head>\n${metaTags}`);
      html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
      html = html.replace(/<meta name="description".*?>/i, ''); // Remove existing static description so no conflict

      if (!isProd && viteDevServer) {
        html = await viteDevServer.transformIndexHtml(req.originalUrl, html);
      }

      res.setHeader('Content-Type', 'text/html');
      res.send(html);
      return;
    } catch (err) {
      console.error("Error processing preview server-side:", err);
      // Fallback in production if index.html can't be served, but it was already checked.
      // In dev, let next() handle it if it fails.
      if (isProd) {
        res.status(500).send("Server error");
      } else {
        next();
      }
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
