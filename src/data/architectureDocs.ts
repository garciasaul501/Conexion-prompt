export const ARCHITECTURE_FOLDER_TREE = `conexión-prompts/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx          # Galería principal de prompts
│   │   ├── prompts/[id]/page.tsx       # Editor & Ejecutador de prompt
│   │   ├── pricing/page.tsx            # Tabla de planes y suscripción PayPal
│   │   └── settings/integrations/page.tsx # Gestor de API Keys
│   ├── api/
│   │   ├── execute-prompt/route.ts     # Route Handler para ejecución IA
│   │   ├── paypal/checkout/route.ts   # Integración PayPal Subscriptions
│   │   └── paypal/webhook/route.ts    # Listener de Webhooks / IPN de PayPal
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                             # Componentes Shadcn/ui
│   ├── PromptGallery.tsx
│   ├── PromptExecutorModal.tsx
│   ├── PricingPage.tsx
│   └── Navbar.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # Cliente Supabase Browser
│   │   └── server.ts                   # Cliente Supabase Server Component
│   ├── paypal.ts                       # SDK / API PayPal Billing
│   └── ai-providers.ts                 # Wrapper unificado Gemini / OpenAI / Claude
└── types/
    └── index.ts`;

export const SERVER_ACTION_EXAMPLE_CODE = `// app/api/execute-prompt/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { promptId, variables } = await request.json();

    // 1. Obtener el prompt desde Supabase
    const { data: prompt, error } = await supabase
      .from('prompts')
      .select('*, categories(*)')
      .eq('id', promptId)
      .single();

    if (error || !prompt) {
      return NextResponse.json({ error: 'Prompt no encontrado' }, { status: 404 });
    }

    // 2. Verificar si es Premium y si el usuario tiene suscripción activa en PayPal
    if (prompt.is_premium) {
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('plan_type, status')
        .eq('user_id', user.id)
        .single();

      if (!sub || sub.plan_type === 'free' || sub.status !== 'active') {
        return NextResponse.json(
          { error: 'Este prompt requiere un plan Pro o Enterprise activo con PayPal.' },
          { status: 403 }
        );
      }
    }

    // 3. Reemplazo dinámico de variables (ej: {{tono}}, {{tema}})
    let compiledContent = prompt.template_content;
    Object.entries(variables || {}).forEach(([key, val]) => {
      const regex = new RegExp(\`\\\\{\\\\{\\\\s*\${key}\\\\s*\\\\}\\\\}\`, 'g');
      compiledContent = compiledContent.replace(regex, String(val || ''));
    });

    // 4. Ejecución con la API de Google Gemini (u OpenAI/Claude)
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: prompt.recommended_model || 'gemini-3.6-flash',
      contents: compiledContent,
    });

    // 5. Incrementar contador de usos
    await supabase.rpc('increment_prompt_uses', { prompt_id_input: promptId });

    return NextResponse.json({
      success: true,
      compiledPrompt: compiledContent,
      output: response.text,
      modelUsed: prompt.recommended_model || 'gemini-3.6-flash',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}`;

export const PAYPAL_WEBHOOK_CODE = `// app/api/paypal/webhook/route.ts
import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const eventType = body.event_type;
    const resource = body.resource;

    const supabaseAdmin = createAdminSupabaseClient();

    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.CREATED':
      case 'PAYMENT.SALE.COMPLETED': {
        const subscriptionId = resource.id || 'I-PP-SUB-88192837';
        const payerEmail = resource.subscriber?.email_address;
        const payerId = resource.subscriber?.payer_id;

        await supabaseAdmin
          .from('subscriptions')
          .upsert({
            paypal_subscription_id: subscriptionId,
            paypal_payer_id: payerId,
            paypal_email: payerEmail,
            plan_type: 'pro',
            status: 'active',
            monthly_prompt_quota: 1000,
            updated_at: new Date().toISOString(),
          });
        break;
      }

      case 'BILLING.SUBSCRIPTION.CANCELLED': {
        const subscriptionId = resource.id;

        await supabaseAdmin
          .from('subscriptions')
          .update({
            plan_type: 'free',
            status: 'canceled',
            monthly_prompt_quota: 50,
            updated_at: new Date().toISOString(),
          })
          .eq('paypal_subscription_id', subscriptionId);
        break;
      }
    }

    return NextResponse.json({ success: true, event: eventType });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'PayPal Webhook Error' }, { status: 500 });
  }
}`;

export const STRIPE_WEBHOOK_CODE = PAYPAL_WEBHOOK_CODE;
