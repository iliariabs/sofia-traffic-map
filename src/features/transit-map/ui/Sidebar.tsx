import { useState, useRef, useEffect, useMemo } from 'react'
import { useTransitStore } from '../store/useTransitStore'
import { VehicleTypeMapper } from '../../../domain/services/VehicleTypeMapper'
import type { Route } from '../../../entities/route'
import type { Stop } from '../../../entities/stop'


const SidebarContent = () => {
  const {
    routes,
    stops,
    types,
    toggleType,
    search,
    setSearch,
    selectedRoutes,
    toggleRoute,
    lastUpdate,
    loadVehicles,
    showStops,
    toggleStops,
    focusOnStop
  } = useTransitStore()

  const [stopSearch, setStopSearch] = useState('')

  const usedTypes = new Set<string>()
  for (const routeId of selectedRoutes) {
    const route = routes.get(routeId)
    if (route) {
      const type = VehicleTypeMapper.fromRouteType(route.type)
      if (type === 'bus' || type === 'tram') {
        usedTypes.add(type)
      }
    }
  }

  const handleToggleType = (type: 'bus' | 'tram') => {
    if (usedTypes.has(type)) return
    toggleType(type)
  }

  const routeResults = search
    ? [...routes.values()]
        .filter(r => {
          const type = VehicleTypeMapper.fromRouteType(r.type)
          const isAllowedType = type === 'bus' || type === 'tram'
          const isTypeEnabled = type in types && types[type as 'bus' | 'tram']
          return (
            isAllowedType &&
            isTypeEnabled &&
            r.shortName.toUpperCase().includes(search.toUpperCase()) &&
            !selectedRoutes.has(r.id)
          )
        })
        .sort((a, b) => a.shortName.localeCompare(b.shortName))
        .slice(0, 50)
    : []

  const stopResults = useMemo(() => {
    if (!stopSearch) return []

    const seenNames = new Set<string>()
    const results: Stop[] = []

    const query = stopSearch.toUpperCase()

    for (const stop of stops.values()) {
      const nameMatch = stop.name.toUpperCase().includes(query)

      if ((nameMatch) && !seenNames.has(stop.name)) {
        seenNames.add(stop.name)
        results.push(stop)
      }
    }

    return results
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 50)
  }, [stops, stopSearch])

  const activeRoutes = [...selectedRoutes]
    .map(id => routes.get(id))
    .filter((r): r is Route => r !== undefined)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tighter text-green-400">
          Sofia Transport
        </h1>
        <div className="flex items-center justify-between mt-3 text-sm text-green-600">
          <span>Last update: {lastUpdate?.toLocaleTimeString() || '-'}</span>
          <button
            onClick={loadVehicles}
            className="px-5 py-2 bg-green-900 hover:bg-green-800 text-green-100 font-medium rounded transition"
          >
            Refresh
          </button>
        </div>
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={showStops}
          onChange={toggleStops}
          className="w-6 h-6 accent-green-500 rounded"
        />
        <span className="text-lg font-medium text-green-300">Show stops</span>
      </label>

      <div>
        <h3 className="font-bold text-green-400 mb-3">Types</h3>
        <div className="grid grid-cols-2 gap-4">
          {(['bus', 'tram'] as const).map(t => {
            const isUsed = usedTypes.has(t)
            const isChecked = types[t]
            return (
              <label
                key={t}
                className={`flex items-center gap-3 cursor-pointer ${isUsed ? 'opacity-60' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={isUsed}
                  onChange={() => handleToggleType(t)}
                  className={`w-5 h-5 accent-green-500 ${isUsed ? 'cursor-not-allowed' : ''}`}
                />
                <span className={`capitalize text-green-300 font-medium ${isUsed ? 'select-none' : ''}`}>
                  {t}
                  {isUsed && ' (in use)'}
                </span>
              </label>
            )
          })}
        </div>
      </div>

      <div>
        <input
          type="text"
          placeholder="Route number..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-4 bg-black border-2 border-green-700 text-green-300 text-xl placeholder-green-600 focus:outline-none focus:border-green-500 transition"
        />
        {routeResults.length > 0 && (
          <div className="mt-3 border-t border-green-900 pt-4">
            <div className="max-h-64 overflow-y-auto border border-green-700 bg-black/40 rounded scrollbar-thin scrollbar-thumb-green-700">
              {routeResults.map(r => (
                <div
                  key={r.id}
                  onClick={() => toggleRoute(r.id)}
                  className="px-4 py-3 border-b border-green-900 hover:bg-green-900/40 cursor-pointer transition last:border-b-0"
                >
                  <strong className="font-bold text-green-100 text-lg">{r.shortName}</strong>
                  <span className="text-green-400 text-sm ml-2">– {r.longName}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <input
          type="text"
          placeholder="Stop name..."
          value={stopSearch}
          onChange={e => setStopSearch(e.target.value)}
          className="w-full px-4 py-4 bg-black border-2 border-green-700 text-green-300 text-xl placeholder-green-600 focus:outline-none focus:border-green-500 transition"
        />
        {stopResults.length > 0 && (
          <div className="mt-3 border-t border-green-900 pt-4">
            <div className="max-h-64 overflow-y-auto border border-green-700 bg-black/40 rounded scrollbar-thin scrollbar-thumb-green-700">
              {stopResults.map(stop => (
                <div
                  key={stop.id}
                  className="px-4 py-3 border-b border-green-900 hover:bg-green-900/40 cursor-pointer transition last:border-b-0"
                  onClick={() => {
                    focusOnStop(stop.id)
                    setStopSearch('')
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="truncate">
                      <strong className="font-bold text-green-100 text-lg">
                        {stop.name}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {activeRoutes.length > 0 && (
        <div className="space-y-2 border-t border-green-900 pt-4">
          <h3 className="text-green-400 font-bold mb-2">Selected routes</h3>
          {activeRoutes.map(r => (
            <div
              key={r.id}
              className="flex items-center justify-between p-3 bg-green-900/30 border border-green-800 rounded"
            >
              <div className="truncate">
                <strong className="text-green-100 font-bold text-lg">{r.shortName}</strong>
                <span className="text-green-400 text-sm ml-2">– {r.longName}</span>
              </div>
              <button
                onClick={() => toggleRoute(r.id)}
                className="text-red-500 hover:text-red-400 text-2xl font-bold"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <>
      <div className="hidden md:block fixed inset-y-0 right-0 w-80 bg-black border-l border-green-800 z-[500] overflow-y-auto scrollbar-thin scrollbar-thumb-green-700">
        <div className="p-6 space-y-6">
          <SidebarContent />
        </div>
      </div>

      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-0 left-0 right-0 h-12 bg-black flex items-center justify-center z-[999] cursor-pointer active:bg-green-700 transition-colors"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="w-12 h-1.5 bg-green-400 rounded-full" />
        </button>

        <div
          className={`fixed inset-0 bg-black/60 z-[998] transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsOpen(false)}
        />

        <div
          className={`fixed inset-x-0 bottom-0 z-[999] bg-black flex flex-col transition-transform duration-500 ease-out ${
            isOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
          style={{
            height: '90vh',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          <div className="flex items-center justify-center py-4 bg-black border-b border-green-800 shrink-0">
            <button
              onClick={() => setIsOpen(false)}
              className="w-12 h-1.5 bg-green-600 rounded-full active:bg-green-500 transition-colors"
            />
          </div>

          <div
            ref={contentRef}
            className="flex-1 overflow-y-auto px-5 pt-6 pb-8 scrollbar-thin scrollbar-thumb-green-700"
          >
            <SidebarContent />
          </div>
        </div>
      </div>
    </>
  )
}