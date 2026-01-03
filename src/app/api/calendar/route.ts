import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Property } from '@/models/Property';

interface CalendarEvent {
  uid: string;
  summary: string;
  start: string;
  end: string;
  status: 'blocked' | 'available';
  reservationCode?: string;
}

function parseICalDate(dateStr: string): string {
  // iCal dates come as YYYYMMDD or YYYYMMDDTHHMMSSZ
  if (dateStr.includes('T')) {
    // DateTime format: 20240101T150000Z
    const year = dateStr.slice(0, 4);
    const month = dateStr.slice(4, 6);
    const day = dateStr.slice(6, 8);
    return `${year}-${month}-${day}`;
  }
  // Date only format: 20240101
  const year = dateStr.slice(0, 4);
  const month = dateStr.slice(4, 6);
  const day = dateStr.slice(6, 8);
  return `${year}-${month}-${day}`;
}

function parseICalEvents(icalData: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const lines = icalData.replace(/\r\n /g, '').split(/\r?\n/);

  let currentEvent: Partial<CalendarEvent> | null = null;

  for (const line of lines) {
    // console.log('ICal Line:', line);
    if (line === 'BEGIN:VEVENT') {
      currentEvent = {};
    } else if (line === 'END:VEVENT' && currentEvent) {
      if (currentEvent.start && currentEvent.end) {
        events.push({
          uid: currentEvent.uid || `event-${Date.now()}-${Math.random()}`,
          summary: currentEvent.summary || 'Reservado',
          start: currentEvent.start,
          end: currentEvent.end,
          status: 'blocked',
          reservationCode: currentEvent.reservationCode,
        });
      }
      currentEvent = null;
      } else if (currentEvent) {
      if (line.startsWith('UID:')) {
        const uid = line.slice(4);
        currentEvent.uid = uid;
        // Extract reservation code from UID (e.g., "HM1234567890@airbnb.com" -> "HM1234567890")
        const codeMatch = uid.match(/^(HM[A-Z0-9]+)@/i);
        if (codeMatch) {
          currentEvent.reservationCode = codeMatch[1].toUpperCase();
        }
      } else if (line.startsWith('DESCRIPTION:') || line.includes('reservations/details/')) {
        // Some Airbnb iCal feeds include the reservation HM code in the DESCRIPTION
        const desc = line.replace(/^DESCRIPTION:/, '');
        const codeMatchDesc = desc.match(/reservations\/details\/(HM[ A-Z0-9-]+)/i);
        if (codeMatchDesc) {
          // sanitize and uppercase
          currentEvent.reservationCode = codeMatchDesc[1].replace(/[^A-Z0-9]/gi, '').toUpperCase();
        }
      } else if (line.startsWith('SUMMARY:')) {
        currentEvent.summary = line.slice(8);
      } else if (line.startsWith('DTSTART')) {
        // Handle both DTSTART;VALUE=DATE:20240101 and DTSTART:20240101T150000Z
        const match = line.match(/DTSTART[^:]*:(\d{8}T?\d*Z?)/);
        if (match) {
          currentEvent.start = parseICalDate(match[1]);
        }
      } else if (line.startsWith('DTEND')) {
        const match = line.match(/DTEND[^:]*:(\d{8}T?\d*Z?)/);
        if (match) {
          currentEvent.end = parseICalDate(match[1]);
        }
      }
    }
  }

  return events;
}

export async function GET() {
  try {
    await dbConnect();

    // Fetch calendar URL from property
    const property = await Property.findOne({ isActive: true });
    const calendarUrl = property?.airbnbCalendarUrl;

    if (!calendarUrl) {
      return NextResponse.json({
        events: [],
        message: 'URL do calendário não configurada',
        calendarUrl: null,
      });
    }

    // Fetch iCal data from Airbnb
    const response = await fetch(calendarUrl, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch calendar: ${response.status}`);
    }

    const icalData = await response.text();
    const events = parseICalEvents(icalData);

    // Sort events by start date
    events.sort((a, b) => a.start.localeCompare(b.start));

    // Filter only future events (from today onwards)
    const today = new Date().toISOString().split('T')[0];
    const futureEvents = events.filter((e) => e.end >= today);

    return NextResponse.json({
      events: futureEvents,
      totalEvents: futureEvents.length,
      lastSync: new Date().toISOString(),
      calendarUrl: calendarUrl.replace(/\?.*$/, ''), // Hide token for security
    });
  } catch (error) {
    console.error('Error fetching calendar:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar calendário', events: [] },
      { status: 500 }
    );
  }
}
