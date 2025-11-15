import { Zap, Navigation, Loader2, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Station {
  id: string;
  name: string;
  lat: number;
  lng: number;
  available: number;
  total: number;
  power: string;
  price: string;
}

interface MapViewProps {
  userLat: number;
  userLng: number;
  stations: Station[];
  selectedStation?: string;
  onStationSelect: (stationId: string) => void;
  onLocationChange?: (lat: number, lng: number, locationName: string) => void;
  onSmartModeChange?: (isSmartMode: boolean) => void;
}

// IMPORTANT: Replace this with your actual Mapbox access token
// Get a free token at: https://account.mapbox.com/access-tokens/
const MAPBOX_TOKEN =
  "pk.eyJ1IjoiZXBhbm5lciIsImEiOiJjbWkwY3E5anowMHNtMmtzaGdnMWZvbXdzIn0.2eKcFuZPE3efT3vE4Ac7RQ";

export function MapView({
  userLat,
  userLng,
  stations,
  selectedStation,
  onStationSelect,
  onLocationChange,
  onSmartModeChange,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [useMapbox, setUseMapbox] = useState(
    MAPBOX_TOKEN !== "YOUR_MAPBOX_ACCESS_TOKEN_HERE",
  );
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState("San Francisco");
  const [isLocating, setIsLocating] = useState(false);
  const [isSmartMode, setIsSmartMode] = useState(false);

  // Convert lat/lng to screen positions for fallback map
  const latRange = [37.76, 37.80];
  const lngRange = [-122.45, -122.39];

  const toScreenX = (lng: number) => {
    return ((lng - lngRange[0]) / (lngRange[1] - lngRange[0])) * 100;
  };

  const toScreenY = (lat: number) => {
    return ((latRange[1] - lat) / (latRange[1] - latRange[0])) * 100;
  };

  // Reverse geocode to get location name
  const getLocationName = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=place,locality`,
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        return (
          data.features[0].text || data.features[0].place_name || "Unknown Location"
        );
      }
      return "Unknown Location";
    } catch (err) {
      console.error("Failed to get location name:", err);
      return "Unknown Location";
    }
  };

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number => {
    const R = 6371; // Radius of Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Smart mode: Find the best charging station
  const findBestStation = (): string | undefined => {
    if (stations.length === 0) return undefined;

    // Calculate score for each station
    const stationScores = stations.map((station) => {
      const distance = calculateDistance(
        userLat,
        userLng,
        station.lat,
        station.lng,
      );

      // Parse price (remove $ and convert to number)
      const price = parseFloat(station.price.replace("$", ""));

      // Parse power (remove kW and convert to number)
      const power = parseInt(station.power.replace("kW", ""));

      // Availability ratio
      const availability = station.available / station.total;

      // Scoring algorithm (lower is better)
      // - Distance: weighted heavily (multiply by 3)
      // - Price: moderate weight (multiply by 2)
      // - Power: higher is better, so invert (divide 150 by power)
      // - Availability: more available is better (subtract availability * 5)
      const score =
        distance * 3 +
        price * 2 +
        150 / power -
        availability * 5;

      return {
        station,
        score,
        distance,
        price,
        power,
        availability,
      };
    });

    // Sort by score (lower is better) and return the best station
    stationScores.sort((a, b) => a.score - b.score);

    console.log("🤖 Smart Mode Recommendation:");
    console.log(
      `Best Station: ${stationScores[0].station.name}`,
    );
    console.log(`Distance: ${stationScores[0].distance.toFixed(2)} km`);
    console.log(`Price: $${stationScores[0].price}/kWh`);
    console.log(`Power: ${stationScores[0].power} kW`);
    console.log(
      `Availability: ${stationScores[0].station.available}/${stationScores[0].station.total}`,
    );

    return stationScores[0].station.id;
  };

  // Handle mode toggle
  const handleModeToggle = () => {
    const newMode = !isSmartMode;
    setIsSmartMode(newMode);

    if (onSmartModeChange) {
      onSmartModeChange(newMode);
    }

    if (newMode) {
      // Smart mode activated - find best station
      const bestStationId = findBestStation();
      if (bestStationId) {
        onStationSelect(bestStationId);
      }
    }
  };

  // Auto-select best station when Smart Mode is on and stations change
  useEffect(() => {
    if (isSmartMode && stations.length > 0) {
      const bestStationId = findBestStation();
      if (bestStationId && bestStationId !== selectedStation) {
        onStationSelect(bestStationId);
      }
    }
  }, [isSmartMode, stations, userLat, userLng]);

  // Handle location button click
  const handleLocationClick = async () => {
    console.log("Location button clicked");

    if (!navigator.geolocation) {
      console.error("Geolocation not supported");
      alert("Geolocation is not supported by your browser");
      return;
    }

    // Check permission state if available
    let permissionState = "unknown";
    if (navigator.permissions) {
      try {
        const permissionStatus = await navigator.permissions.query({
          name: "geolocation" as PermissionName,
        });
        permissionState = permissionStatus.state;
        console.log("Geolocation permission state:", permissionState);

        // If already denied, show instructions immediately
        if (permissionStatus.state === "denied") {
          const browserName = navigator.userAgent.includes("Chrome")
            ? "Chrome"
            : navigator.userAgent.includes("Firefox")
            ? "Firefox"
            : navigator.userAgent.includes("Safari")
            ? "Safari"
            : "your browser";

          alert(
            `🚫 Location Permission is Currently DENIED\n\n` +
              `To enable location access:\n\n` +
              `📍 For ${browserName}:\n\n` +
              `1. Look at the address bar at the top\n` +
              `2. Click the lock icon (🔒) or info icon (ℹ️) on the left side\n` +
              `3. Find "Location" in the menu\n` +
              `4. Change it from "Block" to "Allow"\n` +
              `5. Refresh this page (F5 or Cmd+R)\n` +
              `6. Click the location button again\n\n` +
              `Alternative: Open your browser settings, search for "Site settings" → Location → Find this site → Remove or Allow it\n\n` +
              `If this doesn't work, check your operating system's location settings to ensure location services are enabled.`
          );
          return;
        }
      } catch (err) {
        console.log("Permissions API not fully supported:", err);
      }
    }

    console.log("Requesting geolocation...");
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        console.log("✅ Location acquired:", position.coords);
        const { latitude, longitude } = position.coords;

        // Get location name
        const name = await getLocationName(latitude, longitude);
        console.log("Location name:", name);
        setLocationName(name);

        // Update map center
        if (mapRef.current && useMapbox) {
          mapRef.current.flyTo({
            center: [longitude, latitude],
            zoom: 12.5,
            duration: 2000,
          });

          // Update user marker position
          if (userMarkerRef.current) {
            userMarkerRef.current.setLngLat([longitude, latitude]);
          }
        }

        // Notify parent component
        if (onLocationChange) {
          onLocationChange(latitude, longitude, name);
        }

        setIsLocating(false);
      },
      (error) => {
        console.error("❌ Geolocation error:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        console.error("Permission state was:", permissionState);
        setIsLocating(false);

        const browserName = navigator.userAgent.includes("Chrome")
          ? "Chrome"
          : navigator.userAgent.includes("Firefox")
          ? "Firefox"
          : navigator.userAgent.includes("Safari")
          ? "Safari"
          : "your browser";

        let errorMessage = "";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              `🚫 Location Permission is DENIED\n\n` +
              `To enable location access:\n\n` +
              `📍 STEP 1: Browser Permission\n` +
              `Look at the address bar → Click the lock icon (🔒) → Location → Change to "Allow" → Refresh page\n\n` +
              `📍 STEP 2: If Step 1 doesn't work:\n` +
              `Open ${browserName} settings → Search "site settings" → Location → Find this site in blocked list → Remove it or Allow it\n\n` +
              `📍 STEP 3: Check Operating System\n` +
              `• Mac: System Settings → Privacy & Security → Location Services → Enable for ${browserName}\n` +
              `• Windows: Settings → Privacy → Location → Enable for apps\n` +
              `• Linux: Check system location settings\n\n` +
              `After making changes, refresh the page and try again!`;
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage =
              "❌ Location information is unavailable.\n\n" +
              "Please check that:\n" +
              "• Your device has location services enabled\n" +
              "• You have a GPS signal (if outdoors)\n" +
              "• Your browser has permission to access location";
            break;
          case error.TIMEOUT:
            errorMessage =
              "⏱️ Location request timed out.\n\n" +
              "This can happen if:\n" +
              "• You're in an area with weak GPS signal\n" +
              "• Your device is still acquiring GPS lock\n\n" +
              "Please try again.";
            break;
          default:
            errorMessage =
              "❌ Unable to retrieve your location.\n\n" +
              "An unknown error occurred. Please try again.";
        }

        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    if (!useMapbox || !mapContainerRef.current || mapRef.current) return;

    let mounted = true;

    const initMap = async () => {
      try {
        // Load Mapbox GL CSS
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href =
          "https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css";
        document.head.appendChild(link);

        await new Promise((resolve) => {
          link.onload = resolve;
          link.onerror = () => {
            setError("Failed to load Mapbox CSS");
            setUseMapbox(false);
            resolve(null);
          };
        });

        if (!mounted) return;

        const mapboxgl = await import("mapbox-gl");
        const mapbox = (mapboxgl as any).default || mapboxgl;

        if (!mounted) return;

        // Set access token
        mapbox.accessToken = MAPBOX_TOKEN;

        // Initialize map
        const map = new mapbox.Map({
          container: mapContainerRef.current!,
          style: "mapbox://styles/mapbox/dark-v11",
          center: [userLng, userLat],
          zoom: 12.5,
          attributionControl: false,
        });

        mapRef.current = map;

        map.on("load", () => {
          if (!mounted) return;
          setMapLoaded(true);

          // Add user location marker
          const userEl = document.createElement("div");
          userEl.className = "user-marker-mapbox";
          userEl.innerHTML = `
            <div class="relative flex items-center justify-center" style="width: 20px; height: 20px;">
              <div style="width: 20px; height: 20px; background: linear-gradient(135deg, #3b82f6, #2563eb); border: 3px solid white; border-radius: 9999px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></div>
              <div style="position: absolute; inset: 0; width: 20px; height: 20px; background: #3b82f6; border-radius: 9999px; opacity: 0.75; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            </div>
          `;

          userMarkerRef.current = new mapbox.Marker({ element: userEl })
            .setLngLat([userLng, userLat])
            .addTo(map);

          // Add station markers
          stations.forEach((station) => {
            addStationMarker(station, mapbox, map);
          });
        });

        map.on("error", (e: any) => {
          console.error("Mapbox error:", e);
          if (mounted && e.error && e.error.status === 401) {
            setError("Invalid Mapbox token");
            setUseMapbox(false);
          }
        });
      } catch (err) {
        console.error("Failed to initialize map:", err);
        if (mounted) {
          setError("Failed to load map");
          setUseMapbox(false);
        }
      }
    };

    initMap();

    return () => {
      mounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [useMapbox, userLat, userLng]);

  const addStationMarker = (
    station: Station,
    mapbox: any,
    map: any,
  ) => {
    const isSelected = station.id === selectedStation;

    const markerEl = document.createElement("div");
    markerEl.className = "station-marker-mapbox";
    markerEl.style.cursor = "pointer";
    markerEl.style.width = isSelected ? "48px" : "40px";
    markerEl.style.height = isSelected ? "48px" : "40px";

    markerEl.innerHTML = `
      <div class="relative flex items-center justify-center" style="width: 100%; height: 100%;">
        <div style="width: ${isSelected ? "48px" : "40px"}; height: ${isSelected ? "48px" : "40px"}; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); transition: all 0.3s; background: ${isSelected ? "linear-gradient(135deg, #00FFA7, #22c55e)" : "linear-gradient(135deg, #3b82f6, #2563eb)"}; border: 3px solid white;">
          <svg xmlns="http://www.w3.org/2000/svg" width="${isSelected ? 24 : 20}" height="${isSelected ? 24 : 20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: white;">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
        </div>
        ${isSelected ? `<div style="position: absolute; inset: 0; width: ${isSelected ? "48px" : "40px"}; height: ${isSelected ? "48px" : "40px"}; border-radius: 9999px; opacity: 0.75; background: #00FFA7; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ""}
      </div>
    `;

    markerEl.addEventListener("click", (e) => {
      e.stopPropagation();
      onStationSelect(station.id);
    });

    const marker = new mapbox.Marker({
      element: markerEl,
      anchor: "center",
    })
      .setLngLat([station.lng, station.lat])
      .addTo(map);

    // Add popup
    const popup = new mapbox.Popup({
      offset: 25,
      closeButton: false,
      closeOnClick: false,
      className: isSelected
        ? "selected-station-popup-mapbox"
        : "station-popup-mapbox",
    }).setHTML(
      `<div style="padding: 6px 10px; font-size: 12px; font-weight: 500;">${station.name}</div>`,
    );

    if (isSelected) {
      marker.setPopup(popup);
      popup.addTo(map);
    } else {
      markerEl.addEventListener("mouseenter", () => {
        marker.setPopup(popup);
        popup.addTo(map);
      });
      markerEl.addEventListener("mouseleave", () => {
        popup.remove();
      });
    }

    markersRef.current.push({
      marker,
      markerEl,
      popup,
      station,
    });
  };

  // Update markers when selection changes
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !useMapbox) return;

    const updateMarkers = async () => {
      try {
        const mapboxgl = await import("mapbox-gl");
        const mapbox = (mapboxgl as any).default || mapboxgl;

        // Remove all station markers
        markersRef.current.forEach(({ marker }) => {
          marker.remove();
        });
        markersRef.current = [];

        // Re-add all station markers with updated selection
        stations.forEach((station) => {
          addStationMarker(station, mapbox, mapRef.current);
        });
      } catch (err) {
        console.error("Failed to update markers:", err);
      }
    };

    updateMarkers();
  }, [selectedStation, mapLoaded, useMapbox]);

  // Fallback styled map when Mapbox is not available
  if (!useMapbox) {
    return (
      <div className="w-full h-full relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-[1000] bg-gradient-to-b from-slate-900/95 to-slate-900/0 backdrop-blur-sm pt-12 pb-6 px-5 pointer-events-none">
          <div className="flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-blue-500 to-green-400 p-1.5 rounded-lg">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-white">ChargeID</span>
            </div>
            <div className="bg-slate-800/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2">
                <Navigation className="w-3 h-3 text-blue-400" />
                <span className="text-white text-sm">
                  San Francisco
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Grid pattern background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Street-like lines for visual effect */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <line
            x1="0%"
            y1="30%"
            x2="100%"
            y2="30%"
            stroke="#3b82f6"
            strokeWidth="2"
          />
          <line
            x1="0%"
            y1="60%"
            x2="100%"
            y2="60%"
            stroke="#3b82f6"
            strokeWidth="2"
          />
          <line
            x1="30%"
            y1="0%"
            x2="30%"
            y2="100%"
            stroke="#3b82f6"
            strokeWidth="2"
          />
          <line
            x1="70%"
            y1="0%"
            x2="70%"
            y2="100%"
            stroke="#3b82f6"
            strokeWidth="2"
          />
        </svg>

        {/* User location marker */}
        <div
          className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${toScreenX(userLng)}%`,
            top: `${toScreenY(userLat)}%`,
          }}
        >
          <div className="relative">
            <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-blue-600 border-3 border-white rounded-full shadow-lg animate-pulse"></div>
            <div className="absolute inset-0 w-5 h-5 bg-blue-500 rounded-full animate-ping opacity-75"></div>
          </div>
        </div>

        {/* Station markers */}
        {stations.map((station) => {
          const isSelected = station.id === selectedStation;
          const screenX = toScreenX(station.lng);
          const screenY = toScreenY(station.lat);

          return (
            <div
              key={station.id}
              className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 hover:scale-110"
              style={{
                left: `${screenX}%`,
                top: `${screenY}%`,
              }}
              onClick={() => onStationSelect(station.id)}
            >
              {/* Station marker */}
              <div className="relative">
                <div
                  className={`${
                    isSelected ? "w-12 h-12" : "w-10 h-10"
                  } rounded-full flex items-center justify-center border-3 border-white shadow-lg transition-all duration-300 ${
                    isSelected
                      ? "bg-gradient-to-br from-[#00FFA7] to-green-500 shadow-[#00FFA7]/50"
                      : "bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/50"
                  }`}
                >
                  <Zap
                    className={`${isSelected ? "w-6 h-6" : "w-5 h-5"} text-white`}
                  />
                </div>

                {/* Pulse animation for selected */}
                {isSelected && (
                  <div className="absolute inset-0 w-12 h-12 bg-[#00FFA7] rounded-full animate-ping opacity-75"></div>
                )}

                {/* Station label */}
                {isSelected && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 rounded text-xs whitespace-nowrap bg-[#00FFA7]/20 border border-[#00FFA7]/50 text-[#00FFA7]">
                    {station.name}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-700">
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-slate-300">You</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-blue-500" />
              <span className="text-slate-300">Stations</span>
            </div>
          </div>
        </div>

        {/* Token info banner */}
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-[1001] bg-blue-900/90 backdrop-blur-sm px-4 py-3 rounded-lg border border-blue-700 max-w-[350px]">
          <p className="text-white text-xs text-center">
            <strong>Demo Mode:</strong> Get a free Mapbox token
            at{" "}
            <a
              href="https://account.mapbox.com/access-tokens/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-300 underline"
            >
              mapbox.com
            </a>{" "}
            for the full map experience
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* Map container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-gradient-to-b from-slate-900/95 to-slate-900/0 backdrop-blur-sm pt-12 pb-6 px-5 pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-500 to-green-400 p-1.5 rounded-lg">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-white">ChargeID</span>
          </div>
          <button
            onClick={handleLocationClick}
            disabled={isLocating}
            className="bg-slate-800/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-700/80 transition-colors disabled:opacity-50"
          >
            <div className="flex items-center gap-2">
              {isLocating ? (
                <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
              ) : (
                <Navigation className="w-3 h-3 text-blue-400" />
              )}
              <span className="text-white text-sm">{locationName}</span>
            </div>
          </button>
        </div>
      </div>

      {/* Mode Switch */}
      <div className="absolute top-[110px] left-0 right-0 z-[999] px-5 pointer-events-none">
        <div className="pointer-events-auto">
          <button
            onClick={handleModeToggle}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-300 shadow-lg ${
              isSmartMode
                ? "bg-gradient-to-r from-[#00FFA7] to-green-500 border border-[#00FFA7]"
                : "bg-slate-800/90 backdrop-blur-sm border border-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`p-1.5 rounded-lg transition-colors ${
                  isSmartMode
                    ? "bg-white/20"
                    : "bg-blue-500/20"
                }`}
              >
                {isSmartMode ? (
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-blue-400" />
                )}
              </div>
              <div className="text-left">
                <div
                  className={`text-xs transition-colors ${
                    isSmartMode ? "text-white" : "text-white"
                  }`}
                >
                  {isSmartMode ? "Smart Mode" : "Manual Mode"}
                </div>
                <div
                  className={`text-[10px] transition-colors ${
                    isSmartMode
                      ? "text-white/80"
                      : "text-slate-400"
                  }`}
                >
                  {isSmartMode
                    ? "AI recommends best station"
                    : "Choose your station"}
                </div>
              </div>
            </div>

            {/* Toggle Switch */}
            <div
              className={`relative w-10 h-5 rounded-full transition-colors ${
                isSmartMode ? "bg-white/30" : "bg-slate-700"
              }`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full shadow-md transition-all duration-300 ${
                  isSmartMode
                    ? "right-0.5 bg-white"
                    : "left-0.5 bg-blue-400"
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mapbox + Custom CSS */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .mapboxgl-map {
          font-family: inherit;
        }
        .mapboxgl-ctrl-logo,
        .mapboxgl-ctrl-attrib,
        .mapboxgl-compact {
          display: none !important;
        }
        .user-marker-mapbox,
        .station-marker-mapbox {
          background: transparent;
          border: none;
        }
        .mapboxgl-popup-content {
          padding: 0;
          border-radius: 6px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
        }
        .station-popup-mapbox .mapboxgl-popup-content {
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(12px);
          border: 1px solid rgb(51, 65, 85);
          color: rgb(203, 213, 225);
        }
        .selected-station-popup-mapbox .mapboxgl-popup-content {
          background: rgba(0, 255, 167, 0.25);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(0, 255, 167, 0.5);
          color: #00FFA7;
        }
        .mapboxgl-popup-tip {
          display: none;
        }
        .mapboxgl-popup-close-button {
          display: none;
        }
        .mapboxgl-canvas {
          outline: none;
        }
      `}</style>
    </div>
  );
}