import React, { useEffect, useState } from 'react';
import { MobilePhoneFrame } from './driver/MobilePhoneFrame';
import { MapView } from './driver/MapView';
import { BookingSheet } from './driver/BookingSheet';
import { BottomNav } from './driver/BottomNav';
import { ProfilePage } from './driver/ProfilePage';
import { VehiclePage } from './driver/VehiclePage';
import { SessionsPage } from './driver/SessionsPage';
import { getChargingStations, getDefaultLocation, type Station } from '../data_sources';

export function DriverScreen() {
  const [activeTab, setActiveTab] = useState<'map' | 'profile' | 'vehicle' | 'sessions'>('map');
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [targetSoC, setTargetSoC] = useState(80);
  const [departureTime, setDepartureTime] = useState('15:00');
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const [isSmartMode, setIsSmartMode] = useState(false);
  const [stations, setStations] = useState<Station[]>([]);
  const [stationsLoading, setStationsLoading] = useState(true);
  const [stationsError, setStationsError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState(getDefaultLocation());
  const [locating, setLocating] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [stationsRefreshKey, setStationsRefreshKey] = useState(0);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported in this browser.');
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          name: 'Current Location',
        });
        setLocating(false);
      },
      (err) => {
        setLocationError(err.message || 'Unable to fetch current location.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadStations() {
      try {
        const data = await getChargingStations(userLocation.lat, userLocation.lng, 100);
        if (!cancelled) {
          setStations(data);
        }
      } catch (err) {
        if (!cancelled) {
          setStationsError(err instanceof Error ? err.message : 'Failed to load stations');
        }
      } finally {
        if (!cancelled) {
          setStationsLoading(false);
        }
      }
    }
    loadStations();
    return () => {
      cancelled = true;
    };
  }, [userLocation.lat, userLocation.lng, stationsRefreshKey]);

  const selectedStation = selectedStationId 
    ? stations.find(s => s.id === selectedStationId) || null
    : null;

  const handleStationSelect = (stationId: string) => {
    setSelectedStationId(stationId);
    if (!isSmartMode) {
      setIsSheetExpanded(false);
    }
  };

  const handleBook = () => {
    setIsSheetExpanded(false);
    setStationsRefreshKey((prev) => prev + 1);
  };

  const handleSmartModeChange = (smartMode: boolean) => {
    setIsSmartMode(smartMode);
    if (smartMode) {
      setIsSheetExpanded(true);
    }
  };

  return (
    <MobilePhoneFrame>
      <div className="relative w-full h-full">
        {/* Content based on active tab */}
        {activeTab === 'map' && (
          <>
            {/* Full-screen Map */}
            <div className="absolute inset-0">
              <MapView
                userLat={userLocation.lat}
                userLng={userLocation.lng}
                stations={stations}
                selectedStation={selectedStationId || undefined}
                onStationSelect={handleStationSelect}
                onSmartModeChange={handleSmartModeChange}
              />
              {(locating || stationsLoading) && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/80 text-white text-sm px-4 py-2 rounded-full shadow-lg">
                  {locating ? 'Detecting your location...' : 'Loading nearby stations...'}
                </div>
              )}
              {locationError && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-900/80 text-yellow-100 text-sm px-4 py-2 rounded-full shadow-lg">
                  {locationError}
                </div>
              )}
              {stationsError && !stationsLoading && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-900/80 text-red-100 text-sm px-4 py-2 rounded-full shadow-lg">
                  {stationsError}
                </div>
              )}
            </div>

            {/* Bottom Sheet */}
            <BookingSheet
              selectedStation={selectedStation}
              targetSoC={targetSoC}
              setTargetSoC={setTargetSoC}
              departureTime={departureTime}
              setDepartureTime={setDepartureTime}
              onBook={handleBook}
              isExpanded={isSheetExpanded}
              onToggleExpand={() => setIsSheetExpanded(!isSheetExpanded)}
              isSmartMode={isSmartMode}
            />
          </>
        )}

        {activeTab === 'sessions' && <SessionsPage />}
        {activeTab === 'vehicle' && <VehiclePage />}
        {activeTab === 'profile' && <ProfilePage />}

        {/* Bottom Navigation */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </MobilePhoneFrame>
  );
}
