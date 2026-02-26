-- ============================================
-- Schema opcional: planes, testimonios, config
-- Ejecutar solo si quieres contenido dinámico en el landing
-- ============================================

-- Planes (para GET /api/planes)
CREATE TABLE IF NOT EXISTS public.planes (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  duracion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  precio_periodo TEXT,
  features JSONB DEFAULT '[]',
  modalidad TEXT DEFAULT 'Online',
  capacidad TEXT,
  destacado BOOLEAN DEFAULT false,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Testimonios (para GET /api/testimonios)
CREATE TABLE IF NOT EXISTS public.testimonios (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  ubicacion TEXT,
  titulo TEXT,
  texto TEXT NOT NULL,
  estrellas INTEGER DEFAULT 5,
  categoria TEXT,
  fecha DATE,
  avatar_url TEXT,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Config pública (WhatsApp, email, etc.)
CREATE TABLE IF NOT EXISTS public.config (
  clave TEXT PRIMARY KEY,
  valor TEXT,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO public.config (clave, valor) VALUES
  ('whatsapp', '573223764397'),
  ('email_contacto', 'contacto@tradingpro.com'),
  ('trustpilot_url', 'https://es.trustpilot.com/review/yotagoprofessional.com')
ON CONFLICT (clave) DO NOTHING;

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON public.citas(fecha);
CREATE INDEX IF NOT EXISTS idx_citas_estado ON public.citas(estado);
CREATE INDEX IF NOT EXISTS idx_citas_email ON public.citas(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_citas_created_by ON public.citas(created_by_user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON public.users(LOWER(email));
