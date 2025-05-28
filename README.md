# 🚌 대구 버스 정보 시스템 (BusDa)

대구광역시 버스 도착정보 및 경로 검색을 위한 웹 애플리케이션입니다.

## ✨ 주요 기능

### 🔍 버스 검색
- **노선번호 검색**: 101, 급행1, 달서1 등 노선번호로 직접 검색
- **정류장 검색**: 정류장명으로 해당 정류장의 모든 버스 정보 조회
- **인기 노선 바로가기**: 자주 이용되는 노선 버튼 제공

### 📱 실시간 도착정보 전광판
- **3가지 보기 모드**:
  - **도착시간순**: 모든 정류장을 도착시간 순으로 정렬
  - **버스도착정보**: 상세한 버스 정보 (혼잡도, 차량번호, 잔여석 등)
  - **전광판**: 실제 버스 정류장 전광판과 동일한 디자인

### 🗺️ 경로 검색
- **출발지 ↔ 도착지** 검색
- **환승 정보** 포함
- **소요시간, 정류장 수, 요금** 정보 제공
- **노선 타입별** 색상 구분 (급행, 간선, 지선, 달성)

## 🛠️ 기술 스택

- **Frontend**: Next.js 15 (App Router), TypeScript, React
- **Styling**: Tailwind CSS, Shadcn UI
- **API**: 대구광역시 공식 버스정보 API
- **상태관리**: React Hooks (useState, useEffect)

## 🚀 시작하기

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```

### 3. 브라우저에서 확인
```
http://localhost:3000
```

## 📂 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   │   └── bus/          # 버스 관련 API
│   ├── arrival/[routeNo]/ # 노선별 도착정보 페이지
│   ├── stop/[stopId]/     # 정류장별 도착정보 페이지
│   ├── route-search/      # 경로 검색 페이지
│   └── page.tsx          # 메인 페이지
├── components/            # React 컴포넌트
│   ├── BusArrivalBoard.tsx      # 노선별 전광판
│   ├── BusStopArrivalBoard.tsx  # 정류장별 전광판
│   ├── RouteSearchPage.tsx      # 경로 검색
│   └── SimpleBusSearch.tsx      # 메인 검색
├── types/                # TypeScript 타입 정의
└── utils/               # 유틸리티 함수
```

## 🌟 주요 페이지

### 메인 페이지 (`/`)
- 통합 버스 검색
- 인기 노선 바로가기
- 검색 기록 관리

### 노선별 도착정보 (`/arrival/[routeNo]`)
- 특정 노선의 전체 정류장 도착정보
- 실시간 업데이트 (30초 간격)
- 3가지 보기 모드 지원

### 정류장별 도착정보 (`/stop/[stopId]`)
- 특정 정류장의 모든 버스 도착정보
- 도착시간순 정렬
- 상세 버스 정보 제공

### 경로 검색 (`/route-search`)
- 출발지/도착지 기반 경로 찾기
- 환승 정보 포함
- 소요시간 및 요금 정보

## 🎨 UI/UX 특징

- **대구시 공식 디자인** 시스템 적용
- **모바일 친화적** 반응형 디자인
- **실제 전광판**과 동일한 UI
- **직관적인** 색상 코딩 (노선 타입별)
- **접근성** 고려된 폰트 크기 및 대비

## 📊 데이터 소스

- **대구광역시 공식 버스정보 API**
- 실시간 도착정보 제공
- 정류장 및 노선 정보 포함

## 🔧 환경 설정

### 환경 변수 (선택사항)
```env
NEXT_PUBLIC_API_BASE_URL=https://apis.data.go.kr/6270000/dbmsapi01
NEXT_PUBLIC_SERVICE_KEY=your_service_key_here
```

## 📱 지원 브라우저

- Chrome (권장)
- Firefox
- Safari
- Edge

## 📄 라이선스

MIT License

## 👥 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 Issue를 생성해주세요.

---

**🚌 대구 시민을 위한 편리한 버스 정보 서비스** 🌟
"# busda"  
