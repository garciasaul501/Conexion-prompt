import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  Activity,
  Clock,
  CheckCircle2,
  GitBranch,
  Zap,
  TrendingUp,
  Play,
  Sparkles,
  Cpu,
  Filter,
  RotateCcw,
  ArrowUpRight,
  Layers,
  ShieldCheck,
  Calendar,
  BarChart3,
  Flame,
} from 'lucide-react';
import {
  Prompt,
  PromptVersionAnalyticsPoint,
  PromptExecutionTelemetry,
} from '../types';
import {
  INITIAL_PROMPT_ANALYTICS_HISTORY,
  INITIAL_EXECUTION_TELEMETRY,
} from '../data/mockDatabase';

export interface DailyExecutionFrequencyPoint {
  dateStr: string;
  dateLabel: string;
  dayIndex: number; // 1 to 30
  dayOfWeek: string;
  executions: number;
  successful: number;
  failed: number;
  cumulative: number;
  isPeak: boolean;
  isToday: boolean;
}

interface PromptAnalyticsDashboardProps {
  prompts: Prompt[];
  onExecutePrompt?: (prompt: Prompt) => void;
  onSwitchPromptVersion?: (promptId: string, versionId: string) => void;
  liveTelemetry?: PromptExecutionTelemetry[];
  onRecordLiveBenchmark?: (point: PromptVersionAnalyticsPoint, telemetry: PromptExecutionTelemetry) => void;
}

type AnalyticsChartMode = 'dual' | 'success' | 'latency';

export const PromptAnalyticsDashboard: React.FC<PromptAnalyticsDashboardProps> = ({
  prompts,
  onExecutePrompt,
  onSwitchPromptVersion,
  liveTelemetry = [],
  onRecordLiveBenchmark,
}) => {
  const [selectedPromptId, setSelectedPromptId] = useState<string>('all');
  const [chartMode, setChartMode] = useState<AnalyticsChartMode>('dual');
  const [visibleVersions, setVisibleVersions] = useState<{
    v1: boolean;
    v2: boolean;
    v3: boolean;
  }>({
    v1: true,
    v2: true,
    v3: true,
  });

  const [seriesData, setSeriesData] = useState<PromptVersionAnalyticsPoint[]>(() => {
    try {
      const saved = localStorage.getItem('saul_prompt_analytics_series_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PROMPT_ANALYTICS_HISTORY;
  });

  const [telemetryLogs, setTelemetryLogs] = useState<PromptExecutionTelemetry[]>(() => {
    return [...liveTelemetry, ...INITIAL_EXECUTION_TELEMETRY];
  });

  const selectedPrompt = useMemo(
    () => prompts.find((p) => p.id === selectedPromptId) || null,
    [prompts, selectedPromptId]
  );

  const [frequencyViewMode, setFrequencyViewMode] = useState<'total' | 'split' | 'cumulative'>('total');
  const [liveBenchmarkRuns, setLiveBenchmarkRuns] = useState<number>(0);

  // Generate responsive 30-day prompt execution frequency data
  const thirtyDaysExecutionData = useMemo(() => {
    const points: DailyExecutionFrequencyPoint[] = [];
    const now = new Date();

    const totalCatalogUses = prompts.reduce((sum, p) => sum + (p.usesCount || 0), 0) || 1500;
    const isAll = selectedPromptId === 'all';
    const targetPrompt = !isAll ? prompts.find((p) => p.id === selectedPromptId) : null;

    // Scale base volume
    const baseVolume = isAll
      ? 54
      : Math.max(7, Math.round(((targetPrompt?.usesCount || 75) / totalCatalogUses) * 54 * Math.min(6, prompts.length)));

    // Deterministic seed
    const seed = (selectedPromptId || 'all').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

    let runningTotal = 0;
    let maxExec = 0;
    let peakIndex = -1;

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayOfMonth = d.getDate();
      const monthShort = d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
      const dateLabel = `${dayOfMonth < 10 ? '0' : ''}${dayOfMonth} ${monthShort.charAt(0).toUpperCase() + monthShort.slice(1)}`;
      const dayOfWeek = d.toLocaleDateString('es-ES', { weekday: 'short' });
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;

      // Organic trend: upward trajectory across 30 days + weekly rhythm
      const progress = (29 - i) / 29;
      const trendFactor = 0.82 + progress * 0.38;
      const weekendMultiplier = isWeekend ? 0.70 : 1.15;

      // Pseudo-random deterministic daily variance
      const noise = Math.sin((dayOfMonth + seed) * 1.5) * 0.2 + Math.cos((i + seed) * 2.1) * 0.12;

      let dayExecutions = Math.max(
        4,
        Math.round(baseVolume * trendFactor * weekendMultiplier * (1 + noise))
      );

      // If today (i === 0), add any live benchmark runs
      if (i === 0 && liveBenchmarkRuns > 0) {
        dayExecutions += liveBenchmarkRuns;
      }

      if (dayExecutions > maxExec) {
        maxExec = dayExecutions;
        peakIndex = 29 - i;
      }

      const failed = Math.max(0, Math.round(dayExecutions * 0.018 + (dayOfMonth % 6 === 0 ? 1 : 0)));
      const successful = Math.max(1, dayExecutions - failed);
      runningTotal += dayExecutions;

      points.push({
        dateStr: d.toISOString().split('T')[0],
        dateLabel,
        dayIndex: 30 - i,
        dayOfWeek,
        executions: dayExecutions,
        successful,
        failed,
        cumulative: runningTotal,
        isPeak: false,
        isToday: i === 0,
      });
    }

    if (peakIndex >= 0 && points[peakIndex]) {
      points[peakIndex].isPeak = true;
    }

    return points;
  }, [prompts, selectedPromptId, liveBenchmarkRuns]);

  const thirtyDaysStats = useMemo(() => {
    const total = thirtyDaysExecutionData.reduce((acc, p) => acc + p.executions, 0);
    const totalSuccessful = thirtyDaysExecutionData.reduce((acc, p) => acc + p.successful, 0);
    const avgDaily = Number((total / 30).toFixed(1));
    const peakPoint = thirtyDaysExecutionData.reduce(
      (max, p) => (p.executions > max.executions ? p : max),
      thirtyDaysExecutionData[0] || { executions: 0, dateLabel: 'N/A' }
    );

    const firstHalf = thirtyDaysExecutionData.slice(0, 15).reduce((acc, p) => acc + p.executions, 0);
    const secondHalf = thirtyDaysExecutionData.slice(15, 30).reduce((acc, p) => acc + p.executions, 0);
    const growthPct = firstHalf > 0 ? Math.round(((secondHalf - firstHalf) / firstHalf) * 100) : 28;
    const reliabilityPct = total > 0 ? ((totalSuccessful / total) * 100).toFixed(1) : '99.1';

    const startDateLabel = thirtyDaysExecutionData[0]?.dateLabel || 'Día 1';
    const endDateLabel = thirtyDaysExecutionData[thirtyDaysExecutionData.length - 1]?.dateLabel || 'Hoy';

    return {
      total,
      totalSuccessful,
      avgDaily,
      peakPoint,
      growthPct,
      reliabilityPct,
      dateRangeLabel: `${startDateLabel} - ${endDateLabel}`,
    };
  }, [thirtyDaysExecutionData]);

  // Compute prompt-specific or global time-series adjustments so switching prompts dynamically updates curves
  const displayedChartData = useMemo(() => {
    if (!selectedPrompt) return seriesData;

    // Deterministic offset based on prompt id so each prompt shows realistic version curves
    const seed = selectedPrompt.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const rateOffset = ((seed % 5) - 2) * 0.6;
    const latencyOffset = ((seed % 7) - 3) * 28;

    return seriesData.map((pt) => ({
      ...pt,
      v1SuccessRate: Number(Math.min(99.5, Math.max(68, pt.v1SuccessRate + rateOffset)).toFixed(1)),
      v2SuccessRate: Number(Math.min(99.8, Math.max(75, pt.v2SuccessRate + rateOffset * 0.8)).toFixed(1)),
      v3SuccessRate: Number(Math.min(99.9, Math.max(84, pt.v3SuccessRate + rateOffset * 0.5)).toFixed(1)),
      v1LatencyMs: Math.max(480, Math.round(pt.v1LatencyMs + latencyOffset)),
      v2LatencyMs: Math.max(390, Math.round(pt.v2LatencyMs + latencyOffset * 0.7)),
      v3LatencyMs: Math.max(290, Math.round(pt.v3LatencyMs + latencyOffset * 0.5)),
    }));
  }, [seriesData, selectedPrompt]);

  // Calculate summary KPI metrics from latest point & overall averages
  const kpiStats = useMemo(() => {
    const latest = displayedChartData[displayedChartData.length - 1] || INITIAL_PROMPT_ANALYTICS_HISTORY[0];
    const first = displayedChartData[0] || latest;

    const avgV3Success =
      displayedChartData.reduce((acc, item) => acc + item.v3SuccessRate, 0) / displayedChartData.length;
    const avgV1Success =
      displayedChartData.reduce((acc, item) => acc + item.v1SuccessRate, 0) / displayedChartData.length;

    const avgV3Latency = Math.round(
      displayedChartData.reduce((acc, item) => acc + item.v3LatencyMs, 0) / displayedChartData.length
    );
    const avgV1Latency = Math.round(
      displayedChartData.reduce((acc, item) => acc + item.v1LatencyMs, 0) / displayedChartData.length
    );

    const totalSamples = displayedChartData.reduce((acc, item) => acc + item.sampleCount, 0);

    return {
      latestV3Success: latest.v3SuccessRate.toFixed(1),
      successGainVsV1: (avgV3Success - avgV1Success).toFixed(1),
      latestV3Latency: latest.v3LatencyMs,
      latencyReductionPct: Math.round(((avgV1Latency - avgV3Latency) / avgV1Latency) * 100),
      latencySavedMs: avgV1Latency - avgV3Latency,
      totalSamples,
      improvementTrend: (latest.v3SuccessRate - first.v3SuccessRate).toFixed(1),
    };
  }, [displayedChartData]);

  const toggleVersionVisibility = (ver: 'v1' | 'v2' | 'v3') => {
    setVisibleVersions((prev) => {
      const next = { ...prev, [ver]: !prev[ver] };
      // Ensure at least one version line remains visible
      if (!next.v1 && !next.v2 && !next.v3) return prev;
      return next;
    });
  };

  const handleRunLiveBenchmark = () => {
    const lastPoint = seriesData[seriesData.length - 1];
    const now = new Date();
    const timeLabel = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const newV1Success = Number(
      Math.min(94, Math.max(78, lastPoint.v1SuccessRate + (Math.random() * 2.2 - 0.8))).toFixed(1)
    );
    const newV2Success = Number(
      Math.min(97.5, Math.max(88, lastPoint.v2SuccessRate + (Math.random() * 1.6 - 0.5))).toFixed(1)
    );
    const newV3Success = Number(
      Math.min(99.9, Math.max(95, lastPoint.v3SuccessRate + (Math.random() * 0.9 - 0.2))).toFixed(1)
    );

    const newV1Latency = Math.round(Math.max(980, lastPoint.v1LatencyMs + (Math.random() * 70 - 40)));
    const newV2Latency = Math.round(Math.max(680, lastPoint.v2LatencyMs + (Math.random() * 55 - 32)));
    const newV3Latency = Math.round(Math.max(420, lastPoint.v3LatencyMs + (Math.random() * 45 - 28)));

    const newPoint: PromptVersionAnalyticsPoint = {
      timestamp: now.toISOString(),
      dateLabel: `Hoy ${timeLabel.slice(0, 5)}`,
      v1SuccessRate: newV1Success,
      v2SuccessRate: newV2Success,
      v3SuccessRate: newV3Success,
      v1LatencyMs: newV1Latency,
      v2LatencyMs: newV2Latency,
      v3LatencyMs: newV3Latency,
      sampleCount: lastPoint.sampleCount + 12,
      isLivePoint: true,
    };

    const targetPrompt = selectedPrompt || prompts[0];
    const newLog: PromptExecutionTelemetry = {
      id: `tel-${Date.now()}`,
      promptId: targetPrompt?.id || 'p-agent-1',
      promptTitle: targetPrompt?.title || 'Benchmark Multi-Versión',
      versionId: `${targetPrompt?.id || 'p-agent-1'}-v3`,
      versionLabel: 'v3.0 • Iteración Optimizada Flash',
      modelUsed: targetPrompt?.recommendedModel || 'gemini-3.8-flash',
      latencyMs: newV3Latency,
      success: true,
      qualityScore: Math.round(newV3Success),
      timestamp: `En vivo (${timeLabel})`,
    };

    const updatedSeries = [...seriesData.slice(-9), newPoint];
    setSeriesData(updatedSeries);
    setTelemetryLogs((prev) => [newLog, ...prev.slice(0, 7)]);
    setLiveBenchmarkRuns((prev) => prev + 1);

    try {
      localStorage.setItem('saul_prompt_analytics_series_v1', JSON.stringify(updatedSeries));
    } catch (e) {
      console.error(e);
    }

    if (onRecordLiveBenchmark) {
      onRecordLiveBenchmark(newPoint, newLog);
    }
  };

  const handleResetAnalytics = () => {
    setSeriesData(INITIAL_PROMPT_ANALYTICS_HISTORY);
    setTelemetryLogs(INITIAL_EXECUTION_TELEMETRY);
    setLiveBenchmarkRuns(0);
    try {
      localStorage.removeItem('saul_prompt_analytics_series_v1');
    } catch (e) {
      console.error(e);
    }
  };

  // Custom Tooltip for the 30-Day Execution Frequency LineChart
  const CustomFrequencyTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const pt = payload[0].payload as DailyExecutionFrequencyPoint;
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 text-xs space-y-2 min-w-[240px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-1.5 font-bold text-amber-300">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>{pt.dateLabel} ({pt.dayOfWeek})</span>
            </div>
            {pt.isToday ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Hoy • En Vivo
              </span>
            ) : pt.isPeak ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Pico 30d
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-mono">Día {pt.dayIndex}/30</span>
            )}
          </div>

          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium">Frecuencia de ejecuciones:</span>
              <span className="font-black text-indigo-400 font-mono text-sm">
                {pt.executions} ejecuciones
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-emerald-400 font-medium flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>Ejecuciones exitosas:</span>
              </span>
              <span className="font-bold text-emerald-300 font-mono">{pt.successful}</span>
            </div>
            {pt.failed > 0 && (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-rose-400 font-medium flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                  <span>Reintentos / avisos:</span>
                </span>
                <span className="font-bold text-rose-300 font-mono">{pt.failed}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-800 text-slate-400">
              <span>Volumen acumulado (30d):</span>
              <span className="font-bold text-indigo-300 font-mono">{pt.cumulative} total</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for the LineChart
  const CustomAnalyticsTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload as PromptVersionAnalyticsPoint;
      return (
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 text-xs space-y-2.5 min-w-[255px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-extrabold text-amber-300">{point.dateLabel}</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {point.sampleCount} ejecuciones
            </span>
          </div>

          <div className="space-y-2">
            {visibleVersions.v3 && (
              <div className="p-2 rounded-xl bg-emerald-950/50 border border-emerald-700/40 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                  <span className="font-bold text-emerald-200">v3.0 (Optimizada)</span>
                </div>
                <div className="text-right font-mono">
                  <span className="font-black text-emerald-300">{point.v3SuccessRate}% éxito</span>
                  <span className="text-slate-400 mx-1">•</span>
                  <span className="text-amber-300 font-bold">{point.v3LatencyMs} ms</span>
                </div>
              </div>
            )}

            {visibleVersions.v2 && (
              <div className="p-2 rounded-xl bg-indigo-950/50 border border-indigo-700/40 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 inline-block" />
                  <span className="font-bold text-indigo-200">v2.0 (Few-Shot)</span>
                </div>
                <div className="text-right font-mono">
                  <span className="font-black text-indigo-300">{point.v2SuccessRate}% éxito</span>
                  <span className="text-slate-400 mx-1">•</span>
                  <span className="text-amber-300 font-bold">{point.v2LatencyMs} ms</span>
                </div>
              </div>
            )}

            {visibleVersions.v1 && (
              <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
                  <span className="font-bold text-slate-300">v1.0 (Base Inicial)</span>
                </div>
                <div className="text-right font-mono">
                  <span className="font-black text-slate-200">{point.v1SuccessRate}% éxito</span>
                  <span className="text-slate-400 mx-1">•</span>
                  <span className="text-rose-300 font-bold">{point.v1LatencyMs} ms</span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Mejora v3.0 vs v1.0:</span>
            <span className="text-emerald-400 font-bold">
              +{(point.v3SuccessRate - point.v1SuccessRate).toFixed(1)}% éxito / -
              {point.v1LatencyMs - point.v3LatencyMs} ms
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>Prompt Analytics • Telemetría Recharts por Versión</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Tasa de Éxito (%) y Latencia de Respuesta (ms) en el Tiempo
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Analiza cómo evoluciona la efectividad y velocidad de respuesta entre las diferentes iteraciones de tus prompts (<strong className="text-slate-700">v1.0 Base</strong>, <strong className="text-indigo-700">v2.0 Few-Shot</strong> y <strong className="text-emerald-700">v3.0 Optimizada Flash</strong>).
          </p>
        </div>

        {/* Action Buttons: Simulate Benchmark & Reset */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleRunLiveBenchmark}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-400/20 border border-amber-400 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-slate-950 fill-current" />
            <span>Simular Benchmark en Vivo (+1)</span>
          </button>

          <button
            onClick={handleResetAnalytics}
            className="inline-flex items-center space-x-1.5 px-3 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all border border-slate-200 cursor-pointer"
            title="Restaurar serie histórica base"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Restaurar</span>
          </button>
        </div>
      </div>

      {/* Filter Bar: Prompt Selector + Version Toggles + Chart Mode */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        {/* Prompt Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
          <label className="text-xs font-extrabold text-slate-700 flex items-center space-x-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
            <span>Prompt Analizado:</span>
          </label>
          <select
            value={selectedPromptId}
            onChange={(e) => setSelectedPromptId(e.target.value)}
            className="w-full sm:max-w-md px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">🌐 Todos los Prompts (Promedio Global de Versiones)</option>
            {prompts.map((p) => (
              <option key={p.id} value={p.id}>
                📌 {p.title} ({(p.versions || []).length} {(p.versions || []).length === 1 ? 'versión' : 'versiones'})
              </option>
            ))}
          </select>
        </div>

        {/* Version Line Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 mr-1">Series:</span>
          <button
            onClick={() => toggleVersionVisibility('v1')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 border transition-all cursor-pointer ${
              visibleVersions.v1
                ? 'bg-slate-800 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-400 border-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>v1.0 Base</span>
          </button>

          <button
            onClick={() => toggleVersionVisibility('v2')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 border transition-all cursor-pointer ${
              visibleVersions.v2
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                : 'bg-white text-slate-400 border-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-indigo-300" />
            <span>v2.0 Few-Shot</span>
          </button>

          <button
            onClick={() => toggleVersionVisibility('v3')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 border transition-all cursor-pointer ${
              visibleVersions.v3
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                : 'bg-white text-slate-400 border-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-300" />
            <span>v3.0 Flash</span>
          </button>
        </div>

        {/* Chart Metric Mode Selector */}
        <div className="bg-slate-200/80 p-1 rounded-xl flex items-center space-x-1 text-xs font-bold self-start xl:self-auto">
          <button
            onClick={() => setChartMode('dual')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              chartMode === 'dual'
                ? 'bg-white text-indigo-700 shadow-xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Éxito + Latencia
          </button>
          <button
            onClick={() => setChartMode('success')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              chartMode === 'success'
                ? 'bg-white text-emerald-700 shadow-xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tasa de Éxito (%)
          </button>
          <button
            onClick={() => setChartMode('latency')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              chartMode === 'latency'
                ? 'bg-white text-amber-700 shadow-xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Latencia (ms)
          </button>
        </div>
      </div>

      {/* 30-Day Prompt Execution Frequency Line Chart Card */}
      <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
        {/* Top Header of the 30-Day Frequency Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                <BarChart3 className="w-4 h-4" />
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Frecuencia de Ejecución de Prompts (Últimos 30 Días)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {thirtyDaysStats.dateRangeLabel}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {selectedPrompt
                ? `Frecuencia y volumen diario de ejecuciones registrado para "${selectedPrompt.title}"`
                : 'Frecuencia consolidada de ejecuciones diarias de todos los prompts de la plataforma'}
            </p>
          </div>

          {/* Metric View Selector */}
          <div className="bg-slate-200/80 p-1 rounded-xl flex items-center space-x-1 text-xs font-bold self-start md:self-auto shrink-0">
            <button
              onClick={() => setFrequencyViewMode('total')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                frequencyViewMode === 'total'
                  ? 'bg-white text-indigo-700 shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Frecuencia Diaria
            </button>
            <button
              onClick={() => setFrequencyViewMode('split')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                frequencyViewMode === 'split'
                  ? 'bg-white text-emerald-700 shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Exitosas vs Reintentos
            </button>
            <button
              onClick={() => setFrequencyViewMode('cumulative')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                frequencyViewMode === 'cumulative'
                  ? 'bg-white text-purple-700 shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Volumen Acumulado
            </button>
          </div>
        </div>

        {/* 4 Quick Stat Badges for 30-Day Window */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
              <span>Total 30 Días</span>
              <Activity className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {thirtyDaysStats.total.toLocaleString('es-ES')}
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              +{thirtyDaysStats.growthPct}% vs quincena anterior
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
              <span>Promedio Diario</span>
              <Clock className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {thirtyDaysStats.avgDaily}
            </div>
            <span className="text-[10px] text-slate-500">ejecuciones por día</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
              <span>Día Pico Máximo</span>
              <Flame className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {thirtyDaysStats.peakPoint.executions}
            </div>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
              {thirtyDaysStats.peakPoint.dateLabel} ({thirtyDaysStats.peakPoint.dayOfWeek})
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
              <span>Fiabilidad Global</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-700">
              {thirtyDaysStats.reliabilityPct}%
            </div>
            <span className="text-[10px] text-slate-500">
              {thirtyDaysStats.totalSuccessful} exitosas
            </span>
          </div>
        </div>

        {/* Recharts LineChart for 30-Day Execution Frequency */}
        <div className="w-full bg-white p-4 rounded-xl border border-slate-200">
          <div className="h-72 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={thirtyDaysExecutionData}
                margin={{ top: 15, right: 25, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="dateLabel"
                  stroke="#64748b"
                  fontSize={11}
                  fontWeight={600}
                  tickLine={false}
                  interval={2}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomFrequencyTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '12px', fontSize: '12px', fontWeight: 700 }}
                />
                {frequencyViewMode !== 'cumulative' && (
                  <ReferenceLine
                    y={thirtyDaysStats.avgDaily}
                    stroke="#818cf8"
                    strokeDasharray="4 4"
                    label={{
                      value: `Promedio: ${thirtyDaysStats.avgDaily}/d`,
                      position: 'insideTopRight',
                      fill: '#4f46e5',
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  />
                )}

                {frequencyViewMode === 'total' && (
                  <Line
                    type="monotone"
                    dataKey="executions"
                    name="Frecuencia Diaria de Ejecuciones"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ r: 3, fill: '#6366f1' }}
                    activeDot={{ r: 6, fill: '#4338ca', stroke: '#c7d2fe', strokeWidth: 2 }}
                  />
                )}

                {frequencyViewMode === 'split' && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="successful"
                      name="Ejecuciones Exitosas"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 3, fill: '#10b981' }}
                      activeDot={{ r: 6, fill: '#059669', stroke: '#a7f3d0', strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="failed"
                      name="Reintentos / Observaciones"
                      stroke="#f43f5e"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={{ r: 2.5, fill: '#f43f5e' }}
                      activeDot={{ r: 5 }}
                    />
                  </>
                )}

                {frequencyViewMode === 'cumulative' && (
                  <Line
                    type="monotone"
                    dataKey="cumulative"
                    name="Ejecuciones Acumuladas (30 Días)"
                    stroke="#8b5cf6"
                    strokeWidth={3.5}
                    dot={{ r: 3, fill: '#8b5cf6' }}
                    activeDot={{ r: 6, fill: '#6d28d9', stroke: '#ddd6fe', strokeWidth: 2 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Subheader for Multi-Version Performance Curves */}
      <div className="pt-2 border-t border-slate-200">
        <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
          <GitBranch className="w-4 h-4 text-indigo-600" />
          <span>Curvas de Rendimiento Multi-Versión (v1.0 vs v2.0 vs v3.0)</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Métricas históricas de efectividad y latencia entre diferentes configuraciones del prompt.
        </p>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
            <span>Tasa de Éxito (v3.0 Activa)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-900">
              {kpiStats.latestV3Success}%
            </span>
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              +{kpiStats.successGainVsV1}% vs v1.0
            </span>
          </div>
          <p className="text-[11px] text-emerald-700">
            Respuestas validadas sin alucinaciones ni errores de formato
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-amber-900">
            <span>Latencia Media (v3.0)</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {kpiStats.latestV3Latency} ms
            </span>
            <span className="text-xs font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              -{kpiStats.latencyReductionPct}% tiempo
            </span>
          </div>
          <p className="text-[11px] text-amber-800">
            Ahorro promedio de {kpiStats.latencySavedMs} ms por respuesta frente a v1.0
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
            <span>Evolución de Calidad</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black text-indigo-950">
              +{kpiStats.improvementTrend}%
            </span>
            <span className="text-xs font-semibold text-indigo-700">en {displayedChartData.length} cortes</span>
          </div>
          <p className="text-[11px] text-indigo-700">
            Mejora continua con plantillas parametrizadas Gemini 3.8 Flash
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Muestras & Corridas</span>
            <Zap className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {kpiStats.totalSamples}
            </span>
            <span className="text-xs font-semibold text-slate-500">ejecuciones medidas</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Telemetría acumulada en todas las versiones activas
          </p>
        </div>
      </div>

      {/* Main Recharts LineChart Container */}
      <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <GitBranch className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-extrabold text-slate-900">
              {chartMode === 'dual'
                ? 'Curvas Comparativas: Tasa de Éxito (%) vs Latencia Promedio (ms)'
                : chartMode === 'success'
                ? 'Evolución de Tasa de Éxito (%) por Versión del Prompt'
                : 'Evolución de Latencia Promedio de Respuesta (ms) por Versión'}
            </h3>
          </div>
          <div className="flex items-center space-x-3 text-[11px] font-semibold text-slate-500">
            {chartMode === 'dual' && (
              <>
                <span className="flex items-center space-x-1">
                  <span className="w-3 h-0.5 bg-emerald-600 inline-block" />
                  <span>Línea sólida: % Éxito (Eje Izq.)</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-3 h-0.5 border-b-2 border-dashed border-amber-500 inline-block" />
                  <span>Línea punteada: Latencia ms (Eje Der.)</span>
                </span>
              </>
            )}
          </div>
        </div>

        <div className="h-88 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'dual' ? (
              <LineChart
                data={displayedChartData}
                margin={{ top: 15, right: 25, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="dateLabel"
                  stroke="#64748b"
                  fontSize={12}
                  fontWeight={600}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  domain={[65, 100]}
                  unit="%"
                  stroke="#059669"
                  fontSize={12}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[300, 1600]}
                  unit=" ms"
                  stroke="#d97706"
                  fontSize={12}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomAnalyticsTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '14px', fontSize: '12px', fontWeight: 700 }}
                />

                {/* Success Rate Lines (Left Axis - Solid) */}
                {visibleVersions.v1 && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="v1SuccessRate"
                    name="v1.0 Éxito (%)"
                    stroke="#64748b"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#64748b' }}
                    activeDot={{ r: 6 }}
                  />
                )}
                {visibleVersions.v2 && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="v2SuccessRate"
                    name="v2.0 Éxito (%)"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#4f46e5' }}
                    activeDot={{ r: 6 }}
                  />
                )}
                {visibleVersions.v3 && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="v3SuccessRate"
                    name="v3.0 Éxito (%)"
                    stroke="#10b981"
                    strokeWidth={3.5}
                    dot={{ r: 5, fill: '#10b981' }}
                    activeDot={{ r: 7 }}
                  />
                )}

                {/* Latency Lines (Right Axis - Dashed) */}
                {visibleVersions.v1 && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="v1LatencyMs"
                    name="v1.0 Latencia (ms)"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 3, fill: '#94a3b8' }}
                  />
                )}
                {visibleVersions.v2 && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="v2LatencyMs"
                    name="v2.0 Latencia (ms)"
                    stroke="#818cf8"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 3, fill: '#818cf8' }}
                  />
                )}
                {visibleVersions.v3 && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="v3LatencyMs"
                    name="v3.0 Latencia (ms)"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    strokeDasharray="5 5"
                    dot={{ r: 4, fill: '#f59e0b' }}
                  />
                )}
              </LineChart>
            ) : chartMode === 'success' ? (
              <LineChart
                data={displayedChartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="dateLabel"
                  stroke="#64748b"
                  fontSize={12}
                  fontWeight={600}
                  tickLine={false}
                />
                <YAxis
                  domain={[70, 100]}
                  unit="%"
                  stroke="#059669"
                  fontSize={12}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomAnalyticsTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '14px', fontSize: '12px', fontWeight: 700 }}
                />
                <ReferenceLine
                  y={95}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  label={{
                    value: 'Meta SLA Calidad (95%)',
                    position: 'top',
                    fill: '#047857',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                />
                {visibleVersions.v1 && (
                  <Line
                    type="monotone"
                    dataKey="v1SuccessRate"
                    name="v1.0 Configuración Base (%)"
                    stroke="#64748b"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                )}
                {visibleVersions.v2 && (
                  <Line
                    type="monotone"
                    dataKey="v2SuccessRate"
                    name="v2.0 Few-Shot Optimizada (%)"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    dot={{ r: 4.5 }}
                  />
                )}
                {visibleVersions.v3 && (
                  <Line
                    type="monotone"
                    dataKey="v3SuccessRate"
                    name="v3.0 Producción Flash (%)"
                    stroke="#10b981"
                    strokeWidth={3.5}
                    dot={{ r: 5 }}
                  />
                )}
              </LineChart>
            ) : (
              <LineChart
                data={displayedChartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="dateLabel"
                  stroke="#64748b"
                  fontSize={12}
                  fontWeight={600}
                  tickLine={false}
                />
                <YAxis
                  domain={[350, 1550]}
                  unit=" ms"
                  stroke="#d97706"
                  fontSize={12}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomAnalyticsTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '14px', fontSize: '12px', fontWeight: 700 }}
                />
                <ReferenceLine
                  y={800}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  label={{
                    value: 'Objetivo SLA Baja Latencia (<800 ms)',
                    position: 'top',
                    fill: '#b45309',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                />
                {visibleVersions.v1 && (
                  <Line
                    type="monotone"
                    dataKey="v1LatencyMs"
                    name="v1.0 Latencia Media (ms)"
                    stroke="#64748b"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                )}
                {visibleVersions.v2 && (
                  <Line
                    type="monotone"
                    dataKey="v2LatencyMs"
                    name="v2.0 Latencia Media (ms)"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    dot={{ r: 4.5 }}
                  />
                )}
                {visibleVersions.v3 && (
                  <Line
                    type="monotone"
                    dataKey="v3LatencyMs"
                    name="v3.0 Latencia Media (ms)"
                    stroke="#f59e0b"
                    strokeWidth={3.5}
                    dot={{ r: 5 }}
                  />
                )}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Version Breakdown Table & Live Execution Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Left 7 Cols: Version Performance Breakdown */}
        <div className="lg:col-span-7 bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Rendimiento Comparativo por Iteración</span>
              </h3>
              <p className="text-xs text-slate-500">
                {selectedPrompt
                  ? `Versiones registradas para "${selectedPrompt.title}"`
                  : 'Promedios consolidados de todas las iteraciones del catálogo'}
              </p>
            </div>
            {selectedPrompt && onExecutePrompt && (
              <button
                onClick={() => onExecutePrompt(selectedPrompt)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer"
              >
                <span>Abrir en Ejecutor</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-extrabold">
                  <th className="py-2.5 pr-3">Versión / Iteración</th>
                  <th className="py-2.5 px-3">Modelo IA</th>
                  <th className="py-2.5 px-3">Tasa de Éxito</th>
                  <th className="py-2.5 px-3">Latencia Media</th>
                  <th className="py-2.5 pl-3 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 font-medium">
                <tr className="bg-emerald-50/50">
                  <td className="py-3 pr-3">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                      <div>
                        <span className="font-extrabold text-slate-900 block">
                          v3.0 • Optimizada Flash
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Restricciones negativas + salida estructurada
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-mono text-[11px]">
                      <Cpu className="w-3 h-3 text-indigo-600" />
                      <span>gemini-3.8-flash</span>
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-black text-emerald-700 text-sm">
                      {kpiStats.latestV3Success}%
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-amber-700">
                    {kpiStats.latestV3Latency} ms
                  </td>
                  <td className="py-3 pl-3 text-right">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] border border-emerald-300">
                      Óptima Activa
                    </span>
                  </td>
                </tr>

                <tr>
                  <td className="py-3 pr-3">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-800 block">
                          v2.0 • Few-Shot Estructurada
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Con ejemplos de contexto y variables tipadas
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-mono text-[11px]">
                      <Cpu className="w-3 h-3 text-indigo-600" />
                      <span>gemini-3.8-flash</span>
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-extrabold text-indigo-700">
                      {displayedChartData[displayedChartData.length - 1]?.v2SuccessRate}%
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-semibold text-slate-700">
                    {displayedChartData[displayedChartData.length - 1]?.v2LatencyMs} ms
                  </td>
                  <td className="py-3 pl-3 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[10px] border border-indigo-200">
                      Iteración #2
                    </span>
                  </td>
                </tr>

                <tr>
                  <td className="py-3 pr-3">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-700 block">
                          v1.0 • Configuración Base
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Plantilla original sin anclajes de latencia
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-mono text-[11px]">
                      <Cpu className="w-3 h-3 text-slate-400" />
                      <span>gpt-4o / base</span>
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-600">
                      {displayedChartData[displayedChartData.length - 1]?.v1SuccessRate}%
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600">
                    {displayedChartData[displayedChartData.length - 1]?.v1LatencyMs} ms
                  </td>
                  <td className="py-3 pl-3 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px]">
                      Histórica
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* If a specific prompt has custom saved versions, list quick switch buttons */}
          {selectedPrompt && selectedPrompt.versions && selectedPrompt.versions.length > 0 && (
            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-slate-600">
                Versiones guardadas de este prompt ({selectedPrompt.versions.length}):
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {selectedPrompt.versions.map((v) => {
                  const isCurrent = v.id === selectedPrompt.currentVersionId;
                  return (
                    <button
                      key={v.id}
                      onClick={() =>
                        onSwitchPromptVersion && onSwitchPromptVersion(selectedPrompt.id, v.id)
                      }
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white hover:bg-indigo-50 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {v.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right 5 Cols: Recent Telemetry Log */}
        <div className="lg:col-span-5 bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Últimas Corridas Medidas</span>
              </h3>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Tiempo Real
              </span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {telemetryLogs.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-white border border-slate-200/90 flex items-center justify-between gap-2 shadow-2xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <p className="text-xs font-extrabold text-slate-800 truncate">
                        {item.promptTitle}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="font-semibold text-indigo-700">{item.versionLabel}</span>
                      <span>•</span>
                      <span>{item.timestamp}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-mono">
                    <span className="text-xs font-black text-emerald-700 block">
                      {item.qualityScore}% éxito
                    </span>
                    <span className="text-[11px] font-bold text-amber-600 block">
                      {item.latencyMs} ms
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Latencia medida de extremo a extremo (API + Render)</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
