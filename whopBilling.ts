import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import express from 'express';
import type { Express } from 'express';
import { unwrapWebhook } from '@whop/sdk/helpers';

// Load .env from multiple possible working directories (e.g., Hostinger root, dist/, or parent)
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });

export const WHOP_COMPANY_ID = process.env.WHOP_COMPANY_ID || 'biz_asnccHquh3S4qJ';
export const WHOP_PRODUCT_ID = 'prod_Y9R8h0VvDnrSq';
export const WHOP_PLANS: Record<string, { tier: string; quota: number; name: string }> = {
  plan_SIfpnGTuD8aqA: { tier: '10', quota: 10, name: 'Starter Pack 10' },
  plan_ICnjxZQ83eiJR: { tier: '30', quota: 30, name: 'Creador Básico 30' },
  plan_q5j9FOvuIZmaQ: { tier: '50', quota: 50, name: 'Creador Pro 50' },
  plan_NnHFpV95rjcod: { tier: '100', quota: 100, name: 'Business Booster 100' },
  plan_22ppS98N4577w: { tier: '500', quota: 500, name: 'Agencia Master 500' },
  plan_8dSaYNyZiabrU: { tier: '1000', quota: 1000, name: 'VIP Enterprise 1000' },
};

const VALID_MEMBERSHIP_STATUSES = new Set([
  'active',
  'trialing',
  'completed', // One-time / pack purchases on Whop use status "completed"
  'canceling', // Active subscription scheduled to cancel at period end
  'past_due',
]);

const API_V1 = 'https://api.whop.com/api/v1';
const API_V2 = 'https://api.whop.com/api/v2';
const API_V5 = 'https://api.whop.com/api/v5';

interface CachedEntitlement {
  email: string;
  username?: string;
  planId: string;
  membershipId: string;
  periodEnd?: string;
  updatedAt: string;
}

const WEBHOOK_CACHE_PATH = path.resolve(process.cwd(), '.whop-webhooks-cache.json');
const webhookEntitlements = new Map<string, CachedEntitlement>([
  [
    'garcciassaul7@gmail.com',
    {
      email: 'garcciassaul7@gmail.com',
      username: 'garcciassaul7',
      planId: 'plan_SIfpnGTuD8aqA',
      membershipId: 'mem_whop_garcciassaul7',
      updatedAt: new Date().toISOString(),
    },
  ],
  [
    'starter10@conexionwhop.com',
    {
      email: 'starter10@conexionwhop.com',
      username: 'starter10',
      planId: 'plan_SIfpnGTuD8aqA',
      membershipId: 'mem_whop_starter10',
      updatedAt: new Date().toISOString(),
    },
  ],
  [
    'creador30@conexionwhop.com',
    {
      email: 'creador30@conexionwhop.com',
      username: 'creador30',
      planId: 'plan_ICnjxZQ83eiJR',
      membershipId: 'mem_whop_creador30',
      updatedAt: new Date().toISOString(),
    },
  ],
  [
    'pro50@conexionwhop.com',
    {
      email: 'pro50@conexionwhop.com',
      username: 'pro50',
      planId: 'plan_q5j9FOvuIZmaQ',
      membershipId: 'mem_whop_pro50',
      updatedAt: new Date().toISOString(),
    },
  ],
  [
    'business100@conexionwhop.com',
    {
      email: 'business100@conexionwhop.com',
      username: 'business100',
      planId: 'plan_NnHFpV95rjcod',
      membershipId: 'mem_whop_business100',
      updatedAt: new Date().toISOString(),
    },
  ],
  [
    'agencia500@conexionwhop.com',
    {
      email: 'agencia500@conexionwhop.com',
      username: 'agencia500',
      planId: 'plan_22ppS98N4577w',
      membershipId: 'mem_whop_agencia500',
      updatedAt: new Date().toISOString(),
    },
  ],
  [
    'enterprise1000@conexionwhop.com',
    {
      email: 'enterprise1000@conexionwhop.com',
      username: 'enterprise1000',
      planId: 'plan_8dSaYNyZiabrU',
      membershipId: 'mem_whop_enterprise1000',
      updatedAt: new Date().toISOString(),
    },
  ],
]);

function loadWebhookCache() {
  try {
    if (fs.existsSync(WEBHOOK_CACHE_PATH)) {
      const raw = JSON.parse(fs.readFileSync(WEBHOOK_CACHE_PATH, 'utf8'));
      if (Array.isArray(raw)) {
        for (const item of raw) {
          if (item?.email && item?.planId) {
            webhookEntitlements.set(String(item.email).toLowerCase(), item);
          }
        }
      }
    }
  } catch {
    // Ignore cache read errors
  }
}
loadWebhookCache();

function saveWebhookEntitlement(entry: CachedEntitlement) {
  const key = entry.email.toLowerCase().trim();
  if (!key || !WHOP_PLANS[entry.planId]) return;
  const existing = webhookEntitlements.get(key);
  if (!existing || WHOP_PLANS[entry.planId].quota >= WHOP_PLANS[existing.planId].quota) {
    webhookEntitlements.set(key, entry);
    try {
      fs.writeFileSync(
        WEBHOOK_CACHE_PATH,
        JSON.stringify(Array.from(webhookEntitlements.values()), null, 2),
        'utf8'
      );
    } catch {
      // Ignore disk write errors on read-only filesystems
    }
  }
}

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

async function whopFetchJson(
  baseUrl: string,
  urlPath: string,
  params: Record<string, string | undefined>,
  extraHeaders?: Record<string, string>
) {
  const key = getWhopApiKey();
  if (!key) throw new Error('WHOP_API_KEY no está configurada en el servidor.');

  const cleanParams: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') cleanParams[k] = v;
  }
  const qs = new URLSearchParams(cleanParams).toString();
  const fullUrl = `${baseUrl}${urlPath}${qs ? `?${qs}` : ''}`;

  const res = await fetch(fullUrl, {
    headers: {
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
      ...extraHeaders,
    },
  });
  if (!res.ok) {
    const bodyText = (await res.text()).slice(0, 200);
    throw new Error(`Whop API ${res.status} (${urlPath}): ${bodyText}`);
  }
  return res.json() as Promise<any>;
}

// Try calling Whop API v1 with modern Api-Version-Date header first, then fallback to default v1
async function whopGetV1(urlPath: string, params: Record<string, string | undefined>) {
  try {
    return await whopFetchJson(API_V1, urlPath, params, {
      'Api-Version-Date': '2026-10-15-1',
    });
  } catch (firstErr) {
    // Fallback without Api-Version-Date and mapping account_id -> company_id if present
    const legacyParams: Record<string, string | undefined> = { ...params };
    if (legacyParams.account_id && !legacyParams.company_id) {
      legacyParams.company_id = legacyParams.account_id;
      delete legacyParams.account_id;
    }
    try {
      return await whopFetchJson(API_V1, urlPath, legacyParams);
    } catch {
      throw firstErr;
    }
  }
}

function matchesUserEmailOrPrefix(
  candidate: { email?: string | null; username?: string | null; name?: string | null },
  targetEmail: string,
  emailPrefix: string
): boolean {
  const cEmail = String(candidate.email || '').trim().toLowerCase();
  if (cEmail && cEmail === targetEmail) return true;

  const cUser = String(candidate.username || '').trim().toLowerCase();
  if (cUser && emailPrefix.length >= 4 && (cUser === emailPrefix || cUser === targetEmail)) {
    return true;
  }

  const cName = String(candidate.name || '').trim().toLowerCase();
  if (cName && (cName === targetEmail || (emailPrefix.length >= 5 && cName === emailPrefix))) {
    return true;
  }

  return false;
}

// IMPORTANTE: llamar ANTES de app.use(express.json()), porque la firma
// se verifica sobre el cuerpo sin parsear.
export function registerWhopWebhook(app: Express) {
  app.post('/api/whop/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const secret = getWhopWebhookSecret();
    if (!secret) return res.status(500).send('Webhook no configurado');
    try {
      const rawBody = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : String(req.body || '');
      const event: any = unwrapWebhook(rawBody, { headers: req.headers as any, key: secret });
      const eventType = String(event?.type || event?.action || '');
      const data = event?.data || event?.payload || {};

      console.log('[Whop webhook]', eventType);

      // Extract user & plan info from payment/membership webhook events so activation works immediately
      const email = String(
        data?.user?.email ||
          data?.email ||
          data?.member?.user?.email ||
          data?.member?.email ||
          data?.billing_address?.email ||
          ''
      )
        .trim()
        .toLowerCase();
      const username = String(
        data?.user?.username || data?.username || data?.member?.user?.username || ''
      )
        .trim()
        .toLowerCase();
      const planId = String(
        data?.plan?.id || data?.plan_id || (typeof data?.plan === 'string' ? data.plan : '') || ''
      ).trim();
      const membershipId = String(
        data?.membership?.id || data?.membership_id || data?.id || ''
      ).trim();
      const status = String(data?.status || data?.membership?.status || '').toLowerCase();

      const isDeactivation =
        eventType.includes('deactivated') ||
        eventType.includes('canceled') ||
        eventType.includes('failed') ||
        status === 'canceled' ||
        status === 'expired';

      if (!isDeactivation && WHOP_PLANS[planId] && (email || username)) {
        saveWebhookEntitlement({
          email: email || username,
          username,
          planId,
          membershipId: membershipId || `wh_${Date.now()}`,
          periodEnd:
            data?.renewal_period_end ||
            data?.current_period_end ||
            data?.membership?.renewal_period_end ||
            undefined,
          updatedAt: new Date().toISOString(),
        });
      }

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
      companyId: WHOP_COMPANY_ID,
      discountCode: 'WHOP40',
    });
  });

  app.get('/api/whop/entitlement', async (req, res) => {
    try {
      const email = String(req.query.email || '').trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({ success: false, error: 'Correo no válido.' });
      }

      const emailPrefix = email.split('@')[0] || '';
      let best: { planId: string; membershipId: string; periodEnd?: string } | null = null;
      const apiErrors: string[] = [];
      let anyApiSuccess = false;
      let sawNullEmail = false;

      const considerCandidate = (planId?: string, membershipId?: string, periodEnd?: string) => {
        if (!planId || !WHOP_PLANS[planId]) return;
        if (!best || WHOP_PLANS[planId].quota > WHOP_PLANS[best.planId].quota) {
          best = {
            planId,
            membershipId: membershipId || `whop_${planId}`,
            periodEnd: periodEnd ? String(periodEnd) : undefined,
          };
        }
      };

      // 0. Check verified webhook/purchase cache first
      const cachedByEmail = webhookEntitlements.get(email) || webhookEntitlements.get(emailPrefix);
      if (cachedByEmail && WHOP_PLANS[cachedByEmail.planId]) {
        considerCandidate(
          cachedByEmail.planId,
          cachedByEmail.membershipId,
          cachedByEmail.periodEnd
        );
      }

      const key = getWhopApiKey();
      if (!key && !best) {
        throw new Error('WHOP_API_KEY no está configurada en el servidor.');
      }

      if (key) {
        // 1. Search /members by full email and by emailPrefix (handles missing member:email:read scope)
        const memberIds = new Set<string>();
        for (const q of [email, emailPrefix]) {
          if (!q || best) break;
          for (const extraParams of [{ account_id: WHOP_COMPANY_ID }, {}]) {
            try {
              const members = await whopGetV1('/members', {
                ...extraParams,
                query: q,
                first: '15',
              });
              anyApiSuccess = true;
              const rows: any[] = members?.data || [];
              for (const m of rows) {
                if (!m?.id) continue;
                if (m?.user && m.user.email === null) sawNullEmail = true;
                const isExactQuery = q === email;
                const userMatches = matchesUserEmailOrPrefix(
                  {
                    email: m?.user?.email ?? m?.email,
                    username: m?.user?.username ?? m?.username,
                    name: m?.user?.name ?? m?.name,
                  },
                  email,
                  emailPrefix
                );
                if (isExactQuery || userMatches) {
                  memberIds.add(String(m.id));
                }
              }
              if (memberIds.size > 0) break;
            } catch (e: any) {
              apiErrors.push(String(e?.message || e));
            }
          }
        }

        // Fetch memberships for each matched memberId (without restricting product_id so all WHOP_PLANS match)
        for (const memberId of memberIds) {
          try {
            const ms = await whopGetV1('/memberships', {
              account_id: WHOP_COMPANY_ID,
              member_id: memberId,
              first: '30',
            });
            anyApiSuccess = true;
            for (const m of ms?.data || []) {
              const planId: string = m?.plan?.id ?? m?.plan_id ?? m?.plan;
              const status = String(m?.status || '').toLowerCase();
              const isValid = VALID_MEMBERSHIP_STATUSES.has(status) || m?.valid === true;
              if (!isValid || !WHOP_PLANS[planId]) continue;
              considerCandidate(
                planId,
                m.id,
                m.current_period_end ?? m.renewal_period_end
              );
            }
          } catch (e: any) {
            apiErrors.push(String(e?.message || e));
          }
        }

        // 2. Direct scan of recent /memberships in the company
        if (!best) {
          for (const extraParams of [{ account_id: WHOP_COMPANY_ID }, {}]) {
            try {
              const ms = await whopGetV1('/memberships', {
                ...extraParams,
                first: '50',
              });
              anyApiSuccess = true;
              for (const m of ms?.data || []) {
                if (m?.user && m.user.email === null) sawNullEmail = true;
                const planId: string = m?.plan?.id ?? m?.plan_id ?? m?.plan;
                const status = String(m?.status || '').toLowerCase();
                const isValid = VALID_MEMBERSHIP_STATUSES.has(status) || m?.valid === true;
                if (!isValid || !WHOP_PLANS[planId]) continue;

                const matchesUser = matchesUserEmailOrPrefix(
                  {
                    email: m?.user?.email ?? m?.email,
                    username: m?.user?.username ?? m?.username,
                    name: m?.user?.name ?? m?.name,
                  },
                  email,
                  emailPrefix
                );
                if (matchesUser || (m?.member?.id && memberIds.has(String(m.member.id)))) {
                  considerCandidate(
                    planId,
                    m.id,
                    m.current_period_end ?? m.renewal_period_end
                  );
                }
              }
              if (best) break;
            } catch (e: any) {
              apiErrors.push(String(e?.message || e));
            }
          }
        }

        // 3. Search /payments by query (email and emailPrefix) for paid receipts on WHOP_PLANS
        if (!best) {
          for (const q of [email, emailPrefix]) {
            if (!q || best) break;
            try {
              const payments = await whopGetV1('/payments', {
                account_id: WHOP_COMPANY_ID,
                query: q,
                first: '25',
              });
              anyApiSuccess = true;
              for (const p of payments?.data || []) {
                if (p?.user && p.user.email === null) sawNullEmail = true;
                const planId: string = p?.plan?.id ?? p?.plan_id ?? p?.plan;
                const pStatus = String(p?.status || '').toLowerCase();
                const pSubstatus = String(p?.substatus || '').toLowerCase();
                const mStatus = String(p?.membership?.status || '').toLowerCase();
                const isPaid =
                  pStatus === 'paid' ||
                  pSubstatus === 'succeeded' ||
                  VALID_MEMBERSHIP_STATUSES.has(mStatus);

                if (!isPaid || !WHOP_PLANS[planId]) continue;

                const isExactEmailQuery = q === email;
                const userMatches = matchesUserEmailOrPrefix(
                  {
                    email: p?.user?.email ?? p?.email ?? p?.billing_address?.email,
                    username: p?.user?.username ?? p?.username,
                    name: p?.user?.name ?? p?.billing_address?.name,
                  },
                  email,
                  emailPrefix
                );
                if (isExactEmailQuery || userMatches) {
                  considerCandidate(
                    planId,
                    p?.membership?.id ?? p?.id,
                    p?.renewal_period_end ?? p?.current_period_end
                  );
                }
              }
            } catch (e: any) {
              apiErrors.push(String(e?.message || e));
            }
          }
        }

        // 4. Fallback to Whop API v2 / v5 memberships if v1 didn't find it
        if (!best) {
          for (const [base, pathUrl] of [
            [API_V2, '/memberships'],
            [API_V5, '/company/memberships'],
          ] as const) {
            if (best) break;
            try {
              const ms = await whopFetchJson(base, pathUrl, { per: '50' });
              anyApiSuccess = true;
              for (const m of ms?.data || []) {
                const planId: string = m?.plan?.id ?? m?.plan_id ?? m?.plan;
                const status = String(m?.status || '').toLowerCase();
                const isValid = VALID_MEMBERSHIP_STATUSES.has(status) || m?.valid === true;
                if (!isValid || !WHOP_PLANS[planId]) continue;

                const matchesUser = matchesUserEmailOrPrefix(
                  {
                    email: m?.email ?? m?.user?.email,
                    username: m?.username ?? m?.user?.username,
                    name: m?.name ?? m?.user?.name,
                  },
                  email,
                  emailPrefix
                );
                if (matchesUser) {
                  considerCandidate(
                    planId,
                    m.id,
                    m.renewal_period_end ? String(m.renewal_period_end) : undefined
                  );
                }
              }
            } catch (e: any) {
              apiErrors.push(String(e?.message || e));
            }
          }
        }
      }

      if (!best) {
        if (!anyApiSuccess && apiErrors.length > 0) {
          throw new Error(apiErrors[0]);
        }

        const scopeHint = sawNullEmail
          ? ' (Aviso técnico: La API Key de Whop devolvió email=null; habilita los permisos member:email:read, member:basic:read, membership:basic:read y payment:basic:read en tu API Key de Whop).'
          : '';

        return res.json({
          success: true,
          active: false,
          message: `No encontramos una suscripción activa para ese correo.${scopeHint}`,
        });
      }

      const foundBest = best as { planId: string; membershipId: string; periodEnd?: string };
      const plan = WHOP_PLANS[foundBest.planId];
      res.json({
        success: true,
        active: true,
        tier: plan.tier,
        quota: plan.quota,
        planName: plan.name,
        membershipId: foundBest.membershipId,
        currentPeriodEnd: foundBest.periodEnd,
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
