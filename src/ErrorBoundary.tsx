import React, { Component, ErrorInfo, ReactNode } from "react";
import { RefreshCw, AlertTriangle, Home } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught application error:", error, errorInfo);

    const errorStr = error?.toString() || '';
    const isChunkOrMimeError = 
      errorStr.includes('valid JavaScript MIME type') ||
      errorStr.includes('text/html') ||
      errorStr.includes('Failed to fetch dynamically imported module') ||
      errorStr.includes('Loading chunk') ||
      errorStr.includes('Importing a module script failed');

    if (isChunkOrMimeError) {
      const lastReload = sessionStorage.getItem('chunk_error_auto_reload');
      const now = Date.now();
      // Reload automatically if not reloaded within the last 15 seconds
      if (!lastReload || (now - parseInt(lastReload, 10)) > 15000) {
        sessionStorage.setItem('chunk_error_auto_reload', now.toString());
        console.warn("Detected chunk / MIME type error. Reloading page for updated asset bundle...");
        window.location.reload();
      }
    }
  }

  private handleReload = () => {
    try {
      sessionStorage.removeItem('chunk_error_auto_reload');
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
    } catch (e) {
      console.warn("Could not clear cache:", e);
    }
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      const errorStr = this.state.error?.toString() || '';
      const isMimeOrChunkError = 
        errorStr.includes('valid JavaScript MIME type') ||
        errorStr.includes('text/html') ||
        errorStr.includes('Failed to fetch dynamically imported module') ||
        errorStr.includes('Loading chunk') ||
        errorStr.includes('Importing a module script failed');

      return (
        <div className="min-h-screen bg-[#0d0f12] text-white flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-[#16191f] border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <AlertTriangle size={28} />
            </div>

            <h2 className="text-xl font-bold tracking-tight mb-2 text-white font-heading">
              {isMimeOrChunkError ? "Platform Version Updated" : "Application Notice"}
            </h2>

            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              {isMimeOrChunkError 
                ? "A new version of ForenClue has been deployed. Please reload to sync the latest system scripts and features."
                : "A temporary layout or state error occurred. Reloading the page will restore normal operation."}
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReload}
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 text-xs uppercase tracking-wider cursor-pointer"
              >
                <RefreshCw size={16} />
                <span>Reload Platform</span>
              </button>

              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = '/';
                }}
                className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <Home size={15} />
                <span>Return to Home</span>
              </button>
            </div>

            {process.env.NODE_ENV !== 'production' && (
              <div className="mt-6 pt-4 border-t border-white/10 text-left">
                <p className="text-[10px] font-mono text-amber-300/80 break-all bg-black/50 p-3 rounded-lg border border-amber-500/20">
                  {errorStr}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
