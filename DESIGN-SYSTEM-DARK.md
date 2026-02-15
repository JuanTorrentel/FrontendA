# YTG School – Sistema de diseño DARK | Identidad visual premium

Tema **DARK** tipo Platzi: fondo oscuro, tipografía clara, alto contraste. Paleta magenta/púrpura/cian + tonos rosados y neutros.

---

## 1. Tokens de color (nombre → HEX → uso exacto)

| Token | HEX | Uso |
|-------|-----|-----|
| `--color-bg` | #0B0F14 | Fondo principal (body, hero) |
| `--color-bg-alt` | #0F172A | Fondos alternos (secciones) |
| `--color-bg-card` | #111827 | Cards, superficies |
| `--color-bg-elevated` | #161E2E | Superficies elevadas |
| `--color-border` | #243044 | Bordes, divisores |
| `--color-text` | #ECDED8 | Texto principal |
| `--color-text-secondary` | #B8B0A8 | Texto secundario |
| `--color-text-muted` | #5B6C7D | Placeholders, texto tenue |
| `--color-text-inverted` | #0B0F14 | Texto sobre acentos |
| `--color-primary` | #178DAC | CTA principal, cian |
| `--color-primary-hover` | #1472AF | Hover primario |
| `--color-primary-active` | #1B435B | Active primario |
| `--color-primary-focus` | #B073A8 | Focus ring (glow suave) |
| `--color-accent` | #DA2C91 | Acento magenta (Copytrading) |
| `--color-accent-hover` | #C71B82 | Hover magenta |
| `--color-accent-active` | #6A2730 | Active magenta |
| `--color-link` | #1472AF | Links normal |
| `--color-link-hover` | #178DAC | Links hover |
| `--color-purple` | #57538D | Púrpura apoyo |
| `--color-lavender` | #B073A8 | Tags, lavanda |
| `--color-rose` | #E9C0BF | Estrellas, fondos sutiles |
| `--color-wine` | #6A2730 | Vino oscuro profundidad |

---

## 2. Estilos de componentes

### Botón primario (Agendar / Empezar)
```css
background: #178DAC;
color: #ECDED8;
hover: #1472AF;
active: #1B435B;
focus: ring 2px #B073A8 con opacidad 0.4;
```

### Botón secundario (outline)
```css
background: transparent;
border: 1px solid #178DAC;
color: #178DAC;
hover: background #1B435B (leve), border #1472AF;
```

### Botón acento (Copytrading)
```css
background: #DA2C91;
color: #ECDED8;
hover: #C71B82;
active: #6A2730;
```

### Link
```css
color: #1472AF;
hover: #178DAC, text-decoration underline sutil;
```

### Card
```css
background: #111827;
border: 1px solid #243044;
box-shadow: 0 2px 8px rgba(0,0,0,0.2);
```

### Input
```css
background: #0F172A;
border: 1px solid #243044;
color: #ECDED8;
focus: border #178DAC, box-shadow 0 0 0 2px rgba(23,141,172,0.2);
error: border #DA2C91, texto ayuda #E9C0BF;
```

### Badge
- Neutro: bg #161E2E, texto #ECDED8, borde #243044
- Cian: bg #1B435B, texto #ECDED8, borde #178DAC
- Magenta: bg #6A2730, texto #ECDED8, borde #DA2C91
- Lavanda: bg #57538D, texto #ECDED8

---

## 3. Reglas de consistencia (qué NO hacer)

- **No** usar colores neón o saturados al máximo
- **No** aplicar estética "gamer" (glow excesivo, colores fluo)
- **No** usar amarillo puro para estrellas (usar #E9C0BF o #ECDED8)
- **No** degradados fuertes; mantener bruma/overlay sutil
- **No** sombras duras; preferir sombras suaves (0.15–0.25 opacidad)
- **Sí** mantener contraste alto (texto legible siempre)
- **Sí** bordes sutiles #243044
- **Sí** hero con gradientes suaves (magenta→lavanda→púrpura / cian→azul→profundo)
