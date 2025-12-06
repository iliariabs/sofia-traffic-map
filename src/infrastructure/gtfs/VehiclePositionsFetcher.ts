import { transit_realtime } from 'gtfs-realtime-bindings'
import type { IVehiclePositionsRepository } from '../../domain/repositories/VehiclePositionsRepository'
import type { Vehicle } from '../../entities/vehicle'

export class VehiclePositionsFetcher implements IVehiclePositionsRepository {
  private url = 'https://gtfs.sofiatraffic.bg/api/v1/vehicle-positions'

  async fetch(): Promise<Vehicle[]> {
    const res = await fetch(this.url)
    const buffer = await res.arrayBuffer()
    const feed = transit_realtime.FeedMessage.decode(new Uint8Array(buffer))

    return feed.entity
      .filter(e => e.vehicle?.position)
      .map(e => {
        const v = e.vehicle!
        const p = v.position!
        return {
          id: v.vehicle?.id || e.id || '',
          routeId: v.trip?.routeId || '',
          lat: p.latitude,
          lng: p.longitude,
          bearing: p.bearing ?? 0,
        }
      })
  }
}