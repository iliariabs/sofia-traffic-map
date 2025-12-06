import type { Route } from '../../entities/route'
import type { Stop } from '../../entities/stop'
import type { Shape } from '../../entities/shape'

export interface IStaticGtfsRepository {
  load(): Promise<void>
  getRoutes(): Map<string, Route>
  getStops(): Map<string, Stop>
  getShapes(): Map<string, Shape>
  getRouteToShapes(): Map<string, Set<string>>
}