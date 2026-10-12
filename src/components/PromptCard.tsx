import React, { useState } from 'react';
import {
  Sparkles,
  Star,
  Play,
  Bookmark,
  Layers,
  Cpu,
  Eye,
  EyeOff,
  FileDown,
  Copy,
  Check,
  Lock,
} from 'lucide-react';
import { Prompt } from '../types';
import { downloadPromptAsPdf } from '../utils/pdfExport';
import { getDefaultThumbnailForCategory } from '../data/mockDatabase';

interface PromptCardProps {
  prompt: Prompt;
  isSaved: boolean;
  onToggleSave: (promptId: string) => void;
  onExecute: (prompt: Prompt) => void;
  isProUser?: boolean;
  defaultExpanded?: boolean;
}

export const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  isSaved,
  onToggleSave,
  onExecute,
  isProUser = false,
  defaultExpanded = false,
}) => {
  const [showPromptPreview, setShowPromptPreview] = useState<boolean>(defaultExpanded);
  const [copied, setCopied] = useState<boolean>(false);

  // Sync with parent expand-all toggle if changed
  React.useEffect(() => {
    setShowPromptPreview(defaultExpanded);
  }, [defaultExpanded]);

  const getModelBadge = (model: string) => {
    switch (model) {
      case 'gemini-3.8-flash':
      case 'gemini-3.7-flash':
      case 'gemini-3.6-flash':
        return { label: 'Gemini 3.8 Flash', color: 'bg-amber-50/90 text-amber-800 border-amber-200 backdrop-blur-xs' };
      case 'gemini-3.1-flash-lite':
        return { label: 'Gemini 3.1 Flash Lite', color: 'bg-blue-50/90 text-blue-800 border-blue-200 backdrop-blur-xs' };
      case 'gemini-3.1-pro-preview':
        return { label: 'Gemini 3.1 Pro', color: 'bg-indigo-50/90 text-indigo-800 border-indigo-200 backdrop-blur-xs' };
      case 'gpt-4o':
        return { label: 'OpenAI GPT-4o', color: 'bg-emerald-50/90 text-emerald-800 border-emerald-200 backdrop-blur-xs' };
      case 'claude-3-5-sonnet':
        return { label: 'Claude 3.5 Sonnet', color: 'bg-purple-50/90 text-purple-800 border-purple-200 backdrop-blur-xs' };
      default:
        return { label: 'Gemini 3.8 Flash', color: 'bg-amber-50/90 text-amber-800 border-amber-200 backdrop-blur-xs' };
    }
  };

  const modelBadge = getModelBadge(prompt.recommendedModel);
  const thumbnail = prompt.thumbnailUrl || getDefaultThumbnailForCategory(prompt.categoryId);

  const handleCopyPrompt = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt.templateContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadPromptAsPdf(prompt);
  };

  return (
    <div className="group relative bg-white hover:bg-white border border-slate-200/90 hover:border-indigo-300 rounded-3xl p-4 sm:p-5 transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-xl hover:shadow-indigo-500/10">
      <div>
        {/* Prompt Card Thumbnail with Overlay Badges */}
        <div
          onClick={() => onExecute(prompt)}
          className="relative w-full h-40 sm:h-44 rounded-2xl overflow-hidden mb-4 bg-slate-100 cursor-pointer shadow-xs border border-slate-200/80"
        >
          <img
            src={thumbnail}
            alt={prompt.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Subtle gradient vignette for contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent pointer-events-none" />

          {/* Floating Badges (Top) */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
            <div className="flex items-center flex-wrap gap-1.5">
              {prompt.isPremium ? (
                isProUser ? (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-400 text-slate-950 shadow-md">
                    <Sparkles className="w-3 h-3 text-slate-950 fill-current" />
                    <span>PRO</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-500 text-slate-950 shadow-md border border-amber-300">
                    <Lock className="w-3 h-3 text-slate-950 shrink-0" />
                    <span>PRO (Bloqueado)</span>
                  </span>
                )
              ) : (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/95 text-slate-800 shadow-sm backdrop-blur-xs border border-slate-200/60">
                  <span>Gratis</span>
                </span>
              )}

              <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border shadow-xs ${modelBadge.color}`}>
                <Cpu className="w-3 h-3 text-slate-600" />
                <span>{modelBadge.label}</span>
              </span>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={handleDownloadPdf}
                className="p-1.5 rounded-xl text-slate-800 hover:text-indigo-600 bg-white/90 hover:bg-white shadow-xs backdrop-blur-xs transition-colors border border-slate-200/60"
                title="Descargar este prompt en PDF"
              >
                <FileDown className="w-4 h-4 text-indigo-600" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSave(prompt.id);
                }}
                className={`p-1.5 rounded-xl shadow-xs backdrop-blur-xs transition-colors border border-slate-200/60 ${
                  isSaved
                    ? 'bg-amber-50 text-amber-600 border-amber-300'
                    : 'bg-white/90 hover:bg-white text-slate-700 hover:text-amber-500'
                }`}
                title={isSaved ? 'Quitar de favoritos' : 'Guardar en favoritos'}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Quick Play/Unlock Overlay Button (Bottom-Right of Thumbnail) */}
          <div className="absolute bottom-2.5 right-2.5 flex items-center space-x-1.5">
            {prompt.isPremium && !isProUser ? (
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg bg-amber-500 text-slate-950 backdrop-blur-xs flex items-center space-x-1 shadow-md border border-amber-300">
                <Lock className="w-3 h-3 text-slate-950" />
                <span>Desbloquear</span>
              </span>
            ) : (
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-lg bg-slate-900/80 text-white backdrop-blur-xs flex items-center space-x-1 shadow-xs">
                <Play className="w-3 h-3 text-amber-300 fill-current" />
                <span>Ejecutar</span>
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3
          onClick={() => onExecute(prompt)}
          className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2 cursor-pointer leading-snug"
        >
          {prompt.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
          {prompt.description}
        </p>

        {/* Quick View Prompt Toggle Bar */}
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPromptPreview(!showPromptPreview)}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                showPromptPreview
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {showPromptPreview ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Ocultar Prompt</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Ver Prompt Completo</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyPrompt}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all"
              title="Copiar plantilla del prompt"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>

          {/* Expandable Prompt Content Preview */}
          {showPromptPreview && (
            <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700">
                  Plantilla del Prompt:
                </span>
                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {prompt.variables.length} variables editables
                </span>
              </div>
              <pre className="text-[11px] font-mono text-slate-800 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {prompt.templateContent}
              </pre>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {prompt.tags.map((tag) => (
            <span key={tag} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Info & Action */}
      <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
        <div className="flex items-center space-x-2.5 text-xs text-slate-600">
          <div className="flex items-center space-x-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="font-bold text-slate-800">{prompt.rating}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span>{prompt.variables.length} vars</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDownloadPdf}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-all shadow-xs"
            title="Bajar Prompt en PDF"
          >
            <FileDown className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>PDF</span>
          </button>

          <button
            onClick={() => onExecute(prompt)}
            className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              prompt.isPremium && !isProUser
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold shadow-sm border border-amber-300'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
            }`}
          >
            {prompt.isPremium && !isProUser ? (
              <>
                <Lock className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                <span>Desbloquear</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current text-amber-300 shrink-0" />
                <span>Usar / Ver</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
