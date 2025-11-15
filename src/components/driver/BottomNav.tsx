import { Map, User, Car, Clock } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'map' | 'profile' | 'vehicle' | 'sessions';
  onTabChange: (tab: 'map' | 'profile' | 'vehicle' | 'sessions') => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 px-2 py-2 safe-area-bottom">
      <div className="grid grid-cols-4 gap-1">
        <button
          onClick={() => onTabChange('map')}
          className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all ${
            activeTab === 'map'
              ? 'bg-blue-600/20 text-blue-400'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Map className="w-5 h-5 mb-1" />
          <span className="text-xs">Map</span>
        </button>

        <button
          onClick={() => onTabChange('sessions')}
          className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all ${
            activeTab === 'sessions'
              ? 'bg-blue-600/20 text-blue-400'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Clock className="w-5 h-5 mb-1" />
          <span className="text-xs">Sessions</span>
        </button>

        <button
          onClick={() => onTabChange('vehicle')}
          className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all ${
            activeTab === 'vehicle'
              ? 'bg-blue-600/20 text-blue-400'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Car className="w-5 h-5 mb-1" />
          <span className="text-xs">Vehicle</span>
        </button>

        <button
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all ${
            activeTab === 'profile'
              ? 'bg-blue-600/20 text-blue-400'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <User className="w-5 h-5 mb-1" />
          <span className="text-xs">Profile</span>
        </button>
      </div>
    </div>
  );
}
