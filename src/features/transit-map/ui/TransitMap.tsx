import { MapContainer, TileLayer, Polyline, useMapEvents, useMap } from 'react-leaflet'
import { VehicleMarker } from './VehicleMarker'
import { useTransitStore } from '../store/useTransitStore'
import { VehicleTypeMapper } from '../../../domain/services/VehicleTypeMapper'
import 'leaflet/dist/leaflet.css'
import type { Vehicle } from '../../../entities/vehicle'
import { StopLayer } from './StopLayer'
import { useEffect, useMemo, useRef, useState } from 'react'
import { LatLngBounds, type LatLngExpression, type Map as LeafletMap, type LatLngTuple } from 'leaflet'

const polylineIntersectsBounds = (points: LatLngExpression[], bounds: LatLngBounds): boolean => {
  for (const p of points) {
    if (bounds.contains(p as [number, number])) return true
  }
  return false
}

const MapBoundsProvider = ({ onBoundsChange }: { onBoundsChange: (b: LatLngBounds) => void }) => {
  const map = useMapEvents({
    moveend: () => onBoundsChange(map.getBounds()),
    zoomend: () => onBoundsChange(map.getBounds()),
  }) as LeafletMap

  const initialized = useRef(false)
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      onBoundsChange(map.getBounds())
    }
  }, [map, onBoundsChange])

  return null
}

function FocusStopController() {
  const { focusedStopId, stops, focusOnStop } = useTransitStore()
  const map = useMap()

  useEffect(() => {
    if (!focusedStopId) return

    const stop = stops.get(focusedStopId)
    if (!stop) {
      focusOnStop(null)
      return
    }

    const target: LatLngTuple = [stop.lat, stop.lng]

    map.setView(target, 18, {
      animate: true,
      duration: 1.0,
    })

    map.once('zoomend', () => {
    })

    setTimeout(() => {
      map.fire('zoomend')
      map.fire('moveend')
    }, 100)

    setTimeout(() => focusOnStop(null), 1500)
  }, [focusedStopId, stops, map, focusOnStop])

  return null
}

const SOFIA_BOUNDS = new LatLngBounds(
  [42.3, 22.6],
  [43.2, 24.1]
);

export const TransitMap = () => {
  const { vehicles, routes, shapes, routeToShapes, types, selectedRoutes } = useTransitStore()
  const [bounds, setBounds] = useState<LatLngBounds | null>(null)

  const dedupedVehicles = useMemo(() => {
    const map = new Map<string, Vehicle>()
    vehicles.forEach(v => map.set(v.id, v))
    return Array.from(map.values())
  }, [vehicles])

  const filteredVehicles = useMemo(() => {
    return dedupedVehicles
      .filter(v => {
        const route = routes.get(v.routeId)
        if (!route) return false
        const type = VehicleTypeMapper.fromRouteType(route.type)
        if (type !== 'bus' && type !== 'tram') return false
        const typeEnabled = types[type]
        const routeSelected = selectedRoutes.size === 0 || selectedRoutes.has(v.routeId)
        return typeEnabled && routeSelected
      })
      .map(v => ({
        ...v,
        position: { lat: v.lat, lng: v.lng } as const,
      }))
  }, [dedupedVehicles, routes, types, selectedRoutes])

  const relevantRouteIds = selectedRoutes.size === 0 ? Array.from(routes.keys()) : Array.from(selectedRoutes)

  const visiblePolylines = useMemo(() => {
    if (!bounds || selectedRoutes.size === 0) return null
    const elements: React.ReactElement[] = []

    for (const routeId of relevantRouteIds) {
      const route = routes.get(routeId)
      if (!route) continue
      const shapeIds = routeToShapes.get(routeId)
      if (!shapeIds || shapeIds.size === 0) continue
      const color = '#' + (route.color || '10b981')

      for (const shapeId of shapeIds) {
        const pts = shapes.get(shapeId)
        if (!pts || pts.length < 2) continue
        if (polylineIntersectsBounds(pts, bounds)) {
          elements.push(
            <Polyline
              key={`poly-${routeId}-${shapeId}`}
              positions={pts}
              color={color}
              weight={8}
              opacity={0.9}
              interactive={false}
            />
          )
        }
      }
    }

    return elements.length > 0 ? elements : null
  }, [relevantRouteIds, routes, routeToShapes, shapes, bounds, selectedRoutes])

  const vehiclesInView = useMemo(() => {
    if (!bounds) return []
    const padded = bounds.pad(0.25)
    return filteredVehicles.filter(v => padded.contains([v.position.lat, v.position.lng]))
  }, [filteredVehicles, bounds])

  return (
    <MapContainer
      center={[42.6977, 23.3219]}
      zoom={12}
      minZoom={12}   
      maxZoom={18}
      zoomControl={false}
      className="h-screen w-full"
      
      maxBounds={SOFIA_BOUNDS}
      maxBoundsViscosity={1.0} 
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap"
      />

      <MapBoundsProvider onBoundsChange={setBounds} />
      <FocusStopController />
      {visiblePolylines}
      <StopLayer minZoom={15} />

      {vehiclesInView.map(v => {
        const route = routes.get(v.routeId)!
        return (
          <VehicleMarker
            key={v.id}
            vehicle={v}
            route={route}
            isActive={selectedRoutes.has(v.routeId)}
          />
        )
      })}
    </MapContainer>
  );
}