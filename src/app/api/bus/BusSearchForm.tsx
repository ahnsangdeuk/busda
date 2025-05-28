'use client'
import { useState } from 'react'
import BusArrivalList from './BusArrivalList'

export default function BusSearchForm() {
  const [routeNo, setRouteNo] = useState<string>('')
  const [search, setSearch] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSearch(routeNo)
  }

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl p-6 mb-6">
        <div className="mb-4">
          <label htmlFor="busNumber" className="block text-sm font-medium text-gray-700 mb-1">
            버스 번호
          </label>
          <div className="flex gap-2">
            <input
              id="busNumber"
              className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="예: 401, 급행3"
              value={routeNo}
              onChange={e => setRouteNo(e.target.value)}
            />
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200 flex items-center"
              type="submit"
            >
              조회
            </button>
          </div>
        </div>
        
        <p className="text-sm text-gray-500">
          버스 번호를 입력하고 조회 버튼을 누르면 실시간 도착 정보를 확인할 수 있습니다.
        </p>
      </form>
      
      {search && <BusArrivalList routeNo={search} />}
    </div>
  )
} 