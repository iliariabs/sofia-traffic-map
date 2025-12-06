import JSZip from 'jszip'
import Papa from 'papaparse';
import type { ParseResult } from 'papaparse';
import type { IStaticGtfsRepository } from '../../domain/repositories/StaticGtfsRepository'
import type { Route } from '../../entities/route'
import type { Stop } from '../../entities/stop'
import type { Shape } from '../../entities/shape'
import type { LatLngExpression } from 'leaflet'

type CsvRow = Record<string, string | undefined>

export class StaticGtfsLoader implements IStaticGtfsRepository {
  private url = 'https://gtfs.sofiatraffic.bg/api/v1/static'
  private loaded = false
  private routes = new Map<string, Route>()
  private stops = new Map<string, Stop>()
  private shapes = new Map<string, Shape>()
  private routeToShapes = new Map<string, Set<string>>()

  async load() {
    if (this.loaded) return
    const res = await fetch(this.url)
    const zip = await JSZip.loadAsync(await res.arrayBuffer())
    await Promise.all([
      this.parseRoutes(zip),
      this.parseStops(zip),
      this.parseShapes(zip),
      this.parseTrips(zip),
    ])
    this.loaded = true
  }

  private async parseRoutes(zip: JSZip) {
    const text = await zip.file('routes.txt')?.async('text')
    if (!text) return

    Papa.parse<CsvRow>(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results: ParseResult<CsvRow>) => {
        for (const r of results.data) {
          if (!r.route_id) continue
          this.routes.set(r.route_id, {
            id: r.route_id,
            shortName: r.route_short_name?.trim() || '',
            longName: r.route_long_name?.trim() || '',
            type: Number(r.route_type || 3),
            color: (r.route_color?.replace(/^#/, '') || '3388ff').toLowerCase(),
          })
        }
      },
    })
  }

  private async parseStops(zip: JSZip) {
    const text = await zip.file('stops.txt')?.async('text')
    if (!text) return

    Papa.parse<CsvRow>(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results: ParseResult<CsvRow>) => {
        for (const r of results.data) {
          if (!r.stop_id) continue
          const lat = Number(r.stop_lat)
          const lng = Number(r.stop_lon)
          if (isNaN(lat) || isNaN(lng)) continue
          this.stops.set(r.stop_id, {
            id: r.stop_id,
            name: r.stop_name?.trim() || '',
            lat,
            lng,
          })
        }
      },
    })
  }

  private async parseShapes(zip: JSZip) {
    const text = await zip.file('shapes.txt')?.async('text')
    if (!text) return

    const temp = new Map<string, { lat: number; lng: number; seq: number }[]>()

    Papa.parse<CsvRow>(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results: ParseResult<CsvRow>) => {
        for (const r of results.data) {
          const lat = Number(r.shape_pt_lat)
          const lng = Number(r.shape_pt_lon)
          const seq = Number(r.shape_pt_sequence)
          if (isNaN(lat) || isNaN(lng) || isNaN(seq) || !r.shape_id) continue
          if (!temp.has(r.shape_id)) temp.set(r.shape_id, [])
          temp.get(r.shape_id)!.push({ lat, lng, seq })
        }
      },
    })

    for (const [id, points] of temp) {
      points.sort((a, b) => a.seq - b.seq)
      this.shapes.set(id, points.map(p => [p.lat, p.lng] as LatLngExpression))
    }
  }

  private async parseTrips(zip: JSZip) {
    const text = await zip.file('trips.txt')?.async('text')
    if (!text) return

    Papa.parse<CsvRow>(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results: ParseResult<CsvRow>) => {
        for (const r of results.data) {
          if (!r.route_id || !r.shape_id) continue
          if (!this.routeToShapes.has(r.route_id)) this.routeToShapes.set(r.route_id, new Set())
          this.routeToShapes.get(r.route_id)!.add(r.shape_id)
        }
      },
    })
  }

  getRoutes() { return this.routes }
  getStops() { return this.stops }
  getShapes() { return this.shapes }
  getRouteToShapes() { return this.routeToShapes }
}