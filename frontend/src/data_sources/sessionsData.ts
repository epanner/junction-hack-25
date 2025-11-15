/**
 * Charging Sessions Data Source
 * Contains all charging session history and active session data
 * TODO: Replace with API calls when backend is ready
 */

import { apiGet, apiPost } from './apiClient';
import type { Station } from './stationsData';
import type { SmartChargingRecommendation } from './smartChargingData';

export interface ChargingSession {
  id: string;
  date: string;
  station: string;
  stationId: string;
  location: string;
  energy: string;
  cost: string;
  duration: string;
  status: 'completed' | 'ongoing' | 'scheduled' | 'cancelled';
  startTime?: string;
  endTime?: string;
  startSoC?: number; // State of Charge at start (percentage)
  endSoC?: number; // State of Charge at end (percentage)
  connectorId?: string | null;
  connectorType?: string | null;
}

export const getChargingSessions = async (
  _userId?: string,
  limit?: number
): Promise<ChargingSession[]> => {
  const params = new URLSearchParams();
  if (typeof limit === 'number') params.set('limit', limit.toString());
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiGet<ChargingSession[]>(`/api/charging-sessions${query}`);
};

export const getActiveSession = async (_userId?: string): Promise<ChargingSession | null> => {
  return apiGet<ChargingSession | null>('/api/charging-sessions/active');
};

export const getSessionById = async (sessionId: string): Promise<ChargingSession | null> => {
  try {
    return await apiGet<ChargingSession>(`/api/charging-sessions/${sessionId}`);
  } catch (error) {
    console.error('Failed to fetch session', error);
    return null;
  }
};

const DEFAULT_USER_ID = 'user_001';
const DEFAULT_VEHICLE_VIN = 'W1KAH5EB2PF093797';
const DEFAULT_BATTERY_ID = 'did:itn:NiHW21TcdTkW8zk6ruhpfv';

interface SessionAuthResponse {
  status: string;
  user_id: string;
  vehicle_vin: string;
  battery_id: string;
  charger: {
    station_id: string;
    name: string;
    operator: string;
    location: {
      city: string;
      address: string;
      latitude: number;
      longitude: number;
    };
    connectors: Array<{ connector_id: string; type: string; power_kw: number; status: string }>;
  };
  pricing: {
    total_eur: number;
    energy_kwh: number;
    power_kw: number;
    pricing_tier: string;
  };
  reserved_connector?: {
    connector_id: string;
    type: string;
    power_kw: number;
    status: string;
  } | null;
}

interface AnchorRecord {
  session_id: string;
  plan_hash: string;
  solana_tx: string;
  anchored_at: string;
}

interface AnchorResponse {
  status: 'anchored' | 'already_anchored';
  anchor: AnchorRecord;
}

interface BookSessionParams {
  station: Station;
  currentSoC: number;
  targetSoC: number;
  departureTime: string;
  recommendation?: SmartChargingRecommendation | null;
}

const MIN_DEPARTURE_LEAD_MINUTES = 5;

const ensureFutureDepartureTime = (timeValue: string) => {
  if (!timeValue) {
    throw new Error('Please select a ready-by time.');
  }
  const [hours, minutes] = timeValue.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    throw new Error('Invalid ready-by time format.');
  }
  const now = new Date();
  const departure = new Date();
  departure.setHours(hours, minutes, 0, 0);
  if (departure.getTime() <= now.getTime()) {
    throw new Error('Ready-by time must be in the future.');
  }
  const minLead = MIN_DEPARTURE_LEAD_MINUTES * 60 * 1000;
  if (departure.getTime() - now.getTime() < minLead) {
    throw new Error(`Ready-by time must be at least ${MIN_DEPARTURE_LEAD_MINUTES} minutes from now.`);
  }
};

export const bookChargingSession = async ({
  station,
  currentSoC,
  targetSoC,
  departureTime,
  recommendation,
}: BookSessionParams) => {
  if (!station) {
    throw new Error('Select a charging station to continue.');
  }
  if (station.available !== undefined && station.available <= 0) {
    throw new Error(`${station.name} is currently full. Please pick another station.`);
  }

  ensureFutureDepartureTime(departureTime);

  const sessionId = `sess_${Date.now()}`;

  const authPayload = {
    user_id: DEFAULT_USER_ID,
    vehicle_vin: DEFAULT_VEHICLE_VIN,
    battery_id: DEFAULT_BATTERY_ID,
    charger_id: station.id,
    reserve_connector: true,
  };

  const authResponse = await apiPost<SessionAuthResponse>('/api/sessions/authenticate', authPayload);

  const planRecord = {
    session_id: sessionId,
    created_at: new Date().toISOString(),
    station: {
      id: station.id,
      name: station.name,
      address: station.address,
      coordinates: {
        lat: station.lat,
        lng: station.lng,
      },
    },
    preferences: {
      current_soc: currentSoC,
      target_soc: targetSoC,
      departure_time: departureTime,
    },
    pricing: authResponse.pricing,
    recommendation: recommendation
      ? {
          station_id: recommendation.recommendedStationId,
          savings: recommendation.savings,
          estimated_duration: recommendation.estimatedDuration,
        }
      : null,
  };

  const anchorResponse = await apiPost<AnchorResponse>(
    `/api/trust-anchor/${sessionId}`,
    {
      plan_record: planRecord,
      force_reanchor: false,
    }
  );

  const now = new Date();
  const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const energyKwh = authResponse.pricing.energy_kwh;
  const costEur = authResponse.pricing.total_eur;

  if (authResponse.status !== 'reserved' || !authResponse.reserved_connector) {
    throw new Error('Unable to reserve a connector at this station. Please try again.');
  }

  const reservedConnector = authResponse.reserved_connector;

  const sessionRecord: ChargingSession = {
    id: sessionId,
    date: now.toLocaleString(),
    station: station.name,
    stationId: station.id,
    location: station.address || authResponse.charger.location.address,
    energy: `${energyKwh.toFixed(1)} kWh`,
    cost: `€${costEur.toFixed(2)}`,
    duration: recommendation ? `${recommendation.estimatedDuration} min` : '45 min',
    status: 'scheduled',
    startTime: formattedTime,
    startSoC: currentSoC,
    endSoC: targetSoC,
    connectorId: reservedConnector.connector_id,
    connectorType: reservedConnector.type,
  };

  await apiPost<ChargingSession>('/api/charging-sessions', sessionRecord);

  return {
    authResponse,
    anchorResponse,
    session: sessionRecord,
  };
};

export const cancelChargingSession = async (sessionId: string) => {
  return apiPost<ChargingSession>(`/api/charging-sessions/${sessionId}/cancel`, {});
};

export const completeChargingSession = async (sessionId: string) => {
  return apiPost<ChargingSession>(`/api/charging-sessions/${sessionId}/complete`, {});
};
