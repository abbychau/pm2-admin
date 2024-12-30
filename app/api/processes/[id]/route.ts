import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { PM2Process } from '@/types/pm2';

const execAsync = promisify(exec);

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { stdout } = await execAsync('pm2 jlist');
    const processes: PM2Process[] = JSON.parse(stdout);
    const process = processes.find(p => p.pm_id === parseInt(params.id));
    
    if (!process) {
      return NextResponse.json({ error: 'Process not found' }, { status: 404 });
    }

    return NextResponse.json(process);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
