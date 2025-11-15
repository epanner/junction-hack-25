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
    "did:itn:charger:fleet-01": {
        "station_id": "did:itn:charger:fleet-01",
        "name": "GridPass Demo Station",
        "location": {
            "city": "Helsinki",
            "country": "FI",
            "address": "Examplekatu 1",
            "latitude": 60.1699,
            "longitude": 24.9384,
        },
        "operator": "GridPass Demo Ops",
        "connectors": [
            {
                "connector_id": "connector-1",
                "type": "CCS2",
                "power_kw": 150,
                "status": "available",
            },
            {
                "connector_id": "connector-2",
                "type": "CHAdeMO",
                "power_kw": 50,
                "status": "available",
            },
        ],
    },
    "did:itn:charger:fleet-02": {
        "station_id": "did:itn:charger:fleet-02",
        "name": "Harbor Fast Charge",
        "location": {
            "city": "Tallinn",
            "country": "EE",
            "address": "Port Road 12",
            "latitude": 59.447,
            "longitude": 24.7536,
        },
        "operator": "Baltic Charge",
        "connectors": [
            {
                "connector_id": "connector-a",
                "type": "CCS2",
                "power_kw": 300,
                "status": "available",
            },
            {
                "connector_id": "connector-b",
                "type": "CCS2",
                "power_kw": 300,
                "status": "occupied",
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
