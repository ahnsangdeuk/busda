# Vercel 환경변수 설정 가이드

## 📋 설정할 환경변수

Vercel 대시보드 > 프로젝트 > Settings > Environment Variables에서 다음을 추가:

### 1. 개발 환경 활성화
```
Name: NEXT_CONFIG
Value: dev
Environment: Production, Preview, Development
```

### 2. API 기본 URL
```
Name: NEXT_PUBLIC_API_BASE_URL  
Value: https://apis.data.go.kr/6270000/dbmsapi01
Environment: Production, Preview, Development
```

### 3. 서비스 키
```
Name: NEXT_PUBLIC_SERVICE_KEY
Value: Poc6rnzr84pjw40%2B%2FXOt70%2BNL37qgNMjsHeh1V%2FxVwVU3ioy%2FBeGDnz1TOjcbwCDnnGPT4Sbn%2FGVsshKDZ8F0Q%3D%3D
Environment: Production, Preview, Development
```

## 🔧 설정 후 재배포

환경변수 설정 후 다음 명령어로 재배포:

```bash
vercel --prod
```

또는 Vercel 대시보드에서 "Redeploy" 버튼 클릭

## 🌐 배포 완료 후 확인사항

- [ ] 홈페이지 정상 로드
- [ ] 정류장 검색 기능
- [ ] 실시간 도착정보 API 호출
- [ ] 위치 기반 검색
- [ ] PWA 설치 가능

## 🎯 예상 배포 주소

- Production: `https://busda-[random].vercel.app`
- 또는 커스텀 도메인 설정 가능 