import { Clock, MapPin, Battery, DollarSign, Zap, Calendar } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

interface Session {
  id: string;
  date: string;
  station: string;
  location: string;
  energy: string;
  cost: string;
  duration: string;
  status: 'completed' | 'ongoing';
}

const sessions: Session[] = [
  {
    id: '1',
    date: 'Today, 10:30 AM',
    station: 'Station #42',
    location: '123 Market St',
    energy: '24.5 kWh',
    cost: '$4.32',
    duration: '45 min',
    status: 'ongoing'
  },
  {
    id: '2',
    date: 'Nov 14, 2025',
    station: 'Station #28',
    location: '456 Main Ave',
    energy: '32.1 kWh',
    cost: '$5.87',
    duration: '1h 15m',
    status: 'completed'
  },
  {
    id: '3',
    date: 'Nov 12, 2025',
    station: 'Station #15',
    location: '789 Oak Blvd',
    energy: '28.3 kWh',
    cost: '$4.95',
    duration: '52 min',
    status: 'completed'
  },
  {
    id: '4',
    date: 'Nov 10, 2025',
    station: 'Station #42',
    location: '123 Market St',
    energy: '26.7 kWh',
    cost: '$4.68',
    duration: '48 min',
    status: 'completed'
  },
  {
    id: '5',
    date: 'Nov 8, 2025',
    station: 'Station #33',
    location: '321 Pine St',
    energy: '30.2 kWh',
    cost: '$5.21',
    duration: '58 min',
    status: 'completed'
  }
];

export function SessionsPage() {
  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-950 pb-20">
      {/* Header */}
      <div className="bg-slate-900/95 backdrop-blur-sm px-5 pt-10 pb-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-500 to-green-400 p-1.5 rounded-lg">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-white">ChargeID</span>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 px-5 pt-8 pb-6">
        <h2 className="text-white text-xl mb-2">Charging Sessions</h2>
        <p className="text-slate-400 text-sm">View your charging history and active sessions</p>
      </div>

      <div className="px-5 py-6 space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 mb-2">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
            <Calendar className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <div className="text-white text-sm">47</div>
            <div className="text-slate-400 text-xs">Sessions</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
            <Zap className="w-4 h-4 text-green-400 mx-auto mb-1" />
            <div className="text-white text-sm">1,240</div>
            <div className="text-slate-400 text-xs">kWh</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
            <DollarSign className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
            <div className="text-white text-sm">$218</div>
            <div className="text-slate-400 text-xs">Total</div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="space-y-3">
          {sessions.map((session) => (
            <Card 
              key={session.id}
              className="bg-slate-800/50 border-slate-700 p-4 hover:bg-slate-800/70 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white text-sm">{session.station}</h3>
                    {session.status === 'ongoing' && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                        Live
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                    <Clock className="w-3 h-3" />
                    <span>{session.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <MapPin className="w-3 h-3" />
                    <span>{session.location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 mb-1">{session.cost}</div>
                  <div className="text-slate-400 text-xs">{session.duration}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700">
                <div className="flex items-center gap-2">
                  <Battery className="w-3 h-3 text-blue-400" />
                  <div>
                    <div className="text-slate-400 text-xs">Energy</div>
                    <div className="text-white text-xs">{session.energy}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-purple-400" />
                  <div>
                    <div className="text-slate-400 text-xs">Duration</div>
                    <div className="text-white text-xs">{session.duration}</div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}