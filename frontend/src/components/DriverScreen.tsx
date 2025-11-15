import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { MapComponent } from './MapComponent';
import { 
  Zap, 
  User, 
  Car, 
  CheckCircle2, 
  Menu, 
  ArrowLeft,
  Clock,
  DollarSign,
  Gauge,
  Battery,
  TrendingDown,
  Leaf,
  Brain,
  Info,
  MapPin
} from 'lucide-react';

export function DriverScreen() {
  const [currentSoC, setCurrentSoC] = useState(40);
  const [targetSoC, setTargetSoC] = useState(80);
  const [preferenceMode, setPreferenceMode] = useState<'cheapest' | 'fastest' | 'balanced'>('balanced');
  const [departureTime, setDepartureTime] = useState('15:00');
  const [planGenerated, setPlanGenerated] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [handshakeStep, setHandshakeStep] = useState(0);
  const [showAnalyzing, setShowAnalyzing] = useState(true);

  const chargingPlanData = [
    { time: '10:00', power: 0, cost: 'low' },
    { time: '10:15', power: 2, cost: 'low' },
    { time: '10:30', power: 3, cost: 'low' },
    { time: '10:45', power: 4, cost: 'low' },
    { time: '11:00', power: 5, cost: 'medium' },
    { time: '11:15', power: 6, cost: 'medium' },
    { time: '11:30', power: 7, cost: 'medium' },
    { time: '11:45', power: 8, cost: 'high' },
    { time: '12:00', power: 9, cost: 'high' },
    { time: '12:15', power: 10, cost: 'high' },
    { time: '12:30', power: 8, cost: 'medium' },
    { time: '12:45', power: 6, cost: 'low' },
    { time: '13:00', power: 5, cost: 'low' },
    { time: '13:15', power: 4, cost: 'low' },
    { time: '13:30', power: 3, cost: 'low' },
    { time: '13:45', power: 2, cost: 'low' },
    { time: '14:00', power: 0, cost: 'low' },
  ];

  const handleGeneratePlan = () => {
    setIsAnimating(true);
    setHandshakeStep(0);
    setPlanGenerated(false);
    setShowAnalyzing(true);
    
    // Animate handshake steps
    setTimeout(() => setHandshakeStep(1), 500);
    setTimeout(() => setHandshakeStep(2), 1500);
    setTimeout(() => setHandshakeStep(3), 2500);
    setTimeout(() => {
      setIsAnimating(false);
      setPlanGenerated(true);
      // Hide analyzing message after 1.5 seconds
      setTimeout(() => setShowAnalyzing(false), 1500);
    }, 3500);
  };

  const handleBackToPreferences = () => {
    setPlanGenerated(false);
    setIsAnimating(false);
    setShowAnalyzing(true);
    setHandshakeStep(0);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Mobile Phone Frame */}
      <div className="relative w-full max-w-[400px] h-[844px] bg-slate-950 rounded-[3rem] shadow-2xl border-8 border-slate-800 overflow-hidden">
        {/* Phone Notch */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-slate-950 rounded-b-3xl z-50"></div>
        
        {/* Phone Screen Content */}
        <div className="h-full overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-950 px-5 py-8">
          {/* Mobile App Header */}
          <div className="flex items-center justify-between mb-6 pt-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-400 hover:text-white p-2"
              onClick={handleBackToPreferences}
              disabled={!planGenerated && !isAnimating}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-blue-500 to-green-400 p-1.5 rounded-lg">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-white">ChargeID</span>
            </div>
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white p-2">
              <Menu className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Session Title */}
            <div className="text-center mb-2">
              <h2 className="text-white text-lg">My Charging Session</h2>
              <p className="text-slate-400 text-xs mt-1">Optimize your charge</p>
            </div>

            {/* Initial Form - Show only when plan is not being generated */}
            {!isAnimating && !planGenerated && (
              <>
                {/* Authentication Status - Compact */}
                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <h3 className="text-white text-sm">Authentication</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                      Driver ✓
                    </Badge>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                      Vehicle ✓
                    </Badge>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                      Charger ✓
                    </Badge>
                  </div>
                </Card>

                {/* Vehicle Info - Compact */}
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

                {/* Charging Preferences */}
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

                    {/* Preference Mode Toggle - Mobile Optimized */}
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
                      onClick={handleGeneratePlan}
                      disabled={isAnimating}
                      className="w-full bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white text-sm py-3 disabled:opacity-50"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      {isAnimating ? 'Negotiating...' : 'Generate Charging Plan'}
                    </Button>
                  </div>
                </Card>
              </>
            )}

            {/* 3-Way Handshake Animation */}
            {isAnimating && (
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-cyan-500/5 to-green-500/5 animate-pulse"></div>
                
                <div className="relative z-10">
                  <div className="text-center mb-4">
                    <h3 className="text-white text-sm mb-1">DID Handshake in Progress</h3>
                    <p className="text-slate-400 text-xs">Establishing secure connection...</p>
                  </div>

                  {/* Three Nodes in Triangle */}
                  <div className="relative h-56 flex items-center justify-center mb-8">
                    {/* Driver Node (Top) */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
                      <div className={`relative transition-all duration-500 ${handshakeStep >= 1 ? 'scale-110' : 'scale-100'}`}>
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
                          handshakeStep >= 1 
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/50' 
                            : 'bg-slate-700'
                        }`}>
                          <User className={`w-8 h-8 ${handshakeStep >= 1 ? 'text-white' : 'text-slate-500'}`} />
                        </div>
                        {handshakeStep >= 1 && (
                          <>
                            <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-75"></div>
                            <div className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                              <span className="text-blue-400 text-xs">Driver DID</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Vehicle Node (Bottom Left) */}
                    <div className="absolute bottom-0 left-4">
                      <div className={`relative transition-all duration-500 ${handshakeStep >= 2 ? 'scale-110' : 'scale-100'}`}>
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
                          handshakeStep >= 2 
                            ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/50' 
                            : 'bg-slate-700'
                        }`}>
                          <Car className={`w-8 h-8 ${handshakeStep >= 2 ? 'text-white' : 'text-slate-500'}`} />
                        </div>
                        {handshakeStep >= 2 && (
                          <>
                            <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></div>
                            <div className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                              <span className="text-green-400 text-xs">Vehicle DID</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Charger Node (Bottom Right) */}
                    <div className="absolute bottom-0 right-4">
                      <div className={`relative transition-all duration-500 ${handshakeStep >= 3 ? 'scale-110' : 'scale-100'}`}>
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
                          handshakeStep >= 3 
                            ? 'bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg shadow-cyan-500/50' 
                            : 'bg-slate-700'
                        }`}>
                          <Zap className={`w-8 h-8 ${handshakeStep >= 3 ? 'text-white' : 'text-slate-500'}`} />
                        </div>
                        {handshakeStep >= 3 && (
                          <>
                            <div className="absolute inset-0 rounded-full bg-cyan-500 animate-ping opacity-75"></div>
                            <div className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                              <span className="text-cyan-400 text-xs">Charger DID</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Connection Lines - Animated SVG */}
                    <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                      {/* Driver to Vehicle */}
                      {handshakeStep >= 1 && (
                        <line
                          x1="50%"
                          y1="32"
                          x2="25%"
                          y2="75%"
                          stroke="url(#gradient1)"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                          className="animate-dash"
                        />
                      )}
                      
                      {/* Vehicle to Charger */}
                      {handshakeStep >= 2 && (
                        <line
                          x1="25%"
                          y1="75%"
                          x2="75%"
                          y2="75%"
                          stroke="url(#gradient2)"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                          className="animate-dash"
                          style={{ animationDelay: '0.3s' }}
                        />
                      )}
                      
                      {/* Charger to Driver */}
                      {handshakeStep >= 3 && (
                        <line
                          x1="75%"
                          y1="75%"
                          x2="50%"
                          y2="32"
                          stroke="url(#gradient3)"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                          className="animate-dash"
                          style={{ animationDelay: '0.6s' }}
                        />
                      )}
                      
                      <defs>
                        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#22c55e" />
                        </linearGradient>
                        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#22c55e" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                        <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#06b6d4" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  {/* Status Messages */}
                  <div className="space-y-2">
                    <div className={`flex items-center gap-2 transition-opacity duration-300 ${handshakeStep >= 1 ? 'opacity-100' : 'opacity-30'}`}>
                      <CheckCircle2 className={`w-3 h-3 ${handshakeStep >= 1 ? 'text-blue-400' : 'text-slate-600'}`} />
                      <span className={`text-xs ${handshakeStep >= 1 ? 'text-blue-400' : 'text-slate-500'}`}>
                        Driver authenticated
                      </span>
                    </div>
                    <div className={`flex items-center gap-2 transition-opacity duration-300 ${handshakeStep >= 2 ? 'opacity-100' : 'opacity-30'}`}>
                      <CheckCircle2 className={`w-3 h-3 ${handshakeStep >= 2 ? 'text-green-400' : 'text-slate-600'}`} />
                      <span className={`text-xs ${handshakeStep >= 2 ? 'text-green-400' : 'text-slate-500'}`}>
                        Vehicle connected
                      </span>
                    </div>
                    <div className={`flex items-center gap-2 transition-opacity duration-300 ${handshakeStep >= 3 ? 'opacity-100' : 'opacity-30'}`}>
                      <CheckCircle2 className={`w-3 h-3 ${handshakeStep >= 3 ? 'text-cyan-400' : 'text-slate-600'}`} />
                      <span className={`text-xs ${handshakeStep >= 3 ? 'text-cyan-400' : 'text-slate-500'}`}>
                        Charger synchronized
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* AI Charging Assistant */}
            {planGenerated && (
              <>
                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <h3 className="text-white text-sm">AI Assistant</h3>
                  </div>
                  
                  {/* Chat Messages - Mobile Optimized */}
                  <div className="space-y-3 mb-4">
                    {showAnalyzing && (
                      <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl rounded-tl-sm p-3 transition-opacity duration-300">
                        <p className="text-slate-200 text-xs">
                          Analyzing your preferences and current energy prices...
                        </p>
                      </div>
                    )}
                    
                    {/* Success Message - Enhanced */}
                    <div className="relative bg-gradient-to-br from-emerald-900/40 via-green-900/30 to-teal-900/40 border border-green-500/40 rounded-2xl rounded-tl-sm p-4 backdrop-blur-sm overflow-hidden">
                      {/* Animated shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/10 to-transparent animate-shimmer"></div>
                      
                      <div className="relative flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <p className="text-white text-xs leading-relaxed">
                            <span className="text-green-400">Charging optimized successfully!</span>
                          </p>
                          <div className="space-y-1.5 bg-slate-900/40 rounded-lg p-2.5 border border-green-500/20">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-300 text-xs">Target Battery</span>
                              <span className="text-green-400 font-mono">{targetSoC}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-300 text-xs">Ready By</span>
                              <span className="text-blue-400 font-mono">{departureTime}</span>
                            </div>
                            <div className="flex items-center justify-between pt-1.5 border-t border-slate-700/50">
                              <span className="text-slate-300 text-xs">Cost Savings</span>
                              <div className="flex items-center gap-1">
                                <TrendingDown className="w-3 h-3 text-green-400" />
                                <span className="text-green-400 font-mono">17%</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-slate-400 text-xs italic">
                            vs. fast charging at current rates
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Tip Message - Enhanced */}
                    <div className="relative bg-gradient-to-br from-purple-900/40 via-pink-900/30 to-fuchsia-900/40 border border-purple-500/40 rounded-2xl rounded-tl-sm p-4 backdrop-blur-sm overflow-hidden">
                      {/* Subtle glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/5 to-transparent"></div>
                      
                      <div className="relative flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                          <Brain className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-purple-300 text-xs">AI Insight</span>
                            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs px-1.5 py-0">
                              Smart
                            </Badge>
                          </div>
                          <p className="text-slate-200 text-xs leading-relaxed">
                            We'll <span className="text-purple-300">intelligently delay</span> charging during peak hours to maximize your savings.
                          </p>
                          <div className="flex items-center gap-2 bg-slate-900/40 rounded-lg px-2.5 py-1.5 border border-purple-500/20">
                            <Clock className="w-3 h-3 text-purple-400 flex-shrink-0" />
                            <span className="text-xs text-slate-300">Peak window avoided:</span>
                            <span className="text-purple-300 text-xs font-mono">11:45-12:15</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Charging Plan Result - Main Card */}
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
                      onClick={handleBackToPreferences}
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
              </>
            )}

            {/* Bottom Padding for scrolling */}
            <div className="h-8"></div>
          </div>
        </div>
      </div>
    </div>
  );
}