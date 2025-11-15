import { useState } from 'react';
import { DriverScreen } from './components/DriverScreen';
import { OperatorScreen } from './components/OperatorScreen';
import { LandingPage } from './components/LandingPage';
import { Button } from './components/ui/button';

export default function App() {
  const [activeView, setActiveView] = useState<'landing' | 'driver' | 'operator'>('landing');

  // Landing page view
  if (activeView === 'landing') {
    return <LandingPage onEnterApp={() => setActiveView('driver')} />;
  }

  // App views with switcher
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* View Switcher */}
      <div className="fixed top-4 right-4 z-50 flex gap-2 bg-slate-800/80 backdrop-blur-sm p-2 rounded-lg border border-slate-700">
        <Button
          onClick={() => setActiveView('landing')}
          variant="outline"
          size="sm"
        >
          ← Landing
        </Button>
        <Button
          onClick={() => setActiveView('driver')}
          variant={activeView === 'driver' ? 'default' : 'outline'}
          size="sm"
          className={activeView === 'driver' ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >
          Driver View
        </Button>
        <Button
          onClick={() => setActiveView('operator')}
          variant={activeView === 'operator' ? 'default' : 'outline'}
          size="sm"
          className={activeView === 'operator' ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >
          Operator View
        </Button>
      </div>

      {/* Main Content */}
      {activeView === 'driver' ? <DriverScreen /> : <OperatorScreen />}
    </div>
  );
}