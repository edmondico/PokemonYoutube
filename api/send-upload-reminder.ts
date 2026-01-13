import type { VercelRequest, VercelResponse } from '@vercel/node';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
const TARGET_UPLOAD_FREQUENCY = 2; // days between uploads (same as app)
const CHANNEL_HANDLE = 'PokeBim';

// Optimal upload time for Pokemon collecting/investing niche targeting USA
// Best time: 3:00 PM EST = 21:00 Spain (winter) / 22:00 Spain (summer)
const OPTIMAL_UPLOAD_TIME = {
  EST: '3:00 PM',
  PST: '12:00 PM',
  spain: '21:00-22:00'
};

// Spain timezone offset (UTC+1 in winter, UTC+2 in summer)
function getSpainDate(): Date {
  const now = new Date();
  const month = now.getUTCMonth();
  const isDST = month > 2 && month < 9; // April to September roughly
  const offset = isDST ? 2 : 1;
  return new Date(now.getTime() + offset * 60 * 60 * 1000);
}

function getSpainHour(): number {
  return getSpainDate().getUTCHours();
}

function isWithinReminderHours(): boolean {
  const spainHour = getSpainHour();
  return spainHour >= 10 && spainHour <= 22;
}

function formatDateSpain(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Get just the date part (year, month, day) without time
function getDateOnly(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

async function getChannelId(apiKey: string): Promise<string | null> {
  const url = `${YOUTUBE_API_BASE}/channels?part=id&forHandle=${CHANNEL_HANDLE}&key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    console.error('Channel not found:', CHANNEL_HANDLE);
    return null;
  }

  return data.items[0].id;
}

async function getLastVideoDate(channelId: string, apiKey: string): Promise<Date | null> {
  // Get uploads playlist ID
  const channelUrl = `${YOUTUBE_API_BASE}/channels?part=contentDetails&id=${channelId}&key=${apiKey}`;
  const channelResponse = await fetch(channelUrl);
  const channelData = await channelResponse.json();

  if (!channelData.items || channelData.items.length === 0) {
    return null;
  }

  const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

  // Get most recent video
  const playlistUrl = `${YOUTUBE_API_BASE}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=1&key=${apiKey}`;
  const playlistResponse = await fetch(playlistUrl);
  const playlistData = await playlistResponse.json();

  if (!playlistData.items || playlistData.items.length === 0) {
    return null;
  }

  return new Date(playlistData.items[0].snippet.publishedAt);
}

// Calculate suggested upload dates (same logic as app's getSuggestedUploadDates)
function getSuggestedUploadDates(lastVideoDate: Date): Date[] {
  const suggestions: Date[] = [];
  let nextDate = new Date(lastVideoDate);

  // Generate next 5 suggested upload dates
  for (let i = 0; i < 5; i++) {
    nextDate = new Date(nextDate.getTime() + TARGET_UPLOAD_FREQUENCY * 24 * 60 * 60 * 1000);
    suggestions.push(new Date(nextDate));
  }

  return suggestions;
}

// Check if today is a suggested upload day
function isTodayUploadDay(lastVideoDate: Date): boolean {
  const suggestedDates = getSuggestedUploadDates(lastVideoDate);
  const todayStr = getDateOnly(getSpainDate());

  return suggestedDates.some(date => getDateOnly(date) === todayStr);
}

// Check if video was uploaded today
function isVideoUploadedToday(lastVideoDate: Date): boolean {
  const todayStr = getDateOnly(getSpainDate());
  const videoDateStr = getDateOnly(lastVideoDate);
  return todayStr === videoDateStr;
}

// Calculate days since last upload
function daysSinceLastUpload(lastVideoDate: Date): number {
  const now = getSpainDate();
  const diffMs = now.getTime() - lastVideoDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

async function sendEmail(resendApiKey: string, toEmail: string, lastVideoDate: Date, suggestedDates: Date[]): Promise<boolean> {
  const daysSince = daysSinceLastUpload(lastVideoDate);
  const nextDates = suggestedDates
    .filter(d => d >= getSpainDate())
    .slice(0, 3)
    .map(d => formatDateSpain(d));

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'PokeTrend AI <onboarding@resend.dev>',
      to: [toEmail],
      subject: '¡Hoy toca subir video a YouTube!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #ff0000;">¡Hola!</h2>

          <p>Es día de subir video a tu canal de YouTube (<strong>@${CHANNEL_HANDLE}</strong>).</p>

          <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #856404;">Tu último video fue subido hace ${daysSince} días</p>
            <p style="margin: 8px 0 0 0; color: #856404;">${formatDateSpain(lastVideoDate)}</p>
          </div>

          <div style="background: #d4edda; border: 1px solid #28a745; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #155724;">Hora óptima de subida para USA:</p>
            <p style="margin: 8px 0 0 0; color: #155724; font-size: 18px;">
              <strong>${OPTIMAL_UPLOAD_TIME.EST} EST</strong> (${OPTIMAL_UPLOAD_TIME.PST} PST)
            </p>
            <p style="margin: 8px 0 0 0; color: #155724;">
              = <strong>${OPTIMAL_UPLOAD_TIME.spain} hora España</strong>
            </p>
            <p style="margin: 8px 0 0 0; color: #155724; font-size: 12px;">
              Este horario maximiza el alcance para la audiencia de Pokemon collecting/investing en USA (después del trabajo/escuela).
            </p>
          </div>

          <p style="font-size: 24px;">¡Ánimo! 🎬</p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

          <p style="color: #666; font-size: 12px;">
            Este es un recordatorio automático de PokeTrend AI.<br>
            Se enviará cada 2 horas hasta las 22:00 o hasta que subas el video.<br>
            Schedule: cada ${TARGET_UPLOAD_FREQUENCY} días.
          </p>
        </div>
      `
    })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Error sending email:', error);
    return false;
  }

  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET (for cron) and POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const youtubeApiKey = process.env.YOUTUBE_API_KEY || process.env.VITE_YOUTUBE_API_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;
    const reminderEmail = process.env.REMINDER_EMAIL || 'bielmolner@gmail.com';

    if (!youtubeApiKey || !resendApiKey) {
      throw new Error('Missing required environment variables: YOUTUBE_API_KEY or RESEND_API_KEY');
    }

    const spainHour = getSpainHour();

    // Check if within reminder hours (10:00 - 22:00 Spain time)
    if (!isWithinReminderHours()) {
      return res.status(200).json({
        success: true,
        message: 'Outside reminder hours (10:00-22:00 Spain time)',
        spainHour,
        action: 'skipped'
      });
    }

    // Get channel ID
    const channelId = await getChannelId(youtubeApiKey);
    if (!channelId) {
      throw new Error('Could not find YouTube channel');
    }

    // Get last video date
    const lastVideoDate = await getLastVideoDate(channelId, youtubeApiKey);
    if (!lastVideoDate) {
      throw new Error('Could not get last video date');
    }

    const suggestedDates = getSuggestedUploadDates(lastVideoDate);
    const daysSince = daysSinceLastUpload(lastVideoDate);

    // Check if video was already uploaded today
    if (isVideoUploadedToday(lastVideoDate)) {
      return res.status(200).json({
        success: true,
        message: 'Video already uploaded today! No reminder needed.',
        lastVideoDate: lastVideoDate.toISOString(),
        action: 'skipped_uploaded_today'
      });
    }

    // Check if today is a scheduled upload day (following the app's calendar logic)
    if (!isTodayUploadDay(lastVideoDate)) {
      const nextUploadDate = suggestedDates.find(d => d >= getSpainDate());
      return res.status(200).json({
        success: true,
        message: 'Not a scheduled upload day',
        lastVideoDate: lastVideoDate.toISOString(),
        daysSinceLastUpload: daysSince,
        nextUploadDate: nextUploadDate?.toISOString(),
        action: 'skipped_not_upload_day'
      });
    }

    // Today IS an upload day and no video uploaded yet -> send reminder
    const emailSent = await sendEmail(resendApiKey, reminderEmail, lastVideoDate, suggestedDates);

    if (emailSent) {
      return res.status(200).json({
        success: true,
        message: `Reminder email sent to ${reminderEmail}`,
        lastVideoDate: lastVideoDate.toISOString(),
        daysSinceLastUpload: daysSince,
        spainHour,
        optimalUploadTime: OPTIMAL_UPLOAD_TIME,
        action: 'email_sent'
      });
    } else {
      throw new Error('Failed to send email');
    }

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
