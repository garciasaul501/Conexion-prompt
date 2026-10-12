import React, { useState, useMemo } from 'react';
import {
  Search,
  Sparkles,
  Bookmark,
  CheckCircle2,
  SlidersHorizontal,
  Flame,
  Wand2,
  Zap,
  FileDown,
  Eye,
  EyeOff,
  Lock,
  Unlock,
} from 'lucide-react';
import { PromptCategory, Prompt, UserSubscription } from '../types';
import { PromptCard } from './PromptCard';
import { PromptIdeaModal } from './PromptIdeaModal';
import { downloadPromptsCatalogPdf } from '../utils/pdfExport';

interface PromptGalleryProps {
  categories: PromptCategory[];
  prompts: Prompt[];
  savedPromptIds: string[];
  onToggleSave: (promptId: string) => void;
  onExecutePrompt: (prompt: Prompt) => void;
  subscription: UserSubscription;
  onUpgradeClick: () => void;
  onOpenUnlockModal?: () => void;
  onAddPromptToLibrary: (prompt: Prompt) => void;
}

export const PromptGallery: React.FC<PromptGalleryProps> = ({
  categories,
  prompts,
  savedPromptIds,
  onToggleSave,
  onExecutePrompt,
  subscription,
  onUpgradeClick,
  onOpenUnlockModal,
  onAddPromptToLibrary,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('cat-all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pricingFilter, setPricingFilter] = useState<'all' | 'free' | 'pro'>('all');
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [onlySaved, setOnlySaved] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'uses' | 'rating' | 'newest'>('uses');
  const [isIdeaModalOpen, setIsIdeaModalOpen] = useState<boolean>(false);
  const [expandAllPrompts, setExpandAllPrompts] = useState<boolean>(false);

  const isProUser = subscription.planType === 'pro' || subscription.planType === 'enterprise';
  const remainingCredits = Math.max(0, subscription.monthlyPromptQuota - subscription.usedPromptsThisMonth);

  const handleCardExecute = (prompt: Prompt) => {
    if (prompt.isPremium && !isProUser) {
      if (onOpenUnlockModal) {
        onOpenUnlockModal();
      } else {
        onUpgradeClick();
      }
      return;
    }
    onExecutePrompt(prompt);
  };

  const filteredPrompts = useMemo(() => {
    return prompts
      .filter((p) => {
        if (selectedCategoryId !== 'cat-all' && p.categoryId !== selectedCategoryId) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchTags = p.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchTags) return false;
        }
        if (pricingFilter === 'free' && p.isPremium) return false;
        if (pricingFilter === 'pro' && !p.isPremium) return false;
        if (modelFilter !== 'all' && p.recommendedModel !== modelFilter) return false;
        if (onlySaved && !savedPromptIds.includes(p.id)) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'uses') return b.usesCount - a.usesCount;
        if (sortBy === 'rating') return b.rating - a.rating;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [prompts, selectedCategoryId, searchQuery, pricingFilter, modelFilter, onlySaved, sortBy, savedPromptIds]);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Hero Banner / Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50/80 via-white to-amber-50/60 border border-slate-200 p-8 sm:p-10 shadow-sm">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Biblioteca & Generador de Prompts con IA</span>
            </div>

            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>{isProUser ? 'Suscripción PRO Activa' : `Empieza Gratis: ${remainingCredits} de 10 créditos disponibles`}</span>
            </div>

            {!isProUser && (
              <button
                onClick={onUpgradeClick}
                className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                title="Ver descuento exclusivo con Whop @saulmente"
              >
                <span>🎁 40% OFF con Whop @saulmente en PayPal</span>
              </button>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Encuentra, visualiza y descarga <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-600 via-sky-600 to-amber-600 bg-clip-text text-transparent">
              Prompts Avanzados en PDF
            </span>
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Explora todas las plantillas de prompts completas, pruébalas en vivo con Inteligencia Artificial o descárgalas directamente en formato PDF listas para tus clientes y proyectos.
          </p>

          {/* MAIN CTA BUTTONS */}
          <div className="pt-2 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
            <button
              onClick={() => setIsIdeaModalOpen(true)}
              className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-sm shadow-md shadow-amber-400/20 flex items-center justify-center space-x-2.5 transition-all transform hover:-translate-y-0.5 border border-amber-400"
            >
              <Wand2 className="w-5 h-5 text-slate-950 fill-current" />
              <span>✨ Crear Prompt desde una Idea con IA</span>
            </button>

            <button
              onClick={() => downloadPromptsCatalogPdf(filteredPrompts, 'Catalogo Completo de Prompts IA')}
              className="py-3.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md shadow-indigo-500/20 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5"
            >
              <FileDown className="w-5 h-5 text-amber-300" />
              <span>Bajar Todos los Prompts en PDF ({filteredPrompts.length})</span>
            </button>

            <button
              onClick={() => setExpandAllPrompts(!expandAllPrompts)}
              className="py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-300 shadow-xs flex items-center justify-center space-x-2 transition-all"
            >
              {expandAllPrompts ? (
                <>
                  <EyeOff className="w-4 h-4 text-indigo-600" />
                  <span>Contraer Prompts</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 text-indigo-600" />
                  <span>Ver Todos los Prompts Abiertos</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Stats */}
          <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-600 font-medium border-t border-slate-200">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{prompts.length}+ Prompts Desbloqueados para Ver y Bajar en PDF</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Soporte Gemini 3.7 Flash, GPT-4o y Claude</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Exportación Directa a PDF Profesional</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título, palabra clave o #tag (ej: SEO, TypeScript, Copywriting)..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm shadow-xs transition-all"
            />
          </div>

          {/* Secondary Controls */}
          <div className="flex flex-wrap items-center gap-2">

            {/* Toggle View All Prompts */}
            <button
              onClick={() => setExpandAllPrompts(!expandAllPrompts)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all shadow-xs ${
                expandAllPrompts
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white hover:bg-slate-50 text-indigo-700 border-indigo-200'
              }`}
            >
              {expandAllPrompts ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{expandAllPrompts ? 'Ocultar Textos' : 'Ver Prompts'}</span>
            </button>

            {/* Download Filtered PDF */}
            <button
              onClick={() => downloadPromptsCatalogPdf(filteredPrompts, 'Catalogo de Prompts IA')}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all shadow-xs"
            >
              <FileDown className="w-3.5 h-3.5 text-amber-600" />
              <span>Bajar en PDF</span>
            </button>
            
            {/* Filter Pro / Gratis */}
            <div className="flex items-center bg-white border border-slate-200 p-1 rounded-xl text-xs font-semibold shadow-xs">
              <button
                onClick={() => setPricingFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  pricingFilter === 'all' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setPricingFilter('free')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  pricingFilter === 'free' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Gratis
              </button>
              <button
                onClick={() => setPricingFilter('pro')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  pricingFilter === 'pro' ? 'bg-amber-50 text-amber-800 border border-amber-300 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                PRO
              </button>
            </div>

            {/* Model Selector */}
            <select
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
              className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 shadow-xs"
            >
              <option value="all">Todos los Modelos IA</option>
              <option value="gemini-3.7-flash">Google Gemini 3.7 Flash</option>
              <option value="gpt-4o">OpenAI GPT-4o</option>
              <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
            </select>

            {/* Sort Menu */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 shadow-xs"
            >
              <option value="uses">Más Utilizados</option>
              <option value="rating">Mejor Valorados</option>
              <option value="newest">Más Recientes</option>
            </select>

            {/* Only Saved Toggle */}
            <button
              onClick={() => setOnlySaved(!onlySaved)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors shadow-xs ${
                onlySaved
                  ? 'bg-amber-50 text-amber-700 border-amber-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${onlySaved ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span>Favoritos ({savedPromptIds.length})</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-xs ${
                selectedCategoryId === cat.id
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <span>{cat.name}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                selectedCategoryId === cat.id ? 'bg-indigo-700 text-amber-300' : 'bg-slate-100 text-slate-600'
              }`}>
                {cat.id === 'cat-all' ? prompts.length : prompts.filter((p) => p.categoryId === cat.id).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Locked Tool Callout for Free Users */}
      {!isProUser && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 text-slate-950 rounded-2xl p-4 shadow-sm border border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-slate-950 text-amber-300 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider block">Herramienta Bloqueada en Modo Gratuito</span>
              <span className="text-xs font-semibold text-slate-900">
                Los prompts PRO y la ejecución avanzada con Gemini 3.8 Flash están bloqueados hasta tener la suscripción o comprar con PayPal (garciasaul@hotmail.com).
              </span>
            </div>
          </div>
          <button
            onClick={onOpenUnlockModal || onUpgradeClick}
            className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-black text-xs flex items-center space-x-1.5 shrink-0 shadow-sm cursor-pointer transition-transform hover:scale-105"
          >
            <Unlock className="w-4 h-4 text-amber-300" />
            <span>Desbloquear Herramienta</span>
          </button>
        </div>
      )}

      {/* Prompts Grid */}
      {filteredPrompts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              isSaved={savedPromptIds.includes(prompt.id)}
              onToggleSave={onToggleSave}
              onExecute={handleCardExecute}
              isProUser={isProUser}
              defaultExpanded={expandAllPrompts}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <SlidersHorizontal className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No se encontraron prompts que coincidan</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            ¿No encuentras el prompt que buscas? Puedes crear uno instantáneamente a partir de tu idea con la Inteligencia Artificial.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsIdeaModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-extrabold flex items-center space-x-2 shadow-sm"
            >
              <Wand2 className="w-4 h-4 fill-current" />
              <span>Crear Prompt de este Tema con IA</span>
            </button>
            <button
              onClick={() => {
                setSelectedCategoryId('cat-all');
                setSearchQuery('');
                setPricingFilter('all');
                setModelFilter('all');
                setOnlySaved(false);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              Restablecer Filtros
            </button>
          </div>
        </div>
      )}

      {/* Bottom Action Banner: View All Prompts + Download Full PDF + Whop Subscription */}
      <div className="bg-gradient-to-r from-amber-50 via-indigo-50/60 to-white border border-amber-300 rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h4 className="text-base font-extrabold text-slate-900">
              Visualiza Todos los Prompts y Descarga el Catálogo Completo en PDF
            </h4>
            <p className="text-xs text-slate-600 mt-1">
              Descarga todas las plantillas listas para imprimir o compartir en PDF, o suscríbete con Conexión Whop para ejecuciones ilimitadas.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <button
            onClick={() => setExpandAllPrompts(!expandAllPrompts)}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 font-bold text-xs shadow-xs flex items-center space-x-1.5 transition-all"
          >
            {expandAllPrompts ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{expandAllPrompts ? 'Ocultar Prompts' : 'Ver Todos los Prompts'}</span>
          </button>

          <button
            onClick={() => downloadPromptsCatalogPdf(prompts, 'Catalogo Oficial Completo de Prompts IA')}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-amber-300" />
            <span>Bajar Catálogo Completo en PDF</span>
          </button>

          <a
            href="https://whop.com/woop-conexion/"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-400/20 transition-all text-center border border-amber-400"
          >
            Suscribir con Conexión Whop
          </a>
        </div>
      </div>

      {/* Idea-to-Prompt AI Creator Modal */}
      <PromptIdeaModal
        isOpen={isIdeaModalOpen}
        onClose={() => setIsIdeaModalOpen(false)}
        onExecutePrompt={onExecutePrompt}
        onAddPromptToLibrary={onAddPromptToLibrary}
      />

    </div>
  );
};
