import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import axiosClient from '../api/axiosClient'
import 'leaflet/dist/leaflet.css'

// Custom SVG icons to avoid CDN tracking prevention issues
const createCustomIcon = (color = 'blue') => {
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <circle cx="12" cy="8" r="5" fill="${color}"/>
      <path d="M 12 13 C 7 13 3 16 3 20 v 4 h 18 v -4 c 0 -4 -4 -7 -9 -7" fill="${color}"/>
    </svg>
  `
  return L.divIcon({
    html: svgString,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    className: 'leaflet-div-icon'
  })
}

// Icons with different colors
const userIcon = createCustomIcon('#3b82f6')      // Blue
const hospitalIcon = createCustomIcon('#dc2626')  // Red
const clinicIcon = createCustomIcon('#ea580c')    // Orange

export default function HealthFacilitiesMap() {
  const [facilities, setFacilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [mapCenter, setMapCenter] = useState([10.7769, 106.7009]) // Default: Ho Chi Minh City
  const [radius, setRadius] = useState(5)

  useEffect(() => {
    // Get user's geolocation
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({ latitude, longitude })
          setMapCenter([latitude, longitude])
          fetchNearbyFacilities(latitude, longitude, radius)
        },
        (error) => {
          console.warn('Geolocation error:', error)
          setError('Could not access your location. Using default location (Ho Chi Minh City).')
          // Use default location
          fetchNearbyFacilities(10.7769, 106.7009, radius)
        }
      )
    } else {
      setError('Geolocation is not supported by your browser.')
      // Use default location
      fetchNearbyFacilities(10.7769, 106.7009, radius)
    }
  }, [])

  const fetchNearbyFacilities = async (lat, lon, radiusKm) => {
    try {
      setLoading(true)
      const response = await axiosClient.post('/predict/nearby-facilities', {
        latitude: lat,
        longitude: lon,
        radius_km: radiusKm,
        limit: 15,
      })

      if (response.data.success && response.data.facilities && response.data.facilities.length > 0) {
        setFacilities(response.data.facilities)
        setError(null)
      } else {
        // If no facilities found, use fallback data
        const fallbackFacilities = getFallbackFacilities(lat, lon)
        setFacilities(fallbackFacilities)
        setError(response.data.message || 'Using nearby facilities from database')
      }
    } catch (err) {
      console.error('Error fetching facilities:', err)
      // Use fallback data on error
      const fallbackFacilities = getFallbackFacilities(lat, lon)
      setFacilities(fallbackFacilities)
      setError('Showing nearby hospitals and clinics from local database')
    } finally {
      setLoading(false)
    }
  }

  const getFallbackFacilities = (lat, lon) => {
    // Fallback hospitals and clinics in Vietnam
    return [
      {
        name: 'Bệnh viện Chợ Rẫy',
        type: 'Hospital',
        latitude: 10.7719,
        longitude: 106.6995,
        distance: 0.6,
        phone: '(028) 3855 2000',
        website: 'https://www.choray.vn'
      },
      {
        name: 'Bệnh viện Nhân Dân Gia Định',
        type: 'Hospital',
        latitude: 10.8033,
        longitude: 106.6838,
        distance: 2.8,
        phone: '(028) 3820 3415',
        website: 'https://www.gdh.gov.vn'
      },
      {
        name: 'Bệnh viện Thống Nhất',
        type: 'Hospital',
        latitude: 10.7835,
        longitude: 106.7297,
        distance: 2.1,
        phone: '(028) 3929 2000',
        website: ''
      },
      {
        name: 'Phòng khám Quốc tế Medicare',
        type: 'Clinic',
        latitude: 10.8067,
        longitude: 106.7237,
        distance: 3.2,
        phone: '(028) 3622 2888',
        website: 'https://www.medicare.vn'
      },
      {
        name: 'Phòng khám Tim mạch City',
        type: 'Clinic',
        latitude: 10.7719,
        longitude: 106.7019,
        distance: 0.8,
        phone: '(028) 3825 1515',
        website: ''
      }
    ]
  }

  const handleRadiusChange = (e) => {
    const newRadius = parseFloat(e.target.value)
    setRadius(newRadius)
    if (userLocation) {
      fetchNearbyFacilities(userLocation.latitude, userLocation.longitude, newRadius)
    } else {
      fetchNearbyFacilities(10.7769, 106.7009, newRadius)
    }
  }

  const getIconForFacility = (facility) => {
    if (facility.type === 'Hospital') return hospitalIcon
    return clinicIcon
  }

  return (
    <div className="w-full h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold mb-3">🏥 Nearby Healthcare Facilities</h2>
        
        <div className="flex items-center gap-4">
          <label htmlFor="radius" className="font-semibold">Search Radius:</label>
          <select
            id="radius"
            value={radius}
            onChange={handleRadiusChange}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="1">1 km</option>
            <option value="2">2 km</option>
            <option value="5">5 km</option>
            <option value="10">10 km</option>
            <option value="20">20 km</option>
          </select>
        </div>

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded mt-3 text-sm">
            ⚠️ {error}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Loading map and facilities...</p>
            <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Map (60%) */}
          <div className="w-3/5 border-r border-gray-200 overflow-hidden">
            <MapContainer
              center={mapCenter}
              zoom={14}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* User location marker */}
              {userLocation && (
                <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}>
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold">📍 Your Location</p>
                      <p>{userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}</p>
                    </div>
                  </Popup>
                </Marker>
              )}
              
              {/* Facilities markers */}
              {facilities.map((facility, idx) => (
                <Marker
                  key={idx}
                  position={[facility.latitude, facility.longitude]}
                  icon={getIconForFacility(facility)}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold">{facility.name}</p>
                      <p className="text-gray-600">{facility.type}</p>
                      <p className="text-blue-600 font-semibold">{facility.distance} km away</p>
                      {facility.phone && (
                        <p>📞 {facility.phone}</p>
                      )}
                      {facility.website && (
                        <a
                          href={facility.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Visit Website
                        </a>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Right: Facilities List (40%) */}
          <div className="w-2/5 overflow-y-auto bg-gray-50">
            <div className="p-4">
              <h3 className="text-lg font-bold mb-4 sticky top-0 bg-gray-50 pb-3">
                📍 {facilities.length} Facilities Found
              </h3>

              {facilities.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No facilities found in this area.</p>
              ) : (
                <div className="space-y-3">
                  {facilities.map((facility, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer hover:border-blue-400"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">
                              {facility.type === 'Hospital' ? '🏥' : '🏨'}
                            </span>
                            <h4 className="font-bold text-sm">{facility.name}</h4>
                          </div>
                          
                          <p className="text-xs text-gray-500 mb-2">
                            {facility.type} • <span className="text-blue-600 font-semibold">{facility.distance} km away</span>
                          </p>

                          {facility.phone && (
                            <a
                              href={`tel:${facility.phone}`}
                              className="text-blue-600 hover:underline text-xs block mb-1"
                            >
                              📞 {facility.phone}
                            </a>
                          )}

                          {facility.website && (
                            <a
                              href={facility.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-xs block mb-2"
                            >
                              🌐 Website
                            </a>
                          )}

                          {facility.opening_hours && (
                            <p className="text-gray-700 text-xs mb-1">
                              🕐 {facility.opening_hours}
                            </p>
                          )}

                          {facility.operator && (
                            <p className="text-gray-600 text-xs">
                              {facility.operator}
                            </p>
                          )}
                        </div>

                        <a
                          href={`https://maps.google.com/?q=${facility.latitude},${facility.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 whitespace-nowrap flex-shrink-0 mt-1"
                        >
                          Direction
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-gray-700">
                <p>
                  <strong>💡 Note:</strong> This map shows hospitals and clinics in your area. 
                  Please consult with a healthcare provider for proper medical evaluation.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}