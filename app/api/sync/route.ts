import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    // Only allow sync on localhost
    const origin = request.headers.get('origin') || '';
    const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1') || !origin;

    if (!isLocalhost && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Sync is only available on localhost' },
        { status: 403 }
      );
    }

    // Connect to MongoDB
    const { db } = await connectToDatabase();

    const dataDir = path.join(process.cwd(), 'data');
    const syncResults: Record<string, { status: string; count?: number; error?: string }> = {};

    // Sync schedules
    try {
      const schedulePath = path.join(dataDir, 'dailySchedule.json');
      if (fs.existsSync(schedulePath)) {
        const scheduleData = JSON.parse(fs.readFileSync(schedulePath, 'utf-8'));
        const schedulesCollection = db.collection('schedules');
        
        // Clear and repopulate
        await schedulesCollection.deleteMany({});
        const docs = Object.entries(scheduleData).map(([date, schedule]) => ({
          _id: date,
          date,
          items: schedule,
          updatedAt: new Date()
        }));
        
        const result = await schedulesCollection.insertMany(docs);
        syncResults.schedules = { status: 'synced', count: result.insertedCount };
      }
    } catch (error) {
      syncResults.schedules = { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Sync reflections
    try {
      const reflectionPath = path.join(dataDir, 'reflections.json');
      if (fs.existsSync(reflectionPath)) {
        const reflectionData = JSON.parse(fs.readFileSync(reflectionPath, 'utf-8'));
        const reflectionsCollection = db.collection('reflections');
        
        await reflectionsCollection.deleteMany({});
        const docs = Object.entries(reflectionData).map(([date, reflection]) => ({
          _id: date,
          date,
          reflection,
          updatedAt: new Date()
        }));
        
        const result = await reflectionsCollection.insertMany(docs);
        syncResults.reflections = { status: 'synced', count: result.insertedCount };
      }
    } catch (error) {
      syncResults.reflections = { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Sync events
    try {
      const eventsPath = path.join(dataDir, 'events.json');
      if (fs.existsSync(eventsPath)) {
        const eventsData = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));
        const eventsCollection = db.collection('events');
        
        await eventsCollection.deleteMany({});
        const docs = Object.entries(eventsData).map(([date, events]) => ({
          _id: date,
          date,
          events,
          updatedAt: new Date()
        }));
        
        const result = await eventsCollection.insertMany(docs);
        syncResults.events = { status: 'synced', count: result.insertedCount };
      }
    } catch (error) {
      syncResults.events = { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    return NextResponse.json({
      success: true,
      message: 'Data synced to MongoDB',
      results: syncResults
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Sync failed',
        success: false
      },
      { status: 500 }
    );
  }
}
