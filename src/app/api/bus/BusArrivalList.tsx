// src/app/api/bus/BusArrivalList.tsx
'use client'
import { useEffect, useState } from 'react'
import type { BusArrival } from '@/types/bus'
import Loader from '@/components/ui/Loader'

interface Props {
  routeNo: string
}

export default function BusArrivalList({ routeNo }: Props) {
  const [arrivals, setArrivals] = useState<BusArrival[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!routeNo) return
    setIsLoading(true)
    setError(null)
    fetch(`/api/bus?routeNo=${routeNo}`)
      .then(res => res.json())
      .then(res => {
        if (res.error) setError(res.error)
        else setArrivals(res.data)
      })
      .catch(e => setError(String(e)))
      .finally(() => setIsLoading(false))
  }, [routeNo])

  if (isLoading) {
    return <Loader />
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-medium">오류가 발생했습니다</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    )
  }
  
  if (!arrivals?.length) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
        <p>도착 정보가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-3 text-gray-800">
        {routeNo} 버스 도착 정보
      </h2>
      <ul className="space-y-3">
        {arrivals.map(arrival => (
          <li 
            key={arrival.stationId} 
            className="bg-white rounded-lg shadow-md border border-gray-100 p-4 transition-all hover:shadow-lg"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold text-lg text-gray-800">{arrival.stationName}</div>
              <div className="text-sm bg-blue-100 text-blue-800 py-1 px-2 rounded-full">{arrival.routeNo}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-gray-500">첫 번째 도착</div>
                <div className="flex justify-between mt-1">
                  <span className="font-medium text-blue-700">{arrival.predictTime1}분</span>
                  <span className="text-gray-600">{arrival.remainSeatCnt1}석</span>
                </div>
              </div>
              
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-gray-500">두 번째 도착</div>
                <div className="flex justify-between mt-1">
                  <span className="font-medium text-blue-700">{arrival.predictTime2}분</span>
                  <span className="text-gray-600">{arrival.remainSeatCnt2}석</span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}