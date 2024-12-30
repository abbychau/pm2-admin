import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const { path } = await request.json();
    
    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    // Run the 'code' command to open VS Code
    await execAsync(`code ${path}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error opening VS Code:', error);
    return NextResponse.json({ error: 'Failed to open VS Code' }, { status: 500 });
  }
}