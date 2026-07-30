import { Mail, MapPin, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { SEO } from "@/components/layout/SEO";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    
    setStatus('loading');
    setErrorMessage("");

    try {
      await addDoc(collection(db, 'contact_messages'), {
        ...formData,
        createdAt: serverTimestamp(),
        read: false
      });
      setStatus('success');
      setFormData({ name: "", email: "", message: "" });
    } catch (error: any) {
      console.error("Error submitting message:", error);
      setStatus('error');
      setErrorMessage(error.message || "Failed to send message. Please try again.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="py-20 px-4 max-w-7xl mx-auto">
      <SEO 
        title="Contact Forensic Education Support & Advisory"
        description="Reach out to ForenClue. Send your queries regarding forensic science certifications, institute partnerships, customized training, or handbook pre-orders."
        keywords="contact forenclue, forensic support portal, contact forensic advisory team, pune forensic institute"
        canonicalPath="/contact"
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Contact', path: '/contact' }
        ]}
        faqs={[
          { question: "How can I contact ForenClue support?", answer: "You can write to us directly at forenclue@gmail.com, or reach out via our official social communities on Telegram and Instagram." },
          { question: "Where is ForenClue located?", answer: "ForenClue is a premium digital forensic learning portal serving forensic students and university institutions globally, headquartered in India." }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <h1 className="text-4xl md:text-6xl font-heading font-black mb-6 uppercase tracking-tight text-warning">
            Contact Us
          </h1>
          <p className="text-xl text-text-muted mb-12">
            Have a question? We're here to help you on your forensic journey.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-surface p-6 border border-black/10 dark:border-white/5">
              <div className="p-4 bg-warning/10 text-warning rounded-full"><Mail size={24} /></div>
              <div>
                <p className="text-sm text-text-muted mb-1">Email Support</p>
                <p className="font-medium text-lg">forenclue@gmail.com</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-surface p-6 border border-black/10 dark:border-white/5">
              <div className="p-4 bg-warning/10 text-warning rounded-full"><MapPin size={24} /></div>
              <div>
                <p className="text-sm text-text-muted mb-1">Location</p>
                <p className="font-medium text-lg">Pune, Maharashtra, India</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface p-8 border border-black/10 dark:border-white/5 relative">
          <div className="absolute top-0 right-0 w-20 h-20 border-t border-r border-warning/30" />
          <h2 className="text-2xl font-bold font-heading mb-8">Send a Message</h2>
          
          {status === 'success' ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-6 rounded-xl flex flex-col items-center justify-center text-center space-y-4 h-[350px]">
              <CheckCircle2 size={48} className="text-emerald-500" />
              <div>
                <h3 className="text-xl font-bold mb-2">Message Sent Successfully!</h3>
                <p className="text-sm opacity-80">Thank you for reaching out. Our team will get back to you shortly.</p>
              </div>
              <button 
                onClick={() => setStatus('idle')}
                className="mt-4 px-6 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-500 text-sm font-bold uppercase tracking-wider rounded transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {status === 'error' && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded flex items-start gap-3 text-red-500 text-sm">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <p>{errorMessage}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-base border border-black/10 dark:border-white/10 px-4 py-3 text-text-main focus:border-warning focus:outline-none transition-colors" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-base border border-black/10 dark:border-white/10 px-4 py-3 text-text-main focus:border-warning focus:outline-none transition-colors" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Message</label>
                <textarea 
                  rows={4} 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full bg-base border border-black/10 dark:border-white/10 px-4 py-3 text-text-main focus:border-warning focus:outline-none transition-colors"
                ></textarea>
              </div>
              <button 
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-4 flex items-center justify-center gap-2 bg-warning text-crust font-black uppercase tracking-wider hover:bg-warning-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? (
                  <><Loader2 size={18} className="animate-spin" /> Sending...</>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
