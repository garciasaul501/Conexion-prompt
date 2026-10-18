import React from 'react';
import {
  Sparkles,
  Key,
  Compass,
  Wand2,
  Bookmark,
  FileDown,
  Lock,
  Unlock,
} from 'lucide-react';
import { UserSubscription, Prompt } from '../types';
import { downloadPromptsCatalogPdf } from '../utils/pdfExport';

export type NavTabType =
  | 'gallery'
  | 'optimizer'
  | 'idea-generator'
  | 'my-prompts'
  | 'pricing'
  | 'paypal-verify'
  | 'integrations'
  | 'architecture';

interface NavbarProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  subscription: UserSubscription;
  prompts?: Prompt[];
  onOpenUnlockModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  subscription,
  prompts = [],
  onOpenUnlockModal,
}) => {
  const isEnterprise = subscription.planType === 'enterprise' || subscription.planType === '1000';
  const isPro = subscription.planType !== 'free';

  const handleDownloadAllPdf = () => {
    setActiveTab('gallery');
    if (prompts.length > 0) {
      downloadPromptsCatalogPdf(prompts, 'Catalogo Completo de Prompts Profesionales IA');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-2.5 cursor-pointer shrink-0" onClick={() => setActiveTab('pricing')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 p-0.5 shadow-md shadow-amber-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <span className="font-black text-base sm:text-lg tracking-tight text-slate-900">
            Conexión <span className="text-amber-500">Prompts</span>
          </span>
        </div>

        {/* Center/Primary CTA: Large Golden 'Planes y Suscribirte' Button + Concise Nav */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* THE BIG GOLDEN BUTTON - Short & Attractive */}
          <button
            onClick={() => setActiveTab('pricing')}
            className={`inline-flex items-center space-x-2 px-5 py-2.5 sm:px-7 sm:py-3 rounded-2xl text-sm sm:text-base font-black tracking-tight transition-all transform hover:scale-105 active:scale-95 cursor-pointer ${
              activeTab === 'pricing'
                ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 shadow-xl shadow-amber-400/40 ring-2 ring-amber-500 border border-yellow-200'
                : 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-lg shadow-amber-400/30 border border-amber-400'
            }`}
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 fill-current shrink-0" />
            <span>Planes y Suscribirte</span>
          </button>

          {/* Clean & Short Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'gallery'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Prompts</span>
            </button>

            <button
              onClick={() => setActiveTab('optimizer')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'optimizer'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Optimizador</span>
            </button>

            <button
              onClick={() => setActiveTab('idea-generator')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'idea-generator'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Creador IA</span>
            </button>

            <button
              onClick={() => setActiveTab('my-prompts')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'my-prompts'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Mis Prompts</span>
            </button>

            <button
              onClick={() => setActiveTab('integrations')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'integrations'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>API</span>
            </button>
          </nav>
        </div>

        {/* Right Side: Minimal & Clean Status */}
        <div className="hidden sm:flex items-center space-x-2">
          <button
            onClick={handleDownloadAllPdf}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
            title="Descargar catálogo de prompts en PDF"
          >
            <FileDown className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>PDF</span>
          </button>

          <button
            onClick={onOpenUnlockModal}
            className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isPro || isEnterprise
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-slate-900 hover:bg-slate-800 text-amber-300'
            }`}
          >
            {isPro || isEnterprise ? (
              <>
                <Unlock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Activo</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Acceso</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Mobile Bar Navigation */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-200 bg-white py-2 text-xs font-medium text-slate-600 overflow-x-auto px-2">
        <button
          onClick={() => setActiveTab('pricing')}
          className={`flex items-center space-x-1 px-3.5 py-1.5 rounded-xl font-black shadow-xs ${
            activeTab === 'pricing'
              ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 border border-amber-400'
              : 'bg-amber-100 text-slate-950 border border-amber-300'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-slate-950 fill-current" />
          <span>Planes y Suscribirte</span>
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex flex-col items-center space-y-0.5 px-2 py-1 rounded-lg ${
            activeTab === 'gallery' ? 'text-indigo-600 font-bold bg-indigo-50/70' : ''
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Prompts</span>
        </button>
        <button
          onClick={() => setActiveTab('optimizer')}
          className={`flex flex-col items-center space-y-0.5 px-2 py-1 rounded-lg ${
            activeTab === 'optimizer' ? 'text-amber-600 font-bold bg-amber-50/70' : ''
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Optimizador</span>
        </button>
        <button
          onClick={() => setActiveTab('my-prompts')}
          className={`flex flex-col items-center space-y-0.5 px-2 py-1 rounded-lg ${
            activeTab === 'my-prompts' ? 'text-indigo-600 font-bold bg-indigo-50/70' : ''
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Mis Prompts</span>
        </button>
      </div>
    </header>
  );
};
