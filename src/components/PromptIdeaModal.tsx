import React, { useState } from 'react';
import { Sparkles, X, Wand2, ArrowRight, Zap, Check, Copy, Bookmark, Lightbulb, RefreshCw, Cpu, Layers, FileDown } from 'lucide-react';
import { Prompt } from '../types';
import { downloadPromptAsPdf } from '../utils/pdfExport';

interface PromptIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecutePrompt: (prompt: Prompt) => void;
  onAddPromptToLibrary: (prompt: Prompt) => void;
}

const SUGGESTED_IDEAS = [
  'Generador de Guiones Virales para TikTok & Instagram Reels',
  'Auditoría y Optimización de Código TypeScript / React',
  'Estrategia de Ventas B2B y Secuencia de Email Cold Outreach',
  'Contrato de Servicios Freelance y Cláusulas de Confidencialidad',
  'Analizador de Reseñas de Clientes y Extractor de Puntos de Dolor',
];

export const PromptIdeaModal: React.FC<PromptIdeaModalProps> = ({
  isOpen,
  onClose,
  onExecutePrompt,
  onAddPromptToLibrary,
}) => {
  const [ideaInput, setIdeaInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<Prompt | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedToLibrary, setSavedToLibrary] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async (customIdea?: string) => {
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
    // Also add to library if not saved yet
    if (!savedToLibrary) {
      onAddPromptToLibrary(generatedPrompt);
    }
    onClose();
    onExecutePrompt(generatedPrompt);
  };

  const handleCopyTemplate = () => {
    if (!generatedPrompt) return;
    navigator.clipboard.writeText(generatedPrompt.templateContent);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-indigo-500 p-0.5 shadow-md shadow-amber-400/20 flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Wand2 className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <span>Creador de Prompts con IA desde Ideas</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  Gemini IA
                </span>
              </h2>
              <p className="text-xs text-slate-500">Transforma cualquier necesidad en un prompt reutilizable con variables ejecutables</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-200/50 rounded-xl transition-colors font-bold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">

          {/* Form Input Section */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>¿Qué idea o tarea quieres convertir en Prompt?</span>
            </label>

            <div className="relative">
              <textarea
                value={ideaInput}
                onChange={(e) => setIdeaInput(e.target.value)}
                placeholder="Ejemplo: Necesito un prompt para analizar el SEO de un sitio web B2B y generar recomendaciones de palabras clave con variables para empresa, industria y competidores..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-4 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 leading-relaxed shadow-xs"
              />
            </div>

            {/* Suggested Idea Chips */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-500">Ideas sugeridas para inspirarte:</span>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_IDEAS.map((idea) => (
                  <button
                    key={idea}
                    onClick={() => {
                      setIdeaInput(idea);
                      handleGenerate(idea);
                    }}
                    className="text-[11px] font-medium px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-300 transition-all text-left shadow-xs"
                  >
                    + {idea}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Generate Button */}
            <div className="pt-2">
              <button
                onClick={() => handleGenerate()}
                disabled={isGenerating || !ideaInput.trim()}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-sm shadow-md shadow-amber-400/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 border border-amber-400"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Diseñando Estructura de Prompt con Gemini...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 text-slate-950 fill-current" />
                    <span>Generar Estructura de Prompt Completa con IA</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
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

          {/* GENERATED PROMPT PREVIEW */}
          {generatedPrompt && (
            <div className="space-y-6 pt-4 border-t border-slate-200 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Resultado: Prompt Generado & Estructurado</span>
                </span>
                
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold flex items-center space-x-1">
                  <Cpu className="w-3 h-3 text-indigo-600" />
                  <span>{generatedPrompt.recommendedModel}</span>
                </span>
              </div>

              {/* Prompt Card Display */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  {generatedPrompt.thumbnailUrl && (
                    <div className="w-full sm:w-28 h-24 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                      <img
                        src={generatedPrompt.thumbnailUrl}
                        alt={generatedPrompt.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-slate-900 mb-1">
                      {generatedPrompt.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {generatedPrompt.description}
                    </p>
                  </div>
                </div>

                {/* Variables Badges */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1">
                    <Layers className="w-3.5 h-3.5 text-amber-500" />
                    <span>Variables Dinámicas Creadas ({generatedPrompt.variables.length}):</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {generatedPrompt.variables.map((v) => (
                      <div
                        key={v.name}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-[11px] font-mono text-amber-800 font-bold shadow-xs"
                      >
                        <span className="text-slate-600 font-normal">{v.label}:</span> {'{{'}{v.name}{'}}'}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Template Content Box */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Plantilla de Prompt:
                    </span>
                    <button
                      onClick={handleCopyTemplate}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center space-x-1"
                    >
                      {copiedTemplate ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedTemplate ? 'Copiado' : 'Copiar Plantilla'}</span>
                    </button>
                  </div>
                  <pre className="p-4 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                    {generatedPrompt.templateContent}
                  </pre>
                </div>
              </div>

              {/* ACTION BUTTONS FOR THE GENERATED PROMPT */}
              <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleExecuteNow}
                  className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md shadow-amber-400/20 flex items-center justify-center space-x-2 transition-all border border-amber-400"
                >
                  <Zap className="w-4 h-4 text-slate-950 fill-current" />
                  <span>⚡ Ejecutar Ya con IA (Llenar Variables)</span>
                </button>

                <button
                  onClick={() => downloadPromptAsPdf(generatedPrompt)}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-2xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white transition-all flex items-center justify-center space-x-2 shadow-sm"
                >
                  <FileDown className="w-4 h-4 text-amber-300" />
                  <span>Bajar en PDF</span>
                </button>

                <button
                  onClick={handleSavePrompt}
                  disabled={savedToLibrary}
                  className={`w-full sm:w-auto px-5 py-3.5 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center space-x-2 ${
                    savedToLibrary
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-xs'
                  }`}
                >
                  {savedToLibrary ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Guardado en Biblioteca</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4 text-amber-500" />
                      <span>Guardar en Galería</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
