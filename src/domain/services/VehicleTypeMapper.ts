import type { VehicleType } from '../types'

export class VehicleTypeMapper {
  static fromRouteType(routeType: number): VehicleType | 'other' {
    if ([0, 900].includes(routeType)) return 'tram'
    if ([3, 700, 11].includes(routeType)) return 'bus'
    return 'other'
  }
}