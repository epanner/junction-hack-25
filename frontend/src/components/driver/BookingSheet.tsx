import React, { useEffect, useMemo, useState } from 'react';
import {
  MapPin,
  Zap,
  Clock,
  DollarSign,
  Battery,
  ChevronDown,
  CheckCircle2,
  Gauge,
  TrendingUp,
  DollarSign as Cost,
  X,
  Play,
  Loader2,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Badge } from '../ui/badge';
import {
  bookChargingSession,
  cancelChargingSession,
  completeChargingSession,
  getVehicleBatteryStatus,
  getSmartChargingRecommendation,
  getDefaultLocation,
  type Station,
  type OptimizationMode,
  type SmartChargingRecommendation,
  type VehicleBatteryStatus,
  type ChargingSession,
} from '../../data_sources';

interface BookingSheetProps {
  selectedStation: Station | null;
  targetSoC: number;
  setTargetSoC: (value: number) => void;
  departureTime: string;
  setDepartureTime: (value: string) => void;
  onBook?: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isSmartMode: boolean;
}

export function BookingSheet({
  selectedStation,
  targetSoC,
  setTargetSoC,
  departureTime,
  setDepartureTime,
  onBook = () => undefined,
  isExpanded,
  onToggleExpand,
  isSmartMode,
}: BookingSheetProps) {
  const [batteryStatus, setBatteryStatus] = useState<VehicleBatteryStatus | null>(null);
  const [batteryError, setBatteryError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadBattery() {
      try {
        const status = await getVehicleBatteryStatus();
        if (!cancelled) {
          setBatteryStatus(status);
        }
      } catch (err) {
        if (!cancelled) {
          setBatteryError(err instanceof Error ? err.message : 'Unable to load battery status');
        }
      }
    }
    loadBattery();
    return () => {
      cancelled = true;
    };
  }, []);

  const currentBattery = batteryStatus?.currentSoC ?? 50;
  const userLocation = getDefaultLocation();
  
  const [optimizationMode, setOptimizationMode] = useState<OptimizationMode>('balanced');
  const [isCalculating, setIsCalculating] = useState(false);
  const [recommendation, setRecommendation] = useState<SmartChargingRecommendation | null>(null);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);
  const [activeSessionCard, setActiveSessionCard] = useState<{
    session: ChargingSession;
    station: Station;
    recommendation?: SmartChargingRecommendation | null;
    status: 'booked' | 'charging';
    chargingStartedAt?: Date;
  } | null>(null);
  const HEADER_SAFE_AREA_PX = 220;
  const MAX_EXPANDED_HEIGHT = `calc(100% - ${HEADER_SAFE_AREA_PX}px)`;
  const sheetHeights = {
    active: { collapsed: '48%', expanded: MAX_EXPANDED_HEIGHT },
    smartForm: { collapsed: '42%', expanded: MAX_EXPANDED_HEIGHT },
    smartResult: { collapsed: '60%', expanded: MAX_EXPANDED_HEIGHT },
    manual: { collapsed: '36%', expanded: MAX_EXPANDED_HEIGHT },
  } as const;
  const getSheetHeight = (mode: keyof typeof sheetHeights) =>
    isExpanded ? sheetHeights[mode].expanded : sheetHeights[mode].collapsed;

  const handleCalculate = async () => {
    setIsCalculating(true);
    setRecommendation(null);
    
    // Call the smart charging recommendation API
    try {
      const result = await getSmartChargingRecommendation({
        currentSoC: currentBattery,
        targetSoC,
        departureTime,
        optimizationMode,
        userLocation: {
          lat: userLocation.lat,
          lng: userLocation.lng,
        },
      });
      
      setRecommendation(result);
    } catch (error) {
      console.error('Failed to get recommendation:', error);
      // TODO: Show error message to user
    } finally {
      setIsCalculating(false);
    }
  };

  const handleBookingSession = async (forcedRecommendation?: SmartChargingRecommendation | null) => {
    if (!selectedStation) {
      setBookingStatus('error');
      setBookingMessage('Select a station to start charging.');
      return;
    }

    setBookingStatus('loading');
    setBookingMessage(null);

    try {
      const bookingResult = await bookChargingSession({
        station: selectedStation,
        currentSoC: currentBattery,
        targetSoC,
        departureTime,
        recommendation: forcedRecommendation ?? recommendation,
      });
      setBookingStatus('success');
      setBookingMessage('Session booked! Connector reserved.');
      setRecommendation(null);
      setActiveSessionCard({
        session: bookingResult.session,
        station: selectedStation,
        recommendation: forcedRecommendation ?? recommendation,
        status: 'booked',
      });
      onBook?.();
    } catch (err) {
      setBookingStatus('error');
      setBookingMessage(err instanceof Error ? err.message : 'Failed to book charging session.');
    }
  };

  const handleAcceptRecommendation = () => {
    void handleBookingSession(recommendation);
  };

  const handleDeclineRecommendation = () => {
    // Decline and go back to preferences form
    setRecommendation(null);
  };

  const renderBookingNotice = () =>
    bookingMessage ? (
      <div
        className={`mb-4 text-xs rounded-lg px-3 py-2 border text-white ${
          bookingStatus === 'error'
            ? 'bg-red-900/40 border-red-500/30'
            : 'bg-emerald-900/30 border-emerald-500/30'
        }`}
      >
        {bookingMessage}
      </div>
    ) : null;

  const startCharging = () => {
    setActiveSessionCard((prev) =>
      prev
        ? {
            ...prev,
            status: 'charging',
            chargingStartedAt: new Date(),
            session: { ...prev.session, status: 'ongoing' },
          }
        : prev
    );
  };

  const cancelActiveSession = async () => {
    if (!activeSessionCard) {
      return;
    }
    try {
      await cancelChargingSession(activeSessionCard.session.id);
      setActiveSessionCard(null);
      setBookingStatus('idle');
      setBookingMessage('Booking cancelled and connector released.');
      onBook?.();
    } catch (error) {
      console.error('Failed to cancel session:', error);
      setBookingStatus('error');
      setBookingMessage(error instanceof Error ? error.message : 'Failed to cancel session.');
    }
  };

  const stopCharging = async () => {
    if (!activeSessionCard) {
      return;
    }
    try {
      await completeChargingSession(activeSessionCard.session.id);
      setActiveSessionCard(null);
      setBookingStatus('success');
      setBookingMessage('Charging session completed.');
      onBook?.();
    } catch (error) {
      console.error('Failed to stop charging:', error);
      setBookingStatus('error');
      setBookingMessage(error instanceof Error ? error.message : 'Failed to stop charging.');
    }
  };

  const chargingProgress = useMemo(() => {
    if (!activeSessionCard || activeSessionCard.status !== 'charging') {
      return activeSessionCard?.session.startSoC ?? currentBattery;
    }
    const start = activeSessionCard.session.startSoC ?? currentBattery;
    const target = activeSessionCard.session.endSoC ?? targetSoC;
    const durationMin =
      activeSessionCard.recommendation?.estimatedDuration ??
      (activeSessionCard.session.duration
        ? parseInt(activeSessionCard.session.duration, 10)
        : 30);
    const elapsed =
      activeSessionCard.chargingStartedAt
        ? (Date.now() - activeSessionCard.chargingStartedAt.getTime()) / 60000
        : 0;
    const fraction = Math.min(elapsed / Math.max(durationMin, 1), 1);
    return Math.round(start + (target - start) * fraction);
  }, [activeSessionCard, currentBattery, targetSoC]);

  if (activeSessionCard) {
    const { session, station, recommendation, status } = activeSessionCard;
    const isCharging = status === 'charging';
    const stationName = station?.name ?? session.station ?? 'Selected Station';
    const distance =
      station?.distance ?? recommendation?.distance ?? `${session.location ?? 'Unknown'}`;
    const maxPower = station?.power ?? recommendation?.maxPower ?? '—';
    const targetLevel = session.endSoC ?? targetSoC;
    const eta = recommendation?.estimatedDuration ?? 45;
    const cost = recommendation?.negotiatedPrice ?? session.cost ?? '$0.00';
    const startLabel = isCharging
      ? 'Now'
      : recommendation?.startTime ?? session.startTime ?? 'Soon';
    const readyBy = recommendation?.endTime ?? session.endTime ?? session.date.split(',')[0];

    return (
      <div
        className="absolute bottom-0 left-0 right-0 bg-slate-900 rounded-t-3xl shadow-2xl transition-all duration-300"
        style={{ height: getSheetHeight('active') }}
      >
        <div className="flex justify-center pt-2 pb-3 cursor-pointer" onClick={onToggleExpand}>
          <div className="w-12 h-1 bg-slate-600 rounded-full" />
        </div>
        <div className="px-5 pb-6 space-y-5 overflow-y-auto" style={{ height: 'calc(100% - 48px)' }}>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-3">
              {isCharging ? <Zap className="w-8 h-8 text-green-400" /> : <CheckCircle2 className="w-8 h-8 text-green-400" />}
            </div>
            <h3 className="text-white text-lg mb-1">
              {isCharging ? 'Charging in Progress' : 'Charging Station Booked!'}
            </h3>
            <p className="text-slate-400 text-sm">
              {isCharging ? `Station: ${stationName}` : 'Ready to start charging'}
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-300 text-sm">{stationName}</p>
                <p className="text-slate-500 text-xs">{distance}</p>
              </div>
              <Badge className={isCharging ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'}>
                {isCharging ? 'Charging' : 'Confirmed'}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/40 rounded-lg p-3">
                <p className="text-slate-400 text-xs">Max Power</p>
                <p className="text-white text-sm">{maxPower}</p>
              </div>
              <div className="bg-slate-900/40 rounded-lg p-3">
                <p className="text-slate-400 text-xs">Target Level</p>
                <p className="text-white text-sm">{targetLevel}%</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Charging Speed</span>
                <span>
                  {recommendation
                    ? recommendation.maxPower
                    : `${station.power?.replace('Up to ', '') ?? '—'}`}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Estimated Duration</span>
                <span>{eta} min</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-xs">Current Level</span>
              <span className="text-white text-sm">{chargingProgress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-700 rounded-full">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-green-500 to-green-300"
                style={{ width: `${Math.min((chargingProgress / targetLevel) * 100, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Estimated Cost</span>
              <span className="text-green-400">{cost}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Recommended Start</span>
              <span>{startLabel}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Ready By</span>
              <span>{readyBy}</span>
            </div>
          </div>

          {isCharging ? (
            <Button
              className="w-full bg-red-500 hover:bg-red-700 text-white"
              onClick={() => {
                void stopCharging();
              }}
            >
              Stop Charging
            </Button>
          ) : (
            <div className="w-full">
              <Button
                className="w-1/2 bg-red-500 hover:bg-red-700 text-white"
                onClick={() => {
                  void cancelActiveSession();
                }}
              >
                Cancel Charging
              </Button>
              <Button
                className="w-1/2 bg-green-500 hover:bg-green-600 text-slate-900"
                onClick={startCharging}
              >
                <Play className="w-4 h-4 mr-2" />
                Start Charging
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Smart Mode View - Charging Preferences Form
  if (isSmartMode && !recommendation) {
    return (
      <div className="absolute bottom-0 left-0 right-0 bg-slate-900 rounded-t-3xl shadow-2xl transition-all duration-300"
        style={{ height: getSheetHeight('smartForm') }}
      >
        {/* Drag Handle */}
        <div 
          className="flex justify-center pt-2 pb-3 cursor-pointer"
          onClick={onToggleExpand}
        >
          <div className="w-12 h-1 bg-slate-600 rounded-full"></div>
        </div>

        <div className="px-5 pb-6 overflow-y-auto" style={{ height: 'calc(100% - 48px)' }}>
          {batteryError && (
            <div className="mb-4 text-xs text-red-200 bg-red-900/40 border border-red-500/30 rounded-lg px-3 py-2">
              {batteryError}
            </div>
          )}
          {renderBookingNotice()}
          {renderBookingNotice()}
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

  // Smart Mode Result View - Show recommendation with Accept/Decline options
  if (isSmartMode && recommendation) {
    return (
      <div className="absolute bottom-0 left-0 right-0 bg-slate-900 rounded-t-3xl shadow-2xl transition-all duration-300"
        style={{ height: getSheetHeight('smartResult') }}
      >
        {/* Drag Handle */}
        <div 
          className="flex justify-center pt-2 pb-3 cursor-pointer"
          onClick={onToggleExpand}
        >
          <div className="w-12 h-1 bg-slate-600 rounded-full"></div>
        </div>

        <div className="px-5 pb-24 overflow-y-auto" style={{ height: 'calc(100% - 48px)' }}>
          {batteryError && (
            <div className="mb-4 text-xs text-red-200 bg-red-900/40 border border-red-500/30 rounded-lg px-3 py-2">
              {batteryError}
            </div>
          )}
          {/* Success Header */}
          <div className="text-center mb-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#00FFA7] to-green-500 rounded-full flex items-center justify-center mb-2">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-white mb-1">✨ Best Station Found!</h3>
            <p className="text-[#00FFA7] text-sm">AI-optimized for {optimizationMode}</p>
            <p className="text-slate-400 text-xs mt-1">{recommendation.reasonCode}</p>
          </div>

          {/* Selected Station Info */}
          <div className="mb-4 pb-4 border-b border-slate-800">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-white mb-1">{recommendation.stationName}</h3>
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <MapPin className="w-3 h-3" />
                  <span>{recommendation.distance} away</span>
                </div>
              </div>
              <Badge className="bg-[#00FFA7]/20 text-[#00FFA7] border-[#00FFA7]/30">
                {recommendation.confidenceScore}% Match
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/50 rounded-lg p-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-3 h-3 text-blue-400" />
                  <span className="text-slate-400 text-xs">Max Power</span>
                </div>
                <div className="text-white text-sm">{recommendation.maxPower}</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <Battery className="w-3 h-3 text-green-400" />
                  <span className="text-slate-400 text-xs">Available</span>
                </div>
                <div className="text-white text-sm">{recommendation.availability.available}/{recommendation.availability.total}</div>
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
                <span className="text-white">{recommendation.energyNeeded} kWh</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Ready By</span>
                <span className="text-white">{departureTime}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Recommended Start</span>
                <span className="text-white">{recommendation.startTime}</span>
              </div>
            </div>
          </div>

          {/* Price Comparison */}
          <div className="bg-gradient-to-br from-[#00FFA7]/20 to-green-900/30 border border-[#00FFA7]/50 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-300 text-xs">Original Price</span>
              <span className="text-slate-400 line-through">${(recommendation.estimatedTotalCost + recommendation.savings).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-300 text-xs">Negotiated Price</span>
              <span className="text-[#00FFA7]">${recommendation.estimatedTotalCost.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300 text-xs">Estimated Duration</span>
              <span className="text-blue-400">{recommendation.estimatedDuration} min</span>
            </div>
            <div className="pt-2 border-t border-[#00FFA7]/30">
              <span className="text-[#00FFA7] text-[10px]">💰 You save ${recommendation.savings.toFixed(2)} with AI negotiation!</span>
            </div>
          </div>

          {/* Action Buttons - Accept/Decline */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={handleDeclineRecommendation}
              variant="outline"
              className="bg-red-500 hover:bg-red-700 text-white border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <X className="w-4 h-4 mr-2" />
              Decline
            </Button>
            <Button 
              onClick={handleAcceptRecommendation}
              className="bg-gradient-to-r from-[#00FFA7] to-green-500 hover:from-[#00FFA7]/90 hover:to-green-600 text-slate-900"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Accept & Book
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Manual Mode View (Original)
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-slate-900 rounded-t-3xl shadow-2xl transition-all duration-300"
      style={{ height: getSheetHeight('manual') }}
    >
      {/* Drag Handle */}
      <div 
        className="flex justify-center pt-2 pb-3 cursor-pointer"
        onClick={onToggleExpand}
      >
        <div className="w-12 h-1 bg-slate-600 rounded-full"></div>
      </div>

      <div className="px-5 pb-6 overflow-y-auto" style={{ height: 'calc(100% - 48px)' }}>
        {batteryError && (
          <div className="mb-4 text-xs text-red-200 bg-red-900/40 border border-red-500/30 rounded-lg px-3 py-2">
            {batteryError}
          </div>
        )}
        {renderBookingNotice()}
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
              onClick={() => void handleBookingSession()}
              disabled={bookingStatus === 'loading'}
              className="w-full bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white py-3 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {bookingStatus === 'loading' ? 'Booking...' : 'Book & Start Charging'}
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