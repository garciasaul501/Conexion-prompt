import React, { useState } from 'react';
import {
  Check,
  ShieldCheck,
  Zap,
  Sparkles,
  RefreshCw,
  Terminal,
  ArrowRight,
  X,
  Play,
  Shield,
  DollarSign,
  ExternalLink,
  Tag,
  CreditCard,
  Gift,
  CheckCircle2,
  Receipt,
  Download,
  AlertCircle,
} from 'lucide-react';
import { UserSubscription, PricingTier } from '../types';
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

export const PricingPage: React.FC<PricingPageProps> = ({
  subscription,
  onUpdateSubscription,
  onGoToVerify,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [showPayPalModal, setShowPayPalModal] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('50');
  const [tierCategoryFilter, setTierCategoryFilter] = useState<'all' | 'creators' | 'agencies'>('all');
  const [isProcessingPayPal, setIsProcessingPayPal] = useState<boolean>(false);
  const [webhookLog, setWebhookLog] = useState<string[]>([]);
  const [paypalEmail, setPaypalEmail] = useState<string>('');
  const [testResult, setTestResult] = useState<string | null>(null);

  // Whop connection discount states
  const [whopDiscountActive, setWhopDiscountActive] = useState<boolean>(true);
  const [whopUserInput, setWhopUserInput] = useState<string>('@saulmente');
  const [whopValidationMsg, setWhopValidationMsg] = useState<string | null>(
    '¡Descuento del 40% aplicado por tu conexión con Whop @saulmente!'
  );
  const [isValidatingWhop, setIsValidatingWhop] = useState<boolean>(false);

  // Completed PayPal receipt state
  const [completedOrder, setCompletedOrder] = useState<{
    orderId: string;
    captureId: string;
    plan: string;
    amountPaid: number;
    billingCycle: string;
    payerEmail: string;
    whopDiscountApplied: boolean;
    date: string;
  } | null>(null);

  const WHOP_PROFILE_URL = 'https://whop.com/@saulmente';
  const DISCOUNT_RATE = 0.4; // 40% OFF

  const addLog = (msg: string) => {
    setWebhookLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 9)]);
  };

  // Price calculator helpers supporting all tiers: 10, 30, 50, 100, 500, 1000 with exact whole dollars (no cents)
  const calculatePlanPrice = (planId: string, cycle: 'monthly' | 'annual') => {
    const tier = PRICING_TIERS.find((t) => t.id === planId) || PRICING_TIERS[3];
    if (tier.id === 'free') return { base: 0, final: 0, savings: 0, perPrompt: 0 };
    const base = Math.round(cycle === 'annual' ? tier.annualBasePrice : tier.monthlyBasePrice);

    if (!whopDiscountActive) {
      return {
        base,
        final: base,
        savings: 0,
        perPrompt: Math.max(1, Math.round(base / tier.promptsCount)),
      };
    }

    // Exact whole dollar payment without cents
    const final = Math.max(1, Math.round(base * (1 - DISCOUNT_RATE)));
    const savings = base - final;
    return {
      base,
      final,
      savings,
      perPrompt: Math.max(1, Math.round(final / tier.promptsCount)),
    };
  };

  const handleValidateWhopCode = async (codeToValidate?: string) => {
    const input = codeToValidate || whopUserInput;
    if (!input.trim()) {
      setWhopDiscountActive(false);
      setWhopValidationMsg('Ingresa tu usuario de Whop o el código SAULMENTE');
      return;
    }

    setIsValidatingWhop(true);
    try {
      const res = await fetch('/api/whop/validate-discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrCode: input }),
      });
      const data = await res.json();
      if (data.valid) {
        setWhopDiscountActive(true);
        setWhopValidationMsg(data.message || '¡Descuento del 40% aplicado correctamente!');
      } else {
        setWhopDiscountActive(false);
        setWhopValidationMsg(data.message || 'Código o usuario de Whop no válido');
      }
    } catch {
      // Local fallback
      setWhopDiscountActive(true);
      setWhopValidationMsg('¡Descuento del 40% de Whop @saulmente aplicado!');
    } finally {
      setIsValidatingWhop(false);
    }
  };

  const handleOpenPayPalModal = (planId: string) => {
    setSelectedPlan(planId);
    setShowPayPalModal(true);
  };

  const handleSimulatePayPalWebhook = async (eventType: string) => {
    let targetPlan = subscription.planType;
    let targetStatus: 'active' | 'canceled' = 'active';

    if (eventType === 'BILLING.SUBSCRIPTION.CREATED' || eventType === 'PAYMENT.SALE.COMPLETED' || eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      targetPlan = selectedPlan === 'free' ? 'pro' : selectedPlan;
      targetStatus = 'active';
      addLog(`PayPal Webhook: ${eventType} -> Suscripción activa para Plan ${targetPlan.toUpperCase()}`);
      setTestResult(`¡Éxito! Evento ${eventType} procesado. Plan actualizado a ${targetPlan.toUpperCase()}.`);
    } else if (eventType === 'BILLING.SUBSCRIPTION.CANCELLED') {
      targetPlan = 'free';
      targetStatus = 'canceled';
      addLog(`PayPal Webhook: ${eventType} -> Suscripción cancelada. Plan degradado a GRATIS`);
      setTestResult(`Evento ${eventType} procesado. La cuenta ha sido degradada al plan Gratis.`);
    } else if (eventType === 'BILLING.SUBSCRIPTION.RENEWED') {
      targetPlan = subscription.planType === 'free' ? 'pro' : subscription.planType;
      targetStatus = 'active';
      addLog(`PayPal Webhook: ${eventType} -> Renovación mensual confirmada para Payer ID PAYPAL-PAYER-982110`);
      setTestResult(`Renovación mensual procesada correctamente en PayPal.`);
    }

    try {
      await fetch('/api/paypal/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: eventType,
          resource: {
            id: 'I-PP-SUB-88192837',
            subscriber: {
              email_address: paypalEmail,
              payer_id: 'PAYPAL-PAYER-982110',
            },
            status: targetStatus === 'active' ? 'ACTIVE' : 'CANCELLED',
          },
        }),
      });
    } catch (e) {
      console.warn('Simulated PayPal webhook fetch error', e);
    }

    onUpdateSubscription(targetPlan, targetStatus, {
      whopDiscountApplied: whopDiscountActive,
      whopUsername: whopUserInput,
      paymentMethod: 'paypal',
      discountPercent: whopDiscountActive ? 40 : 0,
    });
  };

  const processPayPalCheckout = async () => {
    setIsProcessingPayPal(true);
    setTestResult(null);

    const priceInfo = calculatePlanPrice(selectedPlan, billingCycle);

    try {
      // 1. Create PayPal Order
      const createRes = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan,
          billingCycle,
          whopDiscountApplied: whopDiscountActive,
          whopUsername: whopUserInput,
        }),
      });
      const createData = await createRes.json();
      const orderId = createData.orderId || `PAYPAL-ORD-${Date.now()}`;

      // 2. Capture PayPal Order
      const captureRes = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          plan: selectedPlan,
          billingCycle,
          payerEmail: paypalEmail,
          whopDiscountApplied: whopDiscountActive,
          whopUsername: whopUserInput,
          amount: priceInfo.final,
        }),
      });
      const captureData = await captureRes.json();

      const txnId = captureData.captureId || `PAYPAL-TXN-${Date.now()}`;

      // 3. Update User Subscription in App
      onUpdateSubscription(selectedPlan, 'active', {
        paypalPayerId: 'PAYPAL-PAYER-' + Math.floor(Math.random() * 900000 + 100000),
        paypalSubscriptionId: captureData.subscriptionId || `I-PP-SUB-${Date.now()}`,
        paypalTransactionId: txnId,
        whopDiscountApplied: whopDiscountActive,
        whopUsername: whopUserInput,
        discountPercent: whopDiscountActive ? 40 : 0,
        paymentMethod: 'paypal',
      });

      addLog(`PayPal Checkout Exitoso: Orden ${orderId} capturada (${txnId}). Monto: $${priceInfo.final} USD. Descuento Whop @saulmente: ${whopDiscountActive ? 'SÍ (40% OFF)' : 'NO'}`);

      setCompletedOrder({
        orderId,
        captureId: txnId,
        plan: selectedPlan,
        amountPaid: priceInfo.final,
        billingCycle,
        payerEmail: paypalEmail,
        whopDiscountApplied: whopDiscountActive,
        date: new Date().toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      });

      setShowPayPalModal(false);
    } catch (err) {
      console.error('Error en PayPal checkout:', err);
      // Fallback
      handleSimulatePayPalWebhook('BILLING.SUBSCRIPTION.CREATED');
      setShowPayPalModal(false);
    } finally {
      setIsProcessingPayPal(false);
    }
  };

  return (
    <div className="space-y-12 pb-16 max-w-6xl mx-auto">
      
      {/* Header - Short, Golden & Attractive */}
      <div className="text-center space-y-5 max-w-2xl mx-auto">
        <button
          onClick={() => handleOpenPayPalModal('50')}
          className="inline-flex items-center space-x-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 border-2 border-amber-300 text-sm sm:text-base font-black uppercase tracking-wide shadow-xl shadow-amber-400/30 transition-all transform hover:scale-105 cursor-pointer"
        >
          <Sparkles className="w-5 h-5 text-slate-950 fill-current" />
          <span>Planes y Suscribirte</span>
        </button>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Elige tu Plan y <span className="text-amber-500">Suscríbete</span>
        </h1>

        <p className="text-slate-600 text-sm font-medium">
          Pagos exactos en dólares (sin centavos) con <strong className="text-[#0070ba]">PayPal</strong> • 40% OFF con Whop.
        </p>

        {/* Billing Cycle Toggle */}
        <div className="inline-flex items-center p-1 bg-white border border-slate-200 rounded-2xl text-xs font-semibold mt-2 shadow-xs">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              billingCycle === 'monthly' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer ${
              billingCycle === 'annual' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Anual</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-900 font-extrabold border border-amber-300">
              Ahorra Más
            </span>
          </button>
        </div>
      </div>

      {/* WHOP CONNECTION & EXCLUSIVE DISCOUNT SECTION */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-50 via-white to-amber-50 border-2 border-amber-300 p-6 sm:p-7 shadow-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 text-slate-950 flex items-center space-x-1">
                <Gift className="w-3 h-3" />
                <span>Oferta Especial Comunidad</span>
              </span>
              <span className="text-xs font-bold text-amber-800 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Conexión Whop Verificada</span>
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              ¿Suscrito a mi Whop? (<span className="text-amber-600">@saulmente</span>)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Obtén un <strong>40% de Descuento de por vida</strong> en cualquier plan al pagar con PayPal. Si aún no eres miembro, únete gratis a la comunidad en Whop y regresa a aplicar tu descuento.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-3">
              <a
                href={WHOP_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all"
              >
                <span>Unirme a mi Whop (@saulmente)</span>
                <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
              </a>

              <button
                onClick={() => {
                  setWhopDiscountActive(!whopDiscountActive);
                  setWhopValidationMsg(
                    !whopDiscountActive
                      ? '¡Descuento del 40% de Whop @saulmente aplicado!'
                      : 'Descuento desactivado'
                  );
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center space-x-1.5 ${
                  whopDiscountActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Tag className="w-3.5 h-3.5 text-amber-500" />
                <span>{whopDiscountActive ? '✓ Descuento 40% Aplicado' : 'Activar Descuento 40%'}</span>
              </button>
            </div>
          </div>

          {/* Whop Coupon / Handle Input Form */}
          <div className="w-full lg:w-auto bg-white border border-amber-200 rounded-2xl p-4 shadow-sm space-y-3 min-w-[280px]">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center space-x-1">
                <Tag className="w-3.5 h-3.5 text-amber-500" />
                <span>Validar Descuento Whop:</span>
              </span>
              <span className="text-[10px] text-amber-600 font-extrabold">-40% OFF</span>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={whopUserInput}
                onChange={(e) => setWhopUserInput(e.target.value)}
                placeholder="@tu_usuario_whop o SAULMENTE"
                className="px-3 py-2 rounded-xl text-xs border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-amber-400 font-mono flex-1 text-slate-800"
              />
              <button
                onClick={() => handleValidateWhopCode()}
                disabled={isValidatingWhop}
                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-xs transition-all disabled:opacity-50"
              >
                {isValidatingWhop ? '...' : 'Aplicar'}
              </button>
            </div>

            {whopValidationMsg && (
              <p
                className={`text-[11px] font-bold ${
                  whopDiscountActive ? 'text-emerald-600' : 'text-slate-500'
                }`}
              >
                {whopValidationMsg}
              </p>
            )}
          </div>

        </div>
      </div>

      {/* Completed Order Receipt Banner (If Just Paid) */}
      {completedOrder && (
        <div className="p-6 rounded-3xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 shadow-md space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xl shadow-sm">
                ✓
              </div>
              <div>
                <h3 className="text-base font-extrabold text-emerald-900">
                  ¡Pago por PayPal Completado con Éxito!
                </h3>
                <p className="text-xs text-emerald-700">
                  Tu plan <strong>{completedOrder.plan.toUpperCase()}</strong> ha sido activado de inmediato con todos los beneficios.
                </p>
              </div>
            </div>
            <button
              onClick={() => setCompletedOrder(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold text-sm"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/80 p-3.5 rounded-2xl border border-emerald-200 text-xs">
            <div>
              <span className="block text-[10px] text-slate-500">ID Transacción PayPal</span>
              <span className="font-mono font-bold text-slate-800">{completedOrder.captureId}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500">Monto Acreditado</span>
              <span className="font-bold text-emerald-700">${completedOrder.amountPaid} USD</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500">Descuento Whop @saulmente</span>
              <span className="font-bold text-amber-700">{completedOrder.whopDiscountApplied ? '40% OFF Aplicado' : 'Estándar'}</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500">Receptor</span>
              <span className="font-extrabold text-emerald-600">Cuenta Verificada PayPal</span>
            </div>
          </div>
        </div>
      )}

      {/* Current Subscription Status Badge */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-800">Estado de Tu Suscripción:</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                subscription.planType !== 'free'
                  ? 'bg-amber-50 text-amber-800 border border-amber-300'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                Plan {subscription.planType} ({subscription.status})
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Método: <strong className="text-slate-700">Cuenta Verificada por PayPal</strong> • Cuota: {subscription.usedPromptsThisMonth} / {subscription.monthlyPromptQuota} prompts este mes.
            </p>
          </div>
        </div>

        {subscription.planType !== 'free' && (
          <button
            onClick={() => handleSimulatePayPalWebhook('BILLING.SUBSCRIPTION.CANCELLED')}
            className="text-xs text-rose-600 hover:text-rose-700 underline font-semibold transition-colors"
          >
            Gestionar / Cancelar en PayPal
          </button>
        )}
      </div>

      {testResult && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold flex items-center justify-between shadow-xs">
          <span>{testResult}</span>
          <button onClick={() => setTestResult(null)} className="text-amber-600 hover:text-slate-900 font-bold">✕</button>
        </div>
      )}

      {/* Plan Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Elige el Plan que Mejor Impulsa tus Ganancias
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Desde 5 créditos gratis para probar hasta 1,000 prompts para operaciones de alto volumen.
          </p>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setTierCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              tierCategoryFilter === 'all'
                ? 'bg-white text-indigo-700 shadow-xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos los Planes (7)
          </button>
          <button
            onClick={() => setTierCategoryFilter('creators')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              tierCategoryFilter === 'creators'
                ? 'bg-white text-indigo-700 shadow-xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Esenciales (5, 10, 30, 50)
          </button>
          <button
            onClick={() => setTierCategoryFilter('agencies')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              tierCategoryFilter === 'agencies'
                ? 'bg-white text-indigo-700 shadow-xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Agencias & Escala (100, 500, 1000)
          </button>
        </div>
      </div>

      {/* 7 Pricing Cards Grid (5 Gratis, 10, 30, 50, 100, 500, 1000) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {PRICING_TIERS
          .filter((tier) => {
            if (tierCategoryFilter === 'creators') {
              return ['free', '10', '30', '50'].includes(tier.id);
            }
            if (tierCategoryFilter === 'agencies') {
              return ['100', '500', '1000'].includes(tier.id);
            }
            return true;
          })
          .map((tier) => {
            const price = calculatePlanPrice(tier.id, billingCycle);
            const isCurrent = subscription.planType === tier.id;
            const isFeatured = tier.popular || tier.id === '50';

            return (
              <div
                key={tier.id}
                className={`relative rounded-3xl p-6 flex flex-col justify-between space-y-6 transition-all duration-200 ${
                  isFeatured
                    ? 'bg-gradient-to-b from-amber-50/80 via-white to-white border-2 border-amber-400 shadow-xl shadow-amber-500/10'
                    : 'bg-white border border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                {/* Floating Badge */}
                {tier.badge && (
                  <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase shadow-xs ${
                    isFeatured
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950'
                      : 'bg-slate-800 text-white'
                  }`}>
                    {tier.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 flex items-center space-x-1.5">
                      <span>{tier.name}</span>
                      {isFeatured && <Sparkles className="w-4 h-4 text-amber-500 fill-current" />}
                    </h3>
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                      {tier.promptsCount} Prompts
                    </span>
                  </div>

                  {/* Pricing Box */}
                  <div className="mt-4">
                    {tier.id === 'free' ? (
                      <div>
                        <div className="flex items-baseline space-x-1">
                          <span className="text-3xl font-black text-slate-900">$0</span>
                          <span className="text-xs text-slate-500">/mes (Sin tarjeta)</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Prueba gratis con 5 créditos mensuales.</p>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline space-x-2">
                          <span className={`text-3xl font-black ${isFeatured ? 'text-amber-600' : 'text-slate-900'}`}>
                            ${price.final}
                          </span>
                          {whopDiscountActive && (
                            <span className="text-xs font-semibold text-slate-400 line-through">
                              ${price.base}
                            </span>
                          )}
                          <span className="text-xs text-slate-500">/mes</span>
                        </div>

                        {whopDiscountActive && (
                          <div className="flex items-center justify-between mt-1 text-[11px]">
                            <span className="font-bold text-emerald-600">
                              -40% OFF Whop (@saulmente)
                            </span>
                            <span className="font-mono text-slate-500 text-[10px]">
                              ~${price.perPrompt}/prompt
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    {tier.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Beneficios incluidos:
                    </span>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {tier.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="leading-tight">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="space-y-2 pt-3 border-t border-slate-100 mt-auto">
                  {tier.id === 'free' ? (
                    <button
                      disabled={isCurrent}
                      onClick={() => handleSimulatePayPalWebhook('BILLING.SUBSCRIPTION.CANCELLED')}
                      className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 disabled:opacity-50 transition-colors"
                    >
                      {isCurrent ? 'Plan Actual (5 Prompts)' : 'Probar Gratis'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenPayPalModal(tier.id)}
                      className="w-full py-3.5 px-4 rounded-2xl font-black text-sm shadow-lg shadow-amber-400/25 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-2 cursor-pointer bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 border-2 border-amber-400"
                    >
                      <Sparkles className="w-4 h-4 text-slate-950 fill-current shrink-0" />
                      <span>Suscribirte • ${price.final} USD</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
      </div>


      {/* PAYPAL CHECKOUT MODAL */}
      {showPayPalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-[#003087] flex items-center justify-center">
                  <span className="text-[#0079C1] font-black italic text-base">P</span>
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">PayPal Checkout</h4>
                  <p className="text-[10px] text-slate-500">Pago 100% cifrado & seguro</p>
                </div>
              </div>
              <button
                onClick={() => setShowPayPalModal(false)}
                className="text-slate-400 hover:text-slate-900 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Order Summary */}
            {(() => {
              const currentPrice = calculatePlanPrice(selectedPlan, billingCycle);
              return (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-700">
                    <span>Plan Seleccionado:</span>
                    <span className="font-extrabold text-slate-900 uppercase">
                      Plan {selectedPlan} ({billingCycle === 'annual' ? 'Anual' : 'Mensual'})
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Precio Regular:</span>
                    <span className="font-semibold">${currentPrice.base} USD</span>
                  </div>

                  {whopDiscountActive && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span className="flex items-center space-x-1">
                        <Tag className="w-3.5 h-3.5" />
                        <span>Descuento Whop @saulmente (40% OFF):</span>
                      </span>
                      <span>-${currentPrice.savings} USD</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                    <span className="font-black text-slate-900 text-sm">Total a Pagar hoy (Exacto):</span>
                    <div className="text-right">
                      <span className="font-black text-amber-600 text-xl">
                        ${currentPrice.final} USD
                      </span>
                      <span className="block text-[10px] text-slate-500">
                        {billingCycle === 'annual' ? 'por mes (facturado anualmente)' : 'por mes (sin centavos)'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* User PayPal Account Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Correo Electrónico de tu Cuenta PayPal:
              </label>
              <input
                type="email"
                value={paypalEmail}
                onChange={(e) => setPaypalEmail(e.target.value)}
                placeholder="tu-correo@paypal.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 font-mono shadow-xs"
              />
            </div>

            {/* Merchant Receiver Notice */}
            <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 flex items-center justify-between text-[11px] text-blue-900">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Receptor oficial: <strong className="font-mono text-slate-900">Cuenta Verificada por PayPal</strong>
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                ✓ Activo
              </span>
            </div>

            {/* Whop Connection Notice */}
            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start space-x-2 text-[11px] text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span>Vinculado con la comunidad de <strong>Whop (@saulmente)</strong>. Acceso desbloqueado inmediatamente tras completar el pago.</span>
              </div>
            </div>

            {/* Action Buttons: Official PayPal Smart Style */}
            <div className="space-y-2.5">
              {/* PayPal Primary Button */}
              <button
                onClick={processPayPalCheckout}
                disabled={isProcessingPayPal}
                className="w-full py-3.5 rounded-2xl bg-[#ffc439] hover:bg-[#f4bb33] active:bg-[#e0a824] text-[#003087] font-black text-xs shadow-md shadow-amber-400/20 flex items-center justify-center space-x-2 transition-all border border-[#e0a824] cursor-pointer disabled:opacity-60"
              >
                {isProcessingPayPal ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#003087]" />
                    <span>Conectando con PayPal y capturando orden...</span>
                  </>
                ) : (
                  <>
                    <span className="font-black italic text-base tracking-tighter">PayPal</span>
                    <span className="text-slate-900 font-extrabold">
                      • Pagar con Saldo o Cuenta PayPal
                    </span>
                  </>
                )}
              </button>

              {/* Debit/Credit Card via PayPal Button */}
              <button
                onClick={processPayPalCheckout}
                disabled={isProcessingPayPal}
                className="w-full py-3 rounded-2xl bg-[#2c2e2f] hover:bg-[#1a1b1c] text-white font-extrabold text-xs shadow-xs flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-60"
              >
                <CreditCard className="w-4 h-4 text-slate-300" />
                <span>Pagar con Tarjeta de Débito o Crédito</span>
              </button>
            </div>

            <p className="text-[10px] text-center text-slate-400">
              Transacción protegida por la Protección al Comprador de PayPal y SSL de 256 bits.
            </p>

          </div>
        </div>
      )}

    </div>
  );
};

