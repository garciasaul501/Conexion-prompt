import React, { useState } from 'react';
import { Database, Code2, Copy, Check, Terminal, FolderTree, DollarSign, ShieldCheck } from 'lucide-react';
import { SUPABASE_SQL_SCRIPT } from '../data/supabaseSqlScript';
import { ARCHITECTURE_FOLDER_TREE, SERVER_ACTION_EXAMPLE_CODE, PAYPAL_WEBHOOK_CODE } from '../data/architectureDocs';

export const ArchitectureDocs: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'sql' | 'nextjs' | 'paypal'>('sql');
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [copiedServerAction, setCopiedServerAction] = useState<boolean>(false);
  const [copiedPayPal, setCopiedPayPal] = useState<boolean>(false);

  const copyToClipboard = (text: string, type: 'sql' | 'action' | 'paypal') => {
    navigator.clipboard.writeText(text);
    if (type === 'sql') {
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    } else if (type === 'action') {
      setCopiedServerAction(true);
      setTimeout(() => setCopiedServerAction(false), 2000);
    } else {
      setCopiedPayPal(true);
      setTimeout(() => setCopiedPayPal(false), 2000);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-xs font-bold uppercase tracking-wider">
          <Database className="w-3.5 h-3.5 text-amber-600" />
          <span>Documentación Técnica & Entregables de Arquitectura</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Arquitectura del Sistema "Conexión Prompts"
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Código listo para producción para Supabase PostgreSQL, Next.js App Router e integración con suscripciones.
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
        <button
          onClick={() => setActiveSection('sql')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSection === 'sql'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-xs'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Paso 1: Esquema SQL Supabase</span>
        </button>

        <button
          onClick={() => setActiveSection('nextjs')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSection === 'nextjs'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-xs'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Paso 2: Arquitectura Next.js & Route Handler</span>
        </button>

        <button
          onClick={() => setActiveSection('paypal')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSection === 'paypal'
              ? 'bg-amber-400 text-slate-950 font-extrabold shadow-sm border border-amber-400'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-xs'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Paso 3: Webhooks de Suscripción</span>
        </button>
      </div>

      {/* SECTION 1: SQL SCHEMA */}
      {activeSection === 'sql' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <span>Script SQL PostgreSQL con RLS para Supabase</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Incluye 6 tablas (users_profiles, subscriptions, categories, prompts, user_integrations, saved_prompts), llaves foráneas, triggers y políticas RLS.
              </p>
            </div>

            <button
              onClick={() => copyToClipboard(SUPABASE_SQL_SCRIPT, 'sql')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center space-x-1.5 shrink-0 transition-all"
            >
              {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSql ? '¡Copiado!' : 'Copiar Script SQL'}</span>
            </button>
          </div>

          {/* Table summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="font-bold text-indigo-700 block">1. users_profiles</span>
              <span className="text-slate-500 text-[11px]">Vinculado a auth.users</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="font-bold text-indigo-700 block">2. subscriptions</span>
              <span className="text-slate-500 text-[11px]">Control de Suscripciones</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="font-bold text-indigo-700 block">3. categories</span>
              <span className="text-slate-500 text-[11px]">Filtros temáticos</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="font-bold text-indigo-700 block">4. prompts</span>
              <span className="text-slate-500 text-[11px]">Plantillas & Variables JSON</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="font-bold text-indigo-700 block">5. user_integrations</span>
              <span className="text-slate-500 text-[11px]">API Keys encriptadas</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="font-bold text-indigo-700 block">6. saved_prompts</span>
              <span className="text-slate-500 text-[11px]">Favoritos del usuario</span>
            </div>
          </div>

          {/* SQL Code Box */}
          <div className="relative rounded-2xl bg-slate-900 border border-slate-800 p-4 font-mono text-xs text-slate-100 overflow-x-auto max-h-[500px]">
            <pre className="whitespace-pre">{SUPABASE_SQL_SCRIPT}</pre>
          </div>
        </div>
      )}

      {/* SECTION 2: NEXT.JS ARCHITECTURE & SERVER ACTION */}
      {activeSection === 'nextjs' && (
        <div className="space-y-6">
          {/* Folder Tree */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
            <div className="flex items-center space-x-2 text-indigo-600">
              <FolderTree className="w-5 h-5" />
              <h3 className="text-sm font-bold text-slate-900">Estructura de Carpetas Recomendada (Next.js App Router)</h3>
            </div>
            <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-100 overflow-x-auto">
              {ARCHITECTURE_FOLDER_TREE}
            </pre>
          </div>

          {/* Server Action Code */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-indigo-600">
                <Terminal className="w-5 h-5" />
                <h3 className="text-sm font-bold text-slate-900">Route Handler para Ejecución de Prompts con Reemplazo de Variables</h3>
              </div>

              <button
                onClick={() => copyToClipboard(SERVER_ACTION_EXAMPLE_CODE, 'action')}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center space-x-1.5 transition-all"
              >
                {copiedServerAction ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedServerAction ? '¡Copiado!' : 'Copiar Código TS'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-100 overflow-x-auto max-h-[450px]">
              {SERVER_ACTION_EXAMPLE_CODE}
            </pre>
          </div>
        </div>
      )}

      {/* SECTION 3: PAYPAL WEBHOOKS LOGIC */}
      {activeSection === 'paypal' && (
        <div className="space-y-6">
          {/* Webhook Guide */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3 text-xs leading-relaxed text-slate-700 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-amber-600" />
              <span>Flujo de Integración de Webhooks de Suscripción</span>
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-slate-600">
              <li>El usuario selecciona el plan Pro y completa el flujo de pago con Conexión Whop / checkout.</li>
              <li>El proveedor confirma la creación del plan recurrente y dispara el webhook de confirmación.</li>
              <li>El Route Handler <code className="text-indigo-600 font-bold">/api/webhook</code> procesa la transacción y registra el identificador de suscripción.</li>
              <li>La base de datos actualiza el estado otorgando acceso y cuotas PRO inmediatas al usuario.</li>
              <li>En caso de cancelación o impago, el webhook devuelve la cuenta al plan Gratis automáticamente.</li>
            </ol>
          </div>

          {/* PayPal Webhook Code */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <span>Route Handler del Webhook (/app/api/webhook/route.ts)</span>
              </h3>

              <button
                onClick={() => copyToClipboard(PAYPAL_WEBHOOK_CODE, 'paypal')}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-sm flex items-center space-x-1.5 transition-all border border-amber-400"
              >
                {copiedPayPal ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPayPal ? '¡Copiado!' : 'Copiar Código Webhook'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-100 overflow-x-auto max-h-[450px]">
              {PAYPAL_WEBHOOK_CODE}
            </pre>
          </div>
        </div>
      )}

    </div>
  );
};
