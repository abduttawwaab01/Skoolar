'use client';

import { useEffect, useState, useCallback } from 'react';
import { School, Loader2 } from 'lucide-react';

interface PreloaderQuote {
  id: string;
  quote: string;
  author: string;
}

const DEFAULT_QUOTE: PreloaderQuote = {
  id: 'default',
  quote: 'Education is the passport to the future, for tomorrow belongs to those who prepare for it today.',
  author: 'Malcolm X',
};

export function GlobalPreloader() {
  const [quote, setQuote] = useState<PreloaderQuote>(DEFAULT_QUOTE);
  const [isFading, setIsFading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [hasStartedFetch, setHasStartedFetch] = useState(false);

  const handleComplete = useCallback(() => {
    setIsComplete(true);
  }, []);

  useEffect(() => {
    if (hasStartedFetch) return;
    setHasStartedFetch(true);

    const fetchQuote = async () => {
      try {
        const res = await fetch('/api/platform/preloader');
        const json = await res.json();
        if (json.success && json.data) {
          setQuote(json.data);
        }
      } catch {
        // Use default quote
      }
    };

    fetchQuote();

    // Exactly 3 seconds of display
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 2500);

    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      handleComplete();
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [handleComplete, hasStartedFetch]);

  if (isComplete) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-1000 ease-in-out ${
      isFading ? 'opacity-0' : 'opacity-100'
    }`}>
      {/* Premium Mesh Background */}
      <div className="absolute inset-0 bg-[#f8fafc] overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-emerald-100/50 blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] rounded-full bg-indigo-100/40 blur-[100px] animate-bounce" style={{ animationDuration: '8s' }} />
        <div className="absolute -bottom-[10%] left-[20%] w-[45%] h-[45%] rounded-full bg-teal-100/30 blur-[130px] animate-pulse" style={{ animationDuration: '6s' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Brand Mark */}
        <div className="flex flex-col items-center gap-6 mb-12">
          <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-indigo-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-2xl shadow-emerald-200/50 group">
            <School className="h-12 w-12 text-white animate-bounce-subtle" />
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic flex items-center gap-2">
              Skoolar
            </h1>
            <div className="flex items-center justify-center gap-2">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-gray-200" />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Premium Education Suite</p>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-gray-200" />
            </div>
          </div>
        </div>

        {/* High-Fidelity Spinner */}
        <div className="relative mb-12">
          <div className="w-16 h-16 border-[3px] border-emerald-100/50 rounded-full" />
          <div className="w-16 h-16 border-[3px] border-transparent border-t-indigo-600 rounded-full absolute top-0 left-0 animate-spin transition-all duration-700" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
          </div>
        </div>

        {/* Dynamic Quote with Author */}
        <div className="max-w-lg text-center px-8 animate-fade-in-up">
          <div className="relative">
            <span className="absolute -top-6 -left-4 text-6xl text-emerald-100/50 font-serif serif italic pointer-events-none select-none">&ldquo;</span>
            <blockquote className="text-gray-700 font-bold text-lg leading-relaxed mb-4 relative z-10">
              {quote.quote}
            </blockquote>
          </div>
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-4 bg-emerald-200" />
            <cite className="text-indigo-600 text-xs font-black uppercase tracking-[0.2em] not-italic">
              {quote.author}
            </cite>
            <div className="h-px w-4 bg-emerald-200" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); filter: blur(4px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}