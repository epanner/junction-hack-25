import { MapPin, Zap, Clock, DollarSign, Battery, ChevronDown, CheckCircle2, Gauge, TrendingUp, DollarSign as Cost } from 'lucide-react';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Badge } from '../ui/badge';
import { useState } from 'react';

interface Station {
  id: string;
  name: string;
  lat: number;
  lng: number;
  available: number;
  total: number;
  power: string;
  price: string;
  distance?: string;
}

interface BookingSheetProps {
  selectedStation: Station | null;
  targetSoC: number;
  setTargetSoC: (value: number) => void;
  departureTime: string;
  setDepartureTime: (value: string) => void;
  onBook: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isSmartMode: boolean;
}

type OptimizationMode = 'cost' | 'speed' | 'balanced';

export function BookingSheet({
  selectedStation,
  targetSoC,
  setTargetSoC,
  departureTime,
  setDepartureTime,
  onBook,
  isExpanded,
  onToggleExpand,
  isSmartMode
}: BookingSheetProps) {
  const [currentBattery] = useState(45); // Current battery percentage
  const [optimizationMode, setOptimizationMode] = useState<OptimizationMode>('balanced');
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleCalculate = () => {
    setIsCalculating(true);
    setShowResult(false);
    
    // Simulate the three-way handshake animation (3 seconds)
    setTimeout(() => {
      setIsCalculating(false);
      setShowResult(true);
    }, 3000);
  };

  // Smart Mode View - Charging Preferences Form
  if (isSmartMode && !showResult) {
    return (
      <div className="absolute bottom-0 left-0 right-0 bg-slate-900 rounded-t-3xl shadow-2xl transition-all duration-300"
        style={{ height: isExpanded ? '70%' : '70%' }}
      >
        {/* Drag Handle */}
        <div 
          className="flex justify-center pt-2 pb-3 cursor-pointer"
          onClick={onToggleExpand}
        >
          <div className="w-12 h-1 bg-slate-600 rounded-full"></div>
        </div>

        <div className="px-5 pb-6 overflow-y-auto" style={{ height: 'calc(100% - 24px)' }}>
          {isCalculating ? (
            // Three-way handshake animation
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-center space-y-6">
                <h3 className="text-white text-lg">🤝 Negotiating Best Deal</h3>
                <div className="flex items-center justify-center gap-4">
                  {/* Driver */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center animate-pulse">
                      <span className="text-2xl">🚗</span>
                    </div>
                    <span className="text-slate-400 text-xs mt-2">Driver</span>
                  </div>

                  {/* Animated arrows */}
                  <div className="flex flex-col gap-2">
                    <div className="text-[#00FFA7] text-2xl animate-ping">→</div>
                    <div className="text-green-400 text-2xl animate-ping" style={{ animationDelay: '0.5s' }}>←</div>
                  </div>

                  {/* ChargeID AI */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00FFA7] to-green-500 flex items-center justify-center animate-pulse" style={{ animationDelay: '0.3s' }}>
                      <span className="text-2xl">🤖</span>
                    </div>
                    <span className="text-[#00FFA7] text-xs mt-2">ChargeID AI</span>
                  </div>

                  {/* Animated arrows */}
                  <div className="flex flex-col gap-2">
                    <div className="text-[#00FFA7] text-2xl animate-ping" style={{ animationDelay: '0.2s' }}>→</div>
                    <div className="text-green-400 text-2xl animate-ping" style={{ animationDelay: '0.7s' }}>←</div>
                  </div>

                  {/* Operator */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center animate-pulse" style={{ animationDelay: '0.6s' }}>
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-slate-400 text-xs mt-2">Operator</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-slate-300 text-sm animate-pulse">Analyzing charging options...</div>
                  <div className="text-slate-300 text-sm animate-pulse" style={{ animationDelay: '0.5s' }}>Negotiating optimal price...</div>
                  <div className="text-slate-300 text-sm animate-pulse" style={{ animationDelay: '1s' }}>Securing best time slot...</div>
                </div>
              </div>
            </div>
          ) : (
            // Charging Preferences Form
            <>
              <h3 className="text-white mb-4">⚡ Smart Charging Setup</h3>

              {/* Current Battery Info */}
              <div className="bg-slate-800/50 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 text-xs">Current Battery Level</span>
                  <span className="text-white">{currentBattery}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${currentBattery}%` }}
                  />
                </div>
              </div>

              {/* Target Battery */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 text-xs flex items-center gap-2">
                    <Battery className="w-3 h-3" />
                    Target Battery Level
                  </label>
                  <span className="text-white text-sm">{targetSoC}%</span>
                </div>
                <Slider
                  value={[targetSoC]}
                  onValueChange={(value) => setTargetSoC(value[0])}
                  min={currentBattery + 5}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="text-slate-400 text-[10px]">
                  Need to charge: {targetSoC - currentBattery}%
                </div>
              </div>

              {/* Ready By Time */}
              <div className="space-y-2 mb-4">
                <label className="text-slate-300 text-xs flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  Ready By
                </label>
                <input
                  type="time"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00FFA7]"
                />
              </div>

              {/* Optimization Mode */}
              <div className="space-y-2 mb-4">
                <label className="text-slate-300 text-xs">Optimize For</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setOptimizationMode('cost')}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border transition-all ${
                      optimizationMode === 'cost'
                        ? 'bg-green-500/20 border-green-500 text-green-400'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Cost className="w-4 h-4" />
                    <span className="text-[10px]">Cost</span>
                  </button>
                  <button
                    onClick={() => setOptimizationMode('speed')}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border transition-all ${
                      optimizationMode === 'speed'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Gauge className="w-4 h-4" />
                    <span className="text-[10px]">Speed</span>
                  </button>
                  <button
                    onClick={() => setOptimizationMode('balanced')}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border transition-all ${
                      optimizationMode === 'balanced'
                        ? 'bg-[#00FFA7]/20 border-[#00FFA7] text-[#00FFA7]'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-[10px]">Balanced</span>
                  </button>
                </div>
              </div>

              {/* Calculate Button */}
              <Button 
                onClick={handleCalculate}
                className="w-full bg-gradient-to-r from-[#00FFA7] to-green-500 hover:from-[#00FFA7]/90 hover:to-green-600 text-slate-900 py-3"
              >
                <Zap className="w-4 h-4 mr-2" />
                Calculate Best Charging
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Smart Mode Result View
  if (isSmartMode && showResult && selectedStation) {
    return (
      <div className="absolute bottom-0 left-0 right-0 bg-slate-900 rounded-t-3xl shadow-2xl transition-all duration-300"
        style={{ height: isExpanded ? '70%' : '70%' }}
      >
        {/* Drag Handle */}
        <div 
          className="flex justify-center pt-2 pb-3 cursor-pointer"
          onClick={onToggleExpand}
        >
          <div className="w-12 h-1 bg-slate-600 rounded-full"></div>
        </div>

        <div className="px-5 pb-6 overflow-y-auto" style={{ height: 'calc(100% - 24px)' }}>
          {/* Success Header */}
          <div className="text-center mb-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#00FFA7] to-green-500 rounded-full flex items-center justify-center mb-2">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-white mb-1">✨ Best Station Found!</h3>
            <p className="text-[#00FFA7] text-sm">AI-optimized for {optimizationMode}</p>
          </div>

          {/* Selected Station Info */}
          <div className="mb-4 pb-4 border-b border-slate-800">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-white mb-1">{selectedStation.name}</h3>
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <MapPin className="w-3 h-3" />
                  <span>{selectedStation.distance || '2.3 km away'}</span>
                </div>
              </div>
              <Badge className="bg-[#00FFA7]/20 text-[#00FFA7] border-[#00FFA7]/30">
                Recommended
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/50 rounded-lg p-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-3 h-3 text-blue-400" />
                  <span className="text-slate-400 text-xs">Max Power</span>
                </div>
                <div className="text-white text-sm">{selectedStation.power}</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-3 h-3 text-green-400" />
                  <span className="text-slate-400 text-xs">Price</span>
                </div>
                <div className="text-white text-sm">{selectedStation.price}</div>
              </div>
            </div>
          </div>

          {/* Charging Details */}
          <div className="space-y-3 mb-4">
            <h4 className="text-white text-sm">Charging Details</h4>
            
            <div className="bg-slate-800/50 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Current Level</span>
                <span className="text-white">{currentBattery}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Target Level</span>
                <span className="text-white">{targetSoC}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Energy Needed</span>
                <span className="text-white">~{Math.round((targetSoC - currentBattery) * 0.75)} kWh</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Ready By</span>
                <span className="text-white">{departureTime}</span>
              </div>
            </div>
          </div>

          {/* Estimated Cost & Time */}
          <div className="bg-gradient-to-br from-[#00FFA7]/20 to-green-900/30 border border-[#00FFA7]/50 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-300 text-xs">Negotiated Price</span>
              <span className="text-[#00FFA7]">~$4.20</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-xs">Estimated Time</span>
              <span className="text-blue-400">~38 min</span>
            </div>
            <div className="mt-2 pt-2 border-t border-[#00FFA7]/30">
              <span className="text-[#00FFA7] text-[10px]">💰 You save $0.80 with AI negotiation!</span>
            </div>
          </div>

          {/* Book Button */}
          <Button 
            onClick={onBook}
            className="w-full bg-gradient-to-r from-[#00FFA7] to-green-500 hover:from-[#00FFA7]/90 hover:to-green-600 text-slate-900 py-3"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Book Smart Charging
          </Button>
        </div>
      </div>
    );
  }

  // Manual Mode View (Original)
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-slate-900 rounded-t-3xl shadow-2xl transition-all duration-300"
      style={{ height: isExpanded ? '70%' : '280px' }}
    >
      {/* Drag Handle */}
      <div 
        className="flex justify-center pt-2 pb-3 cursor-pointer"
        onClick={onToggleExpand}
      >
        <div className="w-12 h-1 bg-slate-600 rounded-full"></div>
      </div>

      <div className="px-5 pb-6 overflow-y-auto" style={{ height: 'calc(100% - 24px)' }}>
        {selectedStation ? (
          <>
            {/* Selected Station Info */}
            <div className="mb-4 pb-4 border-b border-slate-800">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-white mb-1">{selectedStation.name}</h3>
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <MapPin className="w-3 h-3" />
                    <span>{selectedStation.distance || '2.3 km away'}</span>
                  </div>
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  {selectedStation.available}/{selectedStation.total} Available
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 rounded-lg p-2.5">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-3 h-3 text-blue-400" />
                    <span className="text-slate-400 text-xs">Max Power</span>
                  </div>
                  <div className="text-white text-sm">{selectedStation.power}</div>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-2.5">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-3 h-3 text-green-400" />
                    <span className="text-slate-400 text-xs">Price</span>
                  </div>
                  <div className="text-white text-sm">{selectedStation.price}</div>
                </div>
              </div>
            </div>

            {/* Charging Preferences */}
            <div className="space-y-4 mb-4">
              <h4 className="text-white text-sm">Charging Preferences</h4>
              
              {/* Target SoC */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 text-xs flex items-center gap-2">
                    <Battery className="w-3 h-3" />
                    Target Battery
                  </label>
                  <span className="text-white text-sm">{targetSoC}%</span>
                </div>
                <Slider
                  value={[targetSoC]}
                  onValueChange={(value) => setTargetSoC(value[0])}
                  min={50}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* Departure Time */}
              <div className="space-y-2">
                <label className="text-slate-300 text-xs flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  Ready By
                </label>
                <input
                  type="time"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Estimated Cost */}
            <div className="bg-gradient-to-br from-blue-900/30 to-green-900/30 border border-blue-700/50 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-300 text-xs">Estimated Cost</span>
                <span className="text-green-400">~$4.50</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-xs">Estimated Time</span>
                <span className="text-blue-400">~45 min</span>
              </div>
            </div>

            {/* Book Button */}
            <Button 
              onClick={onBook}
              className="w-full bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white py-3"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Book & Start Charging
            </Button>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-white mb-2">Select a Charging Station</h3>
            <p className="text-slate-400 text-sm">
              Tap on any charging station marker on the map to view details and book
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
