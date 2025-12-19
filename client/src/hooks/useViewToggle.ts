import { useState } from 'react';

type ViewType = 'table' | 'card';

interface UseViewToggleReturn {
  view: ViewType;
  setView: (view: ViewType) => void;
  isTableView: boolean;
  isCardView: boolean;
}

export function useViewToggle(initialView: ViewType = 'table'): UseViewToggleReturn {
  const [view, setView] = useState<ViewType>(initialView);

  return {
    view,
    setView,
    isTableView: view === 'table',
    isCardView: view === 'card',
  };
}
