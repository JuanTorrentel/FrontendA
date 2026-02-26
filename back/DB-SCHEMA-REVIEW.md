# Revisión de Base de Datos – Yotago School

**Base de datos:** PostgreSQL (Neon)  
**Connection string:** `DATABASE_URL` en `.env`

---

## 1. Tablas existentes

### ✅ `public.users`

| Columna | Tipo | Comentario |
|---------|------|------------|
| id | text | PK |
| nombre | text | |
| email | text | |
| celular | text | |
| password | text | Hash bcrypt |
| rol | text | DEFAULT 'user' |
| verified | integer | 0/1 |
| verification_token | text | Para verificación por email |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Datos actuales:** 2 usuarios (admin@demo.com, user@demo.com) ✅

---

### ✅ `public.citas`

| Columna | Tipo | Comentario |
|---------|------|------------|
| id | text | PK |
| nombre | text | |
| whatsapp | text | |
| email | text | |
| servicio | text | Curso, Mentoría, Copytrading |
| fecha | text | YYYY-MM-DD |
| hora_inicio | text | HH:mm |
| hora_fin | text | HH:mm |
| modalidad | text | DEFAULT 'Virtual' |
| duracion_minutos | integer | DEFAULT 15 |
| comentarios | text | |
| estado | text | DEFAULT 'Pendiente' |
| created_at | timestamptz | |
| updated_at | timestamptz | |
| created_by_user_id | text | FK a users |

**Datos actuales:** 0 citas (OK para arranque)

**Mapeo API:** El front usa camelCase (`horaInicio`, `horaFin`, `createdAt`). El backend debe devolver/recibir en camelCase o el front adaptar a snake_case.

---

### ✅ `public.schedule`

| Columna | Tipo | Comentario |
|---------|------|------------|
| id | integer | PK (siempre 1 para el horario global) |
| data | jsonb | `{ "0": [], "1": [{start,end}], ..., "6": [] }` |

**Estructura de `data`:** dow 0=Domingo, 1=Lunes, ..., 6=Sábado. Cada día tiene array de rangos `{ start: "09:00", end: "18:00" }`.

**Datos actuales:** 1 fila con Lun–Vie 09:00–18:00, Dom y Sáb vacíos ✅

---

### `neon_auth.users_sync`

Tabla interna de Neon Auth. No tocar.

---

## 2. Tablas opcionales (aún no creadas)

Para el contenido dinámico del landing (planes, testimonios, config):

### `public.planes` (opcional)

```sql
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
```

### `public.testimonios` (opcional)

```sql
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
```

### `public.config` (opcional – config pública)

```sql
CREATE TABLE IF NOT EXISTS public.config (
  clave TEXT PRIMARY KEY,
  valor TEXT,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Datos iniciales
INSERT INTO public.config (clave, valor) VALUES
  ('whatsapp', '573223764397'),
  ('email_contacto', 'contacto@tradingpro.com'),
  ('trustpilot_url', 'https://es.trustpilot.com/review/yotagoprofessional.com')
ON CONFLICT (clave) DO NOTHING;
```

---

## 3. Índices recomendados

```sql
-- Citas: filtros por fecha, estado, email
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON public.citas(fecha);
CREATE INDEX IF NOT EXISTS idx_citas_estado ON public.citas(estado);
CREATE INDEX IF NOT EXISTS idx_citas_email ON public.citas(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_citas_created_by ON public.citas(created_by_user_id);

-- Users: login por email
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON public.users(LOWER(email));
```

---

## 4. Resumen

| Requerido | Estado |
|-----------|--------|
| users | ✅ Existe, con datos demo |
| citas | ✅ Existe, vacía |
| schedule | ✅ Existe, con horario Lun–Vie 9–18 |
| planes | ⚪ Opcional – crear si se quiere landing dinámico |
| testimonios | ⚪ Opcional – crear si se quiere landing dinámico |
| config | ⚪ Opcional – para WhatsApp, email, etc. |
| Índices | ⚪ Recomendados para rendimiento |

**Conclusión:** La base de datos tiene las tablas necesarias para auth, citas y horario. Los usuarios demo ya existen. No falta nada crítico para la integración front–back.
