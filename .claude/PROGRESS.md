# AI Tools Hub 진행 상황

## 2026-05-23
- 프로젝트 초기 세팅 완료 (clone, npm install, .claude 폴더 구성)
- Cloudflare 이전 작업 진행
  - Next.js 16.1.6 → 16.2.6 업그레이드
  - @opennextjs/cloudflare 1.19.11, wrangler 4.94.0 설치
  - open-next.config.ts, wrangler.jsonc 생성
  - .github/workflows/deploy.yml (GitHub Actions) 생성
  - ⚠️ 로컬 Windows 빌드 불가 (한글 경로 + Turbopack 경로 검증 충돌)
  - ✅ GitHub Actions에서 Linux로 배포하는 방식으로 전환
  - 남은 작업: GitHub Secrets 설정, Cloudflare API 토큰 발급, ADMIN_PASSWORD secret 등록
