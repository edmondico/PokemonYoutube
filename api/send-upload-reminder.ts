import type { VercelRequest, VercelResponse } from '@vercel/node';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
const TARGET_UPLOAD_FREQUENCY = 2; // days between uploads
const CHANNEL_HANDLE = 'PokeBim';

// Spain timezone offset (UTC+1 in winter, UTC+2 in summer)
function getSpainHour(): number {
  const now = new Date();
  // Simple DST check for Spain (last Sunday of March to last Sunday of October)
  const month = now.getUTCMonth();
  const isDST = month > 2 && month < 9; // April to September roughly
  const offset = isDST ? 2 : 1;
  return (now.getUTCHours() + offset) % 24;
}

function isWithinReminderHours(): boolean {
  const spainHour = getSpainHour();
  return spainHour >= 10 && spainHour <= 22;
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

function isUploadDay(lastVideoDate: Date): boolean {
  const now = new Date();
  const diffMs = now.getTime() - lastVideoDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return diffDays >= TARGET_UPLOAD_FREQUENCY;
}

function isVideoUploadedToday(lastVideoDate: Date): boolean {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const videoDay = new Date(lastVideoDate.getFullYear(), lastVideoDate.getMonth(), lastVideoDate.getDate());

  return today.getTime() === videoDay.getTime();
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

async function sendEmail(resendApiKey: string, toEmail: string, lastVideoDate: Date): Promise<boolean> {
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

          <p>Tu último video fue subido el <strong>${formatDate(lastVideoDate)}</strong>.</p>

          <p>Según tu schedule de cada ${TARGET_UPLOAD_FREQUENCY} días, hoy deberías subir uno nuevo.</p>

          <p style="font-size: 24px;">¡Ánimo! 🎬</p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

          <p style="color: #666; font-size: 12px;">
            Este es un recordatorio automático de PokeTrend AI.<br>
            Se enviará cada 2 horas hasta las 22:00 o hasta que subas el video.
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

  // Verify cron secret (optional but recommended)
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers.authorization !== `Bearer ${cronSecret}`) {
    // Allow without auth for testing, but log it
    console.log('Request without CRON_SECRET authorization');
  }

  try {
    const youtubeApiKey = process.env.YOUTUBE_API_KEY || process.env.VITE_YOUTUBE_API_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;
    const reminderEmail = process.env.REMINDER_EMAIL || 'bielmolner@gmail.com';

    if (!youtubeApiKey || !resendApiKey) {
      throw new Error('Missing required environment variables: YOUTUBE_API_KEY or RESEND_API_KEY');
    }

    // Check if within reminder hours (10:00 - 22:00 Spain time)
    if (!isWithinReminderHours()) {
      return res.status(200).json({
        success: true,
        message: 'Outside reminder hours (10:00-22:00 Spain time)',
        spainHour: getSpainHour()
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

    // Check if video was already uploaded today
    if (isVideoUploadedToday(lastVideoDate)) {
      return res.status(200).json({
        success: true,
        message: 'Video already uploaded today! No reminder needed.',
        lastVideoDate: lastVideoDate.toISOString()
      });
    }

    // Check if today is an upload day
    if (!isUploadDay(lastVideoDate)) {
      const daysUntilUpload = TARGET_UPLOAD_FREQUENCY - Math.floor((Date.now() - lastVideoDate.getTime()) / (1000 * 60 * 60 * 24));
      return res.status(200).json({
        success: true,
        message: 'Not an upload day yet',
        lastVideoDate: lastVideoDate.toISOString(),
        daysUntilUpload
      });
    }

    // Send reminder email
    const emailSent = await sendEmail(resendApiKey, reminderEmail, lastVideoDate);

    if (emailSent) {
      return res.status(200).json({
        success: true,
        message: `Reminder email sent to ${reminderEmail}`,
        lastVideoDate: lastVideoDate.toISOString()
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
