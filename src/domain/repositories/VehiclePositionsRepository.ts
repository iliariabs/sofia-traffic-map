import type { Vehicle } from '../../entities/vehicle'

export interface IVehiclePositionsRepository {
  fetch(): Promise<Vehicle[]>
}