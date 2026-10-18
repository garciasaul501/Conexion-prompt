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
} from 'lucide-react';
import { UserSubscription } from '../types';

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

export const UnlockModal: React.FC<UnlockModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onUpdateSubscription,
  onNavigateToPricing,
}) => {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isUnlocked = subscription.planType !== 'free';

  const handleInstantUnlockPro = () => {
    onUpdateSubscription('50', 'active', {
      paymentMethod: 'whop',
      monthlyPromptQuota: 50,
      whopDiscountApplied: true,
      whopUsername: '@saulmente',
      discountPercent: 40,
    });
    setStatusMessage('¡Herramienta Desbloqueada al instante! Plan 50 Prompts activo.');
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
                {isUnlocked ? '⚡ Estado: ACTIVO' : '🔒 Estado: PLAN GRATUITO'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                {isUnlocked ? '¡Acceso Total Activo!' : 'Planes y Suscribirte'}
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-200 mt-2 leading-relaxed">
            {isUnlocked
              ? 'Tu suscripción está activa con acceso completo al Optimizador IA, Control de Versiones y descargas PDF.'
              : 'Elige tu plan con pago seguro en Whop y aprovecha el 40% de descuento con el código WHOP40.'}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {statusMessage && (
            <div className="p-4 rounded-2xl border bg-emerald-50 border-emerald-300 text-emerald-900 text-xs sm:text-sm flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="flex-1 font-bold">{statusMessage}</div>
            </div>
          )}

          {/* Main Golden CTA Button */}
          <div className="text-center space-y-3">
            <button
              onClick={() => {
                onClose();
                onNavigateToPricing();
              }}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-base shadow-xl shadow-amber-400/30 border-2 border-amber-300 flex items-center justify-center space-x-2.5 transition-all transform hover:scale-[1.02] cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-slate-950 fill-current" />
              <span>Planes y Suscribirte</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <span className="text-xs font-extrabold text-slate-900 flex items-center space-x-1.5">
                  <Tag className="w-4 h-4 text-amber-600" />
                  <span>Checkout Seguro con Whop</span>
                </span>
                <p className="text-[11px] text-slate-600">
                  Usa el código <strong className="font-mono">WHOP40</strong> para 40% de descuento y activa tu plan con tu correo.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onNavigateToPricing();
                }}
                className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer"
              >
                Ver Planes y Activar
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <span className="text-xs font-extrabold text-slate-900">
                  ⚡ Whop @saulmente (-40% OFF)
                </span>
                <p className="text-[11px] text-slate-600">
                  40% de descuento de por vida para miembros de la comunidad.
                </p>
              </div>
              <a
                href="https://whop.com/@saulmente"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs flex items-center justify-center space-x-1.5 text-center"
              >
                <span>Mi comunidad en Whop</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Quick Access Toggle */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Control Rápido:</span>
            </div>

            <div className="flex items-center gap-2">
              {!isUnlocked ? (
                <button
                  onClick={handleInstantUnlockPro}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Activar Modo Pro</span>
                </button>
              ) : (
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
