import { BarChart3, TrendingUp, Zap, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Legend } from 'recharts';

export function OperatorScreen() {
  const activeSessions = [
    {
      vehicleDID: 'did:v:8x7a...9f2c',
      driverDID: 'did:d:3k9s...4h1m',
      currentSoC: 42,
      targetSoC: 85,
      departure: '15:00',
      chargerDID: 'did:c:2p4r...7n8k',
      status: 'charging'
    },
    {
      vehicleDID: 'did:v:5m2n...6p9q',
      driverDID: 'did:d:7t3w...8x4y',
      currentSoC: 28,
      targetSoC: 90,
      departure: '16:30',
      chargerDID: 'did:c:9s8d...3f2g',
      status: 'charging'
    },
    {
      vehicleDID: 'did:v:1a3b...2c5d',
      driverDID: 'did:d:4e6f...7g8h',
      currentSoC: 55,
      targetSoC: 80,
      departure: '14:00',
      chargerDID: 'did:c:6h7j...4k9l',
      status: 'optimized-delay'
    },
    {
      vehicleDID: 'did:v:9p8o...7i6u',
      driverDID: 'did:d:5y4t...3r2e',
      currentSoC: 65,
      targetSoC: 95,
      departure: '17:45',
      chargerDID: 'did:c:2w3e...1q0a',
      status: 'charging'
    },
  ];

  const loadForecastData = [
    { time: '10:00', totalLoad: 12, capacity: 50, vehicle1: 3, vehicle2: 4, vehicle3: 3, vehicle4: 2, tariff: 'low' },
    { time: '10:30', totalLoad: 18, capacity: 50, vehicle1: 5, vehicle2: 6, vehicle3: 4, vehicle4: 3, tariff: 'low' },
    { time: '11:00', totalLoad: 25, capacity: 50, vehicle1: 7, vehicle2: 8, vehicle3: 5, vehicle4: 5, tariff: 'medium' },
    { time: '11:30', totalLoad: 32, capacity: 50, vehicle1: 9, vehicle2: 10, vehicle3: 7, vehicle4: 6, tariff: 'medium' },
    { time: '12:00', totalLoad: 28, capacity: 50, vehicle1: 8, vehicle2: 9, vehicle3: 6, vehicle4: 5, tariff: 'high' },
    { time: '12:30', totalLoad: 22, capacity: 50, vehicle1: 6, vehicle2: 7, vehicle3: 5, vehicle4: 4, tariff: 'high' },
    { time: '13:00', totalLoad: 18, capacity: 50, vehicle1: 5, vehicle2: 6, vehicle3: 4, vehicle4: 3, tariff: 'medium' },
    { time: '13:30', totalLoad: 14, capacity: 50, vehicle1: 4, vehicle2: 5, vehicle3: 3, vehicle4: 2, tariff: 'low' },
    { time: '14:00', totalLoad: 10, capacity: 50, vehicle1: 3, vehicle2: 4, vehicle3: 2, vehicle4: 1, tariff: 'low' },
    { time: '14:30', totalLoad: 8, capacity: 50, vehicle1: 2, vehicle2: 3, vehicle3: 2, vehicle4: 1, tariff: 'low' },
    { time: '15:00', totalLoad: 5, capacity: 50, vehicle1: 1, vehicle2: 2, vehicle3: 1, vehicle4: 1, tariff: 'low' },
  ];

  const chargers = [
    { did: 'did:c:2p4r...7n8k', status: 'charging', maxKw: 11, allocated: 8.5 },
    { did: 'did:c:9s8d...3f2g', status: 'charging', maxKw: 22, allocated: 15.2 },
    { did: 'did:c:6h7j...4k9l', status: 'optimized-delay', maxKw: 11, allocated: 0 },
    { did: 'did:c:2w3e...1q0a', status: 'charging', maxKw: 50, allocated: 35.8 },
    { did: 'did:c:5r6t...9y8u', status: 'idle', maxKw: 11, allocated: 0 },
    { did: 'did:c:3i4o...7p6a', status: 'idle', maxKw: 22, allocated: 0 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'charging':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'optimized-delay':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'idle':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-green-400 p-3 rounded-xl">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-white">Operator Dashboard</h1>
              <p className="text-slate-400">Real-time fleet and energy optimization using DID-secured data</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-600/20 to-blue-500/10 border-blue-500/30 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active Sessions</p>
                <p className="text-white text-2xl mt-1">4</p>
              </div>
              <Zap className="w-8 h-8 text-blue-400" />
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-green-600/20 to-green-500/10 border-green-500/30 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Current Load</p>
                <p className="text-white text-2xl mt-1">28 kW</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-purple-600/20 to-purple-500/10 border-purple-500/30 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Capacity Used</p>
                <p className="text-white text-2xl mt-1">56%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-400" />
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-cyan-600/20 to-cyan-500/10 border-cyan-500/30 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Cost Savings</p>
                <p className="text-white text-2xl mt-1">18%</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-cyan-400" />
            </div>
          </Card>
        </div>

        {/* Active Sessions Table */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-6">
          <h2 className="text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-400" />
            Active Charging Sessions
          </h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-slate-700/50">
                  <TableHead className="text-slate-300">Vehicle DID</TableHead>
                  <TableHead className="text-slate-300">Driver DID</TableHead>
                  <TableHead className="text-slate-300">Current SoC</TableHead>
                  <TableHead className="text-slate-300">Target SoC</TableHead>
                  <TableHead className="text-slate-300">Departure</TableHead>
                  <TableHead className="text-slate-300">Charger DID</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeSessions.map((session, index) => (
                  <TableRow key={index} className="border-slate-700 hover:bg-slate-700/50">
                    <TableCell>
                      <Badge variant="outline" className="border-slate-600 text-slate-300 font-mono text-xs">
                        {session.vehicleDID}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-slate-600 text-slate-300 font-mono text-xs">
                        {session.driverDID}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-300">{session.currentSoC}%</TableCell>
                    <TableCell className="text-slate-300">{session.targetSoC}%</TableCell>
                    <TableCell className="text-slate-300">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {session.departure}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-slate-600 text-slate-300 font-mono text-xs">
                        {session.chargerDID}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(session.status)}>
                        {session.status === 'charging' ? 'Charging' : 'Optimized Delay'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Site Load Forecast */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-6">
          <h2 className="text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Site Load Forecast
          </h2>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={loadForecastData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3A89FF" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3A89FF" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="time" 
                  stroke="#94a3b8"
                />
                <YAxis 
                  stroke="#94a3b8"
                  label={{ value: 'kW', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend 
                  wrapperStyle={{ color: '#94a3b8' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="capacity" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Site Capacity Limit"
                />
                <Area 
                  type="monotone" 
                  dataKey="totalLoad" 
                  stroke="#3A89FF" 
                  strokeWidth={2}
                  fill="url(#colorTotal)"
                  name="Total Load"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-400 rounded-sm"></div>
              <span className="text-slate-400">Site Capacity (50 kW)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>
              <span className="text-slate-400">Planned Aggregate Load</span>
            </div>
          </div>
        </Card>

        {/* Charger Overview & Optimization Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Charger Overview */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-6">
            <h2 className="text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Charger Overview
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {chargers.map((charger, index) => (
                <div 
                  key={index}
                  className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="border-slate-600 text-slate-300 font-mono text-xs">
                      {charger.did}
                    </Badge>
                    <Badge className={getStatusColor(charger.status)}>
                      {charger.status === 'charging' ? 'Charging' : charger.status === 'optimized-delay' ? 'Delayed' : 'Idle'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-slate-400">Max Power</p>
                      <p className="text-white">{charger.maxKw} kW</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Allocated</p>
                      <p className="text-white">{charger.allocated} kW</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Optimization Insights */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-6">
            <h2 className="text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              Optimization Insights
            </h2>
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-green-400">2 vehicles delayed to avoid peak prices</p>
                    <p className="text-slate-400 text-sm mt-1">
                      Optimizing charge scheduling based on time-of-use tariffs
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-blue-400">Site remains under 50 kW limit</p>
                    <p className="text-slate-400 text-sm mt-1">
                      Dynamic load balancing prevents grid overload
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-cyan-400 mt-0.5" />
                  <div>
                    <p className="text-cyan-400">Projected cost savings: 18% vs. dumb charging</p>
                    <p className="text-slate-400 text-sm mt-1">
                      AI-optimized scheduling reduces energy costs
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-purple-400 mt-0.5" />
                  <div>
                    <p className="text-purple-400">All departure deadlines will be met</p>
                    <p className="text-slate-400 text-sm mt-1">
                      Guaranteed SoC targets achieved before scheduled departure
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
