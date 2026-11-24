import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  X,
  User,
  Eye,
  EyeOff,
} from 'lucide-react';
import { UserSubscription } from '../types';
import { buildDirectPayPalCheckoutUrl } from './PricingPage';
import { validateAdminCredentials } from '../utils/adminAuth';
import { useLanguage } from '../i18n/LanguageContext';

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
  { id: '10', shortName: '10', name: 'Starter Pack 10', quota: 10, priceUsd: 9 },
  { id: '30', shortName: '30', name: 'Creador Básico 30', quota: 30, priceUsd: 19 },
  { id: '50', shortName: '50', name: 'Creador Pro 50', quota: 50, priceUsd: 29 },
  { id: '100', shortName: '100', name: 'Business Booster 100', quota: 100, priceUsd: 49 },
  { id: '500', shortName: '500', name: 'Agencia Master 500', quota: 500, priceUsd: 149 },
  { id: '1000', shortName: '1000', name: 'VIP Enterprise 1000', quota: 1000, priceUsd: 249 },
];

export const UnlockModal: React.FC<UnlockModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onUpdateSubscription,
  onNavigateToPricing,
}) => {
  const { t } = useLanguage();
  const [selectedTierId, setSelectedTierId] = useState<string>('50');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ ok: boolean; text: string } | null>(null);

  if (!isOpen) return null;

  const isUnlocked = subscription.planType !== 'free';
  const currentSelectedPlan =
    PLAN_OPTIONS.find((p) => p.id === selectedTierId) || PLAN_OPTIONS[2];

  const checkoutUrl = buildDirectPayPalCheckoutUrl({
    tierId: currentSelectedPlan.id,
    tierName: currentSelectedPlan.name,
    promptsCount: currentSelectedPlan.quota,
    priceUsd: currentSelectedPlan.priceUsd,
  });

  const handleSelectPlan = (tierId: string) => {
    setSelectedTierId(tierId);
    setStatusMessage(null);
  };

  const handleActivateSelectedPlan = () => {
    const plan = PLAN_OPTIONS.find((p) => p.id === selectedTierId) || PLAN_OPTIONS[2];
    const validation = validateAdminCredentials(username, password, selectedTierId);

    if (!validation.success) {
      setStatusMessage({ ok: false, text: validation.message });
      return;
    }

    onUpdateSubscription(plan.id, 'active', {
      paymentMethod: 'paypal',
      monthlyPromptQuota: validation.quota || plan.quota,
    });

    setStatusMessage({
      ok: true,
      text: validation.message,
    });
  };

  const handleRelockFree = () => {
    onUpdateSubscription('free', 'active', {
      monthlyPromptQuota: 5,
    });
    setStatusMessage({
      ok: true,
      text: t.unlockModal.relockedMsg,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Clean Header */}
        <div className="p-6 border-b border-slate-200 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold">
              {isUnlocked ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-700">
                  <Unlock className="w-3.5 h-3.5" />
                  <span>
                    {t.unlockModal.statusActive} · {String(subscription.planType).toUpperCase()}
                  </span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-slate-600">
                  <Lock className="w-3.5 h-3.5" />
                  <span>{t.unlockModal.statusFree}</span>
                </span>
              )}
            </div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              {isUnlocked ? t.unlockModal.titleActive : t.unlockModal.titleFree}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">{t.unlockModal.subtitle}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label={t.unlockModal.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2.5 ${
                statusMessage.ok
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {statusMessage.ok ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Plan Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-700">
              {t.unlockModal.selectPlanLabel}
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {PLAN_OPTIONS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPlan(p.id)}
                  className={`py-2 px-2 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer border tabular-nums ${
                    selectedTierId === p.id
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {p.shortName}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 tabular-nums">
              {currentSelectedPlan.name} · {currentSelectedPlan.quota} prompts · $
              {currentSelectedPlan.priceUsd} USD
            </p>
          </div>

          {/* PayPal Direct Payment Primary Button */}
          <a
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center justify-center transition-colors text-center"
          >
            {t.unlockModal.payPaypalBtn} · ${currentSelectedPlan.priceUsd} USD
          </a>

          {/* Credentials Access Section */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">{t.unlockModal.adminHeader}</span>
              <span className="text-slate-400">{t.unlockModal.privateEncrypted}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  {t.unlockModal.userLabel}
                </label>
                <div className="relative flex items-center">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="user@domain.com"
                    className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  {t.unlockModal.passLabel}
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-8 pr-9 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleActivateSelectedPlan}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              {t.unlockModal.unlockPlanBtn} {currentSelectedPlan.name}
            </button>
          </div>

          {/* Footer Links */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToPricing();
              }}
              className="font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              {t.unlockModal.viewAllPlansBtn}
            </button>

            <div className="flex items-center gap-3">
              {isUnlocked && (
                <button
                  type="button"
                  onClick={handleRelockFree}
                  className="text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                >
                  {t.unlockModal.switchFreeBtn}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
              >
                {t.unlockModal.close}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
