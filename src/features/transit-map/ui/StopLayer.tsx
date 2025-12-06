import { CircleMarker, Popup, useMapEvents } from 'react-leaflet'
import { useTransitStore } from '../store/useTransitStore'
import 'leaflet/dist/leaflet.css'
import { useMemo, useState } from 'react'
import type { LatLngBounds, Map as LeafletMap } from 'leaflet'

export function StopLayer({ minZoom = 15 }: { minZoom?: number }) {
  const { stops, showStops } = useTransitStore()
  const [zoom, setZoom] = useState<number>(12)
  const [bounds, setBounds] = useState<LatLngBounds | null>(null)

  useMapEvents({
    zoomend: (e) => {
      const map = e.target as LeafletMap
      setZoom(map.getZoom())
      setBounds(map.getBounds())
    },
    moveend: (e) => {
      const map = e.target as LeafletMap
      setBounds(map.getBounds())
    },
  })

  const visibleStops = useMemo(() => {
    if (!showStops || zoom < minZoom || !bounds) return null

    const padded = bounds.pad(0.3)
    const result: React.ReactElement[] = []

    for (const stop of stops.values()) {
      if (padded.contains([stop.lat, stop.lng])) {
        result.push(
          <CircleMarker
            key={stop.id}
            center={[stop.lat, stop.lng]}
            radius={Math.min(8, 4 + (zoom - minZoom) * 1.5)}
            fillColor="#10b981"
            color="#000"
            weight={1}
            opacity={1}
            fillOpacity={0.9}
          >
            <Popup>
              <div className="font-medium text-sm">{stop.name}</div>
            </Popup>
          </CircleMarker>
        )
      }
    }

    return result.length > 0 ? result : null
  }, [stops, showStops, zoom, minZoom, bounds])

  if (!showStops || zoom < minZoom) return null

  return <>{visibleStops}</>
}