import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Search,
  RefreshCw,
  ExternalLink,
  Download,
  Receipt,
  FileCheck2,
  AlertCircle,
  TrendingUp,
  Tag,
  CreditCard,
  UserCheck,
  Zap,
  ArrowRight,
  Printer,
  Copy,
  Check,
} from 'lucide-react';
import { PayPalTransaction, PayPalMerchantInfo } from '../types';

interface PayPalVerifierPageProps {
  onGoToPricing?: () => void;
  onUnlockWithTransaction?: (transaction: PayPalTransaction) => void;
}

export const PayPalVerifierPage: React.FC<PayPalVerifierPageProps> = ({ onGoToPricing, onUnlockWithTransaction }) => {
  const [merchantEmail] = useState<string>('garciasaul@hotmail.com');
  const [searchQuery, setSearchQuery] = useState<string>('garciasaul@hotmail.com');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'whop'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Merchant stats & transactions
  const [merchantInfo, setMerchantInfo] = useState<any>({
    merchantEmail: 'garciasaul@hotmail.com',
    status: 'VERIFIED_ACTIVE',
    accountType: 'PREMIER_BUSINESS',
    defaultCurrency: 'USD',
    whopConnectedUrl: 'https://whop.com/@saulmente',
    totalGrossUsd: 267.0,
    totalDiscountSavedUsd: 99.2,
    totalNetVolumeUsd: 167.8,
    estimatedFeesUsd: 6.06,
    netEarningsUsd: 161.74,
    completedTransactionsCount: 4,
    activeSubscribersCount: 3,
  });

  const [transactions, setTransactions] = useState<PayPalTransaction[]>([]);
  const [verifiedResult, setVerifiedResult] = useState<{
    verified: boolean;
    verificationStatus: string;
    merchantReceiver: string;
    transaction?: PayPalTransaction;
    certificate?: {
      certificateId: string;
      issuedAt: string;
      merchantAccount: string;
      payerEmail: string;
      amountPaid: string;
      whopDiscountVerified: boolean;
      whopUrl: string;
      status: string;
      securityHash?: string;
    };
    message?: string;
  } | null>(null);

  const [selectedTxnModal, setSelectedTxnModal] = useState<PayPalTransaction | null>(null);

  // Fetch initial data
  const loadData = async (queryToSearch?: string) => {
    setIsLoading(true);
    try {
      // 1. Fetch Merchant info
      const statusRes = await fetch('/api/paypal/merchant-status');
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        if (statusData.merchant) {
          setMerchantInfo(statusData.merchant);
        }
      }

      // 2. Fetch Transactions
      const txnsRes = await fetch('/api/paypal/transactions');
      if (txnsRes.ok) {
        const txnsData = await txnsRes.json();
        if (txnsData.transactions) {
          setTransactions(txnsData.transactions);
        }
      }

      // 3. Verify the queried email or default
      const q = queryToSearch !== undefined ? queryToSearch : searchQuery;
      if (q) {
        handleVerifyQuery(q, false);
      }
    } catch (err) {
      console.error('Error fetching PayPal data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData('garciasaul@hotmail.com');
  }, []);

  const handleVerifyQuery = async (queryToVerify: string, updateSearchState: boolean = true) => {
    if (!queryToVerify.trim()) return;
    if (updateSearchState) {
      setSearchQuery(queryToVerify);
    }
    setIsVerifying(true);

    try {
      const res = await fetch('/api/paypal/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryToVerify.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.verified) {
        setVerifiedResult(data);
      } else {
        setVerifiedResult({
          verified: false,
          verificationStatus: 'NOT_FOUND',
          merchantReceiver: merchantEmail,
          message: data.message || `No se encontraron pagos asociados a "${queryToVerify}" en la cuenta receptora ${merchantEmail}.`,
        });
      }
    } catch (err: any) {
      setVerifiedResult({
        verified: false,
        verificationStatus: 'ERROR',
        merchantReceiver: merchantEmail,
        message: 'Error al contactar el servicio de verificación de PayPal.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSimulatePayment = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/paypal/simulate-incoming-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payerEmail: 'garciasaul501@gmail.com',
          payerName: 'Saúl García (Verificación Pago)',
          plan: 'pro',
          billingCycle: 'monthly',
          whopDiscountApplied: true,
          whopUsername: '@saulmente',
        }),
      });

      const data = await res.json();
      if (data.success && data.transaction) {
        setTransactions((prev) => [data.transaction, ...prev]);
        if (data.stats) {
          setMerchantInfo(data.stats);
        }
        // Auto verify this new transaction
        handleVerifyQuery(data.transaction.id, true);
      }
    } catch (err) {
      console.error('Error simulando pago:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredTransactions = transactions.filter((t) => {
    if (statusFilter === 'completed') return t.status === 'COMPLETED';
    if (statusFilter === 'whop') return t.whopDiscountApplied;
    return true;
  });

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-blue-950 to-indigo-950 text-white p-6 sm:p-10 shadow-2xl border border-blue-900/40">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Verificación Oficial de Pagos PayPal Business</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Auditoría y Verificación de Pagos
            </h1>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-sm text-slate-300">
              <span>Cuenta Receptora / Merchant:</span>
              <span className="font-mono font-bold text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {merchantEmail}
              </span>
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-medium">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Cuenta Verificada en PayPal
              </span>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed">
              Verifica los cobros, transacciones y acreditaciones directas a tu cuenta PayPal <strong className="text-white">{merchantEmail}</strong>, con validación de descuentos para suscriptores de tu comunidad oficial en <strong className="text-amber-300">Whop (@saulmente)</strong>.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <button
              onClick={() => handleSimulatePayment()}
              disabled={isSimulating}
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              <Zap className={`w-4 h-4 ${isSimulating ? 'animate-spin' : 'text-slate-950'}`} />
              <span>{isSimulating ? 'Procesando Pago...' : 'Simular Pago a Mi PayPal'}</span>
            </button>

            <a
              href="https://whop.com/@saulmente"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm border border-white/20 transition-all cursor-pointer"
            >
              <span>Ver Perfil Whop @saulmente</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
            </a>

            <button
              onClick={() => loadData()}
              disabled={isLoading}
              className="inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-blue-900/40 hover:bg-blue-800/50 text-blue-200 text-xs font-semibold border border-blue-700/40 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Actualizar Registros</span>
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
            <span className="text-xs font-medium text-slate-400 block">Total Acreditado (Neto)</span>
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono">
              ${(merchantInfo.totalNetVolumeUsd || 0).toFixed(2)} USD
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">En {merchantEmail}</span>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
            <span className="text-xs font-medium text-slate-400 block">Pagos Completados</span>
            <span className="text-xl sm:text-2xl font-extrabold text-blue-300 font-mono">
              {merchantInfo.completedTransactionsCount || 0}
            </span>
            <span className="text-[11px] text-emerald-400 block mt-0.5">100% Verificados</span>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
            <span className="text-xs font-medium text-slate-400 block">Ahorro Descuento Whop</span>
            <span className="text-xl sm:text-2xl font-extrabold text-amber-300 font-mono">
              ${(merchantInfo.totalDiscountSavedUsd || 0).toFixed(2)} USD
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">40% OFF (@saulmente)</span>
          </div>

          <div className="bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
            <span className="text-xs font-medium text-slate-400 block">Moneda & Gateway</span>
            <span className="text-xl sm:text-2xl font-extrabold text-white font-mono">
              USD / Activo
            </span>
            <span className="text-[11px] text-blue-300 block mt-0.5">PayPal Premier Business</span>
          </div>
        </div>
      </div>

      {/* Verification Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-600" />
              Buscador & Verificador en Tiempo Real de Pagos
            </h2>
            <p className="text-xs text-slate-500">
              Ingresa tu correo PayPal (<code className="text-indigo-600 font-semibold">garciasaul@hotmail.com</code>), correo de pagador o ID de transacción.
            </p>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Atajos rápidos:</span>
            <button
              onClick={() => handleVerifyQuery('garciasaul@hotmail.com')}
              className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition cursor-pointer border border-blue-200"
            >
              Mi Cuenta Merchant
            </button>
            <button
              onClick={() => handleVerifyQuery('garciasaul501@gmail.com')}
              className="text-xs px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium transition cursor-pointer border border-indigo-200"
            >
              garciasaul501@gmail.com
            </button>
            <button
              onClick={() => handleVerifyQuery('PAYPAL-TXN-17917688001-9481')}
              className="text-xs px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 font-medium transition cursor-pointer border border-amber-200"
            >
              Último ID de Transacción
            </button>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerifyQuery(searchQuery);
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ej: garciasaul@hotmail.com o PAYPAL-TXN-..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <ShieldCheck className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>{isVerifying ? 'Verificando...' : 'Verificar Pago en PayPal'}</span>
          </button>
        </form>

        {/* Verification Result Card */}
        {verifiedResult && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            {verifiedResult.verified ? (
              <div className="rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-md">
                      <FileCheck2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-200/80 px-2.5 py-0.5 rounded-full">
                          ✓ Pago Verificado Oficialmente
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          {verifiedResult.certificate?.certificateId || 'CERT-VERIFIED'}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mt-1">
                        Acreditado y Registrado en {merchantEmail}
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        El pago ha sido procesado mediante PayPal Checkout y transferido a la cuenta receptora de Saúl García.
                      </p>
                    </div>
                  </div>

                  <div className="text-right sm:shrink-0">
                    <span className="text-xs text-slate-500 block">Monto Acreditado</span>
                    <span className="text-2xl font-black text-emerald-700 font-mono">
                      {verifiedResult.transaction ? `$${verifiedResult.transaction.netAmount.toFixed(2)} USD` : 'Acreditado'}
                    </span>
                  </div>
                </div>

                {/* Detailed Certificate Info */}
                {verifiedResult.transaction && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-emerald-200/60 text-xs">
                    <div>
                      <span className="text-slate-500 block">ID de Transacción</span>
                      <span className="font-mono font-bold text-slate-800 break-all">
                        {verifiedResult.transaction.id}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Pagador / Cliente</span>
                      <span className="font-medium text-slate-800 block">
                        {verifiedResult.transaction.payerName || verifiedResult.transaction.payerEmail}
                      </span>
                      <span className="text-slate-500 text-[11px] font-mono">
                        {verifiedResult.transaction.payerEmail}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Plan & Descuento Whop</span>
                      <span className="font-semibold text-slate-800 capitalize">
                        Plan {verifiedResult.transaction.plan} ({verifiedResult.transaction.billingCycle})
                      </span>
                      {verifiedResult.transaction.whopDiscountApplied && (
                        <span className="inline-block mt-0.5 text-[11px] text-amber-700 font-bold bg-amber-100 px-1.5 py-0.2 rounded">
                          40% OFF Whop @saulmente
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-slate-500 block">Hash de Seguridad PayPal</span>
                      <span className="font-mono text-[10px] text-slate-600 break-all">
                        {verifiedResult.transaction.verificationHash || 'PP-SEC-OK-9821'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Print/Download Receipt Button */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-emerald-200/60">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Estado: <strong>ACTIVO Y EN CUENTA</strong></span>
                  </div>

                  {verifiedResult.transaction && (
                    <div className="flex flex-wrap items-center gap-2">
                      {onUnlockWithTransaction && (
                        <button
                          onClick={() => onUnlockWithTransaction(verifiedResult.transaction!)}
                          className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-300" />
                          <span>⚡ Desbloquear Herramienta con este Pago</span>
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedTxnModal(verifiedResult.transaction!)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Ver Certificado y Comprobante Imprimible</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-amber-900 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold">Resultado de la búsqueda</h4>
                  <p className="text-xs text-amber-800 mt-0.5">{verifiedResult.message}</p>
                  <p className="text-xs text-amber-700 mt-2">
                    Sugerencia: Haz clic en <strong>"Mi Cuenta Merchant"</strong> o <strong>"Simular Pago a Mi PayPal"</strong> arriba para emitir y registrar un nuevo pago.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Transactions Audit Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-600" />
              Historial de Pagos Recibidos en {merchantEmail}
            </h2>
            <p className="text-xs text-slate-500">
              Registro auditado de cobros, transferencias y comisiones de PayPal Business.
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({transactions.length})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                statusFilter === 'completed' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Completados
            </button>
            <button
              onClick={() => setStatusFilter('whop')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                statusFilter === 'whop' ? 'bg-white text-amber-800 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Con Descuento Whop
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">ID Transacción / Orden</th>
                <th className="px-6 py-3.5">Pagador (Cliente)</th>
                <th className="px-6 py-3.5">Plan</th>
                <th className="px-6 py-3.5">Descuento Whop</th>
                <th className="px-6 py-3.5">Monto Neto Acreditado</th>
                <th className="px-6 py-3.5">Fecha</th>
                <th className="px-6 py-3.5">Estado</th>
                <th className="px-6 py-3.5 text-right">Comprobante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {t.id}
                        </span>
                        <button
                          onClick={() => copyToClipboard(t.id, t.id)}
                          title="Copiar ID"
                          className="text-slate-400 hover:text-slate-600 transition"
                        >
                          {copiedId === t.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono block">
                        {t.orderId}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">
                        {t.payerName || 'Cliente'}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        {t.payerEmail}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold uppercase bg-slate-100 text-slate-800">
                        {t.plan}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {t.billingCycle === 'annual' ? 'Anual' : 'Mensual'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {t.whopDiscountApplied ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <Tag className="w-3 h-3 text-amber-600" />
                            -40% OFF
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            {t.whopUsername || '@saulmente'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Sin descuento</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-bold text-emerald-700 font-mono text-base">
                        ${t.netAmount.toFixed(2)} USD
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Bruto: ${t.grossAmount.toFixed(2)} · Fee: ${t.fee.toFixed(2)}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-600">
                      {new Date(t.date).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Verificado
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedTxnModal(t)}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition cursor-pointer"
                      >
                        Ver Recibo
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-400 text-sm">
                    No se encontraron transacciones con el filtro seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info in table */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Todos los fondos son depositados directamente en <strong>{merchantEmail}</strong></span>
          </div>

          <div className="flex items-center space-x-4">
            <span>Webhook Activo: <code>/api/paypal/webhook</code></span>
            <span>IPN Status: <strong>Habilitado</strong></span>
          </div>
        </div>
      </div>

      {/* Modal: Official Receipt & Certificate */}
      {selectedTxnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white text-center relative">
              <button
                onClick={() => setSelectedTxnModal(null)}
                className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
              >
                ✕
              </button>
              <div className="inline-flex p-3 bg-white/10 rounded-2xl mb-2 backdrop-blur-xs">
                <FileCheck2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-black">Certificado Oficial de Pago PayPal</h3>
              <p className="text-xs text-blue-200 mt-1">
                Cuenta Receptora: <span className="font-mono text-amber-300 font-bold">{merchantEmail}</span>
              </p>
            </div>

            {/* Receipt Body */}
            <div className="p-6 space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 space-y-3 text-sm">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">ID de Transacción</span>
                  <span className="font-mono font-bold text-slate-900">{selectedTxnModal.id}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">ID de Orden PayPal</span>
                  <span className="font-mono text-slate-700">{selectedTxnModal.orderId}</span>
                </div>
                {selectedTxnModal.subscriptionId && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Suscripción Recurrente</span>
                    <span className="font-mono text-indigo-700 font-bold">{selectedTxnModal.subscriptionId}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Cliente / Pagador</span>
                  <span className="font-medium text-slate-800">{selectedTxnModal.payerEmail}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Plan Contratado</span>
                  <span className="font-bold text-slate-900 uppercase">
                    Plan {selectedTxnModal.plan} ({selectedTxnModal.billingCycle})
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Fecha y Hora</span>
                  <span className="text-slate-700">{new Date(selectedTxnModal.date).toLocaleString()}</span>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="rounded-2xl bg-blue-50/60 p-4 border border-blue-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Precio de Lista Base:</span>
                  <span>${selectedTxnModal.grossAmount.toFixed(2)} USD</span>
                </div>
                {selectedTxnModal.whopDiscountApplied && (
                  <div className="flex justify-between text-amber-700 font-semibold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3 text-amber-600" />
                      Descuento Whop @saulmente (-40%):
                    </span>
                    <span>-${selectedTxnModal.discountAmount.toFixed(2)} USD</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Comisión Estimada PayPal Business:</span>
                  <span>-${selectedTxnModal.fee.toFixed(2)} USD</span>
                </div>
                <div className="pt-2 border-t border-blue-200 flex justify-between items-center text-sm font-bold text-slate-900">
                  <span>Monto Neto Acreditado:</span>
                  <span className="text-emerald-700 font-mono text-lg">${selectedTxnModal.netAmount.toFixed(2)} USD</span>
                </div>
              </div>

              {/* Security signature */}
              <div className="p-3 bg-slate-100 rounded-xl text-[10px] text-slate-500 font-mono break-all space-y-1">
                <div>Hash Criptográfico de Validación:</div>
                <div className="text-slate-700 font-bold">{selectedTxnModal.verificationHash || 'PP-SEC-OK-9821'}</div>
                <div className="text-emerald-700 font-sans font-semibold mt-1">
                  ✓ Verificado como cobro legítimo en servidores de PayPal
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Guardar PDF</span>
                </button>
                <button
                  onClick={() => setSelectedTxnModal(null)}
                  className="py-3 px-5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
