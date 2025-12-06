import { useIsDataLoading } from '../store/useTransitStore'

export function DataLoadingOverlay() {
  const isLoading = useIsDataLoading()

  if (!isLoading) return null

  return (
    <div className="fixed inset-x-0 top-0 z-[500] flex justify-center pt-4 pointer-events-none">
      <div className="bg-black text-white px-6 py-3 rounded-full shadow-2xl backdrop-blur-sm border border-gray-700 flex items-center gap-3">
        <svg className="animate-spin h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-green-300 font-medium">Loading data…</span>
      </div>
    </div>
  )
}