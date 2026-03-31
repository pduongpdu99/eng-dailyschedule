import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { CalendarEvent } from '@/lib/eventsUtils';

export async function GET() {
  try {
    const eventsFile = path.join(process.cwd(), 'data', 'events.json');
    let data: Record<string, CalendarEvent[]> = {};
    
    if (fs.existsSync(eventsFile)) {
      try {
        data = JSON.parse(fs.readFileSync(eventsFile, 'utf-8'));
      } catch (e) {
        console.error('Failed to parse events file:', e);
      }
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to load events:', error);
    return NextResponse.json({}, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dateStr, event } = body;

    if (!dateStr || !event) {
      return NextResponse.json(
        { error: 'Missing dateStr or event' },
        { status: 400 }
      );
    }

    const eventsFile = path.join('data', 'events.json');
    
    // Read existing data
    let data: Record<string, CalendarEvent[]> = {};
    if (fs.existsSync(eventsFile)) {
      try {
        data = JSON.parse(fs.readFileSync(eventsFile, 'utf-8'));
      } catch (e) {
        console.error('Failed to parse existing events file:', e);
      }
    }

    // Initialize array for this date if it doesn't exist
    if (!data[dateStr]) {
      data[dateStr] = [];
    }

    // Add or update the event
    const existingIndex = data[dateStr].findIndex(e => e.id === event.id);
    if (existingIndex >= 0) {
      data[dateStr][existingIndex] = event;
    } else {
      data[dateStr].push(event);
    }

    // Write back to file
    fs.writeFileSync(eventsFile, JSON.stringify(data, null, 2));

    return NextResponse.json({ success: true, event }, { status: 200 });
  } catch (error) {
    console.error('Failed to save event:', error);
    return NextResponse.json({ error: 'Failed to save event' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { dateStr, eventId } = body;

    if (!dateStr || !eventId) {
      return NextResponse.json(
        { error: 'Missing dateStr or eventId' },
        { status: 400 }
      );
    }

    const eventsFile = path.join('data', 'events.json');
    let data: Record<string, CalendarEvent[]> = {};
    
    if (fs.existsSync(eventsFile)) {
      try {
        data = JSON.parse(fs.readFileSync(eventsFile, 'utf-8'));
      } catch (e) {
        console.error('Failed to parse existing events file:', e);
      }
    }

    if (data[dateStr]) {
      data[dateStr] = data[dateStr].filter(e => e.id !== eventId);
      if (data[dateStr].length === 0) {
        delete data[dateStr];
      }
    }

    fs.writeFileSync(eventsFile, JSON.stringify(data, null, 2));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
