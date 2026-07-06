import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, Mail, Key, LayoutGrid, BookOpen, Plus, Trash2, 
  Settings, CheckCircle2, AlertCircle, FileText, Upload, 
  ExternalLink, LogOut, Loader2, Sparkles, HelpCircle, 
  Globe, Edit3, MessageSquare, Radio, Award
} from 'lucide-react';
import { db, storage, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ResilientImage, uploadFileResilient } from '@/lib/localFileStore';

export default function Admin() {
  const { user, isAdmin, adminLogin, logout } = useAuth();
  const navigate = useNavigate();

  // Authentication Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [btnLoading, setBtnLoading] = useState(false);

   // Active Tab: 'overview' | 'courses' | 'ebooks' | 'texts' | 'doubts' | 'podcast' | 'certificates'
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'ebooks' | 'texts' | 'doubts' | 'podcast' | 'certificates'>('overview');

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
      setCertificates(certList);
    } catch (e) {
      console.error("Error fetching certificates collection:", e);
    } finally {
      setCertificateLoading(false);
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
              </div>

              {/* Active Control Panel Canvas */}
              <div className="lg:col-span-3">
                
                {/* 1. OVERVIEW SYSTEM REPORT */}
                {activeTab === 'overview' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="bg-surface border border-black/10 dark:border-white/5 rounded-2xl p-6">
                      <h2 className="text-xl font-heading font-black uppercase tracking-tight mb-4">Workspace Analytics</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
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
                        <div className="bg-base border border-black/5 dark:border-white/5 p-4 rounded-xl text-center col-span-2 sm:col-span-1">
                          <span className="text-xs uppercase tracking-wider text-text-muted block mb-1">Certificates Issued</span>
                          <span className="text-3xl font-heading font-black text-warning">{certificates.length}</span>
                        </div>
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


