# Landing Page Profesional - Trading

Landing page moderna, minimalista y premium para un profesor de trading que ofrece formación, mentoría y copytrading.

## 🎨 Características

- **Diseño Premium**: Estilo sobrio e institucional, sin "vendehumo"
- **Paleta de Colores**: Fondos claros + acento azul/verde + texto oscuro
- **Tipografía Moderna**: Inter y Poppins de Google Fonts
- **Totalmente Responsive**: Optimizado para móvil, tablet y desktop
- **Secciones Completas**: Todas las secciones solicitadas implementadas
- **Disclaimers Visibles**: Advertencias sobre riesgos en puntos clave

## 📁 Estructura de Archivos

```
.
├── index.html          # Landing page
├── login.html          # Login (sesión simulada)
├── agenda.html         # Agendamiento de citas (usuario)
├── admin.html          # Panel admin citas (CRUD)
├── styles.css          # Estilos globales
├── app.css             # Estilos login, agenda, admin
├── script.js           # JavaScript landing
├── auth.js             # Auth mock, sesión
├── citas.js            # CRUD citas, slots 15 min
├── app.js              # Toast, modal, utilidades
├── SOLUCION.md         # Arquitectura y documentación
└── README.md           # Este archivo
```

### ⚠️ Módulo de citas (SOLO FRONT-END)

- **Login**: admin@demo.com / 123456 → Panel admin | user@demo.com / 123456 → Agenda
- **Agenda**: Citas virtuales de 15 min, sin solapamientos
- **Admin**: CRUD, filtros, métricas
- **Persistencia**: localStorage (citas), sessionStorage (sesión)

## 🎯 Secciones Implementadas

### 1. Header Fijo
- Logo + menú de navegación
- CTAs: "Agendar diagnóstico" y "Hablar por WhatsApp"
- Menú hamburguesa para móvil
- Íconos de redes sociales

### 2. Hero
- H1 principal con mensaje claro
- Subtítulo descriptivo
- CTAs primario y secundario
- Mini bloque de redes sociales
- Disclaimer visible

### 3. Redes Sociales del Profesor
- Cards por plataforma (YouTube, Instagram/TikTok, LinkedIn/X)
- Grid de previews (6 placeholders)
- Enlaces a contenido educativo

### 4. Para quién es / Para quién no es
- Dos columnas con bullets honestos
- Filtrado claro de audiencia
- Iconografía diferenciada

### 5. Qué obtienes
- 6 cards con beneficios:
  - Plan por niveles
  - Sesiones en vivo
  - Bitácora de trading
  - Gestión del riesgo
  - Feedback personalizado
  - Comunidad activa

### 6. Metodología
- Timeline de 4 pasos:
  1. Diagnóstico inicial
  2. Formación estructurada
  3. Práctica guiada
  4. Seguimiento continuo

### 7. Planes / Servicios
- 3 planes: Básico, Pro (destacado), VIP
- Información de duración, modalidad y cupos
- CTAs por plan

### 8. Copytrading ⭐
- Layout de 2 columnas (desktop) / 1 columna (móvil)
- **Placeholders para imágenes** preparados:
  - Imagen principal (dashboard/operativa)
  - 2 imágenes secundarias opcionales
- Bloque "Cómo funciona" (4 cards)
- Bloque "Beneficios" (sin prometer dinero)
- Bloque "Riesgos y transparencia" destacado
- Proceso de incorporación (5 pasos)
- CTAs: WhatsApp y formulario

### 9. Testimonios Trustpilot
- Badge de Trustpilot
- Filtros por categoría (Curso/Mentoría/Copytrading)
- Cards de testimonios con:
  - Avatar con iniciales
  - Estrellas de calificación
  - Nombre y ubicación
  - Extracto del testimonio
  - Categoría y fecha
- CTAs: Ver todas las reseñas / Dejar reseña

### 10. FAQ
- Acordeón interactivo
- 6 preguntas frecuentes:
  - Diferencia mentoría vs copytrading
  - Pausar/desconectar copytrading
  - Requisitos para empezar
  - Tiempo semanal requerido
  - Garantía de resultados
  - Señales de trading

### 11. Formulario de Contacto
- Campos:
  - Nombre *
  - WhatsApp *
  - Correo *
  - Nivel actual
  - Objetivo principal
  - Interés (Curso/Mentoría/Copytrading)
- Validación en tiempo real
- Disclaimer antes de enviar
- Envío a WhatsApp (configurable)

### 12. Footer
- Información de contacto
- Enlaces legales
- Redes sociales
- Descargo de responsabilidad completo

### 13. Botón WhatsApp Sticky
- Visible en móvil
- Posición fija bottom-right
- Color verde WhatsApp (#25d366)

## 🎨 Paleta de Colores

```css
--color-primary: #2563eb        /* Azul institucional */
--color-primary-dark: #1e40af
--color-secondary: #059669       /* Verde complementario */
--color-text: #1f2937           /* Texto oscuro */
--color-text-light: #6b7280      /* Texto secundario */
--color-bg: #ffffff              /* Fondo claro */
--color-bg-light: #f9fafb        /* Fondo alternativo */
```

## 📱 Responsive Design

- **Desktop**: Layout completo con 2-3 columnas
- **Tablet** (≤968px): Menú hamburguesa, columnas ajustadas
- **Móvil** (≤640px): Una columna, botones full-width, WhatsApp sticky visible

## 🚀 Cómo Usar

1. **Abrir la página**: Simplemente abre `index.html` en tu navegador
2. **Personalizar contenido**: Edita el HTML con tu información
3. **Ajustar colores**: Modifica las variables CSS en `:root`
4. **Configurar WhatsApp**: 
   - Reemplaza `1234567890` en los enlaces de WhatsApp
   - Actualiza el número en `script.js` (línea ~60)
5. **Agregar imágenes de Copytrading**: 
   - Reemplaza los placeholders en `.copytrading-images`
   - Los placeholders están marcados claramente
6. **Conectar formulario**: 
   - Opción 1: Envío a WhatsApp (ya implementado)
   - Opción 2: Conectar a tu backend (modificar `script.js`)

## 📝 Personalización

### Cambiar Logo
```html
<div class="logo">
    <span class="logo-text">TU LOGO AQUÍ</span>
</div>
```

### Actualizar Enlaces de Redes
Busca y reemplaza los `href="#"` en:
- Header (íconos de redes)
- Hero (social icons)
- Footer (footer-social)

### Modificar Testimonios
Los testimonios están en `.testimonials-grid`. Agrega más cards siguiendo la estructura existente.

### Agregar Imágenes de Copytrading
Los placeholders están en `.copytrading-images`:
```html
<div class="image-placeholder image-placeholder-main">
    <!-- Reemplaza este contenido con tu imagen -->
    <img src="ruta/a/tu/imagen.jpg" alt="Dashboard">
</div>
```

## ⚠️ Disclaimers Incluidos

Los disclaimers están presentes en:
1. Hero section
2. Formulario de contacto
3. Footer completo
4. Sección de Copytrading (riesgos y transparencia)

## 🔧 Funcionalidades JavaScript

- Menú móvil interactivo
- Acordeón FAQ
- Filtros de testimonios
- Validación de formulario
- Smooth scroll
- Animaciones al scroll
- Envío a WhatsApp

## 📋 Checklist de Personalización

- [ ] Reemplazar logo y nombre
- [ ] Actualizar enlaces de redes sociales
- [ ] Configurar número de WhatsApp
- [ ] Agregar imágenes de Copytrading
- [ ] Personalizar testimonios reales
- [ ] Actualizar información de contacto
- [ ] Ajustar colores de marca
- [ ] Conectar formulario a backend (opcional)
- [ ] Agregar Google Analytics (opcional)
- [ ] Configurar Trustpilot widget (opcional)

## 🌐 Integración con Trustpilot

Para integrar el widget oficial de Trustpilot:

1. Obtén tu código de Trustpilot
2. Reemplaza la sección de testimonios con el widget embebido
3. O mantén las cards personalizadas y sincroniza con la API de Trustpilot

## 📞 Soporte

Para cualquier duda o personalización adicional, revisa los comentarios en el código.

---

**Nota importante**: Esta landing page está diseñada para cumplir con estándares éticos de marketing financiero, sin prometer rentabilidades ni resultados garantizados.


