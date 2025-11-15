import { apiPost } from './apiClient';

export type OptimizationMode = 'cost' | 'speed' | 'balanced';

export interface ChargingPreferences {
  currentSoC: number;
  targetSoC: number;
  departureTime: string;
  optimizationMode: OptimizationMode;
  userLocation: { lat: number; lng: number };
}

export interface SmartChargingRecommendation {
  recommendedStationId: string;
  stationName: string;
  distance: string;
  maxPower: string;
  originalPrice: string;
  negotiatedPrice: string;
  estimatedTotalCost: number;
  estimatedDuration: number;
  energyNeeded: number;
  savings: number;
  startTime: string;
  endTime: string;
  availability: {
    available: number;
    total: number;
  };
  confidenceScore: number;
  reasonCode: string;
}

export interface NegotiatedPlanResponse {
  battery: Record<string, any>;
  candidate_count: number;
  candidates: Record<string, any>[];
  plan: Record<string, any>;
}

export const requestNegotiatedPlan = async (
  preferences: ChargingPreferences
): Promise<NegotiatedPlanResponse> => {
  const now = new Date();
  const [hours, minutes] = preferences.departureTime.split(':').map(Number);
  now.setHours(hours, minutes, 0, 0);
  if (now < new Date()) {
    now.setDate(now.getDate() + 1);
  }

  return apiPost<NegotiatedPlanResponse>('/api/negotiator/plan', {
    user_lat: preferences.userLocation.lat,
    user_lng: preferences.userLocation.lng,
    target_soc_percent: preferences.targetSoC,
    departure_time: now.toISOString(),
    strategy: preferences.optimizationMode,
  });
};

export const getSmartChargingRecommendation = async (
  preferences: ChargingPreferences
): Promise<SmartChargingRecommendation> => {
  const negotiation = await requestNegotiatedPlan(preferences);
  const { plan } = negotiation;

  const station = plan?.station ?? {};
  const charging = plan?.charging_details ?? {};
  const pricing = plan?.pricing ?? {};
  const meta = plan?.meta ?? {};

  const formatCurrency = (value: number | undefined) =>
    typeof value === 'number' ? `€${value.toFixed(2)}` : '€0.00';

  return {
    recommendedStationId: station.station_id ?? 'unknown-station',
    stationName: station.station_name ?? 'Unknown Station',
    distance:
      typeof station.distance_km === 'number'
        ? `${station.distance_km.toFixed(1)} km`
        : 'Distance unknown',
    maxPower:
      typeof station.max_power_kw === 'number' ? `${station.max_power_kw} kW` : 'Unknown power',
    originalPrice: formatCurrency(pricing.original_price_eur),
    negotiatedPrice: formatCurrency(pricing.negotiated_price_eur),
    estimatedTotalCost: pricing.negotiated_price_eur ?? 0,
    estimatedDuration: pricing.estimated_duration_min ?? 0,
    energyNeeded: charging.energy_needed_kwh ?? 0,
    savings: pricing.savings_eur ?? 0,
    startTime: charging.recommended_start ?? preferences.departureTime,
    endTime: charging.ready_by ?? preferences.departureTime,
    availability: {
      available: station.available_connectors ?? 0,
      total: station.total_connectors ?? station.available_connectors ?? 0,
    },
    confidenceScore: meta.match_score ?? 90,
    reasonCode: `Optimized for ${meta.strategy_used ?? preferences.optimizationMode}`,
  };
};
