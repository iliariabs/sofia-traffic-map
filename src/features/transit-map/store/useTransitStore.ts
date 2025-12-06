import { create } from 'zustand'
import { VehiclePositionsFetcher } from '../../../infrastructure/gtfs/VehiclePositionsFetcher'
import { StaticGtfsLoader } from '../../../infrastructure/gtfs/StaticGtfsLoader'
import type { Vehicle } from '../../../entities/vehicle'
import type { Route } from '../../../entities/route'
import type { Stop } from '../../../entities/stop'
import type { Shape } from '../../../entities/shape'

interface TransitState {
  vehicles: Vehicle[]
  routes: Map<string, Route>
  stops: Map<string, Stop>
  shapes: Map<string, Shape>
  routeToShapes: Map<string, Set<string>>

  types: Record<'bus' | 'tram', boolean>
  selectedRoutes: Set<string>
  search: string
  showStops: boolean
  lastUpdate: Date | null
  focusedStopId: string | null

  staticLoaded: boolean
  vehiclesLoaded: boolean

  loadStatic: () => Promise<void>
  loadVehicles: () => Promise<void>
  toggleType: (t: 'bus' | 'tram') => void
  toggleRoute: (routeId: string) => void
  clearSelectedRoutes: () => void
  setSearch: (q: string) => void
  toggleStops: () => void
  focusOnStop: (stopId: string | null) => void
}

const vehicleFetcher = new VehiclePositionsFetcher()
const staticLoader = new StaticGtfsLoader()

export const useTransitStore = create<TransitState>((set) => ({
  vehicles: [],
  routes: new Map(),
  stops: new Map(),
  shapes: new Map(),
  routeToShapes: new Map(),

  types: { bus: true, tram: true },
  selectedRoutes: new Set<string>(),
  search: '',
  showStops: true,
  lastUpdate: null,
  focusedStopId: null,

  staticLoaded: false,
  vehiclesLoaded: false,

  loadStatic: async () => {
    await staticLoader.load()
    set({
      routes: staticLoader.getRoutes(),
      stops: staticLoader.getStops(),
      shapes: staticLoader.getShapes(),
      routeToShapes: staticLoader.getRouteToShapes(),
      staticLoaded: true,
    })
  },

  loadVehicles: async () => {
    const vehicles = await vehicleFetcher.fetch()
    set({
      vehicles,
      lastUpdate: new Date(),
      vehiclesLoaded: true,
    })
  },

  toggleType: (t) => set((s) => ({ types: { ...s.types, [t]: !s.types[t] } })),

  toggleRoute: (routeId) =>
    set((s) => {
      const newSelected = new Set(s.selectedRoutes)
      newSelected.has(routeId) ? newSelected.delete(routeId) : newSelected.add(routeId)
      return {
        selectedRoutes: newSelected,
        search: newSelected.size === 0 ? s.search : '',
      }
    }),

  clearSelectedRoutes: () => set({ selectedRoutes: new Set<string>() }),
  setSearch: (q) => set({ search: q }),
  toggleStops: () => set((s) => ({ showStops: !s.showStops })),
  focusOnStop: (stopId) => set({ focusedStopId: stopId }),
}))

export const useIsDataLoading = () => {
  const { staticLoaded, vehiclesLoaded } = useTransitStore()
  return !staticLoaded || !vehiclesLoaded
}