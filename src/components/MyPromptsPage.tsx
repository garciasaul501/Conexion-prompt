import React, { useState } from 'react';
import { Bookmark, Wand2, ArrowRight, FileDown, Eye, EyeOff, BarChart3, LayoutGrid, GitBranch, History, Activity } from 'lucide-react';
import { Prompt, UserSubscription } from '../types';
import { PromptCard } from './PromptCard';
import { downloadPromptsCatalogPdf } from '../utils/pdfExport';
import { ExecutionQuotaChart } from './ExecutionQuotaChart';
import { PromptAnalyticsDashboard } from './PromptAnalyticsDashboard';

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
  onSwitchPromptVersion?: (promptId: string, versionId: string) => void;
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
  onSwitchPromptVersion,
}) => {
  const [expandAll, setExpandAll] = useState<boolean>(false);
  const [activeTabSection, setActiveTabSection] = useState<'all' | 'analytics' | 'chart' | 'prompts' | 'versions'>('all');
  const savedPrompts = prompts.filter((p) => savedPromptIds.includes(p.id));
  const isProUser = subscription.planType !== 'free';

  const totalSavedVersions = savedPrompts.reduce((sum, p) => sum + (p.versions?.length || 1), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-xs font-bold uppercase tracking-wider">
            <Bookmark className="w-3.5 h-3.5 text-amber-600" />
            <span>Panel Personal • {savedPrompts.length} Prompts • {totalSavedVersions} Versiones</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Mis Prompts, Analytics & Versiones
          </h1>

          <p className="text-slate-600 text-xs sm:text-sm max-w-2xl">
            Analiza la tasa de éxito y latencia de respuesta por versión con gráficos de líneas en Recharts, monitorea tu cuota mensual y gestiona tus iteraciones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {savedPrompts.length > 0 && (
            <>
              <button
                onClick={() => setExpandAll(!expandAll)}
                className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center space-x-1.5 transition-all border border-slate-200 cursor-pointer"
              >
                {expandAll ? <EyeOff className="w-4 h-4 text-indigo-600" /> : <Eye className="w-4 h-4 text-indigo-600" />}
                <span>{expandAll ? 'Ocultar Prompts' : 'Ver Todos'}</span>
              </button>

              <button
                onClick={() => downloadPromptsCatalogPdf(savedPrompts, 'Mis Prompts Guardados - Conexion Prompts')}
                className="px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-sm flex items-center space-x-2 transition-all cursor-pointer"
              >
                <FileDown className="w-4 h-4 text-amber-300" />
                <span>Bajar en PDF</span>
              </button>
            </>
          )}

          <button
            onClick={onNavigateToIdeaGenerator}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-400/20 flex items-center space-x-2 shrink-0 transition-all border border-amber-400 cursor-pointer"
          >
            <Wand2 className="w-4 h-4 text-slate-950 fill-current" />
            <span>+ Crear Prompt con IA</span>
          </button>
        </div>
      </div>

      {/* View Switcher Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTabSection('all')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTabSection === 'all'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Vista Completa</span>
          </button>

          <button
            onClick={() => setActiveTabSection('analytics')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTabSection === 'analytics'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>Prompt Analytics (Éxito & Latencia)</span>
          </button>

          <button
            onClick={() => setActiveTabSection('versions')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTabSection === 'versions'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5 text-indigo-600" />
            <span>Control de Versiones ({totalSavedVersions})</span>
          </button>

          <button
            onClick={() => setActiveTabSection('chart')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTabSection === 'chart'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-amber-500" />
            <span>Gráfico de Cuota</span>
          </button>

          <button
            onClick={() => setActiveTabSection('prompts')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeTabSection === 'prompts'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-indigo-600" />
            <span>Guardados ({savedPrompts.length})</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-xs font-semibold text-slate-500">
          <span>Uso de Cuota:</span>
          <span className="font-bold text-slate-800">{subscription.usedPromptsThisMonth} / {subscription.monthlyPromptQuota} prompts</span>
        </div>
      </div>

      {/* Section: Prompt Analytics Dashboard (Line Chart of Success Rate & Latency by Version) */}
      {(activeTabSection === 'all' || activeTabSection === 'analytics') && (
        <PromptAnalyticsDashboard
          prompts={prompts}
          onExecutePrompt={onExecutePrompt}
          onSwitchPromptVersion={onSwitchPromptVersion}
        />
      )}

      {/* Section: Version Control Manager (Visible in 'all' and 'versions') */}
      {(activeTabSection === 'all' || activeTabSection === 'versions') && savedPrompts.length > 0 && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <GitBranch className="w-4 h-4 text-indigo-600" />
                <span>Control de Versiones de tus Prompts</span>
              </h3>
              <p className="text-xs text-slate-500">
                Cambia entre diferentes iteraciones guardadas de tus prompts o abre el ejecutor para guardar una nueva versión.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedPrompts.map((p) => {
              const vers = p.versions || [];
              const activeVer = vers.find((v) => v.id === p.currentVersionId) || vers[vers.length - 1];
              return (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 line-clamp-1">{p.title}</h4>
                      <span className="text-[11px] text-slate-500 block">
                        Activa: <strong className="text-indigo-700">{activeVer?.label || 'v1.0'}</strong> • Modelo: {p.recommendedModel}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200 shrink-0">
                      {vers.length} {vers.length === 1 ? 'versión' : 'versiones'}
                    </span>
                  </div>

                  <div className="flex items-center flex-wrap gap-1.5">
                    {vers.map((v) => {
                      const isCurr = v.id === activeVer?.id;
                      return (
                        <button
                          key={v.id}
                          onClick={() => onSwitchPromptVersion && onSwitchPromptVersion(p.id, v.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            isCurr
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-white hover:bg-indigo-50 text-slate-700 border border-slate-200'
                          }`}
                          title={v.notes || v.label}
                        >
                          {v.label}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => onExecutePrompt(p)}
                      className="ml-auto px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 text-[11px] font-extrabold cursor-pointer"
                    >
                      + Nueva Iteración
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
                Haz clic en "Usar / Ver" para gestionar iteraciones o ejecutarlo
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
                  onSwitchVersion={onSwitchPromptVersion}
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
