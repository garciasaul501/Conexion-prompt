import type { Express, Request, Response } from 'express';

const WHOP_API_KEY = process.env.WHOP_API_KEY || '';
const WHOP_APP_ID = process.env.NEXT_PUBLIC_WHOP_APP_ID || process.env.WHOP_APP_ID || 'app_Z9uG5HDyKePvKL';

export const WHOP_PLAN_MAP: Record<
  string,
  { tier: string; planName: string; quota: number }
> = {
  plan_SIfpnGTuD8aqA: { tier: '10', planName: 'Plan 10 Prompts', quota: 10 },
  plan_ICnjxZQ83eiJR: { tier: '30', planName: 'Plan 30 Prompts', quota: 30 },
  plan_q5j9FOvuIZmaQ: { tier: '50', planName: 'Plan 50 Prompts', quota: 50 },
  plan_NnHFpV95rjcod: { tier: '100', planName: 'Plan 100 Prompts', quota: 100 },
  plan_22ppS98N4577w: { tier: '500', planName: 'Plan 500 Prompts', quota: 500 },
  plan_8dSaYNyZiabrU: { tier: '1000', planName: 'Plan 1000 Prompts', quota: 1000 },
};

interface CachedEntitlement {
  email: string;
  tier: string;
  planName: string;
  quota: number;
  active: boolean;
  currentPeriodEnd?: string;
  updatedAt: string;
}

const entitlementsByEmail = new Map<string, CachedEntitlement>();

export function registerWhopBilling(app: Express): void {
  // Whop App Config & Status Endpoint
  app.get('/api/whop/config', (_req: Request, res: Response) => {
    res.json({
      success: true,
      appId: WHOP_APP_ID,
      hasApiKey: !!WHOP_API_KEY,
      whopProfileUrl: 'https://whop.com/@saulmente',
      discountCode: 'WHOP40',
      message: 'Whop billing integration active.',
    });
  });

  // Whop Entitlement Check by Email
  app.get('/api/whop/entitlement', async (req: Request, res: Response) => {
    try {
      const email = String(req.query.email || '').trim().toLowerCase();
      if (!email || !email.includes('@')) {
        return res.status(400).json({
          success: false,
          error: 'Ingresa un correo electrónico válido.',
        });
      }

      // 1. Check webhook/in-memory cache first
      const cached = entitlementsByEmail.get(email);
      if (cached && cached.active) {
        return res.json({
          success: true,
          active: true,
          tier: cached.tier,
          planName: cached.planName,
          quota: cached.quota,
          currentPeriodEnd: cached.currentPeriodEnd,
        });
      }

      // 2. Query Whop API v2 / v5 if WHOP_API_KEY is configured
      if (WHOP_API_KEY) {
        try {
          const whopResp = await fetch(
            `https://api.whop.com/api/v2/memberships?valid=true&per=50`,
            {
              headers: {
                Authorization: `Bearer ${WHOP_API_KEY}`,
                Accept: 'application/json',
              },
            }
          );

          if (whopResp.ok) {
            const payload: any = await whopResp.json();
            const memberships: any[] = Array.isArray(payload?.data) ? payload.data : [];
            const match = memberships.find(
              (m) =>
                String(m?.email || m?.user?.email || '').trim().toLowerCase() === email &&
                (m?.valid === true || m?.status === 'active' || m?.status === 'trialing')
            );

            if (match) {
              const planId = String(match.plan || match.plan_id || '');
              const planInfo = WHOP_PLAN_MAP[planId] || {
                tier: '50',
                planName: 'Plan 50 Prompts',
                quota: 50,
              };
              const periodEnd = match.renewal_period_end
                ? new Date(Number(match.renewal_period_end) * 1000).toISOString().split('T')[0]
                : undefined;

              const record: CachedEntitlement = {
                email,
                tier: planInfo.tier,
                planName: planInfo.planName,
                quota: planInfo.quota,
                active: true,
                currentPeriodEnd: periodEnd,
                updatedAt: new Date().toISOString(),
              };
              entitlementsByEmail.set(email, record);

              return res.json({
                success: true,
                active: true,
                tier: record.tier,
                planName: record.planName,
                quota: record.quota,
                currentPeriodEnd: record.currentPeriodEnd,
              });
            }
          }
        } catch (apiErr) {
          console.warn('[Whop Entitlement] Error querying Whop API:', apiErr);
        }
      }

      return res.json({
        success: true,
        active: false,
        message: 'No encontramos una suscripción activa en Whop con ese correo.',
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err?.message || 'No se pudo verificar tu suscripción.',
      });
    }
  });

  // Whop Webhook Receiver (membership.went_valid, membership.went_invalid, payment.succeeded)
  app.post('/api/whop/webhook', (req: Request, res: Response) => {
    try {
      const body = req.body || {};
      const action = String(body.action || body.event || body.type || '');
      const data = body.data || body.resource || body;
      const email = String(data?.email || data?.user?.email || '').trim().toLowerCase();
      const planId = String(data?.plan || data?.plan_id || '');

      if (email) {
        const planInfo = WHOP_PLAN_MAP[planId] || {
          tier: '50',
          planName: 'Plan 50 Prompts',
          quota: 50,
        };
        const isInvalid =
          action.includes('invalid') ||
          action.includes('cancel') ||
          data?.valid === false ||
          data?.status === 'canceled';

        entitlementsByEmail.set(email, {
          email,
          tier: isInvalid ? 'free' : planInfo.tier,
          planName: isInvalid ? 'Free' : planInfo.planName,
          quota: isInvalid ? 5 : planInfo.quota,
          active: !isInvalid,
          currentPeriodEnd: data?.renewal_period_end
            ? new Date(Number(data.renewal_period_end) * 1000).toISOString().split('T')[0]
            : undefined,
          updatedAt: new Date().toISOString(),
        });
      }

      res.json({ received: true, action });
    } catch (err: any) {
      res.status(500).json({ received: false, error: err?.message });
    }
  });

  // Whop Discount Validation Endpoint
  app.post('/api/whop/validate-discount', (req: Request, res: Response) => {
    const { usernameOrCode } = req.body || {};
    const input = String(usernameOrCode || '').trim().toLowerCase();
    if (!input) {
      return res.status(400).json({
        valid: false,
        message: 'Ingresa el código WHOP40 o tu usuario de Whop.',
      });
    }
    return res.json({
      valid: true,
      discountPercentage: 40,
      promoCode: 'WHOP40',
      whopUrl: 'https://whop.com/@saulmente',
      message: '¡40% de descuento activado con el código WHOP40!',
    });
  });
}
