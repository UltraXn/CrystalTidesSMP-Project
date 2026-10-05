import { google } from 'googleapis';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const SCOPES = 'https://www.googleapis.com/auth/calendar';
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

// Initialize Auth Client (Service Account)
const getAuthClient = async () => {
  // If we have explicit env vars for credentials
  if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: (process.env.GOOGLE_PRIVATE_KEY || '').replaceAll('\\n', '\n'),
      },
      scopes: [SCOPES],
    });
    return auth.getClient();
  }

  // Fallback: look for a keyfile (standard for local dev if configured)
  const keyFile = path.join(process.cwd(), 'service-account.json');
  const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: [SCOPES],
  });
  return auth.getClient();
};

export const listEvents = async (maxResults = 10) => {
  if (!CALENDAR_ID) {
    console.warn('GOOGLE_CALENDAR_ID not set');
    return [];
  }

  try {
    const auth = await getAuthClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const calendar = google.calendar({ version: 'v3', auth: auth as any });

    const response = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: new Date().toISOString(),
      maxResults,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items || [];
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw error;
  }
};

export const createEvent = async (event: {
  summary: string;
  description?: string;
  start: string;
  end?: string;
}) => {
  if (!CALENDAR_ID) throw new Error('GOOGLE_CALENDAR_ID not set');

  try {
    const auth = await getAuthClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const calendar = google.calendar({ version: 'v3', auth: auth as any });

    // Default end time to +1 hour if not provided
    const startTime = new Date(event.start);
    const endTime = event.end
      ? new Date(event.end)
      : new Date(startTime.getTime() + 60 * 60 * 1000);

    const response = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      requestBody: {
        summary: event.summary,
        description: event.description,
        start: { dateTime: startTime.toISOString() },
        end: { dateTime: endTime.toISOString() },
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
};
