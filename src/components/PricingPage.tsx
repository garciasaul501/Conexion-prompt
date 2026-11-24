import React, { useState, useEffect } from 'react';
import {
  Check,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Lock,
  KeyRound,
  User,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';
import { PRICING_TIERS } from '../data/mockDatabase';
import { UserSubscription } from '../types';
import { validateAdminCredentials } from '../utils/adminAuth';
import { useLanguage } from '../i18n/LanguageContext';

interface PricingPageProps {
  subscription: UserSubscription;
  onUpdateSubscription: (
    newPlan: string,
    newStatus?: 'active' | 'canceled',
    details?: Partial<UserSubscription>
  ) => void;
  onGoToVerify?: () => void;
}

const DEFAULT_MERCHANT_EMAIL = 'garciasaul@hotmail.com';

export function buildDirectPayPalCheckoutUrl(params: {
  tierId: string;
  tierName: string;
  promptsCount: number;
  priceUsd: number;
}): string {
  const { tierId, tierName, promptsCount, priceUsd } = params;
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://conexion-prompts.app';
  const returnUrl = `${origin}/?paid=1&plan=${encodeURIComponent(tierId)}`;
  const cancelUrl = `${origin}/?cancel=1`;
  const itemName = `Conexion Prompts - ${tierName} (${promptsCount} Prompts IA)`;

  const query = new URLSearchParams({
    cmd: '_xclick',
    business: DEFAULT_MERCHANT_EMAIL,
    item_name: itemName,
    item_number: `PLAN-${tierId}`,
    amount: priceUsd.toFixed(2),
    currency_code: 'USD',
    no_shipping: '1',
    no_note: '0',
    rm: '2',
    return: returnUrl,
    cancel_return: cancelUrl,
  });

  return `https://www.paypal.com/cgi-bin/webscr?${query.toString()}`;
}

export const PricingPage: React.FC<PricingPageProps> = ({
  subscription,
  onUpdateSubscription,
}) => {
  const { t } = useLanguage();
  const [tierCategoryFilter, setTierCategoryFilter] = useState<'all' | 'creators' | 'agencies'>('all');
  const [email, setEmail] = useState<string>('');
  const [checking, setChecking] = useState<boolean>(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const [adminModalTierId, setAdminModalTierId] = useState<string | null>(null);
  const [adminUsername, setAdminUsername] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [showAdminPassword, setShowAdminPassword] = useState<boolean>(false);
  const [adminAuthNotice, setAdminAuthNotice] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const paid = params.get('paid') || params.get('paypal_paid');
      const planParam = params.get('plan');
      if (paid === '1' && planParam) {
        const matchedTier = PRICING_TIERS.find((tier) => tier.id === planParam);
        if (matchedTier) {
          onUpdateSubscription(matchedTier.id, 'active', {
            paymentMethod: 'paypal',
            monthlyPromptQuota: matchedTier.promptsCount,
          });
          setResult({
            ok: true,
            text: `${t.pricing.verifySuccess} (${matchedTier.name} · ${matchedTier.promptsCount} ${t.pricing.promptsCountLabel})`,
          });
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);
        }
      }
    }
  }, [onUpdateSubscription, t.pricing.verifySuccess, t.pricing.promptsCountLabel]);

  const handleOpenAdminModal = (tierId: string) => {
    setAdminModalTierId(tierId);
    setAdminUsername('');
    setAdminPassword('');
    setShowAdminPassword(false);
    setAdminAuthNotice(null);
  };

  const handleCloseAdminModal = () => {
    setAdminModalTierId(null);
    setAdminUsername('');
    setAdminPassword('');
    setShowAdminPassword(false);
    setAdminAuthNotice(null);
  };

  const handleExecuteAdminUnlock = () => {
    if (!adminModalTierId) return;

    const validation = validateAdminCredentials(
      adminUsername,
      adminPassword,
      adminModalTierId
    );

    if (!validation.success) {
      setAdminAuthNotice({ ok: false, text: validation.message });
      return;
    }

    const targetTier =
      PRICING_TIERS.find((tier) => tier.id === validation.tierId) ||
      PRICING_TIERS.find((tier) => tier.id === adminModalTierId) ||
      PRICING_TIERS[3];

    onUpdateSubscription(targetTier.id, 'active', {
      paymentMethod: 'paypal',
      monthlyPromptQuota: validation.quota || targetTier.promptsCount,
    });

    setAdminAuthNotice({ ok: true, text: validation.message });
    setResult({ ok: true, text: validation.message });

    setTimeout(() => {
      handleCloseAdminModal();
    }, 1000);
  };

  const activateByEmail = async () => {
    setChecking(true);
    setResult(null);
    try {
      const res = await fetch('/api/paypal/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payerEmail: email.trim(),
          tierId: subscription.planType !== 'free' ? subscription.planType : '50',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setResult({
          ok: false,
          text: data.error || t.pricing.verifyErrorGeneric,
        });
      } else if (data.active) {
        onUpdateSubscription(data.tier, 'active', {
          paymentMethod: 'paypal',
          monthlyPromptQuota: data.quota,
          ...(data.currentPeriodEnd ? { currentPeriodEnd: data.currentPeriodEnd } : {}),
        });
        setResult({
          ok: true,
          text: `${t.pricing.verifySuccess} (${data.planName} · ${data.quota} ${t.pricing.promptsCountLabel})`,
        });
      } else {
        setResult({ ok: false, text: data.message || t.pricing.verifyNotFound });
      }
    } catch {
      setResult({ ok: false, text: t.pricing.verifyConnectionError });
    } finally {
      setChecking(false);
    }
  };

  const currentPlanTier = PRICING_TIERS.find((tier) => tier.id === subscription.planType);
  const activeAdminTier = adminModalTierId
    ? PRICING_TIERS.find((tier) => tier.id === adminModalTierId)
    : null;

  return (
    <div className="space-y-10 pb-16 max-w-6xl mx-auto">
      {/* Clean Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto pt-2">
        <p className="text-xs font-semibold text-indigo-600">{t.pricing.eyebrow}</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          {t.pricing.title}
        </h1>
        <p className="text-sm sm:text-base text-slate-600">{t.pricing.subtitle}</p>
      </div>

      {/* Subscription Status & PayPal Verification Bar */}
      <section className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-slate-700 tabular-nums">
            <span className="text-slate-500">{t.pricing.currentPlan}:</span>
            <span className="font-semibold text-slate-900">
              {currentPlanTier?.name || String(subscription.planType)}
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-slate-500">{t.pricing.quota}:</span>
            <span className="font-mono font-semibold text-slate-900">
              {subscription.usedPromptsThisMonth} / {subscription.monthlyPromptQuota}
            </span>
            <span className="text-slate-500 text-xs">{t.pricing.promptsThisMonth}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{t.pricing.verifiedPaypal}</span>
            </span>

            <button
              type="button"
              onClick={() => handleOpenAdminModal('50')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium transition-colors cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-500" />
              <span>{t.pricing.adminAccess}</span>
            </button>
          </div>
        </div>

        <div className="space-y-2.5">
          <p className="text-xs text-slate-600">{t.pricing.alreadyPaidPrompt}</p>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.pricing.emailPlaceholder}
              className="flex-1 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              type="button"
              onClick={activateByEmail}
              disabled={checking || !email.trim()}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold disabled:opacity-50 inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {checking && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{t.pricing.verifyPaypalBtn}</span>
            </button>
          </div>

          {result && (
            <p
              className={`text-xs font-medium flex items-center gap-1.5 pt-1 ${
                result.ok ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {result.ok ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{result.text}</span>
            </p>
          )}
        </div>
      </section>

      {/* Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="font-display text-xl font-bold text-slate-900">
          {t.pricing.availablePlans}
        </h2>
        <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium self-start sm:self-auto">
          {(
            [
              ['all', t.pricing.filterAll],
              ['creators', t.pricing.filterCreators],
              ['agencies', t.pricing.filterAgencies],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTierCategoryFilter(id)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                tierCategoryFilter === id
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {PRICING_TIERS.filter((tier) => {
          if (tierCategoryFilter === 'creators')
            return ['free', '10', '30', '50'].includes(tier.id);
          if (tierCategoryFilter === 'agencies') return ['100', '500', '1000'].includes(tier.id);
          return true;
        }).map((tier) => {
          const price = Math.round(tier.monthlyBasePrice);
          const isCurrent = subscription.planType === tier.id;
          const isFeatured = tier.popular || tier.id === '50';

          const checkoutUrl = buildDirectPayPalCheckoutUrl({
            tierId: tier.id,
            tierName: tier.name,
            promptsCount: tier.promptsCount,
            priceUsd: price,
          });

          return (
            <div
              key={tier.id}
              className={`rounded-2xl p-6 flex flex-col justify-between bg-white transition-all ${
                isCurrent
                  ? 'border-2 border-emerald-600'
                  : isFeatured
                  ? 'border-2 border-indigo-600 shadow-md'
                  : 'border border-slate-200'
              }`}
            >
              <div>
                {/* Top metadata line */}
                <div className="flex items-center justify-between gap-2 text-xs mb-2">
                  <span className="font-mono font-medium text-slate-500 tabular-nums">
                    {tier.promptsCount} {t.pricing.promptsCountLabel}
                  </span>
                  {isCurrent ? (
                    <span className="font-semibold text-emerald-700">
                      {t.pricing.activePlanBadge}
                    </span>
                  ) : isFeatured ? (
                    <span className="font-semibold text-indigo-600">Popular</span>
                  ) : null}
                </div>

                <h3 className="font-display text-base font-bold text-slate-900">{tier.name}</h3>

                <div className="mt-3 flex items-baseline gap-1 tabular-nums">
                  <span className="font-display text-3xl font-bold text-slate-900">
                    ${tier.id === 'free' ? 0 : price}
                  </span>
                  <span className="text-xs text-slate-500">
                    {t.pricing.perMonth}
                    {tier.id === 'free' ? ` · ${t.pricing.noCard}` : ''}
                  </span>
                </div>

                <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                  {tier.description}
                </p>

                <ul className="mt-5 pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-700">
                  {tier.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="pt-5 mt-6 border-t border-slate-100 space-y-2">
                {tier.id === 'free' ? (
                  <button
                    type="button"
                    disabled={isCurrent}
                    onClick={() =>
                      onUpdateSubscription('free', 'active', { monthlyPromptQuota: 5 })
                    }
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isCurrent ? t.pricing.currentPlanFree : t.pricing.activateFree}
                  </button>
                ) : (
                  <a
                    href={checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center transition-colors text-center ${
                      isFeatured
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {t.pricing.subscribePaypal} · ${price}
                    {t.pricing.perMonth}
                  </a>
                )}

                {tier.id !== 'free' && (
                  <button
                    type="button"
                    onClick={() => handleOpenAdminModal(tier.id)}
                    className="w-full py-2 px-3 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t.pricing.adminAccess}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Secure Admin Unlock Modal */}
      {adminModalTierId && activeAdminTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-5">
            <button
              type="button"
              onClick={handleCloseAdminModal}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label={t.pricing.cancel}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-indigo-600">
                {t.pricing.adminModalBadge}
              </p>
              <h3 className="font-display text-lg font-bold text-slate-900">
                {t.pricing.adminModalTitle} {activeAdminTier.name}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.pricing.adminModalBody} ({activeAdminTier.promptsCount}{' '}
                {t.pricing.promptsCountLabel})
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.pricing.adminUserLabel}
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="admin@email.com"
                    autoFocus
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.pricing.adminPassLabel}
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showAdminPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {adminAuthNotice && (
              <div
                className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  adminAuthNotice.ok
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {adminAuthNotice.ok ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                )}
                <span>{adminAuthNotice.text}</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleExecuteAdminUnlock}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                {t.pricing.adminUnlockBtn}
              </button>

              <button
                type="button"
                onClick={handleCloseAdminModal}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
              >
                {t.pricing.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
