import React from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ViewToggleProps {
  view: 'table' | 'card';
  setView: (view: 'table' | 'card') => void;
}

export function ViewToggle({ view, setView }: ViewToggleProps) {
  return (
    <div className="flex items-center space-x-2 bg-muted p-1 rounded-md border border-border h-9">
      <Button
        variant={view === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setView('table')}
        className="h-7 px-3"
        aria-label="Switch to Table View"
      >
        <List className="h-4 w-4 mr-2" />
        Table
      </Button>
      <Button
        variant={view === 'card' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setView('card')}
        className="h-7 px-3"
        aria-label="Switch to Card View"
      >
        <LayoutGrid className="h-4 w-4 mr-2" />
        Cards
      </Button>
    </div>
  );
}
