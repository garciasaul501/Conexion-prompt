import React, { useState, useEffect } from 'react';
import {
  Star,
  Play,
  Bookmark,
  Eye,
  EyeOff,
  FileDown,
  Copy,
  Check,
  Lock,
  GitBranch,
  Sparkles,
} from 'lucide-react';
import { Prompt } from '../types';
import { downloadPromptAsPdf } from '../utils/pdfExport';
import { getDefaultThumbnailForCategory } from '../data/mockDatabase';
import { useLanguage } from '../i18n/LanguageContext';

interface PromptCardProps {
  prompt: Prompt;
  isSaved: boolean;
  onToggleSave: (promptId: string) => void;
  onExecute: (prompt: Prompt) => void;
  isProUser?: boolean;
  defaultExpanded?: boolean;
  onSwitchVersion?: (promptId: string, versionId: string) => void;
}

export const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  isSaved,
  onToggleSave,
  onExecute,
  isProUser = false,
  defaultExpanded = false,
  onSwitchVersion,
}) => {
  const { t } = useLanguage();
  const [showPromptPreview, setShowPromptPreview] = useState<boolean>(defaultExpanded);
  const [copied, setCopied] = useState<boolean>(false);
  const [imgError, setImgError] = useState<boolean>(false);

  useEffect(() => {
    setShowPromptPreview(defaultExpanded);
  }, [defaultExpanded]);

  const versions = prompt.versions || [];
  const activeVersion =
    versions.find((v) => v.id === prompt.currentVersionId) || versions[versions.length - 1];
  const versionNumber = activeVersion ? activeVersion.versionNumber : 1;

  const getModelLabel = (model: string) => {
    switch (model) {
      case 'gemini-3.8-flash':
      case 'gemini-3.7-flash':
      case 'gemini-3.6-flash':
        return 'Gemini 3.8 Flash';
      case 'gemini-3.1-flash-lite':
        return 'Gemini Flash Lite';
      case 'gemini-3.1-pro-preview':
        return 'Gemini 3.1 Pro';
      case 'gpt-4o':
        return 'GPT-4o';
      case 'claude-3-5-sonnet':
        return 'Claude 3.5 Sonnet';
      default:
        return 'Gemini 3.8 Flash';
    }
  };

  const modelLabel = getModelLabel(prompt.recommendedModel);
  const thumbnail = prompt.thumbnailUrl || getDefaultThumbnailForCategory(prompt.categoryId);
  const isLocked = prompt.isPremium && !isProUser;

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
    <article className="group bg-white border border-slate-200 hover:border-slate-300 rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:shadow-md">
      {/* Clean Thumbnail without badge clutter */}
      <div
        onClick={() => onExecute(prompt)}
        className="relative w-full h-40 bg-slate-100 overflow-hidden cursor-pointer border-b border-slate-100"
      >
        {!imgError ? (
          <img
            src={thumbnail}
            alt={prompt.title}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-6">
            <Sparkles className="w-7 h-7 text-slate-400" />
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Clean Unboxed Metadata Line */}
        <div className="flex items-center flex-wrap gap-1.5 text-xs text-slate-500 mb-2 tabular-nums">
          <span
            className={`font-semibold ${
              prompt.isPremium
                ? isProUser
                  ? 'text-indigo-700'
                  : 'text-amber-700'
                : 'text-emerald-700'
            }`}
          >
            {prompt.isPremium ? (isProUser ? t.card.pro : t.card.proLocked) : t.card.free}
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>{modelLabel}</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="inline-flex items-center gap-0.5 text-slate-600 font-medium">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            {prompt.rating}
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>{prompt.variables.length} {t.card.vars}</span>
        </div>

        {/* Title */}
        <h3
          onClick={() => onExecute(prompt)}
          className="font-display text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2 cursor-pointer leading-snug"
        >
          {prompt.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
          {prompt.description}
        </p>

        {/* Expandable Template Preview & Version Switcher */}
        {showPromptPreview && (
          <div className="mb-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200">
              <span className="text-xs font-semibold text-slate-700">
                {t.card.templateLabel} (v{versionNumber}.0)
              </span>
              {versions.length > 1 && onSwitchVersion ? (
                <select
                  value={activeVersion?.id || ''}
                  onChange={(e) => {
                    e.stopPropagation();
                    onSwitchVersion(prompt.id, e.target.value);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={t.card.version}
                  className="bg-white border border-slate-200 rounded-md px-2 py-0.5 text-[11px] font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
                >
                  {versions.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-[11px] text-slate-500 tabular-nums">
                  {prompt.variables.length} {t.card.editableVars}
                </span>
              )}
            </div>
            <pre className="text-[11px] font-mono text-slate-700 whitespace-pre-wrap leading-relaxed max-h-44 overflow-y-auto">
              {prompt.templateContent}
            </pre>
          </div>
        )}

        {/* Footer Actions Row */}
        <div className="pt-3.5 border-t border-slate-100 mt-auto flex items-center justify-between gap-2">
          {/* Quiet Utility Actions */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowPromptPreview((prev) => !prev)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                showPromptPreview
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title={showPromptPreview ? t.card.hidePreview : t.card.preview}
              aria-label={showPromptPreview ? t.card.hidePreview : t.card.preview}
            >
              {showPromptPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={handleCopyPrompt}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title={copied ? t.card.copied : t.card.copy}
              aria-label={copied ? t.card.copied : t.card.copy}
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title={t.card.pdf}
              aria-label={t.card.pdf}
            >
              <FileDown className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(prompt.id);
              }}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isSaved
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title={isSaved ? t.card.unsave : t.card.save}
              aria-label={isSaved ? t.card.unsave : t.card.save}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-indigo-600' : ''}`} />
            </button>

            {versions.length > 1 && (
              <span
                className="ml-1 text-[11px] font-mono text-slate-400 inline-flex items-center gap-0.5 tabular-nums"
                title={`${versions.length} ${t.card.version}`}
              >
                <GitBranch className="w-3 h-3" />
                v{versionNumber}
              </span>
            )}
          </div>

          {/* Primary Action */}
          <button
            type="button"
            onClick={() => onExecute(prompt)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              isLocked
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200'
                : 'bg-slate-900 hover:bg-indigo-600 text-white'
            }`}
          >
            {isLocked ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>{t.card.unlock}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{t.card.usePrompt}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
