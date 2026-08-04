import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { 
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, 
  query, where, orderBy, limit, setDoc 
} from 'firebase/firestore';
import { College } from '@/types/college';

const COLLEGES_COLLECTION = 'colleges';

export const SAMPLE_COLLEGES: College[] = [
  {
    id: 'nfsu-gandhinagar',
    name: 'National Forensic Sciences University (NFSU)',
    shortName: 'NFSU Gandhinagar',
    country: 'India',
    state: 'Gujarat',
    city: 'Gandhinagar',
    type: 'Institute of National Importance',
    website: 'https://nfsu.ac.in',
    logo: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=300',
    bannerImage: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&q=80&w=1200',
    description: 'The world\'s first and only university dedicated strictly to Forensic and Cyber Security Sciences, established under the Ministry of Home Affairs, Govt. of India.',
    coursesOffered: [
      {
        name: 'B.Sc. - M.Sc. Forensic Science (5-Year Integrated)',
        degreeLevel: 'Master',
        duration: '5 Years',
        eligibility: '10+2 with Physics, Chemistry, Biology/Mathematics (Min 60%)',
        estimatedFees: '₹65,000 / semester',
        mode: 'Full-time',
        specializations: ['Fingerprint Science', 'Forensic Chemistry', 'DNA Profiling', 'Ballistics']
      },
      {
        name: 'M.Sc. Forensic Science',
        degreeLevel: 'Master',
        duration: '2 Years',
        eligibility: 'B.Sc. in Forensic Science / Physical Sciences / Chemistry / Biology (Min 55%)',
        estimatedFees: '₹70,000 / semester',
        mode: 'Full-time',
        specializations: ['Forensic Toxicology', 'Document & Questioned Examination', 'Cyber Forensics']
      },
      {
        name: 'M.Tech. Cyber Security & Digital Forensics',
        degreeLevel: 'Master',
        duration: '2 Years',
        eligibility: 'B.E./B.Tech. in CSE/IT/ECE or M.Sc. Computer Science',
        estimatedFees: '₹75,000 / semester',
        mode: 'Full-time',
        specializations: ['Malware Analysis', 'Network Incident Response', 'Cloud Forensics']
      },
      {
        name: 'Ph.D. in Forensic Science / Cyber Security',
        degreeLevel: 'Doctorate',
        duration: '3-5 Years',
        eligibility: 'Master Degree in relevant discipline with GATE/NET/NFAT score',
        estimatedFees: '₹40,000 / semester',
        mode: 'Full-time'
      }
    ],
    feesRange: '₹60,000 - ₹80,000 / semester',
    admissionProcess: 'National Forensic Admission Test (NFAT) conducted annually by NFSU followed by counseling.',
    accreditation: 'NAAC A+ | UGC Recognized | Ministry of Home Affairs',
    contactEmail: 'admissions@nfsu.ac.in',
    contactPhone: '+91 79 23977100',
    address: 'Sector 9, Near Raysan Petrol Pump, Gandhinagar, Gujarat 382007',
    ranking: '#1 Dedicated Forensic University Worldwide',
    facilities: ['Advanced Ballistics Range', '3D Crime Scene Simulator', 'DNA Fingerprinting Center', 'High-Spec Cyber Lab', 'Central Library', 'On-Campus Hostels'],
    featured: true
  },
  {
    id: 'nfsu-delhi',
    name: 'National Forensic Sciences University - Delhi Campus',
    shortName: 'NFSU Delhi',
    country: 'India',
    state: 'Delhi',
    city: 'New Delhi',
    type: 'Institute of National Importance',
    website: 'https://delhi.nfsu.ac.in',
    logo: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&q=80&w=300',
    bannerImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1200',
    description: 'Premier Delhi regional campus of NFSU located at LNJN NICFS Rohini, specializing in crime scene investigation and questioned document analysis.',
    coursesOffered: [
      {
        name: 'M.Sc. Forensic Science',
        degreeLevel: 'Master',
        duration: '2 Years',
        eligibility: 'B.Sc. in Forensic Science or relevant Science major',
        estimatedFees: '₹68,000 / semester',
        mode: 'Full-time'
      },
      {
        name: 'M.Sc. Criminology & Crime Scene Management',
        degreeLevel: 'Master',
        duration: '2 Years',
        eligibility: 'Bachelor Degree in Science / Law / Social Work',
        estimatedFees: '₹55,000 / semester',
        mode: 'Full-time'
      },
      {
        name: 'PG Diploma in Fingerprint Science',
        degreeLevel: 'Diploma',
        duration: '1 Year',
        eligibility: 'B.Sc. in Science / Forensic Science',
        estimatedFees: '₹40,000 / year',
        mode: 'Full-time'
      }
    ],
    feesRange: '₹40,000 - ₹70,000 / semester',
    admissionProcess: 'NFAT Entrance Examination & Merit Score',
    accreditation: 'Institute of National Importance | Ministry of Home Affairs',
    contactEmail: 'director_dc@nfsu.ac.in',
    contactPhone: '+91 11 27555890',
    address: 'LNJN NICFS, Institutional Area, Outer Ring Road, Sector 3, Rohini, Delhi 110085',
    ranking: 'Top Central Govt. Institute for Criminology & Forensics',
    facilities: ['Questioned Document Lab', 'Ballistic Comparison Microscope Lab', 'Moot Court', 'Forensic Medicine Reference Library'],
    featured: true
  },
  {
    id: 'amity-aifs',
    name: 'Amity Institute of Forensic Sciences (AIFS)',
    shortName: 'Amity AIFS Noida',
    country: 'India',
    state: 'Uttar Pradesh',
    city: 'Noida',
    type: 'Private',
    website: 'https://amity.edu/aifs',
    logo: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=300',
    bannerImage: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1200',
    description: 'Leading private institute in North India offering comprehensive hands-on training in forensic biology, questioned documents, and digital intelligence.',
    coursesOffered: [
      {
        name: 'B.Sc. (Honours) Forensic Science',
        degreeLevel: 'Bachelor',
        duration: '3 Years',
        eligibility: '10+2 with PCB/PCM (Min 55%)',
        estimatedFees: '₹1,20,000 / year',
        mode: 'Full-time'
      },
      {
        name: 'M.Sc. Forensic Science',
        degreeLevel: 'Master',
        duration: '2 Years',
        eligibility: 'B.Sc. Forensic Science / Chemistry / Zoology / Physics (Min 50%)',
        estimatedFees: '₹1,40,000 / year',
        mode: 'Full-time'
      }
    ],
    feesRange: '₹1,20,000 - ₹1,50,000 / year',
    admissionProcess: 'Amity University Direct Test / Interview & 10+2 Academic Merit.',
    accreditation: 'NAAC A+ Grade | UGC Approved',
    contactEmail: 'aifs@amity.edu',
    contactPhone: '+91 120 4392000',
    address: 'Sector 125, Noida, Uttar Pradesh 201313',
    ranking: 'Top Private Forensic College in North India',
    facilities: ['Automated Fingerprint Scanner Lab', 'Mock Crime Scene House', 'Toxicology HPLC & GC-MS Suite'],
    featured: true
  },
  {
    id: 'ifs-mumbai',
    name: 'Institute of Forensic Science, Mumbai',
    shortName: 'IFS Mumbai',
    country: 'India',
    state: 'Maharashtra',
    city: 'Mumbai',
    type: 'Government',
    website: 'https://ifsc.ac.in',
    logo: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=300',
    bannerImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=1200',
    description: 'Government of Maharashtra flagship institute established under the Higher & Technical Education Dept to train forensic scientists.',
    coursesOffered: [
      {
        name: 'B.Sc. Forensic Science',
        degreeLevel: 'Bachelor',
        duration: '3 Years',
        eligibility: '10+2 Science stream (Higher Secondary Board Merit)',
        estimatedFees: '₹12,000 / year',
        mode: 'Full-time'
      },
      {
        name: 'M.Sc. Forensic Science',
        degreeLevel: 'Master',
        duration: '2 Years',
        eligibility: 'B.Sc. Forensic Science (Min 55%)',
        estimatedFees: '₹18,000 / year',
        mode: 'Full-time'
      },
      {
        name: 'PG Diploma in Cyber Crime & Digital Forensics',
        degreeLevel: 'Diploma',
        duration: '1 Year',
        eligibility: 'Graduate in Science / IT / Engineering / Law',
        estimatedFees: '₹15,000 / year',
        mode: 'Part-time'
      }
    ],
    feesRange: '₹10,000 - ₹20,000 / year',
    admissionProcess: 'Government Merit List based on 10+2 & B.Sc. aggregate percentage.',
    accreditation: 'Government of Maharashtra | Mumbai University Affiliated',
    contactEmail: 'director@ifsc.ac.in',
    contactPhone: '+91 22 22817581',
    address: '15, Madame Cama Road, Fort, Mumbai, Maharashtra 400032',
    ranking: '#1 Govt Institute in Maharashtra for Forensic Science',
    facilities: ['Digital Evidence Recovery Suite', 'Spectrophotometry Suite', 'Crime Library'],
    featured: false
  },
  {
    id: 'panjab-university',
    name: 'Department of Forensic Science, Panjab University',
    shortName: 'PU Chandigarh',
    country: 'India',
    state: 'Chandigarh / Punjab',
    city: 'Chandigarh',
    type: 'Government',
    website: 'https://forensicscience.puchd.ac.in',
    logo: 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?auto=format&fit=crop&q=80&w=300',
    bannerImage: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1200',
    description: 'One of India\'s oldest pioneer university departments for forensic science research and anthropology studies.',
    coursesOffered: [
      {
        name: 'M.Sc. Forensic Science & Criminology',
        degreeLevel: 'Master',
        duration: '2 Years',
        eligibility: 'PU Common Entrance Test (PU-CET PG) + B.Sc. Degree',
        estimatedFees: '₹25,000 / year',
        mode: 'Full-time'
      },
      {
        name: 'Ph.D. Forensic Science',
        degreeLevel: 'Doctorate',
        duration: '3-5 Years',
        eligibility: 'UGC-NET / GATE / PU Entrance',
        estimatedFees: '₹15,000 / year',
        mode: 'Full-time'
      }
    ],
    feesRange: '₹15,000 - ₹30,000 / year',
    admissionProcess: 'PU-CET PG Entrance Exam conducted by Panjab University.',
    accreditation: 'NAAC A++ Grade | Central University Status',
    contactEmail: 'forensic@pu.ac.in',
    contactPhone: '+91 172 2534120',
    address: 'Sector 14, Panjab University, Chandigarh 160014',
    ranking: 'NIRF Top 25 Universities in India',
    facilities: ['Forensic Anthropology Osteology Museum', 'Serology Research Unit'],
    featured: false
  },
  {
    id: 'strathclyde-uk',
    name: 'Centre for Forensic Science, University of Strathclyde',
    shortName: 'Strathclyde Forensic',
    country: 'United Kingdom',
    state: 'Scotland',
    city: 'Glasgow',
    type: 'Government',
    website: 'https://www.strath.ac.uk/science/forensicscience',
    logo: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=300',
    bannerImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=1200',
    description: 'The oldest operational Centre for Forensic Science in the UK, renowned globally for pioneering DNA profiling and fire investigation research.',
    coursesOffered: [
      {
        name: 'MSc Forensic Science',
        degreeLevel: 'Master',
        duration: '1 Year',
        eligibility: 'First/second class Honours degree in Chemistry, Biology, or Forensic Science + IELTS 6.5',
        estimatedFees: '£23,500 / year',
        mode: 'Full-time',
        specializations: ['Forensic Biology & DNA', 'Forensic Chemistry & Toxicology']
      },
      {
        name: 'BSc (Hons) Forensic & Analytical Chemistry',
        degreeLevel: 'Bachelor',
        duration: '4 Years',
        eligibility: 'High School Diploma / A-Levels with Chemistry and Mathematics',
        estimatedFees: '£22,000 / year',
        mode: 'Full-time'
      }
    ],
    feesRange: '£22,000 - £25,000 / year',
    admissionProcess: 'UCAS Application (Undergraduate) or Direct Strathclyde International Portal (Postgraduate).',
    accreditation: 'The Chartered Society of Forensic Sciences (CSFS) Accredited',
    contactEmail: 'science-enquiries@strath.ac.uk',
    contactPhone: '+44 141 552 4400',
    address: '16 Richmond Street, Glasgow G1 1XQ, Scotland, UK',
    ranking: '#1 in UK for Forensic Science (Complete University Guide)',
    facilities: ['Operational Forensic Analysis Labs', 'Mass Spectrometry Center', 'Mock Crime Scene Flat'],
    featured: true
  },
  {
    id: 'gwu-usa',
    name: 'Department of Forensic Sciences, George Washington University',
    shortName: 'GWU Forensics',
    country: 'United States',
    state: 'District of Columbia',
    city: 'Washington D.C.',
    type: 'Private',
    website: 'https://forensicsciences.columbian.gwu.edu',
    logo: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=300',
    bannerImage: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&q=80&w=1200',
    description: 'Located in the heart of Washington D.C. near federal intelligence agencies (FBI, DEA, Secret Service) providing unmatched internship access.',
    coursesOffered: [
      {
        name: 'Master of Science in Forensic Sciences (MSFS)',
        degreeLevel: 'Master',
        duration: '2 Years',
        eligibility: 'Bachelor in STEM discipline, GRE score, TOEFL/IELTS',
        estimatedFees: '$38,500 / year',
        mode: 'Full-time',
        specializations: ['Forensic Chemistry', 'Forensic Molecular Biology', 'High Technology Crime Investigation']
      }
    ],
    feesRange: '$35,000 - $40,000 / year',
    admissionProcess: 'GW Graduate Admissions Portal + Statement of Purpose + 2 Letters of Recommendation',
    accreditation: 'FEPAC Accredited (Forensic Science Education Programs Accreditation Commission)',
    contactEmail: 'forensic@gwu.edu',
    contactPhone: '+1 202 994 8400',
    address: '2101 G St NW, Washington, DC 20052, USA',
    ranking: 'Top Tier US Graduate Forensic Science Program',
    facilities: ['High-Tech Digital Forensics Suite', 'FBI Partnered Internship Network'],
    featured: true
  },
  {
    id: 'shsu-usa',
    name: 'Department of Forensic Science, Sam Houston State University',
    shortName: 'SHSU Huntsville',
    country: 'United States',
    state: 'Texas',
    city: 'Huntsville',
    type: 'Government',
    website: 'https://www.shsu.edu/academics/forensic-science',
    logo: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&q=80&w=300',
    bannerImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=1200',
    description: 'Home to the Southeast Texas Applied Forensic Science (STAFS) Facility - one of the world\'s largest human decomposition research facilities.',
    coursesOffered: [
      {
        name: 'Master of Science in Forensic Science',
        degreeLevel: 'Master',
        duration: '2 Years',
        eligibility: 'BS in Chemistry, Biology or Forensic Science',
        estimatedFees: '$18,000 / year (In-state) / $28,000 (Out-of-state)',
        mode: 'Full-time'
      },
      {
        name: 'Ph.D. in Forensic Science',
        degreeLevel: 'Doctorate',
        duration: '4 Years',
        eligibility: 'MS or BS with outstanding academic record in chemistry/biology',
        estimatedFees: '$20,000 / year',
        mode: 'Full-time'
      }
    ],
    feesRange: '$18,000 - $28,000 / year',
    admissionProcess: 'SHSU Online Portal + Official Transcripts + Interview',
    accreditation: 'FEPAC Accredited MS Program',
    contactEmail: 'forensics@shsu.edu',
    contactPhone: '+1 936 294 4370',
    address: '1003 19th St, Huntsville, TX 77340, USA',
    ranking: '#1 Applied Forensic Decomposition Research Center',
    facilities: ['STAFS Body Farm Outdoor Facility', 'Comparison Microscope Suite', 'Crime Scene House'],
    featured: true
  },
  {
    id: 'kcl-uk',
    name: 'Department of Forensic Science, King\'s College London',
    shortName: 'King\'s College London',
    country: 'United Kingdom',
    state: 'Greater London',
    city: 'London',
    type: 'Government',
    website: 'https://www.kcl.ac.uk/study/postgraduate-taught/courses/forensic-science-msc',
    logo: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=300',
    bannerImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1200',
    description: 'London premier forensic medicine and anti-doping analysis university working directly with the Metropolitan Police Service and WADA.',
    coursesOffered: [
      {
        name: 'MSc Forensic Science',
        degreeLevel: 'Master',
        duration: '1 Year',
        eligibility: '2:1 UK Honours degree in Chemistry, Biochemistry, Forensic Science or related',
        estimatedFees: '£29,800 / year',
        mode: 'Full-time'
      }
    ],
    feesRange: '£29,000 - £32,000 / year',
    admissionProcess: 'King\'s Apply Online Application Portal',
    accreditation: 'CSFS Accredited | WADA Certified Drug Testing Hub',
    contactEmail: 'forensic-msc@kcl.ac.uk',
    contactPhone: '+44 20 7836 5454',
    address: 'Strand, London WC2R 2LS, United Kingdom',
    ranking: 'QS World Top 40 Universities',
    facilities: ['Drug Control Centre (DCC)', 'DNA Fingerprinting Unit', 'Medical Toxicology Suite'],
    featured: false
  }
];

export async function fetchColleges(): Promise<College[]> {
  try {
    const q = query(collection(db, COLLEGES_COLLECTION), orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return SAMPLE_COLLEGES;
    }

    const fetched: College[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      fetched.push({
        id: docSnap.id,
        name: data.name || '',
        shortName: data.shortName || '',
        country: data.country || 'India',
        state: data.state || '',
        city: data.city || '',
        type: data.type || 'Government',
        website: data.website || '',
        logo: data.logo || '',
        bannerImage: data.bannerImage || '',
        description: data.description || '',
        coursesOffered: Array.isArray(data.coursesOffered) ? data.coursesOffered : [],
        feesRange: data.feesRange || '',
        admissionProcess: data.admissionProcess || '',
        accreditation: data.accreditation || '',
        contactEmail: data.contactEmail || '',
        contactPhone: data.contactPhone || '',
        address: data.address || '',
        ranking: data.ranking || '',
        facilities: Array.isArray(data.facilities) ? data.facilities : [],
        featured: !!data.featured,
        createdBy: data.createdBy || 'ForenClue Admin',
        createdAt: data.createdAt ? (data.createdAt.seconds ? new Date(data.createdAt.seconds * 1000).toISOString() : data.createdAt) : new Date().toISOString(),
        updatedAt: data.updatedAt ? (data.updatedAt.seconds ? new Date(data.updatedAt.seconds * 1000).toISOString() : data.updatedAt) : new Date().toISOString()
      });
    });

    // Merge default sample colleges that are not present in Firestore so user sees a rich catalog immediately
    const existingIds = new Set(fetched.map(c => c.id.toLowerCase()));
    const missingSamples = SAMPLE_COLLEGES.filter(s => !existingIds.has(s.id.toLowerCase()));

    return [...fetched, ...missingSamples];
  } catch (error) {
    console.warn("Could not fetch colleges from Firestore, using fallback samples:", error);
    return SAMPLE_COLLEGES;
  }
}

export async function fetchCollegeById(id: string): Promise<College | null> {
  try {
    const docRef = doc(db, COLLEGES_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name || '',
        shortName: data.shortName || '',
        country: data.country || 'India',
        state: data.state || '',
        city: data.city || '',
        type: data.type || 'Government',
        website: data.website || '',
        logo: data.logo || '',
        bannerImage: data.bannerImage || '',
        description: data.description || '',
        coursesOffered: Array.isArray(data.coursesOffered) ? data.coursesOffered : [],
        feesRange: data.feesRange || '',
        admissionProcess: data.admissionProcess || '',
        accreditation: data.accreditation || '',
        contactEmail: data.contactEmail || '',
        contactPhone: data.contactPhone || '',
        address: data.address || '',
        ranking: data.ranking || '',
        facilities: Array.isArray(data.facilities) ? data.facilities : [],
        featured: !!data.featured,
        createdAt: data.createdAt ? (data.createdAt.seconds ? new Date(data.createdAt.seconds * 1000).toISOString() : data.createdAt) : new Date().toISOString()
      };
    }
  } catch (err) {
    console.error("Error loading college by ID:", err);
  }
  
  // Fallback check in samples
  const sample = SAMPLE_COLLEGES.find(c => c.id === id || c.id.toLowerCase() === id.toLowerCase());
  return sample || null;
}

export async function saveCollege(collegeData: Partial<College> & { id?: string }): Promise<string> {
  const isUpdate = !!collegeData.id;
  const targetId = collegeData.id || `college_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  
  const payload = {
    name: collegeData.name || 'Untitled College',
    shortName: collegeData.shortName || '',
    country: collegeData.country || 'India',
    state: collegeData.state || '',
    city: collegeData.city || '',
    type: collegeData.type || 'Government',
    website: collegeData.website || '',
    logo: collegeData.logo || '',
    bannerImage: collegeData.bannerImage || '',
    description: collegeData.description || '',
    coursesOffered: collegeData.coursesOffered || [],
    feesRange: collegeData.feesRange || '',
    admissionProcess: collegeData.admissionProcess || '',
    accreditation: collegeData.accreditation || '',
    contactEmail: collegeData.contactEmail || '',
    contactPhone: collegeData.contactPhone || '',
    address: collegeData.address || '',
    ranking: collegeData.ranking || '',
    facilities: collegeData.facilities || [],
    featured: !!collegeData.featured,
    updatedAt: new Date().toISOString()
  };

  try {
    const docRef = doc(db, COLLEGES_COLLECTION, targetId);
    if (!isUpdate) {
      (payload as any).createdAt = new Date().toISOString();
    }
    await setDoc(docRef, payload, { merge: true });
    return targetId;
  } catch (error) {
    handleFirestoreError(error, isUpdate ? OperationType.UPDATE : OperationType.WRITE, `${COLLEGES_COLLECTION}/${targetId}`);
    throw error;
  }
}

export async function deleteCollege(collegeId: string): Promise<void> {
  try {
    const docRef = doc(db, COLLEGES_COLLECTION, collegeId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLEGES_COLLECTION}/${collegeId}`);
    throw error;
  }
}
