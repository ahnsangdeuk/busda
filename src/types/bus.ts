export interface BusArrival {
  routeId: string
  routeNo: string
  stationId: string
  stationName: string
  predictTime1: number
  predictTime2: number
  remainSeatCnt1: number
  remainSeatCnt2: number
  lowplate1: string
  lowplate2: string
  plateNo1: string
  plateNo2: string
  busStatus1: string
  busStatus2: string
  congestion1: string
  congestion2: string
  vehicleType1: string
  vehicleType2: string
  routeType: string
  direction: string
  lastBusFlag1: boolean
  lastBusFlag2: boolean
}

export interface BusRoute {
  routeId: string
  routeNo: string
  routeType: string
  startStop: string
  endStop: string
  runningTime: number
}

export interface BusStop {
  stopId: string
  stopName: string
  latitude: number
  longitude: number
  arsId?: string
} 