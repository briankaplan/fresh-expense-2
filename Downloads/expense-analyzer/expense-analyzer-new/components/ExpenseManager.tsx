import { useGestures } from '@/hooks/useGestures';

export function ExpenseManager() {
  const [activeView, setActiveView] = useState('transactions');

  useGestures({
    onSwipeLeft: () => setActiveView('unmatched'),
    onSwipeRight: () => setActiveView('transactions')
  });

  return (
    // Your component JSX
  );
} 