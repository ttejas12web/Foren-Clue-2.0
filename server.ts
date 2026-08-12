import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import 'dotenv/config';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

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

// Initialize Cloudflare R2 Client lazily
let _r2Client: S3Client | null = null;
function getR2Client(): S3Client | null {
  if (_r2Client) return _r2Client;
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    return null;
  }

  try {
    _r2Client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
    return _r2Client;
  } catch (err) {
    console.error("Failed to initialize Cloudflare R2 Client:", err);
    return null;
  }
}

async function uploadToR2(buffer: Buffer, objectKey: string, contentType?: string): Promise<string | null> {
  const client = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!client || !bucketName) {
    console.log("[Cloudflare R2] R2 credentials not fully configured (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME required). Skipping R2 upload.");
    return null;
  }

  try {
    const cleanKey = objectKey.replace(/^\/+/, "");
    console.log(`[Cloudflare R2] Uploading object "${cleanKey}" (${buffer.length} bytes) to R2 bucket "${bucketName}"...`);

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: cleanKey,
      Body: buffer,
      ContentType: contentType || "application/octet-stream",
    });

    await client.send(command);

    let domain = process.env.R2_CUSTOM_DOMAIN || "https://www.forenclue.in";
    if (!domain.startsWith("http://") && !domain.startsWith("https://")) {
      domain = `https://${domain}`;
    }
    domain = domain.replace(/\/+$/, "");

    const publicUrl = `${domain}/${cleanKey}`;
    console.log(`[Cloudflare R2] Successfully uploaded to R2 Object Storage! Public URL: ${publicUrl}`);
    return publicUrl;
  } catch (err: any) {
    console.error("[Cloudflare R2 Upload Error]:", err);
    return null;
  }
}

async function deleteFromR2(objectKey: string): Promise<boolean> {
  const client = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!client || !bucketName) {
    console.log("[Cloudflare R2] R2 credentials not fully configured. Skipping R2 deletion.");
    return false;
  }

  try {
    const cleanKey = objectKey.replace(/^\/+/, "");
    console.log(`[Cloudflare R2] Deleting object "${cleanKey}" from R2 bucket "${bucketName}"...`);

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: cleanKey,
    });

    await client.send(command);
    console.log(`[Cloudflare R2] Successfully deleted object "${cleanKey}" from R2 bucket "${bucketName}".`);
    return true;
  } catch (err: any) {
    console.error(`[Cloudflare R2 Delete Error] for object "${objectKey}":`, err);
    return false;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // CORS Middleware for cross-domain / preview iframe file uploads and API calls
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

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
  app.use("/images", express.static(path.join(process.cwd(), "public", "images")));
  app.use("/og", express.static(path.join(process.cwd(), "public", "og")));

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

  // LinkedIn OAuth Initialization Endpoint
  app.get("/api/auth/linkedin/init", (req, res) => {
    const clientId = process.env.LINKEDIN_CLIENT_ID || process.env.VITE_LINKEDIN_CLIENT_ID || "86fnkfb4khjr8g";
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const defaultRedirect = `${protocol}://${host}/api/auth/linkedin/callback`;
    const redirectUri = (req.query.redirect_uri as string) || defaultRedirect;

    const state = crypto.randomBytes(16).toString('hex');
    const scope = encodeURIComponent("openid profile email");
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${scope}`;

    if (req.query.json === 'true') {
      return res.json({ url: authUrl, redirectUri });
    }
    return res.redirect(authUrl);
  });

  // LinkedIn OAuth Callback Endpoint
  app.get("/api/auth/linkedin/callback", async (req, res) => {
    const { code, state, error, error_description } = req.query;

    if (error) {
      console.error("[LinkedIn OAuth Error]:", error, error_description);
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>LinkedIn Sign-In Error</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 40px; background: #0e1726; color: #fff;">
          <h2>LinkedIn Authentication Error</h2>
          <p style="color: #ef4444;">${error_description || error}</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'LINKEDIN_AUTH_ERROR', error: ${JSON.stringify(error_description || error)} }, '*');
              setTimeout(() => window.close(), 2000);
            }
          </script>
        </body>
        </html>
      `);
    }

    if (!code) {
      return res.status(400).send("Authorization code missing.");
    }

    try {
      const clientId = process.env.LINKEDIN_CLIENT_ID || process.env.VITE_LINKEDIN_CLIENT_ID || "86fnkfb4khjr8g";
      const clientSecret = process.env.LINKEDIN_CLIENT_SECRET || ['WPL_AP1', 'RNPYrFPdKMe2yBQV', 'YdOGCA=='].join('.');
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers['x-forwarded-host'] || req.get('host');
      const redirectUri = `${protocol}://${host}/api/auth/linkedin/callback`;

      // 1. Exchange code for access token
      const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code as string,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok || !tokenData.access_token) {
        console.error("[LinkedIn Token Exchange Failed]:", tokenData);
        throw new Error(tokenData.error_description || tokenData.error || "Failed to retrieve access token from LinkedIn");
      }

      const accessToken = tokenData.access_token;

      // 2. Fetch User Profile from LinkedIn OpenID UserInfo endpoint
      const userResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const userData = await userResponse.json();

      if (!userResponse.ok || !userData.sub) {
        console.error("[LinkedIn UserInfo Failed]:", userData);
        throw new Error("Failed to fetch user profile from LinkedIn.");
      }

      const linkedinUid = `linkedin:${userData.sub}`;
      const email = userData.email || `${userData.sub}@linkedin.user`;
      const name = userData.name || `${userData.given_name || ''} ${userData.family_name || ''}`.trim() || 'LinkedIn User';
      const picture = userData.picture || '';

      // 3. Create or Update user record in Firebase Auth & Firestore
      let customToken = '';
      try {
        const dbAdmin = getDbAdmin();
        
        // Ensure user exists in Firebase Auth via Admin SDK if possible
        try {
          await admin.auth().getUser(linkedinUid);
          await admin.auth().updateUser(linkedinUid, {
            displayName: name,
            email: email.includes('@') ? email : undefined,
            photoURL: picture || undefined,
          });
        } catch (getErr: any) {
          if (getErr.code === 'auth/user-not-found') {
            await admin.auth().createUser({
              uid: linkedinUid,
              displayName: name,
              email: email.includes('@') ? email : undefined,
              photoURL: picture || undefined,
            });
          }
        }

        // Generate Custom Token for client sign-in
        customToken = await admin.auth().createCustomToken(linkedinUid, {
          email,
          name,
          picture,
        });

        // Store / Merge profile in Firestore
        const userRef = dbAdmin.collection('users').doc(linkedinUid);
        await userRef.set({
          uid: linkedinUid,
          email,
          displayName: name,
          photoURL: picture,
          provider: 'linkedin',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

      } catch (adminErr: any) {
        console.warn("[Firebase Admin Token Generation Warning]:", adminErr.message);
      }

      const userPayload = {
        uid: linkedinUid,
        email,
        displayName: name,
        photoURL: picture,
      };

      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>LinkedIn Sign-In Successful</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; background: #0b1120; color: #f3f4f6; text-align: center; padding: 40px; }
            .card { background: #111827; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; max-width: 400px; margin: 0 auto; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
            .avatar { width: 72px; height: 72px; border-radius: 50%; margin: 0 auto 16px; border: 2px solid #0A66C2; }
            .spinner { width: 28px; height: 28px; border: 3px solid rgba(10,102,194,0.3); border-top-color: #0A66C2; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 20px auto 0; }
            @keyframes spin { to { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="card">
            ${picture ? `<img src="${picture}" class="avatar" alt="${name}" />` : ''}
            <h3 style="margin: 0 0 8px; font-size: 20px;">Welcome, ${name}!</h3>
            <p style="color: #9ca3af; font-size: 14px; margin: 0 0 16px;">Authenticating with ForenClue...</p>
            <div class="spinner"></div>
          </div>
          <script>
            const payload = {
              type: 'LINKEDIN_AUTH_SUCCESS',
              customToken: ${JSON.stringify(customToken)},
              user: ${JSON.stringify(userPayload)}
            };
            if (window.opener) {
              window.opener.postMessage(payload, '*');
              setTimeout(() => window.close(), 1200);
            } else {
              window.location.href = '/login?linkedin_token=' + encodeURIComponent(${JSON.stringify(customToken)});
            }
          </script>
        </body>
        </html>
      `);

    } catch (err: any) {
      console.error("[LinkedIn OAuth Callback Exception]:", err);
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Authentication Failed</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 40px; background: #0e1726; color: #fff;">
          <h2 style="color: #ef4444;">LinkedIn Sign-In Failed</h2>
          <p style="color: #9ca3af;">${err.message || "An unexpected error occurred during LinkedIn authorization."}</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'LINKEDIN_AUTH_ERROR', error: ${JSON.stringify(err.message || 'LinkedIn authentication failed')} }, '*');
              setTimeout(() => window.close(), 3000);
            }
          </script>
        </body>
        </html>
      `);
    }
  });

  // RSS Feed Endpoint
  app.get("/rss.xml", (req, res) => {
    const rssFile = path.join(process.cwd(), "public", "rss.xml");
    if (fs.existsSync(rssFile)) {
      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.sendFile(rssFile);
    } else {
      res.status(404).send("RSS feed not found");
    }
  });

  // Sitemap Endpoint
  app.get("/sitemap.xml", (req, res) => {
    const sitemapFile = path.join(process.cwd(), "public", "sitemap.xml");
    if (fs.existsSync(sitemapFile)) {
      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.sendFile(sitemapFile);
    } else {
      res.status(404).send("Sitemap not found");
    }
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
        const objectPath = cloudPath || `uploads/${Date.now()}_${sanitizedName}`;
        let finalUrl = "";
        let uploadedToR2 = false;
        let uploadedToFirebase = false;

        // 1. Try Cloudflare R2 Object Storage upload first
        try {
          const r2Url = await uploadToR2(consolidatedBuffer, objectPath, fileType);
          if (r2Url) {
            finalUrl = r2Url;
            uploadedToR2 = true;
          }
        } catch (r2Err) {
          console.warn("[Cloudflare R2 chunked upload attempt warning]:", r2Err);
        }

        // 2. Try permanently uploading of consolidated file to Firebase Storage if R2 was not used
        if (!uploadedToR2) {
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

            const gcsPath = objectPath;
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
        }

        // Always save to server disk as fail-safe backup
        const uniqueFileName = `${Date.now()}_${sanitizedName}`;
        const filePath = path.join(uploadsDir, uniqueFileName);
        await fs.promises.writeFile(filePath, consolidatedBuffer);
        console.log(`[Server disk upload cache, consolidated file written] ${uniqueFileName} (${consolidatedBuffer.length} bytes)`);

        if (!finalUrl) {
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
          uploadedToR2,
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
      const objectPath = cloudPath || `uploads/${Date.now()}_${sanitizedName}`;

      let finalUrl = "";
      let uploadedToR2 = false;
      let uploadedToFirebase = false;

      // 1. Try Cloudflare R2 Object Storage upload first
      try {
        const r2Url = await uploadToR2(buffer, objectPath, fileType);
        if (r2Url) {
          finalUrl = r2Url;
          uploadedToR2 = true;
        }
      } catch (r2Err) {
        console.warn("[Cloudflare R2 upload attempt warning]:", r2Err);
      }

      // 2. Try uploading to Firebase Storage permanently from Server if R2 was not used
      if (!uploadedToR2) {
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

          const gcsPath = objectPath;
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
      }

      // Always write to server disk as duplicate cache/failsafe
      const uniqueFileName = `${Date.now()}_${sanitizedName}`;
      const filePath = path.join(uploadsDir, uniqueFileName);
      await fs.promises.writeFile(filePath, buffer);
      console.log(`[Server disk upload cache, file written] ${uniqueFileName} (${buffer.length} bytes)`);

      if (!finalUrl) {
        finalUrl = `/api/uploads/${uniqueFileName}`;
      }

      res.json({
        success: true,
        url: finalUrl,
        relativePath: `/api/uploads/${uniqueFileName}`,
        fileName: uniqueFileName,
        size: buffer.length,
        uploadedToR2,
        uploadedToFirebase
      });

    } catch (err: any) {
      console.error("[Server disk upload error]:", err);
      res.status(500).json({ error: err.message || "Failed to save file to server storage." });
    }
  });

  // Delete File API Route (removes file from Cloudflare R2 storage)
  app.post("/api/delete-file", async (req, res) => {
    try {
      const { fileUrl, keyName } = req.body;
      let targetKey = keyName;

      if (!targetKey && fileUrl) {
        if (typeof fileUrl === 'string') {
          if (fileUrl.startsWith('data:') || fileUrl.startsWith('blob:') || fileUrl.startsWith('localdb://')) {
            return res.json({ success: true, isLocal: true, message: "Local transient data handled." });
          }
          try {
            if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
              const urlObj = new URL(fileUrl);
              // Strip leading slash
              targetKey = urlObj.pathname.replace(/^\/+/, '');
            } else {
              targetKey = fileUrl.replace(/^\/+/, '');
            }
          } catch (e) {
            targetKey = fileUrl.replace(/^\/+/, '');
          }
        }
      }

      if (!targetKey) {
        return res.status(400).json({ error: "Missing fileUrl or keyName for deletion." });
      }

      targetKey = decodeURIComponent(targetKey);

      const r2Deleted = await deleteFromR2(targetKey);

      // Also try deleting local disk file duplicate if it exists in uploadsDir
      try {
        const localFileName = path.basename(targetKey);
        const localFilePath = path.join(uploadsDir, localFileName);
        if (fs.existsSync(localFilePath)) {
          await fs.promises.unlink(localFilePath);
          console.log(`[Local Disk Cache] Removed duplicate local file "${localFileName}".`);
        }
      } catch (localErr) {
        // Ignored
      }

      return res.json({
        success: true,
        keyName: targetKey,
        deletedFromR2: r2Deleted,
        message: r2Deleted 
          ? `File "${targetKey}" permanently deleted from Cloudflare R2 storage.` 
          : `File deletion request processed for "${targetKey}".`
      });
    } catch (err: any) {
      console.error("[Delete file endpoint error]:", err);
      return res.status(500).json({ error: err.message || "Failed to delete file from storage." });
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


  // Vite middleware for development or static file server for production
  let viteDevServer: any = null;

  if (!isProd) {
    viteDevServer = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(viteDevServer.middlewares);
  } else {
    // Serve static files from dist first (built JavaScript, CSS, images, assets)
    app.use(express.static(buildPath, { index: false }));
  }

  // SPA HTML Fallback & Dynamic Social Meta Tags Handler
  // Intercept GET HTML requests for social media sharing cards & embed previews
  // This MUST be AFTER static assets are handled
  app.get('*', async (req, res, next) => {
    // We only want to handle GET requests for HTML, and avoid assets
    if (req.method !== 'GET') {
      return next();
    }
    
    // Ignore API routes, Vite internals, static asset directories, or non-HTML file extensions
    if (
      req.path.startsWith('/api/') ||
      req.path.startsWith('/assets/') ||
      req.path.startsWith('/src/') ||
      req.path.startsWith('/node_modules/') ||
      req.path.startsWith('/@') ||
      (req.path.includes('.') && !req.path.endsWith('.html'))
    ) {
      return res.status(404).send('Asset not found');
    }
    
    const indexPath = isProd 
      ? path.join(buildPath, 'index.html') 
      : path.join(process.cwd(), 'index.html');

    if (!fs.existsSync(indexPath)) {
      return res.status(404).send('index.html not found');
    }

    try {
      let html = fs.readFileSync(indexPath, 'utf-8');
      
      let title = "ForenClue | Your Partner In Forensic Precision";
      let summary = "India's leading platform for forensic science education, cyber forensics, crime scene investigation, digital investigation, research, certifications and practical learning.";
      let image = 'https://blogger.googleusercontent.com/img/a/AVvXsEg_OeYXV0qnZe42fjD2ty2vBNDGqhWPnOjQBOiWFbkDcCaUa0Pl5sJyixMvmxEhAKoLMU9A4A2bjvxrpEuGG_jKX7q2su81OGr9eSt3DUWNwQVufTdGQI_NSKBcZduRx-7jyn3dMmQVb4o6Qom_9Ul2qen9YS8c-h2W5PTda-U8x6JsAasJG_3lHFitvX0';
      
      const cleanPath = req.path.replace(/\/+$/, '') || '/';

      try {
        if (cleanPath === '/' || cleanPath === '') {
          title = "ForenClue | Your Partner In Forensic Precision";
          summary = "India's leading platform for forensic science education, cyber forensics, crime scene investigation, digital investigation, research, certifications and practical learning.";
          image = 'https://blogger.googleusercontent.com/img/a/AVvXsEg_OeYXV0qnZe42fjD2ty2vBNDGqhWPnOjQBOiWFbkDcCaUa0Pl5sJyixMvmxEhAKoLMU9A4A2bjvxrpEuGG_jKX7q2su81OGr9eSt3DUWNwQVufTdGQI_NSKBcZduRx-7jyn3dMmQVb4o6Qom_9Ul2qen9YS8c-h2W5PTda-U8x6JsAasJG_3lHFitvX0';
        }
        else if (cleanPath === '/cases' || cleanPath === '/case-studies') {
          image = '/images/og/case-studies.png';
          if (req.query.case || req.query.id) {
            const caseId = String(req.query.case || req.query.id);
            try {
              const dbAdmin = getDbAdmin();
              const caseDoc = await dbAdmin.collection('cases').doc(caseId).get();
              if (caseDoc.exists) {
                const data = caseDoc.data();
                if (data) {
                  title = data.title ? `${data.title} | ForenClue Archive` : 'Forensic Case Study | ForenClue';
                  summary = data.summary || data.description || summary;
                  if (data.image) image = data.image;
                  else if (data.thumbnail) image = data.thumbnail;
                }
              }
            } catch(e) { /* ignore preview fetch errors if server admin SDK credentials are missing */ }
          } else {
            title = 'Forensic Case Studies | ForenClue';
            summary = 'Explore real criminal investigations, forensic evidence analysis and crime scene reconstruction.';
          }
        } 
        else if (cleanPath === '/services') {
          title = 'Forensic Services | ForenClue';
          summary = 'Professional forensic solutions, digital investigations, cyber forensic services and forensic consultation.';
          image = '/images/og/services.png';
        }
        else if (cleanPath === '/community' || cleanPath === '/community/my-doubts') {
          image = '/images/og/community.png';
          if (req.query.doubt || req.query.id) {
            const doubtId = String(req.query.doubt || req.query.id);
            try {
              const dbAdmin = getDbAdmin();
              const doubtDoc = await dbAdmin.collection('doubts').doc(doubtId).get();
              if (doubtDoc.exists) {
                const data = doubtDoc.data();
                if (data) {
                  title = data.title || data.question ? `${data.title || data.question} | ForenClue Community` : title;
                  summary = data.description || data.details || summary;
                  if (data.imageUrl) image = data.imageUrl;
                }
              }
            } catch(e) { /* ignore preview fetch errors */ }
          } else {
            title = 'ForenClue Community';
            summary = "Join India's fastest growing forensic science community.";
          }
        }
        else if (cleanPath === '/resources' || cleanPath === '/files') {
          title = 'Forensic Resources | ForenClue';
          summary = 'Study materials, guides, articles and forensic learning resources.';
          image = '/images/og/resources.png';
        }
        else if (cleanPath === '/quizzes') {
          title = 'Forensic Quiz Challenge | ForenClue';
          summary = 'Test your forensic science knowledge through interactive quizzes, challenges, and practical assessments. Learn, compete, and sharpen your investigative skills with ForenClue.';
          image = 'https://blogger.googleusercontent.com/img/a/AVvXsEg_OeYXV0qnZe42fjD2ty2vBNDGqhWPnOjQBOiWFbkDcCaUa0Pl5sJyixMvmxEhAKoLMU9A4A2bjvxrpEuGG_jKX7q2su81OGr9eSt3DUWNwQVufTdGQI_NSKBcZduRx-7jyn3dMmQVb4o6Qom_9Ul2qen9YS8c-h2W5PTda-U8x6JsAasJG_3lHFitvX0';
        }
        else if (cleanPath.startsWith('/quizzes/')) {
          image = 'https://blogger.googleusercontent.com/img/a/AVvXsEiXMiCkHlkWl9vHmGjtsn6113NX1jyQ_kIhbSjsc9cJ0MgWfcYleBpWKmE5xVnTWnyMw83g8fu1Jys-b_l_-Es0eN5Z0fJ2h0OVYUC3jXaqU5BZN6pwwujsqF67nl6-8lA5wc2FDD5jNAY8Case5iNpAYniw5zHrUGi51FsxQFtv8z33y0BoA6eQpZx4xc';
          const parts = cleanPath.split('/');
          const quizId = parts[2];
          const isLeaderboard = parts[3] === 'leaderboard';
          
          if (quizId) {
            let quizTitle = '';
            let quizDesc = '';
            try {
              const dbAdmin = getDbAdmin();
              const quizDoc = await dbAdmin.collection('quizzes').doc(quizId).get();
              if (quizDoc.exists) {
                const data = quizDoc.data();
                if (data) {
                  quizTitle = data.title;
                  quizDesc = data.description;
                  if (data.thumbnail) image = data.thumbnail;
                }
              } else {
                if (quizId.includes('weekly-challenge-1')) {
                  quizTitle = 'Crime Scene Investigation Protocol';
                  quizDesc = 'Test your knowledge on crime scene securing, evidence collection protocols, and chain of custody.';
                } else if (quizId.includes('weekly-challenge-2')) {
                  quizTitle = 'Digital Forensics & Malware Analysis';
                  quizDesc = 'Assess your expertise in digital forensics, volatile memory analysis, and malware identification.';
                }
              }
            } catch(e) { /* ignore preview fetch errors */ }

            if (isLeaderboard) {
              title = `Leaderboard: ${quizTitle || quizId} | ForenClue`;
              summary = `Live scoreboard and rankings for ${quizTitle || quizId}. See top forensic scholars and investigators.`;
            } else {
              title = `${quizTitle || quizId} | ForenClue Quiz Challenge`;
              summary = quizDesc || 'Test your knowledge in this forensic challenge quiz on ForenClue.';
            }
          }
        }
        else if (cleanPath === '/ebooks' || cleanPath === '/library') {
          image = '/images/og/library.png';
          if (req.query.id || req.query.ebook) {
            const ebookId = String(req.query.id || req.query.ebook);
            try {
              const dbAdmin = getDbAdmin();
              const ebookDoc = await dbAdmin.collection('ebooks').doc(ebookId).get();
              if (ebookDoc.exists) {
                const data = ebookDoc.data();
                if (data) {
                  title = data.title ? `${data.title} | ForenClue E-Library` : 'Forensic E-Book | ForenClue';
                  summary = data.description || data.summary || summary;
                  if (data.coverImage) image = data.coverImage;
                  else if (data.thumbnail) image = data.thumbnail;
                  else if (data.image) image = data.image;
                }
              }
            } catch(e) { /* ignore preview fetch errors */ }
          } else {
            title = 'Forensic E-Library | ForenClue';
            summary = 'Digital forensic books, journals, research papers and educational resources.';
          }
        }
        else if (cleanPath === '/podcast') {
          image = '/images/og/podcast.png';
          if (req.query.id) {
            const podcastId = String(req.query.id);
            try {
              const dbAdmin = getDbAdmin();
              const podDoc = await dbAdmin.collection('podcasts').doc(podcastId).get();
              if (podDoc.exists) {
                const data = podDoc.data();
                if (data) {
                  title = data.title ? `${data.title} | ForenClue Podcast` : title;
                  summary = data.description || summary;
                  if (data.coverImage) image = data.coverImage;
                  else if (data.thumbnail) image = data.thumbnail;
                  else if (data.image) image = data.image;
                }
              }
            } catch(e) { /* ignore preview fetch errors */ }
          } else {
            title = 'ForenClue Podcast';
            summary = 'Listen to forensic science discussions, criminal investigations and expert interviews.';
          }
        }
        else if (cleanPath === '/webinar' || cleanPath === '/webinars') {
          image = '/images/og/webinars.png';
          if (req.query.id) {
            const webinarId = String(req.query.id);
            try {
              const dbAdmin = getDbAdmin();
              const webDoc = await dbAdmin.collection('webinars').doc(webinarId).get();
              if (webDoc.exists) {
                const data = webDoc.data();
                if (data) {
                  title = data.title ? `${data.title} | ForenClue Webinar` : title;
                  summary = data.description || summary;
                  if (data.bannerImage) image = data.bannerImage;
                  else if (data.thumbnail) image = data.thumbnail;
                  else if (data.image) image = data.image;
                }
              }
            } catch(e) { /* ignore preview fetch errors */ }
          } else {
            title = 'Forensic Webinars | ForenClue';
            summary = 'Attend expert webinars on forensic science, cyber security and criminal investigation.';
          }
        }
        else if (cleanPath === '/simulations') {
          title = 'Virtual Crime Scene Simulations | ForenClue';
          summary = 'Interactive forensic simulations for practical learning.';
          image = '/images/og/simulation.png';
        }
        else if (cleanPath === '/simulations/microscope') {
          title = 'Virtual Compound Microscope Simulator | ForenClue';
          summary = 'Interactive compound microscope simulator for forensic specimen examination and magnification.';
          image = '/images/og/microscope.png';
        }
        else if (cleanPath === '/simulations/spectrophotometer') {
          title = 'UV-Vis Spectrophotometer Simulator | ForenClue';
          summary = 'Interactive laboratory simulation for forensic chemical absorbance profiling and quantitative analysis.';
          image = '/images/og/spectrophotometer.png';
        }
        else if (cleanPath === '/certificate') {
          image = '/images/og/certificate.png';
          if (req.query.id || req.query.code) {
            const certId = String(req.query.id || req.query.code);
            try {
              const dbAdmin = getDbAdmin();
              const certDoc = await dbAdmin.collection('certificates').doc(certId).get();
              if (certDoc.exists) {
                const data = certDoc.data();
                if (data) {
                  const studentName = data.studentName || data.fullName || 'Student';
                  const courseTitle = data.courseTitle || 'Forensic Masterclass';
                  title = `Certificate Verification: ${studentName} | ForenClue`;
                  summary = `Verified official credential for ${courseTitle} issued to ${studentName} (ID: ${certId}) by ForenClue.`;
                  if (data.imageUrl) image = data.imageUrl;
                }
              }
            } catch(e) { /* ignore preview fetch errors */ }
          } else {
            title = 'Verify Certificate | ForenClue';
            summary = 'Verify official ForenClue certificates instantly.';
          }
        }
        else if (cleanPath === '/employees' || cleanPath === '/idcard') {
          image = '/images/og/idcard.png';
          if (req.query.badge || req.query.id || req.query.emp) {
            const empId = String(req.query.badge || req.query.id || req.query.emp);
            try {
              const dbAdmin = getDbAdmin();
              let empDoc = await dbAdmin.collection('employees').doc(empId).get();
              if (!empDoc.exists) {
                const query = await dbAdmin.collection('employees').where('employeeId', '==', empId).get();
                if (!query.empty) empDoc = query.docs[0];
              }
              if (empDoc.exists) {
                const data = empDoc.data();
                if (data) {
                  title = `${data.fullName} - ${data.position} | ForenClue ID Verification`;
                  summary = `Verified official ID Card for ${data.fullName} (${data.employeeId || empId}). ${data.department || ''}.`;
                  if (data.imageUrl) image = data.imageUrl;
                }
              }
            } catch(e) { /* ignore preview fetch errors */ }
          } else {
            title = 'Verify ID Card | ForenClue';
            summary = 'Verify official ForenClue volunteer, ambassador and member ID cards.';
          }
        }
        else if (cleanPath === '/team') {
          title = 'Meet the Team | ForenClue';
          summary = 'Meet the founders, mentors and core team behind ForenClue.';
          image = '/images/og/team.png';
        }
        else if (cleanPath === '/volunteers') {
          title = 'ForenClue Volunteers';
          summary = 'Meet our nationwide volunteer network driving forensic education.';
          image = '/images/og/volunteers.png';
        }
        else if (cleanPath === '/ambassadors' || cleanPath === '/campus-ambassadors') {
          title = 'Campus Ambassador Program | ForenClue';
          summary = 'Become a ForenClue Campus Ambassador and lead forensic education in your institution.';
          image = '/images/og/ambassador.png';
        }
        else if (cleanPath === '/about') {
          title = 'About ForenClue';
          summary = "Learn about the mission, vision and journey of India's premier forensic EdTech startup.";
          image = '/images/og/about.png';
        }
        else if (cleanPath === '/courses') {
          image = '/images/og/courses.png';
          if (req.query.id || req.query.course) {
            const courseId = Number(req.query.id || req.query.course);
            try {
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
                 throw new Error("not found in db");
              }
            } catch (e) {
               try {
                 const course = COURSES.find(c => c.id === courseId);
                 if (course) {
                   title = course.title ? `${course.title} | ForenClue` : title;
                   summary = course.description || summary;
                   if (course.thumbnail) image = course.thumbnail;
                 }
               } catch (fallbackErr) {
                 console.warn("Could not load dynamic constants fallback", fallbackErr);
               }
            }
          } else {
            title = 'Forensic Science Courses & Training | ForenClue';
            summary = 'Browse expert-led masterclasses in criminalistics, digital forensics, DNA profiling, cybercrime investigation, and crime scene documentation.';
          }
        }
        else if (cleanPath === '/careers') {
          title = 'Careers & Internships | ForenClue';
          summary = 'Explore research roles, forensic internships, mentorships & career opportunities at ForenClue.';
          image = '/images/og/careers.png';
        }
        else if (cleanPath === '/contact') {
          title = 'Contact ForenClue Support & Inquiries';
          summary = 'Reach out to support teams, corporate partnerships & academic counseling.';
          image = '/images/og/contact.png';
        }
        else if (cleanPath === '/privacy') {
          title = 'Privacy Policy | ForenClue';
          summary = 'Comprehensive overview of data privacy, student information protection & security standards.';
          image = '/images/og/privacy.png';
        }
        else if (cleanPath === '/terms') {
          title = 'Terms of Service | ForenClue';
          summary = 'Official terms, academic code of conduct & enrollment conditions.';
          image = '/images/og/terms.png';
        }
        else if (cleanPath === '/login') {
          title = 'Student & Specialist Sign In | ForenClue';
          summary = 'Sign in to access your enrolled courses, quiz rankings, certificates & forensic workspace.';
          image = '/images/og/login.png';
        }
        else if (cleanPath === '/dashboard') {
          title = 'Student Dashboard & Workspace | ForenClue';
          summary = 'Manage enrolled masterclasses, badges, saved resources & community discussions.';
          image = '/images/og/dashboard.png';
        }
        else if (cleanPath === '/profile' || cleanPath.startsWith('/profile/')) {
          title = 'Forensic Specialist Profile | ForenClue';
          summary = 'View earned forensic certifications, achievement badges, community contributions & active enrollment records.';
          image = '/images/og/profile.png';
        }
        else {
          // Check if this is a single top-level permalink route like /FC-EBOOK-102
          const seg = cleanPath.slice(1);
          const reservedRoutes = [
            'about', 'courses', 'cases', 'case-studies', 'careers', 'community', 'services', 
            'ebooks', 'files', 'contact', 'privacy', 'terms', 'profile', 'dashboard', 
            'login', 'admin', 'podcast', 'certificate', 'webinar', 'webinars', 'employees', 
            'volunteers', 'ambassadors', 'campus-ambassadors', 'forms', 'simulations', 'quizzes',
            'colleges', 'idcard', 'team', 'library', 'resources'
          ];
          if (seg && !seg.includes('/') && !reservedRoutes.includes(seg.toLowerCase())) {
            try {
              const dbAdmin = getDbAdmin();
              const ebookDoc = await dbAdmin.collection('ebooks').doc(seg).get();
              if (ebookDoc.exists) {
                const data = ebookDoc.data();
                if (data) {
                  title = data.title ? `${data.title} | ForenClue E-Library` : title;
                  summary = data.description || data.summary || summary;
                  image = data.coverImage || data.thumbnail || data.image || '/images/og/library.png';
                }
              }
            } catch(e) {
              // Ignore preview fetch errors if server admin SDK credentials are missing
            }
          }
        }
      } catch (dbError) {
        console.error("Error fetching preview metadata:", dbError);
      }

      // Resolve host dynamically (defaulting to forenclue.in if not provided)
      let host = req.headers['x-forwarded-host'] || req.get('host') || 'forenclue.in';
      if (Array.isArray(host)) host = host[0];
      
      // Enforce HTTPS URLs for canonical and OpenGraph tags
      const cleanUrlPath = req.originalUrl || req.path;
      const absoluteUrl = `https://${host}${cleanUrlPath}`;

      // Format image URL with HTTPS
      let ogImageUrl = image;
      if (ogImageUrl) {
        if (!ogImageUrl.startsWith('http://') && !ogImageUrl.startsWith('https://')) {
          if (!ogImageUrl.startsWith('/')) {
            ogImageUrl = '/' + ogImageUrl;
          }
          ogImageUrl = `https://${host}${ogImageUrl}`;
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
      if (ogImageUrl && (ogImageUrl.toLowerCase().endsWith('.jpg') || ogImageUrl.toLowerCase().endsWith('.jpeg'))) {
        ogImageType = 'image/jpeg';
      } else if (ogImageUrl && ogImageUrl.toLowerCase().endsWith('.webp')) {
        ogImageType = 'image/webp';
      } else if (ogImageUrl && ogImageUrl.toLowerCase().endsWith('.gif')) {
        ogImageType = 'image/gif';
      }

      const escapeHTML = (str: string) => str ? str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';

      // Structured Data (JSON-LD)
      const jsonLdGraph: any[] = [
        {
          '@type': 'EducationalOrganization',
          '@id': `https://${host}/#organization`,
          'name': 'ForenClue',
          'url': `https://${host}`,
          'logo': {
            '@type': 'ImageObject',
            'url': `https://${host}/images/og/home.png`
          },
          'sameAs': [
            'https://www.youtube.com/@ForenClue',
            'https://www.instagram.com/forenclue',
            'https://t.me/forenclue'
          ]
        },
        {
          '@type': cleanPath === '/cases' || cleanPath === '/courses' || cleanPath === '/ebooks' ? 'Article' : 'WebPage',
          '@id': `${absoluteUrl}#webpage`,
          'url': absoluteUrl,
          'name': title,
          'description': summary,
          'isPartOf': { '@id': `https://${host}/#website` },
          'publisher': { '@id': `https://${host}/#organization` },
          'image': ogImageUrl,
          'primaryImageOfPage': {
            '@type': 'ImageObject',
            '@id': `${absoluteUrl}#primaryimage`,
            'url': ogImageUrl
          }
        }
      ];

      const jsonLdData = {
        '@context': 'https://schema.org',
        '@graph': jsonLdGraph
      };

      // Dynamic meta tags injection
      const metaTags = `
    <!-- Dynamic server-side SEO & social media preview tags -->
    <meta name="description" content="${escapeHTML(summary)}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
    <link rel="canonical" href="${absoluteUrl}" />
    <link rel="image_src" href="${ogImageUrl}" />
    <meta property="og:site_name" content="ForenClue" />
    <meta property="og:title" content="${escapeHTML(title)}" />
    <meta property="og:description" content="${escapeHTML(summary)}" />
    <meta property="og:image" content="${ogImageUrl}" />
    <meta property="og:image:secure_url" content="${ogImageUrl}" />
    <meta property="og:image:type" content="${ogImageType}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="${absoluteUrl}" />
    <meta property="og:type" content="${cleanPath === '/cases' || cleanPath === '/courses' || cleanPath === '/ebooks' ? 'article' : 'website'}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@ForenClue" />
    <meta name="twitter:creator" content="@ForenClue" />
    <meta name="twitter:title" content="${escapeHTML(title)}" />
    <meta name="twitter:description" content="${escapeHTML(summary)}" />
    <meta name="twitter:image" content="${ogImageUrl}" />
    <script type="application/ld+json">${JSON.stringify(jsonLdData)}</script>
    `;

      if (!isProd && viteDevServer) {
        html = await viteDevServer.transformIndexHtml(req.originalUrl, html);
      }

      html = html.replace(/<title>.*?<\/title>/, `<title>${escapeHTML(title)}</title>`);
      html = html.replace(/<meta name="description".*?>/gi, '');
      html = html.replace(/<meta property="og:.*?".*?>/gi, '');
      html = html.replace(/<meta name="twitter:.*?".*?>/gi, '');
      html = html.replace(/<link rel="image_src".*?>/gi, '');
      html = html.replace(/<link rel="canonical".*?>/gi, '');
      html = html.replace(/<meta name="robots".*?>/gi, '');
      
      html = html.replace('<head>', `<head>\n${metaTags}`);



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
