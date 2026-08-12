import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, 
  Download, FileText, CheckCircle2, Globe, Maximize2, Minimize2,
  RotateCw, RefreshCw
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
    uploadedBy?: string;
    uploaderName?: string;
    uploaderRole?: string;
    uploaderPhoto?: string;
    volunteerId?: string;
  };
  startMaximized?: boolean;
}

export function PdfViewerModal({ isOpen, onClose, resource }: PdfViewerModalProps) {
  const [resolvedPdfUrl, setResolvedPdfUrl] = useState<string>('');
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pdfPage, setPdfPage] = useState<number>(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pdfZoom, setPdfZoom] = useState<string>('page-fit'); // 'page-fit' | 'page-width' | percentage
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [pdfLoading, setPdfLoading] = useState<boolean>(true);
  const [pdfError, setPdfError] = useState<string>('');
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [containerWidthForResize, setContainerWidthForResize] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Keyboard navigation & Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        setPdfPage(prev => Math.max(1, prev - 1));
      } else if (e.key === 'ArrowRight') {
        if (numPages) {
          setPdfPage(prev => Math.min(numPages, prev + 1));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, numPages, onClose]);

  // Set up container ResizeObserver for responsive page width / fit canvas scales
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidthForResize(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isOpen]);

  // Resolve PDF local blob or standard URL
  useEffect(() => {
    let active = true;
    let objectUrl = '';

    const resolve = async () => {
      if (!resource || (!resource.pdfUrl && !resource)) {
        setResolvedPdfUrl('');
        return;
      }

      const targetUrl = resource.pdfUrl || 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEive7NdnBis_kLLqaN2d8q37014tEMd2ftmqFkeCIiLjxkG2sDfip5VQldxh9izJC-KTsD4ZfXnILFWEOG2jmJkwdKww8-jqW-2jAqpTsv4AOE47MkqpHHibGcBN4GhPqN3OIF1xxIbs0KQLRgxfk2XJRsdlQyY_JqqRnajm2-pB1xoiZN4BnkdtDc9ICU/s1500/1779707899.png';

      if (targetUrl.startsWith('localdb://')) {
        const url = await resolveFileUrl(targetUrl);
        if (active) {
          setResolvedPdfUrl(url);
          objectUrl = url;
        }
      } else {
        if (active) {
          setResolvedPdfUrl(targetUrl);
        }
      }
    };

    if (isOpen) {
      resolve();
    }

    return () => {
      active = false;
      if (objectUrl && objectUrl.startsWith('blob:')) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [resource?.pdfUrl, isOpen]);

  // Load and initialize PDF.js engine
  useEffect(() => {
    if (!isOpen || !resolvedPdfUrl) {
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
                const workerUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                const workerResponse = await fetch(workerUrl);
                const workerCode = await workerResponse.text();
                const workerBlob = new Blob([workerCode], { type: 'application/javascript' });
                const workerBlobUrl = URL.createObjectURL(workerBlob);
                pdfjs.GlobalWorkerOptions.workerSrc = workerBlobUrl;
              } catch (workerErr) {
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
          const response = await fetch(resolvedPdfUrl);
          if (!response.ok) {
            throw new Error(`HTTP status: ${response.status}`);
          }
          const arrayBuffer = await response.arrayBuffer();
          loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
        } catch (fetchErr) {
          loadingTask = pdfjsLib.getDocument(resolvedPdfUrl);
        }

        const pdf = await loadingTask.promise;
        if (!active) return;

        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setPdfPage(1);
        setPdfLoading(false);
      } catch (err: any) {
        if (active) {
          setPdfError(err.message || 'Standard PDF viewer mode active.');
          setPdfLoading(false);
        }
      }
    };

    initPdf();

    return () => {
      active = false;
    };
  }, [resolvedPdfUrl, isOpen]);

  // Render current page onto Canvas
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || !isOpen) return;

    let active = true;
    let renderTask: any = null;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(pdfPage || 1);
        if (!active || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const containerWidth = containerRef.current?.clientWidth || window.innerWidth || 800;
        const containerHeight = containerRef.current?.clientHeight || window.innerHeight - 80 || 600;

        const unscaledViewport = page.getViewport({ scale: 1.0 });
        let scale = 1.0;

        if (pdfZoom === 'page-width') {
          scale = (containerWidth - 32) / unscaledViewport.width;
        } else if (pdfZoom === 'page-fit') {
          const scaleHeight = (containerHeight - 32) / unscaledViewport.height;
          const scaleWidth = (containerWidth - 32) / unscaledViewport.width;
          scale = Math.min(scaleHeight, scaleWidth);
        } else {
          scale = (zoomLevel / 100) * ((containerWidth - 32) / unscaledViewport.width);
        }

        scale = Math.max(0.2, Math.min(scale, 4.0));

        const viewport = page.getViewport({ scale });
        const pixelRatio = window.devicePixelRatio || 1;
        canvas.width = viewport.width * pixelRatio;
        canvas.height = viewport.height * pixelRatio;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        ctx.save();
        ctx.scale(pixelRatio, pixelRatio);
        ctx.clearRect(0, 0, viewport.width, viewport.height);

        renderTask = page.render({
          canvasContext: ctx,
          viewport: viewport
        });
        await renderTask.promise;
      } catch (err: any) {
        console.warn('Canvas page render:', err);
      }
    };

    const timer = setTimeout(() => {
      renderPage();
    }, 30);

    return () => {
      active = false;
      clearTimeout(timer);
      if (renderTask && typeof renderTask.cancel === 'function') {
        renderTask.cancel();
      }
    };
  }, [pdfDoc, pdfPage, pdfZoom, zoomLevel, containerWidthForResize, isOpen]);

  const handleDownload = async () => {
    if (!resource) return;
    const downloadUrl = resolvedPdfUrl || resource.pdfUrl;
    if (!downloadUrl) return;

    try {
      let url = downloadUrl;
      let isBlob = false;

      if (downloadUrl.startsWith('localdb://')) {
        const blob = await localFileStore.getFile(downloadUrl);
        if (blob) {
          url = URL.createObjectURL(blob);
          isBlob = true;
        }
      } else if (url.startsWith('/') || url.startsWith(window.location.origin)) {
        try {
          const res = await fetch(url);
          if (res.ok) {
            const blob = await res.blob();
            url = URL.createObjectURL(blob);
            isBlob = true;
          }
        } catch (_) {}
      }

      const link = document.createElement('a');
      link.href = url;
      link.download = `${(resource.title || 'Document').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
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
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      window.open(downloadUrl, '_blank');
    }
  };

  const handleZoomIn = () => {
    setPdfZoom('custom');
    setZoomLevel(prev => Math.min(300, prev + 15));
  };

  const handleZoomOut = () => {
    setPdfZoom('custom');
    setZoomLevel(prev => Math.max(40, prev - 15));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-[#070A10] text-slate-100 flex flex-col font-sans overflow-hidden select-none">
        
        {/* Minimalistic Device Full-Width Header Bar */}
        <header className="h-14 sm:h-16 bg-[#0E131F] border-b border-white/10 px-3 sm:px-6 flex items-center justify-between gap-3 shrink-0 z-10 shadow-md">
          
          {/* Left: Document Info */}
          <div className="flex items-center gap-2.5 min-w-0 max-w-[30%] sm:max-w-[35%]">
            <div className="p-2 bg-amber-500/15 rounded-lg text-amber-400 shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-black text-white truncate leading-tight">
                {resource.title}
              </h1>
              <p className="text-[10px] text-slate-400 truncate hidden sm:block">
                {resource.author ? `By ${resource.author}` : resource.category || 'Forensic Document'}
              </p>
            </div>
          </div>

          {/* Center: Minimalist Page Navigation Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3 bg-[#161C2C] border border-white/10 px-2 sm:px-3 py-1 rounded-xl shadow-inner">
            <button
              onClick={() => setPdfPage(prev => Math.max(1, prev - 1))}
              disabled={pdfPage <= 1}
              className="p-1.5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
              title="Previous Page (Left Arrow)"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="flex items-center gap-1 text-xs font-mono font-bold">
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
                className="w-10 sm:w-12 bg-[#0E131F] border border-white/10 rounded-md py-0.5 text-center text-xs font-mono font-bold text-amber-400 outline-none focus:border-amber-400/50"
              />
              <span className="text-slate-400 text-[11px]">
                / {numPages || '--'}
              </span>
            </div>

            <button
              onClick={() => setPdfPage(prev => (typeof prev === 'number' ? Math.min(numPages || Infinity, prev + 1) : 1))}
              disabled={numPages ? pdfPage >= numPages : false}
              className="p-1.5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
              title="Next Page (Right Arrow)"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Right: Zoom & Download & Close */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center gap-1 bg-[#161C2C] border border-white/10 p-1 rounded-xl">
              <button
                onClick={handleZoomOut}
                className="p-1 hover:bg-white/10 text-slate-300 hover:text-white rounded transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setPdfZoom('page-fit')}
                className={cn(
                  "px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded transition-all cursor-pointer",
                  pdfZoom === 'page-fit' ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"
                )}
                title="Fit to Page height"
              >
                Fit
              </button>

              <button
                onClick={() => setPdfZoom('page-width')}
                className={cn(
                  "px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded transition-all cursor-pointer",
                  pdfZoom === 'page-width' ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"
                )}
                title="Fit to Page width"
              >
                Width
              </button>

              <button
                onClick={handleZoomIn}
                className="p-1 hover:bg-white/10 text-slate-300 hover:text-white rounded transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Download PDF Button */}
            <button
              onClick={handleDownload}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm",
                downloadSuccess 
                  ? "bg-emerald-500 text-white" 
                  : "bg-amber-500 hover:bg-amber-400 text-slate-950"
              )}
              title="Download PDF document"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-black">
                {downloadSuccess ? 'Downloaded' : 'Download'}
              </span>
            </button>

            {/* Close Fullscreen Modal Button */}
            <button
              onClick={onClose}
              className="p-2 bg-[#161C2C] hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-white/10 hover:border-red-500/30 rounded-xl transition-all cursor-pointer ml-1"
              title="Close PDF Viewer (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </header>

        {/* Full-Screen PDF Document Canvas View */}
        <main 
          ref={containerRef}
          className="flex-1 bg-[#05080E] overflow-auto flex justify-center items-center p-2 sm:p-4 relative"
        >
          {pdfLoading ? (
            <div className="flex flex-col items-center justify-center text-slate-400 gap-3">
              <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <div className="text-center">
                <p className="font-bold text-white text-xs uppercase tracking-wider">Loading PDF Document...</p>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">Rendering high-resolution vector pages</p>
              </div>
            </div>
          ) : pdfError ? (
            /* Fallback Browser Iframe Player if Canvas rendering isn't available */
            <div className="w-full h-full flex flex-col items-center justify-center relative">
              <iframe
                src={resolvedPdfUrl.startsWith('blob:') ? resolvedPdfUrl : `https://docs.google.com/viewer?url=${encodeURIComponent(resolvedPdfUrl)}&embedded=true`}
                className="w-full h-full border-0 rounded-lg bg-white"
                title={resource.title}
              />
            </div>
          ) : resolvedPdfUrl ? (
            /* High Performance Direct PDF Canvas View */
            <div className="my-auto max-w-full max-h-full flex items-center justify-center">
              <canvas 
                ref={canvasRef} 
                className="shadow-2xl rounded-sm bg-white max-w-full"
              />
            </div>
          ) : (
            <div className="text-slate-400 text-xs font-mono">No PDF source provided.</div>
          )}
        </main>

      </div>
    </AnimatePresence>
  );
}
