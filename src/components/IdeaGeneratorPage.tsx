import React, { useState } from 'react';
import { Wand2, Sparkles, RefreshCw, Check, Copy, Bookmark, Zap, Lightbulb, Cpu, Layers, ArrowRight, FileDown, Lock, Unlock } from 'lucide-react';
import { Prompt, UserSubscription } from '../types';
import { downloadPromptAsPdf } from '../utils/pdfExport';

interface IdeaGeneratorPageProps {
  onExecutePrompt: (prompt: Prompt) => void;
  onAddPromptToLibrary: (prompt: Prompt) => void;
  onNavigateToGallery: () => void;
  subscription: UserSubscription;
  onUpgradeClick: () => void;
  onOpenUnlockModal?: () => void;
}

const SUGGESTED_IDEAS = [
  'Generador de Guiones Virales para TikTok & Instagram Reels',
  'Auditoría y Refactorización de Código TypeScript / React',
  'Estrategia de Ventas B2B y Secuencia de Cold Emails',
  'Generador de Contratos Freelance y Cláusulas de Confidencialidad',
  'Analizador de Reseñas de Clientes y Extractor de Puntos de Dolor',
  'Post de LinkedIn con Hook Impactante y Storytelling',
];

export const IdeaGeneratorPage: React.FC<IdeaGeneratorPageProps> = ({
  onExecutePrompt,
  onAddPromptToLibrary,
  onNavigateToGallery,
  subscription,
  onUpgradeClick,
  onOpenUnlockModal,
}) => {
  const [ideaInput, setIdeaInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<Prompt | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedToLibrary, setSavedToLibrary] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  const isProUser = subscription.planType === 'pro' || subscription.planType === 'enterprise';

  const handleGenerate = async (customIdea?: string) => {
    if (!isProUser) {
      if (onOpenUnlockModal) {
        onOpenUnlockModal();
      } else {
        onUpgradeClick();
      }
      return;
    }

    const finalIdea = customIdea || ideaInput;
    if (!finalIdea.trim()) return;

    setIsGenerating(true);
    setErrorMsg(null);
    setSavedToLibrary(false);

    try {
      const response = await fetch('/api/generate-prompt-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: finalIdea }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error al comunicarse con la IA');
      }

      setGeneratedPrompt(data.prompt);
      onAddPromptToLibrary(data.prompt);
    } catch (err: any) {
      console.error('Error generating prompt:', err);
      setErrorMsg(err.message || 'Ocurrió un error al generar el prompt. Intenta de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePrompt = () => {
    if (!generatedPrompt) return;
    onAddPromptToLibrary(generatedPrompt);
    setSavedToLibrary(true);
  };

  const handleExecuteNow = () => {
    if (!generatedPrompt) return;
    if (!savedToLibrary) {
      onAddPromptToLibrary(generatedPrompt);
    }
    onExecutePrompt(generatedPrompt);
  };

  const handleCopyTemplate = () => {
    if (!generatedPrompt) return;
    navigator.clipboard.writeText(generatedPrompt.templateContent);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 sm:p-10 shadow-sm">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-xs font-bold uppercase tracking-wider">
            <Wand2 className="w-4 h-4 text-amber-600" />
            <span>Creador de Prompts con IA desde Ideas</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Transforma cualquier Idea o Tarea en un <span className="text-indigo-600">Prompt Completo</span>
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Escribe tu necesidad en lenguaje natural. La IA de Gemini diseñará la estructura profesional con variables dinámicas, contexto, instrucciones y formato para ejecutar o guardar en tu galería.
          </p>
        </div>
      </div>

      {/* Main Creation Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        
        {/* Step 1: Input Idea */}
        <div className="space-y-3">
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>1. Describe la idea o tarea que quieres automatizar</span>
          </label>

          <textarea
            value={ideaInput}
            onChange={(e) => setIdeaInput(e.target.value)}
            placeholder="Ejemplo: Necesito un prompt para analizar el SEO de un sitio web B2B y generar recomendaciones con variables de empresa, industria y competidores..."
            rows={4}
            className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-4 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 leading-relaxed transition-all shadow-xs"
          />

          {/* Quick Idea Templates */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-semibold text-slate-500">O selecciona una idea sugerida para probar:</span>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_IDEAS.map((idea) => (
                <button
                  key={idea}
                  onClick={() => {
                    setIdeaInput(idea);
                    handleGenerate(idea);
                  }}
                  className="text-xs font-medium px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-300 transition-all text-left shadow-xs"
                >
                  + {idea}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Locked Tool Notice for Free Users */}
        {!isProUser && (
          <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 text-slate-950 rounded-2xl p-4 sm:p-5 shadow-sm border border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="p-3 rounded-2xl bg-slate-950 text-amber-300 shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider block">
                  Creador de Prompts Bloqueado (Requiere Suscripción o Compra)
                </span>
                <p className="text-xs font-semibold text-slate-900 mt-0.5">
                  Generación de prompts completos con variables parametrizadas y Gemini 3.8 Flash. Desbloquea con PayPal (garciasaul@hotmail.com) o Whop (@saulmente).
                </p>
              </div>
            </div>
            <button
              onClick={onOpenUnlockModal || onUpgradeClick}
              className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-black text-xs flex items-center space-x-2 shrink-0 shadow-sm cursor-pointer transition-transform hover:scale-105"
            >
              <Unlock className="w-4 h-4 text-amber-300" />
              <span>Desbloquear Herramienta</span>
            </button>
          </div>
        )}

        {/* Action Button */}
        <div>
          <button
            onClick={() => handleGenerate()}
            disabled={isGenerating || (isProUser && !ideaInput.trim())}
            className={`w-full py-4 px-6 rounded-2xl font-extrabold text-sm sm:text-base shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              !isProUser
                ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 border border-amber-400 shadow-amber-400/20'
                : 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 border border-amber-400 shadow-amber-400/20 disabled:opacity-50'
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-slate-950" />
                <span>Generando Estructura de Prompt con Gemini IA...</span>
              </>
            ) : !isProUser ? (
              <>
                <Lock className="w-5 h-5 text-slate-950" />
                <span>🔒 Desbloquear Creador (Requiere Suscripción o Compra)</span>
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5 text-slate-950 fill-current" />
                <span>Generar Estructura de Prompt Completa con IA</span>
              </>
            )}
          </button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center justify-between gap-3">
            <span>{errorMsg}</span>
            <button
              onClick={() => handleGenerate()}
              disabled={isGenerating}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shrink-0 shadow-xs"
            >
              Reintentar
            </button>
          </div>
        )}

      </div>

      {/* Generated Result Workspace */}
      {generatedPrompt && (
        <div className="bg-white border border-amber-300 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md animate-fade-in">
          
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-extrabold text-slate-900">Resultado: Prompt Diseñado por IA</h2>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold flex items-center space-x-1">
                <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                <span>{generatedPrompt.recommendedModel}</span>
              </span>
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              {generatedPrompt.thumbnailUrl && (
                <div className="w-full sm:w-36 h-28 rounded-xl overflow-hidden shrink-0 border border-slate-200 shadow-xs">
                  <img
                    src={generatedPrompt.thumbnailUrl}
                    alt={generatedPrompt.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-xl font-extrabold text-slate-900 mb-2">{generatedPrompt.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{generatedPrompt.description}</p>
              </div>
            </div>

            {/* Variable Badges */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-amber-500" />
                <span>Variables Dinámicas Creadas ({generatedPrompt.variables.length}):</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {generatedPrompt.variables.map((v) => (
                  <div
                    key={v.name}
                    className="px-3 py-1 rounded-xl bg-white border border-slate-300 text-xs font-mono text-amber-800 font-bold shadow-xs"
                  >
                    <span className="text-slate-600 font-sans font-normal">{v.label}:</span> {'{{'}{v.name}{'}}'}
                  </div>
                ))}
              </div>
            </div>

            {/* Template Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Plantilla de Prompt Ejecutable:
                </span>
                <button
                  onClick={handleCopyTemplate}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 transition-all"
                >
                  {copiedTemplate ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTemplate ? '¡Copiado!' : 'Copiar Plantilla'}</span>
                </button>
              </div>

              <pre className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                {generatedPrompt.templateContent}
              </pre>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4 pt-2">
            <button
              onClick={handleExecuteNow}
              className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-sm shadow-md shadow-amber-400/20 flex items-center justify-center space-x-2 transition-all border border-amber-400"
            >
              <Zap className="w-5 h-5 text-slate-950 fill-current" />
              <span>⚡ Ejecutar Ya con IA (Ingresar Variables)</span>
            </button>

            <button
              onClick={() => downloadPromptAsPdf(generatedPrompt)}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white transition-all flex items-center justify-center space-x-2 shadow-sm"
            >
              <FileDown className="w-4 h-4 text-amber-300" />
              <span>Bajar en PDF</span>
            </button>

            <button
              onClick={handleSavePrompt}
              className={`w-full sm:w-auto px-6 py-4 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center space-x-2 ${
                savedToLibrary
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-xs'
              }`}
            >
              {savedToLibrary ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Guardado en Mis Prompts</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 text-amber-500" />
                  <span>Guardar en Lista Personal</span>
                </>
              )}
            </button>

            <button
              onClick={onNavigateToGallery}
              className="w-full sm:w-auto px-5 py-4 rounded-2xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-colors flex items-center justify-center space-x-1.5 shadow-xs"
            >
              <span>Ver en Galería</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
