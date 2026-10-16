import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  DollarSign,
  ArrowRight,
  ExternalLink,
  CreditCard,
  Search,
  Check,
  AlertCircle,
  X,
  RefreshCw,
  Cpu,
  Layers,
  FileCheck2,
} from 'lucide-react';
import { UserSubscription, PayPalTransaction } from '../types';

interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: UserSubscription;
  onUpdateSubscription: (
    newPlan: 'free' | 'pro' | 'enterprise',
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
  const [verifyEmailOrId, setVerifyEmailOrId] = useState('garciasaul501@gmail.com');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<{
    success: boolean;
    message: string;
    transaction?: PayPalTransaction;
  } | null>(null);

  if (!isOpen) return null;

  const isUnlocked = subscription.planType === 'pro' || subscription.planType === 'enterprise';

  const handleVerifyAndUnlock = async () => {
    if (!verifyEmailOrId.trim()) {
      setVerificationFeedback({
        success: false,
        message: 'Por favor ingresa tu correo de PayPal o el ID de la transacción.',
      });
      return;
    }

    setIsVerifying(true);
    setVerificationFeedback(null);

    try {
      const response = await fetch('/api/paypal/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: verifyEmailOrId.trim() }),
      });

      const data = await response.json();

      if (data.verified && data.transaction) {
        // Unlock user subscription in the application!
        onUpdateSubscription(data.transaction.plan || 'pro', 'active', {
          paypalTransactionId: data.transaction.id,
          paypalSubscriptionId: data.transaction.subscriptionId || `I-PP-SUB-${Date.now()}`,
          whopDiscountApplied: data.transaction.whopDiscountApplied,
          whopUsername: data.transaction.whopUsername,
          discountPercent: data.transaction.whopDiscountApplied ? 40 : 0,
          paymentMethod: 'paypal',
        });

        setVerificationFeedback({
          success: true,
          message: `¡Pago verificado con éxito! Acreditado a garciasaul@hotmail.com ($${data.transaction.netAmount.toFixed(2)} USD). La herramienta está 100% Desbloqueada.`,
          transaction: data.transaction,
        });
      } else {
        setVerificationFeedback({
          success: false,
          message: data.message || 'No se encontró una transacción activa con ese correo o ID. Puedes comprar tu suscripción abajo o probar con garciasaul501@gmail.com.',
        });
      }
    } catch (err: any) {
      setVerificationFeedback({
        success: false,
        message: err.message || 'Error de conexión al verificar con PayPal.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleInstantUnlockPro = () => {
    onUpdateSubscription('pro', 'active', {
      paypalPayerId: 'PAYPAL-PAYER-SAUL-ADMIN',
      paypalSubscriptionId: `I-PP-SUB-ACTIVE-${Date.now()}`,
      paypalTransactionId: `PAYPAL-TXN-ADMIN-${Date.now()}`,
      paymentMethod: 'paypal',
      whopDiscountApplied: true,
      whopUsername: '@saulmente',
      discountPercent: 40,
    });
    setVerificationFeedback({
      success: true,
      message: '¡Herramienta Desbloqueada al instante! Ahora tienes acceso Pro sin restricciones a todas las herramientas.',
    });
  };

  const handleRelockFree = () => {
    onUpdateSubscription('free', 'active', {
      paypalTransactionId: undefined,
      paypalSubscriptionId: undefined,
      whopDiscountApplied: false,
    });
    setVerificationFeedback({
      success: true,
      message: 'Herramienta regresada a Modo Gratuito (Bloqueado) para pruebas.',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-8">
        
        {/* Top Header Banner */}
        <div className={`p-6 sm:p-8 text-white relative overflow-hidden ${
          isUnlocked
            ? 'bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900'
            : 'bg-gradient-to-r from-amber-700 via-indigo-950 to-slate-900'
        }`}>
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <div className={`p-2.5 rounded-2xl ${isUnlocked ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'}`}>
              {isUnlocked ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
            </div>
            <div>
              <span className={`text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-block ${
                isUnlocked
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
              }`}>
                {isUnlocked ? '⚡ Estado: DESBLOQUEADA' : '🔒 Estado: BLOQUEADA (Plan Gratuito)'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                {isUnlocked
                  ? '¡Tienes Acceso Total a la Herramienta!'
                  : 'Desbloquear la Herramienta con Suscripción o Compra'}
              </h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-200 mt-2 leading-relaxed max-w-xl">
            {isUnlocked
              ? 'Tu suscripción está activa. Tienes acceso sin límites al Optimizador de Prompts IA, Generador desde Ideas, Gemini 3.8 Flash y descargas en PDF.'
              : 'La herramienta está protegida hasta que adquieras tu suscripción o compres tu acceso. Los pagos se acreditan directamente a la Cuenta Verificada por PayPal.'}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Status Alert Banner */}
          {verificationFeedback && (
            <div className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-start space-x-3 ${
              verificationFeedback.success
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}>
              {verificationFeedback.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 font-medium">{verificationFeedback.message}</div>
            </div>
          )}

          {/* Section 1: Desbloquear con Pago / Verificación Instantánea */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Search className="w-4 h-4 text-indigo-600" />
                <span>¿Ya pagaste o tienes una suscripción? Desbloquear al Instante:</span>
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Cuenta Verificada por PayPal
              </span>
            </div>

            <p className="text-xs text-slate-600">
              Ingresa tu correo de PayPal con el que pagaste o el ID de la transacción para desbloquear inmediatamente la herramienta en este navegador:
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={verifyEmailOrId}
                onChange={(e) => setVerifyEmailOrId(e.target.value)}
                placeholder="ej: tu-correo@paypal.com o PAYPAL-TXN-..."
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <button
                onClick={handleVerifyAndUnlock}
                disabled={isVerifying}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verificar y Desbloquear</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section 2: Opciones de Compra / Suscripción */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Opción PayPal */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 transition-all flex flex-col justify-between space-y-4 shadow-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-black text-xs">
                      PP
                    </div>
                    <span className="text-xs font-bold text-slate-900">Comprar con PayPal</span>
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Oficial
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Paga tu plan mensual o anual con PayPal. Recibe el pago seguro en la <strong>Cuenta Verificada por PayPal</strong> y desbloquea en 3 segundos.
                </p>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onNavigateToPricing();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center space-x-1.5 shadow-xs transition-all cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Ver Planes y Pagar con PayPal</span>
              </button>
            </div>

            {/* Opción Whop */}
            <div className="p-5 rounded-2xl bg-white border border-amber-200 hover:border-amber-300 transition-all flex flex-col justify-between space-y-4 shadow-xs bg-linear-to-b from-amber-50/30 to-white">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800 font-black text-xs">
                      ⚡
                    </div>
                    <span className="text-xs font-bold text-slate-900">Conexión Whop</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                    -40% OFF
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Suscríbete en nuestra comunidad en Whop <strong>@saulmente</strong> y obtén 40% de descuento automático en cualquier suscripción de PayPal.
                </p>
              </div>

              <a
                href="https://whop.com/@saulmente"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center space-x-1.5 shadow-xs transition-all border border-amber-400 text-center"
              >
                <span>Abrir Whop @saulmente</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>

          {/* Section 3: Acciones de Administrador / Saúl García */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Control Rápido de Acceso (Saúl García / Creador):</span>
            </div>

            <div className="flex items-center gap-2">
              {!isUnlocked ? (
                <button
                  onClick={handleInstantUnlockPro}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>⚡ Desbloquear Modo Pro Ahora</span>
                </button>
              ) : (
                <button
                  onClick={handleRelockFree}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-600" />
                  <span>Probar Modo Bloqueado (Free)</span>
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
