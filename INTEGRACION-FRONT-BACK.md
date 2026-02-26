# Integración Frontend – Backend – Yotago School

**Fecha de análisis:** Febrero 2026  
**Objetivo:** Identificar datos hardcodeados, conectar el front al back y definir lo que falta.

---

## 1. Estado actual del backend

| Elemento | Estado |
|----------|--------|
| Carpeta `back/` | Existe con `node_modules`, `.env` |
| Dependencias (express, pg, bcryptjs, jsonwebtoken, cors, dotenv) | Instaladas en `back/node_modules` |
| **server.js / API** | **NO EXISTE** – no hay rutas ni endpoints implementados |
| Base de datos | **PostgreSQL (Neon)** – ver `back/DB-SCHEMA-REVIEW.md` |

**Base de datos:** Ya existen las tablas `users`, `citas`, `schedule` con datos de demo (admin@demo.com, user@demo.com, horario Lun–Vie 9–18). No falta nada crítico. Tablas opcionales (planes, testimonios, config) en `back/schema-opcional.sql`.

---

## 2. Datos hardcodeados en el frontend que deben consumirse del backend

### 2.1 Autenticación (`auth.js`)

| Dato | Ubicación | Valor actual | Acción |
|------|-----------|--------------|--------|
| Usuarios demo | `MOCK_USERS` (L10-13) | admin@demo.com / 123456, user@demo.com / 123456 | Sustituir por `POST /api/auth/login` |
| Usuarios registrados | `localStorage` `ytg_users` | Array de usuarios | Sustituir por backend |
| Sesión | `sessionStorage` `ytg_session` | Objeto sesión local | Usar JWT del backend |

### 2.2 Citas (`citas.js`)

| Dato | Ubicación | Valor actual | Acción |
|------|-----------|--------------|--------|
| Citas | `localStorage` `ytg_citas` | Array de citas | `GET /api/citas` |
| Horario semanal | `localStorage` `ytg_schedule` | Objeto con rangos por día | `GET /api/schedule` |
| Citas demo (seed) | `seedCitas()` (L183-286) | 5 citas ficticias | Eliminar; datos desde backend |
| SERVICIOS | Constante (L13) | Curso, Mentoría, Copytrading | Opcional: `GET /api/config/servicios` |
| ESTADOS | Constante (L14) | Pendiente, Confirmada, etc. | Opcional: `GET /api/config/estados` |
| HOUR_START, HOUR_END | Constantes (L15-16) | 8, 18 | Mover a config backend o mantener |

### 2.3 Landing (`index.html`)

| Dato | Ubicación | Valor actual | Prioridad |
|------|-----------|--------------|-----------|
| **Planes** | Sección planes (L332-396) | Básico $75, Pro $350, VIP $550 | Media – `GET /api/planes` |
| **Testimonios** | Sección testimonios (L539-603) | 3 cards hardcodeadas (dolly, Piero, Tony) | Media – `GET /api/testimonios` |
| Trustpilot | Widget + enlaces | yotagoprofessional.com | Mantener (widget externo) |
| Email contacto | Footer (L730) | contacto@tradingpro.com | Config – `GET /api/config` o .env |
| WhatsApp | Múltiples enlaces | 573223764397 | Config – variable de entorno |

### 2.4 Formulario de contacto (landing)

No existe formulario de contacto con submit en el front actual.  
El README menciona campos (Nombre, WhatsApp, Correo, Nivel, Objetivo, Interés). Si se implementa:

- Enviar a `POST /api/contacto` o redirigir a WhatsApp (ya implementado como alternativa).

### 2.5 Otras constantes fijas

| Archivo | Dato | Valor |
|---------|------|-------|
| `citas.js` | `MODALIDAD` | 'Virtual' |
| `citas.js` | `DURATION_MINUTES` | 15 |
| `agenda-calendar.js` (L229) | Servicio por defecto | 'Mentoría' |
| `agenda.html`, `index.html` | Enlaces WhatsApp | 573223764397 |

---

## 3. Endpoints que el backend debe implementar

### 3.1 Autenticación (prioridad alta)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registro + envío de email verificación |
| POST | `/api/auth/login` | Login, devuelve JWT |
| GET  | `/api/auth/verify?token=XXX` | Verificación de cuenta por token |
| GET  | `/api/auth/me` | Usuario actual (header `Authorization: Bearer <token>`) |

### 3.2 Citas (prioridad alta)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET  | `/api/citas` | Listar citas (admin: todas; user: solo las propias) |
| GET  | `/api/citas/slots?fecha=YYYY-MM-DD` | Slots disponibles para una fecha |
| POST | `/api/citas` | Crear cita |
| PUT  | `/api/citas/:id` | Actualizar cita (admin) |
| DELETE | `/api/citas/:id` | Eliminar/cancelar cita |

### 3.3 Horario (prioridad alta)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET  | `/api/schedule` | Horario semanal (dow 0–6 con rangos start/end) |
| PUT  | `/api/schedule` | Actualizar horario (solo admin) |

### 3.4 Contenido landing (prioridad media/baja)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET  | `/api/planes` | Planes (nombre, precio, características) |
| GET  | `/api/testimonios` | Testimonios (nombre, ubicación, texto, estrellas, fecha) |
| GET  | `/api/config` | Config pública (email contacto, WhatsApp, etc.) |

---

## 4. Esquemas de datos sugeridos

### Usuario
```json
{
  "id": "uuid",
  "nombre": "string",
  "email": "string",
  "celular": "string",
  "rol": "admin | user",
  "verified": boolean,
  "createdAt": "ISO"
}
```

### Cita
```json
{
  "id": "uuid",
  "nombre": "string",
  "whatsapp": "string",
  "email": "string",
  "servicio": "Curso | Mentoría | Copytrading",
  "fecha": "YYYY-MM-DD",
  "horaInicio": "HH:mm",
  "horaFin": "HH:mm",
  "modalidad": "Virtual",
  "duracionMinutos": 15,
  "comentarios": "string",
  "estado": "Pendiente | Confirmada | Reprogramada | Cancelada",
  "createdAt": "ISO",
  "updatedAt": "ISO",
  "createdByUserId": "uuid"
}
```

### Schedule
```json
{
  "0": [{ "start": "09:00", "end": "18:00" }],
  "1": [{ "start": "09:00", "end": "18:00" }],
  "2": [],
  "3": [],
  "4": [],
  "5": [],
  "6": []
}
```
(dow: 0=Domingo, 1=Lunes, ..., 6=Sábado)

---

## 5. Cambios necesarios en el frontend

### 5.1 Crear módulo API (`api.js`)

- Base URL configurable (ej. `http://localhost:3000/api` o variable de entorno).
- Función para obtener token desde `sessionStorage` / `localStorage`.
- Wrapper de `fetch` con headers `Authorization: Bearer <token>` y manejo de errores.
- Funciones: `apiLogin`, `apiRegister`, `apiVerify`, `apiGetCitas`, `apiCrearCita`, `apiActualizarCita`, `apiEliminarCita`, `apiGetSlots`, `apiGetSchedule`, `apiPutSchedule`.

### 5.2 Modificar `auth.js`

- Reemplazar `login()` por llamada a `POST /api/auth/login`.
- Reemplazar `register()` por llamada a `POST /api/auth/register`.
- Reemplazar `verifyToken()` por llamada a `GET /api/auth/verify?token=...`.
- Guardar JWT en `sessionStorage` (o `localStorage` si "Recordar sesión").
- `getSession()` debe validar/decodificar JWT o llamar a `GET /api/auth/me`.

### 5.3 Modificar `citas.js`

- `getCitas()` → `GET /api/citas`.
- `crearCita()` → `POST /api/citas`.
- `actualizarCita()` → `PUT /api/citas/:id`.
- `eliminarCita()` → `DELETE /api/citas/:id`.
- `getSchedule()` → `GET /api/schedule`.
- `setSchedule()` → `PUT /api/schedule`.
- `getEstadoSlotsParaFecha()` / slots → `GET /api/citas/slots?fecha=...`.
- Eliminar o desactivar `seedCitas()`.

### 5.4 Modificar `admin.html` y `agenda-calendar.js`

- Usar las nuevas funciones de `citas.js` que llaman al API.
- Manejar estados de carga y errores (toast, spinners).

### 5.5 Landing (opcional)

- Cargar planes desde `GET /api/planes` si existe.
- Cargar testimonios desde `GET /api/testimonios` si existe.
- Cargar WhatsApp y email desde `GET /api/config` si existe.

### 5.6 Configuración

- Crear archivo `config.js` o usar variables en HTML con valores por defecto:
  - `API_BASE_URL`
  - `WHATSAPP_NUMBER` (ej. 573223764397)
  - `CONTACT_EMAIL` (ej. contacto@tradingpro.com)

---

## 6. Checklist de implementación

### Backend

- [ ] Crear `server.js` con Express
- [ ] Configurar CORS para el dominio del front
- [ ] Definir conexión a base de datos (PostgreSQL con `pg` o SQLite con `better-sqlite3` según `yotago.db`)
- [ ] Crear tablas: `users`, `citas`, `schedule` (o equivalente)
- [ ] Rutas de auth (register, login, verify, me)
- [ ] Rutas de citas (CRUD + slots)
- [ ] Rutas de schedule (GET, PUT)
- [ ] Middleware de autenticación JWT
- [ ] (Opcional) Rutas planes, testimonios, config

### Frontend

- [ ] Crear `api.js` con funciones de llamada al API
- [ ] Crear `config.js` con API_BASE_URL y variables de contacto
- [ ] Modificar `auth.js` para usar API
- [ ] Modificar `citas.js` para usar API
- [ ] Actualizar `admin.html` y `agenda-calendar.js` para manejar async/errores
- [ ] Eliminar `seedCitas()` o condicionar a entorno demo
- [ ] (Opcional) Cargar planes y testimonios dinámicamente

### Configuración y deploy

- [ ] Variables de entorno en backend (.env): `PORT`, `JWT_SECRET`, `DB_URL`, etc.
- [ ] Variables en frontend para API_BASE_URL según entorno (dev/prod)
- [ ] Probar flujo completo: registro → verificación → login → agendar → admin CRUD

---

## 7. URLs y datos configurables (no críticos para API)

Estos pueden quedarse en el front o moverse a config/backend:

| Dato | Ubicación actual | Recomendación |
|------|------------------|---------------|
| WhatsApp 573223764397 | index.html, agenda.html | Variable `WHATSAPP_NUMBER` |
| Email contacto@tradingpro.com | index.html footer | Variable `CONTACT_EMAIL` |
| Trustpilot yotagoprofessional.com | index.html | Mantener; es widget externo |
| Vantage affili=NzM2ODU0Ng== | index.html | Mantener si es correcto |

---

*Documento generado a partir del análisis del frontend (FrontendA) y la carpeta back/.*
