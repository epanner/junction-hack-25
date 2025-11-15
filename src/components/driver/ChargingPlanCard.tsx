import { Brain, DollarSign, Clock, Battery, Info, Zap, TrendingDown, Leaf, CheckCircle2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { MapComponent } from '../MapComponent';

interface ChargingPlanCardProps {
  onModifyPlan: () => void;
  chargingPlanData: Array<{ time: string; power: number; cost: string }>;
}

export function ChargingPlanCard({ onModifyPlan, chargingPlanData }: ChargingPlanCardProps) {
  return (
    <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 backdrop-blur-sm p-4 relative overflow-hidden">
      {/* Accent glow effect */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-green-500"></div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-[#00FFA7]" />
          <h3 className="text-white text-sm">Optimized Charging Plan</h3>
        </div>
        <Badge className="bg-[#00FFA7]/20 text-[#00FFA7] border-[#00FFA7]/30 text-xs">
          AI Generated
        </Badge>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
          <DollarSign className="w-4 h-4 text-green-400 mx-auto mb-1" />
          <div className="text-white text-sm">$4.32</div>
          <div className="text-slate-400 text-xs">Total Cost</div>
          <div className="text-green-400 text-xs mt-1">-17%</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
          <Clock className="w-4 h-4 text-blue-400 mx-auto mb-1" />
          <div className="text-white text-sm">4h 15m</div>
          <div className="text-slate-400 text-xs">Duration</div>
          <div className="text-blue-400 text-xs mt-1">On Time</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
          <Battery className="w-4 h-4 text-purple-400 mx-auto mb-1" />
          <div className="text-white text-sm">24 kWh</div>
          <div className="text-slate-400 text-xs">Energy</div>
          <div className="text-purple-400 text-xs mt-1">40% Added</div>
        </div>
      </div>

      {/* Power Curve Chart */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <p className="text-slate-300 text-xs">Power Allocation Timeline</p>
          <Info className="w-3 h-3 text-slate-500" />
        </div>
        <div className="bg-slate-900/50 rounded-lg p-2 border border-slate-700">
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={chargingPlanData}>
              <defs>
                <linearGradient id="colorPowerMobile" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00FFA7" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#00FFA7" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="time" 
                stroke="#94a3b8"
                tick={{ fontSize: 8 }}
              />
              <YAxis 
                stroke="#94a3b8"
                tick={{ fontSize: 8 }}
                width={30}
                label={{ value: 'kW', angle: -90, position: 'insideLeft', fontSize: 8, fill: '#94a3b8' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '10px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="power" 
                stroke="#00FFA7" 
                strokeWidth={2}
                fill="url(#colorPowerMobile)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-3 text-xs justify-center">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-slate-400">Low Rate</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span className="text-slate-400">Med Rate</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <span className="text-slate-400">Peak Rate</span>
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="bg-gradient-to-br from-[#00FFA7]/5 to-cyan-500/5 border border-[#00FFA7]/20 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-3 h-3 text-[#00FFA7]" />
          <span className="text-[#00FFA7] text-xs">AI Optimization Insights</span>
        </div>
        <ul className="space-y-2 text-xs text-slate-300">
          <li className="flex items-start gap-2">
            <TrendingDown className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
            <span>Charging shifted to off-peak hours (10:00-11:00) saves $0.89</span>
          </li>
          <li className="flex items-start gap-2">
            <Leaf className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
            <span>63% of energy from renewable sources during this window</span>
          </li>
          <li className="flex items-start gap-2">
            <Battery className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
            <span>Battery health optimized with gradual charging curve</span>
          </li>
        </ul>
      </div>

      {/* Timeline Breakdown */}
      <div className="space-y-2 mb-4">
        <p className="text-slate-300 text-xs mb-2">Charging Schedule</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between bg-slate-800/30 rounded-lg p-2 border border-slate-700/50">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-8 bg-gradient-to-b from-green-400 to-green-500 rounded-full"></div>
              <div>
                <div className="text-white text-xs">Phase 1: Ramp Up</div>
                <div className="text-slate-400 text-xs">10:00 - 11:00</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-green-400 text-xs">$0.12/kWh</div>
              <div className="text-slate-400 text-xs">2-5 kW</div>
            </div>
          </div>

          <div className="flex items-center justify-between bg-slate-800/30 rounded-lg p-2 border border-slate-700/50">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-8 bg-gradient-to-b from-yellow-400 to-red-500 rounded-full"></div>
              <div>
                <div className="text-white text-xs">Phase 2: Peak Power</div>
                <div className="text-slate-400 text-xs">11:00 - 12:30</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-yellow-400 text-xs">$0.18/kWh</div>
              <div className="text-slate-400 text-xs">6-10 kW</div>
            </div>
          </div>

          <div className="flex items-center justify-between bg-slate-800/30 rounded-lg p-2 border border-slate-700/50">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-8 bg-gradient-to-b from-blue-400 to-green-400 rounded-full"></div>
              <div>
                <div className="text-white text-xs">Phase 3: Taper</div>
                <div className="text-slate-400 text-xs">12:30 - 14:00</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-green-400 text-xs">$0.10/kWh</div>
              <div className="text-slate-400 text-xs">2-5 kW</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button 
          onClick={onModifyPlan}
          className="bg-slate-800/80 border border-slate-600/50 text-slate-300 hover:bg-slate-700 hover:border-slate-500 text-xs py-2"
        >
          Modify Plan
        </Button>
        <Button 
          className="bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white text-xs py-2"
        >
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Accept & Start
        </Button>
      </div>

      {/* Additional Info */}
      <div className="mt-3 pt-3 border-t border-slate-700/50">
        <div className="flex items-center justify-between text-xs mb-3">
          <span className="text-slate-400">Negotiated with</span>
          <span className="text-slate-300">Station #42 • 2.3 km away</span>
        </div>

        {/* Station Location Map */}
        <MapComponent 
          userLat={37.7749}
          userLng={-122.4194}
          stationLat={37.7849}
          stationLng={-122.4094}
          stationName="Station #42"
          distance="2.3 km"
        />
      </div>
    </Card>
  );
}
