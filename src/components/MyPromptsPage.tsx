import React, { useState } from 'react';
import { Bookmark, Wand2, ArrowRight, FileDown, Eye, EyeOff, BarChart3, LayoutGrid } from 'lucide-react';
import { Prompt, UserSubscription } from '../types';
import { PromptCard } from './PromptCard';
import { downloadPromptsCatalogPdf } from '../utils/pdfExport';
import { ExecutionQuotaChart } from './ExecutionQuotaChart';

interface MyPromptsPageProps {
  prompts: Prompt[];
  savedPromptIds: string[];
  onToggleSave: (promptId: string) => void;
  onExecutePrompt: (prompt: Prompt) => void;
  subscription: UserSubscription;
  onUpgradeClick: () => void;
  onNavigateToIdeaGenerator: () => void;
  onNavigateToGallery: () => void;
  onSimulateExecution?: () => void;
}

export const MyPromptsPage: React.FC<MyPromptsPageProps> = ({
  prompts,
  savedPromptIds,
  onToggleSave,
  onExecutePrompt,
  subscription,
  onUpgradeClick,
  onNavigateToIdeaGenerator,
  onNavigateToGallery,
  onSimulateExecution,
}) => {
  const [expandAll, setExpandAll] = useState<boolean>(false);
  const [activeTabSection, setActiveTabSection] = useState<'all' | 'chart' | 'prompts'>('all');
  const savedPrompts = prompts.filter((p) => savedPromptIds.includes(p.id));
  const isProUser = subscription.planType === 'pro' || subscription.planType === 'enterprise';

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-xs font-bold uppercase tracking-wider">
            <Bookmark className="w-3.5 h-3.5 text-amber-600" />
            <span>Panel Personal & Cuota ({savedPrompts.length} Guardados)</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Mis Prompts & Métricas de Cuota
          </h1>

          <p className="text-slate-600 text-xs sm:text-sm max-w-2xl">
            Monitorea el historial de consumo de tu plan en tiempo real con Recharts y gestiona tu catálogo de prompts guardados y creados con IA.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {savedPrompts.length > 0 && (
            <>
              <button
                onClick={() => setExpandAll(!expandAll)}
                className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center space-x-1.5 transition-all border border-slate-200"
              >
                {expandAll ? <EyeOff className="w-4 h-4 text-indigo-600" /> : <Eye className="w-4 h-4 text-indigo-600" />}
                <span>{expandAll ? 'Ocultar Prompts' : 'Ver Todos'}</span>
              </button>

              <button
                onClick={() => downloadPromptsCatalogPdf(savedPrompts, 'Mis Prompts Guardados - Conexion Prompts')}
                className="px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-sm flex items-center space-x-2 transition-all"
              >
                <FileDown className="w-4 h-4 text-amber-300" />
                <span>Bajar Mis Prompts en PDF</span>
              </button>
            </>
          )}

          <button
            onClick={onNavigateToIdeaGenerator}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-400/20 flex items-center space-x-2 shrink-0 transition-all border border-amber-400"
          >
            <Wand2 className="w-4 h-4 text-slate-950 fill-current" />
            <span>+ Crear Nuevo Prompt con IA</span>
          </button>
        </div>
      </div>

      {/* View Switcher Tabs Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTabSection('all')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition-all ${
              activeTabSection === 'all'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Vista Completa</span>
          </button>

          <button
            onClick={() => setActiveTabSection('chart')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition-all ${
              activeTabSection === 'chart'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-amber-500" />
            <span>Gráfico Recharts de Cuota</span>
          </button>

          <button
            onClick={() => setActiveTabSection('prompts')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition-all ${
              activeTabSection === 'prompts'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-indigo-600" />
            <span>Prompts Guardados ({savedPrompts.length})</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-xs font-semibold text-slate-500">
          <span>Uso de Cuota:</span>
          <span className="font-bold text-slate-800">{subscription.usedPromptsThisMonth} / {subscription.monthlyPromptQuota} prompts</span>
        </div>
      </div>

      {/* Section 1: Recharts Bar Chart (Visible in 'all' and 'chart') */}
      {(activeTabSection === 'all' || activeTabSection === 'chart') && (
        <ExecutionQuotaChart
          subscription={subscription}
          onUpgradeClick={onUpgradeClick}
          onSimulateExecution={onSimulateExecution}
        />
      )}

      {/* Section 2: Prompts Grid / List (Visible in 'all' and 'prompts') */}
      {(activeTabSection === 'all' || activeTabSection === 'prompts') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
              <Bookmark className="w-4 h-4 text-amber-500" />
              <span>Tus Prompts Guardados ({savedPrompts.length})</span>
            </h3>
            {savedPrompts.length > 0 && (
              <span className="text-xs text-slate-500 font-medium">
                Haz clic en "Usar Prompt" para ejecutarlo directamente con IA
              </span>
            )}
          </div>

          {savedPrompts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedPrompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  isSaved={true}
                  onToggleSave={onToggleSave}
                  onExecute={onExecutePrompt}
                  isProUser={isProUser}
                  defaultExpanded={expandAll}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-sm">
              <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">No tienes prompts guardados en tu lista</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Guarda prompts desde la galería pública o crea tus propias plantillas personalizadas a partir de ideas usando Inteligencia Artificial.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={onNavigateToIdeaGenerator}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-extrabold flex items-center space-x-2 shadow-sm border border-amber-400"
                >
                  <Wand2 className="w-4 h-4 fill-current" />
                  <span>Crear con IA desde una Idea</span>
                </button>
                <button
                  onClick={onNavigateToGallery}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors flex items-center space-x-1 border border-slate-200"
                >
                  <span>Explorar Galería</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
