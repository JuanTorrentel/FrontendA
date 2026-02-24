# Sistema de Agendamiento tipo Calendly - Wireframes y Flujos

> **SOLO FRONT-END** · localStorage/sessionStorage · Sin APIs reales

---

## 1. Vista Usuario – Agendamiento (calendario + slots)

### DESKTOP (2 columnas)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Selecciona fecha y hora                                                 │
│  Citas virtuales de 15 minutos según disponibilidad.                      │
├────────────────────────────┬────────────────────────────────────────────┤
│  [<]  Febrero 2025  [>]     │  Martes, 17 de febrero                     │
│  Lun Mar Mié Jue Vie Sáb Dom│                                            │
│   1   2   3   4   5   6   7 │  ┌──────────────────────────────────────┐ │
│   8   9 [10] 11  12  13  14 │  │  09:00   (disponible)                 │ │
│  15  16  17  18  19  20  21 │  │  09:15   (disponible)                 │ │
│  22  23  24  25  26  27  28 │  │  09:30   (ocupado)                    │ │
│                            │  │  09:45   (disponible) ← seleccionado   │ │
│  Zona horaria:             │  │  10:00   (disponible)                 │ │
│  [Peru Time (PET)    ▼]    │  │  ...                                   │ │
│                            │  └──────────────────────────────────────┘ │
│                            │                                            │
│                            │  ┌─ Resumen de la cita ──────────────────┐ │
│                            │  │ Fecha: Martes, 17 de febrero          │ │
│                            │  │ Hora: 09:45 - 10:00 · Virtual · 15 min│ │
│                            │  │ [Nombre] [WhatsApp] [Email] [Servicio] │ │
│                            │  │ [Confirmar cita] [Elegir otro horario] │ │
│                            │  └───────────────────────────────────────┘ │
└────────────────────────────┴────────────────────────────────────────────┘
```

### MÓVIL (apilado)

```
┌─────────────────────────────┐
│  [<] Febrero 2025 [>]       │
│  Lun Mar Mié Jue Vie Sáb Dom│
│  (calendario)               │
├─────────────────────────────┤
│  Zona horaria: [Peru ▼]     │
├─────────────────────────────┤
│  Martes, 17 de febrero      │
│  [09:00] [09:15] [09:30]... │
│  (lista táctil, scroll)      │
├─────────────────────────────┤
│  Resumen + formulario       │
│  [Confirmar cita]           │
└─────────────────────────────┘
```

---

## 2. Vista Admin

### Modo Tabla

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Total: 5  │  Pendientes: 2  │  Confirmadas: 2  │  Canceladas: 1  │ Ocup: 3/40 │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Buscar...] [Estado ▼] [Servicio ▼] [Fecha] [Limpiar]                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ Nombre   │ Contacto  │ Servicio │ Fecha      │ Hora      │ Estado │ Modalidad│
│ Juan P.  │ +57 300.. │ Curso    │ 2025-02-12 │ 10:00-10:15│ Pend. │ Virtual  │
│ María G. │ +57 310.. │ Mentoría │ 2025-02-12 │ 11:00-11:15│ Confirm│ Virtual │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Modo Agenda del día (slots)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [2025-02-12] [Cargar día]                                              │
│  Ocupación: ████████░░░░░░░░░░░░ 3/40 (7.5%)                            │
├─────────────────────────────────────────────────────────────────────────┤
│  08:00  Libre                                                             │
│  08:15  Libre                                                             │
│  ...                                                                      │
│  10:00  Juan Pérez · Curso        [Pendiente]  ← clic abre detalle       │
│  10:15  Libre                                                             │
│  11:00  María González · Mentoría [Confirmada]                            │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Estados visuales

### Slots (disponibilidad)
| Estado       | Estilo                                                |
|-------------|--------------------------------------------------------|
| Disponible  | Borde gris, hover cian, clickeable                     |
| Seleccionado| Fondo cian (#178DAC), texto claro                      |
| Ocupado     | No se muestra en lista usuario (solo en admin)         |
| Pasado      | No se muestra (filtrado para hoy)                     |
| No disponible | Día en calendario con opacidad reducida              |

### Citas (badges)
| Estado      | Clase CSS        | Color                            |
|-------------|------------------|----------------------------------|
| Pendiente   | badge-pendiente  | Púrpura / warning                |
| Confirmada  | badge-confirmada | Cian / primary                   |
| Reprogramada| badge-reprogramada| Lavanda                         |
| Cancelada   | badge-cancelada  | Rojo / error                     |

---

## 4. Flujo UX

### Usuario
1. Entra a `agenda.html` (requiere login)
2. Ve calendario + hint "Selecciona una fecha"
3. Clic en día → se muestra lista de slots del día
4. Clic en slot → aparece resumen + formulario (nombre, WhatsApp, email, servicio)
5. Completa datos y confirma → toast "Cita agendada correctamente"
6. Cita aparece en "Mis citas" (Reprogramar / Cancelar)

### Admin
1. Entra a `admin.html` (requiere rol admin)
2. Configura disponibilidad por fecha (Horarios de disponibilidad)
3. Ve métricas (Total, Pendientes, Confirmadas, Canceladas, Ocupación del día)
4. Modo Tabla: buscar, filtrar, editar, eliminar
5. Modo Agenda: selector de fecha, timeline de slots, clic en ocupado → editar

---

## 5. Lógica front-end (citas.js)

- `generateSlots()`: slots 15 min, 8:00–18:00
- `getEstadoSlotsParaFecha(fecha)`: `{ disponibles, ocupados, todos }`
- `getSlotsDisponiblesParaFecha(fecha)`: según `ytg_availability` (admin)
- `isSlotOcupado()` / `isSlotDisponible()`: evita solapamientos
- `add15Minutes(hora)`: horaFin = horaInicio + 15
- Validación: no pasado, no duplicado, no solapado

---

## 6. Responsive

- **Desktop (>900px)**: 2 columnas (340px calendario | flex slots)
- **Móvil**: 1 columna, calendario arriba, slots debajo
- Admin tabla → cards en móvil (<768px)
- Slots: botones grandes, táctiles

---

## 7. Archivos

| Archivo           | Rol                                      |
|-------------------|------------------------------------------|
| `agenda.html`     | Vista usuario Calendly-style             |
| `agenda-calendar.js` | Lógica calendario + slots + resumen   |
| `admin.html`      | Vista admin (tabla + agenda día)         |
| `citas.js`        | CRUD, slots, disponibilidad               |
| `app.css`         | Estilos scheduler, badges                |
