import { useEffect } from 'react'
import { Sidebar } from '../features/transit-map/ui/Sidebar'
import { TransitMap } from '../features/transit-map/ui/TransitMap'
import { DataLoadingOverlay } from '../features/transit-map/ui/DataLoadingOverlay'
import { useTransitStore } from '../features/transit-map/store/useTransitStore'
import '../index.css'

export default function App() {
  const { loadStatic, loadVehicles } = useTransitStore()

  useEffect(() => {
    loadStatic()
    loadVehicles()
    const i = setInterval(loadVehicles, 30000)
    return () => clearInterval(i)
  }, [loadStatic, loadVehicles])

  return (
    <>
      <Sidebar />
      <TransitMap />
      <DataLoadingOverlay />
    </>
  )
}