import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { registerWhopWebhook, registerWhopBilling } from './whopBilling';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

registerWhopWebhook(app);
app.use(express.json());
registerWhopBilling(app);

// Initialize Gemini Client
const getGeminiClient = (customApiKey?: string) => {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('No API Key provided and GEMINI_API_KEY is missing');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Fallback sequence when a model encounters high demand (503 UNAVAILABLE) or rate limits (429)
const getFallbackModels = (initialModel: string): string[] => {
  const models = [
    initialModel,
    'gemini-3.8-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
  ];
  return Array.from(new Set(models));
};

const isDemandOrRateLimitError = (error: any): boolean => {
  if (!error) return false;
  const message = String(error.message || '').toLowerCase();
  const statusStr = String(error.status || '').toLowerCase();
  const code = error.code ?? error.status;
  const codeStr = String(code || '');

  return (
    code === 503 ||
    code === 429 ||
    codeStr === '503' ||
    codeStr === '429' ||
    statusStr === 'unavailable' ||
    statusStr === 'resource_exhausted' ||
    statusStr.includes('503') ||
    statusStr.includes('429') ||
    message.includes('high demand') ||
    message.includes('unavailable') ||
    message.includes('spikes in demand') ||
    message.includes('overloaded') ||
    message.includes('resource exhausted') ||
    message.includes('rate limit') ||
    message.includes('try again later') ||
    message.includes('quota')
  );
};

interface ResilientGenerationParams {
  model: string;
  contents: any;
  config?: any;
  customApiKey?: string;
  maxAttemptsPerModel?: number;
}

interface ResilientGenerationResult {
  text: string;
  modelUsed: string;
  fallbackOccurred: boolean;
  originalModel: string;
  executionTimeMs: number;
  notice?: string;
}

async function generateContentWithResilience({
  model,
  contents,
  config,
  customApiKey,
  maxAttemptsPerModel = 2,
}: ResilientGenerationParams): Promise<ResilientGenerationResult> {
  const ai = getGeminiClient(customApiKey);

  // Normalize model name to modern supported models
  let primaryModel = model || 'gemini-3.8-flash';
  if (primaryModel === 'gemini-3.6-flash' || primaryModel === 'gemini-3.7-flash') {
    primaryModel = 'gemini-3.8-flash';
  }

  const candidateModels = getFallbackModels(primaryModel);
  let lastError: any = null;
  const startTime = Date.now();

  for (let mIndex = 0; mIndex < candidateModels.length; mIndex++) {
    const currentModel = candidateModels[mIndex];

    for (let attempt = 1; attempt <= maxAttemptsPerModel; attempt++) {
      try {
        console.log(`[Gemini Engine] Intentando modelo ${currentModel} (intento ${attempt}/${maxAttemptsPerModel})`);
        const response = await ai.models.generateContent({
          model: currentModel,
          contents,
          config,
        });

        const outputText = response.text || '';
        const executionTimeMs = Date.now() - startTime;
        const fallbackOccurred = currentModel !== primaryModel;

        return {
          text: outputText,
          modelUsed: currentModel,
          fallbackOccurred,
          originalModel: primaryModel,
          executionTimeMs,
          notice: fallbackOccurred
            ? `Nota: Por alta demanda momentánea en ${primaryModel}, la solicitud se ejecutó exitosamente con ${currentModel}.`
            : undefined,
        };
      } catch (err: any) {
        lastError = err;
        console.warn(
          `[Gemini Engine] Modelo ${currentModel} (intento ${attempt}) falló: ${err?.message || err}`
        );

        if (isDemandOrRateLimitError(err)) {
          const delayMs = attempt * 800 + Math.floor(Math.random() * 400);
          console.log(`[Gemini Engine] Pausa de retroceso de ${delayMs}ms antes de reintentar o cambiar de modelo...`);
          await sleep(delayMs);
        } else {
          // If error is not a transient demand/rate issue, move to next model immediately
          break;
        }
      }
    }
  }

  throw lastError || new Error('No se pudo completar la solicitud con los modelos de IA disponibles');
}

// Healthcheck API
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Prompt Execution Endpoint
app.post('/api/execute-prompt', async (req, res) => {
  try {
    const { templateContent, variables, model = 'gemini-3.8-flash', systemInstruction, customApiKey } = req.body;

    if (!templateContent) {
      return res.status(400).json({ error: 'templateContent is required' });
    }

    // Replace {{variable}} placeholders with user values
    let compiledPrompt = templateContent;
    if (variables && typeof variables === 'object') {
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
        compiledPrompt = compiledPrompt.replace(regex, String(value ?? ''));
      });
    }

    const result = await generateContentWithResilience({
      model,
      contents: compiledPrompt,
      config: systemInstruction ? { systemInstruction } : undefined,
      customApiKey,
    });

    res.json({
      success: true,
      compiledPrompt,
      output: result.text || 'Sin respuesta generada',
      modelUsed: result.modelUsed,
      fallbackOccurred: result.fallbackOccurred,
      fallbackNotice: result.notice,
      executionTimeMs: result.executionTimeMs,
      tokensEstimate: Math.round(compiledPrompt.length / 4 + (result.text?.length || 0) / 4),
    });
  } catch (err: any) {
    console.error('Error executing prompt:', err);
    const isDemandError = isDemandOrRateLimitError(err);
    res.status(isDemandError ? 503 : 500).json({
      success: false,
      isDemandError,
      error: isDemandError
        ? 'El modelo de IA está experimentando alta demanda momentánea. Haz clic en "Reintentar" o selecciona Gemini 3.1 Flash Lite.'
        : (err?.message || 'Error en la ejecución del prompt con IA'),
    });
  }
});

// Prompt Optimizer Endpoint (Transforms raw text/prompt into an elite engineered prompt)
app.post('/api/optimize-prompt', async (req, res) => {
  try {
    const { rawPrompt, targetGoal = 'high-conversion', customApiKey } = req.body;

    if (!rawPrompt || typeof rawPrompt !== 'string') {
      return res.status(400).json({ error: 'El prompt a optimizar es requerido' });
    }

    const systemPrompt = `Eres un Principal Prompt Engineer & Arquitecto de IA de clase mundial.
Tu misión es transformar un prompt básico, ambiguo o desestructurado en un Prompt Maestro de Alto Rendimiento para la era de la Inteligencia Artificial (2026).

Aplica rigurosamente la metodología R-C-O-F-C:
1. Rol Especializado (Role & Persona de Autoridad)
2. Contexto & Antecedentes (Context & Domain Knowledge)
3. Objetivo Claro & Pasos de Ejecución (Step-by-step Execution)
4. Formato de Salida Estructurado (Output Schema / Markdown formatting)
5. Restricciones y Reglas Negativas (Constraints & Negative Rules)
6. Variables Dinámicas Reutilizables encerradas en {{nombre_variable}} para máxima versatilidad.

Devuelve un objeto JSON con este formato exacto:
{
  "title": "Título conciso y comercial del prompt optimizado (máx 60 caracteres)",
  "description": "Explicación del beneficio real que obtendrá el usuario",
  "optimizedPrompt": "Texto completo del prompt optimizado con variables {{variable}}",
  "variables": [
    {
      "name": "variable_name",
      "label": "Etiqueta clara en español",
      "placeholder": "Ejemplo o placeholder",
      "type": "text",
      "defaultValue": "Valor sugerido útil",
      "options": ["Op1", "Op2"]
    }
  ],
  "categorySuggested": "cat-marketing",
  "tags": ["Tag1", "Tag2", "Tag3"],
  "qualityScoreBefore": 42,
  "qualityScoreAfter": 96,
  "improvementsApplied": [
    "Asignación de rol de autoridad",
    "Estructura paso a paso añadida",
    "Inyección de variables dinámicas"
  ],
  "tipsForBestResults": [
    "Consejo 1 para sacar el mayor provecho",
    "Consejo 2 para interactuar con el modelo"
  ]
}`;

    const userMessage = `Prompt original a optimizar:
"""
${rawPrompt}
"""
Objetivo prioritario: ${targetGoal}
Genera el JSON optimizado.`;

    const result = await generateContentWithResilience({
      model: 'gemini-3.8-flash',
      contents: userMessage,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
      customApiKey,
    });

    const jsonText = result.text || '{}';
    let parsedData: any = {};
    try {
      parsedData = JSON.parse(jsonText);
    } catch {
      const clean = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(clean);
    }

    res.json({
      success: true,
      data: {
        originalPrompt: rawPrompt,
        optimizedPrompt: parsedData.optimizedPrompt || rawPrompt,
        title: parsedData.title || 'Prompt Maestro Optimizado',
        description: parsedData.description || 'Versión optimizada con ingeniería de prompts avanzada.',
        variables: parsedData.variables || [],
        categorySuggested: parsedData.categorySuggested || 'cat-marketing',
        tags: parsedData.tags || ['Optimizado', 'IA 2026'],
        qualityScoreBefore: parsedData.qualityScoreBefore || 40,
        qualityScoreAfter: parsedData.qualityScoreAfter || 95,
        improvementsApplied: parsedData.improvementsApplied || [
          'Estructuración con Rol y Contexto',
          'Parametrización con variables dinámicas',
          'Definición de formato de salida estricto',
        ],
        tipsForBestResults: parsedData.tipsForBestResults || [
          'Completa todas las variables para obtener un resultado más personalizado.',
          'Puedes iterar y pedir variaciones de tono en una sola ejecución.',
        ],
      },
      modelUsed: result.modelUsed,
      fallbackNotice: result.notice,
    });
  } catch (err: any) {
    console.error('Error optimizing prompt:', err);
    const isDemandError = isDemandOrRateLimitError(err);
    res.status(isDemandError ? 503 : 500).json({
      success: false,
      isDemandError,
      error: isDemandError
        ? 'Alta demanda momentánea en la IA. Por favor haz clic en "Reintentar Optimización".'
        : (err?.message || 'Error al optimizar el prompt con IA'),
    });
  }
});

// Idea-to-Prompt AI Generation Endpoint
app.post('/api/generate-prompt-idea', async (req, res) => {
  try {
    const { idea, customApiKey } = req.body;

    if (!idea || typeof idea !== 'string') {
      return res.status(400).json({ error: 'La idea es requerida para generar el prompt' });
    }

    const promptForGemini = `Actúa como un experto Diseñador de Prompts e Ingeniero de Prompts IA Senior.
El usuario tiene la siguiente idea o necesidad para crear un prompt reutilizable con variables:
"${idea}"

Crea un objeto JSON estructurado con un prompt completo de calidad profesional.

Esquema JSON estricto requerido:
{
  "title": "Título conciso y profesional del prompt (máximo 65 caracteres)",
  "description": "Explicación clara de lo que logra este prompt (1-2 oraciones)",
  "templateContent": "Cuerpo completo del prompt con variables clave encerradas en llaves dobles {{nombre_variable}}. Sé sumamente detallado, dando rol, contexto, instrucciones y formato de salida esperado.",
  "variables": [
    {
      "name": "nombre_variable_snake_case",
      "label": "Etiqueta entendible para el usuario",
      "placeholder": "Ejemplo o instruccion para llenar",
      "type": "text",
      "defaultValue": "Valor por defecto útil",
      "options": ["Opcion1", "Opcion2"]
    }
  ],
  "categoryId": "cat-marketing",
  "tags": ["Tag1", "Tag2", "Tag3"],
  "recommendedModel": "gemini-3.8-flash"
}

Responde EXCLUSIVAMENTE con el objeto JSON válido sin bloques markdown extra.`;

    const result = await generateContentWithResilience({
      model: 'gemini-3.8-flash',
      contents: promptForGemini,
      config: {
        responseMimeType: 'application/json',
      },
      customApiKey,
    });

    const jsonText = result.text || '{}';
    let generatedData: any = {};
    try {
      generatedData = JSON.parse(jsonText);
    } catch {
      const cleanJson = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
      generatedData = JSON.parse(cleanJson);
    }

    const newPrompt = {
      id: `p-gen-${Date.now()}`,
      title: generatedData.title || 'Prompt Generado desde Idea',
      description: generatedData.description || 'Prompt generado automáticamente a partir de tu idea con Inteligencia Artificial.',
      templateContent: generatedData.templateContent || `Actúa como un experto en ${idea}.\n\nContexto: {{contexto}}\nObjetivo: {{objetivo}}`,
      variables: generatedData.variables && Array.isArray(generatedData.variables) && generatedData.variables.length > 0 
        ? generatedData.variables 
        : [
            { name: 'contexto', label: 'Contexto o Industria', placeholder: 'Describe el contexto', type: 'text', defaultValue: 'General' },
            { name: 'objetivo', label: 'Objetivo Principal', placeholder: 'Punto clave a lograr', type: 'textarea', defaultValue: idea },
          ],
      isPremium: false,
      categoryId: generatedData.categoryId || 'cat-marketing',
      recommendedModel: generatedData.recommendedModel || 'gemini-3.8-flash',
      authorName: 'Creado por TI & Gemini IA',
      authorAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=150',
      thumbnailUrl:
        generatedData.categoryId === 'cat-agents'
          ? '/src/assets/images/thumb_agent_ai_1791081925923.jpg'
          : generatedData.categoryId === 'cat-sales'
          ? '/src/assets/images/thumb_sales_whatsapp_1791081934959.jpg'
          : generatedData.categoryId === 'cat-social'
          ? '/src/assets/images/thumb_viral_video_1791081944537.jpg'
          : generatedData.categoryId === 'cat-code'
          ? '/src/assets/images/thumb_code_dev_1791081963962.jpg'
          : '/src/assets/images/thumb_seo_marketing_1791081954600.jpg',
      usesCount: 1,
      rating: 5.0,
      tags: generatedData.tags || ['Generado con IA', 'Idea'],
      createdAt: new Date().toISOString().split('T')[0],
    };

    res.json({
      success: true,
      prompt: newPrompt,
      modelUsed: result.modelUsed,
      fallbackNotice: result.notice,
    });
  } catch (err: any) {
    console.error('Error generating prompt from idea:', err);
    const isDemandError = isDemandOrRateLimitError(err);
    res.status(isDemandError ? 503 : 500).json({
      success: false,
      isDemandError,
      error: isDemandError
        ? 'Alta demanda momentánea en la IA. Por favor haz clic en "Reintentar Creación".'
        : (err?.message || 'Error al generar el prompt con IA a partir de la idea'),
    });
  }
});

// TikTok OAuth 2.0 URL Endpoint (Following 3P OAuth Guidelines)
app.get('/api/auth/tiktok/url', (req, res) => {
  const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
  const redirectUri = `${baseUrl}/auth/tiktok/callback`;
  const clientKey = process.env.TIKTOK_CLIENT_KEY || 'aw392229245207';
  const csrfState = Math.random().toString(36).substring(2);

  const params = new URLSearchParams({
    client_key: clientKey,
    scope: 'user.info.basic,video.upload,video.publish',
    response_type: 'code',
    redirect_uri: redirectUri,
    state: csrfState,
  });

  const authUrl = `https://www.tiktok.com/v2/auth/authorize/?${params}`;
  res.json({
    url: authUrl,
    redirectUri,
    configured: !!process.env.TIKTOK_CLIENT_KEY,
  });
});

// TikTok OAuth Callback Route (Cross-Origin postMessage + window.close)
app.get(['/auth/tiktok/callback', '/auth/tiktok/callback/'], (req, res) => {
  const { code } = req.query;
  res.send(`
    <html>
      <head><title>TikTok Authentication</title></head>
      <body style="font-family: sans-serif; display:flex; align-items:center; justify-content:center; height:100vh; margin:0; background:#f8fafc;">
        <div style="text-align:center; padding:28px; background:white; border-radius:20px; border:1px solid #e2e8f0; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1); max-width:360px;">
          <div style="width:48px; height:48px; border-radius:12px; background:#000; color:#fff; display:flex; align-items:center; justify-content:center; margin:0 auto 16px auto; font-weight:bold; font-size:24px;">d</div>
          <h2 style="margin:0 0 8px 0; color:#0f172a; font-size:18px;">Cuenta TikTok Conectada</h2>
          <p style="margin:0; color:#64748b; font-size:13px;">Sincronizando con Conexión Prompts y cerrando ventana...</p>
        </div>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', provider: 'tiktok', code: ${JSON.stringify(code || 'tiktok_live_code')} }, '*');
            setTimeout(() => window.close(), 700);
          } else {
            window.location.href = '/';
          }
        </script>
      </body>
    </html>
  `);
});

// TikTok Direct Draft Execution / Script Formatting
app.post('/api/tiktok/publish-draft', (req, res) => {
  try {
    const {
      title,
      scriptText,
      accountUsername = '@saulgarcia_ia',
      hashtags = ['#viral', '#fyp', '#parati', '#ia', '#creadordecontenido', '#negocios'],
    } = req.body;
    const postId = `tt_draft_${Date.now()}`;
    const cleanAccount = accountUsername.startsWith('@') ? accountUsername : `@${accountUsername}`;

    // Generate formatted script breakdown for TikTok Creator
    const cleanText = String(scriptText || title || '');
    const hook = cleanText.split('\n')[0] || `Descubre cómo dominar este prompt para tu negocio`;
    
    res.json({
      success: true,
      postId,
      status: 'ready_in_tiktok',
      accountUsername: cleanAccount,
      message: `Guión y metadatos formateados listos para TikTok Creator Studio en la cuenta ${cleanAccount}`,
      tiktokStudioUrl: 'https://www.tiktok.com/tiktokstudio/upload',
      formattedCaption: `${title || 'Guión Viral IA'}\n\nCreado para ${cleanAccount}\n${(hashtags || []).join(' ')}`,
      creatorScript: {
        hook: hook.replace(/^#+\s*/, ''),
        body: cleanText,
        callToAction: `Sígueme en ${cleanAccount} y comenta "PROMPT" para enviártelo completo.`,
      },
      fullScript: cleanText,
      uploadedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Error al preparar ejecución en TikTok' });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false, watch: null },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Conexión Prompts] Server standard on http://0.0.0.0:${PORT}`);
  });
}

startServer();
