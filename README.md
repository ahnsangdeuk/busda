# 🚌 대구 버스다 (Busda)

대구광역시 실시간 버스 정보 시스템

## 🌐 배포된 사이트

**➡️ [https://ahnsangdeuk.github.io/busda](https://ahnsangdeuk.github.io/busda)**

## 🚀 배포 방법

### GitHub Pages 자동 배포
- `main` 브랜치에 푸시하면 자동으로 GitHub Actions를 통해 배포됩니다
- 배포 상태: https://github.com/ahnsangdeuk/busda/actions

## 💻 개발 환경

### 설치
```bash
npm install
```

### 개발 서버 실행
```bash
# 정적 버전 (GitHub Pages와 동일)
npm run dev

# API 라우트 포함 버전 (실시간 데이터)
npm run dev:api
```

### 빌드
```bash
# 배포용 빌드 (정적 export)
npm run build

# 개발용 빌드 (API 라우트 포함)
npm run build:dev
```

## 🔧 주요 기능

- ✅ **정류소 검색**: 대구시 25,000+ 정류소 검색
- ✅ **실시간 도착정보**: 버스 도착 예정 시간
- ✅ **노선 검색**: 출발지-도착지 경로 검색
- ✅ **전광판 모드**: 정류소/노선별 전광판 화면
- ✅ **PWA 지원**: 앱처럼 설치 가능
- ✅ **반응형 디자인**: 모바일/데스크톱 최적화

## 📱 기술 스택

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS v4
- **Deployment**: GitHub Pages, GitHub Actions
- **API**: 대구시 공식 버스정보 API

## 🗂️ 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 메인 페이지
│   ├── search/            # 정류소 검색
│   ├── route-search/      # 노선 검색
│   ├── arrival/[routeNo]/ # 노선별 도착정보
│   └── stop/[stopId]/     # 정류소별 도착정보
├── components/            # React 컴포넌트
└── utils/                # 유틸리티 함수
```

## 📄 라이선스

MIT License

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

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 Issue를 생성해주세요.

---

**🚌 대구 시민을 위한 편리한 버스 정보 서비스** 🌟
"# busda"  
