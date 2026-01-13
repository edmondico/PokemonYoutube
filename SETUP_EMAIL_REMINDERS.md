# Setup: Sistema de Recordatorios por Email

Este sistema envía emails cada 2 horas (10:00-22:00 hora España) recordándote subir video cuando es día de upload.

## Paso 1: Configurar variables en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. **Settings** > **Environment Variables**
3. Añade:

| Variable | Valor |
|----------|-------|
| `RESEND_API_KEY` | Tu API key de Resend |
| `REMINDER_EMAIL` | `bielmolner@gmail.com` |
| `YOUTUBE_API_KEY` | Tu YouTube API key |

4. Haz deploy del proyecto

## Paso 2: Configurar cron-job.org (GRATIS)

Vercel Hobby solo permite 1 cron/día, así que usamos cron-job.org (gratis, ilimitado).

1. Ve a [cron-job.org](https://cron-job.org) y crea cuenta gratuita
2. Click **"Create cronjob"**
3. Configura:

| Campo | Valor |
|-------|-------|
| **Title** | `PokeTrend Upload Reminder` |
| **URL** | `https://TU-PROYECTO.vercel.app/api/send-upload-reminder` |
| **Schedule** | Custom: `0 8,10,12,14,16,18,20 * * *` |

Esto ejecutará cada 2 horas: 8:00, 10:00, 12:00, 14:00, 16:00, 18:00, 20:00 UTC
(= 10:00, 12:00, 14:00, 16:00, 18:00, 20:00, 22:00 hora España en invierno)

4. Click **"Create"**

## Cómo funciona

```
cron-job.org (cada 2h)
       ↓
  Vercel API
       ↓
   ┌───┴───┐
   │       │
YouTube   Resend
       ↓
¿Es día de subida según calendario?
  SÍ → ¿Ya subió video hoy?
       NO → Envía email
       SÍ → No hace nada
  NO → No hace nada
```

## Verificar que funciona

Visita: `https://TU-PROYECTO.vercel.app/api/send-upload-reminder`

Respuestas posibles:
- `"action": "email_sent"` - Envió el email
- `"action": "skipped_uploaded_today"` - Ya subiste video hoy
- `"action": "skipped_not_upload_day"` - Hoy no toca subir
- `"action": "skipped"` - Fuera de horario (antes 10:00 o después 22:00)

## Hora óptima de subida

Para maximizar alcance en USA (Pokemon collecting/investing):

| Zona | Hora |
|------|------|
| **EST** | 3:00 PM |
| **PST** | 12:00 PM |
| **España** | 21:00-22:00 |

## Troubleshooting

### No llegan emails
1. Verifica variables en Vercel Dashboard
2. Prueba la URL manualmente
3. Revisa spam

### cron-job.org no funciona
1. Verifica que la URL es correcta
2. Revisa el historial de ejecuciones en cron-job.org
3. Asegúrate que el cronjob está activo (enabled)
