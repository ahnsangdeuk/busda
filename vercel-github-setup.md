# Vercel GitHub 자동 배포 설정

## 🔗 GitHub 저장소 연동

### 1. Vercel 대시보드에서 설정
1. https://vercel.com/dashboard 접속
2. 프로젝트 선택
3. Settings > Git 탭
4. "Connect Git Repository" 클릭
5. GitHub > `ahnsangdeuk/busda` 선택

### 2. 자동 배포 브랜치 설정
```
Production Branch: main
Preview Branch: develop (선택사항)
```

### 3. 빌드 설정
```
Framework Preset: Next.js
Build Command: npm run build:dev
Output Directory: .next
Install Command: npm install
```

### 4. 환경변수 복사
- GitHub Pages 배포에서 사용하던 환경변수들을 Vercel로 복사
- `NEXT_CONFIG=dev` 추가로 API 라우트 활성화

## 🚀 배포 워크플로우

### 자동 배포 트리거
- `main` 브랜치에 push → Production 배포
- PR 생성 → Preview 배포
- GitHub Actions 필요 없음 (Vercel이 자동 처리)

### 수동 배포
```bash
# 로컬에서 직접 배포
vercel --prod

# 특정 브랜치 배포
git checkout main
git push origin main  # 자동 배포 트리거
```

## 🌐 배포 완료 후

1. **Production URL**: `https://busda-[random].vercel.app`
2. **Custom Domain** 설정 가능 (예: `busda.vercel.app`)
3. **HTTPS 자동 적용**
4. **글로벌 CDN** 적용

## ✅ 장점

- ✅ **API Routes 완전 지원**
- ✅ **실시간 대구시 API 연동**
- ✅ **CORS 문제 해결**
- ✅ **자동 배포**
- ✅ **무료 플랜 충분**
- ✅ **빠른 로딩 속도** 