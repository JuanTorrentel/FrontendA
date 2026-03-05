# Despliegue en Fly.io - Yotago API

## 1. Requisitos

- [flyctl](https://fly.io/docs/hands-on/install-flyctl/) instalado
- Cuenta en [Fly.io](https://fly.io)
- Base de datos PostgreSQL (Neon) con `DATABASE_URL`

## 2. Iniciar sesión

```bash
fly auth login
```

## 3. Crear la app (primera vez)

Desde la carpeta `back/`:

```bash
cd back
fly launch --no-deploy
```

- Si pregunta por el nombre de la app, usa `yotago-api` o el que prefieras (debe ser único en Fly.io).
- Si pregunta si quieres configurar Postgres, responde **No** (usamos Neon).
- Al terminar, tendrás `fly.toml` configurado.

## 4. Configurar secrets (obligatorio)

```bash
fly secrets set JWT_SECRET="4rCr41d3r_Y0t4g0_Sch00l_JWT_53cur3_K3y_7x9f2"
fly secrets set DATABASE_URL="postgresql://usuario:password@host/db?sslmode=require"
fly secrets set FRONT_URL="https://tu-frontend.com"

# Opcional: SMTP (por ejemplo, Amazon SES)
fly secrets set EMAIL_PROVIDER="smtp"
fly secrets set SMTP_HOST="email-smtp.us-east-1.amazonaws.com"
fly secrets set SMTP_PORT="587"
fly secrets set SMTP_USER="TU_USER_SMTP"
fly secrets set SMTP_PASS="TU_PASSWORD_SMTP"
fly secrets set EMAIL_FROM="noreply@yotagoschool.pro"
```

Sustituye `DATABASE_URL` por tu conexión de Neon y `FRONT_URL` por la URL real del frontend.

Para ver los secrets configurados:
```bash
fly secrets list
```

## 5. Desplegar

```bash
fly deploy
```

## 6. Verificar

```bash
fly open
```

O visita `https://yotago-api.fly.dev/api/health` (cambia el nombre si usaste otro).

## 7. Comandos útiles

| Comando | Descripción |
|---------|-------------|
| `fly status` | Estado de la app |
| `fly logs` | Ver logs en tiempo real |
| `fly ssh console` | Consola SSH en la máquina |
| `fly secrets list` | Listar secrets |
| `fly scale count 1` | Ajustar número de máquinas |

## 8. URL del API en producción

Tras el deploy, la URL será:
```
https://yotago-api.fly.dev
```

(o `https://[tu-app-name].fly.dev`)

Configura `API_BASE_URL` en el frontend con esta URL.
