import React from 'react';
import {
  Sparkles,
  CreditCard,
  Key,
  Compass,
  ShieldCheck,
  Zap,
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
  const isEnterprise = subscription.planType === 'enterprise';
  const isPro = subscription.planType === 'pro';
  const remainingCredits = Math.max(0, subscription.monthlyPromptQuota - subscription.usedPromptsThisMonth);

  const getCreditsDisplay = () => {
    if (isEnterprise) return 'Ilimitado (Enterprise)';
    if (isPro) return `${remainingCredits} / 50 Créditos (PRO)`;
    return `${remainingCredits} / 10 Créditos Gratis`;
  };

  const handleDownloadAllPdf = () => {
    setActiveTab('gallery');
    if (prompts.length > 0) {
      downloadPromptsCatalogPdf(prompts, 'Catalogo Completo de Prompts Profesionales IA');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer shrink-0" onClick={() => setActiveTab('pricing')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 via-amber-300 to-indigo-600 p-0.5 shadow-md shadow-indigo-500/10 flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 drop-shadow-xs">
                Conexión <span className="text-amber-500">Prompts</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
                Suscribirse Ya
              </span>
            </div>
          </div>
        </div>

        {/* Primary Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center space-x-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
          {/* Main Landing Tab: Planes & Suscribirse Ya */}
          <button
            onClick={() => setActiveTab('pricing')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${
              activeTab === 'pricing'
                ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 shadow-md font-black border border-amber-400'
                : 'text-amber-900 bg-amber-100/90 hover:bg-amber-200 border border-amber-300 shadow-xs'
            }`}
          >
            <CreditCard className="w-4 h-4 text-slate-950" />
            <span>⭐ Planes & Suscribirse</span>
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'gallery'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <Compass className="w-4 h-4 text-indigo-500" />
            <span>Ver Prompts</span>
          </button>

          <button
            onClick={() => setActiveTab('optimizer')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'optimizer'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Optimizador IA ✨</span>
          </button>

          <button
            onClick={() => setActiveTab('idea-generator')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'idea-generator'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <Wand2 className="w-4 h-4 text-indigo-500" />
            <span>Creador IA</span>
          </button>

          <button
            onClick={() => setActiveTab('my-prompts')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'my-prompts'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <Bookmark className="w-4 h-4 text-indigo-500" />
            <span>Mis Prompts</span>
          </button>

          <button
            onClick={handleDownloadAllPdf}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all"
            title="Descargar todos los prompts en formato PDF"
          >
            <FileDown className="w-4 h-4 text-indigo-600" />
            <span>Bajar PDF</span>
          </button>

          <button
            onClick={() => setActiveTab('integrations')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'integrations'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <Key className="w-4 h-4 text-indigo-500" />
            <span>API Keys</span>
          </button>
        </nav>

        {/* User Status / Credits CTA */}
        <div className="flex items-center space-x-2.5">
          {/* Quick PDF Button on Tablet/Mobile header */}
          <button
            onClick={handleDownloadAllPdf}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-xs transition-all cursor-pointer"
            title="Descargar catálogo de prompts en PDF"
          >
            <FileDown className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>Bajar PDF</span>
          </button>

          {/* Tool Lock/Unlock Button */}
          <button
            onClick={onOpenUnlockModal}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs ${
              isPro || isEnterprise
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 border border-amber-400 shadow-amber-400/20'
            }`}
            title={
              isPro || isEnterprise
                ? 'Herramienta 100% Desbloqueada - Gestionar'
                : 'Desbloquear la herramienta hasta tener suscripción o compra'
            }
          >
            {isPro || isEnterprise ? (
              <>
                <Unlock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="hidden sm:inline">Desbloqueada</span>
                <span className="sm:hidden">Pro</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                <span>Desbloquear</span>
              </>
            )}
          </button>

          {/* Credits Counter Pill */}
          <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-extrabold text-slate-700">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-current shrink-0" />
            <span>{getCreditsDisplay()}</span>
          </div>

          <a
            href="https://whop.com/@saulmente"
            target="_blank"
            rel="noopener noreferrer"
            className={`hidden sm:flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              isPro || isEnterprise
                ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                : 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 font-extrabold shadow-sm hover:from-amber-300 hover:to-amber-400 border-amber-400'
            }`}
            title="Conexión Whop @saulmente con descuento exclusivo"
          >
            {isPro || isEnterprise ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                <span className="uppercase tracking-wider">Plan {subscription.planType}</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-slate-950 fill-current" />
                <span>Whop @saulmente (-40% OFF)</span>
              </>
            )}
          </a>
        </div>

      </div>

      {/* Mobile Bar Navigation */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-200 bg-white py-2 text-xs font-medium text-slate-600 overflow-x-auto px-2">
        <button
          onClick={() => setActiveTab('pricing')}
          className={`flex flex-col items-center space-y-1 px-2.5 py-1 rounded-lg ${
            activeTab === 'pricing' ? 'text-amber-700 font-extrabold bg-amber-100 border border-amber-300' : 'text-slate-700 font-bold'
          }`}
        >
          <CreditCard className="w-4 h-4 text-amber-600" />
          <span>⭐ Planes</span>
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex flex-col items-center space-y-1 px-2 py-1 rounded-lg ${
            activeTab === 'gallery' ? 'text-indigo-600 font-bold bg-indigo-50/70' : ''
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Prompts</span>
        </button>
        <button
          onClick={() => setActiveTab('optimizer')}
          className={`flex flex-col items-center space-y-1 px-2 py-1 rounded-lg ${
            activeTab === 'optimizer' ? 'text-amber-600 font-bold bg-amber-50/70' : ''
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Optimizador</span>
        </button>
        <button
          onClick={() => setActiveTab('idea-generator')}
          className={`flex flex-col items-center space-y-1 px-2 py-1 rounded-lg ${
            activeTab === 'idea-generator' ? 'text-indigo-600 font-bold bg-indigo-50/70' : ''
          }`}
        >
          <Wand2 className="w-4 h-4 text-indigo-500" />
          <span>Creador</span>
        </button>
        <button
          onClick={() => setActiveTab('my-prompts')}
          className={`flex flex-col items-center space-y-1 px-2 py-1 rounded-lg ${
            activeTab === 'my-prompts' ? 'text-indigo-600 font-bold bg-indigo-50/70' : ''
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Guardados</span>
        </button>
        <button
          onClick={onOpenUnlockModal}
          className={`flex flex-col items-center space-y-1 px-2 py-1 rounded-lg ${
            isPro || isEnterprise ? 'text-emerald-700 font-bold bg-emerald-50' : 'text-amber-800 font-extrabold bg-amber-100 border border-amber-300'
          }`}
        >
          {isPro || isEnterprise ? <Unlock className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4 text-slate-950" />}
          <span>{isPro || isEnterprise ? 'Activo' : 'Desbloquear'}</span>
        </button>
      </div>
    </header>
  );
};
