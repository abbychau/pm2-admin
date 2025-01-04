'use client';

import { useEffect, useState } from 'react';
import { PM2Description, PM2Process } from '@/types/pm2';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHeader,
  TableHead,
} from "@/components/ui/table"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronDown } from 'lucide-react';

export default function Home() {
  const [processes, setProcesses] = useState<PM2Process[]>([]);
  const [selectedProcess, setSelectedProcess] = useState<number | null>(null);

  useEffect(() => {
    const fetchProcesses = async () => {
      const response = await fetch('/api/processes');
      const data = await response.json();
      setProcesses(data);
    };

    fetchProcesses();
    const interval = setInterval(fetchProcesses, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">PM2 Processes</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Memory</TableHead>
            <TableHead>CPU</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {processes.map((process) => (
            <TableRow 
              key={process.pm_id}
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => setSelectedProcess(process.pm_id)}
            >
              <TableCell className="font-medium">{process.name}</TableCell>
              <TableCell>{process.pm_id}</TableCell>
              <TableCell>{Math.round(process.monit.memory / 1024 / 1024)} MB</TableCell>
              <TableCell>{process.monit.cpu}%</TableCell>
              <TableCell>{process.pm2_env.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedProcess !== null && (
        <ProcessModal
          processId={selectedProcess}
          onClose={() => setSelectedProcess(null)}
        />
      )}
    </div>
  );
}

function ProcessModal({ processId, onClose }: { processId: number; onClose: () => void }) {
  const [details, setDetails] = useState<PM2Description | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      const response = await fetch(`/api/processes/${processId}`);
      const data = await response.json();
      setDetails(data);
    };
    fetchDetails();
  }, [processId]);

  const openInVSCode = async (path: string) => {
    await fetch('/api/openInVSCode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path }),
    });
  };

  if (!details) return null;

  const rows = [
    { label: "Process ID", value: details.pid },
    { label: "Name", value: details.name },
    { 
      label: "Working Directory", 
      value: details.pm2_env?.pm_cwd,
      action: details.pm2_env?.pm_cwd ? (
        <button
          onClick={() => openInVSCode(details.pm2_env.pm_cwd)}
          className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
        >
          📁 Open Folder
        </button>
      ) : null
    },
    { 
      label: "Out Log Path", 
      value: details.pm2_env?.pm_out_log_path,
      action: details.pm2_env?.pm_out_log_path ? (
        <button
          onClick={() => openInVSCode(details.pm2_env.pm_out_log_path)}
          className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
        >
          📄 Open File
        </button>
      ) : null
    },
    { 
      label: "Error Log Path", 
      value: details.pm2_env?.pm_err_log_path,
      action: details.pm2_env?.pm_err_log_path ? (
        <button
          onClick={() => openInVSCode(details.pm2_env.pm_err_log_path)}
          className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
        >
          📄 Open File
        </button>
      ) : null
    },
    { label: "Memory Usage", value: `${Math.round(details.monit.memory / 1024 / 1024)} MB` },
    { label: "CPU Usage", value: `${details.monit.cpu}%` },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Process Details</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            &times;
          </button>
        </div>

        <Table className="mb-6">
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.label}>
                <TableCell className="font-medium w-1/3">{row.label}</TableCell>
                <TableCell className="font-mono text-sm">
                  {row.value || 'N/A'}
                  {row.action}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
            <ChevronDown className={`h-4 w-4 transform ${isOpen ? 'rotate-180' : ''} transition-transform`}/>
            {isOpen ? 'Hide' : 'Show'} Raw JSON
          </CollapsibleTrigger>
          <CollapsibleContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto mt-4">
              {JSON.stringify(details, null, 2)}
            </pre>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
