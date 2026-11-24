export type LanguageCode = 'es' | 'en' | 'pt' | 'fr';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  shortLabel: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'es', label: 'Español', shortLabel: 'ES', nativeName: 'Español' },
  { code: 'en', label: 'English', shortLabel: 'EN', nativeName: 'English' },
  { code: 'pt', label: 'Português', shortLabel: 'PT', nativeName: 'Português' },
  { code: 'fr', label: 'Français', shortLabel: 'FR', nativeName: 'Français' },
];

export interface TranslationDictionary {
  nav: {
    prompts: string;
    optimizer: string;
    creator: string;
    myPrompts: string;
    analytics: string;
    api: string;
    plans: string;
    access: string;
    active: string;
    language: string;
  };
  categories: Record<string, string>;
  gallery: {
    heroTitle: string;
    heroHighlight: string;
    heroSubtitle: string;
    createFromIdea: string;
    exportPdf: string;
    promptsAvailable: string;
    creditsAvailable: string;
    proActive: string;
    modelsSupport: string;
    searchPlaceholder: string;
    searchClear: string;
    resultsCount: string;
    filters: string;
    hideFilters: string;
    searchScopeAll: string;
    searchScopeTitle: string;
    searchScopeDesc: string;
    filterAll: string;
    filterFree: string;
    filterPro: string;
    allModels: string;
    sortUses: string;
    sortRating: string;
    sortNewest: string;
    favorites: string;
    expandAll: string;
    collapseAll: string;
    resetFilters: string;
    freeNoticeTitle: string;
    freeNoticeBody: string;
    unlockBtn: string;
    emptyTitle: string;
    emptyBody: string;
    emptyCreateBtn: string;
    bottomTitle: string;
    bottomBody: string;
    downloadCatalogBtn: string;
    viewPlansBtn: string;
  };
  card: {
    pro: string;
    proLocked: string;
    free: string;
    usePrompt: string;
    unlock: string;
    preview: string;
    hidePreview: string;
    copy: string;
    copied: string;
    pdf: string;
    save: string;
    unsave: string;
    vars: string;
    templateLabel: string;
    editableVars: string;
    version: string;
  };
  controlPanel: {
    title: string;
    subtitle: string;
    exportCsv: string;
    view30DayChart: string;
    showDetails: string;
    hideDetails: string;
    timeSaved: string;
    estimatedValue: string;
    totalExecutions: string;
    speedup: string;
    hoursSaved: string;
    daysEquivalent: string;
    manualVsAi: string;
    topPromptsTitle: string;
    allCategories: string;
    showTop: string;
    uses: string;
    savedTime: string;
    run: string;
    csvSuccess: string;
    csvError: string;
  };
  pricing: {
    eyebrow: string;
    title: string;
    subtitle: string;
    currentPlan: string;
    quota: string;
    promptsThisMonth: string;
    verifiedPaypal: string;
    adminAccess: string;
    alreadyPaidPrompt: string;
    emailPlaceholder: string;
    verifyPaypalBtn: string;
    availablePlans: string;
    filterAll: string;
    filterCreators: string;
    filterAgencies: string;
    activePlanBadge: string;
    promptsCountLabel: string;
    perMonth: string;
    noCard: string;
    currentPlanFree: string;
    activateFree: string;
    subscribePaypal: string;
    adminModalBadge: string;
    adminModalTitle: string;
    adminModalBody: string;
    adminUserLabel: string;
    adminPassLabel: string;
    adminUnlockBtn: string;
    cancel: string;
    verifyErrorGeneric: string;
    verifyNotFound: string;
    verifyConnectionError: string;
    verifySuccess: string;
  };
  unlockModal: {
    statusActive: string;
    statusFree: string;
    titleActive: string;
    titleFree: string;
    subtitle: string;
    adminHeader: string;
    privateEncrypted: string;
    selectPlanLabel: string;
    userLabel: string;
    passLabel: string;
    unlockPlanBtn: string;
    payPaypalBtn: string;
    viewAllPlansBtn: string;
    quickControl: string;
    switchFreeBtn: string;
    close: string;
    relockedMsg: string;
  };
  analytics: {
    eyebrow: string;
    title: string;
    subtitle: string;
    simulateBtn: string;
    resetBtn: string;
    promptAnalyzed: string;
    allPromptsOption: string;
    series: string;
    modeDual: string;
    modeSuccess: string;
    modeLatency: string;
    freqTitle: string;
    freqSubtitleAll: string;
    freqSubtitleSingle: string;
    freqDaily: string;
    freqSplit: string;
    freqCumulative: string;
    total30d: string;
    avgDaily: string;
    peakDay: string;
    globalReliability: string;
    vsPrevFortnight: string;
    executionsPerDay: string;
    successful: string;
    versionCurvesTitle: string;
    versionCurvesSubtitle: string;
  };
  myPrompts: {
    eyebrow: string;
    title: string;
    subtitle: string;
    showAll: string;
    hideAll: string;
    downloadPdf: string;
    createWithAi: string;
    tabAll: string;
    tabAnalytics: string;
    tabVersions: string;
    tabQuota: string;
    tabSaved: string;
    quotaUsage: string;
    emptyTitle: string;
    emptyBody: string;
    exploreGallery: string;
  };
  optimizer: {
    eyebrow: string;
    title: string;
    subtitle: string;
    inputLabel: string;
    inputPlaceholder: string;
    presetsLabel: string;
    optimizeBtn: string;
    optimizingBtn: string;
    unlockBtn: string;
  };
  creator: {
    eyebrow: string;
    title: string;
    subtitle: string;
    step1Label: string;
    placeholder: string;
    suggestionsLabel: string;
    generateBtn: string;
    generatingBtn: string;
    unlockBtn: string;
    lockedTitle: string;
    lockedBody: string;
  };
  integrations: {
    eyebrow: string;
    title: string;
    subtitle: string;
    connected: string;
    readyToConnect: string;
    saveKey: string;
  };
  footer: {
    tagline: string;
    verifiedPayments: string;
    sslProtection: string;
  };
}

export const TRANSLATIONS: Record<LanguageCode, TranslationDictionary> = {
  es: {
    nav: {
      prompts: 'Prompts',
      optimizer: 'Optimizador',
      creator: 'Creador IA',
      myPrompts: 'Mis Prompts',
      analytics: 'Analítica',
      api: 'API',
      plans: 'Planes',
      access: 'Acceso',
      active: 'Activo',
      language: 'Idioma',
    },
    categories: {
      'cat-all': 'Todos',
      'cat-agents': 'Agentes IA',
      'cat-marketing': 'Marketing y Copy',
      'cat-sales': 'Ventas',
      'cat-code': 'Desarrollo',
      'cat-social': 'Redes Sociales',
      'cat-seo': 'SEO y Contenido',
      'cat-business': 'Negocios',
      'cat-art': 'Diseño y Arte',
    },
    gallery: {
      heroTitle: 'Encuentra, personaliza y ejecuta',
      heroHighlight: 'prompts profesionales de IA',
      heroSubtitle:
        'Explora plantillas verificadas, pruébalas en vivo con tus variables o descárgalas en PDF listas para tus proyectos.',
      createFromIdea: 'Crear Prompt con IA',
      exportPdf: 'Exportar PDF',
      promptsAvailable: 'prompts listos',
      creditsAvailable: 'créditos disponibles',
      proActive: 'Plan PRO activo',
      modelsSupport: 'Gemini, GPT-4o y Claude',
      searchPlaceholder: 'Buscar por título, tema o caso de uso (⌘K)...',
      searchClear: 'Limpiar búsqueda',
      resultsCount: 'resultados',
      filters: 'Filtros',
      hideFilters: 'Ocultar filtros',
      searchScopeAll: 'Todo',
      searchScopeTitle: 'Título',
      searchScopeDesc: 'Descripción',
      filterAll: 'Todos',
      filterFree: 'Gratis',
      filterPro: 'PRO',
      allModels: 'Todos los modelos',
      sortUses: 'Más utilizados',
      sortRating: 'Mejor valorados',
      sortNewest: 'Más recientes',
      favorites: 'Guardados',
      expandAll: 'Ver plantillas',
      collapseAll: 'Ocultar plantillas',
      resetFilters: 'Restablecer filtros',
      freeNoticeTitle: 'Modo gratuito activo',
      freeNoticeBody:
        'Desbloquea los prompts PRO y la generación avanzada con un plan activo vía PayPal.',
      unlockBtn: 'Desbloquear acceso',
      emptyTitle: 'No encontramos prompts con esos filtros',
      emptyBody:
        'Prueba limpiando los filtros o genera un prompt a medida desde tu idea con inteligencia artificial.',
      emptyCreateBtn: 'Crear prompt con IA',
      bottomTitle: '¿Necesitas todo el catálogo para tu equipo o clientes?',
      bottomBody:
        'Descarga la biblioteca completa en PDF o activa un plan mensual con pago directo en PayPal.',
      downloadCatalogBtn: 'Descargar catálogo PDF',
      viewPlansBtn: 'Ver planes',
    },
    card: {
      pro: 'PRO',
      proLocked: 'PRO · Bloqueado',
      free: 'Gratis',
      usePrompt: 'Usar prompt',
      unlock: 'Desbloquear',
      preview: 'Ver texto',
      hidePreview: 'Ocultar',
      copy: 'Copiar',
      copied: 'Copiado',
      pdf: 'PDF',
      save: 'Guardar',
      unsave: 'Quitar de guardados',
      vars: 'vars',
      templateLabel: 'Plantilla',
      editableVars: 'variables editables',
      version: 'Versión',
    },
    controlPanel: {
      title: 'Panel de Productividad',
      subtitle: 'Resumen de uso y ahorro de tiempo frente a redacción manual.',
      exportCsv: 'Exportar CSV',
      view30DayChart: 'Gráfica 30 días',
      showDetails: 'Ver ranking',
      hideDetails: 'Ocultar ranking',
      timeSaved: 'Tiempo ahorrado',
      estimatedValue: 'Valor estimado',
      totalExecutions: 'Ejecuciones totales',
      speedup: 'Velocidad',
      hoursSaved: 'horas',
      daysEquivalent: 'días laborables',
      manualVsAi: 'Manual vs IA',
      topPromptsTitle: 'Prompts más ejecutados',
      allCategories: 'Todas las categorías',
      showTop: 'Mostrar top',
      uses: 'usos',
      savedTime: 'ahorrado',
      run: 'Ejecutar',
      csvSuccess: 'Reporte CSV descargado correctamente.',
      csvError: 'No se pudo generar el archivo CSV. Inténtalo de nuevo.',
    },
    pricing: {
      eyebrow: 'Suscripciones y Acceso',
      title: 'Planes claros para cada etapa',
      subtitle:
        'Pagos procesados de forma segura con PayPal. Activación rápida y cancelación sin permanencia.',
      currentPlan: 'Plan actual',
      quota: 'Cuota mensual',
      promptsThisMonth: 'prompts este mes',
      verifiedPaypal: 'Pago verificado con PayPal',
      adminAccess: 'Acceso administrador',
      alreadyPaidPrompt:
        '¿Ya realizaste tu pago en PayPal? Ingresa el correo de compra para verificar y activar tu plan.',
      emailPlaceholder: 'tu-correo-paypal@ejemplo.com',
      verifyPaypalBtn: 'Verificar pago',
      availablePlans: 'Planes disponibles',
      filterAll: 'Todos',
      filterCreators: 'Creadores',
      filterAgencies: 'Agencias',
      activePlanBadge: 'Plan activo',
      promptsCountLabel: 'prompts/mes',
      perMonth: '/mes',
      noCard: 'sin tarjeta',
      currentPlanFree: 'Plan actual',
      activateFree: 'Usar plan gratuito',
      subscribePaypal: 'Suscribirte con PayPal',
      adminModalBadge: 'Acceso administrador',
      adminModalTitle: 'Activar',
      adminModalBody:
        'Ingresa tus credenciales privadas de administrador para activar este plan.',
      adminUserLabel: 'Usuario o correo',
      adminPassLabel: 'Contraseña de activación',
      adminUnlockBtn: 'Activar plan',
      cancel: 'Cancelar',
      verifyErrorGeneric: 'No se pudo verificar tu suscripción.',
      verifyNotFound: 'No encontramos una suscripción activa para ese correo.',
      verifyConnectionError: 'Error de conexión. Intenta nuevamente.',
      verifySuccess: 'Plan activado correctamente.',
    },
    unlockModal: {
      statusActive: 'Plan activo',
      statusFree: 'Plan gratuito',
      titleActive: 'Acceso completo activo',
      titleFree: 'Activar plan o acceso',
      subtitle:
        'Paga directamente con PayPal o ingresa tus credenciales de administrador para desbloquear tu plan.',
      adminHeader: 'Acceso con credenciales',
      privateEncrypted: 'Privado',
      selectPlanLabel: 'Selecciona el plan:',
      userLabel: 'Usuario o correo',
      passLabel: 'Contraseña',
      unlockPlanBtn: 'Activar',
      payPaypalBtn: 'Pagar con PayPal',
      viewAllPlansBtn: 'Ver todos los planes',
      quickControl: 'Control rápido',
      switchFreeBtn: 'Volver a modo gratuito',
      close: 'Cerrar',
      relockedMsg: 'Cuenta regresada a modo gratuito (5 prompts).',
    },
    analytics: {
      eyebrow: 'Analítica de Prompts',
      title: 'Frecuencia, Éxito y Latencia',
      subtitle:
        'Monitorea el volumen diario de ejecuciones en los últimos 30 días y compara el rendimiento entre versiones.',
      simulateBtn: 'Simular ejecución (+1)',
      resetBtn: 'Restaurar',
      promptAnalyzed: 'Prompt:',
      allPromptsOption: 'Todos los prompts (global)',
      series: 'Versiones:',
      modeDual: 'Éxito y Latencia',
      modeSuccess: 'Tasa de Éxito (%)',
      modeLatency: 'Latencia (ms)',
      freqTitle: 'Frecuencia de Ejecución (Últimos 30 Días)',
      freqSubtitleAll: 'Volumen diario consolidado de todos los prompts.',
      freqSubtitleSingle: 'Volumen diario registrado para el prompt seleccionado.',
      freqDaily: 'Diaria',
      freqSplit: 'Éxito vs Reintentos',
      freqCumulative: 'Acumulada',
      total30d: 'Total 30 días',
      avgDaily: 'Promedio diario',
      peakDay: 'Día pico',
      globalReliability: 'Fiabilidad',
      vsPrevFortnight: 'vs quincena anterior',
      executionsPerDay: 'ejecuciones/día',
      successful: 'exitosas',
      versionCurvesTitle: 'Comparativa por Versión (v1.0 · v2.0 · v3.0)',
      versionCurvesSubtitle: 'Evolución de tasa de éxito y velocidad de respuesta.',
    },
    myPrompts: {
      eyebrow: 'Espacio Personal',
      title: 'Mis Prompts y Versiones',
      subtitle:
        'Gestiona tus favoritos, consulta tu cuota mensual y compara iteraciones guardadas.',
      showAll: 'Ver plantillas',
      hideAll: 'Ocultar plantillas',
      downloadPdf: 'Exportar PDF',
      createWithAi: 'Crear prompt con IA',
      tabAll: 'Resumen',
      tabAnalytics: 'Analítica',
      tabVersions: 'Versiones',
      tabQuota: 'Cuota',
      tabSaved: 'Guardados',
      quotaUsage: 'Uso mensual:',
      emptyTitle: 'Aún no tienes prompts guardados',
      emptyBody: 'Guarda tus prompts favoritos desde la biblioteca para acceder más rápido.',
      exploreGallery: 'Explorar biblioteca',
    },
    optimizer: {
      eyebrow: 'Optimizador IA',
      title: 'Mejora tus prompts al instante',
      subtitle:
        'Convierte una instrucción simple en un prompt estructurado con variables, contexto y formato claro.',
      inputLabel: 'Escribe tu prompt inicial',
      inputPlaceholder: 'Describe lo que necesitas que haga la IA...',
      presetsLabel: 'Ejemplos rápidos:',
      optimizeBtn: 'Optimizar prompt',
      optimizingBtn: 'Optimizando...',
      unlockBtn: 'Desbloquear optimizador',
    },
    creator: {
      eyebrow: 'Creador IA',
      title: 'Crea un prompt completo desde una idea',
      subtitle:
        'Describe tu objetivo en lenguaje natural y obtén una plantilla lista para usar con variables editables.',
      step1Label: 'Describe tu idea o tarea',
      placeholder: 'Ejemplo: Prompt para analizar campañas de anuncios y proponer mejoras...',
      suggestionsLabel: 'Ideas sugeridas:',
      generateBtn: 'Generar prompt',
      generatingBtn: 'Generando prompt...',
      unlockBtn: 'Desbloquear creador IA',
      lockedTitle: 'Función disponible en planes activos',
      lockedBody: 'Activa tu plan con PayPal para generar prompts ilimitados con variables dinámicas.',
    },
    integrations: {
      eyebrow: 'Integraciones y Claves',
      title: 'Conexiones y API Keys',
      subtitle:
        'Conecta tu cuenta de TikTok o agrega tus claves privadas de OpenAI, Google Gemini y Anthropic.',
      connected: 'Conectado',
      readyToConnect: 'Listo para conectar',
      saveKey: 'Guardar clave',
    },
    footer: {
      tagline: 'Biblioteca y plataforma profesional de prompts IA',
      verifiedPayments: 'Pagos seguros vía PayPal',
      sslProtection: 'Cifrado SSL 256-bit',
    },
  },

  en: {
    nav: {
      prompts: 'Prompts',
      optimizer: 'Optimizer',
      creator: 'AI Creator',
      myPrompts: 'My Prompts',
      analytics: 'Analytics',
      api: 'API',
      plans: 'Pricing',
      access: 'Access',
      active: 'Active',
      language: 'Language',
    },
    categories: {
      'cat-all': 'All',
      'cat-agents': 'AI Agents',
      'cat-marketing': 'Marketing & Copy',
      'cat-sales': 'Sales',
      'cat-code': 'Development',
      'cat-social': 'Social Media',
      'cat-seo': 'SEO & Content',
      'cat-business': 'Business',
      'cat-art': 'Design & Art',
    },
    gallery: {
      heroTitle: 'Find, customize, and run',
      heroHighlight: 'professional AI prompts',
      heroSubtitle:
        'Browse tested prompt templates, run them live with your variables, or export clean PDFs for clients and teams.',
      createFromIdea: 'Create Prompt with AI',
      exportPdf: 'Export PDF',
      promptsAvailable: 'ready prompts',
      creditsAvailable: 'credits left',
      proActive: 'PRO plan active',
      modelsSupport: 'Gemini, GPT-4o & Claude',
      searchPlaceholder: 'Search by title, topic, or use case (⌘K)...',
      searchClear: 'Clear search',
      resultsCount: 'results',
      filters: 'Filters',
      hideFilters: 'Hide filters',
      searchScopeAll: 'All',
      searchScopeTitle: 'Title',
      searchScopeDesc: 'Description',
      filterAll: 'All',
      filterFree: 'Free',
      filterPro: 'PRO',
      allModels: 'All models',
      sortUses: 'Most used',
      sortRating: 'Top rated',
      sortNewest: 'Newest',
      favorites: 'Saved',
      expandAll: 'Show templates',
      collapseAll: 'Hide templates',
      resetFilters: 'Reset filters',
      freeNoticeTitle: 'Free plan active',
      freeNoticeBody:
        'Unlock PRO prompts and advanced generation with an active PayPal subscription.',
      unlockBtn: 'Unlock access',
      emptyTitle: 'No prompts match these filters',
      emptyBody:
        'Try resetting your filters or generate a tailored prompt from your idea with AI.',
      emptyCreateBtn: 'Create prompt with AI',
      bottomTitle: 'Need the full catalog for your team or clients?',
      bottomBody:
        'Download the complete library as PDF or activate a monthly plan directly via PayPal.',
      downloadCatalogBtn: 'Download PDF catalog',
      viewPlansBtn: 'View plans',
    },
    card: {
      pro: 'PRO',
      proLocked: 'PRO · Locked',
      free: 'Free',
      usePrompt: 'Use prompt',
      unlock: 'Unlock',
      preview: 'Preview',
      hidePreview: 'Hide',
      copy: 'Copy',
      copied: 'Copied',
      pdf: 'PDF',
      save: 'Save',
      unsave: 'Remove from saved',
      vars: 'vars',
      templateLabel: 'Template',
      editableVars: 'editable variables',
      version: 'Version',
    },
    controlPanel: {
      title: 'Productivity Overview',
      subtitle: 'Usage summary and estimated time saved compared to manual writing.',
      exportCsv: 'Export CSV',
      view30DayChart: '30-Day Chart',
      showDetails: 'Show ranking',
      hideDetails: 'Hide ranking',
      timeSaved: 'Time saved',
      estimatedValue: 'Estimated value',
      totalExecutions: 'Total runs',
      speedup: 'Speedup',
      hoursSaved: 'hours',
      daysEquivalent: 'work days',
      manualVsAi: 'Manual vs AI',
      topPromptsTitle: 'Most executed prompts',
      allCategories: 'All categories',
      showTop: 'Show top',
      uses: 'runs',
      savedTime: 'saved',
      run: 'Run',
      csvSuccess: 'CSV productivity report downloaded.',
      csvError: 'Could not generate CSV file. Please try again.',
    },
    pricing: {
      eyebrow: 'Plans & Billing',
      title: 'Simple plans for every stage',
      subtitle:
        'Payments processed securely through PayPal. Instant activation and cancel anytime.',
      currentPlan: 'Current plan',
      quota: 'Monthly quota',
      promptsThisMonth: 'prompts this month',
      verifiedPaypal: 'Verified PayPal Checkout',
      adminAccess: 'Admin access',
      alreadyPaidPrompt:
        'Already completed your PayPal payment? Enter your PayPal email to verify and activate your plan.',
      emailPlaceholder: 'your-paypal-email@example.com',
      verifyPaypalBtn: 'Verify payment',
      availablePlans: 'Available plans',
      filterAll: 'All plans',
      filterCreators: 'Creators',
      filterAgencies: 'Agencies',
      activePlanBadge: 'Active plan',
      promptsCountLabel: 'prompts/mo',
      perMonth: '/mo',
      noCard: 'no card needed',
      currentPlanFree: 'Current plan',
      activateFree: 'Use free plan',
      subscribePaypal: 'Subscribe with PayPal',
      adminModalBadge: 'Admin authentication',
      adminModalTitle: 'Activate',
      adminModalBody:
        'Enter your private administrator credentials to unlock this plan.',
      adminUserLabel: 'Admin username or email',
      adminPassLabel: 'Activation password',
      adminUnlockBtn: 'Activate plan',
      cancel: 'Cancel',
      verifyErrorGeneric: 'Could not verify your subscription.',
      verifyNotFound: 'No active subscription found for that email.',
      verifyConnectionError: 'Connection error. Please try again.',
      verifySuccess: 'Plan activated successfully.',
    },
    unlockModal: {
      statusActive: 'Active plan',
      statusFree: 'Free plan',
      titleActive: 'Full access active',
      titleFree: 'Unlock plan or access',
      subtitle:
        'Pay directly via PayPal or sign in with administrator credentials to unlock your plan.',
      adminHeader: 'Credential access',
      privateEncrypted: 'Private',
      selectPlanLabel: 'Select plan:',
      userLabel: 'Username or email',
      passLabel: 'Password',
      unlockPlanBtn: 'Unlock',
      payPaypalBtn: 'Pay with PayPal',
      viewAllPlansBtn: 'View all plans',
      quickControl: 'Quick control',
      switchFreeBtn: 'Switch to free mode',
      close: 'Close',
      relockedMsg: 'Switched back to Free mode (5 prompts).',
    },
    analytics: {
      eyebrow: 'Prompt Analytics',
      title: 'Frequency, Success & Latency',
      subtitle:
        'Track daily prompt execution volume over the last 30 days and compare performance across prompt versions.',
      simulateBtn: 'Simulate run (+1)',
      resetBtn: 'Reset',
      promptAnalyzed: 'Prompt:',
      allPromptsOption: 'All prompts (global average)',
      series: 'Versions:',
      modeDual: 'Success & Latency',
      modeSuccess: 'Success Rate (%)',
      modeLatency: 'Latency (ms)',
      freqTitle: 'Prompt Execution Frequency (Last 30 Days)',
      freqSubtitleAll: 'Consolidated daily executions across all platform prompts.',
      freqSubtitleSingle: 'Daily executions recorded for the selected prompt.',
      freqDaily: 'Daily',
      freqSplit: 'Success vs Retries',
      freqCumulative: 'Cumulative',
      total30d: '30-Day Total',
      avgDaily: 'Daily Average',
      peakDay: 'Peak Day',
      globalReliability: 'Reliability',
      vsPrevFortnight: 'vs previous 15d',
      executionsPerDay: 'runs/day',
      successful: 'successful',
      versionCurvesTitle: 'Version Comparison (v1.0 · v2.0 · v3.0)',
      versionCurvesSubtitle: 'Historical success rate and latency trends across iterations.',
    },
    myPrompts: {
      eyebrow: 'Personal Workspace',
      title: 'My Prompts & Versions',
      subtitle:
        'Manage saved prompts, monitor your monthly quota, and switch between saved iterations.',
      showAll: 'Show templates',
      hideAll: 'Hide templates',
      downloadPdf: 'Export PDF',
      createWithAi: 'Create with AI',
      tabAll: 'Overview',
      tabAnalytics: 'Analytics',
      tabVersions: 'Versions',
      tabQuota: 'Quota',
      tabSaved: 'Saved',
      quotaUsage: 'Monthly usage:',
      emptyTitle: 'No saved prompts yet',
      emptyBody: 'Bookmark your favorite prompts from the library for quick access.',
      exploreGallery: 'Browse library',
    },
    optimizer: {
      eyebrow: 'AI Optimizer',
      title: 'Upgrade any prompt in seconds',
      subtitle:
        'Turn a rough instruction into a structured prompt with clear variables, context, and output format.',
      inputLabel: 'Enter your draft prompt',
      inputPlaceholder: 'Describe what you want the AI to do...',
      presetsLabel: 'Quick examples:',
      optimizeBtn: 'Optimize prompt',
      optimizingBtn: 'Optimizing...',
      unlockBtn: 'Unlock optimizer',
    },
    creator: {
      eyebrow: 'AI Creator',
      title: 'Build a complete prompt from an idea',
      subtitle:
        'Describe your goal in plain language and get a ready-to-use template with editable variables.',
      step1Label: 'Describe your idea or workflow',
      placeholder: 'Example: Prompt to audit B2B landing pages and recommend copy improvements...',
      suggestionsLabel: 'Suggested ideas:',
      generateBtn: 'Generate prompt',
      generatingBtn: 'Generating prompt...',
      unlockBtn: 'Unlock AI creator',
      lockedTitle: 'Available on active plans',
      lockedBody: 'Activate your PayPal plan to generate custom prompts with dynamic variables.',
    },
    integrations: {
      eyebrow: 'Integrations & Keys',
      title: 'Connections & API Keys',
      subtitle:
        'Connect your TikTok account or add private API keys for OpenAI, Google Gemini, and Anthropic.',
      connected: 'Connected',
      readyToConnect: 'Ready to connect',
      saveKey: 'Save key',
    },
    footer: {
      tagline: 'Professional AI prompt library & workspace',
      verifiedPayments: 'Secure PayPal payments',
      sslProtection: '256-bit SSL encryption',
    },
  },

  pt: {
    nav: {
      prompts: 'Prompts',
      optimizer: 'Otimizador',
      creator: 'Criador IA',
      myPrompts: 'Meus Prompts',
      analytics: 'Análises',
      api: 'API',
      plans: 'Planos',
      access: 'Acesso',
      active: 'Ativo',
      language: 'Idioma',
    },
    categories: {
      'cat-all': 'Todos',
      'cat-agents': 'Agentes IA',
      'cat-marketing': 'Marketing e Copy',
      'cat-sales': 'Vendas',
      'cat-code': 'Desenvolvimento',
      'cat-social': 'Redes Sociais',
      'cat-seo': 'SEO e Conteúdo',
      'cat-business': 'Negócios',
      'cat-art': 'Design e Arte',
    },
    gallery: {
      heroTitle: 'Encontre, personalize e execute',
      heroHighlight: 'prompts profissionais de IA',
      heroSubtitle:
        'Explore modelos validados, execute ao vivo com suas variáveis ou exporte em PDF prontos para clientes.',
      createFromIdea: 'Criar Prompt com IA',
      exportPdf: 'Exportar PDF',
      promptsAvailable: 'prompts prontos',
      creditsAvailable: 'créditos disponíveis',
      proActive: 'Plano PRO ativo',
      modelsSupport: 'Gemini, GPT-4o e Claude',
      searchPlaceholder: 'Buscar por título, tema ou caso de uso (⌘K)...',
      searchClear: 'Limpar busca',
      resultsCount: 'resultados',
      filters: 'Filtros',
      hideFilters: 'Ocultar filtros',
      searchScopeAll: 'Tudo',
      searchScopeTitle: 'Título',
      searchScopeDesc: 'Descrição',
      filterAll: 'Todos',
      filterFree: 'Grátis',
      filterPro: 'PRO',
      allModels: 'Todos os modelos',
      sortUses: 'Mais usados',
      sortRating: 'Melhor avaliados',
      sortNewest: 'Mais recentes',
      favorites: 'Salvos',
      expandAll: 'Ver modelos',
      collapseAll: 'Ocultar modelos',
      resetFilters: 'Limpar filtros',
      freeNoticeTitle: 'Plano gratuito ativo',
      freeNoticeBody:
        'Desbloqueie prompts PRO e geração avançada com uma assinatura ativa via PayPal.',
      unlockBtn: 'Desbloquear acesso',
      emptyTitle: 'Nenhum prompt encontrado com esses filtros',
      emptyBody:
        'Limpe os filtros ou gere um prompt sob medida a partir da sua ideia com IA.',
      emptyCreateBtn: 'Criar prompt com IA',
      bottomTitle: 'Precisa do catálogo completo para sua equipe ou clientes?',
      bottomBody:
        'Baixe a biblioteca inteira em PDF ou ative um plano mensal diretamente pelo PayPal.',
      downloadCatalogBtn: 'Baixar catálogo PDF',
      viewPlansBtn: 'Ver planos',
    },
    card: {
      pro: 'PRO',
      proLocked: 'PRO · Bloqueado',
      free: 'Grátis',
      usePrompt: 'Usar prompt',
      unlock: 'Desbloquear',
      preview: 'Ver texto',
      hidePreview: 'Ocultar',
      copy: 'Copiar',
      copied: 'Copiado',
      pdf: 'PDF',
      save: 'Salvar',
      unsave: 'Remover dos salvos',
      vars: 'vars',
      templateLabel: 'Modelo',
      editableVars: 'variáveis editáveis',
      version: 'Versão',
    },
    controlPanel: {
      title: 'Painel de Produtividade',
      subtitle: 'Resumo de uso e economia de tempo em relação à escrita manual.',
      exportCsv: 'Exportar CSV',
      view30DayChart: 'Gráfico 30 dias',
      showDetails: 'Ver ranking',
      hideDetails: 'Ocultar ranking',
      timeSaved: 'Tempo economizado',
      estimatedValue: 'Valor estimado',
      totalExecutions: 'Execuções totais',
      speedup: 'Velocidade',
      hoursSaved: 'horas',
      daysEquivalent: 'dias úteis',
      manualVsAi: 'Manual vs IA',
      topPromptsTitle: 'Prompts mais executados',
      allCategories: 'Todas as categorias',
      showTop: 'Mostrar top',
      uses: 'usos',
      savedTime: 'economizado',
      run: 'Executar',
      csvSuccess: 'Relatório CSV baixado com sucesso.',
      csvError: 'Não foi possível gerar o arquivo CSV. Tente novamente.',
    },
    pricing: {
      eyebrow: 'Planos e Assinaturas',
      title: 'Planos simples para cada fase',
      subtitle:
        'Pagamentos seguros processados via PayPal. Ativação imediata e cancelamento livre.',
      currentPlan: 'Plano atual',
      quota: 'Cota mensal',
      promptsThisMonth: 'prompts este mês',
      verifiedPaypal: 'Pagamento verificado via PayPal',
      adminAccess: 'Acesso administrador',
      alreadyPaidPrompt:
        'Já realizou o pagamento no PayPal? Informe seu e-mail de compra para verificar e ativar seu plano.',
      emailPlaceholder: 'seu-email-paypal@exemplo.com',
      verifyPaypalBtn: 'Verificar pagamento',
      availablePlans: 'Planos disponíveis',
      filterAll: 'Todos',
      filterCreators: 'Criadores',
      filterAgencies: 'Agências',
      activePlanBadge: 'Plano ativo',
      promptsCountLabel: 'prompts/mês',
      perMonth: '/mês',
      noCard: 'sem cartão',
      currentPlanFree: 'Plano atual',
      activateFree: 'Usar plano gratuito',
      subscribePaypal: 'Assinar com PayPal',
      adminModalBadge: 'Acesso administrador',
      adminModalTitle: 'Ativar',
      adminModalBody:
        'Insira suas credenciais privadas de administrador para ativar este plano.',
      adminUserLabel: 'Usuário ou e-mail',
      adminPassLabel: 'Senha de ativação',
      adminUnlockBtn: 'Ativar plano',
      cancel: 'Cancelar',
      verifyErrorGeneric: 'Não foi possível verificar sua assinatura.',
      verifyNotFound: 'Nenhuma assinatura ativa encontrada para este e-mail.',
      verifyConnectionError: 'Erro de conexão. Tente novamente.',
      verifySuccess: 'Plano ativado com sucesso.',
    },
    unlockModal: {
      statusActive: 'Plano ativo',
      statusFree: 'Plano gratuito',
      titleActive: 'Acesso completo ativo',
      titleFree: 'Ativar plano ou acesso',
      subtitle:
        'Pague diretamente com PayPal ou faça login com credenciais de administrador.',
      adminHeader: 'Acesso com credenciais',
      privateEncrypted: 'Privado',
      selectPlanLabel: 'Selecione o plano:',
      userLabel: 'Usuário ou e-mail',
      passLabel: 'Senha',
      unlockPlanBtn: 'Ativar',
      payPaypalBtn: 'Pagar com PayPal',
      viewAllPlansBtn: 'Ver todos os planos',
      quickControl: 'Controle rápido',
      switchFreeBtn: 'Voltar ao modo gratuito',
      close: 'Fechar',
      relockedMsg: 'Conta retornada ao modo gratuito (5 prompts).',
    },
    analytics: {
      eyebrow: 'Análise de Prompts',
      title: 'Frequência, Sucesso e Latência',
      subtitle:
        'Acompanhe o volume diário de execuções nos últimos 30 dias e compare o desempenho por versão.',
      simulateBtn: 'Simular execução (+1)',
      resetBtn: 'Restaurar',
      promptAnalyzed: 'Prompt:',
      allPromptsOption: 'Todos os prompts (global)',
      series: 'Versões:',
      modeDual: 'Sucesso e Latência',
      modeSuccess: 'Taxa de Sucesso (%)',
      modeLatency: 'Latência (ms)',
      freqTitle: 'Frequência de Execução (Últimos 30 Dias)',
      freqSubtitleAll: 'Volume diário consolidado de todos os prompts.',
      freqSubtitleSingle: 'Volume diário registrado para o prompt selecionado.',
      freqDaily: 'Diária',
      freqSplit: 'Sucesso vs Retentativas',
      freqCumulative: 'Acumulada',
      total30d: 'Total 30 dias',
      avgDaily: 'Média diária',
      peakDay: 'Dia de pico',
      globalReliability: 'Confiabilidade',
      vsPrevFortnight: 'vs quinzena anterior',
      executionsPerDay: 'execuções/dia',
      successful: 'bem-sucedidas',
      versionCurvesTitle: 'Comparação por Versão (v1.0 · v2.0 · v3.0)',
      versionCurvesSubtitle: 'Evolução da taxa de sucesso e velocidade de resposta.',
    },
    myPrompts: {
      eyebrow: 'Espaço Pessoal',
      title: 'Meus Prompts e Versões',
      subtitle:
        'Gerencie favoritos, acompanhe sua cota mensal e alterne entre versões salvas.',
      showAll: 'Ver modelos',
      hideAll: 'Ocultar modelos',
      downloadPdf: 'Exportar PDF',
      createWithAi: 'Criar com IA',
      tabAll: 'Resumo',
      tabAnalytics: 'Análises',
      tabVersions: 'Versões',
      tabQuota: 'Cota',
      tabSaved: 'Salvos',
      quotaUsage: 'Uso mensal:',
      emptyTitle: 'Nenhum prompt salvo ainda',
      emptyBody: 'Salve seus prompts favoritos na biblioteca para acesso rápido.',
      exploreGallery: 'Explorar biblioteca',
    },
    optimizer: {
      eyebrow: 'Otimizador IA',
      title: 'Melhore qualquer prompt na hora',
      subtitle:
        'Transforme uma instrução simples em um prompt estruturado com variáveis e contexto.',
      inputLabel: 'Digite seu prompt inicial',
      inputPlaceholder: 'Descreva o que você precisa que a IA faça...',
      presetsLabel: 'Exemplos rápidos:',
      optimizeBtn: 'Otimizar prompt',
      optimizingBtn: 'Otimizando...',
      unlockBtn: 'Desbloquear otimizador',
    },
    creator: {
      eyebrow: 'Criador IA',
      title: 'Crie um prompt completo a partir de uma ideia',
      subtitle:
        'Descreva seu objetivo em linguagem natural e receba um modelo pronto com variáveis editáveis.',
      step1Label: 'Descreva sua ideia ou tarefa',
      placeholder: 'Exemplo: Prompt para analisar campanhas e sugerir melhorias...',
      suggestionsLabel: 'Ideias sugeridas:',
      generateBtn: 'Gerar prompt',
      generatingBtn: 'Gerando prompt...',
      unlockBtn: 'Desbloquear criador IA',
      lockedTitle: 'Disponível em planos ativos',
      lockedBody: 'Ative seu plano pelo PayPal para gerar prompts personalizados com variáveis.',
    },
    integrations: {
      eyebrow: 'Integrações e Chaves',
      title: 'Conexões e API Keys',
      subtitle:
        'Conecte sua conta TikTok ou adicione suas chaves privadas da OpenAI, Google Gemini e Anthropic.',
      connected: 'Conectado',
      readyToConnect: 'Pronto para conectar',
      saveKey: 'Salvar chave',
    },
    footer: {
      tagline: 'Biblioteca e plataforma profissional de prompts IA',
      verifiedPayments: 'Pagamentos seguros via PayPal',
      sslProtection: 'Criptografia SSL 256-bit',
    },
  },

  fr: {
    nav: {
      prompts: 'Prompts',
      optimizer: 'Optimiseur',
      creator: 'Créateur IA',
      myPrompts: 'Mes Prompts',
      analytics: 'Analytique',
      api: 'API',
      plans: 'Tarifs',
      access: 'Accès',
      active: 'Actif',
      language: 'Langue',
    },
    categories: {
      'cat-all': 'Tous',
      'cat-agents': 'Agents IA',
      'cat-marketing': 'Marketing & Copy',
      'cat-sales': 'Ventes',
      'cat-code': 'Développement',
      'cat-social': 'Réseaux Sociaux',
      'cat-seo': 'SEO & Contenu',
      'cat-business': 'Affaires',
      'cat-art': 'Design & Art',
    },
    gallery: {
      heroTitle: 'Trouvez, personnalisez et exécutez',
      heroHighlight: 'des prompts IA professionnels',
      heroSubtitle:
        'Parcourez des modèles éprouvés, testez-les en direct avec vos variables ou exportez-les en PDF pour vos clients.',
      createFromIdea: 'Créer un Prompt IA',
      exportPdf: 'Exporter PDF',
      promptsAvailable: 'prompts prêts',
      creditsAvailable: 'crédits restants',
      proActive: 'Plan PRO actif',
      modelsSupport: 'Gemini, GPT-4o et Claude',
      searchPlaceholder: 'Rechercher par titre, thème ou usage (⌘K)...',
      searchClear: 'Effacer',
      resultsCount: 'résultats',
      filters: 'Filtres',
      hideFilters: 'Masquer filtres',
      searchScopeAll: 'Tout',
      searchScopeTitle: 'Titre',
      searchScopeDesc: 'Description',
      filterAll: 'Tous',
      filterFree: 'Gratuit',
      filterPro: 'PRO',
      allModels: 'Tous les modèles',
      sortUses: 'Plus utilisés',
      sortRating: 'Mieux notés',
      sortNewest: 'Plus récents',
      favorites: 'Favoris',
      expandAll: 'Voir les textes',
      collapseAll: 'Masquer les textes',
      resetFilters: 'Réinitialiser',
      freeNoticeTitle: 'Plan gratuit actif',
      freeNoticeBody:
        'Débloquez les prompts PRO et la génération avancée avec un abonnement PayPal actif.',
      unlockBtn: 'Débloquer l’accès',
      emptyTitle: 'Aucun prompt ne correspond à ces filtres',
      emptyBody:
        'Réinitialisez les filtres ou générez un prompt sur mesure depuis votre idée avec l’IA.',
      emptyCreateBtn: 'Créer un prompt IA',
      bottomTitle: 'Besoin du catalogue complet pour votre équipe ou vos clients ?',
      bottomBody:
        'Téléchargez la bibliothèque complète en PDF ou activez un plan mensuel via PayPal.',
      downloadCatalogBtn: 'Télécharger le PDF',
      viewPlansBtn: 'Voir les tarifs',
    },
    card: {
      pro: 'PRO',
      proLocked: 'PRO · Verrouillé',
      free: 'Gratuit',
      usePrompt: 'Utiliser',
      unlock: 'Débloquer',
      preview: 'Aperçu',
      hidePreview: 'Masquer',
      copy: 'Copier',
      copied: 'Copié',
      pdf: 'PDF',
      save: 'Enregistrer',
      unsave: 'Retirer des favoris',
      vars: 'vars',
      templateLabel: 'Modèle',
      editableVars: 'variables éditables',
      version: 'Version',
    },
    controlPanel: {
      title: 'Tableau de Productivité',
      subtitle: 'Résumé d’utilisation et gain de temps par rapport à la rédaction manuelle.',
      exportCsv: 'Exporter CSV',
      view30DayChart: 'Graphique 30j',
      showDetails: 'Voir classement',
      hideDetails: 'Masquer',
      timeSaved: 'Temps gagné',
      estimatedValue: 'Valeur estimée',
      totalExecutions: 'Exécutions',
      speedup: 'Vitesse',
      hoursSaved: 'heures',
      daysEquivalent: 'jours ouvrés',
      manualVsAi: 'Manuel vs IA',
      topPromptsTitle: 'Prompts les plus exécutés',
      allCategories: 'Toutes catégories',
      showTop: 'Afficher top',
      uses: 'usages',
      savedTime: 'gagné',
      run: 'Lancer',
      csvSuccess: 'Rapport CSV téléchargé avec succès.',
      csvError: 'Impossible de générer le CSV. Veuillez réessayer.',
    },
    pricing: {
      eyebrow: 'Tarifs et Abonnements',
      title: 'Des plans clairs pour chaque étape',
      subtitle:
        'Paiements sécurisés via PayPal. Activation immédiate et annulation à tout moment.',
      currentPlan: 'Plan actuel',
      quota: 'Quota mensuel',
      promptsThisMonth: 'prompts ce mois-ci',
      verifiedPaypal: 'Paiement PayPal vérifié',
      adminAccess: 'Accès administrateur',
      alreadyPaidPrompt:
        'Vous avez déjà payé sur PayPal ? Saisissez votre e-mail PayPal pour activer votre plan.',
      emailPlaceholder: 'votre-email-paypal@exemple.com',
      verifyPaypalBtn: 'Vérifier le paiement',
      availablePlans: 'Plans disponibles',
      filterAll: 'Tous',
      filterCreators: 'Créateurs',
      filterAgencies: 'Agences',
      activePlanBadge: 'Plan actif',
      promptsCountLabel: 'prompts/mois',
      perMonth: '/mois',
      noCard: 'sans carte',
      currentPlanFree: 'Plan actuel',
      activateFree: 'Passer au gratuit',
      subscribePaypal: 'S’abonner avec PayPal',
      adminModalBadge: 'Authentification admin',
      adminModalTitle: 'Activer',
      adminModalBody:
        'Saisissez vos identifiants administrateur privés pour activer ce plan.',
      adminUserLabel: 'Utilisateur ou e-mail',
      adminPassLabel: 'Mot de passe d’activation',
      adminUnlockBtn: 'Activer le plan',
      cancel: 'Annuler',
      verifyErrorGeneric: 'Impossible de vérifier votre abonnement.',
      verifyNotFound: 'Aucun abonnement actif trouvé pour cet e-mail.',
      verifyConnectionError: 'Erreur de connexion. Veuillez réessayer.',
      verifySuccess: 'Plan activé avec succès.',
    },
    unlockModal: {
      statusActive: 'Plan actif',
      statusFree: 'Plan gratuit',
      titleActive: 'Accès complet actif',
      titleFree: 'Activer un plan',
      subtitle:
        'Payez directement avec PayPal ou connectez-vous avec vos identifiants administrateur.',
      adminHeader: 'Accès par identifiants',
      privateEncrypted: 'Privé',
      selectPlanLabel: 'Choisir le plan :',
      userLabel: 'Utilisateur ou e-mail',
      passLabel: 'Mot de passe',
      unlockPlanBtn: 'Activer',
      payPaypalBtn: 'Payer avec PayPal',
      viewAllPlansBtn: 'Voir tous les plans',
      quickControl: 'Contrôle rapide',
      switchFreeBtn: 'Revenir au gratuit',
      close: 'Fermer',
      relockedMsg: 'Compte repassé en mode gratuit (5 prompts).',
    },
    analytics: {
      eyebrow: 'Analytique Prompts',
      title: 'Fréquence, Succès et Latence',
      subtitle:
        'Suivez la fréquence quotidienne d’exécution sur les 30 derniers jours et comparez les versions.',
      simulateBtn: 'Simuler (+1)',
      resetBtn: 'Réinitialiser',
      promptAnalyzed: 'Prompt :',
      allPromptsOption: 'Tous les prompts (global)',
      series: 'Versions :',
      modeDual: 'Succès & Latence',
      modeSuccess: 'Taux de Succès (%)',
      modeLatency: 'Latence (ms)',
      freqTitle: 'Fréquence d’Exécution (30 Derniers Jours)',
      freqSubtitleAll: 'Volume quotidien consolidé de tous les prompts.',
      freqSubtitleSingle: 'Volume quotidien enregistré pour le prompt sélectionné.',
      freqDaily: 'Quotidienne',
      freqSplit: 'Succès vs Tentatives',
      freqCumulative: 'Cumulée',
      total30d: 'Total 30 jours',
      avgDaily: 'Moyenne / jour',
      peakDay: 'Jour record',
      globalReliability: 'Fiabilité',
      vsPrevFortnight: 'vs 15j précédents',
      executionsPerDay: 'exécutions/jour',
      successful: 'réussies',
      versionCurvesTitle: 'Comparaison par Version (v1.0 · v2.0 · v3.0)',
      versionCurvesSubtitle: 'Évolution du taux de succès et de la latence.',
    },
    myPrompts: {
      eyebrow: 'Espace Personnel',
      title: 'Mes Prompts et Versions',
      subtitle:
        'Gérez vos favoris, suivez votre quota mensuel et basculez entre vos itérations.',
      showAll: 'Voir les modèles',
      hideAll: 'Masquer les modèles',
      downloadPdf: 'Exporter PDF',
      createWithAi: 'Créer avec l’IA',
      tabAll: 'Aperçu',
      tabAnalytics: 'Analytique',
      tabVersions: 'Versions',
      tabQuota: 'Quota',
      tabSaved: 'Favoris',
      quotaUsage: 'Quota mensuel :',
      emptyTitle: 'Aucun prompt enregistré',
      emptyBody: 'Ajoutez vos prompts favoris depuis la bibliothèque pour y accéder plus vite.',
      exploreGallery: 'Explorer la bibliothèque',
    },
    optimizer: {
      eyebrow: 'Optimiseur IA',
      title: 'Améliorez vos prompts en un clic',
      subtitle:
        'Transformez une instruction simple en prompt structuré avec variables et format précis.',
      inputLabel: 'Saisissez votre prompt initial',
      inputPlaceholder: 'Décrivez ce que vous souhaitez que l’IA accomplisse...',
      presetsLabel: 'Exemples rapides :',
      optimizeBtn: 'Optimiser le prompt',
      optimizingBtn: 'Optimisation...',
      unlockBtn: 'Débloquer l’optimiseur',
    },
    creator: {
      eyebrow: 'Créateur IA',
      title: 'Créez un prompt complet depuis une idée',
      subtitle:
        'Décrivez votre objectif en langage naturel et obtenez un modèle structuré avec variables.',
      step1Label: 'Décrivez votre idée ou besoin',
      placeholder: 'Exemple : Prompt pour analyser un site B2B et proposer des améliorations...',
      suggestionsLabel: 'Idées suggérées :',
      generateBtn: 'Générer le prompt',
      generatingBtn: 'Génération en cours...',
      unlockBtn: 'Débloquer le créateur IA',
      lockedTitle: 'Disponible sur les plans actifs',
      lockedBody: 'Activez un plan PayPal pour générer des prompts personnalisés avec variables.',
    },
    integrations: {
      eyebrow: 'Intégrations et Clés',
      title: 'Connexions et Clés API',
      subtitle:
        'Connectez votre compte TikTok ou ajoutez vos clés API privées OpenAI, Google Gemini et Anthropic.',
      connected: 'Connecté',
      readyToConnect: 'Prêt à connecter',
      saveKey: 'Enregistrer la clé',
    },
    footer: {
      tagline: 'Bibliothèque et espace professionnel de prompts IA',
      verifiedPayments: 'Paiements sécurisés via PayPal',
      sslProtection: 'Chiffrement SSL 256-bit',
    },
  },
};
