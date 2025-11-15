import { Car } from 'lucide-react';
import { Card } from '../ui/card';

interface VehicleInfoProps {
  currentSoC: number;
}

export function VehicleInfo({ currentSoC }: VehicleInfoProps) {
  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <Car className="w-4 h-4 text-blue-400" />
        <h3 className="text-white text-sm">Vehicle Info</h3>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <div className="text-xs text-slate-400 mb-1">Current SoC</div>
          <div className="text-white">{currentSoC}%</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 mb-1">Capacity</div>
          <div className="text-white">60 kWh</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 mb-1">Max Power</div>
          <div className="text-white">11 kW</div>
        </div>
      </div>
    </Card>
  );
}
