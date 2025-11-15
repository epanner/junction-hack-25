import math
from typing import Any, Dict, List, Optional, Tuple

CHARGING_STATIONS: Dict[str, Dict[str, Any]] = {
    "did:itn:charger:espoo-west": {
        "station_id": "did:itn:charger:espoo-west",
        "name": "Espoo West Mobility Hub",
        "location": {
            "city": "Espoo",
            "country": "FI",
            "address": "Vanha Jorvaksentie 3",
            "latitude": 60.1609,
            "longitude": 24.6388,
        },
        "operator": "Nordic Charge",
        "connectors": [
            {
                "connector_id": "connector-ccs-a",
                "type": "CCS2",
                "power_kw": 200,
                "status": "available",
            },
            {
                "connector_id": "connector-ccs-b",
                "type": "CCS2",
                "power_kw": 200,
                "status": "occupied",
            },
            {
                "connector_id": "connector-type2-a",
                "type": "Type2",
                "power_kw": 22,
                "status": "available",
            },
        ],
    },
    "did:itn:charger:helsinki-harbor": {
        "station_id": "did:itn:charger:helsinki-harbor",
        "name": "Helsinki Harbor Fast Charge",
        "location": {
            "city": "Helsinki",
            "country": "FI",
            "address": "Tyynenmerenkatu 8",
            "latitude": 60.1592,
            "longitude": 24.9198,
        },
        "operator": "CityCharge Helsinki",
        "connectors": [
            {
                "connector_id": "harbor-ccs-a",
                "type": "CCS2",
                "power_kw": 250,
                "status": "available",
            },
            {
                "connector_id": "harbor-ccs-b",
                "type": "CCS2",
                "power_kw": 250,
                "status": "occupied",
            },
            {
                "connector_id": "harbor-type2",
                "type": "Type2",
                "power_kw": 22,
                "status": "available",
            },
        ],
    },
    "did:itn:charger:espoo-metro": {
        "station_id": "did:itn:charger:espoo-metro",
        "name": "Espoo Metro Plaza",
        "location": {
            "city": "Espoo",
            "country": "FI",
            "address": "Länsiväylä 3",
            "latitude": 60.1625,
            "longitude": 24.7372,
        },
        "operator": "Espoo Energy Cooperative",
        "connectors": [
            {
                "connector_id": "metro-ccs",
                "type": "CCS2",
                "power_kw": 150,
                "status": "available",
            },
            {
                "connector_id": "metro-chademo",
                "type": "CHAdeMO",
                "power_kw": 50,
                "status": "available",
            },
            {
                "connector_id": "metro-type2",
                "type": "Type2",
                "power_kw": 11,
                "status": "occupied",
            },
        ],
    },
    "did:itn:charger:espoo-nokia": {
        "station_id": "did:itn:charger:espoo-nokia",
        "name": "Espoo Nokia Campus Fast Charge",
        "location": {
            "city": "Espoo",
            "country": "FI",
            "address": "Karaportti 3",
            "latitude": 60.2225,
            "longitude": 24.7583,
        },
        "operator": "Nokia Mobility Services",
        "connectors": [
            {
                "connector_id": "nokia-ccs-a",
                "type": "CCS2",
                "power_kw": 180,
                "status": "available",
            },
            {
                "connector_id": "nokia-ccs-b",
                "type": "CCS2",
                "power_kw": 180,
                "status": "available",
            },
            {
                "connector_id": "nokia-type2",
                "type": "Type2",
                "power_kw": 22,
                "status": "available",
            },
        ],
    },
    "did:itn:charger:espoo-otaniemi": {
        "station_id": "did:itn:charger:espoo-otaniemi",
        "name": "Otaniemi Innovation Campus",
        "location": {
            "city": "Espoo",
            "country": "FI",
            "address": "Otaniementie 9",
            "latitude": 60.1865,
            "longitude": 24.8307,
        },
        "operator": "Otaniemi Innovation Hub",
        "connectors": [
            {
                "connector_id": "otaniemi-ccs-a",
                "type": "CCS2",
                "power_kw": 200,
                "status": "available",
            },
            {
                "connector_id": "otaniemi-ccs-b",
                "type": "CCS2",
                "power_kw": 200,
                "status": "occupied",
            },
            {
                "connector_id": "otaniemi-type2",
                "type": "Type2",
                "power_kw": 22,
                "status": "available",
            },
        ],
    },
    "did:itn:charger:helsinki-pasila": {
        "station_id": "did:itn:charger:helsinki-pasila",
        "name": "Pasila Smart Mobility Hub",
        "location": {
            "city": "Helsinki",
            "country": "FI",
            "address": "Ratapihantie 11",
            "latitude": 60.1993,
            "longitude": 24.9338,
        },
        "operator": "Helsinki Smart Mobility",
        "connectors": [
            {
                "connector_id": "pasila-ccs-a",
                "type": "CCS2",
                "power_kw": 300,
                "status": "available",
            },
            {
                "connector_id": "pasila-ccs-b",
                "type": "CCS2",
                "power_kw": 300,
                "status": "available",
            },
            {
                "connector_id": "pasila-chademo",
                "type": "CHAdeMO",
                "power_kw": 50,
                "status": "occupied",
            },
        ],
    },
    "did:itn:charger:espoo-ringroad": {
        "station_id": "did:itn:charger:espoo-ringroad",
        "name": "Ring Road West Service Hub",
        "location": {
            "city": "Espoo",
            "country": "FI",
            "address": "Kehä I 120",
            "latitude": 60.2471,
            "longitude": 24.7589,
        },
        "operator": "Ring Road Energy",
        "connectors": [
            {
                "connector_id": "ringroad-ccs",
                "type": "CCS2",
                "power_kw": 120,
                "status": "available",
            },
            {
                "connector_id": "ringroad-type2-a",
                "type": "Type2",
                "power_kw": 22,
                "status": "available",
            },
            {
                "connector_id": "ringroad-type2-b",
                "type": "Type2",
                "power_kw": 22,
                "status": "occupied",
            },
        ],
    },
    "did:itn:charger:helsinki-airport": {
        "station_id": "did:itn:charger:helsinki-airport",
        "name": "Helsinki Airport UltraFast",
        "location": {
            "city": "Vantaa",
            "country": "FI",
            "address": "Lentäjäntie 1",
            "latitude": 60.3172,
            "longitude": 24.9685,
        },
        "operator": "Finnavia Charging",
        "connectors": [
            {
                "connector_id": "airport-hpc-1",
                "type": "CCS2",
                "power_kw": 350,
                "status": "available",
            },
            {
                "connector_id": "airport-hpc-2",
                "type": "CCS2",
                "power_kw": 350,
                "status": "available",
            },
            {
                "connector_id": "airport-type2",
                "type": "Type2",
                "power_kw": 11,
                "status": "occupied",
            },
        ],
    },
    "did:itn:charger:espoo-south-harbor": {
        "station_id": "did:itn:charger:espoo-south-harbor",
        "name": "Espoo South Harbor",
        "location": {
            "city": "Espoo",
            "country": "FI",
            "address": "Satamatie 5",
            "latitude": 60.1491,
            "longitude": 24.7012,
        },
        "operator": "Southern Grid Cooperative",
        "connectors": [
            {
                "connector_id": "south-ccs",
                "type": "CCS2",
                "power_kw": 120,
                "status": "available",
            },
            {
                "connector_id": "south-type2-a",
                "type": "Type2",
                "power_kw": 22,
                "status": "available",
            },
            {
                "connector_id": "south-type2-b",
                "type": "Type2",
                "power_kw": 22,
                "status": "available",
            },
        ],
    },
    "did:itn:charger:helsinki-techpark": {
        "station_id": "did:itn:charger:helsinki-techpark",
        "name": "Helsinki Tech Park",
        "location": {
            "city": "Helsinki",
            "country": "FI",
            "address": "Tekniikantie 30",
            "latitude": 60.1845,
            "longitude": 24.8123,
        },
        "operator": "Nordic Innovate Charge",
        "connectors": [
            {
                "connector_id": "techpark-ccs-a",
                "type": "CCS2",
                "power_kw": 200,
                "status": "occupied",
            },
            {
                "connector_id": "techpark-ccs-b",
                "type": "CCS2",
                "power_kw": 200,
                "status": "available",
            },
            {
                "connector_id": "techpark-chademo",
                "type": "CHAdeMO",
                "power_kw": 50,
                "status": "available",
            },
        ],
    },
}


def _connector_summary(connectors: List[Dict[str, Any]]) -> Dict[str, int]:
    total = len(connectors)
    available = sum(1 for c in connectors if c["status"] == "available")
    occupied = total - available
    return {
        "total_connectors": total,
        "available_connectors": available,
        "occupied_connectors": occupied,
    }


def get_station_snapshot(station_id: str) -> Optional[Dict[str, Any]]:
    station = CHARGING_STATIONS.get(station_id)
    if not station:
        return None

    summary = _connector_summary(station["connectors"])
    return {**station, **summary}


def occupy_connector(station_id: str) -> Optional[Dict[str, Any]]:
    station = CHARGING_STATIONS.get(station_id)
    if not station:
        return None

    for connector in station["connectors"]:
        if connector["status"] == "available":
            connector["status"] = "occupied"
            return connector

    return None


def release_connector(station_id: str, connector_id: str) -> Optional[Dict[str, Any]]:
    station = CHARGING_STATIONS.get(station_id)
    if not station:
        return None

    for connector in station["connectors"]:
        if connector["connector_id"] == connector_id:
            connector["status"] = "available"
            return connector
    return None


def station_has_available_connector(station_id: str) -> bool:
    station = CHARGING_STATIONS.get(station_id)
    if not station:
        return False
    return any(connector["status"] == "available" for connector in station["connectors"])


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return r * c


def find_nearest_station(lat: float, lon: float) -> Optional[Tuple[Dict[str, Any], float]]:
    best_station = None
    best_distance = float("inf")

    for station in CHARGING_STATIONS.values():
        coords = station["location"]
        distance = _haversine_km(lat, lon, coords["latitude"], coords["longitude"])
        if distance < best_distance:
            best_station = station
            best_distance = distance

    if best_station is None:
        return None

    return best_station, best_distance


def _pricing_rate_for_power(power_kw: float) -> float:
    if power_kw <= 25:
        return 0.25
    if power_kw <= 150:
        return 0.34
    if power_kw <= 350:
        return 0.42
    return 0.47


def _format_price_string(power_kw: float) -> str:
    rate = _pricing_rate_for_power(power_kw)
    return f"€{rate:.2f}/kWh"


def build_station_card(
    station: Dict[str, Any],
    user_lat: Optional[float] = None,
    user_lon: Optional[float] = None,
) -> Dict[str, Any]:
    connectors = station.get("connectors", [])
    total = len(connectors)
    available = sum(1 for c in connectors if c["status"] == "available")
    max_power = max((c.get("power_kw", 0) for c in connectors), default=0)
    price = _format_price_string(max_power)
    power_label = f"Up to {int(max_power)} kW" if max_power else "N/A"

    distance = None
    if user_lat is not None and user_lon is not None:
        coords = station["location"]
        distance_km = _haversine_km(user_lat, user_lon, coords["latitude"], coords["longitude"])
        distance = f"{distance_km:.1f} km"

    return {
        "id": station["station_id"],
        "name": station["name"],
        "lat": station["location"]["latitude"],
        "lng": station["location"]["longitude"],
        "available": available,
        "total": total,
        "power": power_label,
        "price": price,
        "distance": distance,
        "address": station["location"]["address"],
    }


def get_station_cards(
    user_lat: Optional[float] = None,
    user_lon: Optional[float] = None,
    radius_km: Optional[float] = None,
) -> List[Dict[str, Any]]:
    cards: List[Dict[str, Any]] = []
    for station in CHARGING_STATIONS.values():
        card = build_station_card(station, user_lat, user_lon)
        if radius_km is not None and card["distance"] is not None:
            distance_value = float(card["distance"].split()[0])
            if distance_value > radius_km:
                continue
        cards.append(card)
    return cards
