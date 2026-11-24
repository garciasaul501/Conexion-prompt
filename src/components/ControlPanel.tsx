import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Download,
  ChevronDown,
  ChevronUp,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { Prompt, PromptCategory, UserSubscription } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface ControlPanelProps {
  prompts: Prompt[];
  categories: PromptCategory[];
  subscription: UserSubscription;
  onExecutePrompt: (prompt: Prompt) => void;
  onUpgradeClick?: () => void;
  onNavigateToAnalytics?: () => void;
}

const MANUAL_TIME_PER_PROMPT_MINUTES = 45;
const AI_TIME_PER_PROMPT_MINUTES = 0.25;
const ESTIMATED_HOURLY_RATE_USD = 35;

export const ControlPanel: React.FC<ControlPanelProps> = ({
  prompts,
  categories,
  onExecutePrompt,
  onNavigateToAnalytics,
}) => {
  const { t, translateCategory, locale } = useLanguage();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [topLimit, setTopLimit] = useState<number>(5);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((cat) => map.set(cat.id, translateCategory(cat.id, cat.name)));
    return map;
  }, [categories, translateCategory]);

  const metrics = useMemo(() => {
    const totalPrompts = prompts.length;
    const totalExecutions = prompts.reduce((sum, p) => sum + (p.usesCount || 0), 0);

    const totalManualMinutes = totalExecutions * MANUAL_TIME_PER_PROMPT_MINUTES;
    const totalAiMinutes = totalExecutions * AI_TIME_PER_PROMPT_MINUTES;
    const savedMinutes = Math.max(0, totalManualMinutes - totalAiMinutes);

    const manualHours = Math.round(totalManualMinutes / 60);
    const aiHours = Math.round((totalAiMinutes / 60) * 10) / 10;
    const savedHours = Math.round(savedMinutes / 60);
    const economicSavingsUsd = Math.round(savedHours * ESTIMATED_HOURLY_RATE_USD);
    const speedupMultiplier = Math.round(
      MANUAL_TIME_PER_PROMPT_MINUTES / AI_TIME_PER_PROMPT_MINUTES
    );

    return {
      totalPrompts,
      totalExecutions,
      manualHours,
      aiHours,
      savedHours,
      savedDays: (savedHours / 8).toFixed(1),
      economicSavingsUsd,
      speedupMultiplier,
    };
  }, [prompts]);

  const sortedPrompts = useMemo(() => {
    return [...prompts]
      .filter((p) => filterCategory === 'all' || p.categoryId === filterCategory)
      .sort((a, b) => (b.usesCount || 0) - (a.usesCount || 0));
  }, [prompts, filterCategory]);

  const topPrompts = useMemo(() => {
    return sortedPrompts.slice(0, topLimit);
  }, [sortedPrompts, topLimit]);

  const handleExportCsv = () => {
    try {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];

      const escapeCsv = (val: string | number | undefined | null): string => {
        const str = String(val ?? '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const rows: string[] = [];
      const headers = [
        'Ranking',
        'Prompt_ID',
        'Title',
        'Category',
        'Model',
        'Executions',
        'Manual_Minutes',
        'AI_Seconds',
        'Hours_Saved',
        'Estimated_Savings_USD',
        'Hourly_Rate_USD',
        'Tier',
        'Export_Date',
      ];
      rows.push(headers.join(','));

      sortedPrompts.forEach((prompt, index) => {
        const uses = prompt.usesCount || 0;
        const promptManualMin = uses * MANUAL_TIME_PER_PROMPT_MINUTES;
        const promptAiSec = Math.round(uses * AI_TIME_PER_PROMPT_MINUTES * 60);
        const promptSavedHours = ((promptManualMin - promptAiSec / 60) / 60).toFixed(1);
        const promptSavingsUsd = Math.round(
          Number(promptSavedHours) * ESTIMATED_HOURLY_RATE_USD
        );
        const catName = categoryMap.get(prompt.categoryId) || prompt.categoryId;

        rows.push(
          [
            escapeCsv(index + 1),
            escapeCsv(prompt.id),
            escapeCsv(prompt.title),
            escapeCsv(catName),
            escapeCsv(prompt.recommendedModel || 'gemini-3.8-flash'),
            escapeCsv(uses),
            escapeCsv(promptManualMin),
            escapeCsv(promptAiSec),
            escapeCsv(promptSavedHours),
            escapeCsv(promptSavingsUsd),
            escapeCsv(ESTIMATED_HOURLY_RATE_USD),
            escapeCsv(prompt.isPremium ? 'PRO' : 'FREE'),
            escapeCsv(dateStr),
          ].join(',')
        );
      });

      rows.push(
        [
          escapeCsv('TOTAL'),
          escapeCsv('ALL'),
          escapeCsv(`Total (${sortedPrompts.length})`),
          escapeCsv(filterCategory === 'all' ? t.controlPanel.allCategories : filterCategory),
          escapeCsv('Gemini / GPT-4o / Claude'),
          escapeCsv(metrics.totalExecutions),
          escapeCsv(metrics.totalExecutions * MANUAL_TIME_PER_PROMPT_MINUTES),
          escapeCsv(Math.round(metrics.totalExecutions * AI_TIME_PER_PROMPT_MINUTES * 60)),
          escapeCsv(metrics.savedHours),
          escapeCsv(metrics.economicSavingsUsd),
          escapeCsv(ESTIMATED_HOURLY_RATE_USD),
          escapeCsv('Summary'),
          escapeCsv(dateStr),
        ].join(',')
      );

      const csvContent = '\uFEFF' + rows.join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `conexion-prompts-productivity-${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportSuccessMessage(t.controlPanel.csvSuccess);
      setTimeout(() => setExportSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Error exporting CSV:', err);
      setExportSuccessMessage(t.controlPanel.csvError);
      setTimeout(() => setExportSuccessMessage(null), 4000);
    }
  };

  return (
    <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      {/* Header Row */}
      <div className="px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-sm font-semibold text-slate-900">
            {t.controlPanel.title}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">{t.controlPanel.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>{t.controlPanel.exportCsv}</span>
          </button>

          {onNavigateToAnalytics && (
            <button
              type="button"
              onClick={onNavigateToAnalytics}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
              <span>{t.controlPanel.view30DayChart}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>{isExpanded ? t.controlPanel.hideDetails : t.controlPanel.showDetails}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {exportSuccessMessage && (
        <div className="mx-5 sm:mx-6 mb-4 px-3.5 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{exportSuccessMessage}</span>
        </div>
      )}

      {/* Flat 4-Column Tabular KPI Strip (no nested cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-slate-200 divide-y lg:divide-y-0 divide-x divide-slate-200 bg-slate-50/50">
        <div className="px-5 py-3.5">
          <div className="text-xs text-slate-500">{t.controlPanel.timeSaved}</div>
          <div className="mt-1 flex items-baseline gap-1.5 tabular-nums">
            <span className="font-display text-xl font-bold text-slate-900">
              {metrics.savedHours.toLocaleString(locale)}
            </span>
            <span className="text-xs text-slate-500">{t.controlPanel.hoursSaved}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
            ≈ {metrics.savedDays} {t.controlPanel.daysEquivalent}
          </div>
        </div>

        <div className="px-5 py-3.5">
          <div className="text-xs text-slate-500">{t.controlPanel.estimatedValue}</div>
          <div className="mt-1 flex items-baseline gap-1.5 tabular-nums">
            <span className="font-display text-xl font-bold text-slate-900">
              ${metrics.economicSavingsUsd.toLocaleString(locale)}
            </span>
            <span className="text-xs text-slate-500">USD</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
            ${ESTIMATED_HOURLY_RATE_USD} USD/h
          </div>
        </div>

        <div className="px-5 py-3.5">
          <div className="text-xs text-slate-500">{t.controlPanel.totalExecutions}</div>
          <div className="mt-1 flex items-baseline gap-1.5 tabular-nums">
            <span className="font-display text-xl font-bold text-slate-900">
              {metrics.totalExecutions.toLocaleString(locale)}
            </span>
            <span className="text-xs text-slate-500">{t.controlPanel.uses}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
            {metrics.totalPrompts} {t.nav.prompts.toLowerCase()}
          </div>
        </div>

        <div className="px-5 py-3.5">
          <div className="text-xs text-slate-500">{t.controlPanel.speedup}</div>
          <div className="mt-1 flex items-baseline gap-1.5 tabular-nums">
            <span className="font-display text-xl font-bold text-indigo-700">
              {metrics.speedupMultiplier}x
            </span>
            <span className="text-xs text-slate-500">{t.controlPanel.manualVsAi}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
            45 min → 15 s
          </div>
        </div>
      </div>

      {/* Expandable Top Executed Prompts Table */}
      {isExpanded && (
        <div className="border-t border-slate-200 px-5 sm:px-6 py-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-900">
              {t.controlPanel.topPromptsTitle}
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">{t.controlPanel.allCategories}</option>
                {categories
                  .filter((c) => c.id !== 'cat-all')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {translateCategory(c.id, c.name)}
                    </option>
                  ))}
              </select>

              <select
                value={topLimit}
                onChange={(e) => setTopLimit(Number(e.target.value))}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
              >
                <option value={5}>{t.controlPanel.showTop} 5</option>
                <option value={10}>{t.controlPanel.showTop} 10</option>
                <option value={prompts.length}>{t.gallery.filterAll}</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-medium">
                  <th className="py-2.5 pr-3 w-10">#</th>
                  <th className="py-2.5 px-3">Prompt</th>
                  <th className="py-2.5 px-3 text-right">{t.controlPanel.uses}</th>
                  <th className="py-2.5 px-3 text-right">{t.controlPanel.savedTime}</th>
                  <th className="py-2.5 pl-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topPrompts.map((prompt, index) => {
                  const uses = prompt.usesCount || 0;
                  const savedHours = (
                    (uses * (MANUAL_TIME_PER_PROMPT_MINUTES - AI_TIME_PER_PROMPT_MINUTES)) /
                    60
                  ).toFixed(1);
                  const catName = categoryMap.get(prompt.categoryId) || '';

                  return (
                    <tr
                      key={prompt.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-2.5 pr-3 font-mono text-slate-400 tabular-nums">
                        {String(index + 1).padStart(2, '0')}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-slate-900 line-clamp-1">
                          {prompt.title}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {catName} · {prompt.recommendedModel}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-800 tabular-nums">
                        {uses.toLocaleString(locale)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-700 font-medium tabular-nums">
                        {savedHours} h
                      </td>
                      <td className="py-2.5 pl-3 text-right">
                        <button
                          type="button"
                          onClick={() => onExecutePrompt(prompt)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-indigo-700 hover:bg-indigo-50 transition-colors cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>{t.controlPanel.run}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};
