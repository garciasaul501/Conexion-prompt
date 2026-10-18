import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  Activity,
  Zap,
  TrendingUp,
  CreditCard,
  Sparkles,
  BarChart3,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { UserSubscription, MonthlyExecutionRecord } from '../types';
import { INITIAL_MONTHLY_EXECUTION_HISTORY } from '../data/mockDatabase';

interface ExecutionQuotaChartProps {
  subscription: UserSubscription;
  onUpgradeClick: () => void;
  onSimulateExecution?: () => void;
}

type ChartViewMode = 'comparison' | 'percentage' | 'categories';

export const ExecutionQuotaChart: React.FC<ExecutionQuotaChartProps> = ({
  subscription,
  onUpgradeClick,
  onSimulateExecution,
}) => {
  const [viewMode, setViewMode] = useState<ChartViewMode>('comparison');
  const [timeRange, setTimeRange] = useState<'6m' | 'all'>('6m');

  // Compute live data merging history with current real-time subscription
  const currentUsed = subscription.usedPromptsThisMonth;
  const currentQuota = subscription.monthlyPromptQuota;
  const remainingCredits = Math.max(0, currentQuota - currentUsed);
  const usagePercentage = currentQuota > 0 ? Math.min(100, Math.round((currentUsed / currentQuota) * 100)) : 0;

  // Build reactive dataset
  const rawData: MonthlyExecutionRecord[] = INITIAL_MONTHLY_EXECUTION_HISTORY.map((item) => {
    if (item.isCurrent) {
      return {
        ...item,
        executed: currentUsed,
        quota: currentQuota,
        marketingExecutions: Math.max(1, Math.round(currentUsed * 0.45)),
        salesExecutions: Math.round(currentUsed * 0.3),
        socialExecutions: Math.round(currentUsed * 0.15),
        agentsExecutions: Math.max(0, currentUsed - Math.round(currentUsed * 0.45) - Math.round(currentUsed * 0.3) - Math.round(currentUsed * 0.15)),
      };
    }
    return item;
  });

  const chartData = timeRange === '6m' ? rawData.slice(-6) : rawData;

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload as MonthlyExecutionRecord;
      const rate = dataPoint.quota > 0 ? Math.round((dataPoint.executed / dataPoint.quota) * 100) : 0;
      const left = Math.max(0, dataPoint.quota - dataPoint.executed);

      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 text-xs space-y-2 min-w-[210px] animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-extrabold text-amber-400 text-xs">{dataPoint.month}</span>
            {dataPoint.isCurrent && (
              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                En Curso
              </span>
            )}
          </div>

          <div className="space-y-1.5 pt-0.5">
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block" />
                <span>Prompts Ejecutados:</span>
              </span>
              <strong className="text-white font-mono text-xs">{dataPoint.executed}</strong>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" />
                <span>Cuota del Plan:</span>
              </span>
              <strong className="text-amber-300 font-mono text-xs">{dataPoint.quota}</strong>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span>Tasa de Uso:</span>
              <span className={`font-mono font-bold ${rate >= 90 ? 'text-rose-400' : rate >= 70 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {rate}%
              </span>
            </div>

            <div className="flex justify-between items-center pt-1 border-t border-slate-800 text-[11px] text-slate-400">
              <span>Disponibles en el mes:</span>
              <span className="font-semibold text-slate-200">{left} prompts</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
      
      {/* Top Header & Navigation */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-bold uppercase tracking-wider">
            <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Métricas & Dashboard de Consumo Recharts</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Historial Mensual de Ejecuciones vs Cuota</span>
          </h2>
          <p className="text-xs text-slate-500">
            Seguimiento de prompts ejecutados frente al límite contratado de tu plan ({subscription.monthlyPromptQuota} prompts/mes).
          </p>
        </div>

        {/* View Mode Pill Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center space-x-1 text-xs">
            <button
              onClick={() => setViewMode('comparison')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === 'comparison'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Barras Comparativas
            </button>
            <button
              onClick={() => setViewMode('percentage')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === 'percentage'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              % Tasa de Uso
            </button>
            <button
              onClick={() => setViewMode('categories')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === 'categories'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Por Categoría IA
            </button>
          </div>

          <button
            onClick={() => setTimeRange(timeRange === '6m' ? 'all' : '6m')}
            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
          >
            {timeRange === '6m' ? 'Ver 6 Meses' : 'Ver Todo el Historial'}
          </button>
        </div>
      </div>

      {/* KPI Stats Cards Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Executed this Month */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Ejecutados este Mes</span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{currentUsed}</span>
            <span className="text-xs text-slate-500 font-semibold">prompts</span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
            <span>Mes actual en curso</span>
          </div>
        </div>

        {/* Card 2: Plan Quota */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Cuota Mensual del Plan</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-600">{currentQuota}</span>
            <span className="text-xs text-slate-500 font-semibold">límite / mes</span>
          </div>
          <div className="text-[11px] text-slate-600 font-bold flex items-center space-x-1">
            <span>Plan:</span>
            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 uppercase text-[10px]">
              {subscription.planType === 'free' ? 'Prueba 5' : `Plan ${subscription.planType}`}
            </span>
          </div>
        </div>

        {/* Card 3: Remaining Prompts */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Créditos Disponibles</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700">{remainingCredits}</span>
            <span className="text-xs text-slate-500 font-semibold">restantes</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-medium">
            Listos para ejecutar con IA
          </div>
        </div>

        {/* Card 4: Usage Rate & Upgrade CTA */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-slate-50 to-amber-50/50 border border-indigo-200/80 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Tasa de Consumo</span>
              <span className={`font-mono ${usagePercentage >= 90 ? 'text-rose-600' : usagePercentage >= 70 ? 'text-amber-600' : 'text-indigo-600'}`}>
                {usagePercentage}%
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-200 h-2 rounded-full mt-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  usagePercentage >= 90
                    ? 'bg-rose-500'
                    : usagePercentage >= 70
                    ? 'bg-amber-400'
                    : 'bg-indigo-600'
                }`}
                style={{ width: `${Math.max(4, usagePercentage)}%` }}
              />
            </div>
          </div>

          <button
            onClick={onUpgradeClick}
            className="w-full py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center space-x-1 transition-all shadow-xs"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Aumentar Cuota</span>
          </button>
        </div>
      </div>

      {/* Main Recharts Visualization Canvas */}
      <div className="bg-slate-50/60 border border-slate-200 rounded-2xl p-4 sm:p-6">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'comparison' ? (
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="shortMonth"
                  stroke="#64748b"
                  fontSize={12}
                  fontWeight={600}
                  tickLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  fontWeight={500}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '12px', fontSize: '12px', fontWeight: 600 }}
                  formatter={(value) => {
                    if (value === 'executed') return 'Prompts Ejecutados';
                    if (value === 'quota') return 'Cuota Mensual del Plan';
                    return value;
                  }}
                />
                <ReferenceLine
                  y={currentQuota}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  label={{
                    value: `Cuota Actual (${currentQuota})`,
                    position: 'top',
                    fill: '#d97706',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                />
                <Bar
                  dataKey="executed"
                  name="executed"
                  fill="#4f46e5"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={45}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isCurrent ? '#6366f1' : '#4f46e5'}
                      stroke={entry.isCurrent ? '#4338ca' : 'transparent'}
                      strokeWidth={entry.isCurrent ? 2 : 0}
                    />
                  ))}
                </Bar>
                <Bar
                  dataKey="quota"
                  name="quota"
                  fill="#fde68a"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  radius={[8, 8, 0, 0]}
                  maxBarSize={45}
                />
              </BarChart>
            ) : viewMode === 'percentage' ? (
              <BarChart
                data={chartData.map((item) => ({
                  ...item,
                  rate: item.quota > 0 ? Math.round((item.executed / item.quota) * 100) : 0,
                }))}
                margin={{ top: 20, right: 30, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="shortMonth" stroke="#64748b" fontSize={12} fontWeight={600} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  fontWeight={500}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                  unit="%"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '12px', fontSize: '12px', fontWeight: 600 }}
                  formatter={() => 'Porcentaje de Utilización de Cuota (%)'}
                />
                <ReferenceLine
                  y={80}
                  stroke="#ef4444"
                  strokeDasharray="3 3"
                  label={{ value: 'Alerta Cuota Alta (80%)', position: 'top', fill: '#dc2626', fontSize: 11, fontWeight: 700 }}
                />
                <Bar dataKey="rate" name="rate" radius={[8, 8, 0, 0]} maxBarSize={45}>
                  {chartData.map((entry, index) => {
                    const r = entry.quota > 0 ? (entry.executed / entry.quota) * 100 : 0;
                    const fillColor = r >= 90 ? '#f43f5e' : r >= 70 ? '#f59e0b' : '#10b981';
                    return <Cell key={`pct-${index}`} fill={fillColor} />;
                  })}
                </Bar>
              </BarChart>
            ) : (
              /* Stacked Categories Mode */
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="shortMonth" stroke="#64748b" fontSize={12} fontWeight={600} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} fontWeight={500} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '12px', fontSize: '12px', fontWeight: 600 }}
                  formatter={(val) => {
                    if (val === 'marketingExecutions') return 'Marketing & Contenido';
                    if (val === 'salesExecutions') return 'Ventas & Cierre';
                    if (val === 'socialExecutions') return 'TikTok / Redes';
                    if (val === 'agentsExecutions') return 'Agentes IA';
                    return val;
                  }}
                />
                <Bar dataKey="marketingExecutions" stackId="a" fill="#4f46e5" radius={[0, 0, 0, 0]} maxBarSize={45} />
                <Bar dataKey="salesExecutions" stackId="a" fill="#0ea5e9" radius={[0, 0, 0, 0]} maxBarSize={45} />
                <Bar dataKey="socialExecutions" stackId="a" fill="#ec4899" radius={[0, 0, 0, 0]} maxBarSize={45} />
                <Bar dataKey="agentsExecutions" stackId="a" fill="#f59e0b" radius={[8, 8, 0, 0]} maxBarSize={45} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart Footer Highlights & Interactive Demo Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Cada ejecución con Google Gemini 3.8 Flash descuenta 1 crédito de tu cuota mensual. Renovación automática cada 30 días.
          </span>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {onSimulateExecution && (
            <button
              onClick={onSimulateExecution}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold transition-all"
              title="Simula la ejecución de un prompt para ver cómo sube la barra en tiempo real"
            >
              <Play className="w-3.5 h-3.5 text-amber-600 fill-current" />
              <span>Simular Ejecución (+1)</span>
            </button>
          )}

          <button
            onClick={onUpgradeClick}
            className="inline-flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 font-bold underline"
          >
            <span>Ver Planes Disponibles</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
