'use client';

import { useEffect, useState } from 'react';
import { DockerContainer } from '@/types/docker';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronDown } from 'lucide-react';

export default function ContainersPage() {
  const [containers, setContainers] = useState<DockerContainer[]>([]);
  const [selectedContainer, setSelectedContainer] = useState<string | null>(null);

  useEffect(() => {
    const fetchContainers = async () => {
      const response = await fetch('/api/containers');
      const data = await response.json();
      setContainers(data);
    };

    fetchContainers();
    const interval = setInterval(fetchContainers, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (containerId: string, action: string) => {
    try {
      if (action === 'delete' && !confirm('Are you sure you want to delete this container?')) {
        return;
      }

      if (!containerId) {
        throw new Error('Container ID is missing');
      }

      const response = await fetch('/api/containers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ containerId, action }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Container action failed:', error);
        alert(`Failed to ${action} container: ${error.error}`);
        return;
      }

      // Refresh the container list
      const containersResponse = await fetch('/api/containers');
      const data = await containersResponse.json();
      setContainers(data);
    } catch (error) {
      console.error('Container action error:', error);
      alert(`Error performing ${action} action`);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Docker Containers</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ports</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {containers.map((container) => (
            <TableRow 
              key={container.ID}
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => setSelectedContainer(container.ID)}
            >
              <TableCell>
                {container.Names}<br />

                {/* onclick copy to clipboard */}
                <a href="#" onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    navigator.clipboard.writeText(container.ID)
                    
                    // show toast
                    alert('Copied to clipboard')
                }}
                    className={"text-xs text-gray-500"}
                    style={{cursor: 'pointer'}}
                >
                    {container.ID.substring(0,8)} 💾
                </a>
                

              </TableCell>
              <TableCell>{container.Image}</TableCell>
              <TableCell>{container.Status}</TableCell>
              <TableCell>
                {container.Ports}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {container.State !== 'running' && (
                    <>
                      <button
                        onClick={() => handleAction(container.ID, 'start')}
                        className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Start
                      </button>
                      <button
                        onClick={() => handleAction(container.ID, 'delete')}
                        className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </>
                  )}
                  {container.State === 'running' && (
                    <>
                      <button
                        onClick={() => handleAction(container.ID, 'stop')}
                        className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Stop
                      </button>
                      <button
                        onClick={() => handleAction(container.ID, 'restart')}
                        className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Restart
                      </button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedContainer && (
        <ContainerModal
          container={containers.find(c => c.ID === selectedContainer)!}
          onClose={() => setSelectedContainer(null)}
        />
      )}
    </div>
  );
}

function ContainerModal({ 
  container, 
  onClose 
}: { 
  container: DockerContainer; 
  onClose: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const rows = [
    { label: "Container ID", value: container.ID },
    { label: "Name", value: container.Names },
    { label: "Image", value: container.Image },
    { label: "Status", value: container.Status },
    { label: "Created", value: new Date(container.Created * 1000).toLocaleString() },
    { label: "Ports", value: container.Ports.replaceAll('"', '') },
    { label: "Command", value: container.Command },
    { 
      label: "Mounts", 
      value: container.Mounts
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Container Details</h2>
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
                <TableCell className="font-mono text-sm whitespace-pre-wrap">
                  {Array.isArray(row.value) ? (
                    <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                      {JSON.stringify(row.value, null, 2)}
                    </pre>
                  ) : (
                    row.value || 'N/A'
                  )}
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
              {JSON.stringify(container, null, 2)}
            </pre>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
