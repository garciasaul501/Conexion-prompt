import React, { useState } from 'react';
import { Check, Sparkles, Tag, RefreshCw, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
import { UserSubscription } from '../types';
import { PRICING_TIERS } from '../data/mockDatabase';

interface PricingPageProps {
  subscription: UserSubscription;
  onUpdateSubscription: (
    newPlan: string,
    newStatus?: 'active' | 'canceled',
    details?: Partial<UserSubscription>
  ) => void;
  onGoToVerify?: () => void;
}

const CHECKOUT_BASE = 'https://whop.com/checkout';
const WHOP_PLAN_IDS: Record<string, string> = {
  '10': 'plan_SIfpnGTuD8aqA',
  '30': 'plan_ICnjxZQ83eiJR',
  '50': 'plan_q5j9FOvuIZmaQ',
  '100': 'plan_NnHFpV95rjcod',
  '500': 'plan_22ppS98N4577w',
  '1000': 'plan_8dSaYNyZiabrU',
};
const WHOP_DISCOUNT_CODE = 'WHOP40';

export const PricingPage: React.FC<PricingPageProps> = ({ subscription, onUpdateSubscription }) => {
  const [tierCategoryFilter, setTierCategoryFilter] = useState<'all' | 'creators' | 'agencies'>('all');
  const [email, setEmail] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const openCheckout = (tierId: string) => {
    const planId = WHOP_PLAN_IDS[tierId];
    if (planId) window.open(`${CHECKOUT_BASE}/${planId}`, '_blank', 'noopener');
  };

  const activateFromWhop = async () => {
    setChecking(true);
    setResult(null);
    try {
      const res = await fetch(`/api/whop/entitlement?email=${encodeURIComponent(email.trim())}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        setResult({ ok: false, text: data.error || 'No se pudo verificar tu suscripción.' });
      } else if (data.active) {
        onUpdateSubscription(data.tier, 'active', {
          paymentMethod: 'whop',
          monthlyPromptQuota: data.quota,
          ...(data.currentPeriodEnd ? { currentPeriodEnd: data.currentPeriodEnd } : {}),
        });
        setResult({ ok: true, text: `¡Listo! Plan ${data.planName} activo: ${data.quota} prompts al mes.` });
      } else {
        setResult({ ok: false, text: data.message || 'No encontramos una suscripción activa.' });
      }
    } catch {
      setResult({ ok: false, text: 'Error de conexión. Intenta de nuevo.' });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-12 pb-16 max-w-6xl mx-auto">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Elige tu Plan y <span className="text-amber-500">Suscríbete</span>
        </h1>
        <p className="text-slate-600 text-sm font-medium">
          Pago seguro con Whop. Cancela cuando quieras desde tu cuenta de Whop.
        </p>
      </div>

      <div className="rounded-3xl bg-amber-50 border-2 border-amber-300 p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-start gap-3">
          <Tag className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-950">
            <p className="font-extrabold">40% de descuento de por vida para la comunidad</p>
            <p className="text-xs mt-1">
              En el checkout de Whop escribe el código <strong className="font-mono">{WHOP_DISCOUNT_CODE}</strong> antes de pagar.
            </p>
          </div>
        </div>
        <a href="https://whop.com/@saulmente" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold">
          Mi comunidad en Whop <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="rounded-3xl bg-white border border-slate-200 p-6 space-y-3">
        <p className="text-sm font-extrabold text-slate-900">
          Plan actual: <span className="uppercase">{String(subscription.planType)}</span> ({subscription.status}) · Cuota:{' '}
          {subscription.usedPromptsThisMonth} / {subscription.monthlyPromptQuota} prompts este mes.
        </p>
        <p className="text-xs text-slate-600">
          ¿Ya pagaste en Whop? Escribe el correo con el que compraste y activamos tu plan.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="correo-de-tu-compra@email.com"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-indigo-500" />
          <button onClick={activateFromWhop} disabled={checking || !email.trim()}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold disabled:opacity-50 inline-flex items-center justify-center gap-2">
            {checking && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            Activar mi plan
          </button>
        </div>
        {result && (
          <p className={`text-xs font-bold flex items-center gap-1.5 ${result.ok ? 'text-emerald-600' : 'text-rose-600'}`}>
            {result.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {result.text}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Elige el plan que mejor impulsa tus ganancias</h2>
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          {([['all', 'Todos los planes'], ['creators', 'Esenciales'], ['agencies', 'Agencias y escala']] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTierCategoryFilter(id)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                tierCategoryFilter === id ? 'bg-white text-indigo-700 shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {PRICING_TIERS.filter((tier) => {
          if (tierCategoryFilter === 'creators') return ['free', '10', '30', '50'].includes(tier.id);
          if (tierCategoryFilter === 'agencies') return ['100', '500', '1000'].includes(tier.id);
          return true;
        }).map((tier) => {
          const price = Math.round(tier.monthlyBasePrice);
          const isCurrent = subscription.planType === tier.id;
          const isFeatured = tier.popular || tier.id === '50';
          return (
            <div key={tier.id}
              className={`relative rounded-3xl p-6 flex flex-col justify-between space-y-6 ${
                isFeatured
                  ? 'bg-gradient-to-b from-amber-50/80 via-white to-white border-2 border-amber-400 shadow-xl shadow-amber-500/10'
                  : 'bg-white border border-slate-200 shadow-xs'
              }`}>
              {tier.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-slate-800 text-white">
                  {tier.badge}
                </div>
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
                  <span className={`text-3xl font-black ${isFeatured ? 'text-amber-600' : 'text-slate-900'}`}>
                    ${tier.id === 'free' ? 0 : price}
                  </span>
                  <span className="text-xs text-slate-500">/mes{tier.id === 'free' ? ' (sin tarjeta)' : ''}</span>
                </div>
                {tier.id !== 'free' && (
                  <p className="text-[11px] font-bold text-emerald-600 mt-1">
                    Con {WHOP_DISCOUNT_CODE}: ${Math.round(price * 0.6)}/mes
                  </p>
                )}
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
              <div className="pt-3 border-t border-slate-100 mt-auto">
                {tier.id === 'free' ? (
                  <button disabled className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-500 font-bold text-xs">
                    {isCurrent ? 'Plan actual (5 prompts)' : 'Incluido gratis'}
                  </button>
                ) : (
                  <button onClick={() => openCheckout(tier.id)}
                    className="w-full py-3.5 px-4 rounded-2xl font-black text-sm shadow-lg shadow-amber-400/25 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 border-2 border-amber-400 cursor-pointer">
                    <Sparkles className="w-4 h-4 fill-current shrink-0" />
                    <span>Suscribirte • ${price}/mes</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
