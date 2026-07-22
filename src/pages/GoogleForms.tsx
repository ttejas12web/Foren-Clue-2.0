import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Plus, 
  Search, 
  Database, 
  RefreshCw, 
  ExternalLink, 
  Lock, 
  CheckCircle2, 
  User, 
  Calendar, 
  TrendingUp, 
  Sparkles, 
  Share2, 
  Trash2, 
  AlertTriangle, 
  ChevronRight,
  ClipboardList,
  Mail,
  PieChart,
  Eye,
  Info
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, setDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { SEO } from '@/components/layout/SEO';

interface RegisteredForm {
  id: string;
  formId: string;
  title: string;
  description: string;
  responderUri: string;
  createdAt: string;
  createdBy: string;
}

export default function GoogleForms() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  
  // Google OAuth Access Token (stored in memory)
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [googleUser, setGoogleUser] = useState<{ displayName: string | null; email: string | null; photoURL: string | null } | null>(null);
  
  // Firestore forms collection state
  const [registeredForms, setRegisteredForms] = useState<RegisteredForm[]>([]);
  const [loadingForms, setLoadingForms] = useState(true);
  const [formsError, setFormsError] = useState<string | null>(null);

  // Selected Form Details & Responses
  const [selectedForm, setSelectedForm] = useState<RegisteredForm | null>(null);
  const [selectedFormDetails, setSelectedFormDetails] = useState<any | null>(null);
  const [formResponses, setFormResponses] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  // Form Creation Form State
  const [newFormTitle, setNewFormTitle] = useState('');
  const [newFormDesc, setNewFormDesc] = useState('');
  const [creatingForm, setCreatingForm] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  // Existing Form Addition State
  const [existingFormIdInput, setExistingFormIdInput] = useState('');
  const [addingForm, setAddingForm] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  // Load registered forms from Firestore on mount
  useEffect(() => {
    fetchRegisteredForms();
  }, []);

  const fetchRegisteredForms = async () => {
    setLoadingForms(true);
    setFormsError(null);
    try {
      const q = query(collection(db, 'google_forms'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const formsList: RegisteredForm[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        formsList.push({
          id: docSnap.id,
          formId: data.formId || docSnap.id,
          title: data.title || 'Untitled Form',
          description: data.description || '',
          responderUri: data.responderUri || '',
          createdAt: data.createdAt instanceof Date ? data.createdAt.toISOString() : (data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : String(data.createdAt || '')),
          createdBy: data.createdBy || 'Administrator',
        });
      });
      setRegisteredForms(formsList);
    } catch (err: any) {
      console.error('Error fetching forms from Firestore:', err);
      setFormsError('Could not load registered forms. Please make sure database is initialized.');
    } finally {
      setLoadingForms(false);
    }
  };

  // Google OAuth popup sign-in specifically for Form and Drive scopes
  const handleConnectGoogle = async () => {
    setFormsError(null);
    try {
      const provider = new GoogleAuthProvider();
      // Scopes matching the ones configured via set_up_oauth
      provider.addScope('https://www.googleapis.com/auth/forms.body');
      provider.addScope('https://www.googleapis.com/auth/forms.responses.readonly');
      provider.addScope('https://www.googleapis.com/auth/drive.readonly');
      provider.addScope('https://www.googleapis.com/auth/drive.file');

      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setGoogleToken(credential.accessToken);
        setGoogleUser({
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
        });
      } else {
        throw new Error('No access token returned from Google authentication popup.');
      }
    } catch (err: any) {
      console.error('Google Sign-In Scope Error:', err);
      setFormsError(err.message || 'Failed to authenticate and authorize Google Forms access.');
    }
  };

  // Create a new Google Form using Google Forms API
  const handleCreateGoogleForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleToken) {
      setCreateError('Please connect your Google Account with Forms API permission first.');
      return;
    }
    if (!newFormTitle.trim()) {
      setCreateError('Form Title is required.');
      return;
    }

    setCreatingForm(true);
    setCreateError(null);
    setCreateSuccess(null);

    try {
      // 1. Create top-level form structure
      const createRes = await fetch('https://forms.googleapis.com/v1/forms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${googleToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          info: {
            title: newFormTitle,
            documentTitle: newFormTitle,
          }
        })
      });

      if (!createRes.ok) {
        const errorData = await createRes.json();
        throw new Error(errorData.error?.message || 'Failed to create Google Form');
      }

      const createdForm = await createRes.json();
      const formId = createdForm.formId;

      // 2. Add some initial standard questions (e.g. Email and Full Name)
      const updateRes = await fetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${googleToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              updateFormInfo: {
                info: {
                  description: newFormDesc || 'Created automatically via Foren Clue portal.',
                },
                updateMask: 'description'
              }
            },
            {
              createItem: {
                item: {
                  title: 'Full Name',
                  description: 'Please enter your complete name.',
                  questionItem: {
                    question: {
                      required: true,
                      textQuestion: {}
                    }
                  }
                },
                location: { index: 0 }
              }
            },
            {
              createItem: {
                item: {
                  title: 'Email Address',
                  questionItem: {
                    question: {
                      required: true,
                      textQuestion: {}
                    }
                  }
                },
                location: { index: 1 }
              }
            }
          ]
        })
      });

      if (!updateRes.ok) {
        console.warn('Initial questions addition failed, but form was created. ID:', formId);
      }

      // 3. Register form in Firestore google_forms collection
      const formDocRef = doc(db, 'google_forms', formId);
      const newFormMeta: RegisteredForm = {
        id: formId,
        formId: formId,
        title: newFormTitle,
        description: newFormDesc || 'Created automatically via Foren Clue portal.',
        responderUri: createdForm.responderUri || `https://docs.google.com/forms/d/e/${formId}/viewform`,
        createdAt: new Date().toLocaleDateString(),
        createdBy: user?.displayName || user?.email || 'Administrator',
      };

      await setDoc(formDocRef, newFormMeta);

      // Refresh forms list and reset inputs
      setRegisteredForms(prev => [newFormMeta, ...prev]);
      setNewFormTitle('');
      setNewFormDesc('');
      setCreateSuccess(`Google Form "${newFormTitle}" successfully created and registered!`);
    } catch (err: any) {
      console.error('Error creating Google Form:', err);
      setCreateError(err.message || 'Failed to create or register new Google Form.');
    } finally {
      setCreatingForm(false);
    }
  };

  // Add an existing Google Form by ID
  const handleAddExistingForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleToken) {
      setAddError('Please connect your Google Account with Forms API permission first.');
      return;
    }
    const cleanFormId = existingFormIdInput.trim();
    if (!cleanFormId) {
      setAddError('Form ID or full URL is required.');
      return;
    }

    // Extract ID from full Google Forms URL if provided
    let formId = cleanFormId;
    const urlMatch = cleanFormId.match(/\/forms\/d\/e\/([a-zA-Z0-9_=-]+)/) || cleanFormId.match(/\/forms\/d\/([a-zA-Z0-9_=-]+)/);
    if (urlMatch && urlMatch[1]) {
      formId = urlMatch[1];
    }

    setAddingForm(true);
    setAddError(null);
    setAddSuccess(null);

    try {
      // Fetch details from Forms API to verify and load metadata
      const res = await fetch(`https://forms.googleapis.com/v1/forms/${formId}`, {
        headers: {
          'Authorization': `Bearer ${googleToken}`
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || 'Verify that the Form ID is valid and you have access to it.');
      }

      const googleFormDetails = await res.json();

      // Register in Firestore
      const formDocRef = doc(db, 'google_forms', formId);
      const newFormMeta: RegisteredForm = {
        id: formId,
        formId: formId,
        title: googleFormDetails.info?.title || 'Existing Google Form',
        description: googleFormDetails.info?.description || 'Registered Google Form',
        responderUri: googleFormDetails.responderUri || `https://docs.google.com/forms/d/e/${formId}/viewform`,
        createdAt: new Date().toLocaleDateString(),
        createdBy: user?.displayName || user?.email || 'Administrator',
      };

      await setDoc(formDocRef, newFormMeta);

      // Refresh list
      setRegisteredForms(prev => {
        if (prev.some(f => f.formId === formId)) return prev;
        return [newFormMeta, ...prev];
      });
      setExistingFormIdInput('');
      setAddSuccess(`Successfully added form: "${newFormMeta.title}"!`);
    } catch (err: any) {
      console.error('Error adding existing form:', err);
      setAddError(err.message || 'Failed to authenticate, locate, or register Google Form ID.');
    } finally {
      setAddingForm(false);
    }
  };

  // Fetch Form questions/structure and responses
  const handleSelectForm = async (form: RegisteredForm) => {
    setSelectedForm(form);
    setSelectedFormDetails(null);
    setFormResponses([]);
    
    if (!googleToken) {
      // Just set selected form to allow embedded viewing
      return;
    }

    setLoadingDetails(true);
    setDetailsError(null);

    try {
      // 1. Fetch form metadata/items
      const formRes = await fetch(`https://forms.googleapis.com/v1/forms/${form.formId}`, {
        headers: {
          'Authorization': `Bearer ${googleToken}`
        }
      });

      if (!formRes.ok) {
        throw new Error('Could not retrieve form structure. Check form owner permissions.');
      }
      const formDetails = await formRes.json();
      setSelectedFormDetails(formDetails);

      // 2. Fetch responses
      const responsesRes = await fetch(`https://forms.googleapis.com/v1/forms/${form.formId}/responses`, {
        headers: {
          'Authorization': `Bearer ${googleToken}`
        }
      });

      if (responsesRes.ok) {
        const responsesData = await responsesRes.json();
        setFormResponses(responsesData.responses || []);
      } else {
        console.warn('Could not read form responses. Check if any responses exist.');
        setFormResponses([]);
      }
    } catch (err: any) {
      console.error('Error fetching form details/responses:', err);
      setDetailsError(err.message || 'Failed to retrieve live questions or responses from Google Forms API.');
    } finally {
      setLoadingDetails(false);
    }
  };

  // Delete registered form from Firestore
  const handleDeleteRegisteredForm = async (formId: string, title: string) => {
    const confirmed = window.confirm(`Are you sure you want to remove the registered form "${title}" from the Foren Clue dashboard?\n\n(Note: This will NOT delete the actual form on Google Drive, it only unlinks it from the portal).`);
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, 'google_forms', formId));
      setRegisteredForms(prev => prev.filter(f => f.formId !== formId));
      if (selectedForm?.formId === formId) {
        setSelectedForm(null);
        setSelectedFormDetails(null);
        setFormResponses([]);
      }
    } catch (err: any) {
      console.error('Error deleting form registration:', err);
      alert('Failed to remove form registration.');
    }
  };

  // Extract answer value safely based on question items
  const renderAnswerText = (response: any, questionId: string) => {
    const answerObj = response.answers?.[questionId];
    if (!answerObj) return <span className="text-text-muted italic">No Answer</span>;
    
    const textAnswers = answerObj.textAnswers?.answers;
    if (!textAnswers || textAnswers.length === 0) return <span className="text-text-muted italic">No Answer</span>;

    return (
      <div className="space-y-1">
        {textAnswers.map((ans: any, idx: number) => (
          <div key={idx} className="text-sm text-text-main font-mono bg-base/50 px-2 py-1 rounded border border-white/5 inline-block mr-1">
            {ans.value}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-base py-12 px-4 sm:px-6 lg:px-8">
      <SEO 
        title="Google Forms Portal | Foren Clue" 
        description="Connect, create, embed, and analyze Google Forms data directly within the Foren Clue administrative platform."
      />

      <div className="max-w-7xl mx-auto space-y-10">
        {/* Top Header Section */}
        <div className="relative overflow-hidden rounded-3xl border border-black/10 dark:border-white/10 bg-crust/50 p-8 sm:p-12 shadow-2xl">
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(251,191,36,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(251,191,36,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warning/10 border border-warning/20 text-warning text-xs font-mono uppercase tracking-wider">
                <Sparkles size={12} />
                Workspace Integration
              </div>
              <h1 className="text-4xl sm:text-5xl font-heading font-black tracking-tight text-text-main">
                Google Forms <span className="text-warning">Portal</span>
              </h1>
              <p className="text-base sm:text-lg text-text-muted leading-relaxed">
                Seamlessly interact with real-world Google Forms. Administrators can generate, embed, and track submissions instantly, powering registration, volunteer intake, and expert webinars.
              </p>
            </div>

            {/* Google Account Connection Status */}
            <div className="bg-surface border border-black/10 dark:border-white/5 rounded-2xl p-5 shadow-xl md:max-w-xs w-full flex flex-col items-center justify-center text-center space-y-4">
              {googleToken ? (
                <>
                  <div className="relative">
                    {googleUser?.photoURL ? (
                      <img 
                        src={googleUser.photoURL} 
                        alt={googleUser.displayName || 'Google User'} 
                        className="w-16 h-16 rounded-full border-2 border-warning shadow-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-warning/10 border-2 border-warning flex items-center justify-center text-warning">
                        <User size={30} />
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 border-2 border-surface">
                      <CheckCircle2 size={12} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-text-main">{googleUser?.displayName || 'Connected Account'}</h3>
                    <p className="text-xs text-text-muted font-mono truncate max-w-[200px]">{googleUser?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setGoogleToken(null);
                      setGoogleUser(null);
                    }}
                    className="text-xs text-red-400 hover:text-red-300 font-mono underline transition-colors"
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center text-warning mb-1">
                    <ClipboardList size={24} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-text-main">Google Account Required</h4>
                    <p className="text-xs text-text-muted">Connect your account to access Forms APIs & sync live entries.</p>
                  </div>
                  <button
                    onClick={handleConnectGoogle}
                    className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-2 bg-warning text-black font-black text-xs tracking-wider uppercase rounded-xl hover:bg-warning/90 transition-all duration-200 active:scale-95 shadow-lg shadow-warning/15"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Connect Google
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Admin Section: Forms Actions (Create, Register) */}
        {isAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Create New Google Form */}
            <div className="bg-surface border border-black/10 dark:border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-warning/10 text-warning">
                  <Plus size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-heading font-black text-text-main">Create Live Google Form</h2>
                  <p className="text-xs text-text-muted">Generate a customized form directly in your Google Drive.</p>
                </div>
              </div>

              <form onSubmit={handleCreateGoogleForm} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase tracking-wider text-text-muted">Form Title</label>
                  <input
                    type="text"
                    required
                    disabled={creatingForm}
                    value={newFormTitle}
                    onChange={(e) => setNewFormTitle(e.target.value)}
                    placeholder="e.g. Foren Clue - Cyber Forensics Webinar"
                    className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-warning/50 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase tracking-wider text-text-muted">Description / Subtitle</label>
                  <textarea
                    rows={3}
                    disabled={creatingForm}
                    value={newFormDesc}
                    onChange={(e) => setNewFormDesc(e.target.value)}
                    placeholder="Provide information about the purpose of this form, schedule, topics, etc."
                    className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-warning/50 focus:outline-none transition-colors resize-none"
                  />
                </div>

                {createError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-2.5">
                    <AlertTriangle size={14} className="shrink-0" />
                    <span>{createError}</span>
                  </div>
                )}

                {createSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center gap-2.5">
                    <CheckCircle2 size={14} className="shrink-0" />
                    <span>{createSuccess}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={creatingForm || !googleToken}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-warning hover:bg-warning-dark disabled:bg-warning/50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-warning/10"
                >
                  {creatingForm ? (
                    <>
                      <RefreshCw size={16} className="animate-spin text-black" />
                      <span className="text-black">Generating Form...</span>
                    </>
                  ) : (
                    <>
                      <ClipboardList size={16} className="text-black" />
                      <span className="text-black font-black uppercase tracking-wider text-xs">Create Google Form</span>
                    </>
                  )}
                </button>

                {!googleToken && (
                  <p className="text-[11px] text-center text-text-muted italic">
                    * Make sure to connect your Google account above to authorize Form Creation.
                  </p>
                )}
              </form>
            </div>

            {/* Add Existing Google Form ID */}
            <div className="bg-surface border border-black/10 dark:border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-warning/10 text-warning">
                  <Database size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-heading font-black text-text-main">Register Existing Form ID</h2>
                  <p className="text-xs text-text-muted">Link any existing form on your Google Account to this app.</p>
                </div>
              </div>

              <form onSubmit={handleAddExistingForm} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase tracking-wider text-text-muted">Google Form ID or URL</label>
                  <input
                    type="text"
                    required
                    disabled={addingForm}
                    value={existingFormIdInput}
                    onChange={(e) => setExistingFormIdInput(e.target.value)}
                    placeholder="e.g. 1FAIpQLSfD_N7..."
                    className="w-full bg-base border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-warning/50 focus:outline-none transition-colors font-mono"
                  />
                  <p className="text-[10px] text-text-muted italic">
                    You can paste either the raw Form ID or the full URL from your browser's address bar.
                  </p>
                </div>

                {addError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-center gap-2.5">
                    <AlertTriangle size={14} className="shrink-0" />
                    <span>{addError}</span>
                  </div>
                )}

                {addSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center gap-2.5">
                    <CheckCircle2 size={14} className="shrink-0" />
                    <span>{addSuccess}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={addingForm || !googleToken}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 border border-warning hover:bg-warning/5 text-warning font-bold rounded-xl transition-all duration-200"
                >
                  {addingForm ? (
                    <>
                      <RefreshCw size={16} className="animate-spin text-warning" />
                      <span>Validating & Adding...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      <span className="font-black uppercase tracking-wider text-xs">Register Form ID</span>
                    </>
                  )}
                </button>
              </form>

              <div className="p-4 bg-crust/50 border border-black/10 dark:border-white/5 rounded-xl text-xs text-text-muted leading-relaxed space-y-2">
                <h4 className="font-bold text-text-main flex items-center gap-1.5">
                  <Info size={12} className="text-warning" />
                  How to locate Form ID:
                </h4>
                <p>
                  Open your Google Form in Edit mode. In the URL bar, find the section after <code>/forms/d/</code> (e.g. <code>https://docs.google.com/forms/d/<strong>1FAIpQLSfD_...</strong>/edit</code>). Copy that long code!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Forms Directory / Dashboard Grid */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-heading font-black text-text-main">Forms Directory</h2>
              <p className="text-sm text-text-muted">Explore active Google Forms connected to Foren Clue.</p>
            </div>

            <button
              onClick={fetchRegisteredForms}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-black/10 dark:border-white/10 rounded-xl text-xs font-mono text-text-muted hover:text-warning transition-colors"
            >
              <RefreshCw size={12} />
              Reload List
            </button>
          </div>

          {loadingForms ? (
            <div className="flex h-48 items-center justify-center bg-surface border border-black/10 dark:border-white/5 rounded-2xl">
              <RefreshCw size={32} className="animate-spin text-warning" />
            </div>
          ) : registeredForms.length === 0 ? (
            <div className="text-center p-12 bg-surface border border-black/10 dark:border-white/5 rounded-2xl max-w-lg mx-auto space-y-4">
              <ClipboardList size={40} className="text-text-muted mx-auto" />
              <div>
                <h3 className="font-black text-lg text-text-main">No Forms Registered Yet</h3>
                <p className="text-sm text-text-muted">Administrators can create or register Google Forms to begin collecting information from webinar participants or volunteers.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registeredForms.map((form) => (
                <div 
                  key={form.formId}
                  onClick={() => handleSelectForm(form)}
                  className={`bg-surface border p-6 rounded-2xl cursor-pointer hover:border-warning/30 hover:-translate-y-1 transition-all duration-300 relative group flex flex-col justify-between h-[230px] shadow-xl ${selectedForm?.formId === form.formId ? 'border-warning ring-1 ring-warning' : 'border-black/10 dark:border-white/5'}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2 bg-warning/10 text-warning rounded-lg">
                        <FileText size={18} />
                      </div>
                      
                      {isAdmin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRegisteredForm(form.id, form.title);
                          }}
                          className="p-1.5 opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded transition-all duration-200"
                          title="Delete Registration"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-black text-base text-text-main group-hover:text-warning transition-colors line-clamp-1">{form.title}</h3>
                      <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">{form.description || 'No description provided.'}</p>
                    </div>
                  </div>

                  <div className="border-t border-black/10 dark:border-white/5 pt-3 mt-4 flex items-center justify-between text-[11px] text-text-muted">
                    <span className="font-mono">ID: {form.formId.slice(0, 10)}...</span>
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      {form.createdAt}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Form Active Dashboard Area */}
        <AnimatePresence mode="wait">
          {selectedForm && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 xl:grid-cols-3 gap-8 border-t border-black/10 dark:border-white/10 pt-10"
            >
              {/* Form Embed Block (IFrame) */}
              <div className="xl:col-span-2 bg-surface border border-black/10 dark:border-white/5 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[750px]">
                <div className="bg-crust px-6 py-4 border-b border-black/10 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-warning animate-pulse" />
                    <span className="font-heading font-black text-sm text-text-main">Live Form Preview</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={selectedForm.responderUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-warning/10 hover:bg-warning/20 text-warning text-xs font-mono rounded-lg transition-colors"
                    >
                      Open Form
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>

                <div className="flex-grow bg-white relative">
                  <iframe
                    src={`${selectedForm.responderUri}?embedded=true`}
                    className="absolute inset-0 w-full h-full border-0"
                    title={selectedForm.title}
                  >
                    Loading form...
                  </iframe>
                </div>
              </div>

              {/* Live Responses / API Integration Area */}
              <div className="bg-surface border border-black/10 dark:border-white/5 rounded-2xl p-6 shadow-2xl flex flex-col justify-between h-[750px]">
                <div className="space-y-6 overflow-y-auto pr-1 flex-grow">
                  <div className="space-y-1">
                    <h2 className="text-xl font-heading font-black text-text-main flex items-center gap-2">
                      <PieChart size={18} className="text-warning" />
                      API Insights
                    </h2>
                    <p className="text-xs text-text-muted">Synchronize and explore live responses via Google API.</p>
                  </div>

                  {googleToken ? (
                    <div className="space-y-6">
                      {/* Form Metadata */}
                      <div className="bg-crust/50 border border-black/10 dark:border-white/5 rounded-xl p-4 space-y-3">
                        <h4 className="text-xs font-mono uppercase tracking-wider text-text-muted">Live Google metadata</h4>
                        
                        {loadingDetails ? (
                          <div className="flex justify-center py-4">
                            <RefreshCw size={20} className="animate-spin text-warning" />
                          </div>
                        ) : selectedFormDetails ? (
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-text-muted">Title:</span>
                              <span className="font-bold text-text-main truncate max-w-[150px]">{selectedFormDetails.info?.title}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-text-muted font-mono">Questions count:</span>
                              <span className="font-mono text-warning font-black">{selectedFormDetails.items?.length || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-text-muted font-mono">Total Responses:</span>
                              <span className="font-mono text-warning font-black">{formResponses.length}</span>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleSelectForm(selectedForm)}
                            className="w-full py-2 bg-warning/10 hover:bg-warning/20 border border-warning/20 text-warning text-xs font-mono rounded-lg transition-colors flex items-center justify-center gap-1.5"
                          >
                            <RefreshCw size={12} />
                            Load API Data
                          </button>
                        )}
                      </div>

                      {/* Live Answers Analysis */}
                      <div className="space-y-4">
                        <h3 className="font-heading font-black text-sm text-text-main flex items-center gap-1.5">
                          <ClipboardList size={14} className="text-warning" />
                          Form Submissions ({formResponses.length})
                        </h3>

                        {detailsError && (
                          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
                            {detailsError}
                          </div>
                        )}

                        {formResponses.length === 0 ? (
                          <div className="text-center py-8 bg-crust/20 border border-dashed border-white/10 rounded-xl text-xs text-text-muted">
                            No submissions recorded or synced yet. Use the live preview on the left to test fill-out!
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {formResponses.map((res: any, idx: number) => (
                              <div key={res.responseId} className="bg-crust border border-black/10 dark:border-white/5 rounded-xl p-4 space-y-3">
                                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                  <span className="text-[10px] text-text-muted font-mono">#{idx + 1} ({res.responseId.slice(0, 8)}...)</span>
                                  <span className="text-[10px] text-text-muted font-mono">
                                    {new Date(res.lastSubmittedTime || res.createTime).toLocaleDateString()}
                                  </span>
                                </div>
                                
                                {selectedFormDetails?.items && (
                                  <div className="space-y-2">
                                    {selectedFormDetails.items
                                      .filter((item: any) => item.questionItem?.question)
                                      .slice(0, 3) // Show first 3 questions for compactness
                                      .map((item: any) => (
                                        <div key={item.itemId} className="space-y-1">
                                          <div className="text-[11px] text-text-muted">{item.title}</div>
                                          {renderAnswerText(res, item.questionItem.question.questionId)}
                                        </div>
                                      ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-crust/50 border border-black/10 dark:border-white/5 rounded-xl p-6 text-center space-y-4">
                      <Lock size={32} className="text-warning mx-auto" />
                      <div>
                        <h4 className="font-bold text-sm text-text-main">API Sync Suspended</h4>
                        <p className="text-xs text-text-muted leading-relaxed">
                          To view form items structure, responses count, and real-time answer payloads from Google, please link your Google account above.
                        </p>
                      </div>
                      <button
                        onClick={handleConnectGoogle}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 bg-warning text-black font-black text-xs uppercase tracking-wider rounded-lg hover:bg-warning/90 transition-colors"
                      >
                        Authorize Api
                      </button>
                    </div>
                  )}
                </div>

                <div className="border-t border-black/10 dark:border-white/5 pt-4 mt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-xs text-text-muted">Registered by {selectedForm.createdBy}</span>
                    </div>
                    
                    <button
                      onClick={() => handleSelectForm(selectedForm)}
                      disabled={!googleToken || loadingDetails}
                      className="inline-flex items-center gap-1.5 text-xs text-warning hover:underline disabled:opacity-50"
                    >
                      <RefreshCw size={12} className={loadingDetails ? 'animate-spin' : ''} />
                      Sync API
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
