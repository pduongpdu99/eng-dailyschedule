import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    // Try to load from MongoDB first
    try {
      const { db } = await connectToDatabase();
      const schedules = await db?.collection('schedules').find({}).toArray();
      
      if (schedules && schedules.length > 0) {
        // Convert MongoDB array to object format
        const data: Record<string, any> = {};
        schedules.forEach((doc: any) => {
          const { dateStr, items } = doc;
          if (dateStr && items) {
            data[dateStr] = items;
          }
        });
        
        // If we got data from MongoDB, return it
        if (Object.keys(data).length > 0) {
          return NextResponse.json(data);
        }
      }
    } catch (dbError) {
      console.log('MongoDB not available, falling back to JSON files');
    }

    // Fallback to JSON files
    const scheduleFile = path.join(process.cwd(), 'data', 'dailySchedule.json');
    const data = JSON.parse(fs.readFileSync(scheduleFile, 'utf-8'));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to load schedules:', error);
    return NextResponse.json({ default: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dateStr, schedule } = body;

    if (!dateStr || !Array.isArray(schedule)) {
      return NextResponse.json(
        { error: 'Missing or invalid dateStr and schedule' },
        { status: 400 }
      );
    }

    const scheduleFile = path.join(process.cwd(), 'data', 'dailySchedule.json');
    
    // Read existing data
    let data = {};
    if (fs.existsSync(scheduleFile)) {
      try {
        data = JSON.parse(fs.readFileSync(scheduleFile, 'utf-8'));
      } catch (e) {
        console.error('Failed to parse existing schedule file:', e);
        data = {};
      }
    }

    // Add or update the schedule for this date
    data[dateStr] = schedule;

    // Write back to file
    fs.writeFileSync(scheduleFile, JSON.stringify(data, null, 2));

    return NextResponse.json(
      { success: true, dateStr, itemCount: schedule.length },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to save schedule:', error);
    return NextResponse.json(
      { error: 'Failed to save schedule' },
      { status: 500 }
    );
  }
}
