import dotenv from 'dotenv';
import path from 'path';
import express from 'express';
import type { Express } from 'express';
import { unwrapWebhook } from '@whop/sdk/helpers';

// Load .env from multiple possible working directories (e.g., Hostinger root, dist/, or parent)
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });

export const WHOP_PRODUCT_ID = 'prod_Y9R8h0VvDnrSq';
export const WHOP_PLANS: Record<string, { tier: string; quota: number; name: string }> = {
  plan_SIfpnGTuD8aqA: { tier: '10', quota: 10, name: 'Starter Pack 10' },
  plan_ICnjxZQ83eiJR: { tier: '30', quota: 30, name: 'Creador Básico 30' },
  plan_q5j9FOvuIZmaQ: { tier: '50', quota: 50, name: 'Creador Pro 50' },
  plan_NnHFpV95rjcod: { tier: '100', quota: 100, name: 'Business Booster 100' },
  plan_22ppS98N4577w: { tier: '500', quota: 500, name: 'Agencia Master 500' },
  plan_8dSaYNyZiabrU: { tier: '1000', quota: 1000, name: 'VIP Enterprise 1000' },
};

const API = 'https://api.whop.com/api/v1';

function cleanEnvValue(val?: string): string {
  if (!val) return '';
  return val.trim().replace(/^['"]+|['"]+$/g, '').trim();
}

function getWhopApiKey(): string {
  return cleanEnvValue(
    process.env.WHOP_API_KEY ||
      process.env.VITE_WHOP_API_KEY ||
      process.env.NEXT_PUBLIC_WHOP_API_KEY
  );
}

function getWhopWebhookSecret(): string {
  return cleanEnvValue(
    process.env.WHOP_WEBHOOK_SECRET ||
      process.env.VITE_WHOP_WEBHOOK_SECRET ||
      process.env.NEXT_PUBLIC_WHOP_WEBHOOK_SECRET
  );
}

async function whopGet(urlPath: string, params: Record<string, string>) {
  const key = getWhopApiKey();
  if (!key) throw new Error('WHOP_API_KEY no está configurada en el servidor.');
  const res = await fetch(`${API}${urlPath}?${new URLSearchParams(params)}`, {
    headers: {
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
    },
  });
  if (!res.ok) throw new Error(`Whop API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json() as Promise<any>;
}

// IMPORTANTE: llamar ANTES de app.use(express.json()), porque la firma
// se verifica sobre el cuerpo sin parsear.
export function registerWhopWebhook(app: Express) {
  app.post('/api/whop/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const secret = getWhopWebhookSecret();
    if (!secret) return res.status(500).send('Webhook no configurado');
    try {
      const event: any = unwrapWebhook(req.body.toString('utf8'), { headers: req.headers as any, key: secret });
      // Evento verificado. No dependemos de su contenido: el acceso se decide
      // consultando a Whop en /api/whop/entitlement.
      console.log('[Whop webhook]', event.type);
      res.sendStatus(200);
    } catch {
      res.status(400).send('Firma inválida');
    }
  });
}

export function registerWhopBilling(app: Express) {
  app.get('/api/whop/config', (_req, res) => {
    const apiKey = getWhopApiKey();
    const webhookSecret = getWhopWebhookSecret();
    res.json({
      success: true,
      hasApiKey: !!apiKey,
      hasWebhookSecret: !!webhookSecret,
      discountCode: 'WHOP40',
    });
  });

  app.get('/api/whop/entitlement', async (req, res) => {
    try {
      const email = String(req.query.email || '').trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({ success: false, error: 'Correo no válido.' });
      }
      const members = await whopGet('/members', { query: email, first: '5' });
      const memberIds: string[] = (members.data || []).map((m: any) => m.id).filter(Boolean);

      let best: { planId: string; membershipId: string; periodEnd?: string } | null = null;
      for (const memberId of memberIds) {
        const ms = await whopGet('/memberships', { member_id: memberId, product_id: WHOP_PRODUCT_ID, first: '20' });
        for (const m of ms.data || []) {
          const planId: string = m.plan?.id ?? m.plan_id;
          if (!['active', 'trialing'].includes(m.status) || !WHOP_PLANS[planId]) continue;
          if (!best || WHOP_PLANS[planId].quota > WHOP_PLANS[best.planId].quota) {
            best = { planId, membershipId: m.id, periodEnd: m.current_period_end ?? m.renewal_period_end };
          }
        }
      }
      if (!best) {
        return res.json({ success: true, active: false, message: 'No encontramos una suscripción activa para ese correo.' });
      }
      const plan = WHOP_PLANS[best.planId];
      res.json({
        success: true, active: true, tier: plan.tier, quota: plan.quota, planName: plan.name,
        membershipId: best.membershipId, currentPeriodEnd: best.periodEnd,
      });
    } catch (err: any) {
      console.error('[whop entitlement]', err?.message);
      res.status(502).json({
        success: false,
        error: 'No se pudo consultar Whop. Intenta de nuevo.',
        detail: String(err?.message || '').slice(0, 200), // TEMPORAL: quitar después
      });
    }
  });
}
