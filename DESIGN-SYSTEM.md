# YTG School – Sistema de diseño | Identidad visual pastel

Identidad visual para landing de trading: **minimalista, limpia, sobria, premium**. Sensación de calma, confianza y claridad.

---

## 1. Paleta de colores (hex)

| Nombre | Hex | Uso |
|--------|-----|-----|
| **Fondo principal** | `#F8FAFC` | Body, secciones base |
| **Fondo alterno** | `#F1F5F9` | Secciones alternadas, Trustpilot |
| **Card/Superficie** | `#FFFFFF` | Cards, modales, inputs |
| **Bordes/Divisores** | `#E2E8F0` | Bordes, líneas, separadores |
| **Texto principal** | `#0F172A` | Títulos, cuerpo importante |
| **Texto secundario** | `#334155` | Subtítulos, descripciones |
| **Texto tenue** | `#64748B` | Placeholders, texto auxiliar |
| **Primario (pastel azul)** | `#93C5FD` | CTA principal, botón WhatsApp |
| **Primario hover** | `#60A5FA` | Hover botón primario |
| **Primario active** | `#3B82F6` | Estado pressed |
| **Focus ring** | `#BFDBFE` | Outline focus accesible |
| **Acento teal** | `#99F6E4` | Secundario, badges Copytrading |
| **Teal hover** | `#5EEAD4` | Hover acento teal |
| **Lavanda** | `#DDD6FE` | Detalles, badges Mentoría |
| **Lavanda hover** | `#C4B5FD` | Hover lavanda |
| **Éxito** | `#BBF7D0` | Success, checkmarks (texto `#14532D`) |
| **Warning** | `#FDE68A` | Avisos (texto `#854D0E`) |
| **Error** | `#FECACA` | Errores (texto `#7F1D1D`) |
| **Info** | `#DBEAFE` | Info (texto `#1E3A8A`) |

---

## 2. Estilos de componentes

### Botones

```css
/* Primario (CTA WhatsApp, acciones principales) */
.btn-primary, .btn-whatsapp {
  background: #93C5FD;
  color: #0F172A;
  border: none;
}
.btn-primary:hover, .btn-whatsapp:hover {
  background: #60A5FA;
}

/* Secundario / Outline ("Ver programa") */
.btn-outline, .btn-secondary-outline {
  background: transparent;
  color: #1E3A8A;
  border: 2px solid #93C5FD;
}
.btn-outline:hover {
  background: #DBEAFE;
}
```

### Badges (Curso / Mentoría / Copytrading)

```css
.badge-curso   { background: #93C5FD; color: #0F172A; }
.badge-mentoria { background: #DDD6FE; color: #0F172A; }
.badge-copytrading { background: #99F6E4; color: #0F172A; }
```

### Inputs

```css
/* Focus */
.form-input:focus {
  border-color: #93C5FD;
  box-shadow: 0 0 0 3px #BFDBFE;
}

/* Invalid */
.form-input:invalid:not(:placeholder-shown) {
  border-color: #FECACA;
}
```

### Links

```css
a {
  color: #1E3A8A;
}
a:hover {
  color: #1D4ED8;
}
```

---

## 3. Reglas de consistencia

### ✅ Hacer
- Usar siempre colores de la paleta
- Contraste suficiente en texto (#0F172A sobre fondos claros)
- Sombras muy suaves
- Bordes sutiles (#E2E8F0)
- Estados hover discretos

### ❌ Evitar
- Verdes/rojos/amarillos fosforescentes o muy saturados
- Degradados fuertes
- Sombras duras (box-shadow > 0.15 opacidad)
- Amarillo Trustpilot saturado (usar tono pastel)
- Neon en general

---

## 4. Mapeo de secciones

| Sección | Fondo | Cards |
|---------|-------|-------|
| Hero | #F8FAFC | - |
| Redes / Beneficios / Planes / Contacto | #F8FAFC o #FFFFFF | #FFFFFF, borde #E2E8F0 |
| Para quién / Metodología / Copytrading / FAQ | #F1F5F9 | #FFFFFF |
| Trustpilot | #F1F5F9 | #FFFFFF, estrellas pastel |
| Navbar | #FFFFFF o #F8FAFC | borde #E2E8F0 |
| Footer | #0F172A (oscuro) | texto #FFFFFF |
