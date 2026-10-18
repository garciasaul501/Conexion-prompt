import {
  PromptCategory,
  Prompt,
  UserProfile,
  UserSubscription,
  UserIntegration,
  PricingTier,
  MonthlyExecutionRecord,
  PromptVersionAnalyticsPoint,
  PromptExecutionTelemetry,
} from '../types';

export const INITIAL_CATEGORIES: PromptCategory[] = [
  {
    id: 'cat-all',
    name: 'Todos los Prompts',
    slug: 'todos',
    description: 'Explora todos los prompts profesionales disponibles',
    iconName: 'Grid',
    count: 10,
  },
  {
    id: 'cat-agents',
    name: 'Agentes & Automatización IA',
    slug: 'agentes-ia',
    description: 'System prompts, agentes autónomos, flujos multi-paso y atención 24/7',
    iconName: 'Bot',
    count: 2,
  },
  {
    id: 'cat-sales',
    name: 'Ventas & Cierres (WhatsApp/B2B)',
    slug: 'ventas',
    description: 'Prospección en frío, guiones de cierre, manejo de objeciones y funnels',
    iconName: 'Target',
    count: 2,
  },
  {
    id: 'cat-marketing',
    name: 'Marketing & SEO',
    slug: 'marketing',
    description: 'Estrategias de contenido, campañas publicitarias de alta conversión y SEO B2B',
    iconName: 'TrendingUp',
    count: 2,
  },
  {
    id: 'cat-social',
    name: 'Guiones Virales & Redes',
    slug: 'redes-sociales',
    description: 'Hooks para TikTok, Reels, YouTube Shorts y carruseles de LinkedIn',
    iconName: 'Video',
    count: 2,
  },
  {
    id: 'cat-code',
    name: 'Programación & DevOps',
    slug: 'programacion',
    description: 'Refactorización, Clean Code, pruebas unitarias y arquitectura Cloud',
    iconName: 'Code',
    count: 2,
  },
  {
    id: 'cat-product',
    name: 'Producto & Negocio',
    slug: 'producto',
    description: 'PRDs ágiles, análisis de competencia y validación de startups',
    iconName: 'Layers',
    count: 1,
  },
  {
    id: 'cat-art',
    name: 'Arte & Midjourney / Flux',
    slug: 'arte-ia',
    description: 'Prompts cinematográficos hiperrealistas para generadores de imagen',
    iconName: 'Image',
    count: 1,
  },
];

export const INITIAL_PROMPTS: Prompt[] = [
  {
    id: 'p-agent-1',
    title: 'Arquitecto de System Prompt para Agente de Atención al Cliente 24/7',
    description: 'Genera un prompt de sistema blindado con directrices de tono, políticas de escalamiento a humanos y formato de respuestas sin alucinaciones.',
    templateContent: `Eres un Prompt Architect Senior especializado en agentes conversacionales autónomos con IA.
Diseña el System Prompt oficial para un asistente virtual de IA de la empresa {{empresa}}.

Información de la empresa y servicio:
- Nombre de la Empresa: {{empresa}}
- Industria / Sector: {{sector}}
- Tono y Personalidad: {{tono_asistente}}
- Servicios / Productos Principales: {{servicios}}
- Reglas de Escalamiento a Humano: {{regla_escalamiento}}

Estructura obligatoria del System Prompt generado:
1. **Identidad & Propósito**: Rol preciso y límites operativos del asistente.
2. **Conocimiento Base & Contexto**: Respuestas a las 3 preguntas frecuentes más críticas.
3. **Reglas Negativas Estrictas**: Qué NUNCA debe decir o prometer (precios no oficiales, opiniones políticas, inventar datos).
4. **Protocolo de Enrutamiento**: Pasos exactos cuando un usuario solicita soporte humano urgente.
5. **Ejemplos Few-Shot**: 2 intercambios modelo (Pregunta del cliente -> Respuesta ejemplar del bot).`,
    variables: [
      { name: 'empresa', label: 'Nombre de la Empresa', placeholder: 'TechCare Logistics', type: 'text', defaultValue: 'NovaSaaS Solutions' },
      { name: 'sector', label: 'Sector o Industria', placeholder: 'Comercio Electrónico B2B', type: 'text', defaultValue: 'Software de Automatización Empresarial' },
      { name: 'tono_asistente', label: 'Tono del Asistente', type: 'select', options: ['Empático, rápido y ejecutivo', 'Formal y altamente técnico', 'Cálido, amigable y resolutivo'], defaultValue: 'Empático, rápido y ejecutivo' },
      { name: 'servicios', label: 'Servicios Principales', type: 'textarea', placeholder: 'Detalles de lo que ofrecen', defaultValue: 'Planes Pro de gestión de inventarios, integraciones API y soporte 24/7.' },
      { name: 'regla_escalamiento', label: 'Regla de Escalamiento Humano', type: 'text', defaultValue: 'Si el usuario menciona fallas de pago, reembolso o solicita 2 veces hablar con una persona.' },
    ],
    isPremium: true,
    categoryId: 'cat-agents',
    recommendedModel: 'gemini-3.8-flash',
    authorName: 'Equipo Conexión Whop',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    thumbnailUrl: '/src/assets/images/thumb_agent_ai_1791081925923.jpg',
    usesCount: 4320,
    rating: 5.0,
    tags: ['Agentes IA', 'System Prompt', 'Customer Support', 'Automatización'],
    createdAt: '2026-02-10',
  },
  {
    id: 'p-sales-1',
    title: 'Guión de Ventas por WhatsApp & DM (Fórmula Cierre Consultivo 3 Pasos)',
    description: 'Transforma prospectos fríos en llamadas agendadas o ventas directas por WhatsApp mediante preguntas estratégicas de diagnóstico.',
    templateContent: `Actúa como el Director de Ventas y Closer de Alto Valor (High Ticket) para {{tipo_oferta}}.
Diseña un guión de conversación en tiempo real por WhatsApp / Instagram DM para responder al lead que acaba de preguntar: "{{mensaje_lead}}".

Datos del producto/servicio:
- Producto / Servicio: {{nombre_producto}}
- Precio / Ticket: {{rango_precio}}
- Transformación Principal que logra el cliente: {{beneficio_principal}}
- Principal Objeción que suelen poner: {{objecion_comun}}

Estructura de respuesta que debes entregar:
1. **Mensaje 1 (Validación + Pregunta de Diagnóstico Inmediata)**: Rompe el patrón sin responder solo con el precio.
2. **Mensaje 2 (Profundización en el Dolor)**: Cómo responder cuando el prospecto comparte su situación.
3. **Mensaje 3 (Transición al Cierre / Llamada)**: CTA de bajo compromiso para concretar la reunión o compra.
4. **Manejo Blindado de la Objeción "{{objecion_comun}}"**: Respuesta persuasiva en audio o texto.`,
    variables: [
      { name: 'tipo_oferta', label: 'Tipo de Oferta', placeholder: 'Consultoría High Ticket', type: 'text', defaultValue: 'Agencia de IA & Automatizaciones' },
      { name: 'mensaje_lead', label: 'Mensaje Inicial del Lead', placeholder: 'Hola, ¿cuánto cuesta el servicio?', type: 'text', defaultValue: 'Hola, me interesa saber el precio de su servicio de automatización' },
      { name: 'nombre_producto', label: 'Nombre del Servicio/Producto', type: 'text', defaultValue: 'Implementación de Asistentes IA a Medida' },
      { name: 'rango_precio', label: 'Precio / Rango', type: 'text', defaultValue: '$800 - $2,500 USD' },
      { name: 'beneficio_principal', label: 'Beneficio Clave', type: 'textarea', defaultValue: 'Ahorrar 20 horas semanales a su equipo y triplicar la velocidad de respuesta a clientes.' },
      { name: 'objecion_comun', label: 'Objeción más habitual', type: 'text', defaultValue: 'Es muy caro / Tengo que pensarlo' },
    ],
    isPremium: true,
    categoryId: 'cat-sales',
    recommendedModel: 'gemini-3.8-flash',
    authorName: 'Mateo Rossi',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    thumbnailUrl: '/src/assets/images/thumb_sales_whatsapp_1791081934959.jpg',
    usesCount: 6180,
    rating: 4.9,
    tags: ['WhatsApp Sales', 'High Ticket', 'Cierre de Ventas', 'Objeciones'],
    createdAt: '2026-02-12',
  },
  {
    id: 'p-social-1',
    title: 'Guión de Video Viral de 60s para TikTok / Reels con Retención >85%',
    description: 'Estructura un video vertical corto con gancho de 3 segundos, retención visual, cambio de ritmo y llamada a la acción.',
    templateContent: `Eres un Director Creativo de Contenido Viral en formato corto (TikTok, Instagram Reels y YouTube Shorts).
Crea un guión completo de 50 a 60 segundos sobre el tema: {{tema_video}}.

Parámetros:
- Audiencia Objetivo: {{nicho}}
- Objetivo del Video: {{objetivo_video}}
- Nivel de Energía / Estilo: {{estilo}}

Estructura de la entrega:
- **3 Opciones de Gancho Visual + Verbal (Primeros 3 segundos)**: Diseñados para detener el scroll de inmediato.
- **Tabla Guión Visual & Audio**:
  - Tiempo (0-3s, 3-15s, 15-40s, 40-55s, 55-60s)
  - Lo que se VE en pantalla (B-Roll, texto flotante, zooms, efectos)
  - Lo que se DICE (Voz en off / a cámara concisa y dinámica)
- **Call to Action (CTA) Final de Alta Conversión**: Para generar comentarios o clics en el enlace de la bio.`,
    variables: [
      { name: 'tema_video', label: 'Tema o Truco del Video', placeholder: 'Cómo usar IA para duplicar ventas', type: 'text', defaultValue: '3 Herramientas de IA secretas que reemplazan 10 horas de trabajo manual' },
      { name: 'nicho', label: 'Nicho / Audiencia', placeholder: 'Emprendedores y Freelancers', type: 'text', defaultValue: 'Emprendedores, Creadores de Contenido y Dueños de Negocio' },
      { name: 'objetivo_video', label: 'Objetivo Principal', type: 'select', options: ['Conseguir seguidores y guardados', 'Llevar tráfico al enlace de suscripción', 'Generar debate masivo en comentarios'], defaultValue: 'Llevar tráfico al enlace de suscripción' },
      { name: 'estilo', label: 'Estilo / Tono', type: 'select', options: ['Rápido, dinámico y revelador', 'Storytelling con sorpresa al final', 'Educativo y paso a paso'], defaultValue: 'Rápido, dinámico y revelador' },
    ],
    isPremium: false,
    categoryId: 'cat-social',
    recommendedModel: 'gemini-3.8-flash',
    authorName: 'Elena Rostova',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    thumbnailUrl: '/src/assets/images/thumb_viral_video_1791081944537.jpg',
    usesCount: 7890,
    rating: 4.9,
    tags: ['TikTok', 'Reels', 'Viral Hooks', 'Shorts', 'Video Script'],
    createdAt: '2026-02-14',
  },
  {
    id: 'p-1',
    title: 'Generador de Estrategia SEO B2B Completa & Clusters Semánticos',
    description: 'Crea una estrategia integral de palabras clave, arquitectura de contenido y calendario editorial enfocado en la conversión B2B.',
    templateContent: `Actúa como un Consultor Senior en SEO B2B para la industria de {{industria}}.
Tu objetivo es diseñar una estrategia de contenido completa para posicionar a {{nombre_empresa}} como líder de opinión.

Parámetros clave:
- Empresa: {{nombre_empresa}}
- Competidor principal: {{competidor}}
- Tono deseado: {{tono}}
- Audiencia objetivo: {{audiencia}}

Estructura de la respuesta:
1. Análisis de intención de búsqueda y Top 5 Keywords de alta conversión (Cluster Key).
2. Propuesta de Pillar Page y 3 Cluster Articles asociados.
3. Estructura H1, H2, H3 para la Pillar Page principal.
4. Llamados a la acción (CTA) sugeridos según la etapa de concientización.`,
    variables: [
      { name: 'industria', label: 'Industria / Sector', placeholder: 'SaaS Financiero', type: 'text', defaultValue: 'SaaS B2B' },
      { name: 'nombre_empresa', label: 'Nombre de la Empresa', placeholder: 'FintechFlow', type: 'text', defaultValue: 'DataScale AI' },
      { name: 'competidor', label: 'Competidor Principal', placeholder: 'Salesforce', type: 'text', defaultValue: 'Mixpanel' },
      { name: 'tono', label: 'Tono de Marca', type: 'select', options: ['Profesional y analítico', 'Persuasivo y audaz', 'Educativo y cercano'], defaultValue: 'Profesional y analítico' },
      { name: 'audiencia', label: 'Audiencia Objetivo', placeholder: 'CTOs y Directores de TI', type: 'text', defaultValue: 'Directores de Tecnología y VP de Ingeniería' },
    ],
    isPremium: true,
    categoryId: 'cat-marketing',
    recommendedModel: 'gemini-3.8-flash',
    authorName: 'Carlos Mendoza',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    thumbnailUrl: '/src/assets/images/thumb_seo_marketing_1791081954600.jpg',
    usesCount: 3420,
    rating: 4.9,
    tags: ['SEO', 'Marketing B2B', 'Estrategia', 'Contenido'],
    createdAt: '2026-01-15',
  },
  {
    id: 'p-2',
    title: 'Auditor & Refactorizador de Código en TypeScript/React (Clean Architecture)',
    description: 'Analiza fragmentos de código TypeScript o React para encontrar vulnerabilidades, malas prácticas, memory leaks y aplicar Clean Code.',
    templateContent: `Eres un Principal Software Architect especializado en React, TypeScript y Rendimiento Web.
Por favor audita y refactoriza el siguiente snippet de código:

\`\`\`{{lenguaje}}
{{codigo}}
\`\`\`

Objetivos de optimización prioritarios: {{prioridad}}

Por favor proporciona:
1. **Puntos Críticos**: Lista numerada con problemas de seguridad, renders innecesarios o code smells.
2. **Código Refactorizado**: Versión limpia con TypeScript estricto, hooks optimizados y buenas prácticas.
3. **Explicación del Cambio**: Por qué la nueva versión es más eficiente, legible y mantenible.`,
    variables: [
      { name: 'lenguaje', label: 'Lenguaje / Framework', type: 'select', options: ['typescript', 'javascript', 'python', 'go'], defaultValue: 'typescript' },
      { name: 'codigo', label: 'Snippet de Código a Revisar', type: 'textarea', placeholder: 'Pega tu código aquí...', defaultValue: `function calculateTotal(items: any) {\n  let total = 0;\n  for(let i=0; i<items.length; i++) {\n    if(items[i].price) {\n      total += items[i].price * items[i].quantity;\n    }\n  }\n  return total;\n}` },
      { name: 'prioridad', label: 'Prioridad Principal', type: 'select', options: ['Performance & Memory', 'Type Safety & Security', 'Readability & Clean Code'], defaultValue: 'Type Safety & Security' },
    ],
    isPremium: false,
    categoryId: 'cat-code',
    recommendedModel: 'gemini-3.8-flash',
    authorName: 'Dra. Sofía Alarcón',
    authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150',
    thumbnailUrl: '/src/assets/images/thumb_code_dev_1791081963962.jpg',
    usesCount: 5890,
    rating: 4.9,
    tags: ['TypeScript', 'React', 'Clean Code', 'Refactoring'],
    createdAt: '2026-01-20',
  },
  {
    id: 'p-art-1',
    title: 'Master Prompt Generator para Midjourney v6 & Flux Hiperrealista',
    description: 'Genera descripciones visuales cinematográficas con parámetros de lente, iluminación volumétrica, texturas 8K y aspect ratio.',
    templateContent: `Actúa como un Director de Fotografía y Prompt Engineer especializado en Midjourney v6, Flux y DALL-E 3.
Genera un prompt hiperdetallado en inglés y español para crear la siguiente imagen: {{concepto_visual}}.

Parámetros estéticos:
- Estilo Visual: {{estilo_artistico}}
- Iluminación / Atmósfera: {{iluminacion}}
- Cámara & Lente: {{camara_lente}}
- Relación de Aspecto (Aspect Ratio): {{aspect_ratio}}

Salida esperada:
1. **Prompt en Inglés para Copiar (Midjourney / Flux format)** con flags (--v 6.1 --ar {{aspect_ratio}} --style raw --q 2).
2. **Desglose en Español**: Explicación de la paleta de color, texturas y composición espacial.
3. **Variaciones de Ángulo**: 2 alternativas de toma (Plano detalle / Plano cinematográfico cenital).`,
    variables: [
      { name: 'concepto_visual', label: 'Concepto de la Imagen', placeholder: 'Retrato de un astronauta en un bosque bioluminiscente', type: 'text', defaultValue: 'Espacio de trabajo minimalista futurista con cristales holográficos y plantas tropicales en un rascacielos de Tokio al anochecer' },
      { name: 'estilo_artistico', label: 'Estilo Artístico', type: 'select', options: ['Fotografía Cinematográfica 35mm', 'Render 3D Octane Engine Fotorrealista', 'Editorial Vogue / Alta Costura', 'Cyberpunk Noir'], defaultValue: 'Fotografía Cinematográfica 35mm' },
      { name: 'iluminacion', label: 'Iluminación', type: 'select', options: ['Golden hour suave con rayos volumétricos', 'Luces de neón azul y ámbar con reflejos de lluvia', 'Luz de estudio difusa high-key', 'Claroscuro dramático'], defaultValue: 'Luces de neón azul y ámbar con reflejos de lluvia' },
      { name: 'camara_lente', label: 'Cámara & Lente', type: 'select', options: ['Hasselblad H6D-100c, 85mm f/1.4', 'Sony A7R V, 35mm f/1.8 Master GM', 'Arri Alexa Mini, Lente Anamórfico'], defaultValue: 'Sony A7R V, 35mm f/1.8 Master GM' },
      { name: 'aspect_ratio', label: 'Aspect Ratio', type: 'select', options: ['16:9', '9:16', '1:1', '4:5', '21:9'], defaultValue: '16:9' },
    ],
    isPremium: false,
    categoryId: 'cat-art',
    recommendedModel: 'gemini-3.8-flash',
    authorName: 'Carlos Mendoza',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    thumbnailUrl: '/src/assets/images/thumb_agent_ai_1791081925923.jpg',
    usesCount: 6810,
    rating: 5.0,
    tags: ['Midjourney', 'Flux', 'Prompt Art', 'Fotografía', '8K'],
    createdAt: '2026-02-15',
  },
  {
    id: 'p-3',
    title: 'Secuencia de Email Cold Outreach de Alta Conversión (PAS Framework)',
    description: 'Genera una secuencia de 3 correos fríos para prospección utilizando el framework Problema-Agitación-Solución (PAS).',
    templateContent: `Actúa como un Copywriter especializado en Ventas B2B con un track record comprobado en conversión.
Diseña una secuencia de 3 emails fríos para vender el producto {{producto}} al perfil {{cargo_objetivo}}.

Detalles:
- Propuesta de Valor Principal: {{propuesta_valor}}
- Prueba Social / Caso de Éxito: {{caso_exito}}
- Tono: {{tono}}

Estructura requerida:
- Email 1: Gancho inicial directo utilizando el framework Problema-Agitación-Solución.
- Email 2: Follow-up a los 3 días aportando valor sin sonar desesperado.
- Email 3: Último intento con llamado a la acción suave (Soft CTA) de bajo fricción.`,
    variables: [
      { name: 'producto', label: 'Producto o Servicio', placeholder: 'SaaS de Automatización de Facturación', type: 'text', defaultValue: 'Plataforma de Optimización de Costos Cloud' },
      { name: 'cargo_objetivo', label: 'Cargo del Cliente Ideal', placeholder: 'VP de Ventas', type: 'text', defaultValue: 'CFO / Director Financiero' },
      { name: 'propuesta_valor', label: 'Propuesta de Valor Principal', placeholder: 'Reduce la morosidad un 40%', type: 'text', defaultValue: 'Reducción inmediata de la factura de AWS/Google Cloud en un 35% garantizado' },
      { name: 'caso_exito', label: 'Caso de Éxito / Métrica', placeholder: 'Empresa X ahorró $50k', type: 'text', defaultValue: 'Ayudamos a Cabify a ahorrar $120,000 anuales en 30 días' },
      { name: 'tono', label: 'Tono', type: 'select', options: ['Directo y ejecutivo', 'Consultivo e intrigante', 'Amigable y breve'], defaultValue: 'Directo y ejecutivo' },
    ],
    isPremium: true,
    categoryId: 'cat-sales',
    recommendedModel: 'gemini-3.8-flash',
    authorName: 'Mateo Rossi',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    thumbnailUrl: '/src/assets/images/thumb_sales_whatsapp_1791081934959.jpg',
    usesCount: 3150,
    rating: 4.9,
    tags: ['Sales', 'Cold Email', 'Copywriting', 'PAS'],
    createdAt: '2026-02-01',
  },
  {
    id: 'p-4',
    title: 'Generador de PRD (Product Requirement Document) Ágil para Startups',
    description: 'Transforma una idea de producto en un documento de requerimientos con historias de usuario y criterios de aceptación.',
    templateContent: `Eres un Lead Product Manager en una empresa de tecnología de alto crecimiento.
Crea un PRD (Product Requirement Document) profesional para la nueva funcionalidad: {{nombre_feature}}.

Contexto del Producto: {{contexto_producto}}
Problema a resolver: {{problema}}
Metrica de Éxito KPI: {{kpi}}

Por favor estructura el PRD con:
1. **Resumen Ejecutivo & Problema**: Justificación clara para el equipo de desarrollo.
2. **Historias de Usuario (User Stories)**: 3 casos formateados como "Como [usuario], quiero [acción] para [beneficio]".
3. **Criterios de Aceptación**: Formato Given-When-Then para QA.
4. **Consideraciones de Seguridad & Escalabilidad**: Posibles riesgos técnicos a mitigar.`,
    variables: [
      { name: 'nombre_feature', label: 'Nombre de la Funcionalidad', placeholder: 'Autenticación con Llaves Passkey', type: 'text', defaultValue: 'Exportación Automática a Google Sheets' },
      { name: 'contexto_producto', label: 'Contexto del Producto', placeholder: 'Plataforma CRM de ventas', type: 'text', defaultValue: 'Dashboard de Analytics B2B' },
      { name: 'problema', label: 'Problema del Usuario', placeholder: 'Los usuarios tardan horas descargando CSVs', type: 'text', defaultValue: 'Los usuarios pierden más de 2 horas semanales exportando reportes manualmente' },
      { name: 'kpi', label: 'Métrica de Éxito KPI', placeholder: 'Aumento del 25% en retención WAU', type: 'text', defaultValue: 'Retención semanal +15% e interacciones diarias con reportes' },
    ],
    isPremium: false,
    categoryId: 'cat-product',
    recommendedModel: 'gemini-3.8-flash',
    authorName: 'Elena Rostova',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    thumbnailUrl: '/src/assets/images/thumb_seo_marketing_1791081954600.jpg',
    usesCount: 2820,
    rating: 4.8,
    tags: ['Product Management', 'PRD', 'Agile', 'User Stories'],
    createdAt: '2026-02-03',
  },
  {
    id: 'p-5',
    title: 'Post Viral para LinkedIn con Hook Magnético y Debate',
    description: 'Escribe una publicación persuasiva para LinkedIn con estructura de lectura rápida y pregunta final para disparar comentarios.',
    templateContent: `Actúa como un Creator & Ghostwriter de primer nivel en LinkedIn especializado en la industria {{sector}}.
Tu meta es escribir una publicación altamente enganchante basada en la siguiente enseñanza o experiencia:

Historia/Aprendizaje: {{leccion}}
Audiencia: {{audiencia}}
Estilo de Formato: {{estilo}}

Guía de estilo obligatoria:
- Los primeros 2 renglones deben funcionar como un hook irresistible que obligue a hacer clic en "...ver más".
- Utiliza oraciones breves, listas con viñetas limpias y espacios en blanco.
- Evita clichés como "Estoy encantado de anunciar" o "Humilde lección".
- Finaliza con una pregunta provocativa que genere debate en los comentarios.`,
    variables: [
      { name: 'sector', label: 'Sector / Nicho', placeholder: 'Inteligencia Artificial', type: 'text', defaultValue: 'Tecnología & Emprendimiento' },
      { name: 'leccion', label: 'Lección o Historia', type: 'textarea', placeholder: 'Qué ocurrió y qué aprendiste...', defaultValue: 'Lanzamos una función que tardó 3 meses en construirse y nadie la usó. Aprendimos a validar ideas en 48 horas con prototipos simples.' },
      { name: 'audiencia', label: 'Audiencia Objetivo', placeholder: 'Fundadores de Startups', type: 'text', defaultValue: 'Fundadores, Product Managers y Desarrolladores' },
      { name: 'estilo', label: 'Estilo de Formato', type: 'select', options: ['Storytelling personal', 'Lista táctica paso a paso', 'Opinión contraria y debate'], defaultValue: 'Storytelling personal' },
    ],
    isPremium: false,
    categoryId: 'cat-social',
    recommendedModel: 'gemini-3.7-flash',
    authorName: 'Carlos Mendoza',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    thumbnailUrl: '/src/assets/images/thumb_viral_video_1791081944537.jpg',
    usesCount: 6120,
    rating: 4.9,
    tags: ['LinkedIn', 'Social Media', 'Storytelling', 'Copywriting'],
    createdAt: '2026-02-05',
  },
  {
    id: 'p-6',
    title: 'Generador de Script de Pruebas Unitarias con Jest & React Testing Library',
    description: 'Escribe pruebas de integración y unitarias completas en Jest y React Testing Library cubriendo casos borde y estados de carga.',
    templateContent: `Eres un QA Automation Engineer Senior con especialización en React y Jest.
Genera un archivo de pruebas unitarias completo para el siguiente componente:

\`\`\`tsx
{{codigo_componente}}
\`\`\`

Casos a evaluar obligatoriamente:
- Renderizado inicial correcto.
- Simulación de interacción de usuario (click, cambio de input).
- Manejo de estados de error y respuesta asíncrona.
- Mocks requeridos para llamadas de API / hooks personalizados.`,
    variables: [
      { name: 'codigo_componente', label: 'Código del Componente React', type: 'textarea', placeholder: 'export function LoginForm() {...}', defaultValue: `export function SubscriptionCard({ plan, onSelect }: { plan: any; onSelect: () => void }) {\n  return (\n    <div className="card">\n      <h3>{plan.name}</h3>\n      <p>\${plan.price}/mes</p>\n      <button onClick={onSelect}>Suscribirse</button>\n    </div>\n  );\n}` },
    ],
    isPremium: true,
    categoryId: 'cat-code',
    recommendedModel: 'gemini-3.8-flash',
    authorName: 'Dra. Sofía Alarcón',
    authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150',
    thumbnailUrl: '/src/assets/images/thumb_code_dev_1791081963962.jpg',
    usesCount: 2290,
    rating: 4.8,
    tags: ['Testing', 'Jest', 'React', 'QA'],
    createdAt: '2026-02-06',
  },
];

export const getDefaultThumbnailForCategory = (categoryId?: string): string => {
  switch (categoryId) {
    case 'cat-agents':
      return '/src/assets/images/thumb_agent_ai_1791081925923.jpg';
    case 'cat-sales':
      return '/src/assets/images/thumb_sales_whatsapp_1791081934959.jpg';
    case 'cat-social':
      return '/src/assets/images/thumb_viral_video_1791081944537.jpg';
    case 'cat-marketing':
    case 'cat-product':
      return '/src/assets/images/thumb_seo_marketing_1791081954600.jpg';
    case 'cat-code':
    case 'cat-art':
    default:
      return '/src/assets/images/thumb_code_dev_1791081963962.jpg';
  }
};

export const INITIAL_USER_PROFILE: UserProfile = {
  id: 'usr-991',
  email: 'garciasaul501@gmail.com',
  fullName: 'Saúl García',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
  role: 'user',
  createdAt: '2026-01-01',
};

export const INITIAL_SUBSCRIPTION: UserSubscription = {
  userId: 'usr-991',
  paypalPayerId: 'PAYPAL-PAYER-982110',
  paypalSubscriptionId: '',
  planType: 'free',
  status: 'active',
  currentPeriodEnd: '2026-12-31',
  monthlyPromptQuota: 5,
  usedPromptsThisMonth: 1,
};

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Prueba Inicial',
    promptsCount: 5,
    badge: 'Gratis',
    monthlyBasePrice: 0,
    annualBasePrice: 0,
    description: 'Prueba la potencia de los prompts de IA con 5 ejecuciones gratuitas sin tarjeta.',
    features: [
      '5 ejecuciones de prompts con IA gratis',
      'Acceso a biblioteca pública de prompts',
      'Interpolación de variables dinámicas',
      'Descarga individual en PDF',
    ],
    recommendedFor: 'Curiosos que desean probar la herramienta',
  },
  {
    id: '10',
    name: 'Starter Pack 10',
    promptsCount: 10,
    badge: 'Económico',
    monthlyBasePrice: 9,
    annualBasePrice: 7,
    description: '10 ejecuciones al mes para necesidades puntuales y pruebas de proyectos.',
    features: [
      '10 ejecuciones de prompts IA cada mes',
      'Acceso al Optimizador de Prompts R-C-O-F-C',
      'Google Gemini 3.8 Flash con auto-recuperación',
      'Descargas ilimitadas de PDFs',
      'Soporte por email',
    ],
    recommendedFor: 'Principiantes y tareas ocasionales',
  },
  {
    id: '30',
    name: 'Creador Básico 30',
    promptsCount: 30,
    badge: 'Popular',
    monthlyBasePrice: 19,
    annualBasePrice: 15,
    description: '30 ejecuciones mensuales para creadores que generan contenido semanal.',
    features: [
      '30 ejecuciones de prompts IA cada mes',
      'Optimizador de Prompts y Creador desde Ideas',
      'Prompts PRO de Redes Sociales y Guiones Virales',
      'Descarga de catálogos completos en PDF',
      'Actualizaciones continuas de plantillas',
    ],
    recommendedFor: 'Freelancers y creadores de contenido',
  },
  {
    id: '50',
    name: 'Creador Pro 50',
    promptsCount: 50,
    badge: '⭐ MÁS VENDIDO',
    popular: true,
    monthlyBasePrice: 29,
    annualBasePrice: 22,
    description: '50 ejecuciones de alto nivel para marketers, consultores y closers.',
    features: [
      '50 ejecuciones de prompts IA al mes',
      'Todos los Prompts PRO de Ventas y Agentes IA',
      'Integración con TikTok Creator API',
      'Optimizador sin límites con Gemini 3.8 Flash',
      'Prioridad en tiempo de respuesta de IA',
      'Certificados de pago con verificación PayPal',
    ],
    recommendedFor: 'Consultores, closers de ventas y agencias pequeñas',
  },
  {
    id: '100',
    name: 'Business Booster 100',
    promptsCount: 100,
    badge: 'Escala Rápida',
    monthlyBasePrice: 49,
    annualBasePrice: 38,
    description: '100 ejecuciones mensuales para negocios en crecimiento y prospección activa.',
    features: [
      '100 ejecuciones de prompts IA al mes',
      'System Prompts para Agentes Autónomos 24/7',
      'Fórmulas de Cierre Consultivo WhatsApp & DM',
      'Exportación masiva de prompts en PDF',
      'Soporte prioritario por WhatsApp y Whop',
    ],
    recommendedFor: 'Equipos de ventas y ecommerce en expansión',
  },
  {
    id: '500',
    name: 'Agencia Master 500',
    promptsCount: 500,
    badge: 'Alto Rendimiento',
    monthlyBasePrice: 149,
    annualBasePrice: 119,
    description: '500 ejecuciones para agencias con múltiples clientes y flujos automatizados.',
    features: [
      '500 ejecuciones de prompts IA al mes',
      'Acceso total a todas las plantillas maestras',
      'Entrenamiento de prompts personalizados',
      'Soporte VIP 1-a-1 directo con el equipo',
      'API Keys personalizadas (OpenAI / Claude / Gemini)',
      'Máxima ganancia y retorno de inversión comprobado',
    ],
    recommendedFor: 'Agencias de marketing y automatizaciones IA',
  },
  {
    id: '1000',
    name: 'VIP Enterprise 1000',
    promptsCount: 1000,
    badge: 'Corporativo VIP',
    monthlyBasePrice: 249,
    annualBasePrice: 199,
    description: '1,000 ejecuciones mensuales para empresas con operaciones intensivas de IA.',
    features: [
      '1,000 ejecuciones de prompts IA al mes',
      'Infraestructura dedicada de alta disponibilidad',
      'Acceso temprano a nuevos modelos Gemini & GPT',
      'Consultoría mensual de optimización de prompts',
      'Certificado de auditoría y factura comercial',
      'Todos los beneficios VIP de Conexión Whop',
    ],
    recommendedFor: 'Corporativos, startups y grandes generadores de IA',
  },
];

export const INITIAL_INTEGRATIONS: UserIntegration[] = [
  {
    id: 'int-1',
    userId: 'usr-991',
    provider: 'google_gemini',
    providerName: 'Google Gemini 3.7 Flash AI',
    hasApiKey: true,
    maskedApiKey: 'AIzaSy...X92a1',
    isActive: true,
    updatedAt: '2026-02-08',
  },
  {
    id: 'int-2',
    userId: 'usr-991',
    provider: 'openai',
    providerName: 'OpenAI (GPT-4o)',
    hasApiKey: true,
    maskedApiKey: 'sk-proj-...8aK9',
    isActive: true,
    updatedAt: '2026-02-07',
  },
  {
    id: 'int-3',
    userId: 'usr-991',
    provider: 'anthropic',
    providerName: 'Anthropic Claude 3.5',
    hasApiKey: false,
    isActive: false,
    updatedAt: '2026-01-15',
  },
  {
    id: 'int-4',
    userId: 'usr-991',
    provider: 'tiktok',
    providerName: 'TikTok Creator & Direct Post API',
    hasApiKey: true,
    maskedApiKey: 'tiktok_auth_token_active',
    isActive: true,
    updatedAt: '2026-10-03',
    tiktokAccount: {
      isConnected: true,
      username: '@saulgarcia_ia',
      displayName: 'Saúl García | Creator IA',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      followerCount: 28400,
      scopes: ['user.info.basic', 'video.upload', 'video.publish'],
      connectedAt: '2026-10-03',
    },
  },
];

export const INITIAL_MONTHLY_EXECUTION_HISTORY: MonthlyExecutionRecord[] = [
  {
    month: 'Noviembre 2025',
    shortMonth: 'Nov',
    executed: 4,
    quota: 5,
    marketingExecutions: 2,
    salesExecutions: 1,
    socialExecutions: 1,
    agentsExecutions: 0,
  },
  {
    month: 'Diciembre 2025',
    shortMonth: 'Dic',
    executed: 5,
    quota: 5,
    marketingExecutions: 2,
    salesExecutions: 2,
    socialExecutions: 1,
    agentsExecutions: 0,
  },
  {
    month: 'Enero 2026',
    shortMonth: 'Ene',
    executed: 9,
    quota: 10,
    marketingExecutions: 4,
    salesExecutions: 3,
    socialExecutions: 1,
    agentsExecutions: 1,
  },
  {
    month: 'Febrero 2026',
    shortMonth: 'Feb',
    executed: 24,
    quota: 30,
    marketingExecutions: 10,
    salesExecutions: 8,
    socialExecutions: 4,
    agentsExecutions: 2,
  },
  {
    month: 'Marzo 2026',
    shortMonth: 'Mar',
    executed: 44,
    quota: 50,
    marketingExecutions: 19,
    salesExecutions: 13,
    socialExecutions: 8,
    agentsExecutions: 4,
  },
  {
    month: 'Abril 2026 (Actual)',
    shortMonth: 'Abr',
    executed: 1,
    quota: 5,
    marketingExecutions: 1,
    salesExecutions: 0,
    socialExecutions: 0,
    agentsExecutions: 0,
    isCurrent: true,
  },
];

export const INITIAL_PROMPT_ANALYTICS_HISTORY: PromptVersionAnalyticsPoint[] = [
  {
    timestamp: '2026-03-01',
    dateLabel: '01 Mar',
    v1SuccessRate: 78.4,
    v2SuccessRate: 86.2,
    v3SuccessRate: 92.5,
    v1LatencyMs: 1420,
    v2LatencyMs: 1080,
    v3LatencyMs: 740,
    sampleCount: 42,
  },
  {
    timestamp: '2026-03-08',
    dateLabel: '08 Mar',
    v1SuccessRate: 80.1,
    v2SuccessRate: 88.5,
    v3SuccessRate: 94.1,
    v1LatencyMs: 1380,
    v2LatencyMs: 995,
    v3LatencyMs: 690,
    sampleCount: 58,
  },
  {
    timestamp: '2026-03-15',
    dateLabel: '15 Mar',
    v1SuccessRate: 79.5,
    v2SuccessRate: 90.4,
    v3SuccessRate: 95.8,
    v1LatencyMs: 1340,
    v2LatencyMs: 940,
    v3LatencyMs: 650,
    sampleCount: 74,
  },
  {
    timestamp: '2026-03-22',
    dateLabel: '22 Mar',
    v1SuccessRate: 82.0,
    v2SuccessRate: 91.8,
    v3SuccessRate: 96.7,
    v1LatencyMs: 1290,
    v2LatencyMs: 890,
    v3LatencyMs: 615,
    sampleCount: 89,
  },
  {
    timestamp: '2026-03-29',
    dateLabel: '29 Mar',
    v1SuccessRate: 83.2,
    v2SuccessRate: 93.1,
    v3SuccessRate: 97.9,
    v1LatencyMs: 1250,
    v2LatencyMs: 860,
    v3LatencyMs: 580,
    sampleCount: 112,
  },
  {
    timestamp: '2026-04-05',
    dateLabel: '05 Abr',
    v1SuccessRate: 84.5,
    v2SuccessRate: 94.6,
    v3SuccessRate: 98.4,
    v1LatencyMs: 1210,
    v2LatencyMs: 825,
    v3LatencyMs: 545,
    sampleCount: 134,
  },
  {
    timestamp: '2026-04-12',
    dateLabel: '12 Abr',
    v1SuccessRate: 85.1,
    v2SuccessRate: 95.2,
    v3SuccessRate: 99.1,
    v1LatencyMs: 1190,
    v2LatencyMs: 790,
    v3LatencyMs: 510,
    sampleCount: 156,
  },
];

export const INITIAL_EXECUTION_TELEMETRY: PromptExecutionTelemetry[] = [
  {
    id: 'tel-1',
    promptId: 'p-agent-1',
    promptTitle: 'Arquitecto de System Prompt para Agente de Atención al Cliente 24/7',
    versionId: 'p-agent-1-v3',
    versionLabel: 'v3.0 • Ultra-Rápida Flash',
    modelUsed: 'gemini-3.8-flash',
    latencyMs: 512,
    success: true,
    qualityScore: 99,
    timestamp: 'Hace 5 min',
  },
  {
    id: 'tel-2',
    promptId: 'p-sales-1',
    promptTitle: 'Guión de Ventas por WhatsApp & DM (Fórmula Cierre Consultivo 3 Pasos)',
    versionId: 'p-sales-1-v2',
    versionLabel: 'v2.0 • Few-Shot Optimizada',
    modelUsed: 'gemini-3.8-flash',
    latencyMs: 785,
    success: true,
    qualityScore: 95,
    timestamp: 'Hace 18 min',
  },
  {
    id: 'tel-3',
    promptId: 'p-agent-1',
    promptTitle: 'Arquitecto de System Prompt para Agente de Atención al Cliente 24/7',
    versionId: 'p-agent-1-v1',
    versionLabel: 'v1.0 • Configuración Base',
    modelUsed: 'gpt-4o',
    latencyMs: 1195,
    success: true,
    qualityScore: 85,
    timestamp: 'Hace 42 min',
  },
];

