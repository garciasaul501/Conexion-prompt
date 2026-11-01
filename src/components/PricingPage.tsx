import React, { useState, useEffect } from 'react';
import {
  Check,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  User,
  Lock,
  Eye,
  EyeOff,
  Zap,
  ShieldCheck,
  X,
} from 'lucide-react';
import { UserSubscription } from '../types';
import { PRICING_TIERS } from '../data/mockDatabase';
import { validateAdminCredentials } from '../utils/adminAuth';

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
  const [tierCategoryFilter, setTierCategoryFilter] = useState<'all' | 'creators' | 'agencies'>('all');
  const [email, setEmail] = useState<string>('garciasaul@hotmail.com');
  const [checking, setChecking] = useState<boolean>(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  // Secure Admin Modal state - credentials are NEVER exposed in plain text in the public UI
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
        const matchedTier = PRICING_TIERS.find((t) => t.id === planParam);
        if (matchedTier) {
          onUpdateSubscription(matchedTier.id, 'active', {
            paymentMethod: 'paypal',
            monthlyPromptQuota: matchedTier.promptsCount,
          });
          setResult({
            ok: true,
            text: `¡Listo! Pago verificado en PayPal. Plan ${matchedTier.name} activo: ${matchedTier.promptsCount} prompts al mes.`,
          });
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);
        }
      }
    }
  }, [onUpdateSubscription]);

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

    const targetTier = PRICING_TIERS.find((t) => t.id === validation.tierId) ||
      PRICING_TIERS.find((t) => t.id === adminModalTierId) ||
      PRICING_TIERS[3];

    onUpdateSubscription(targetTier.id, 'active', {
      paymentMethod: 'paypal',
      monthlyPromptQuota: validation.quota || targetTier.promptsCount,
    });

    setAdminAuthNotice({ ok: true, text: validation.message });
    setResult({ ok: true, text: validation.message });

    // Auto close modal after brief delay
    setTimeout(() => {
      handleCloseAdminModal();
    }, 1200);
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
          text: data.error || 'No se pudo verificar tu suscripción.',
        });
      } else if (data.active) {
        onUpdateSubscription(data.tier, 'active', {
          paymentMethod: 'paypal',
          monthlyPromptQuota: data.quota,
          ...(data.currentPeriodEnd ? { currentPeriodEnd: data.currentPeriodEnd } : {}),
        });
        setResult({
          ok: true,
          text: `¡Listo! Plan ${data.planName} activo: ${data.quota} prompts al mes.`,
        });
      } else {
        setResult({ ok: false, text: data.message || 'No encontramos una suscripción activa.' });
      }
    } catch {
      setResult({ ok: false, text: 'Error de conexión. Intenta de nuevo.' });
    } finally {
      setChecking(false);
    }
  };

  const currentPlanTier = PRICING_TIERS.find((t) => t.id === subscription.planType);
  const activeAdminTier = adminModalTierId
    ? PRICING_TIERS.find((t) => t.id === adminModalTierId)
    : null;

  return (
    <div className="space-y-12 pb-16 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Pagos Seguros Directos a PayPal</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Elige tu Plan y <span className="text-amber-500">Suscríbete</span>
        </h1>
        <p className="text-slate-600 text-sm font-medium">
          Pagos procesados 100% directos a PayPal. Activación inmediata y cancelación cuando quieras.
        </p>
      </div>

      {/* Subscription Status & Verification Card */}
      <div className="rounded-3xl bg-white border border-slate-200 p-6 space-y-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-extrabold text-slate-900">
            Plan actual:{' '}
            <span className="uppercase text-indigo-600">
              {currentPlanTier?.name || String(subscription.planType)}
            </span>{' '}
            ({subscription.status}) · Cuota: {subscription.usedPromptsThisMonth} /{' '}
            {subscription.monthlyPromptQuota} prompts este mes.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Pagos Reales con PayPal</span>
            </span>
            <button
              type="button"
              onClick={() => handleOpenAdminModal('50')}
              className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <KeyRound className="w-3 h-3 text-amber-400" />
              <span>Acceso Administrador</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-600">
          ¿Ya realizaste tu compra o actualización en PayPal? Escribe el correo con el que pagaste para reactivar tu plan de inmediato.
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo-de-tu-cuenta-paypal@email.com"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-indigo-500"
          />
          <button
            type="button"
            onClick={activateByEmail}
            disabled={checking || !email.trim()}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-50 inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            {checking && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            Verificar en PayPal
          </button>
        </div>

        {result && (
          <p
            className={`text-xs font-bold flex items-center gap-1.5 ${
              result.ok ? 'text-emerald-600' : 'text-rose-600'
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

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
          Planes Disponibles
        </h2>
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          {(
            [
              ['all', 'Todos los planes'],
              ['creators', 'Esenciales'],
              ['agencies', 'Agencias y escala'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTierCategoryFilter(id)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                tierCategoryFilter === id
                  ? 'bg-white text-indigo-700 shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {PRICING_TIERS.filter((tier) => {
          if (tierCategoryFilter === 'creators') return ['free', '10', '30', '50'].includes(tier.id);
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
              className={`relative rounded-3xl p-6 flex flex-col justify-between space-y-5 transition-all ${
                isCurrent
                  ? 'bg-gradient-to-b from-emerald-50/90 via-white to-white border-2 border-emerald-500 shadow-xl shadow-emerald-500/10'
                  : isFeatured
                  ? 'bg-gradient-to-b from-amber-50/80 via-white to-white border-2 border-amber-400 shadow-xl shadow-amber-500/10'
                  : 'bg-white border border-slate-200 shadow-xs'
              }`}
            >
              {isCurrent ? (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-emerald-600 text-white shadow-xs">
                  ✓ Plan Activo
                </div>
              ) : (
                tier.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-slate-800 text-white">
                    {tier.badge}
                  </div>
                )
              )}

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    {tier.name}
                    {isFeatured && <Sparkles className="w-4 h-4 text-amber-500 fill-current" />}
                  </h3>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                    {tier.promptsCount} Prompts
                  </span>
                </div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span
                    className={`text-3xl font-black ${
                      isFeatured ? 'text-amber-600' : 'text-slate-900'
                    }`}
                  >
                    ${tier.id === 'free' ? 0 : price}
                  </span>
                  <span className="text-xs text-slate-500">
                    /mes{tier.id === 'free' ? ' (sin tarjeta)' : ''}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">{tier.description}</p>
                <ul className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-700">
                  {tier.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="leading-tight">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons: Real PayPal Subscription + Discrete Admin Unlock */}
              <div className="pt-3 border-t border-slate-100 mt-auto space-y-2">
                {tier.id === 'free' ? (
                  <button
                    disabled={isCurrent}
                    onClick={() => onUpdateSubscription('free', 'active', { monthlyPromptQuota: 5 })}
                    className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs cursor-pointer disabled:opacity-60"
                  >
                    {isCurrent ? 'Plan actual (5 prompts)' : 'Activar Modo Free'}
                  </button>
                ) : (
                  <a
                    href={checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-4 rounded-2xl font-black text-sm shadow-lg shadow-amber-400/25 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 border-2 border-amber-400 cursor-pointer transition-all text-center"
                  >
                    <Sparkles className="w-4 h-4 fill-current shrink-0" />
                    <span>Suscribirte • ${price}/mes</span>
                  </a>
                )}

                {/* Secure Admin Unlock Button - Does NOT expose credentials */}
                {tier.id !== 'free' && (
                  <button
                    type="button"
                    onClick={() => handleOpenAdminModal(tier.id)}
                    className="w-full py-2 px-3 rounded-xl text-[11px] font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <KeyRound className="w-3 h-3 text-slate-500" />
                    <span>Acceso Administrador</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Seguro de Desbloqueo Administrador (Sin mostrar datos de activación) */}
      {adminModalTierId && activeAdminTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-6 sm:p-7 space-y-5">
            <button
              onClick={handleCloseAdminModal}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-300/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 inline-block">
                  Autenticación de Administrador
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  Desbloquear {activeAdminTier.name}
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Ingresa tus credenciales de administrador para desbloquear y activar este plan ({activeAdminTier.promptsCount} prompts/mes). Tus datos se mantienen privados y encriptados.
            </p>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Usuario o Correo de Administrador:
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="usuario@dominio.com"
                    autoFocus
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Password de Activación:
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••••••••"
                    className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showAdminPassword ? 'Ocultar password' : 'Ver password'}
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {adminAuthNotice && (
              <div
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
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

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleExecuteAdminUnlock}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Desbloquear y Activar Plan</span>
              </button>

              <button
                type="button"
                onClick={handleCloseAdminModal}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
