import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const reflectionsFile = path.join(process.cwd(), 'data', 'reflections.json');
    
    if (!fs.existsSync(reflectionsFile)) {
      return NextResponse.json({});
    }

    const data = JSON.parse(fs.readFileSync(reflectionsFile, 'utf-8'));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to load reflections:', error);
    return NextResponse.json({}, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dateStr, reflection } = body;

    if (!dateStr || typeof reflection !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid dateStr and reflection' },
        { status: 400 }
      );
    }

    const reflectionsFile = path.join(process.cwd(), 'data', 'reflections.json');
    
    // Read existing data
    let data: Record<string, { text: string; savedAt: string }> = {};
    if (fs.existsSync(reflectionsFile)) {
      try {
        data = JSON.parse(fs.readFileSync(reflectionsFile, 'utf-8'));
      } catch (e) {
        console.error('Failed to parse existing reflections file:', e);
        data = {};
      }
    }

    // Add or update the reflection for this date
    data[dateStr] = {
      text: reflection,
      savedAt: new Date().toISOString(),
    };

    // Write back to file
    fs.writeFileSync(reflectionsFile, JSON.stringify(data, null, 2));

    return NextResponse.json(
      { success: true, dateStr },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to save reflection:', error);
    return NextResponse.json(
      { error: 'Failed to save reflection' },
      { status: 500 }
    );
  }
}
