import { useState } from 'react';
import { MobilePhoneFrame } from './driver/MobilePhoneFrame';
import { MapView } from './driver/MapView';
import { BookingSheet } from './driver/BookingSheet';
import { BottomNav } from './driver/BottomNav';
import { ProfilePage } from './driver/ProfilePage';
import { VehiclePage } from './driver/VehiclePage';
import { SessionsPage } from './driver/SessionsPage';

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

// Hardcoded stations around San Francisco
const stations: Station[] = [
  {
    id: '1',
    name: 'Station #42',
    lat: 37.7849,
    lng: -122.4094,
    available: 3,
    total: 4,
    power: '150 kW',
    price: '$0.18/kWh',
    distance: '2.3 km'
  },
  {
    id: '2',
    name: 'Station #28',
    lat: 37.7699,
    lng: -122.4294,
    available: 2,
    total: 6,
    power: '50 kW',
    price: '$0.15/kWh',
    distance: '3.1 km'
  },
  {
    id: '3',
    name: 'Station #15',
    lat: 37.7899,
    lng: -122.4194,
    available: 4,
    total: 4,
    power: '250 kW',
    price: '$0.22/kWh',
    distance: '1.8 km'
  },
  {
    id: '4',
    name: 'Station #33',
    lat: 37.7649,
    lng: -122.4394,
    available: 1,
    total: 3,
    power: '75 kW',
    price: '$0.16/kWh',
    distance: '4.5 km'
  },
  {
    id: '5',
    name: 'Station #19',
    lat: 37.7799,
    lng: -122.3994,
    available: 0,
    total: 2,
    power: '120 kW',
    price: '$0.19/kWh',
    distance: '2.9 km'
  }
];

export function DriverScreen() {
  const [activeTab, setActiveTab] = useState<'map' | 'profile' | 'vehicle' | 'sessions'>('map');
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [targetSoC, setTargetSoC] = useState(80);
  const [departureTime, setDepartureTime] = useState('15:00');
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const [isSmartMode, setIsSmartMode] = useState(false);

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
    alert('Booking charging session...');
    // TODO: Navigate to active session view
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
                userLat={37.7749}
                userLng={-122.4194}
                stations={stations}
                selectedStation={selectedStationId || undefined}
                onStationSelect={handleStationSelect}
                onSmartModeChange={handleSmartModeChange}
              />
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