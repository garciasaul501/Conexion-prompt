import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  DollarSign,
  Zap,
  Download,
  ChevronDown,
  ChevronUp,
  Play,
  Sparkles,
  CheckCircle2,
  FileSpreadsheet,
  Award,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { Prompt, PromptCategory, UserSubscription } from '../types';

interface ControlPanelProps {
  prompts: Prompt[];
  categories: PromptCategory[];
  subscription: UserSubscription;
  onExecutePrompt: (prompt: Prompt) => void;
  onUpgradeClick?: () => void;
  onNavigateToAnalytics?: () => void;
}

// Estimated metrics constants based on industry benchmarks:
// Manual prompt engineering & testing: ~45 minutes per task
// AI-assisted prompt execution: ~15 seconds (0.25 minutes)
// Average specialist hourly rate: $35 USD/hour
const MANUAL_TIME_PER_PROMPT_MINUTES = 45;
const AI_TIME_PER_PROMPT_MINUTES = 0.25;
const ESTIMATED_HOURLY_RATE_USD = 35;

export const ControlPanel: React.FC<ControlPanelProps> = ({
  prompts,
  categories,
  subscription,
  onExecutePrompt,
  onUpgradeClick,
  onNavigateToAnalytics,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [topLimit, setTopLimit] = useState<number>(5);

  // Category name lookup map
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((cat) => map.set(cat.id, cat.name));
    return map;
  }, [categories]);

  // Aggregated Productivity & Execution Calculations
  const metrics = useMemo(() => {
    const totalPrompts = prompts.length;
    const totalExecutions = prompts.reduce((sum, p) => sum + (p.usesCount || 0), 0);

    // Time calculations
    const totalManualMinutes = totalExecutions * MANUAL_TIME_PER_PROMPT_MINUTES;
    const totalAiMinutes = totalExecutions * AI_TIME_PER_PROMPT_MINUTES;
    const savedMinutes = Math.max(0, totalManualMinutes - totalAiMinutes);

    const manualHours = Math.round(totalManualMinutes / 60);
    const aiHours = Math.round((totalAiMinutes / 60) * 10) / 10;
    const savedHours = Math.round(savedMinutes / 60);

    // Economic savings
    const economicSavingsUsd = Math.round(savedHours * ESTIMATED_HOURLY_RATE_USD);

    // Speedup factor: 45 min / 0.25 min = 180x
    const speedupMultiplier = Math.round(MANUAL_TIME_PER_PROMPT_MINUTES / AI_TIME_PER_PROMPT_MINUTES);

    return {
      totalPrompts,
      totalExecutions,
      manualHours,
      aiHours,
      savedHours,
      savedDays: (savedHours / 24).toFixed(1),
      economicSavingsUsd,
      speedupMultiplier,
    };
  }, [prompts]);

  // Top executed prompts sorted by usesCount
  const sortedPrompts = useMemo(() => {
    return [...prompts]
      .filter((p) => filterCategory === 'all' || p.categoryId === filterCategory)
      .sort((a, b) => (b.usesCount || 0) - (a.usesCount || 0));
  }, [prompts, filterCategory]);

  const topPrompts = useMemo(() => {
    return sortedPrompts.slice(0, topLimit);
  }, [sortedPrompts, topLimit]);

  // Export summary to CSV with standard RFC 4180 compliance and UTF-8 BOM for Excel
  const handleExportCsv = () => {
    try {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');

      // Helper to safely escape CSV cell content
      const escapeCsv = (val: string | number): string => {
        const text = String(val ?? '').replace(/"/g, '""');
        return `"${text}"`;
      };

      // Header row
      const headers = [
        'Ranking',
        'ID_Prompt',
        'Titulo_Prompt',
        'Categoria',
        'Modelo_Recomendado',
        'Total_Ejecuciones',
        'Tiempo_Manual_Estimado_Min',
        'Tiempo_IA_Segundos',
        'Horas_Ahorradas_Estimadas',
        'Ahorro_Economico_USD',
        'Tarifa_Hora_Referencia_USD',
        'Es_Premium',
        'Fecha_Reporte',
      ];

      const rows: string[] = [];
      rows.push(headers.join(','));

      // Prompt rows
      sortedPrompts.forEach((prompt, index) => {
        const uses = prompt.usesCount || 0;
        const promptManualMin = uses * MANUAL_TIME_PER_PROMPT_MINUTES;
        const promptAiSec = Math.round(uses * AI_TIME_PER_PROMPT_MINUTES * 60);
        const promptSavedHours = (
          (promptManualMin - (promptAiSec / 60)) /
          60
        ).toFixed(1);
        const promptSavingsUsd = Math.round(
          Number(promptSavedHours) * ESTIMATED_HOURLY_RATE_USD
        );
        const catName = categoryMap.get(prompt.categoryId) || prompt.categoryId;

        const row = [
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
          escapeCsv(prompt.isPremium ? 'PRO' : 'GRATIS'),
          escapeCsv(dateStr),
        ];
        rows.push(row.join(','));
      });

      // Total summary row at the bottom
      const summaryRow = [
        escapeCsv('TOTALES_GENERALES'),
        escapeCsv('ALL'),
        escapeCsv(`Total de ${sortedPrompts.length} Prompts Analizados`),
        escapeCsv(filterCategory === 'all' ? 'Todas las Categorías' : filterCategory),
        escapeCsv('Varios (Gemini/Claude/GPT-4o)'),
        escapeCsv(metrics.totalExecutions),
        escapeCsv(metrics.totalExecutions * MANUAL_TIME_PER_PROMPT_MINUTES),
        escapeCsv(Math.round(metrics.totalExecutions * AI_TIME_PER_PROMPT_MINUTES * 60)),
        escapeCsv(metrics.savedHours),
        escapeCsv(metrics.economicSavingsUsd),
        escapeCsv(ESTIMATED_HOURLY_RATE_USD),
        escapeCsv('Consolidado'),
        escapeCsv(dateStr),
      ];
      rows.push(summaryRow.join(','));

      // Prepend UTF-8 BOM (\uFEFF) so Excel & spreadsheet apps correctly recognize accents (ñ, á, é, í, ó, ú)
      const csvContent = '\uFEFF' + rows.join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const downloadUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute(
        'download',
        `Resumen_Ahorro_Tiempo_Productividad_Prompts_${dateStr}_${timeStr}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      setExportSuccessMessage(
        `¡Reporte CSV exportado con éxito! Se incluyeron ${sortedPrompts.length} prompts y ${metrics.totalExecutions.toLocaleString()} ejecuciones.`
      );
      setTimeout(() => setExportSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error('Error exportando CSV:', err);
      setExportSuccessMessage('Error al generar el archivo CSV. Inténtalo de nuevo.');
      setTimeout(() => setExportSuccessMessage(null), 5000);
    }
  };

  return (
    <section className="bg-white border-2 border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-sm transition-all relative overflow-hidden">
      {/* Decorative gradient corner accent */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-amber-400/10 via-indigo-500/5 to-transparent rounded-bl-full pointer-events-none" />

      {/* Control Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 relative z-10">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-amber-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Panel de Control & Resumen de Productividad
              </h2>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Métricas en Vivo
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparativa de rendimiento: Redacción manual vs. Ejecución automatizada con IA.
            </p>
          </div>
        </div>

        {/* Action Controls: Export CSV + Collapse/Expand */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
            title="Descargar reporte completo en formato CSV"
          >
            <Download className="w-4 h-4 text-emerald-100" />
            <FileSpreadsheet className="w-4 h-4 text-white" />
            <span>Exportar CSV de Productividad</span>
          </button>

          {onNavigateToAnalytics && (
            <button
              type="button"
              onClick={onNavigateToAnalytics}
              className="inline-flex items-center space-x-1.5 px-3 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition-all cursor-pointer"
              title="Ver gráfica de frecuencia de ejecución a 30 días en Analytics"
            >
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Ver Gráfica 30 Días</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            title={isExpanded ? 'Contraer panel' : 'Expandir panel'}
            aria-label="Alternar visibilidad del panel"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* CSV Export Success Toast */}
      {exportSuccessMessage && (
        <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between gap-2 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{exportSuccessMessage}</span>
          </div>
          <button
            onClick={() => setExportSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content (Collapsible) */}
      {isExpanded && (
        <div className="mt-5 space-y-6">
          {/* KPI Summary Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
            {/* KPI 1: Prompts Ejecutados */}
            <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Ejecuciones Totales
                </span>
                <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                  <Play className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">
                  {metrics.totalExecutions.toLocaleString()}
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                  <span className="text-emerald-600 font-bold">+{metrics.totalPrompts} plantillas</span>{' '}
                  activas
                </p>
              </div>
            </div>

            {/* KPI 2: Tiempo Ahorrado en Horas */}
            <div className="bg-gradient-to-br from-indigo-50/60 to-white border border-indigo-200 rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-400 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider">
                  Tiempo Ahorrado
                </span>
                <span className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
                  <Clock className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-2">
                <span className="text-2xl sm:text-3xl font-black text-indigo-700">
                  {metrics.savedHours.toLocaleString()} <span className="text-sm font-bold">hrs</span>
                </span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Equivale a <strong className="text-slate-900">{metrics.savedDays} días</strong> continuos
                  de trabajo manual
                </p>
              </div>
            </div>

            {/* KPI 3: Ahorro Económico Estimado (USD) */}
            <div className="bg-gradient-to-br from-emerald-50/60 to-white border border-emerald-200 rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-400 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">
                  Ahorro Económico
                </span>
                <span className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-xs">
                  <DollarSign className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-2">
                <span className="text-2xl sm:text-3xl font-black text-emerald-700">
                  ${metrics.economicSavingsUsd.toLocaleString()}{' '}
                  <span className="text-xs font-bold text-emerald-600">USD</span>
                </span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Calculado a <strong className="text-slate-900">${ESTIMATED_HOURLY_RATE_USD}/h</strong> de
                  tiempo profesional
                </p>
              </div>
            </div>

            {/* KPI 4: Aceleración de Velocidad */}
            <div className="bg-gradient-to-br from-amber-50/70 to-white border border-amber-300 rounded-2xl p-4 flex flex-col justify-between hover:border-amber-400 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-950 uppercase tracking-wider">
                  Multiplicador IA
                </span>
                <span className="p-1.5 rounded-lg bg-amber-500 text-slate-950 shadow-xs">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                </span>
              </div>
              <div className="mt-2">
                <span className="text-2xl sm:text-3xl font-black text-amber-700">
                  {metrics.speedupMultiplier}x{' '}
                  <span className="text-xs font-bold text-slate-700">más veloz</span>
                </span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  15 seg con IA vs. 45 min de redacción tradicional
                </p>
              </div>
            </div>
          </div>

          {/* Comparative Benchmark Bar: Manual vs IA */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                  Comparativa de Tiempo: Ejecución Manual vs. Conexión Prompts IA
                </span>
              </div>
              <span className="text-[11px] font-mono text-amber-300">
                Reducción del 99.4% en tiempo dedicado
              </span>
            </div>

            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                  <span>Redacción manual de prompts & pruebas (45 min c/u)</span>
                  <span className="font-mono text-rose-300 font-bold">
                    ~{metrics.manualHours.toLocaleString()} horas dedicadas
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full w-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                  <span>Ejecución instantánea con IA & Variables (15 seg c/u)</span>
                  <span className="font-mono text-emerald-300 font-bold">
                    ~{metrics.aiHours} horas totales ({metrics.speedupMultiplier}x más rápido)
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
                    style={{ width: `${Math.max(1, (metrics.aiHours / (metrics.manualHours || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Prompts Más Ejecutados */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Prompts Más Ejecutados & Ahorro por Plantilla
                </h3>
              </div>

              {/* Filters for Top Table */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 font-medium text-slate-700 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">Todas las Categorías</option>
                  {categories
                    .filter((c) => c.id !== 'cat-all')
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>

                <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                  {[5, 10].map((lim) => (
                    <button
                      key={lim}
                      type="button"
                      onClick={() => setTopLimit(lim)}
                      className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] cursor-pointer transition-all ${
                        topLimit === lim ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Top {lim}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Prompts Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-3.5 text-center w-12">#</th>
                    <th className="py-3 px-4">Prompt</th>
                    <th className="py-3 px-3 hidden md:table-cell">Categoría</th>
                    <th className="py-3 px-3 text-right">Ejecuciones</th>
                    <th className="py-3 px-3 text-right">Ahorro Tiempo</th>
                    <th className="py-3 px-3 text-right">Ahorro USD</th>
                    <th className="py-3 px-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {topPrompts.map((p, index) => {
                    const promptUses = p.usesCount || 0;
                    const promptSavedHours = Math.round(
                      (promptUses * (MANUAL_TIME_PER_PROMPT_MINUTES - AI_TIME_PER_PROMPT_MINUTES)) / 60
                    );
                    const promptSavingsUsd = Math.round(promptSavedHours * ESTIMATED_HOURLY_RATE_USD);
                    const catName = categoryMap.get(p.categoryId) || p.categoryId;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3.5 text-center">
                          <span
                            className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-black text-xs ${
                              index === 0
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : index === 1
                                ? 'bg-slate-200 text-slate-800'
                                : index === 2
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {index + 1}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 line-clamp-1 max-w-sm sm:max-w-md">
                            {p.title}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="font-mono">{p.recommendedModel || 'gemini-3.8-flash'}</span>
                            {p.isPremium && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-extrabold text-[9px]">
                                PRO
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 hidden md:table-cell text-slate-600 font-medium">
                          {catName}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          {promptUses.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-indigo-600">
                          ~{promptSavedHours.toLocaleString()} hrs
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600">
                          ${promptSavingsUsd.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => onExecutePrompt(p)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition-colors cursor-pointer"
                            title="Probar y ejecutar este prompt ahora"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Ejecutar</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
