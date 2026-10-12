import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Copy,
  Check,
  Play,
  BookmarkPlus,
  RefreshCw,
  Zap,
  TrendingUp,
  Cpu,
  Layers,
  MessageSquare,
  ShieldCheck,
  Lightbulb,
  Sliders,
  FileDown,
  Lock,
  Unlock,
} from 'lucide-react';
import { Prompt, OptimizedPromptResponse, UserSubscription } from '../types';
import { downloadOptimizedPromptAsPdf } from '../utils/pdfExport';
import { getDefaultThumbnailForCategory } from '../data/mockDatabase';

interface PromptOptimizerPageProps {
  onExecutePrompt: (prompt: Prompt) => void;
  onAddPromptToLibrary: (prompt: Prompt) => void;
  subscription: UserSubscription;
  onUpgradeClick: () => void;
  onOpenUnlockModal?: () => void;
}

const PRESET_EXAMPLES = [
  {
    title: 'Vender Servicio por WhatsApp',
    goal: 'high-conversion',
    rawPrompt: 'Escribe un mensaje para responder a un cliente en WhatsApp que me pregunta precio de mi servicio de desarrollo web y no me vuelva a dejar en visto.',
  },
  {
    title: 'System Prompt para Asistente IA',
    goal: 'agent-system',
    rawPrompt: 'Quiero un bot de atención al cliente para mi tienda de ropa online que responda dudas sobre envíos y tallas pero que no prometa devoluciones sin ticket.',
  },
  {
    title: 'Guión de Video Viral 60s',
    goal: 'viral-script',
    rawPrompt: 'Dame un guión de tiktok sobre finanzas personales para jóvenes para que ahorren su primer dinero y me sigan en redes.',
  },
  {
    title: 'Auditoría de Código TypeScript',
    goal: 'clean-code',
    rawPrompt: 'Revisa un componente de React que está lento y consume mucha memoria y dime cómo arreglarlo con TypeScript limpio.',
  },
];

export const PromptOptimizerPage: React.FC<PromptOptimizerPageProps> = ({
  onExecutePrompt,
  onAddPromptToLibrary,
  subscription,
  onUpgradeClick,
  onOpenUnlockModal,
}) => {
  const [rawPrompt, setRawPrompt] = useState<string>('');
  const [targetGoal, setTargetGoal] = useState<string>('high-conversion');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<OptimizedPromptResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const isProUser = subscription.planType === 'pro' || subscription.planType === 'enterprise';

  const handleOptimize = async (customText?: string, customGoal?: string) => {
    if (!isProUser) {
      if (onOpenUnlockModal) {
        onOpenUnlockModal();
      } else {
        onUpgradeClick();
      }
      return;
    }

    const textToProcess = customText || rawPrompt;
    const goalToProcess = customGoal || targetGoal;

    if (!textToProcess.trim()) {
      setErrorMsg('Por favor escribe o selecciona un prompt básico para optimizar.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);
    setIsSaved(false);

    try {
      const response = await fetch('/api/optimize-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawPrompt: textToProcess,
          targetGoal: goalToProcess,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error al conectar con el optimizador de prompts.');
      }

      setResult(data.data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Ocurrió un error optimizando el prompt.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.optimizedPrompt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveToLibrary = () => {
    if (!result) return;
    const newPrompt: Prompt = {
      id: `p-opt-${Date.now()}`,
      title: result.title,
      description: result.description,
      templateContent: result.optimizedPrompt,
      variables: result.variables,
      isPremium: false,
      categoryId: result.categorySuggested,
      recommendedModel: 'gemini-3.8-flash',
      authorName: 'Optimizador IA • Conexión Whop',
      authorAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=150',
      thumbnailUrl: getDefaultThumbnailForCategory(result.categorySuggested),
      usesCount: 1,
      rating: 5.0,
      tags: result.tags,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddPromptToLibrary(newPrompt);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleRunInExecutor = () => {
    if (!result) return;
    const newPrompt: Prompt = {
      id: `p-opt-${Date.now()}`,
      title: result.title,
      description: result.description,
      templateContent: result.optimizedPrompt,
      variables: result.variables,
      isPremium: false,
      categoryId: result.categorySuggested,
      recommendedModel: 'gemini-3.8-flash',
      authorName: 'Optimizador IA',
      authorAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=150',
      thumbnailUrl: getDefaultThumbnailForCategory(result.categorySuggested),
      usesCount: 1,
      rating: 5.0,
      tags: result.tags,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onExecutePrompt(newPrompt);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50/80 via-white to-amber-50/60 border border-slate-200 p-8 sm:p-10 shadow-sm">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Optimizador de Prompts • IA 2026</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Convierte cualquier idea simple en un <br />
            <span className="bg-gradient-to-r from-indigo-600 via-sky-600 to-amber-600 bg-clip-text text-transparent">
              Prompt Maestro Profesional
            </span>
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            La diferencia entre una respuesta mediocre de la IA y un resultado de $10,000 está en la estructura del prompt.
            Nuestra IA analiza tu texto y le inyecta Rol de Élite, Variables dinámicas <code className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-mono font-bold">{'{{variable}}'}</code>, Reglas Negativas y Formatos Estrictos.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium pt-2 border-t border-slate-200">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Metodología R-C-O-F-C</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Detección Automática de Variables</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Optimizado para Gemini 3.7 & GPT-4o</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Quick Starters */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <span>Ejemplos Rápidos para Probar:</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_EXAMPLES.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setRawPrompt(preset.rawPrompt);
                setTargetGoal(preset.goal);
                handleOptimize(preset.rawPrompt, preset.goal);
              }}
              className="text-left p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-all group flex flex-col justify-between space-y-2 shadow-xs hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {preset.title}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2">
                "{preset.rawPrompt}"
              </p>
            </button>
          ))}
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
                Optimizador IA Bloqueado (Requiere Suscripción o Compra)
              </span>
              <p className="text-xs font-semibold text-slate-900 mt-0.5">
                Convierte prompts a estándar R-C-O-F-C, inyección de variables dinámicas y exportación PDF. Desbloquea con PayPal (garciasaul@hotmail.com) o Whop (@saulmente).
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

      {/* Main Input & Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input Form */}
        <div className="lg:col-span-6 space-y-5 bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-amber-500" />
              <span>Ingresa tu Prompt o Idea en Bruto</span>
            </h2>
            <span className="text-[11px] text-slate-500">
              {rawPrompt.length} caracteres
            </span>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              ¿Qué quieres que la IA haga? (Escríbelo como te salga):
            </label>
            <textarea
              rows={6}
              value={rawPrompt}
              onChange={(e) => setRawPrompt(e.target.value)}
              placeholder="Ej: Necesito un correo para convencer a empresas de comprar mi software de RRHH, que hable de ahorro de tiempo y tenga un llamado a una demo de 15 minutos..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-y"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Objetivo Prioritario:
              </label>
              <select
                value={targetGoal}
                onChange={(e) => setTargetGoal(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-indigo-500"
              >
                <option value="high-conversion">Alta Conversión & Cierre de Venta</option>
                <option value="agent-system">System Prompt para Agente Autónomo</option>
                <option value="viral-script">Guión Viral de Video (TikTok/Reels)</option>
                <option value="clean-code">Arquitectura de Código & Refactor</option>
                <option value="seo-strategy">Estrategia SEO & Contenido B2B</option>
                <option value="executive-brief">Resumen Ejecutivo & Toma de Decisión</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Motor de Optimización:
              </label>
              <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-amber-700 font-bold flex items-center space-x-2">
                <Cpu className="w-3.5 h-3.5 text-amber-500" />
                <span>Google Gemini 3.8 Flash (Auto-recuperación activa)</span>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 font-semibold flex items-center justify-between gap-3">
              <span>{errorMsg}</span>
              <button
                onClick={() => handleOptimize()}
                disabled={isLoading}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shrink-0 shadow-xs"
              >
                Reintentar
              </button>
            </div>
          )}

          <button
            onClick={() => handleOptimize()}
            disabled={isLoading || (isProUser && !rawPrompt.trim())}
            className={`w-full py-4 px-6 rounded-2xl font-extrabold text-sm shadow-md flex items-center justify-center space-x-2.5 transition-all transform hover:-translate-y-0.5 cursor-pointer ${
              !isProUser
                ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 border border-amber-400 shadow-amber-400/20'
                : 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 border border-amber-400 shadow-amber-400/20 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Aplicando Ingeniería de Prompts con IA...</span>
              </>
            ) : !isProUser ? (
              <>
                <Lock className="w-4 h-4 text-slate-950" />
                <span>🔒 Desbloquear Optimizador (Requiere Suscripción o Compra)</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950 fill-current" />
                <span>✨ Optimizar Prompt al 100% de Calidad</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Output / Result Panel */}
        <div className="lg:col-span-6 flex flex-col">
          {result ? (
            <div className="bg-white border border-amber-300 rounded-3xl p-6 sm:p-7 shadow-lg shadow-amber-500/5 flex-1 flex flex-col justify-between space-y-6">
              
              {/* Quality Score Metrics */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-extrabold text-amber-700 tracking-wider">
                      Resultado Optimizado
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">
                      {result.title}
                    </h3>
                  </div>

                  {/* Score pill */}
                  <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold">
                    <span className="text-slate-400 line-through">
                      {result.qualityScoreBefore}%
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-amber-700 text-sm font-black">
                      {result.qualityScoreAfter}% Calidad
                    </span>
                  </div>
                </div>

                {/* Improvements Badges */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-700">
                    Mejoras Clave Inyectadas:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.improvementsApplied.map((imp, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-[11px] text-indigo-700 font-medium"
                      >
                        <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                        <span>{imp}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Variables Found */}
                {result.variables.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-amber-800">
                      Variables Dinámicas Detectadas ({result.variables.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.variables.map((v, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-[11px] font-mono text-amber-800 font-bold"
                        >
                          {`{{${v.name}}}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* The Prompt Content Box */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">
                      Cuerpo del Prompt Optimizado:
                    </label>
                    <button
                      onClick={handleCopy}
                      className="text-xs text-amber-700 hover:text-amber-800 flex items-center space-x-1 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-amber-600" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-mono text-slate-800 max-h-72 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                    {result.optimizedPrompt}
                  </div>
                </div>

                {/* Pro Tips */}
                {result.tipsForBestResults.length > 0 && (
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 space-y-1">
                    <span className="font-bold text-amber-800">💡 Tip de Ejecución:</span>
                    <p>{result.tipsForBestResults[0]}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleRunInExecutor}
                  className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center justify-center space-x-2 shadow-sm transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-amber-300" />
                  <span>Probar en Ejecutor con Variables</span>
                </button>

                <button
                  onClick={() => downloadOptimizedPromptAsPdf(result)}
                  className="px-4 py-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-extrabold flex items-center space-x-1.5 transition-all"
                >
                  <FileDown className="w-3.5 h-3.5 text-amber-600" />
                  <span>Bajar en PDF</span>
                </button>

                <button
                  onClick={handleSaveToLibrary}
                  className={`px-4 py-3 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-all ${
                    isSaved
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                  }`}
                >
                  {isSaved ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Guardado</span>
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-3.5 h-3.5 text-amber-500" />
                      <span>Guardar en Mi Biblioteca</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-8 sm:p-12 text-center flex-1 flex flex-col items-center justify-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shadow-xs">
                <Sparkles className="w-8 h-8 text-amber-500" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-base font-bold text-slate-800">
                  Tu Prompt Maestro aparecerá aquí
                </h3>
                <p className="text-xs text-slate-500">
                  Escribe tu solicitud a la izquierda o haz clic en uno de los ejemplos rápidos para ver el antes y después en segundos.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Subscription Callout Banner */}
      {!isProUser && (
        <div className="mt-8 bg-gradient-to-r from-amber-50 via-indigo-50/50 to-white border border-amber-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
              <Zap className="w-3 h-3 text-amber-600 fill-current" />
              <span>Conexión Whop</span>
            </div>
            <h4 className="text-base font-bold text-slate-900">
              ¿Quieres optimizaciones y ejecuciones de prompts sin límites?
            </h4>
            <p className="text-xs text-slate-600 max-w-xl">
              Suscríbete en Conexión Whop para desbloquear la suite completa, exportación masiva y ejecución en los modelos más potentes del mercado.
            </p>
          </div>

          <a
            href="https://whop.com/woop-conexion/"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-400/20 transition-all text-center border border-amber-400"
          >
            Desbloquear ahora con Conexión Whop
          </a>
        </div>
      )}

    </div>
  );
};
