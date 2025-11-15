import { Clock, DollarSign, Zap, Gauge } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';

interface ChargingPreferencesProps {
  targetSoC: number;
  setTargetSoC: (value: number) => void;
  departureTime: string;
  setDepartureTime: (value: string) => void;
  preferenceMode: 'cheapest' | 'fastest' | 'balanced';
  setPreferenceMode: (mode: 'cheapest' | 'fastest' | 'balanced') => void;
  onGeneratePlan: () => void;
  isAnimating: boolean;
}

export function ChargingPreferences({
  targetSoC,
  setTargetSoC,
  departureTime,
  setDepartureTime,
  preferenceMode,
  setPreferenceMode,
  onGeneratePlan,
  isAnimating
}: ChargingPreferencesProps) {
  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-4">
      <h3 className="text-white text-sm mb-4">Charging Preferences</h3>
      
      <div className="space-y-4">
        {/* Target SoC Slider */}
        <div className="space-y-2">
          <label className="text-slate-300 text-xs">
            Target Battery Percentage: <span className="text-white">{targetSoC}%</span>
          </label>
          <Slider
            value={[targetSoC]}
            onValueChange={(value) => setTargetSoC(value[0])}
            min={50}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        {/* Departure Time */}
        <div className="space-y-2">
          <label className="text-slate-300 text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Departure Time
          </label>
          <input
            type="time"
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
            className="w-full bg-slate-700 border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Preference Mode Toggle */}
        <div className="space-y-2">
          <label className="text-slate-300 text-xs">Optimization Mode</label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={() => setPreferenceMode('cheapest')}
              variant={preferenceMode === 'cheapest' ? 'default' : 'outline'}
              className={`text-xs py-2 ${preferenceMode === 'cheapest' 
                ? 'bg-green-900/50 border-green-700 text-green-300 hover:bg-green-900/70' 
                : 'border-slate-600 bg-slate-800/30 text-slate-400 hover:bg-slate-700/50 hover:text-slate-300'
              }`}
            >
              <DollarSign className="w-3 h-3 mr-1" />
              Cheap
            </Button>
            <Button
              onClick={() => setPreferenceMode('fastest')}
              variant={preferenceMode === 'fastest' ? 'default' : 'outline'}
              className={`text-xs py-2 ${preferenceMode === 'fastest' 
                ? 'bg-blue-900/50 border-blue-700 text-blue-300 hover:bg-blue-900/70' 
                : 'border-slate-600 bg-slate-800/30 text-slate-400 hover:bg-slate-700/50 hover:text-slate-300'
              }`}
            >
              <Zap className="w-3 h-3 mr-1" />
              Fast
            </Button>
            <Button
              onClick={() => setPreferenceMode('balanced')}
              variant={preferenceMode === 'balanced' ? 'default' : 'outline'}
              className={`text-xs py-2 ${preferenceMode === 'balanced' 
                ? 'bg-purple-900/50 border-purple-700 text-purple-300 hover:bg-purple-900/70' 
                : 'border-slate-600 bg-slate-800/30 text-slate-400 hover:bg-slate-700/50 hover:text-slate-300'
              }`}
            >
              <Gauge className="w-3 h-3 mr-1" />
              Balance
            </Button>
          </div>
        </div>

        {/* Generate Plan Button */}
        <Button 
          onClick={onGeneratePlan}
          disabled={isAnimating}
          className="w-full bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white text-sm py-3 disabled:opacity-50"
        >
          <Zap className="w-4 h-4 mr-2" />
          {isAnimating ? 'Negotiating...' : 'Generate Charging Plan'}
        </Button>
      </div>
    </Card>
  );
}
