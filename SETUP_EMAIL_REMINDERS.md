# Setup: Sistema de Recordatorios por Email (Vercel)

Este sistema envía emails automáticos cada 2 horas (10:00-22:00 hora España) recordándote subir video cuando es día de upload.

## Arquitectura

```
Vercel Cron (cada 2h)
        ↓
/api/send-upload-reminder
        ↓
    ┌───┴───┐
    │       │
YouTube   Resend
  API      API
    │       │
    └───┬───┘
        ↓
¿Hay video hoy?
NO → Enviar email
SÍ → No hacer nada
```

## Configuración

### Paso 1: Añadir variables de entorno en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Ve a **Settings** > **Environment Variables**
3. Añade estas variables:

| Variable | Valor |
|----------|-------|
| `RESEND_API_KEY` | Tu API key de Resend |
| `REMINDER_EMAIL` | `bielmolner@gmail.com` |
| `YOUTUBE_API_KEY` | Tu YouTube API key (la misma que `VITE_YOUTUBE_API_KEY`) |

### Paso 2: Desplegar

Simplemente haz push a tu repositorio:

```bash
git add .
git commit -m "feat: add email reminder system for video uploads"
git push
```

Vercel desplegará automáticamente y activará el cron job.

## Verificar que funciona

### Probar manualmente

Visita esta URL (reemplaza con tu dominio de Vercel):

```
https://tu-proyecto.vercel.app/api/send-upload-reminder
```

Deberías ver una respuesta JSON como:
- `"Video already uploaded today!"` - Si ya subiste video hoy
- `"Not an upload day yet"` - Si no toca subir todavía
- `"Reminder email sent"` - Si envió el email
- `"Outside reminder hours"` - Si es fuera de horario (antes de 10:00 o después de 22:00)

### Ver logs

1. Ve a tu proyecto en Vercel Dashboard
2. Ve a **Logs** en el menú lateral
3. Filtra por `/api/send-upload-reminder`

### Ver cron jobs

1. Ve a **Settings** > **Cron Jobs**
2. Verás el job programado y su próxima ejecución

## Horario de envío

| Hora España | Hora UTC |
|-------------|----------|
| 10:00 | 08:00 / 09:00 |
| 12:00 | 10:00 / 11:00 |
| 14:00 | 12:00 / 13:00 |
| 16:00 | 14:00 / 15:00 |
| 18:00 | 16:00 / 17:00 |
| 20:00 | 18:00 / 19:00 |
| 22:00 | 20:00 / 21:00 |

*La hora UTC varía según horario de verano/invierno*

## Comportamiento

- **Se detiene automáticamente** cuando detecta que subiste un video ese día
- **Solo en días de upload** (cada 2 días desde tu último video)
- **Revisa YouTube en tiempo real** para detectar si ya subiste

## Archivos creados

| Archivo | Descripción |
|---------|-------------|
| `api/send-upload-reminder.ts` | Serverless function que envía los emails |
| `vercel.json` | Configuración del cron job |

## Troubleshooting

### No llegan emails
1. Verifica las variables de entorno en Vercel Dashboard
2. Revisa los logs en Vercel Dashboard > Logs
3. Comprueba que el email no está en spam
4. Prueba la URL manualmente para ver el error

### El cron no se ejecuta
1. Verifica en Settings > Cron Jobs que el job está activo
2. Comprueba que el proyecto está en un plan que soporte cron (Hobby o superior)
3. Revisa los logs de las ejecuciones programadas

### Error de YouTube API
1. Verifica que `YOUTUBE_API_KEY` está configurado
2. Comprueba que la API key tiene permisos para YouTube Data API v3
