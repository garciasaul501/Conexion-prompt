export const SUPABASE_SQL_SCRIPT = `-- ====================================================================
-- CONEXIÓN PROMPTS - ESQUEMA DE BASE DE DATOS COMPLETO PARA SUPABASE
-- PostgreSQL + Row Level Security (RLS) + Foreign Keys + Triggers
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. TABLA: users_profiles
-- Almacena información extendida de perfil del usuario vinculado a auth.users
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 2. TABLA: subscriptions
-- Estado de pago de Stripe sincronizado mediante Webhooks
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users_profiles(id) ON DELETE CASCADE,
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'enterprise')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
    current_period_end TIMESTAMPTZ,
    monthly_prompt_quota INT NOT NULL DEFAULT 50,
    used_prompts_this_month INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 3. TABLA: categories
-- Categorías temáticas de los prompts (Marketing, Programación, etc.)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon_name TEXT DEFAULT 'Folder',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 4. TABLA: prompts
-- Catálogo central de prompts en plantilla con variables dinámicas JSON
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    template_content TEXT NOT NULL,
    variables_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_premium BOOLEAN NOT NULL DEFAULT false,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    recommended_model TEXT DEFAULT 'gemini-3.6-flash',
    author_id UUID REFERENCES public.users_profiles(id) ON DELETE SET NULL,
    uses_count INT NOT NULL DEFAULT 0,
    rating NUMERIC(3,2) DEFAULT 5.0,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 5. TABLA: user_integrations
-- Guardado seguro y encriptado de las API Keys privadas de los usuarios
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users_profiles(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'google_gemini')),
    encrypted_api_key TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, provider)
);

-- --------------------------------------------------------------------
-- 6. TABLA: saved_prompts
-- Prompts marcados como favoritos por los usuarios
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users_profiles(id) ON DELETE CASCADE,
    prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, prompt_id)
);

-- ====================================================================
-- ÍNDICES PARA OPTIMIZACIÓN DE CONSULTAS
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_prompts_category ON public.prompts(category_id);
CREATE INDEX IF NOT EXISTS idx_prompts_premium ON public.prompts(is_premium);
CREATE INDEX IF NOT EXISTS idx_saved_prompts_user ON public.saved_prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON public.subscriptions(stripe_customer_id);

-- ====================================================================
-- FUNCIÓN Y TRIGGER PARA AUTO-CREACIÓN DE USER PROFILE & SUBSCRIPTION
-- Se ejecuta automáticamente cuando un usuario se registra en Auth
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- 1. Insertar Perfil
    INSERT INTO public.users_profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    );

    -- 2. Asignar Suscripción Gratuita por Defecto
    INSERT INTO public.subscriptions (user_id, plan_type, monthly_prompt_quota)
    VALUES (NEW.id, 'free', 50);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- POLÍTICAS DE SEGURIDAD A NIVEL DE FILA (ROW LEVEL SECURITY - RLS)
-- ====================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.users_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_prompts ENABLE ROW LEVEL SECURITY;

-- 1. users_profiles RLS
CREATE POLICY "Usuarios pueden ver sus propios perfiles" ON public.users_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON public.users_profiles
    FOR UPDATE USING (auth.uid() = id);

-- 2. subscriptions RLS
CREATE POLICY "Usuarios pueden ver su propio estado de suscripción" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- 3. categories RLS (Lectura pública)
CREATE POLICY "Cualquiera puede leer categorías" ON public.categories
    FOR SELECT USING (true);

-- 4. prompts RLS
CREATE POLICY "Prompts gratuitos legibles por todos" ON public.prompts
    FOR SELECT USING (
        NOT is_premium OR
        EXISTS (
            SELECT 1 FROM public.subscriptions
            WHERE subscriptions.user_id = auth.uid()
            AND subscriptions.plan_type IN ('pro', 'enterprise')
            AND subscriptions.status = 'active'
        )
    );

-- 5. user_integrations RLS
CREATE POLICY "Usuarios solo manejan sus propias API keys" ON public.user_integrations
    FOR ALL USING (auth.uid() = user_id);

-- 6. saved_prompts RLS
CREATE POLICY "Usuarios gestionan sus propios favoritos" ON public.saved_prompts
    FOR ALL USING (auth.uid() = user_id);
`;
