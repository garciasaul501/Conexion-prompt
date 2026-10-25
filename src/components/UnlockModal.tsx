import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Tag,
  X,
  KeyRound,
  User,
  Zap,
} from 'lucide-react';
import { UserSubscription } from '../types';
import { PLAN_CREDENTIALS } from './PricingPage';

interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: UserSubscription;
  onUpdateSubscription: (
    newPlan: string,
    newStatus?: 'active' | 'canceled',
    details?: Partial<UserSubscription>
  ) => void;
  onNavigateToPricing: () => void;
}

const PLAN_OPTIONS = [
  { id: '10', shortName: 'Plan 10', name: 'Starter Pack 10', quota: 10 },
  { id: '30', shortName: 'Plan 30', name: 'Creador Básico 30', quota: 30 },
  { id: '50', shortName: 'Plan 50', name: 'Creador Pro 50', quota: 50 },
  { id: '100', shortName: 'Plan 100', name: 'Business Booster 100', quota: 100 },
  { id: '500', shortName: 'Plan 500', name: 'Agencia Master 500', quota: 500 },
  { id: '1000', shortName: 'Plan 1000', name: 'VIP Enterprise 1000', quota: 1000 },
];

export const UnlockModal: React.FC<UnlockModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onUpdateSubscription,
  onNavigateToPricing,
}) => {
  const [selectedTierId, setSelectedTierId] = useState<string>('50');
  const [username, setUsername] = useState<string>(PLAN_CREDENTIALS['50'].username);
  const [password, setPassword] = useState<string>(PLAN_CREDENTIALS['50'].password);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isUnlocked = subscription.planType !== 'free';

  const handleSelectPlan = (tierId: string) => {
    setSelectedTierId(tierId);
    const creds = PLAN_CREDENTIALS[tierId];
    if (creds) {
      setUsername(creds.username);
      setPassword(creds.password);
    }
    setStatusMessage(null);
  };

  const handleActivateSelectedPlan = () => {
    const plan = PLAN_OPTIONS.find((p) => p.id === selectedTierId) || PLAN_OPTIONS[2];
    if (!username.trim() || !password.trim()) {
      setStatusMessage('Por favor verifica que el usuario y password estén escritos.');
      return;
    }
    onUpdateSubscription(plan.id, 'active', {
      paymentMethod: 'whop',
      monthlyPromptQuota: plan.quota,
    });
    setStatusMessage(`¡${plan.name} (${plan.quota} prompts/mes) activado para ${username.trim()}!`);
  };

  const handleRelockFree = () => {
    onUpdateSubscription('free', 'active', {
      monthlyPromptQuota: 5,
      whopDiscountApplied: false,
    });
    setStatusMessage('Herramienta regresada a Modo Gratuito (5 prompts).');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Top Header Banner */}
        <div
          className={`p-6 sm:p-8 text-white relative overflow-hidden ${
            isUnlocked
              ? 'bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900'
              : 'bg-gradient-to-r from-amber-700 via-indigo-950 to-slate-900'
          }`}
        >
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <div
              className={`p-2.5 rounded-2xl ${
                isUnlocked
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
              }`}
            >
              {isUnlocked ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
            </div>
            <div>
              <span
                className={`text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-block ${
                  isUnlocked
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                }`}
              >
                {isUnlocked
                  ? `⚡ Estado: PLAN ${String(subscription.planType).toUpperCase()} ACTIVO`
                  : '🔒 Estado: PLAN GRATUITO'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                {isUnlocked ? '¡Acceso Total Activo!' : 'Acceso a Planes y Suscribirte'}
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-200 mt-2 leading-relaxed">
            Selecciona cualquier plan para cargar su usuario y password automáticamente y pulsa{' '}
            <strong>Activar</strong>.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {statusMessage && (
            <div className="p-4 rounded-2xl border bg-emerald-50 border-emerald-300 text-emerald-900 text-xs sm:text-sm flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="flex-1 font-bold">{statusMessage}</div>
            </div>
          )}

          {/* Direct Plan Access Box with Pre-filled Credentials */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-amber-400 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4" />
                <span>Acceso por Plan (Usuario y Password ya escritos)</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Listo para activar
              </span>
            </div>

            {/* Plan Selector Pills */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {PLAN_OPTIONS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPlan(p.id)}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer border ${
                    selectedTierId === p.id
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {p.shortName}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-300 mb-1">
                  Usuario:
                </label>
                <div className="relative flex items-center">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-300 mb-1">
                  Password:
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleActivateSelectedPlan}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>
                Activar {PLAN_OPTIONS.find((p) => p.id === selectedTierId)?.name} (
                {PLAN_OPTIONS.find((p) => p.id === selectedTierId)?.quota} Prompts/mes)
              </span>
            </button>
          </div>

          {/* Main Golden CTA Button */}
          <div className="text-center">
            <button
              onClick={() => {
                onClose();
                onNavigateToPricing();
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-400/30 border-2 border-amber-300 flex items-center justify-center space-x-2.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950 fill-current" />
              <span>Ver Todos los Planes y Suscribirte</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-2">
              <div className="space-y-1">
                <span className="text-xs font-extrabold text-slate-900 flex items-center space-x-1.5">
                  <Tag className="w-4 h-4 text-amber-600" />
                  <span>Checkout Seguro con Whop</span>
                </span>
                <p className="text-[11px] text-slate-600">
                  Usa el código <strong className="font-mono">WHOP40</strong> para 40% de descuento.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200 flex flex-col justify-between space-y-2">
              <div className="space-y-1">
                <span className="text-xs font-extrabold text-slate-900">
                  ⚡ Whop @saulmente (-40% OFF)
                </span>
              </div>
              <a
                href="https://whop.com/@saulmente"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs flex items-center justify-center space-x-1.5 text-center"
              >
                <span>Mi comunidad en Whop</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Quick Access Toggle */}
          <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Control Rápido:</span>
            </div>

            <div className="flex items-center gap-2">
              {isUnlocked && (
                <button
                  onClick={handleRelockFree}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-600" />
                  <span>Cambiar a Modo Free</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
