import React, { useState } from 'react';
import {
  Check,
  Sparkles,
  Tag,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  User,
  Lock,
  Eye,
  EyeOff,
  Zap,
} from 'lucide-react';
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

export interface PlanCredentialConfig {
  username: string;
  password: string;
  label: string;
  quota: number;
}

export const PLAN_CREDENTIALS: Record<string, PlanCredentialConfig> = {
  free: {
    username: 'demo@conexionwhop.com',
    password: 'FREE-5-DEMO',
    label: 'Plan Gratuito (5 Prompts)',
    quota: 5,
  },
  '10': {
    username: 'garcciassaul7@gmail.com',
    password: 'WHOP-10-ACTIVO',
    label: 'Starter Pack 10',
    quota: 10,
  },
  '30': {
    username: 'creador30@conexionwhop.com',
    password: 'WHOP-30-ACTIVO',
    label: 'Creador Básico 30',
    quota: 30,
  },
  '50': {
    username: 'pro50@conexionwhop.com',
    password: 'WHOP-50-PRO',
    label: 'Creador Pro 50',
    quota: 50,
  },
  '100': {
    username: 'business100@conexionwhop.com',
    password: 'WHOP-100-VIP',
    label: 'Business Booster 100',
    quota: 100,
  },
  '500': {
    username: 'agencia500@conexionwhop.com',
    password: 'WHOP-500-MASTER',
    label: 'Agencia Master 500',
    quota: 500,
  },
  '1000': {
    username: 'enterprise1000@conexionwhop.com',
    password: 'WHOP-1000-CORP',
    label: 'VIP Enterprise 1000',
    quota: 1000,
  },
};

export const PricingPage: React.FC<PricingPageProps> = ({ subscription, onUpdateSubscription }) => {
  const [tierCategoryFilter, setTierCategoryFilter] = useState<'all' | 'creators' | 'agencies'>('all');
  const [email, setEmail] = useState('garcciassaul7@gmail.com');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  // Per-plan access panel state (pre-filled with username and password for each plan)
  const [openAccessTierId, setOpenAccessTierId] = useState<string | null>('10');
  const [credentialsByTier, setCredentialsByTier] = useState<
    Record<string, { username: string; password: string }>
  >(() => {
    const initial: Record<string, { username: string; password: string }> = {};
    for (const [tierId, cred] of Object.entries(PLAN_CREDENTIALS)) {
      initial[tierId] = { username: cred.username, password: cred.password };
    }
    return initial;
  });
  const [showPasswordByTier, setShowPasswordByTier] = useState<Record<string, boolean>>({});
  const [cardNoticeByTier, setCardNoticeByTier] = useState<
    Record<string, { ok: boolean; text: string }>
  >({});

  const openCheckout = (tierId: string) => {
    const planId = WHOP_PLAN_IDS[tierId];
    if (planId) window.open(`${CHECKOUT_BASE}/${planId}`, '_blank', 'noopener');
  };

  const handleToggleAccessPanel = (tierId: string) => {
    setOpenAccessTierId((prev) => (prev === tierId ? null : tierId));
    // Ensure pre-filled values are always ready if cleared
    setCredentialsByTier((prev) => {
      const defaults = PLAN_CREDENTIALS[tierId] || {
        username: `plan${tierId}@conexionwhop.com`,
        password: `WHOP-${tierId}-ACTIVO`,
      };
      const curr = prev[tierId];
      if (!curr || (!curr.username && !curr.password)) {
        return {
          ...prev,
          [tierId]: { username: defaults.username, password: defaults.password },
        };
      }
      return prev;
    });
  };

  const handleActivateWithCredentials = (tierId: string, tierName: string, promptsCount: number) => {
    const creds = credentialsByTier[tierId] || PLAN_CREDENTIALS[tierId];
    const userVal = (creds?.username || '').trim();
    const passVal = (creds?.password || '').trim();

    if (!userVal || !passVal) {
      setCardNoticeByTier((prev) => ({
        ...prev,
        [tierId]: { ok: false, text: 'Ingresa usuario y password para activar el plan.' },
      }));
      return;
    }

    onUpdateSubscription(tierId, 'active', {
      paymentMethod: tierId === 'free' ? undefined : 'whop',
      monthlyPromptQuota: promptsCount,
    });

    const successMsg = `¡Acceso activado! ${tierName} (${promptsCount} prompts/mes) activo para ${userVal}.`;
    setCardNoticeByTier((prev) => ({
      ...prev,
      [tierId]: { ok: true, text: successMsg },
    }));
    setResult({ ok: true, text: successMsg });
  };

  const activateFromWhop = async () => {
    setChecking(true);
    setResult(null);
    try {
      const res = await fetch(`/api/whop/entitlement?email=${encodeURIComponent(email.trim())}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        const msg = data.error || 'No se pudo verificar tu suscripción.';
        setResult({ ok: false, text: data.detail ? `${msg} (${data.detail})` : msg });
      } else if (data.active) {
        onUpdateSubscription(data.tier, 'active', {
          paymentMethod: 'whop',
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

  return (
    <div className="space-y-12 pb-16 max-w-6xl mx-auto">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Elige tu Plan y <span className="text-amber-500">Suscríbete</span>
        </h1>
        <p className="text-slate-600 text-sm font-medium">
          Pago seguro con Whop o activa tu acceso directo en cada plan con usuario y password pre-cargados.
        </p>
      </div>

      <div className="rounded-3xl bg-amber-50 border-2 border-amber-300 p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-start gap-3">
          <Tag className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-950">
            <p className="font-extrabold">40% de descuento de por vida para la comunidad</p>
            <p className="text-xs mt-1">
              En el checkout de Whop escribe el código{' '}
              <strong className="font-mono">{WHOP_DISCOUNT_CODE}</strong> antes de pagar.
            </p>
          </div>
        </div>
        <a
          href="https://whop.com/@saulmente"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
        >
          Mi comunidad en Whop <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="rounded-3xl bg-white border border-slate-200 p-6 space-y-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-extrabold text-slate-900">
            Plan actual: <span className="uppercase text-indigo-600">{String(subscription.planType)}</span> (
            {subscription.status}) · Cuota: {subscription.usedPromptsThisMonth} /{' '}
            {subscription.monthlyPromptQuota} prompts este mes.
          </p>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            ✓ Credenciales de acceso listas en cada plan
          </span>
        </div>
        <p className="text-xs text-slate-600">
          ¿Ya pagaste en Whop? Verifica con tu correo o pulsa el botón <strong>Acceso</strong> en cualquiera de los planes de abajo (con usuario y password ya escritos) y haz clic en <strong>Activar</strong>.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo-de-tu-compra@email.com"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={activateFromWhop}
            disabled={checking || !email.trim()}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-50 inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            {checking && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            Activar mi plan por correo
          </button>
        </div>
        {result && (
          <p
            className={`text-xs font-bold flex items-center gap-1.5 ${
              result.ok ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {result.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{result.text}</span>
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
          Elige el plan que mejor impulsa tus ganancias
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {PRICING_TIERS.filter((tier) => {
          if (tierCategoryFilter === 'creators') return ['free', '10', '30', '50'].includes(tier.id);
          if (tierCategoryFilter === 'agencies') return ['100', '500', '1000'].includes(tier.id);
          return true;
        }).map((tier) => {
          const price = Math.round(tier.monthlyBasePrice);
          const isCurrent = subscription.planType === tier.id;
          const isFeatured = tier.popular || tier.id === '50';
          const isAccessOpen = openAccessTierId === tier.id;
          const tierCreds = credentialsByTier[tier.id] ||
            PLAN_CREDENTIALS[tier.id] || {
              username: `plan${tier.id}@conexionwhop.com`,
              password: `WHOP-${tier.id}-ACTIVO`,
            };
          const showPass = showPasswordByTier[tier.id] ?? true;
          const cardNotice = cardNoticeByTier[tier.id];

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

              <div className="pt-3 border-t border-slate-100 mt-auto space-y-2.5">
                {tier.id === 'free' ? (
                  <button
                    disabled={isCurrent}
                    onClick={() => handleToggleAccessPanel(tier.id)}
                    className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs cursor-pointer disabled:opacity-60"
                  >
                    {isCurrent ? 'Plan actual (5 prompts)' : 'Incluido gratis'}
                  </button>
                ) : (
                  <button
                    onClick={() => openCheckout(tier.id)}
                    className="w-full py-3.5 px-4 rounded-2xl font-black text-sm shadow-lg shadow-amber-400/25 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 border-2 border-amber-400 cursor-pointer transition-all"
                  >
                    <Sparkles className="w-4 h-4 fill-current shrink-0" />
                    <span>Suscribirte • ${price}/mes</span>
                  </button>
                )}

                {/* Botón Acceso en cada plan */}
                <button
                  type="button"
                  onClick={() => handleToggleAccessPanel(tier.id)}
                  className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                    isAccessOpen
                      ? 'bg-slate-900 text-amber-300 border-slate-900 shadow-md'
                      : isCurrent
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {isAccessOpen
                      ? 'Ocultar Acceso'
                      : isCurrent
                      ? 'Acceso Activo (Ver Usuario y Password)'
                      : 'Acceso • Activar con Usuario y Password'}
                  </span>
                </button>

                {/* Panel de Acceso con Usuario y Password ya escritos */}
                {isAccessOpen && (
                  <div className="mt-2 p-3.5 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3 shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                        <KeyRound className="w-3 h-3" /> Acceso Directo • {tier.name}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Pre-llenado
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 mb-1">
                          Usuario / Correo:
                        </label>
                        <div className="relative flex items-center">
                          <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                          <input
                            type="text"
                            value={tierCreds.username}
                            onChange={(e) =>
                              setCredentialsByTier((prev) => ({
                                ...prev,
                                [tier.id]: {
                                  ...tierCreds,
                                  username: e.target.value,
                                },
                              }))
                            }
                            className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 mb-1">
                          Password / Clave de Acceso:
                        </label>
                        <div className="relative flex items-center">
                          <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                          <input
                            type={showPass ? 'text' : 'password'}
                            value={tierCreds.password}
                            onChange={(e) =>
                              setCredentialsByTier((prev) => ({
                                ...prev,
                                [tier.id]: {
                                  ...tierCreds,
                                  password: e.target.value,
                                },
                              }))
                            }
                            className="w-full pl-8 pr-9 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPasswordByTier((prev) => ({
                                ...prev,
                                [tier.id]: !showPass,
                              }))
                            }
                            className="absolute right-2.5 text-slate-400 hover:text-white cursor-pointer"
                            title={showPass ? 'Ocultar password' : 'Mostrar password'}
                          >
                            {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleActivateWithCredentials(tier.id, tier.name, tier.promptsCount)
                      }
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer transition-all"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Activar {tier.name} ({tier.promptsCount} Prompts)</span>
                    </button>

                    {cardNotice && (
                      <div
                        className={`p-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5 ${
                          cardNotice.ok
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {cardNotice.ok ? (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span>{cardNotice.text}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
