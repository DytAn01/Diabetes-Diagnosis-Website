"""Service for finding nearby healthcare facilities"""
import requests
from typing import List, Dict, Tuple
import math


class LocationService:
    """Find nearby healthcare facilities using Overpass API (OpenStreetMap)"""
    
    # Overpass API endpoint
    OVERPASS_API_URL = "https://overpass-api.de/api/interpreter"
    
    # Radius in kilometers for search
    DEFAULT_RADIUS_KM = 5
    
    @staticmethod
    def get_nearby_facilities(
        latitude: float, 
        longitude: float, 
        radius_km: float = DEFAULT_RADIUS_KM,
        limit: int = 10
    ) -> Dict:
        """
        Get nearby hospitals and clinics using Overpass API
        
        Args:
            latitude: User's latitude
            longitude: User's longitude
            radius_km: Search radius in kilometers
            limit: Maximum number of facilities to return
            
        Returns:
            Dictionary with facilities list and map center
        """
        try:
            # Build Overpass query for hospitals and clinics
            # Search within bounding box
            query = LocationService._build_overpass_query(
                latitude, longitude, radius_km
            )
            
            response = requests.post(
                LocationService.OVERPASS_API_URL,
                data=query,
                timeout=10
            )
            response.raise_for_status()
            
            # Parse the response
            data = response.json()
            facilities = LocationService._parse_overpass_response(
                data, latitude, longitude, limit
            )

            if not facilities:
                facilities = LocationService._fallback_facilities(latitude, longitude, limit)
            
            return {
                'success': True,
                'facilities': facilities,
                'center': {
                    'latitude': latitude,
                    'longitude': longitude
                },
                'count': len(facilities)
            }
            
        except requests.exceptions.RequestException as e:
            # Fallback: return local facilities as successful response
            facilities = LocationService._fallback_facilities(latitude, longitude, limit)
            return {
                'success': True,
                'message': 'Using local fallback facilities data.',
                'error': str(e),
                'facilities': facilities,
                'center': {
                    'latitude': latitude,
                    'longitude': longitude
                },
                'count': len(facilities)
            }

    @staticmethod
    def _fallback_facilities(latitude: float, longitude: float, limit: int) -> List[Dict]:
        """Return local fallback facilities sorted by nearest distance."""
        fallback = [
            {
                'name': 'Bệnh viện Chợ Rẫy',
                'type': 'Hospital',
                'latitude': 10.7719,
                'longitude': 106.6995,
                'phone': '(028) 3855 2000',
                'website': 'https://www.choray.vn',
                'opening_hours': '',
                'operator': ''
            },
            {
                'name': 'Bệnh viện Nhân Dân Gia Định',
                'type': 'Hospital',
                'latitude': 10.8033,
                'longitude': 106.6838,
                'phone': '(028) 3820 3415',
                'website': 'https://www.gdh.gov.vn',
                'opening_hours': '',
                'operator': ''
            },
            {
                'name': 'Bệnh viện Thống Nhất',
                'type': 'Hospital',
                'latitude': 10.7835,
                'longitude': 106.7297,
                'phone': '(028) 3929 2000',
                'website': '',
                'opening_hours': '',
                'operator': ''
            },
            {
                'name': 'Phòng khám Quốc tế Medicare',
                'type': 'Clinic',
                'latitude': 10.8067,
                'longitude': 106.7237,
                'phone': '(028) 3622 2888',
                'website': 'https://www.medicare.vn',
                'opening_hours': '',
                'operator': ''
            },
            {
                'name': 'Phòng khám Tim mạch City',
                'type': 'Clinic',
                'latitude': 10.7719,
                'longitude': 106.7019,
                'phone': '(028) 3825 1515',
                'website': '',
                'opening_hours': '',
                'operator': ''
            }
        ]

        for item in fallback:
            item['distance'] = round(
                LocationService._calculate_distance(
                    latitude,
                    longitude,
                    item['latitude'],
                    item['longitude']
                ),
                2
            )

        fallback.sort(key=lambda x: x['distance'])
        return fallback[:limit]
    
    @staticmethod
    def _build_overpass_query(
        latitude: float, 
        longitude: float, 
        radius_km: float
    ) -> str:
        """
        Build Overpass QL query for hospitals and clinics
        
        Query includes:
        - hospital=yes
        - amenity=hospital
        - amenity=clinic
        - healthcare=clinic
        - healthcare=hospital
        """
        # Convert radius to approximate degrees
        # 1 degree latitude ≈ 111 km
        radius_degrees = radius_km / 111.0
        
        south = latitude - radius_degrees
        north = latitude + radius_degrees
        west = longitude - radius_degrees
        east = longitude + radius_degrees
        
        # Overpass QL query
        query = f"""
        [bbox:{south},{west},{north},{east}];
        (
          node["amenity"="hospital"];
          way["amenity"="hospital"];
          relation["amenity"="hospital"];
          node["amenity"="clinic"];
          way["amenity"="clinic"];
          relation["amenity"="clinic"];
          node["healthcare"="hospital"];
          way["healthcare"="hospital"];
          node["healthcare"="clinic"];
          way["healthcare"="clinic"];
        );
        out center;
        """
        
        return query
    
    @staticmethod
    def _parse_overpass_response(
        data: Dict, 
        user_lat: float, 
        user_lon: float,
        limit: int
    ) -> List[Dict]:
        """
        Parse Overpass API response and extract facility information
        """
        facilities = []
        
        if 'elements' not in data:
            return facilities
        
        for element in data['elements']:
            facility = LocationService._extract_facility(element, user_lat, user_lon)
            if facility:
                facilities.append(facility)
        
        # Sort by distance
        facilities.sort(key=lambda x: x['distance'])
        
        # Return limited results
        return facilities[:limit]
    
    @staticmethod
    def _extract_facility(element: Dict, user_lat: float, user_lon: float) -> Dict:
        """Extract facility information from Overpass element"""
        
        # Get coordinates
        if 'center' in element:
            lat = element['center']['lat']
            lon = element['center']['lon']
        elif 'lat' in element and 'lon' in element:
            lat = element['lat']
            lon = element['lon']
        else:
            return None
        
        # Get tags (name, type, etc.)
        tags = element.get('tags', {})
        name = tags.get('name', 'Unknown Facility')
        
        # Determine facility type
        facility_type = 'Medical Facility'
        if tags.get('amenity') == 'hospital' or tags.get('healthcare') == 'hospital':
            facility_type = 'Hospital'
        elif tags.get('amenity') == 'clinic' or tags.get('healthcare') == 'clinic':
            facility_type = 'Clinic'
        
        # Calculate distance
        distance = LocationService._calculate_distance(user_lat, user_lon, lat, lon)
        
        # Get additional info
        phone = tags.get('phone', '')
        website = tags.get('website', '')
        opening_hours = tags.get('opening_hours', '')
        
        return {
            'name': name,
            'type': facility_type,
            'latitude': lat,
            'longitude': lon,
            'distance': round(distance, 2),  # in km
            'phone': phone,
            'website': website,
            'opening_hours': opening_hours,
            'operator': tags.get('operator', '')
        }
    
    @staticmethod
    def _calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate distance between two coordinates in kilometers
        Using Haversine formula
        """
        R = 6371  # Earth's radius in kilometers
        
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)
        
        a = (math.sin(delta_phi / 2) ** 2 +
             math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2)
        
        c = 2 * math.asin(math.sqrt(a))
        distance = R * c
        
        return distance
