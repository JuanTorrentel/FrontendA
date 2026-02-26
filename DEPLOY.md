# Despliegue - Yotago School

## Requisitos

- Node.js 16+
- Base de datos PostgreSQL (Neon, Supabase, etc.)
- Servidor para frontend estático (Netlify, Vercel, GitHub Pages, etc.)

---

## Backend

### 1. Variables de entorno

Copiar `.env.example` a `.env` y configurar:

- `PORT`: Puerto (ej. 3002)
- `JWT_SECRET`: Secreto fuerte para JWT (generar con `openssl rand -hex 32`)
- `FRONT_URL`: URL del frontend en producción (ej. `https://tudominio.com`)
- `DATABASE_URL`: Connection string de PostgreSQL

### 2. Ejecutar

```bash
cd back
npm install
node scripts/hash-demo-passwords.js   # Solo primera vez - hashea contraseñas demo
npm start
```

### 3. Producción (PM2, Docker, etc.)

Ejemplo con PM2:
```bash
pm2 start server.js --name yotago-api
pm2 save
pm2 startup
```

---

## Frontend

### 1. Configurar API

Antes de subir, establecer la URL del API. Opciones:

**A) En cada HTML** (antes de `config.js`):
```html
<script>window.API_BASE_URL = 'https://api.tudominio.com';</script>
<script src="config.js"></script>
```

**B) Editar `config.js`** y cambiar la URL de producción.

### 2. Subir archivos

Subir todos los archivos del frontend (excepto `back/`, `node_modules/`, `.env`):

- `index.html`, `login.html`, `register.html`, `verify.html`, `agenda.html`, `admin.html`
- `config.js`, `api.js`, `auth.js`, `citas.js`, `agenda-calendar.js`, `app.js`, `script.js`
- `styles.css`, `app.css`
- `assets/`

### 3. CORS

En el backend, `FRONT_URL` debe incluir la URL exacta del frontend (con `https://`).

Para varios orígenes: `FRONT_URL=https://app.com,https://www.app.com`

---

## Checklist pre-producción

- [ ] Cambiar `JWT_SECRET` por uno seguro
- [ ] Configurar `API_BASE_URL` en el frontend
- [ ] Configurar `FRONT_URL` en el backend
- [ ] Verificar que las contraseñas demo estén hasheadas
- [ ] HTTPS en frontend y backend
- [ ] Revisar disclaimers y textos legales
