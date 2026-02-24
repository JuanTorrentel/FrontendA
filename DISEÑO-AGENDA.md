# Diseño UI/UX – Agendamiento de citas

**Plataforma solo front-end** | Citas virtuales de 15 min | Slots de 15 en 15 min

---

## 1. Vista usuario – agendamiento y disponibilidad

### A. Qué debe ver el usuario (UI)

```
┌─────────────────────────────────────────────────────────────────┐
│ Agendar cita                                                     │
├─────────────────────────────────────────────────────────────────┤
│ Resumen fijo (badge/chip): Modalidad Virtual · Duración 15 min   │
├─────────────────────────────────────────────────────────────────┤
│ Servicio:    [Curso ▼] [Mentoría] [Copytrading]                  │
│ Fecha:       [Selector fecha]                                    │
│ Nombre:      [_______________]                                    │
│ WhatsApp:    [_______________]                                    │
│ Email:       [_______________]                                  │
│ Comentarios: [_______________] (opcional)                         │
├─────────────────────────────────────────────────────────────────┤
│ HORARIOS DEL DÍA                                                 │
│ ┌─────────────────────┬─────────────────────┐                   │
│ │ Disponibles         │ Ocupados            │                   │
│ │ [09:00] [09:15] ... │ 10:00  10:15  ...   │                   │
│ └─────────────────────┴─────────────────────┘                   │
│ Hora fin (calculada): 09:15 → 09:30                             │
├─────────────────────────────────────────────────────────────────┤
│ [        Confirmar cita        ]                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Mis citas                                                        │
├─────────────────────────────────────────────────────────────────┤
│ [Card 1] Curso · 15 Feb · 09:00-09:15 · Virtual · Confirmada    │
│         [Reprogramar] [Cancelar]                                  │
│ [Card 2] Mentoría · 16 Feb · 14:00-14:15 · Virtual · Pendiente   │
└─────────────────────────────────────────────────────────────────┘
```

### B. Estados visuales de slots (OBLIGATORIO)

| Estado      | Color / estilo              | Icono/badge   | Interacción                    |
|------------|-----------------------------|---------------|--------------------------------|
| **Disponible** | Verde/cían, borde claro  | —             | Click → seleccionar            |
| **Ocupado**    | Gris, opacidad 0.6       | 🔒 o tachado  | No clickeable                  |
| **Pasado**     | Gris más tenue, tachado  | ⏱             | No clickeable                  |
| **Seleccionado** | Fondo acento, borde fuerte | ✓           | Muestra hora fin               |
| **No disp. (admin)** | Gris oscuro             | —             | Solo lectura                   |

**Estilo recomendado (tema dark):**
- Disponible: `background: rgba(23, 141, 172, 0.25)`, `border: 1px solid #178DAC`
- Ocupado: `background: rgba(91, 108, 125, 0.2)`, `opacity: 0.7`, `cursor: not-allowed`
- Pasado: `background: rgba(59, 60, 65, 0.3)`, `text-decoration: line-through`
- Seleccionado: `background: #178DAC`, `color: #ECDED8`

### C. Forma de visualización recomendada: vista por día

**Elegida: Vista por día con columnas Disponibles / Ocupados**

| Opción            | Ventaja                              | Desventaja                       |
|-------------------|--------------------------------------|----------------------------------|
| **Por día** ✓     | Clara, pocos clics, foco en 1 día   | Hay que cambiar de día manualmente |
| Bloques mañana/tarde | Agrupa visualmente                | Más compleja para 15 min         |
| Semanal           | Visión global                        | Mucha info, poco espacio         |

Para slots de 15 min, la vista por día es la mejor porque:
- La mayoría de citas son 1–2 por día
- Permite ver muchas opciones sin scroll excesivo
- La separación Disponibles / Ocupados reduce errores

### D. “Mis citas” (usuario)

**Estructura por card (responsive):**

```
┌────────────────────────────────────────────────────┐
│ Curso                              [Confirmada]    │
│ 15 Feb 2025 · 09:00 - 09:15 · Virtual              │
│                                                    │
│ [Reprogramar]  [Cancelar]                          │
└────────────────────────────────────────────────────┘
```

**Campos por card:**
- Servicio
- Fecha (DD MMM YYYY)
- Hora inicio – hora fin
- Modalidad (Virtual)
- Estado (badge)
- Acciones: Reprogramar, Cancelar

**Comportamiento:**
- Click en Reprogramar → modal/panel con selector de fecha y slots
- Click en Cancelar → modal de confirmación
- Respeta 15 min y modalidad virtual
- Sin solapamientos al reprogramar

### E. Feedback de agendamiento

| Situación                        | Mensaje / acción                          | Tipo    |
|----------------------------------|-------------------------------------------|---------|
| Fecha sin disponibilidad         | “No hay horarios disponibles ese día.”    | Toast   |
| Slot ocupado seleccionado        | No permitir click                        | —       |
| Cita creada bien                 | “Cita agendada correctamente.”           | Toast   |
| Reagenda exitoso                 | “Cita reprogramada.”                     | Toast   |
| Cancelación exitosa              | “Cita cancelada.”                        | Toast   |
| Fecha/hora pasada                | “No puedes agendar en el pasado.”        | Toast   |
| Campos incompletos               | “Completa todos los campos obligatorios.”| Inline  |

---

## 2. Vista admin – gestión y monitoreo

### A. Qué debe ver el admin (UI)

```
┌─────────────────────────────────────────────────────────────────┐
│ Panel de administración de citas                                 │
├─────────────────────────────────────────────────────────────────┤
│ HORARIOS DE DISPONIBILIDAD                                      │
│ Fecha [____] [Cargar] [Guardar]   [Grid slots toggle]            │
├─────────────────────────────────────────────────────────────────┤
│ MÉTRICAS                                                         │
│ [Total: 24] [Pendientes: 8] [Confirmadas: 12] [Canceladas: 4]   │
├─────────────────────────────────────────────────────────────────┤
│ FILTROS                                                          │
│ [Buscar...] [Estado ▼] [Servicio ▼] [Fecha] [Limpiar]           │
├─────────────────────────────────────────────────────────────────┤
│ VISTA: [Tabla] [Agenda día]                                      │
└─────────────────────────────────────────────────────────────────┘
```

### B. Dos vistas principales

#### 1. Vista tabla (gestión)

- **Uso:** buscar, filtrar, ordenar, editar varias citas
- **Columnas:** Nombre | Contacto (WhatsApp/Email) | Servicio | Fecha | Hora inicio | Hora fin | Estado | Acciones

| Nombre       | Contacto     | Servicio    | Fecha   | Hora   | Estado    | Acciones   |
|--------------|--------------|-------------|---------|-------|-----------|------------|
| Juan Pérez   | +57 300...   | Curso       | 15 Feb  | 09:00  | Confirmada | [Ver][Editar][Eliminar] |
| María López  | maria@...    | Mentoría    | 15 Feb  | 09:15  | Pendiente  | [Ver][Editar][Eliminar] |

- **Responsive:** en móvil, reemplazar por cards con la misma info.

#### 2. Vista agenda por día (operativa)

- **Uso:** ver ocupación del día y gestionar citas por horario
- **Estructura:** lista temporal de slots (08:00, 08:15, … 17:45)
- **Por slot:**
  - Libre: fondo neutro, permite crear cita
  - Ocupado (Pendiente): naranja/amarillo
  - Ocupado (Confirmada): verde/cían
  - Ocupado (Reprogramada): azul
  - Cancelada: tachado / badge “Cancelada”

- **Interacción:**
  - Click en slot ocupado → ver/editar cita
  - Click en slot libre → crear cita manual (opcional)

### C. Indicadores de ocupación

- **Barra por día:** slots ocupados / total configurados
- Ejemplo: `12/32 slots ocupados` o barra de progreso
- Colores: libre (verde suave), ocupado (cían/azul)

```
15 Feb · Ocupación: ████████░░░░░░░░ 12/40 (30%)
```

### D. Acciones admin sobre citas

| Acción         | Dónde                  | Validación                         |
|----------------|------------------------|------------------------------------|
| Editar         | Modal/panel lateral    | Revalidar slot disponible          |
| Reprogramar    | Modal con fecha/hora   | No solapamientos, slot libre      |
| Cambiar estado | Select en modal        | —                                  |
| Eliminar       | Modal confirmación     | Confirmación obligatoria           |

### E. Detalle de cita (modal)

```
┌────────────────────────────────────────┐
│ Detalle de cita                    [×] │
├────────────────────────────────────────┤
│ Juan Pérez                             │
│ WhatsApp: +57 300 111 2233             │
│ Email: juan@ejemplo.com                │
│ Servicio: Curso                        │
│ Fecha: 15 Feb 2025                     │
│ Hora: 09:00 - 09:15                    │
│ Estado: [Confirmada ▼]                 │
│ Modalidad: Virtual                     │
│ Comentarios: Primera clase             │
│                                        │
│ Creada: 10 Feb 10:30                   │
│ Última actualización: 12 Feb 14:00     │
│                                        │
│ [Guardar]  [Cancelar]  [Eliminar]     │
└────────────────────────────────────────┘
```

---

## 3. Reglas visuales y estados

### A. Estados de disponibilidad (slots)

| Estado      | Color              | Contraste |
|------------|--------------------|-----------|
| Disponible | #178DAC (cian)     | ≥ 4.5:1   |
| Ocupado    | #5B6C7D (gris)     | ≥ 4.5:1   |
| Pasado     | #3B3C41 (gris)     | ≥ 3:1     |
| Seleccionado | #178DAC (fondo)  | ≥ 4.5:1   |
| No disp.   | #243044 (borde)    | ≥ 3:1     |

### B. Estados de cita (badges)

| Estado       | Color fondo        | Texto   |
|--------------|-------------------|---------|
| Pendiente    | #57538D (púrpura) | #E9C0BF |
| Confirmada   | #178DAC (cian)    | #ECDED8 |
| Reprogramada | #B073A8 (lavanda) | #ECDED8 |
| Cancelada    | #6A2730 (vino)    | #E9C0BF |

### C. Prioridad de la información

**Usuario:**
1. Selector de fecha
2. Slots disponibles
3. CTA “Confirmar cita”
4. Mis citas (resumen)

**Admin:**
1. Filtros y búsqueda
2. Estado de las citas
3. Posibles conflictos de horario
4. Acciones (editar, reprogramar, eliminar)

---

## 4. Validaciones y mensajes

| Caso                    | Mensaje                                              |
|-------------------------|------------------------------------------------------|
| Slot ocupado            | “Este horario ya no está disponible. Elige otro.”    |
| Solapamiento            | “Ya hay una cita en ese horario.”                    |
| Fecha/hora pasada       | “No puedes agendar en el pasado.”                   |
| Campos obligatorios     | “Completa todos los campos obligatorios.”           |
| Reprogramar inválido    | “El nuevo horario no está disponible.”              |
| Sin disponibilidad      | “No hay disponibilidad para esta fecha.”            |
| Bloque 15 min           | “Las citas son de 15 minutos.”                      |

---

## 5. Versión móvil

### Usuario

- Selector de fecha grande, fácil de tocar
- Slots en grid de botones anchos (≥ 44px)
- “Mis citas” en cards apiladas
- CTA “Confirmar cita” sticky al final

### Admin

- Tabla → cards con misma info
- Filtros en drawer o bottom sheet
- Vista agenda día en lista vertical
- Acciones en menú (⋮) o swipe

---

## 6. Uso de la estructura de datos

| Campo         | Usuario        | Admin         |
|---------------|----------------|---------------|
| servicio      | Card, badge    | Tabla, filtro |
| fecha         | Card, selector | Tabla, filtro |
| horaInicio/fin| Card           | Tabla         |
| estado        | Badge          | Badge, filtro |
| modalidad     | “Virtual”      | Columna       |
| nombre/email/wa | Formulario  | Detalle, tabla|
| comentarios   | Formulario     | Modal detalle |
| createdAt     | —              | Historial     |
| updatedAt     | —              | Historial     |

---

## 7. Recomendaciones para un diseño profesional

1. **Consistencia:** mismo sistema de badges, colores y espaciado
2. **Feedback inmediato:** loading, toast, mensajes claros
3. **Confirmación:** para eliminar y cancelar
4. **Estados vacíos:** mensajes y CTAs en “sin citas” y “sin resultados”
5. **Accesibilidad:** focus visible, labels, contraste
6. **Responsive:** siempre probar en móvil
7. **Solo front-end:** simular todo con localStorage, sin APIs externas
