"use client"
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function Nav() {
  const pathname = usePathname();
  const [selected, setSelected] = useState<string | null>(
    pathname === '/' ? 'processes' : 'containers'
  );

  useEffect(() => {
    setSelected(pathname === '/' ? 'processes' : 'containers');
  }, [pathname]);

  return (
    <nav className="bg-gray-800 text-white p-4 fixed top-0 left-0 w-full z-50">
      <div className="mx-4 flex gap-6 items-center">
        <span className="text-xl">🐹</span>
        <Link 
          href="/" 
          className={`hover:text-gray-300 ${selected === 'processes' ? 'font-bold' : ''}`}
          onClick={() => setSelected('processes')}
        >
          PM2 Processes
        </Link>
        <Link 
          href="/containers" 
          className={`hover:text-gray-300 ${selected === 'containers' ? 'font-bold' : ''}`}
          onClick={() => setSelected('containers')}
        >
          Docker Containers
        </Link>
      </div>
    </nav>
  );
}
