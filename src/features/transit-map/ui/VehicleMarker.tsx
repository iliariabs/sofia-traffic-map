import { Marker, Popup } from 'react-leaflet'
import { useVehicleIcon } from '../hooks/useVehicleIcon'
import { VehicleTypeMapper } from '../../../domain/services/VehicleTypeMapper'
import type { Vehicle } from '../../../entities/vehicle'
import type { Route } from '../../../entities/route'

interface Props {
  vehicle: Vehicle
  route: Route
  isActive: boolean
}

export const VehicleMarker = ({ vehicle, route, isActive }: Props) => {
  const createIcon = useVehicleIcon()
  const icon = createIcon(route.shortName, route.color, vehicle.bearing, isActive)
  return (
    <Marker position={[vehicle.lat, vehicle.lng]} icon={icon}>
      <Popup>
        <div className="p-3 min-w-[180px]">
          <div className="font-bold text-2xl text-green-500 mb-1">
            Line {route.shortName}
          </div>
          <div className="text-sm text-green-700 mb-2">{route.longName}</div>
          <div className="inline-block px-3 py-1 bg-green-400 rounded-full text-xs font-medium uppercase tracking-wider text-black">
            {VehicleTypeMapper.fromRouteType(route.type)}
          </div>
        </div>
      </Popup>
    </Marker>
  )
}