import { NextRequest, NextResponse } from 'next/server';

// API 라우트를 동적으로 설정 (정적 export와 호환)
export const dynamic = 'force-dynamic';

interface BusSchedule {
  departure: string;
  arrival: string;
  note?: string;
}

interface ScheduleData {
  routeNo: string;
  stopName: string;
  weekdaySchedule: BusSchedule[];
  weekendSchedule: BusSchedule[];
  operatingInfo: {
    firstBus: string;
    lastBus: string;
    interval: string;
    operatingTime: string;
    totalDistance: string;
    totalTime: string;
  };
  nextBuses?: BusSchedule[];
}

// 샘플 시간표 데이터
const sampleSchedules: Record<string, ScheduleData> = {
  '101': {
    routeNo: '101',
    stopName: '대구역',
    weekdaySchedule: [
      { departure: '05:30', arrival: '05:35' },
      { departure: '06:00', arrival: '06:05' },
      { departure: '06:30', arrival: '06:35' },
      { departure: '07:00', arrival: '07:05' },
      { departure: '07:30', arrival: '07:35' },
      { departure: '08:00', arrival: '08:05' },
      { departure: '08:30', arrival: '08:35' },
      { departure: '09:00', arrival: '09:05' },
      { departure: '09:30', arrival: '09:35' },
      { departure: '10:00', arrival: '10:05' },
    ],
    weekendSchedule: [
      { departure: '06:00', arrival: '06:05' },
      { departure: '07:00', arrival: '07:05' },
      { departure: '08:00', arrival: '08:05' },
      { departure: '09:00', arrival: '09:05' },
      { departure: '10:00', arrival: '10:05' },
      { departure: '11:00', arrival: '11:05' },
    ],
    operatingInfo: {
      firstBus: '05:30',
      lastBus: '23:30',
      interval: '15-20분',
      operatingTime: '18시간',
      totalDistance: '24.5km',
      totalTime: '85분'
    }
  },
  '급행1': {
    routeNo: '급행1',
    stopName: '대구역',
    weekdaySchedule: [
      { departure: '06:00', arrival: '06:03' },
      { departure: '06:30', arrival: '06:33' },
      { departure: '07:00', arrival: '07:03' },
      { departure: '07:30', arrival: '07:33' },
      { departure: '08:00', arrival: '08:03' },
      { departure: '08:30', arrival: '08:33' },
    ],
    weekendSchedule: [
      { departure: '07:00', arrival: '07:03' },
      { departure: '08:00', arrival: '08:03' },
      { departure: '09:00', arrival: '09:03' },
      { departure: '10:00', arrival: '10:03' },
    ],
    operatingInfo: {
      firstBus: '06:00',
      lastBus: '22:00',
      interval: '30분',
      operatingTime: '16시간',
      totalDistance: '32.1km',
      totalTime: '65분'
    }
  },
  'Dalseong 4': {
    routeNo: 'Dalseong 4',
    stopName: '현풍농협',
    weekdaySchedule: [
      { departure: '06:00', arrival: '06:30', note: '기점출발예정' },
      { departure: '07:30', arrival: '08:00' },
      { departure: '09:00', arrival: '09:30' },
      { departure: '10:30', arrival: '11:00' },
      { departure: '12:00', arrival: '12:30' },
      { departure: '13:30', arrival: '14:00' },
      { departure: '15:00', arrival: '15:30' },
      { departure: '16:30', arrival: '17:00' },
      { departure: '18:00', arrival: '18:30' },
      { departure: '19:30', arrival: '20:00' },
    ],
    weekendSchedule: [
      { departure: '07:00', arrival: '07:30' },
      { departure: '09:00', arrival: '09:30' },
      { departure: '11:00', arrival: '11:30' },
      { departure: '13:00', arrival: '13:30' },
      { departure: '15:00', arrival: '15:30' },
      { departure: '17:00', arrival: '17:30' },
    ],
    operatingInfo: {
      firstBus: '06:00',
      lastBus: '20:00',
      interval: '90분',
      operatingTime: '14시간',
      totalDistance: '18.2km',
      totalTime: '45분'
    }
  }
};

// 다음 3개 버스 시간 계산
function getNextThreeBuses(schedule: BusSchedule[]): BusSchedule[] {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const upcomingBuses = schedule.filter(bus => {
    const [hours, minutes] = bus.departure.split(':').map(Number);
    const busTime = hours * 60 + minutes;
    return busTime > currentTime;
  });
  
  return upcomingBuses.slice(0, 3);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ routeNo: string }> }
) {
  const { routeNo } = await params;

  try {
    console.log(`버스 시간표 조회 요청: ${routeNo}`);

    // 샘플 데이터에서 해당 노선 찾기
    const scheduleData = sampleSchedules[routeNo];
    
    if (!scheduleData) {
      console.log(`시간표 데이터 없음: ${routeNo}`);
      
      // 기본 시간표 생성
      const defaultSchedule: ScheduleData = {
        routeNo,
        stopName: '정류장',
        weekdaySchedule: [
          { departure: '06:00', arrival: '06:05' },
          { departure: '07:00', arrival: '07:05' },
          { departure: '08:00', arrival: '08:05' },
          { departure: '09:00', arrival: '09:05' },
          { departure: '10:00', arrival: '10:05' },
        ],
        weekendSchedule: [
          { departure: '07:00', arrival: '07:05' },
          { departure: '09:00', arrival: '09:05' },
          { departure: '11:00', arrival: '11:05' },
        ],
        operatingInfo: {
          firstBus: '06:00',
          lastBus: '22:00',
          interval: '60분',
          operatingTime: '16시간',
          totalDistance: '20.0km',
          totalTime: '60분'
        }
      };
      
      // 다음 3개 버스 시간 계산
      const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
      const todaySchedule = isWeekend ? defaultSchedule.weekendSchedule : defaultSchedule.weekdaySchedule;
      defaultSchedule.nextBuses = getNextThreeBuses(todaySchedule);
      
      return NextResponse.json({
        success: true,
        data: defaultSchedule,
        source: 'default'
      });
    }

    // 다음 3개 버스 시간 계산
    const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
    const todaySchedule = isWeekend ? scheduleData.weekendSchedule : scheduleData.weekdaySchedule;
    scheduleData.nextBuses = getNextThreeBuses(todaySchedule);

    console.log(`시간표 데이터 조회 성공: ${routeNo} (${scheduleData.weekdaySchedule.length}개 평일, ${scheduleData.weekendSchedule.length}개 주말)`);

    return NextResponse.json({
      success: true,
      data: scheduleData,
      source: 'sample',
      message: `${routeNo} 노선 시간표 조회 완료`
    });

  } catch (error) {
    console.error('시간표 조회 중 오류:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '시간표 조회에 실패했습니다',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
} 