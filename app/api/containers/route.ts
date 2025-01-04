import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    const { stdout } = await execAsync('docker ps --no-trunc -a --format "{{json .}}"');
    const containers = stdout.trim().split('\n').map(line => JSON.parse(line));
    return NextResponse.json(containers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { action, containerId } = await request.json();
    
    if (!containerId) {
      console.error('Container ID missing', { action, containerId });
      return NextResponse.json({ error: 'Container ID is required' }, { status: 400 });
    }

    let command;
    switch (action) {
      case 'start':
        command = `docker start ${containerId}`;
        break;
      case 'stop':
        command = `docker stop ${containerId}`;
        break;
      case 'restart':
        command = `docker restart ${containerId}`;
        break;
      case 'delete':
        command = `docker rm ${containerId}`;
        break;
      default:
        console.error('Invalid action', { action, containerId });
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    console.log('Executing command:', command);
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr) {
      console.error('Docker command error:', stderr);
      return NextResponse.json({ error: stderr }, { status: 500 });
    }

    return NextResponse.json({ success: true, output: stdout });
  } catch (error: any) {
    console.error('Container action failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
