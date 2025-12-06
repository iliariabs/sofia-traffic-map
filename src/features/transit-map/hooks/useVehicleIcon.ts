import * as L from 'leaflet'

export const useVehicleIcon = () => {
  return (label: string, color: string, bearing: number, active: boolean) => {
    const size = active ? 44 : 34
    const html = `<div style="background:#${color};width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;transform:rotate(${bearing}deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:${active ? '18' : '14'}px">${label}</div>`

    return L.divIcon({
      html,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      className: '',
    })
  }
}