# Solución Front-End – Profesor de Trading

**⚠️ SOLO FRONT-END** – Sin backend, sin base de datos real, sin autenticación real.  
Uso de mock data y persistencia local (localStorage/sessionStorage).

---

## 1. Arquitectura de pantallas y flujo de navegación

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FLUJO DE NAVEGACIÓN                          │
└─────────────────────────────────────────────────────────────────────┘

     / (index.html)                    /login (login.html)
     Landing Page                            │
     ├─ CTA: Iniciar sesión ───────────────►│
     ├─ CTA: Agendar por WhatsApp           │
     └─ WhatsApp flotante                   │
                                            │ Login exitoso
                    ┌───────────────────────┴───────────────────────┐
                    │                                               │
              admin@demo.com                                   user@demo.com
                    │                                               │
                    ▼                                               ▼
            /admin/citas (admin.html)                    /agenda (agenda.html)
            Panel Admin                                      │
            - Ver/Editar/Eliminar citas                      │ Agendar cita
            - Filtros y búsqueda                             │ Mis citas
            - Métricas                                       └─ CTA WhatsApp
                    │
                    └─ Logout ──────────────────► / (Landing)
```

---

## 2. Wireframes

### A) Landing Page (index.html)
- **Hero**: Título, subtítulo, CTAs → "Iniciar sesión" (principal), "Agendar por WhatsApp" (secundario)
- **Servicios**: Curso / Mentoría / Copytrading
- **Secciones**: Redes, programa, metodología, testimonios, FAQ, contacto
- **Footer**: Logo, contacto, legal, redes, Vantage
- **WhatsApp flotante**: Enlace wa.me
- **Navbar**: Pública con link "Iniciar sesión"

### B) Login (login.html)
- **Card centrada** con fondo dark
- **Campos**: Correo, Contraseña
- **Botón**: "Iniciar sesión"
- **Link**: "Volver al inicio"
- **Credenciales demo** visibles: admin@demo.com / 123456 | user@demo.com / 123456
- **Checkbox**: "Recordar sesión"
- **Errores**: Campos vacíos, credenciales inválidas

### C) Agenda (agenda.html) – Usuario
- **Navbar autenticada**: Logo, "Agenda", "Mis citas", "Cerrar sesión"
- **Formulario**:
  - Nombre, WhatsApp, Email
  - Servicio (Curso | Mentoría | Copytrading)
  - Fecha, Hora (slots 15 min)
  - Comentarios (opcional)
  - Solo lectura: Modalidad Virtual, Duración 15 min, Hora fin (calculada)
- **Lista "Mis citas"**: Cards/lista responsive
- **CTA**: "Contactar por WhatsApp"
- **Empty state**: Si no hay citas

### D) Admin (admin.html)
- **Navbar**: Logo, "Admin", "Cerrar sesión"
- **Métricas**: Total, Pendientes, Confirmadas, Canceladas
- **Tabla/Cards** responsive con búsqueda y filtros
- **Acciones**: Editar (modal), Eliminar (confirmación)
- **Modal edición**: Reprogramar, cambiar estado, mantener 15 min y Virtual

---

## 3. Componentes UI y estados

| Componente | Estados |
|------------|---------|
| **Input** | normal, focus, error, disabled |
| **Select** | normal, focus, error |
| **Botón primario** | default, hover, active |
| **Botón secundario** | default, hover |
| **Botón peligro** | default, hover |
| **Badge estado** | Pendiente, Confirmada, Reprogramada, Cancelada |
| **Card cita** | default, hover |
| **Modal** | abierto, cerrado |
| **Toast** | éxito, error, info |
| **Empty state** | sin datos |

---

## 4. Estructura de datos mock

### Usuarios
```js
[
  { id: 1, nombre: "Admin", email: "admin@demo.com", password: "123456", rol: "admin" },
  { id: 2, nombre: "Usuario", email: "user@demo.com", password: "123456", rol: "user" }
]
```

### Cita
```js
{
  id: "uuid",
  nombre: "string",
  whatsapp: "string",
  email: "string",
  servicio: "Curso" | "Mentoría" | "Copytrading",
  fecha: "YYYY-MM-DD",
  horaInicio: "HH:mm",
  horaFin: "HH:mm",
  modalidad: "Virtual",
  duracionMinutos: 15,
  comentarios: "string",
  estado: "Pendiente" | "Confirmada" | "Reprogramada" | "Cancelada",
  createdAt: "ISO",
  updatedAt: "ISO",
  createdByUserId: "number"
}
```

### Sesión (sessionStorage)
```js
{
  isAuthenticated: true,
  rol: "admin" | "user",
  usuario: { nombre, email },
  timestamp: number
}
```

---

## 5. Rutas protegidas y sesión

| Ruta | Protección |
|------|------------|
| / | Pública |
| /login | Pública (si ya hay sesión → redirigir según rol) |
| /agenda | Requiere sesión. Solo user. Si admin → /admin/citas |
| /admin/citas | Requiere sesión. Solo admin. Si user → /agenda |

**Flujo**: Cada página protegida ejecuta `checkAuth()` al cargar. Si no hay sesión → redirect a login. Si rol incorrecto → redirect + toast.

---

## 6. Lógica de slots de 15 minutos

- **Generación**: 08:00–18:00 en intervalos de 15 min (08:00, 08:15, 08:30, …).
- **Cálculo hora fin**: `horaFin = horaInicio + 15 min`.
- **Disponibilidad**: Obtener citas existentes para la fecha seleccionada; slots ocupados se deshabilitan.
- **Validación**: No duplicados, no solapamientos, no fecha/hora pasada.

---

## 7. Versión móvil

| Elemento | Desktop | Móvil |
|----------|---------|-------|
| Admin tabla | Tabla completa | Cards apiladas |
| Mis citas | Lista/tabla | Cards |
| Formulario | 1–2 columnas | 1 columna |
| Navbar | Horizontal | Hamburger |
| Modal edición | Panel lateral opcional | Full screen / modal |

---

## 8. Archivos del proyecto

```
Front/
├── index.html          # Landing (CTAs actualizados)
├── login.html          # Login
├── agenda.html         # Agenda usuario
├── admin.html          # Panel admin
├── styles.css          # Estilos globales
├── app.css             # Estilos específicos app (login, agenda, admin)
├── script.js           # Landing (menú, FAQ, etc.)
├── auth.js             # Auth mock, sesión, protección
├── citas.js            # CRUD citas, slots, localStorage
├── app.js              # Router, componentes (toast, modal)
├── SOLUCION.md         # Este documento
└── assets/
```
