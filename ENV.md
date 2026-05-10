# 환경변수 목록

## Backend (Railway)

| 변수 | 예시 값 | 설명 |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://...neon.tech/pam?sslmode=require` | Neon DB 연결 URL |
| `DB_USERNAME` | `pam_owner` | DB 사용자명 |
| `DB_PASSWORD` | `...` | DB 비밀번호 |
| `REDIS_URL` | `rediss://...upstash.io:6379` | Upstash Redis URL |
| `REDIS_PASSWORD` | `...` | Redis 비밀번호 |
| `JWT_SECRET` | (32자 이상 랜덤 문자열) | JWT 서명 키 |
| `KAKAO_CLIENT_ID` | `...` | 카카오 앱 REST API 키 |
| `KAKAO_CLIENT_SECRET` | `...` | 카카오 앱 시크릿 |
| `GOOGLE_CLIENT_ID` | `....apps.googleusercontent.com` | Google OAuth2 클라이언트 ID |
| `GOOGLE_CLIENT_SECRET` | `...` | Google OAuth2 시크릿 |
| `R2_ENDPOINT` | `https://<accountid>.r2.cloudflarestorage.com` | R2 S3 호환 엔드포인트 |
| `R2_ACCESS_KEY_ID` | `...` | R2 액세스 키 |
| `R2_SECRET_ACCESS_KEY` | `...` | R2 시크릿 키 |
| `R2_BUCKET_NAME` | `pam-meme-sources` | R2 버킷 이름 |
| `OAUTH2_REDIRECT_URI` | `https://pick-a-me.me/oauth2/callback` | OAuth2 로그인 후 redirect URL |
| `COOKIE_SECURE` | `true` | prod에서 반드시 true |
| `CORS_ALLOWED_ORIGINS` | `https://pick-a-me.me,https://www.pick-a-me.me` | 허용할 프론트 origin (콤마 구분) |

## Frontend (Vercel)

| 변수 | 예시 값 | 설명 |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.pick-a-me.me` | 백엔드 API 기본 URL |

## 도메인 구성

| 용도 | 도메인 |
|---|---|
| 프론트엔드 | `pick-a-me.me` |
| 백엔드 API | `api.pick-a-me.me` |

> Railway에서 `api.pick-a-me.me` 커스텀 도메인 추가 후 DNS CNAME 레코드 설정 필요.
> Vercel에서 `pick-a-me.me` 도메인 추가 후 DNS A/CNAME 레코드 설정 필요.

## OAuth2 콜백 URL 등록

카카오 및 구글 개발자 콘솔에 아래 URL을 등록해야 합니다.

- 카카오: `https://api.pick-a-me.me/login/oauth2/code/kakao`
- 구글: `https://api.pick-a-me.me/login/oauth2/code/google`
